package metrics

import (
	"context"

	"github.com/famarks/grafarg/pkg/infra/log"
	"github.com/famarks/grafarg/pkg/infra/metrics/graphitebridge"
	"github.com/famarks/grafarg/pkg/registry"
	"github.com/famarks/grafarg/pkg/setting"
)

var metricsLogger log.Logger = log.New("metrics")

type logWrapper struct {
	logger log.Logger
}

func (lw *logWrapper) Println(v ...interface{}) {
	lw.logger.Info("graphite metric bridge", v...)
}

func init() {
	registry.RegisterService(&InternalMetricsService{})
	initMetricVars()
	initFrontendMetrics()
}

type InternalMetricsService struct {
	Cfg *setting.Cfg `inject:""`

	intervalSeconds int64
	graphiteCfg     *graphitebridge.Config
}

func (im *InternalMetricsService) Init() error {
	return im.readSettings()
}

func (im *InternalMetricsService) Run(ctx context.Context) error {
	// Start Graphite Bridge
	if im.graphiteCfg != nil {
		bridge, err := graphitebridge.NewBridge(im.graphiteCfg)
		if err != nil {
			metricsLogger.Error("failed to create graphite bridge", "error", err)
		} else {
			go bridge.Run(ctx)
		}
	}

	MInstanceStart.Inc()

	<-ctx.Done()
	return ctx.Err()
}
