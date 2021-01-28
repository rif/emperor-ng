package main

import (
	"emperor-ng/engine"
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

	auth, err := engine.NewAuthManager(db)
	if err != nil {
		log.Fatal().Err(err).Msg("cannot init auth")
	}

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
			if c.Request().URL.Path == "/server/payment" ||
				c.Request().URL.Path == "/server/newshipment" ||
				c.Request().URL.Path == "/server/neworder" ||
				c.Request().URL.Path == "/server/newecomorder" ||
				c.Request().URL.Path == "/server/shopifyorder" ||
				c.Request().URL.Path == "/server/shopifyproduct" {
				return true
			}
			if email := auth.GetKeyAuth(c); email != "" {
				return true
			}
			return false
		},
		TokenLookup: "query:csrf",
		CookiePath:  "/",
	}))
	e.GET("/client", func(c echo.Context) error {
		return c.Render(http.StatusOK, "index", map[string]interface{}{
			"User": c.Get("email"),
			"CSRF": c.Get(middleware.DefaultCSRFConfig.ContextKey),
		})
	})

	// login
	e.GET("/login", auth.LoginHandler)
	e.POST("/login", auth.LoginPostHandler)
	e.GET("/logout", auth.LogoutHandler)

	l := e.Group("")
	l.Use(auth.AuthMiddleware)

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
	a.Use(auth.AdminMiddleware)

	// users
	a.GET("/users", auth.UsersHandler)
	a.POST("/user", auth.UserPostHandler)
	a.DELETE("/user", auth.UserDeleteHandler)

	// influencers
	a.GET("/influencers", auth.InfluencersHandler)

	// keys
	a.GET("/keys", auth.KeysHandler)
	a.POST("/key", auth.KeyPostHandler)
	a.DELETE("/key", auth.KeyDeleteHandler)

	e.Static("/favicon.ico", "web/favicon.ico")
	e.Static("/static/js", "client/build/static/js")
	e.Static("/static/css", "client/build/static/css")
	e.Static("/static/adminjs", "admin/build/static/js")
	e.Static("/static/admincss", "admin/build/static/css")
	e.Static("/static/loginjs", "login/build/static/js")
	e.Static("/static/logincss", "login/build/static/css")

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

	log.Fatal().Err(e.Start(*port)).Msg("could not start web server")
}
