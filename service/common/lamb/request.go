package lamb

import (
	"encoding/json"
	"errors"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New(validator.WithRequiredStructEnabled())

func ParseRequestBody(body string, v any) error {
	if body == "" {
		return errors.New("request body is empty")
	}
	if err := json.Unmarshal([]byte(body), v); err != nil {
		return err
	}
	return validate.Struct(v)
}

func ParseQueryStrings(queryStrings map[string]string, v any) error {
	qsData, _ := json.Marshal(queryStrings)
	if err := json.Unmarshal(qsData, v); err != nil {
		return err
	}
	return validate.Struct(v)
}
