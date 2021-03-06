package auth

import (
	"emperor-ng/utils"
	"net/http"
	"sync"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nats-io/nuid"
	"github.com/rif/cache2go"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

const (
	CookieSession = "session"
	CookieSecret  = "jiihie8Aeleechoo4day5nohl8eex2iezaengiXiecaic4ei8daD6yoo6keeWusu"
	GroupAdmins   = "admins"
	GroupUsers    = "users"
)

type Manager struct {
	cache *cache2go.Cache
	db    *storm.DB
	sync.RWMutex
}

type Session struct {
	Key   string `storm:"id"` // nothing to do with Key below
	Email string
	Group string
}

func NewManager(db *storm.DB) (*Manager, error) {
	am := &Manager{
		db:    db,
		cache: cache2go.New(1000, 60*time.Minute),
	}
	if err := am.initAuth(); err != nil {
		return nil, err
	}

	return am, nil
}

func (am *Manager) GetKeyAuth(c echo.Context) string {
	authScheme := "Bearer"
	auth := c.Request().Header.Get(echo.HeaderAuthorization)
	if auth != "" {
		l := len(authScheme)
		if len(auth) > l+1 && auth[:l] == authScheme {
			return am.EmailForKey(auth[l+1:])
		}
	}
	return ""
}

func (am *Manager) initAuth() error {
	var users []User

	if err := am.db.All(&users); err == storm.ErrNotFound || len(users) == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("testus"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		if err := am.db.Save(&User{
			ID:           nuid.Next(),
			Email:        "admin@mailinator.com",
			Password:     string(hash),
			DefaultGroup: GroupAdmins,
			CreatedBy:    "system",
			CreatedAt:    time.Now(),
			ModifiedBy:   "system",
			ModifiedAt:   time.Now(),
		}); err != nil {
			return err
		}
	}

	var groups []Group
	if err := am.db.All(&groups); err == storm.ErrNotFound || len(users) == 0 {
		if err := am.db.Save(&Group{
			ID:      nuid.Next(),
			Name:    GroupAdmins,
			Primary: true,
		}); err != nil {
			return err
		}
		if err := am.db.Save(&Group{
			ID:      nuid.Next(),
			Name:    GroupUsers,
			Primary: true,
		}); err != nil {
			return err
		}
	}
	return nil
}

func (am *Manager) EmailForKey(uuid string) string {
	am.RLock()
	defer am.RUnlock()
	if email, ok := am.cache.Get(uuid); ok {
		return email.(string)
	}
	var k Key
	if err := am.db.One("Value", uuid, &k); err != nil {
		return ""
	}
	if k.Email != "" {
		am.cache.Set(k.Value, k.Email)
	}
	return k.Email
}

func (am *Manager) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// check key first
		if email := am.GetKeyAuth(c); email != "" {
			c.Set("email", email)
			return next(c)
		}
		cookie, err := c.Cookie(CookieSession)
		if err != nil || cookie == nil {
			return c.Redirect(http.StatusFound, "/login")
		}
		s := Session{}
		if err := am.db.One("Key", cookie.Value, &s); err != nil {
			return c.Redirect(http.StatusFound, "/login")
		}
		c.Set("email", s.Email)
		c.Set("group", s.Group)
		return next(c)
	}
}

func (am *Manager) AdminMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		group, ok := c.Get("group").(string)
		if !ok || group != GroupAdmins {
			log.Warn().Interface("email", c.Get("email")).Interface("group", c.Get("group")).Msg("admin access")
			return c.NoContent(http.StatusForbidden)
		}
		return next(c)
	}
}

func (am *Manager) LoginHandler(c echo.Context) error {
	cookie, err := c.Cookie(CookieSession)
	if err == nil && cookie != nil {
		s := Session{}
		if err := am.db.One("Key", cookie.Value, &s); err == nil {
			return c.Redirect(http.StatusFound, "/")
		}
	}
	return c.Render(http.StatusOK, "login", map[string]interface{}{
		"CSRF": c.Get(middleware.DefaultCSRFConfig.ContextKey),
	})
}

func (am *Manager) LoginPostHandler(c echo.Context) error {
	credentials := struct {
		Email string `json:"email"`
		Pass  string `json:"pass"`
	}{}
	if err := c.Bind(&credentials); err != nil {
		return err
	}
	u := User{}
	if err := am.db.One("Email", credentials.Email, &u); err != nil {
		return c.String(http.StatusForbidden, "tryagain")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(credentials.Pass)); err != nil {
		return c.String(http.StatusForbidden, "tryagain")
	}

	cookie := utils.Sha1(CookieSecret, credentials.Email, credentials.Pass)

	c.SetCookie(&http.Cookie{
		Path:    "/",
		Name:    CookieSession,
		Value:   cookie,
		Expires: time.Now().Add(24 * 365 * 5 * time.Hour),
	})
	am.db.Save(&Session{
		Key:   cookie,
		Email: credentials.Email,
		Group: u.DefaultGroup,
	})
	return c.String(http.StatusOK, "OK")
}

func (am *Manager) LogoutHandler(c echo.Context) error {
	cookie, err := c.Cookie(CookieSession)
	if err != nil || cookie == nil {
		return c.Redirect(http.StatusFound, "/login")
	}
	if err := am.db.DeleteStruct(&Session{Key: cookie.Value}); err != nil {
		return err
	}
	c.SetCookie(&http.Cookie{
		Path:    "/",
		Name:    CookieSession,
		Value:   "logout",
		Expires: time.Unix(0, 0),
	})

	return c.Redirect(http.StatusFound, "/login")
}
