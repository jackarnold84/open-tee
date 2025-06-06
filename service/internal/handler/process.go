package handler

import (
	"context"
	"embed"
	"fmt"
	"math"
	"opentee/common/ses"
)

const (
	processLimit = 10
)

type ProcessAlertsResponse struct {
	ProcessResults []ProcessResult `json:"processResults"`
}

type ProcessResult struct {
	AlertID string `json:"alertId"`
	Status  string `json:"status"`
	Error   string `json:"error,omitempty"`
}

type SearchChanges struct {
	NewCourses     []Course
	TeeTimeChanges []CourseChange
	CostChanges    []CourseChange
}

type CourseChange struct {
	Prev    Course
	Current Course
}

//go:embed alert_email.tmpl.html
var alertEmailTmplFS embed.FS

func ProcessAlerts(ctx context.Context) (ProcessAlertsResponse, error) {
	alertItems := make([]AlertItem, 0, processLimit)
	db := AlertDB()
	if err := db.Scan(ctx, processLimit, &alertItems); err != nil {
		return ProcessAlertsResponse{}, fmt.Errorf("failed to scan alert items: %w", err)
	}

	resp := ProcessAlertsResponse{
		ProcessResults: make([]ProcessResult, 0, len(alertItems)),
	}
	processErrors := 0
	for _, item := range alertItems {
		notified, err := processAlertItem(ctx, item)
		result := ProcessResult{
			AlertID: item.AlertID,
		}
		if err != nil {
			result.Status = "ERROR"
			result.Error = err.Error()
			processErrors++
		} else if notified {
			result.Status = "NOTIFIED"
		} else {
			result.Status = "NO_UPDATES"
		}
		resp.ProcessResults = append(resp.ProcessResults, result)
	}

	if processErrors > 0 {
		return resp, fmt.Errorf("error occurred processing %d alerts", processErrors)
	}
	return resp, nil
}

func processAlertItem(ctx context.Context, item AlertItem) (bool, error) {
	var changes SearchChanges
	// TODO: delete old alerts

	prevResult := item.Result
	prevCourses := map[int]Course{}
	for _, course := range prevResult.Courses {
		prevCourses[course.ID] = course
	}

	// search latest tee times
	currResult, err := TeeTimeSearch(item.TeeTimeSearch)
	if err != nil {
		return false, fmt.Errorf("tee time search failed: %w", err)
	}

	// check for changes
	for _, currCourse := range currResult.Courses {
		prevCourse, exists := prevCourses[currCourse.ID]
		if !exists {
			changes.NewCourses = append(changes.NewCourses, currCourse)
			continue
		}

		if currCourse.TeeTimes != prevCourse.TeeTimes {
			changes.TeeTimeChanges = append(changes.TeeTimeChanges, CourseChange{
				Prev:    prevCourse,
				Current: currCourse,
			})
		}

		if math.Abs(currCourse.PriceMin-prevCourse.PriceMin) > 0.50 {
			changes.CostChanges = append(changes.CostChanges, CourseChange{
				Prev:    prevCourse,
				Current: currCourse,
			})
		}
	}

	notified := false
	if (len(changes.NewCourses) > 0 && item.AlertOptions.NewCourses) ||
		(len(changes.TeeTimeChanges) > 0 && item.AlertOptions.TeeTimeChanges) ||
		(len(changes.CostChanges) > 0 && item.AlertOptions.CostChanges) {
		if err := sendNotification(item, changes); err != nil {
			return false, fmt.Errorf("notification failure: %w", err)
		}
		notified = true
	}

	// update alert item
	item.Result = currResult
	db := AlertDB()
	if err := db.Put(ctx, item); err != nil {
		return notified, fmt.Errorf("failed to update alert item in DB: %w", err)
	}

	return notified, nil
}

func sendNotification(alert AlertItem, changes SearchChanges) error {
	emailBody, err := generateEmailBody(alert, changes)
	if err != nil {
		return fmt.Errorf("failed to generate email body: %w", err)
	}

	// TODO: send
	fmt.Println(emailBody)

	return nil
}

func generateEmailBody(alert AlertItem, changes SearchChanges) (string, error) {
	tmplBytes, err := alertEmailTmplFS.ReadFile("alert_email.tmpl.html")
	if err != nil {
		return "", fmt.Errorf("failed to read email template: %w", err)
	}
	data := struct {
		AlertOptions AlertOptions
		Changes      SearchChanges
	}{
		AlertOptions: alert.AlertOptions,
		Changes:      changes,
	}
	htmlBody, err := ses.HtmlTemplate(string(tmplBytes), data)
	if err != nil {
		return "", fmt.Errorf("failed to generate email body: %w", err)
	}
	return htmlBody, nil
}
