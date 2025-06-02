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

func ParseParameters(parameters map[string]string, v any) error {
	data, _ := json.Marshal(parameters)
	if err := json.Unmarshal(data, v); err != nil {
		return err
	}
	return validate.Struct(v)
}
