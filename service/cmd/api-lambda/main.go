package main

import (
	"context"
	"fmt"
	"opentee/common/lamb"
	"opentee/internal/handler"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func lambdaHandler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	switch request.HTTPMethod {
	case "GET":
		switch request.Path {
		case "/opentee/health":
			return lamb.Success(map[string]string{"status": "healthy"}), nil
		}
	case "POST":
		switch request.Path {
		case "/opentee/tee-time-search":
			var req handler.GolfSearchRequest
			if err := lamb.ParseRequestBody(request.Body, &req); err != nil {
				return lamb.BadRequest(err), nil
			}
			res, err := handler.GolfSearch(req)
			if err != nil {
				return lamb.Error(err, "tee time search error"), nil
			}
			return lamb.Success(res), nil
		}
	}

	return lamb.BadRequest(fmt.Errorf("unsupported path: %s %s", request.HTTPMethod, request.Path)), nil
}

func main() {
	lambda.Start(lambdaHandler)
}
