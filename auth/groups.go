package auth

import (
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
)

type Group struct {
	ID      string `storm:"id" json:"id"` // primary key
	Name    string `storm:"index" json:"name"`
	Primary bool   `storm:"index" json:"primary"`
}

type UserGroup struct {
	ID      string `storm:"id" json:"id"` // primary key
	UserID  string `storm:"index" json:"userId"`
	GroupID string `storm:"index" json:"groupId"`
}

type Groups struct {
	db *storm.DB
}

func NewGroups(db *storm.DB) *Groups {
	return &Groups{db: db}
}

func (gs *Groups) GetHandler(c echo.Context) error {
	var groups []*Group
	if err := gs.db.All(&groups); err != nil {
		return err
	}

	response := map[string]interface{}{
		"items": groups,
	}
	return c.JSON(http.StatusOK, response)
}

func (gs *Groups) PostHandler(c echo.Context) error {
	g := new(Group)
	if err := c.Bind(g); err != nil {
		return err
	}
	if g.ID == "" {
		g.ID = nuid.Next()
	}
	if err := gs.db.Save(g); err != nil {
		return err
	}
	return c.String(http.StatusOK, g.ID)
}

func (gs *Groups) DeleteHandler(c echo.Context) error {
	g := new(Group)
	if err := c.Bind(g); err != nil {
		return err
	}
	if err := gs.db.DeleteStruct(g); err != nil {
		return err
	}
	// remove user bindings
	if err := gs.db.Select(q.Eq("GroupID", g.ID)).Delete(new(UserGroup)); err != nil && err != storm.ErrNotFound {
		return err
	}

	return c.NoContent(http.StatusOK)
}
