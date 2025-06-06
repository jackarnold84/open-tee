package main

import (
	"context"
	"opentee/internal/handler"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func lambdaHandler(ctx context.Context, event events.EventBridgeEvent) (handler.ProcessAlertsResponse, error) {
	return handler.ProcessAlerts(ctx)
}

func main() {
	lambda.Start(lambdaHandler)
}
