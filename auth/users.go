package auth

import (
	"net/http"
	"strings"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID        int    `storm:"id,increment" json:"id"` // primary key
	Group     string `storm:"index" json:"group"`
	Email     string `storm:"unique" json:"email"`
	Phone     string `storm:"index" json:"phone"`
	FirstName string `storm:"index" json:"firstName"`
	LastName  string `storm:"index" json:"lastName"`
	Password  string `json:"password"`
}

type Users struct {
	db *storm.DB
}

func NewUsers(db *storm.DB) *Users {
	return &Users{db: db}
}

func (us *Users) GetHandler(c echo.Context) error {
	var users []*User
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
		if u.ID != 0 {
			oldUser := &User{}
			if err := us.db.One("ID", u.ID, oldUser); err == nil {
				u.Password = oldUser.Password
			}
		}
	}
	if err := us.db.Save(u); err != nil {
		return err
	}
	return c.NoContent(http.StatusOK)
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
	if err := us.db.Select(q.Eq("Email", u.Email)).Delete(new(Key)); err != nil {
		return err
	}

	return c.NoContent(http.StatusOK)
}
