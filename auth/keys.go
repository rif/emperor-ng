package auth

import (
	"net/http"
	"sync"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/labstack/echo/v4"
	"github.com/nats-io/nuid"
	"github.com/rif/cache2go"
)

type Key struct {
	Email string `storm:"id,increment" json:"email"`
	Value string `storm:"index" json:"value"`
}

type Keys struct {
	db    *storm.DB
	cache *cache2go.Cache
	sync.RWMutex
}

func NewKeys(db *storm.DB) *Keys {
	ks := &Keys{
		db:    db,
		cache: cache2go.New(1000, 60*time.Minute),
	}
	return ks
}

func (ks *Keys) GetHandler(c echo.Context) error {
	ks.RLock()
	defer ks.RUnlock()
	var keys []*Key
	if err := ks.db.All(&keys); err != nil {
		return nil
	}
	var users []*User
	if err := ks.db.All(&users); err != nil {
		return nil
	}
	var emails []string
	for _, u := range users {
		emails = append(emails, u.Email)
	}
	response := map[string]interface{}{
		"emails": emails,
		"keys":   keys,
	}
	return c.JSON(http.StatusOK, response)
}

func (ks *Keys) PostHandler(c echo.Context) error {
	ks.Lock()
	defer ks.Unlock()
	k := new(Key)
	if err := c.Bind(k); err != nil {
		return err
	}
	key := &Key{
		Email: k.Email,
		Value: nuid.Next(),
	}
	ks.cache.Set(key.Value, key.Email)
	if err := ks.db.Save(key); err != nil {
		return err
	}
	return c.String(http.StatusOK, key.Value)
}

func (ks *Keys) DeleteHandler(c echo.Context) error {
	ks.Lock()
	defer ks.Unlock()
	k := new(Key)
	if err := c.Bind(k); err != nil {
		return err
	}
	ks.cache.Delete(k.Value)
	if err := ks.db.DeleteStruct(k); err != nil {
		return err
	}
	return c.NoContent(http.StatusOK)
}
