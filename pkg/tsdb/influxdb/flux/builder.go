package flux

import (
	"fmt"
	"time"

	"github.com/famarks/grafarg-plugin-sdk-go/data"
	"github.com/famarks/grafarg-plugin-sdk-go/data/converters"
	"github.com/influxdata/influxdb-client-go/v2/api/query"
)

// Copied from: (Apache 2 license)
// https://github.com/influxdata/influxdb-client-go/blob/master/query.go#L30
const (
	stringDatatype       = "string"
	doubleDatatype       = "double"
	boolDatatype         = "bool"
	longDatatype         = "long"
	uLongDatatype        = "unsignedLong"
	durationDatatype     = "duration"
	base64BinaryDataType = "base64Binary"
	timeDatatypeRFC      = "dateTime:RFC3339"
	timeDatatypeRFCNano  = "dateTime:RFC3339Nano"
)

type columnInfo struct {
	name      string
	converter *data.FieldConverter
}

// frameBuilder is an interface to help testing.
type frameBuilder struct {
	currentGroupKey     []interface{}
	groupKeyColumnNames []string
	active              *data.Frame
	frames              []*data.Frame
	value               *data.FieldConverter
	columns             []columnInfo
	labels              []string
	maxPoints           int // max points in a series
	maxSeries           int // max number of series
	totalSeries         int
	isTimeSeries        bool
	timeColumn          string // sometimes it is not `_time`
	timeDisplay         string
}

func isTag(schk string) bool {
	return (schk != "result" && schk != "table" && schk[0] != '_')
}

var timeToOptionalTime = data.FieldConverter{
	OutputFieldType: data.FieldTypeNullableTime,
	Converter: func(v interface{}) (interface{}, error) {
		var ptr *time.Time
		if v == nil {
			return ptr, nil
		}
		val, ok := v.(time.Time)
		if !ok {
			return ptr, fmt.Errorf(`expected %s input but got type %T for value "%v"`, "time.Time", v, v)
		}
		ptr = &val
		return ptr, nil
	},
}

func getConverter(t string) (*data.FieldConverter, error) {
	switch t {
	case stringDatatype:
		return &converters.AnyToNullableString, nil
	case timeDatatypeRFC:
		return &timeToOptionalTime, nil
	case timeDatatypeRFCNano:
		return &timeToOptionalTime, nil
	case durationDatatype:
		return &converters.Int64ToNullableInt64, nil
	case doubleDatatype:
		return &converters.Float64ToNullableFloat64, nil
	case boolDatatype:
		return &converters.BoolToNullableBool, nil
	case longDatatype:
		return &converters.Int64ToNullableInt64, nil
	case uLongDatatype:
		return &converters.Uint64ToNullableUInt64, nil
	case base64BinaryDataType:
		return &converters.AnyToNullableString, nil
	}

	return nil, fmt.Errorf("no matching converter found for [%v]", t)
}

// Init initializes the frame to be returned
// fields points at entries in the frame, and provides easier access
// names indexes the columns encountered
func (fb *frameBuilder) Init(metadata *query.FluxTableMetadata) error {
	columns := metadata.Columns()
	fb.frames = make([]*data.Frame, 0)
	fb.currentGroupKey = nil
	fb.value = nil
	fb.columns = make([]columnInfo, 0)
	fb.isTimeSeries = false
	fb.timeColumn = ""
	fb.groupKeyColumnNames = make([]string, 0)

	for _, col := range columns {
		if col.IsGroup() {
			fb.groupKeyColumnNames = append(fb.groupKeyColumnNames, col.Name())
		}
	}

	for _, col := range columns {
		switch {
		case col.Name() == "_value":
			if fb.value != nil {
				return fmt.Errorf("multiple values found")
			}
			converter, err := getConverter(col.DataType())
			if err != nil {
				return err
			}

			fb.value = converter
			fb.isTimeSeries = true
		case isTag(col.Name()):
			fb.labels = append(fb.labels, col.Name())
		}
	}

	// Timeseries has a "_value" and a time
	if fb.isTimeSeries {
		col := getTimeSeriesTimeColumn(columns)
		if col != nil {
			fb.timeColumn = col.Name()
			fb.timeDisplay = "Time"
			if fb.timeColumn != "_time" {
				fb.timeDisplay = col.Name()
			}
			return nil
		}
	}

	// reset any timeseries properties
	fb.value = nil
	fb.isTimeSeries = false
	fb.labels = make([]string, 0)
	for _, col := range columns {
		// Skip the result column
		if col.Index() == 0 && col.Name() == "result" && col.DataType() == stringDatatype {
			continue
		}
		if col.Index() == 1 && col.Name() == "table" && col.DataType() == longDatatype {
			continue
		}

		converter, err := getConverter(col.DataType())
		if err != nil {
			return err
		}

		fb.columns = append(fb.columns, columnInfo{
			name:      col.Name(),
			converter: converter,
		})
	}
	return nil
}

func getTimeSeriesTimeColumn(columns []*query.FluxColumn) *query.FluxColumn {
	// First look for '_time' column
	for _, col := range columns {
		if col.Name() == "_time" && col.DataType() == timeDatatypeRFC || col.DataType() == timeDatatypeRFCNano {
			return col
		}
	}

	// Then any time column
	for _, col := range columns {
		if col.DataType() == timeDatatypeRFC || col.DataType() == timeDatatypeRFCNano {
			return col
		}
	}
	return nil
}

type maxPointsExceededError struct {
	Count int
}

func (e maxPointsExceededError) Error() string {
	return fmt.Sprintf("max data points limit exceeded (count is %d)", e.Count)
}

func getTableID(record *query.FluxRecord, groupColumns []string) []interface{} {
	result := make([]interface{}, len(groupColumns))

	// Flux does not allow duplicate column-names,
	// so we can be sure there is no confusion in the record.
	//
	// ( it does allow for a column named "table" to exist,
	// and shadow the table-id "table" column, but the potentially
	// shadowed table-id column is not a part of the group-key,
	// so we should be safe )

	for i, colName := range groupColumns {
		result[i] = record.ValueByKey(colName)
	}

	return result
}

func isTableIDEqual(id1 []interface{}, id2 []interface{}) bool {
	if (id1 == nil) || (id2 == nil) {
		return false
	}

	if len(id1) != len(id2) {
		return false
	}

	for i, id1Val := range id1 {
		id2Val := id2[i]

		if id1Val != id2Val {
			return false
		}
	}

	return true
}

// Append appends a single entry from an influxdb2 record to a data frame
// Values are appended to _value
// Tags are appended as labels
// _measurement holds the dataframe name
// _field holds the field name.
func (fb *frameBuilder) Append(record *query.FluxRecord) error {
	table := getTableID(record, fb.groupKeyColumnNames)
	if (fb.currentGroupKey == nil) || !isTableIDEqual(table, fb.currentGroupKey) {
		fb.totalSeries++
		if fb.totalSeries > fb.maxSeries {
			return fmt.Errorf("results are truncated, max series reached (%d)", fb.maxSeries)
		}

		if fb.isTimeSeries {
			frameName, ok := record.ValueByKey("_measurement").(string)
			if !ok {
				frameName = "" // empty frame name
			}

			fb.active = data.NewFrame(
				frameName,
				data.NewFieldFromFieldType(data.FieldTypeTime, 0),
				data.NewFieldFromFieldType(fb.value.OutputFieldType, 0),
			)

			fb.active.Fields[0].Name = fb.timeDisplay
			name, ok := record.ValueByKey("_field").(string)
			if ok {
				fb.active.Fields[1].Name = name
			}

			// set the labels
			labels := make(map[string]string)
			for _, name := range fb.labels {
				val := record.ValueByKey(name)
				str := fmt.Sprintf("%v", val)
				if val != nil && str != "" {
					labels[name] = str
				}
			}
			fb.active.Fields[1].Labels = labels
		} else {
			fields := make([]*data.Field, len(fb.columns))
			for idx, col := range fb.columns {
				fields[idx] = data.NewFieldFromFieldType(col.converter.OutputFieldType, 0)
				fields[idx].Name = col.name
			}
			fb.active = data.NewFrame("", fields...)
		}

		fb.frames = append(fb.frames, fb.active)
		fb.currentGroupKey = table
	}

	if fb.isTimeSeries {
		time, ok := record.ValueByKey(fb.timeColumn).(time.Time)
		if !ok {
			return fmt.Errorf("unable to get time colum: %q", fb.timeColumn)
		}

		val, err := fb.value.Converter(record.Value())
		if err != nil {
			return err
		}

		fb.active.Fields[0].Append(time)
		fb.active.Fields[1].Append(val)
	} else {
		// Table view
		for idx, col := range fb.columns {
			val, err := col.converter.Converter(record.ValueByKey(col.name))
			if err != nil {
				return err
			}

			fb.active.Fields[idx].Append(val)
		}
	}

	pointsCount := fb.active.Fields[0].Len()
	if pointsCount > fb.maxPoints {
		return maxPointsExceededError{Count: pointsCount}
	}

	return nil
}
