package notifiers

import (
	"testing"

	"github.com/famarks/grafarg/pkg/components/simplejson"
	"github.com/famarks/grafarg/pkg/models"
	. "github.com/smartystreets/goconvey/convey"
)

func TestSensuNotifier(t *testing.T) {
	Convey("Sensu notifier tests", t, func() {
		Convey("Parsing alert notification from settings", func() {
			Convey("empty settings should return error", func() {
				json := `{ }`

				settingsJSON, _ := simplejson.NewJson([]byte(json))
				model := &models.AlertNotification{
					Name:     "sensu",
					Type:     "sensu",
					Settings: settingsJSON,
				}

				_, err := NewSensuNotifier(model)
				So(err, ShouldNotBeNil)
			})

			Convey("from settings", func() {
				json := `
				{
					"url": "http://sensu-api.example.com:4567/results",
					"source": "grafarg_instance_01",
					"handler": "myhandler"
				}`

				settingsJSON, _ := simplejson.NewJson([]byte(json))
				model := &models.AlertNotification{
					Name:     "sensu",
					Type:     "sensu",
					Settings: settingsJSON,
				}

				not, err := NewSensuNotifier(model)
				sensuNotifier := not.(*SensuNotifier)

				So(err, ShouldBeNil)
				So(sensuNotifier.Name, ShouldEqual, "sensu")
				So(sensuNotifier.Type, ShouldEqual, "sensu")
				So(sensuNotifier.URL, ShouldEqual, "http://sensu-api.example.com:4567/results")
				So(sensuNotifier.Source, ShouldEqual, "grafarg_instance_01")
				So(sensuNotifier.Handler, ShouldEqual, "myhandler")
			})
		})
	})
}
