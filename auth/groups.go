package auth

import (
	"net/http"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
	"github.com/rs/zerolog/log"
)

type Group struct {
	ID         string    `storm:"id" json:"id"` // primary key
	Name       string    `storm:"index" json:"name"`
	Primary    bool      `storm:"index" json:"primary"`
	CreatedAt  time.Time `storm:"index" json:"createdAt"`
	CreatedBy  string    `storm:"index" json:"createdBy"`
	ModifiedAt time.Time `storm:"index" json:"modifiedAt"`
	ModifiedBy string    `storm:"index" json:"modifiedBy"`
}

type Groups struct {
	db *storm.DB
}

func NewGroups(db *storm.DB) *Groups {
	return &Groups{db: db}
}

func (gs *Groups) GetHandler(c echo.Context) error {
	groups := make([]Group, 0)
	if err := gs.db.AllByIndex("CreatedAt", &groups); err != nil {
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
		g.Primary = false
		g.CreatedBy = c.Get("email").(string)
		g.CreatedAt = time.Now()
		g.ModifiedBy = c.Get("email").(string)
		g.ModifiedAt = time.Now()
	} else {
		g.ModifiedBy = c.Get("email").(string)
		g.ModifiedAt = time.Now()
	}
	if err := gs.db.Save(g); err != nil {
		return err
	}
	log.Info().Str("group", g.Name).Interface("admin", c.Get("email")).Msg("created new group")
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
	// remove user groups
	if err := gs.db.Select(q.Eq("GroupID", g.ID)).Delete(new(UserGroup)); err != nil && err != storm.ErrNotFound {
		return err
	}
	log.Info().Str("group", g.Name).Interface("admin", c.Get("email")).Msg("deleted group")
	return c.NoContent(http.StatusOK)
}
