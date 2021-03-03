package engine

import (
	"emperor-ng/auth"
	"emperor-ng/commands"
	"emperor-ng/hosts"
	"emperor-ng/utils"
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

type Client struct {
	db *storm.DB
}

func NewClient(db *storm.DB) *Client {
	return &Client{db: db}
}

func (cl *Client) AvailableDataHandler(c echo.Context) error {
	email := c.Get("email")
	group := c.Get("group")
	allCommands := make([]commands.Command, 0)
	if err := cl.db.All(&allCommands); err != nil && err != storm.ErrNotFound {
		return err
	}
	allHosts := make([]hosts.Host, 0)
	if err := cl.db.All(&allHosts); err != nil && err != storm.ErrNotFound {
		return err
	}
	if group == auth.GroupAdmins {
		log.Info().Interface("hosts", allHosts).Send()
		response := map[string]interface{}{
			"commands": allCommands,
			"hosts":    allHosts,
		}
		return c.JSON(http.StatusOK, response)
	}

	// get logged in user
	var user auth.User
	if err := cl.db.Find("Email", email, &user); err != nil {
		return err
	}

	// get user extra groups
	var userGroups []auth.UserGroup
	if err := cl.db.Find("UserID", user.ID, &userGroups); err != nil && err != storm.ErrNotFound {
		return err
	}
	var userGroupsString []string
	for _, ug := range userGroups {
		userGroupsString = append(userGroupsString, ug.GroupID)
	}

	availableCommands := make([]commands.Command, 0)
	for _, cmd := range allCommands {
		// get command groups
		var commandGroups []commands.CommandGroup
		if err := cl.db.Find("CommandID", cmd.ID, &commandGroups); err != nil && err != storm.ErrNotFound {
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

	availableHosts := make([]hosts.Host, 0)
	for _, cmd := range allHosts {
		// get host groups
		var hostGroups []hosts.HostGroup
		if err := cl.db.Find("HostID", cmd.ID, &hostGroups); err != nil && err != storm.ErrNotFound {
			return err
		}
		var hostGroupsString []string
		for _, cg := range hostGroups {
			hostGroupsString = append(hostGroupsString, cg.GroupID)
		}

		if len(hostGroups) == 0 || utils.ContainsAny(hostGroupsString, userGroupsString...) {
			availableHosts = append(availableHosts, cmd)
		}
	}

	response := map[string]interface{}{
		"commands": availableCommands,
		"hosts":    availableHosts,
	}
	return c.JSON(http.StatusOK, response)
}

func (cl *Client) ExecuteHandler(c echo.Context) error {
	er := struct {
		HostID    string `json:"hostID"`
		CommandID string `json:"commandID"`
		Params    string `json:"params"`
		Watch     bool   `json:"watch"`
	}{}
	if err := c.Bind(&er); err != nil {
		return err
	}
	log.Info().Interface("execReq", er).Send()
	return c.NoContent(http.StatusOK)
}
