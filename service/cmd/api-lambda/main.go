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
		switch request.Resource {
		case "/opentee/health":
			return lamb.Success(map[string]string{"status": "healthy"}), nil
		}
	case "POST":
		switch request.Resource {
		case "/opentee/tee-time-search":
			var req handler.TeeTimeSearchRequest
			if err := lamb.ParseRequestBody(request.Body, &req); err != nil {
				return lamb.BadRequest(err), nil
			}
			res, err := handler.TeeTimeSearch(req)
			if err != nil {
				return lamb.Error(err, "tee time search error"), nil
			}
			return lamb.Success(res), nil
		case "/opentee/create-alert":
			var req handler.CreateAlertRequest
			if err := lamb.ParseRequestBody(request.Body, &req); err != nil {
				return lamb.BadRequest(err), nil
			}
			res, err := handler.CreateAlert(ctx, req)
			if err != nil {
				return lamb.Error(err, "create alert error"), nil
			}
			return lamb.Success(res), nil
		}
	case "DELETE":
		switch request.Resource {
		case "/opentee/delete-alert/{alertId}":
			var req handler.DeleteAlertRequest
			if err := lamb.ParseParameters(request.PathParameters, &req); err != nil {
				return lamb.BadRequest(err), nil
			}
			res, err := handler.DeleteAlert(ctx, req)
			if err != nil {
				return lamb.Error(err, "delete alert error"), nil
			}
			return lamb.Success(res), nil
		}
	}

	return lamb.BadRequest(fmt.Errorf("unsupported request")), nil
}

func main() {
	lambda.Start(lambdaHandler)
}
