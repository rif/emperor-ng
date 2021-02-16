package auth

import (
	"net/http"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
)

type UserGroup struct {
	ID         string `storm:"id" json:"id"` // primary key
	UserID     string `storm:"index" json:"userId"`
	GroupID string `storm:"index" json:"groupId"`
}

type UserGroups struct {
	db *storm.DB
}

func NewUserGroup(db *storm.DB) *UserGroups {
	return &UserGroups{db: db}
}

func (ugs *UserGroups) GetHandler(c echo.Context) error {
	userID := c.Param("user")
	var ugList []UserGroup
	if err := ugs.db.Find("UserID", userID, &ugList); err != nil && err != storm.ErrNotFound {
		return err
	}
	groupIDs:=make([]string,0)
	for _, ug := range ugList {
		groupIDs = append(groupIDs,ug.GroupID)
	}

	groups := make([]Group,0)
	// For some reason it does not work to use Find("Primary", false, &groups)
	if err := ugs.db.All(&groups); err != nil  && err != storm.ErrNotFound {
		return err
	}
	groupsNoPrimary := make([]Group, 0)
	for _, g := range groups {
		if !g.Primary {
			groupsNoPrimary = append(groupsNoPrimary, g)
		}
	}


	response := map[string]interface{}{
		"items": groupIDs,
		"groups": groupsNoPrimary,
	}
	return c.JSON(http.StatusOK, response)
}

func (ugs *UserGroups) PostHandler(c echo.Context) error {
	userID := c.Param("user")
	data := struct {
	NewGroups []string `json:"newGroups"`
	}{}
	if err := c.Bind(&data); err != nil {
		return err
	}
	var existingGroups []UserGroup
	if err := ugs.db.Find("UserID", userID, &existingGroups); err != nil && err != storm.ErrNotFound {
		return err
	}

	// add new groups
	for _, ng := range data.NewGroups{
		found := false
		for _, eg := range existingGroups {
			if eg.GroupID == ng{
				found = true
				break
			}
		}
		if !found {
			if err := ugs.db.Save(&UserGroup{
				ID: nuid.Next(),
				UserID: userID,
				GroupID: ng,
			}); err != nil {
				return err
			}
		}
	}

	// remove stale ones
	for _, eg := range existingGroups {
			found := false
			for _, ng := range data.NewGroups{
				if eg.GroupID == ng{
				found = true
				break
			}
			}
			if !found {
				if err := ugs.db.DeleteStruct(&eg); err != nil {
					return err
				}
			}
	}
	return c.NoContent(http.StatusOK)
}
