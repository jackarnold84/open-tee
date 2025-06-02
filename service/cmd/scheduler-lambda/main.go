package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, event events.EventBridgeEvent) error {
	fmt.Println("Hello, world! Event ID:", event.ID)
	return nil
}

func main() {
	lambda.Start(handler)
}
