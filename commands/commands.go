package commands

import (
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
)

type Command struct {
	ID          string `storm:"id" json:"id"`
	Cmd         string `json:"cmd"`
	Description string `storm:"index" json:"description"`
	Danger      bool   `json:"danger"`
}

type Commands struct {
	db *storm.DB
}

func NewCommands(db *storm.DB) *Commands {
	return &Commands{db: db}
}

func (cs *Commands) GetHandler(c echo.Context) error {
	var commands []*Command
	if err := cs.db.All(&commands); err != nil {
		return err
	}

	response := map[string]interface{}{
		"items": commands,
	}
	return c.JSON(http.StatusOK, response)
}

func (cs *Commands) PostHandler(c echo.Context) error {
	cmd := new(Command)
	if err := c.Bind(cmd); err != nil {
		return err
	}
	if cmd.ID == "" {
		cmd.ID = nuid.Next()
	}
	if err := cs.db.Save(cmd); err != nil {
		return err
	}
	return c.String(http.StatusOK, cmd.ID)
}

func (cs *Commands) DeleteHandler(c echo.Context) error {
	cmd := new(Command)
	if err := c.Bind(cmd); err != nil {
		return err
	}
	if err := cs.db.DeleteStruct(cmd); err != nil {
		return err
	}
	// remove user commands
	if err := cs.db.Select(q.Eq("CommandID", cmd.ID)).Delete(new(CommandGroup)); err != nil && err != storm.ErrNotFound {
		return err
	}

	return c.NoContent(http.StatusOK)
}
