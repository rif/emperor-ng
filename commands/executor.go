package commands

import (
	"net/http"
	"time"

	"github.com/asdine/storm/v3"
	"github.com/asdine/storm/v3/q"
	"github.com/labstack/echo/v4"
)

type Execution struct {
	ID        string    `storm:"id" json:"id"`
	Email     string    `storm:"index" json:"email"`
	Cmd       string    `storm:"index" json:"cmd"`
	Params    string    `json:"params"`
	Output    string    `json:"output"`
	Timestamp time.Time `storm:"index" json:"timestamp"`
	Count     int       `json:"count"`
}

type Filter struct {
	Email        string    `json:"email"`
	StartTime    time.Time `json:"startTime"`
	EndTime      time.Time `json:"endTime"`
	Page         int       `json:"page"`
	ItemsPerPage int       `json:"itemsPerPage"`
}

type Executor struct {
	db *storm.DB
}

func NewExecutor(db *storm.DB) *Executor {
	return &Executor{db: db}
}

func (ex *Executor) GetHandler(c echo.Context) error {
	f := new(Filter)
	if err := c.Bind(f); err != nil {
		return err
	}
	var matchers []q.Matcher
	if f.Email != "" {
		matchers = append(matchers, q.Eq("Email", f.Email))
	}
	if !f.StartTime.IsZero() {
		matchers = append(matchers, q.Gte("Timestamp", f.StartTime))
	}
	if !f.EndTime.IsZero() {
		matchers = append(matchers, q.Lt("Timestamp", f.EndTime))
	}
	query := q.True()
	if len(matchers) > 0 {
		query = q.And(matchers...)
	}
	executions := make([]Execution, 0)
	if err := ex.db.Select(query).Limit(f.ItemsPerPage).Skip((f.Page - 1) * f.ItemsPerPage).Find(&executions); err != nil {
		return err
	}

	response := map[string]interface{}{
		"items": executions,
	}

	return c.JSON(http.StatusOK, response)
}

func (ex *Executor) PostHandler(c echo.Context) error {
	cmd := new(Command)
	if err := c.Bind(cmd); err != nil {
		return err
	}
	//TODO: add execution queue
	output, err := cmd.Execute()
	exn := &Execution{
		Email:     c.Get("email").(string),
		Cmd:       cmd.Cmd,
		Params:    cmd.Params,
		Output:    output,
		Timestamp: time.Now(),
	}
	if err := ex.db.Save(exn); err != nil {
		return err
	}
	if err != nil {
		return err
	}
	return c.String(http.StatusOK, output)
}
