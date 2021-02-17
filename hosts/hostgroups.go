package hosts

import (
	"emperor-ng/auth"
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
)

type HostGroup struct {
	ID      string `storm:"id" json:"id"` // primary key
	HostID  string `storm:"index" json:"hostId"`
	GroupID string `storm:"index" json:"groupId"`
}

type HostGroups struct {
	db *storm.DB
}

func NewHostGroups(db *storm.DB) *HostGroups {
	return &HostGroups{db: db}
}

func (cgs *HostGroups) GetHandler(c echo.Context) error {
	hostID := c.Param("host")
	var ugList []HostGroup
	if err := cgs.db.Find("HostID", hostID, &ugList); err != nil && err != storm.ErrNotFound {
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

func (cgs *HostGroups) PostHandler(c echo.Context) error {
	hostID := c.Param("host")
	data := struct {
		NewGroups []string `json:"newGroups"`
	}{}
	if err := c.Bind(&data); err != nil {
		return err
	}
	var existingGroups []HostGroup
	if err := cgs.db.Find("HostID", hostID, &existingGroups); err != nil && err != storm.ErrNotFound {
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
			if err := cgs.db.Save(&HostGroup{
				ID:      nuid.Next(),
				HostID:  hostID,
				GroupID: ng,
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
	return c.NoContent(http.StatusOK)
}
