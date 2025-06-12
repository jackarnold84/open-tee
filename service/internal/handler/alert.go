package handler

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/go-playground/validator/v10"
)

type CreateAlertRequest struct {
	TeeTimeSearch TeeTimeSearchRequest `json:"teeTimeSearch" validate:"required"`
	AlertOptions  AlertOptions         `json:"alertOptions" validate:"required"`
}

type AlertOptions struct {
	NewCourses     bool `json:"newCourses" dynamodbav:"newCourses"`
	TeeTimeChanges bool `json:"teeTimeChanges" dynamodbav:"teeTimeChanges"`
	CostChanges    bool `json:"costChanges" dynamodbav:"costChanges"`
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
		AlertOptions:  req.AlertOptions,
		TeeTimeSearch: req.TeeTimeSearch,
		Result:        teeTimeRes,
	}

	db := AlertDB()
	if err := db.Put(ctx, alertItem); err != nil {
		return CreateAlertResponse{}, fmt.Errorf("failed to save alert to DB: %v", err)
	}

	return CreateAlertResponse{AlertID: alertID}, nil
}

func DeleteAlert(ctx context.Context, req DeleteAlertRequest) (DeleteAlertResponse, error) {
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return DeleteAlertResponse{}, err
	}

	db := AlertDB()
	if err := db.Delete(ctx, req.AlertID); err != nil {
		return DeleteAlertResponse{}, fmt.Errorf("failed to delete alert from DB: %v", err)
	}

	return DeleteAlertResponse{Message: fmt.Sprintf("Alert %s deleted", req.AlertID)}, nil
}

func genAlertId() string {
	n := rand.Intn(1_000_000_0000)
	return fmt.Sprintf("%010d", n)
}
