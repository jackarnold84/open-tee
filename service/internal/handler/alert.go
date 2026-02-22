package handler

import (
	"context"
	"fmt"
	"math/rand"

	"github.com/go-playground/validator/v10"
)

type CreateAlertRequest struct {
	AlertID       string               `json:"alertId"`
	TeeTimeSearch TeeTimeSearchRequest `json:"teeTimeSearch" validate:"required"`
	AlertOptions  AlertOptions         `json:"alertOptions" validate:"required"`
	AlertUser     string               `json:"alertUser" validate:"required"`
	AlertEmail    string               `json:"alertEmail" validate:"required,email"`
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

	db := AlertDB()
	alertID := req.AlertID

	if alertID != "" {
		// Edit mode: If alertId is provided, verify it exists and belongs to the user
		var existingItem AlertItem
		if err := db.Get(ctx, alertID, &existingItem); err != nil {
			return CreateAlertResponse{}, fmt.Errorf("failed to get existing alert: %v", err)
		}
		if existingItem.AlertID == "" {
			return CreateAlertResponse{}, ErrAlertNotFound
		}
		if existingItem.AlertUser != req.AlertUser {
			return CreateAlertResponse{}, ErrAlertForbidden
		}
	} else {
		// Create mode: generate new ID
		alertID = genAlertId()
	}

	teeTimeRes, err := TeeTimeSearch(req.TeeTimeSearch)
	if err != nil {
		return CreateAlertResponse{}, fmt.Errorf("tee time search failed: %v", err)
	}

	alertItem := AlertItem{
		AlertID:       alertID,
		AlertUser:     req.AlertUser,
		AlertEmail:    req.AlertEmail,
		AlertOptions:  req.AlertOptions,
		TeeTimeSearch: req.TeeTimeSearch,
		Result:        teeTimeRes,
	}

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

type GetAlertRequest struct {
	AlertID string `json:"alertId" validate:"required"`
}

type AlertResponse struct {
	AlertID       string               `json:"alertId"`
	AlertUser     string               `json:"alertUser"`
	AlertEmail    string               `json:"alertEmail"`
	AlertOptions  AlertOptions         `json:"alertOptions"`
	TeeTimeSearch TeeTimeSearchRequest `json:"teeTimeSearch"`
}

type ListAlertsResponse struct {
	Alerts []AlertResponse `json:"alerts"`
	Count  int             `json:"count"`
}

func GetAlert(ctx context.Context, req GetAlertRequest, username string) (AlertResponse, error) {
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return AlertResponse{}, err
	}

	db := AlertDB()
	var item AlertItem
	if err := db.Get(ctx, req.AlertID, &item); err != nil {
		return AlertResponse{}, fmt.Errorf("failed to get alert from DB: %v", err)
	}

	if item.AlertID == "" {
		return AlertResponse{}, ErrAlertNotFound
	}

	if item.AlertUser != username {
		return AlertResponse{}, ErrAlertForbidden
	}

	return AlertResponse{
		AlertID:       item.AlertID,
		AlertUser:     item.AlertUser,
		AlertEmail:    item.AlertEmail,
		AlertOptions:  item.AlertOptions,
		TeeTimeSearch: item.TeeTimeSearch,
	}, nil
}

func ListAlerts(ctx context.Context, username string) (ListAlertsResponse, error) {
	db := AlertDB()
	var items []AlertItem
	if err := db.ScanByUser(ctx, username, &items); err != nil {
		return ListAlertsResponse{}, fmt.Errorf("failed to scan alerts from DB: %v", err)
	}

	alerts := make([]AlertResponse, len(items))
	for i, item := range items {
		alerts[i] = AlertResponse{
			AlertID:       item.AlertID,
			AlertUser:     item.AlertUser,
			AlertEmail:    item.AlertEmail,
			AlertOptions:  item.AlertOptions,
			TeeTimeSearch: item.TeeTimeSearch,
		}
	}

	return ListAlertsResponse{
		Alerts: alerts,
		Count:  len(alerts),
	}, nil
}

var (
	ErrAlertNotFound  = fmt.Errorf("alert not found")
	ErrAlertForbidden = fmt.Errorf("alert belongs to another user")
)
