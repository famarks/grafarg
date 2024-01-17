package sqlstore

import (
	"github.com/famarks/grafarg/pkg/bus"
	"github.com/famarks/grafarg/pkg/models"
)

func init() {
	bus.AddHandler("sql", GetDBHealthQuery)
}

func GetDBHealthQuery(query *models.GetDBHealthQuery) error {
	_, err := x.Exec("SELECT 1")
	return err
}
