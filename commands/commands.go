package commands

import (
	"emperor-ng/auth"
	"emperor-ng/utils"
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
	var commands []Command
	if err := cs.db.All(&commands); err != nil {
		return err
	}

	response := map[string]interface{}{
		"items": commands,
	}
	return c.JSON(http.StatusOK, response)
}

func (cs *Commands) AvailableHandler(c echo.Context) error {
	email := c.Get("email")
	group := c.Get("group")
	commands := make([]Command, 0)
	if err := cs.db.All(&commands); err != nil && err != storm.ErrNotFound {
		return err
	}
	if group == auth.GroupAdmins {
		response := map[string]interface{}{
			"items": commands,
		}
		return c.JSON(http.StatusOK, response)
	}

	// get logged in user
	var user auth.User
	if err := cs.db.Find("Email", email, &user); err != nil {
		return err
	}

	// get user extra groups
	var userGroups []auth.UserGroup
	if err := cs.db.Find("UserID", user.ID, &userGroups); err != nil && err != storm.ErrNotFound {
		return err
	}
	var userGroupsString []string
	for _, ug := range userGroups {
		userGroupsString = append(userGroupsString, ug.GroupID)
	}

	availableCommands := make([]Command, 0)
	for _, cmd := range commands {
		// get command groups
		var commandGroups []CommandGroup
		if err := cs.db.Find("CommandID", cmd.ID, &commandGroups); err != nil && err != storm.ErrNotFound {
			return err
		}
		var commandGroupsString []string
		for _, cg := range commandGroups {
			commandGroupsString = append(commandGroupsString, cg.GroupID)
		}

		if len(commandGroups) == 0 || utils.ContainsAny(commandGroupsString, userGroupsString...) {
			availableCommands = append(availableCommands, cmd)
		}
	}

	response := map[string]interface{}{
		"items": availableCommands,
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
