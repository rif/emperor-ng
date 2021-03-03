package commands

import (
	"fmt"
	"net/http"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
	"github.com/rs/zerolog/log"
)

type Command struct {
	ID          string    `storm:"id" json:"id"`
	Cmd         string    `json:"cmd"`
	Params      string    `json:"params"`
	Description string    `storm:"index" json:"description"`
	Danger      int       `json:"danger"`
	CreatedAt   time.Time `storm:"index" json:"createdAt"`
	CreatedBy   string    `storm:"index" json:"createdBy"`
	ModifiedAt  time.Time `storm:"index" json:"modifiedAt"`
	ModifiedBy  string    `storm:"index" json:"modifiedBy"`
}

func (c *Command) Execute() (string, error) {
	log.Info().Str("execute", fmt.Sprintf(c.Cmd, c.Params)).Send()
	return "", nil
}

type Commands struct {
	db *storm.DB
}

func NewCommands(db *storm.DB) *Commands {
	return &Commands{db: db}
}

func (cs *Commands) GetHandler(c echo.Context) error {
	commands := make([]Command, 0)
	if err := cs.db.AllByIndex("CreatedAt", &commands); err != nil && err != storm.ErrNotFound {
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
		cmd.CreatedBy = c.Get("email").(string)
		cmd.CreatedAt = time.Now()
		cmd.ModifiedBy = c.Get("email").(string)
		cmd.ModifiedAt = time.Now()
	} else {
		cmd.ModifiedBy = c.Get("email").(string)
		cmd.ModifiedAt = time.Now()
	}
	if err := cs.db.Save(cmd); err != nil {
		return err
	}
	log.Info().Str("cmd", cmd.Cmd).Interface("admin", c.Get("email")).Msg("created new command")
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
	log.Info().Str("cmd", cmd.Cmd).Interface("admin", c.Get("email")).Msg("deleted command")
	return c.NoContent(http.StatusOK)
}
