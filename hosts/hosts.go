package hosts

import (
	"net/http"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
	"github.com/rs/zerolog/log"
)

type Host struct {
	ID          string    `storm:"id" json:"id"`
	Name        string    `storm:"index" json:"name"`
	Address     string    `storm:"unique" json:"address"`
	Port        string    `json:"port"`
	Description string    `storm:"index" json:"description"`
	CreatedAt   time.Time `storm:"index" json:"createdAt"`
	CreatedBy   string    `storm:"index" json:"createdBy"`
	ModifiedAt  time.Time `storm:"index" json:"modifiedAt"`
	ModifiedBy  string    `storm:"index" json:"modifiedBy"`
}

type Hosts struct {
	db *storm.DB
}

func NewHosts(db *storm.DB) *Hosts {
	return &Hosts{db: db}
}

func (cs *Hosts) GetHandler(c echo.Context) error {
	var hosts []Host
	if err := cs.db.All(&hosts); err != nil {
		return err
	}

	response := map[string]interface{}{
		"items": hosts,
	}
	return c.JSON(http.StatusOK, response)
}

func (cs *Hosts) PostHandler(c echo.Context) error {
	host := new(Host)
	if err := c.Bind(host); err != nil {
		return err
	}
	if host.ID == "" {
		host.ID = nuid.Next()
		host.CreatedBy = c.Get("email").(string)
		host.CreatedAt = time.Now()
		host.ModifiedBy = c.Get("email").(string)
		host.ModifiedAt = time.Now()
	} else {
		host.ModifiedBy = c.Get("email").(string)
		host.ModifiedAt = time.Now()
	}
	if err := cs.db.Save(host); err != nil {
		return err
	}
	log.Info().Str("address", host.Address).Str("port", host.Port).Str("description", host.Description).Str("name", host.Name).Interface("admin", c.Get("email")).Msg("created new host")
	return c.String(http.StatusOK, host.ID)
}

func (cs *Hosts) DeleteHandler(c echo.Context) error {
	host := new(Host)
	if err := c.Bind(host); err != nil {
		return err
	}
	if err := cs.db.DeleteStruct(host); err != nil {
		return err
	}
	// remove user hosts
	if err := cs.db.Select(q.Eq("HostID", host.ID)).Delete(new(HostGroup)); err != nil && err != storm.ErrNotFound {
		return err
	}
	log.Info().Str("address", host.Address).Str("port", host.Port).Str("description", host.Description).Str("name", host.Name).Interface("admin", c.Get("email")).Msg("deleted host")
	return c.NoContent(http.StatusOK)
}
