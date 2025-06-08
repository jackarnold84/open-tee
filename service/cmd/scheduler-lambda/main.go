package main

import (
	"context"
	"encoding/json"
	"fmt"
	"opentee/internal/handler"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func lambdaHandler(ctx context.Context, event events.EventBridgeEvent) (handler.ProcessAlertsResponse, error) {
	resp, err := handler.ProcessAlerts(ctx)
	if err != nil {
		respJSON, _ := json.Marshal(resp)
		handler.SendErrorNotification(ctx, fmt.Sprintf("%s - %s", err.Error(), respJSON))
		return resp, err
	}
	return resp, nil
}

func main() {
	lambda.Start(lambdaHandler)
}
