package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// JSON is a custom type for JSONB columns.
type JSON json.RawMessage

// Value implements driver.Valuer for database writes.
func (j JSON) Value() (driver.Value, error) {
	if len(j) == 0 {
		return []byte("{}"), nil
	}
	return []byte(j), nil
}

// Scan implements sql.Scanner for database reads.
func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = JSON("{}") 
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed for JSON column")
	}
	*j = JSON(bytes)
	return nil
}

// MarshalJSON returns the raw JSON.
func (j JSON) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("{}"), nil
	}
	return []byte(j), nil
}

// UnmarshalJSON sets the raw JSON.
func (j *JSON) UnmarshalJSON(data []byte) error {
	if j == nil {
		return errors.New("JSON: UnmarshalJSON on nil pointer")
	}
	*j = JSON(data)
	return nil
}
