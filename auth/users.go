package auth

import (
	"net/http"
	"strings"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID           string `storm:"id,increment" json:"id"` // primary key
	DefaultGroup string `storm:"index" json:"defaultGroup"`
	Email        string `storm:"unique" json:"email"`
	Phone        string `storm:"index" json:"phone"`
	FirstName    string `storm:"index" json:"firstName"`
	LastName     string `storm:"index" json:"lastName"`
	Password     string `json:"password"`
}

type Users struct {
	db *storm.DB
}

func NewUsers(db *storm.DB) *Users {
	return &Users{db: db}
}

func (us *Users) GetHandler(c echo.Context) error {
	users := make([]User, 0)
	if err := us.db.All(&users); err != nil {
		return err
	}

	for _, user := range users {
		user.Password = ""
	}
	response := map[string]interface{}{
		"items": users,
	}

	return c.JSON(http.StatusOK, response)
}

func (us *Users) PostHandler(c echo.Context) error {
	u := new(User)
	if err := c.Bind(u); err != nil {
		return err
	}
	if strings.TrimSpace(u.Password) != "" {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hash)
	} else {
		// get previous password
		if u.ID != "" {
			oldUser := &User{}
			if err := us.db.One("ID", u.ID, oldUser); err == nil {
				u.Password = oldUser.Password
			}
		}
	}
	if u.ID == "" {
		u.ID = nuid.Next()
	}
	if err := us.db.Save(u); err != nil {
		return err
	}
	log.Info().Str("user", u.Email).Interface("admin", c.Get("email")).Msg("created new user")
	return c.String(http.StatusOK, u.ID)
}

func (us *Users) DeleteHandler(c echo.Context) error {
	u := new(User)
	if err := c.Bind(u); err != nil {
		return err
	}
	if err := us.db.DeleteStruct(u); err != nil {
		return err
	}
	// delete associated keys
	if err := us.db.Select(q.Eq("ID", u.ID)).Delete(new(Key)); err != nil && err != storm.ErrNotFound {
		return err
	}
	log.Info().Str("user", u.Email).Interface("admin", c.Get("email")).Msg("deleted user")
	return c.NoContent(http.StatusOK)
}

func (us *Users) ToggleAdminHandler(c echo.Context) error {
	userID := c.Param("user")
	u := new(User)
	if err := us.db.One("ID", userID, u); err != nil {
		return err
	}
	var newGroup string
	if u.DefaultGroup == GroupUsers {
		newGroup = GroupAdmins
	} else {
		newGroup = GroupUsers
	}
	if err := us.db.UpdateField(u, "DefaultGroup", newGroup); err != nil {
		return err
	}
	log.Info().Str("user", u.Email).Str("group", u.DefaultGroup).Interface("admin", c.Get("email")).Msg("toggled admin user")
	return c.String(http.StatusOK, newGroup)
}
