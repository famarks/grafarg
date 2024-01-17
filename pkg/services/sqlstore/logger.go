package sqlstore

import (
	"fmt"

	glog "github.com/famarks/grafarg/pkg/infra/log"

	"xorm.io/core"
)

type XormLogger struct {
	grafargLog glog.Logger
	level      glog.Lvl
	showSQL    bool
}

func NewXormLogger(level glog.Lvl, grafargLog glog.Logger) *XormLogger {
	return &XormLogger{
		grafargLog: grafargLog,
		level:      level,
		showSQL:    true,
	}
}

// Error implement core.ILogger
func (s *XormLogger) Error(v ...interface{}) {
	if s.level <= glog.LvlError {
		s.grafargLog.Error(fmt.Sprint(v...))
	}
}

// Errorf implement core.ILogger
func (s *XormLogger) Errorf(format string, v ...interface{}) {
	if s.level <= glog.LvlError {
		s.grafargLog.Error(fmt.Sprintf(format, v...))
	}
}

// Debug implement core.ILogger
func (s *XormLogger) Debug(v ...interface{}) {
	if s.level <= glog.LvlDebug {
		s.grafargLog.Debug(fmt.Sprint(v...))
	}
}

// Debugf implement core.ILogger
func (s *XormLogger) Debugf(format string, v ...interface{}) {
	if s.level <= glog.LvlDebug {
		s.grafargLog.Debug(fmt.Sprintf(format, v...))
	}
}

// Info implement core.ILogger
func (s *XormLogger) Info(v ...interface{}) {
	if s.level <= glog.LvlInfo {
		s.grafargLog.Info(fmt.Sprint(v...))
	}
}

// Infof implement core.ILogger
func (s *XormLogger) Infof(format string, v ...interface{}) {
	if s.level <= glog.LvlInfo {
		s.grafargLog.Info(fmt.Sprintf(format, v...))
	}
}

// Warn implement core.ILogger
func (s *XormLogger) Warn(v ...interface{}) {
	if s.level <= glog.LvlWarn {
		s.grafargLog.Warn(fmt.Sprint(v...))
	}
}

// Warnf implement core.ILogger
func (s *XormLogger) Warnf(format string, v ...interface{}) {
	if s.level <= glog.LvlWarn {
		s.grafargLog.Warn(fmt.Sprintf(format, v...))
	}
}

// Level implement core.ILogger
func (s *XormLogger) Level() core.LogLevel {
	switch s.level {
	case glog.LvlError:
		return core.LOG_ERR
	case glog.LvlWarn:
		return core.LOG_WARNING
	case glog.LvlInfo:
		return core.LOG_INFO
	case glog.LvlDebug:
		return core.LOG_DEBUG
	default:
		return core.LOG_ERR
	}
}

// SetLevel implement core.ILogger
func (s *XormLogger) SetLevel(l core.LogLevel) {
}

// ShowSQL implement core.ILogger
func (s *XormLogger) ShowSQL(show ...bool) {
	s.grafargLog.Error("ShowSQL", "show", "show")
	if len(show) == 0 {
		s.showSQL = true
		return
	}
	s.showSQL = show[0]
}

// IsShowSQL implement core.ILogger
func (s *XormLogger) IsShowSQL() bool {
	return s.showSQL
}
