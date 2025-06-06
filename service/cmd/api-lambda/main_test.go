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
}
