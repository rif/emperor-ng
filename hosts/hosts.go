package hosts

import (
	"emperor-ng/auth"
	"emperor-ng/utils"
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
)

type Host struct {
	ID      string `storm:"id" json:"id"`
	Name    string `storm:"index" json:"name"`
	Address string `storm:"unique" json:"address"`
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

func (cs *Hosts) AvailableHandler(c echo.Context) error {
	email := c.Get("email")
	group := c.Get("group")
	hosts := make([]Host, 0)
	if err := cs.db.All(&hosts); err != nil && err != storm.ErrNotFound {
		return err
	}
	if group == auth.GroupAdmins {
		response := map[string]interface{}{
			"items": hosts,
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

	availableHosts := make([]Host, 0)
	for _, cmd := range hosts {
		// get host groups
		var hostGroups []HostGroup
		if err := cs.db.Find("HostID", cmd.ID, &hostGroups); err != nil && err != storm.ErrNotFound {
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
		"items": availableHosts,
	}
	return c.JSON(http.StatusOK, response)
}

func (cs *Hosts) PostHandler(c echo.Context) error {
	cmd := new(Host)
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

func (cs *Hosts) DeleteHandler(c echo.Context) error {
	cmd := new(Host)
	if err := c.Bind(cmd); err != nil {
		return err
	}
	if err := cs.db.DeleteStruct(cmd); err != nil {
		return err
	}
	// remove user hosts
	if err := cs.db.Select(q.Eq("HostID", cmd.ID)).Delete(new(HostGroup)); err != nil && err != storm.ErrNotFound {
		return err
	}

	return c.NoContent(http.StatusOK)
}
