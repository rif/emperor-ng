package commands

import (
	"emperor-ng/auth"
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
	"github.com/rs/zerolog/log"
)

type CommandGroup struct {
	ID        string `storm:"id" json:"id"` // primary key
	CommandID string `storm:"index" json:"commandId"`
	GroupID   string `storm:"index" json:"groupId"`
}

type CommandGroups struct {
	db *storm.DB
}

func NewCommandGroups(db *storm.DB) *CommandGroups {
	return &CommandGroups{db: db}
}

func (cgs *CommandGroups) GetHandler(c echo.Context) error {
	commandID := c.Param("command")
	var ugList []CommandGroup
	if err := cgs.db.Find("CommandID", commandID, &ugList); err != nil && err != storm.ErrNotFound {
		return err
	}
	groupIDs := make([]string, 0)
	for _, ug := range ugList {
		groupIDs = append(groupIDs, ug.GroupID)
	}

	groups := make([]auth.Group, 0)
	// For some reason it does not work to use Find("Primary", false, &groups)
	if err := cgs.db.All(&groups); err != nil && err != storm.ErrNotFound {
		return err
	}
	groupsNoPrimary := make([]auth.Group, 0)
	for _, g := range groups {
		if !g.Primary {
			groupsNoPrimary = append(groupsNoPrimary, g)
		}
	}

	response := map[string]interface{}{
		"items":  groupIDs,
		"groups": groupsNoPrimary,
	}
	return c.JSON(http.StatusOK, response)
}

func (cgs *CommandGroups) PostHandler(c echo.Context) error {
	commandID := c.Param("command")
	data := struct {
		NewGroups []string `json:"newGroups"`
	}{}
	if err := c.Bind(&data); err != nil {
		return err
	}
	var existingGroups []CommandGroup
	if err := cgs.db.Find("CommandID", commandID, &existingGroups); err != nil && err != storm.ErrNotFound {
		return err
	}

	// add new groups
	for _, ng := range data.NewGroups {
		found := false
		for _, eg := range existingGroups {
			if eg.GroupID == ng {
				found = true
				break
			}
		}
		if !found {
			if err := cgs.db.Save(&CommandGroup{
				ID:        nuid.Next(),
				CommandID: commandID,
				GroupID:   ng,
			}); err != nil {
				return err
			}
		}
	}

	// remove stale ones
	for _, eg := range existingGroups {
		found := false
		for _, ng := range data.NewGroups {
			if eg.GroupID == ng {
				found = true
				break
			}
		}
		if !found {
			if err := cgs.db.DeleteStruct(&eg); err != nil {
				return err
			}
		}
	}
	log.Info().Str("commandID", commandID).Interface("email", c.Get("email")).Strs("new", data.NewGroups).Msg("changed command groups")
	return c.NoContent(http.StatusOK)
}
