package lamb

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

func buildResponse(statusCode int, payload any) events.APIGatewayProxyResponse {
	bodyBytes, _ := json.Marshal(payload)
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Body:       string(bodyBytes),
		Headers: map[string]string{
			"Content-Type":                 "application/json",
			"Access-Control-Allow-Headers": "application/json",
			"Access-Control-Allow-Origin":  "*",
		},
		MultiValueHeaders: map[string][]string{
			"Access-Control-Allow-Methods": {"GET", "POST"},
		},
	}
}

func Success(payload any) events.APIGatewayProxyResponse {
	return buildResponse(200, payload)
}

func Error(err error, msg ...string) events.APIGatewayProxyResponse {
	errMsg := "unknown error"
	if err != nil {
		errMsg = err.Error()
	}
	res := map[string]any{"status": "FAILIRE", "error": errMsg}
	if len(msg) > 0 {
		res["message"] = msg[0]
	}
	return buildResponse(500, res)
}

func BadRequest(err error) events.APIGatewayProxyResponse {
	errMsg := "bad request"
	if err != nil {
		errMsg = err.Error()
	}
	return buildResponse(400, map[string]any{"status": "BAD_REQUEST", "error": errMsg})
}

func Unauthorized(err error) events.APIGatewayProxyResponse {
	errMsg := "unauthorized request"
	if err != nil {
		errMsg = err.Error()
	}
	return buildResponse(401, map[string]any{"status": "UNAUTHORIZED", "error": errMsg})
}
