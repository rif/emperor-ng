package main

import (
	"emperor-ng/auth"
	"emperor-ng/commands"
	"errors"
	"flag"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"

	_ "net/http/pprof"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var (
	port    = flag.String("listen", ":9090", "Listening address")
	debug   = flag.Bool("debug", false, "Print debug messages")
	pretty  = flag.Bool("pretty", false, "Pretty debug format")
	ver     = flag.Bool("version", false, "Print version and exit")
	version = "development"
)

type templ struct {
	templates map[string]*template.Template
}

func (t *templ) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	tmpl, ok := t.templates[name]
	if !ok {
		return errors.New("template: name not found ->" + name)
	}
	return tmpl.ExecuteTemplate(w, name, data) // layout -> defined in each layout template
}

func main() {
	flag.Parse()

	zerolog.SetGlobalLevel(zerolog.InfoLevel)

	if *debug {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	if *pretty {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	}

	if *ver {
		fmt.Println("fashion " + version)
		os.Exit(0)
	}
	db, err := storm.Open("data.db")
	if err != nil {
		log.Fatal().Err(err).Msg("cannot init database")
	}
	defer db.Close()

	authManager, err := auth.NewManager(db)
	if err != nil {
		log.Fatal().Err(err).Msg("cannot init auth")
	}

	keys := auth.NewKeys(db)
	users := auth.NewUsers(db)
	groups := auth.NewGroups(db)
	ug := auth.NewUserGroups(db)
	cmds := commands.NewCommands(db)
	cg := commands.NewCommandGroups(db)

	t := &templ{
		templates: make(map[string]*template.Template),
	}
	t.templates["index"] = template.Must(template.New("index").Delims("[[", "]]").ParseFiles("client/build/index.html"))
	t.templates["admin"] = template.Must(template.New("admin").Delims("[[", "]]").ParseFiles("admin/build/index.html"))
	t.templates["login"] = template.Must(template.New("login").Delims("[[", "]]").ParseFiles("login/build/index.html"))
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Renderer = t

	e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		Skipper: func(c echo.Context) bool {
			if c.Request().URL.Path == "/server/payment" {
				return true
			}
			if email := authManager.GetKeyAuth(c); email != "" {
				return true
			}
			return false
		},
		TokenLookup: "query:csrf",
		CookiePath:  "/",
	}))

	// login
	e.GET("/login", authManager.LoginHandler)
	e.POST("/login", authManager.LoginPostHandler)
	e.GET("/logout", authManager.LogoutHandler)

	l := e.Group("")
	l.Use(authManager.AuthMiddleware)

	l.GET("/admin", func(c echo.Context) error {
		return c.Render(http.StatusOK, "admin", map[string]interface{}{
			"User":    c.Get("email"),
			"Group":   c.Get("group"),
			"Code":    c.Get("code"),
			"CSRF":    c.Get(middleware.DefaultCSRFConfig.ContextKey),
			"Version": version,
		})
	})
	a := l.Group("/adm")
	a.Use(authManager.AdminMiddleware)

	// users
	a.GET("/users", users.GetHandler)
	a.POST("/user", users.PostHandler)
	a.DELETE("/user", users.DeleteHandler)
	a.PUT("/toggleadmin/:user", users.ToggleAdminHandler)

	// groups
	a.GET("/groups", groups.GetHandler)
	a.POST("/group", groups.PostHandler)
	a.DELETE("/group", groups.DeleteHandler)

	// usergroups
	a.GET("/usergroups/:user", ug.GetHandler)
	a.POST("/usergroup/:user", ug.PostHandler)

	// commands
	a.GET("/commands", cmds.GetHandler)
	a.POST("/command", cmds.PostHandler)
	a.DELETE("/command", cmds.DeleteHandler)

	// commandsgroups
	a.GET("/commandgroups/:command", cg.GetHandler)
	a.POST("/commandgroup/:command", cg.PostHandler)

	// keys
	a.GET("/keys", keys.GetHandler)
	a.POST("/key", keys.PostHandler)
	a.DELETE("/key", keys.DeleteHandler)

	dbg := e.Group("/debug")
	dbg.GET("/pprof/*", func(c echo.Context) error {
		w := c.Response()
		r := c.Request()
		if h, p := http.DefaultServeMux.Handler(r); p != "" {
			h.ServeHTTP(w, r)
			return nil
		}
		return echo.NewHTTPError(http.StatusNotFound)
	})

	e.File("/favicon.ico", "web/favicon.ico")
	e.File("/manifest.json", "web/manifest.json")
	e.File("/robots.txt", "web/robots.txt")
	e.File("/logo192.png", "web/logo192.png")
	e.File("/logo512.png", "web/logo512.png")
	e.Static("/static/js", "client/build/static/js")
	e.Static("/static/css", "client/build/static/css")
	e.Static("/static/adminjs", "admin/build/static/js")
	e.Static("/static/admincss", "admin/build/static/css")
	e.Static("/static/loginjs", "login/build/static/js")
	e.Static("/static/logincss", "login/build/static/css")

	l.GET("/", func(c echo.Context) error {
		log.Info().Msg("INDEX")
		return c.Render(http.StatusOK, "index", map[string]interface{}{
			"User": c.Get("email"),
			"CSRF": c.Get(middleware.DefaultCSRFConfig.ContextKey),
		})
	})

	log.Fatal().Err(e.Start(*port)).Msg("could not start web server")
}
