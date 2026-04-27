package handler

import (
	"context"
	"embed"
	"fmt"
	"html/template"
	"log"
	"math"
	"opentee/common/ses"
	"strings"
	"time"
)

const (
	processLimit = 10
	sourceEmail  = "praisedformula5@gmail.com"
	targetEmail  = "jarno.push@yahoo.com"
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
		status, err := processAlertItem(ctx, item)
		result := ProcessResult{
			AlertID: item.AlertID,
			Status:  status,
		}
		if err != nil {
			result.Error = err.Error()
			log.Printf("Error processing alert %s: %v", item.AlertID, err)
			processErrors++
		}
		resp.ProcessResults = append(resp.ProcessResults, result)
	}

	if processErrors > 0 {
		return resp, fmt.Errorf("error occurred processing %d alerts", processErrors)
	}
	return resp, nil
}

func processAlertItem(ctx context.Context, item AlertItem) (string, error) {
	isPast, err := isPastDate(item.TeeTimeSearch.Date)
	if err != nil {
		return "ERROR", fmt.Errorf("invalid tee time search date: %w", err)
	}
	if isPast {
		db := AlertDB()
		if err := db.Delete(ctx, item.AlertID); err != nil {
			return "ERROR", fmt.Errorf("failed to delete future-dated alert: %w", err)
		}
		return "DELETED", nil
	}
	var changes SearchChanges

	// search latest tee times
	currResult, err := TeeTimeSearch(item.TeeTimeSearch)
	if err != nil {
		return "ERROR", fmt.Errorf("tee time search failed: %w", err)
	}

	prevResult := item.Result
	prevCourses := make(map[int]Course, len(prevResult.Courses))
	currCourses := make(map[int]Course, len(prevResult.Courses))
	for _, course := range prevResult.Courses {
		prevCourses[course.ID] = course
	}
	for _, course := range currResult.Courses {
		currCourses[course.ID] = course
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

		if math.Abs(currCourse.PriceMin-prevCourse.PriceMin) > 0.05*currCourse.PriceMin {
			changes.CostChanges = append(changes.CostChanges, CourseChange{
				Prev:    prevCourse,
				Current: currCourse,
			})
		}
	}
	for _, prevCourse := range prevResult.Courses {
		if _, exists := currCourses[prevCourse.ID]; !exists {
			changes.TeeTimeChanges = append(changes.TeeTimeChanges, CourseChange{
				Prev:    prevCourse,
				Current: Course{},
			})
		}
	}

	// only alert for new courses not already alerted (skip for alerts with course name filters)
	newCoursesToAlert := make([]Course, 0, len(changes.NewCourses))
	hasNameFilter := len(item.TeeTimeSearch.NameContains) > 0
	if !hasNameFilter {
		alreadyAlertedSet := make(map[int]bool, len(item.NewCourseAlerted))
		for _, id := range item.NewCourseAlerted {
			alreadyAlertedSet[id] = true
		}
		for _, course := range changes.NewCourses {
			if !alreadyAlertedSet[course.ID] {
				newCoursesToAlert = append(newCoursesToAlert, course)
			}
		}
	} else {
		newCoursesToAlert = changes.NewCourses
	}
	changes.NewCourses = newCoursesToAlert

	notified := false
	if (len(changes.NewCourses) > 0 && item.AlertOptions.NewCourses) ||
		(len(changes.TeeTimeChanges) > 0 && item.AlertOptions.TeeTimeChanges) ||
		(len(changes.CostChanges) > 0 && item.AlertOptions.CostChanges) {
		if err := sendNotification(ctx, item, changes); err != nil {
			return "ERROR", fmt.Errorf("notification failure: %w", err)
		}
		notified = true

		// update NewCourseAlerted
		if !hasNameFilter {
			alreadyAlertedSet := make(map[int]bool, len(item.NewCourseAlerted))
			for _, id := range item.NewCourseAlerted {
				alreadyAlertedSet[id] = true
			}
			for _, course := range changes.NewCourses {
				if _, included := alreadyAlertedSet[course.ID]; !included {
					item.NewCourseAlerted = append(item.NewCourseAlerted, course.ID)
				}
			}
		}
	}

	// update alert item
	item.Result = currResult
	db := AlertDB()
	if err := db.Put(ctx, item); err != nil {
		return "ERROR", fmt.Errorf("failed to update alert item in DB: %w", err)
	}

	if notified {
		return "NOTIFIED", nil
	}
	return "NO_UPDATES", nil
}

func sendNotification(ctx context.Context, alert AlertItem, changes SearchChanges) error {
	title := generateAlertTitle(alert, changes)
	emailBody, err := generateNotificationBody(alert, changes)
	if err != nil {
		return fmt.Errorf("failed to generate email body: %w", err)
	}

	email := ses.Email{
		FromAddress: sourceEmail,
		ToAddress:   alert.AlertEmail,
		Subject:     title,
		Body:        emailBody,
	}
	if err := email.Send(ctx); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

func generateAlertTitle(alert AlertItem, changes SearchChanges) string {
	dateStr := alert.TeeTimeSearch.Date
	parsedDate, err := time.Parse("2006-01-02", dateStr)
	var formattedDate string
	if err != nil {
		formattedDate = dateStr
	} else {
		formattedDate = parsedDate.Format("Mon Jan 2")
	}

	eventType := determineEventType(alert, changes)
	courseName := getCourseNameForAlert(alert, changes)

	return fmt.Sprintf("%s - %s (%s) - OpenTee", courseName, eventType, formattedDate)
}

// getCourseNameForAlert returns the formatted course name(s) for the alert
func getCourseNameForAlert(alert AlertItem, changes SearchChanges) string {
	hasNameFilter := len(alert.TeeTimeSearch.NameContains) > 0

	if len(changes.NewCourses) > 0 {
		courses := changes.NewCourses
		return formatCourseNames(courses)
	}
	if len(changes.TeeTimeChanges) > 0 {
		courses := make([]Course, len(changes.TeeTimeChanges))
		for i, tc := range changes.TeeTimeChanges {
			if tc.Current.Name != "" {
				courses[i] = tc.Current
			} else {
				courses[i] = tc.Prev
			}
		}
		return formatCourseNames(courses)
	}
	if len(changes.CostChanges) > 0 {
		courses := make([]Course, len(changes.CostChanges))
		for i, cc := range changes.CostChanges {
			courses[i] = cc.Current
		}
		return formatCourseNames(courses)
	}

	if hasNameFilter && len(alert.TeeTimeSearch.NameContains) > 0 {
		name := alert.TeeTimeSearch.NameContains[0]
		words := strings.Fields(name)
		if len(words) == 0 {
			return name
		}
		if len(words) == 1 {
			return words[0]
		}
		return words[0] + " " + words[1]
	}

	return "Update"
}

// formatCourseNames formats a slice of courses for the subject line
// Returns first two words of first course, +X for additional courses
func formatCourseNames(courses []Course) string {
	if len(courses) == 0 {
		return ""
	}
	name := courses[0].Name
	words := strings.Fields(name)
	var firstCourse string
	if len(words) == 0 {
		firstCourse = name
	} else if len(words) == 1 {
		firstCourse = words[0]
	} else {
		firstCourse = words[0] + " " + words[1]
	}
	if len(courses) == 1 {
		return firstCourse
	}
	return fmt.Sprintf("%s +%d", firstCourse, len(courses)-1)
}

// determineEventType returns the event type string based on changes and alert options
func determineEventType(alert AlertItem, changes SearchChanges) string {
	hasNameFilter := len(alert.TeeTimeSearch.NameContains) > 0

	if len(changes.NewCourses) > 0 && alert.AlertOptions.NewCourses {
		if !hasNameFilter {
			return "New Courses"
		}
		return "Available"
	}

	if len(changes.TeeTimeChanges) > 0 && alert.AlertOptions.TeeTimeChanges {
		for _, tc := range changes.TeeTimeChanges {
			prevTimes := tc.Prev.TeeTimes
			currTimes := tc.Current.TeeTimes

			// Check for unavailable (dropped to zero)
			if currTimes == 0 && prevTimes > 0 {
				return "Unavailable"
			}
			// Check for added (increased)
			if currTimes > prevTimes {
				return "Tee Time Added"
			}
			// Check for reduced (decreased but not zero)
			if currTimes < prevTimes && currTimes > 0 {
				return "Tee Time Reduced"
			}
		}
	}

	if len(changes.CostChanges) > 0 && alert.AlertOptions.CostChanges {
		return "Cost Change"
	}

	return "Update"
}

func generateNotificationBody(alert AlertItem, changes SearchChanges) (string, error) {
	title := generateAlertTitle(alert, changes)
	tmplBytes, err := alertEmailTmplFS.ReadFile("alert_email.tmpl.html")
	if err != nil {
		return "", fmt.Errorf("failed to read email template: %w", err)
	}
	data := struct {
		Alert   AlertItem
		Changes SearchChanges
		Title   string
	}{
		Alert:   alert,
		Changes: changes,
		Title:   title,
	}

	funcs := template.FuncMap{
		"ampm": func(s string) string {
			if s == "" {
				return ""
			}
			t, err := time.Parse("15:04", s)
			if err != nil {
				return s
			}
			return t.Format("3:04pm")
		},
		"hourAmpm": func(h int) string {
			if h < 0 || h > 23 {
				return ""
			}
			return time.Date(2000, 1, 1, h, 0, 0, 0, time.UTC).Format("3:04pm")
		},
		"titleCase": func(s string) string {
			return titleCaseWords(s)
		},
		"joinTitleCase": func(arr []string) string {
			result := make([]string, len(arr))
			for i, s := range arr {
				result[i] = titleCaseWords(s)
			}
			return strings.Join(result, ", ")
		},
	}

	htmlBody, err := ses.HtmlTemplate(string(tmplBytes), data, funcs)
	if err != nil {
		return "", fmt.Errorf("failed to generate email body: %w", err)
	}
	return htmlBody, nil
}

func SendErrorNotification(ctx context.Context, message string) error {
	emailBody := fmt.Sprintf("An error occurred while processing alerts: %s", message)
	email := ses.Email{
		FromAddress: sourceEmail,
		ToAddress:   targetEmail,
		Subject:     "OpenTee - Alert Processing Error",
		Body:        emailBody,
	}
	if err := email.Send(ctx); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}
	return nil
}

func isPastDate(dateStr string) (bool, error) {
	dateTimeStr := fmt.Sprintf("%s 23:59", dateStr)
	parsed, err := time.Parse("2006-01-02 15:04", dateTimeStr)
	if err != nil {
		return false, err
	}
	return parsed.Before(time.Now()), nil
}

func titleCaseWords(s string) string {
	words := strings.Fields(s)
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(string(word[0])) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, " ")
}
