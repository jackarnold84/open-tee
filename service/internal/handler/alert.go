package handler

import (
	"context"
	"fmt"
	"math/rand"
	"opentee/common/dynamo"

	"github.com/go-playground/validator/v10"
)

const (
	OpenTeeTable    = "OpenTeeTable"
	OpenTeeTableKey = "key"
)

type CreateAlertRequest struct {
	TeeTimeSearch TeeTimeSearchRequest `json:"teeTimeSearch" validate:"required"`
	AlertType     string               `json:"alertType" validate:"required,oneof=NEW ALL"`
}

type CreateAlertResponse struct {
	AlertID string `json:"alertId"`
}

type DeleteAlertRequest struct {
	AlertID string `json:"alertId" validate:"required"`
}

type DeleteAlertResponse struct {
	Message string `json:"message"`
}

type AlertItem struct {
	AlertID       string                `dynamodbav:"key" json:"alertId"`
	AlertType     string                `dynamodbav:"alertType" json:"alertType"`
	TeeTimeSearch TeeTimeSearchRequest  `dynamodbav:"teeTimeSearch" json:"teeTimeSearch"`
	Result        TeeTimeSearchResponse `dynamodbav:"result" json:"result"`
}

func CreateAlert(ctx context.Context, req CreateAlertRequest) (CreateAlertResponse, error) {
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return CreateAlertResponse{}, err
	}

	teeTimeRes, err := TeeTimeSearch(req.TeeTimeSearch)
	if err != nil {
		return CreateAlertResponse{}, fmt.Errorf("tee time search failed: %v", err)
	}

	alertID := genAlertId()
	alertItem := AlertItem{
		AlertID:       alertID,
		AlertType:     req.AlertType,
		TeeTimeSearch: req.TeeTimeSearch,
		Result:        teeTimeRes,
	}

	dbTable := dynamo.Table{
		TableName: OpenTeeTable,
		KeyName:   OpenTeeTableKey,
	}
	if err := dbTable.PutItem(ctx, alertItem); err != nil {
		return CreateAlertResponse{}, fmt.Errorf("failed to save alert to DB: %v", err)
	}

	return CreateAlertResponse{AlertID: alertID}, nil
}

func DeleteAlert(ctx context.Context, req DeleteAlertRequest) (DeleteAlertResponse, error) {
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return DeleteAlertResponse{}, err
	}

	dbTable := dynamo.Table{
		TableName: OpenTeeTable,
		KeyName:   OpenTeeTableKey,
	}
	if err := dbTable.DeleteItem(ctx, req.AlertID); err != nil {
		return DeleteAlertResponse{}, fmt.Errorf("failed to delete alert from DB: %v", err)
	}

	return DeleteAlertResponse{Message: fmt.Sprintf("Alert %s deleted", req.AlertID)}, nil
}

func genAlertId() string {
	n := rand.Intn(1_000_000_0000)
	return fmt.Sprintf("%010d", n)
}
