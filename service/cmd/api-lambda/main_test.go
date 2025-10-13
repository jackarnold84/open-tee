package main

import (
	"context"
	"opentee/internal/env"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
)

var healthEvent = events.APIGatewayProxyRequest{
	HTTPMethod: "GET",
	Resource:   "/opentee/health",
}

func TestHandler(t *testing.T) {
	env.Cfg.Env = "test"

	res, err := lambdaHandler(context.Background(), healthEvent)
	assert.NoError(t, err)
	assert.Equal(t, 200, res.StatusCode, res.Body)

	// // Test /opentee/account with basic header auth
	// accountEvent := events.APIGatewayProxyRequest{
	// 	HTTPMethod: "POST",
	// 	Resource:   "/opentee/account",
	// 	Headers: map[string]string{
	// 		"Authorization": "Basic amFybm80OkxpY2tDcmVlazMwOQ==", // "jarno4:LickCreek309" base64 encoded
	// 	},
	// }
	// res, err = lambdaHandler(context.Background(), accountEvent)
	// assert.NoError(t, err)
	// assert.Equal(t, 200, res.StatusCode, res.Body)
	// fmt.Println(res.Body)
	// t.Fatal()
}
