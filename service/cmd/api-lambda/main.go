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
	case "OPTIONS":
		return lamb.Success(map[string]string{"status": "ok"}), nil
	case "GET":
		switch request.Resource {
		case "/opentee/health":
			return lamb.Success(map[string]string{"status": "healthy"}), nil
		case "/opentee/alert/{alertId}":
			account, err := handler.Authenticate(request)
			if err != nil {
				return lamb.Unauthorized(err), nil
			}
			var req handler.GetAlertRequest
			if err := lamb.ParseParameters(request.PathParameters, &req); err != nil {
				return lamb.BadRequest(err), nil
			}
			res, err := handler.GetAlert(ctx, req, account.Username)
			if err != nil {
				if err == handler.ErrAlertNotFound {
					return lamb.NotFound(err), nil
				}
				if err == handler.ErrAlertForbidden {
					return lamb.Forbidden(err), nil
				}
				return lamb.Error(err, "get alert error"), nil
			}
			return lamb.Success(res), nil
		case "/opentee/alerts":
			account, err := handler.Authenticate(request)
			if err != nil {
				return lamb.Unauthorized(err), nil
			}
			res, err := handler.ListAlerts(ctx, account.Username)
			if err != nil {
				return lamb.Error(err, "list alerts error"), nil
			}
			return lamb.Success(res), nil
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
			account, err := handler.Authenticate(request)
			if err != nil {
				return lamb.Unauthorized(err), nil
			}
			var req handler.CreateAlertRequest
			if err := lamb.ParseRequestBody(request.Body, &req); err != nil {
				return lamb.BadRequest(err), nil
			}
			if account.Username != req.AlertUser {
				return lamb.Unauthorized(fmt.Errorf("username mismatch")), nil
			}
			res, err := handler.CreateAlert(ctx, req)
			if err != nil {
				return lamb.Error(err, "create alert error"), nil
			}
			return lamb.Success(res), nil
		case "/opentee/account":
			account, err := handler.Authenticate(request)
			if err != nil {
				return lamb.Unauthorized(err), nil
			}
			return lamb.Success(account), nil
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
