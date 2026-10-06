package handler

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGenerateEmailBody(t *testing.T) {
	course := Course{
		ID:            3321,
		Name:          "River Oaks Golf Course",
		Location:      "Calumet City, IL",
		TeeTimes:      3,
		PriceMin:      35.99,
		StartTimeMin:  "08:10",
		StartTimeMax:  "13:00",
		AverageRating: 3.91,
	}
	searchChanges := SearchChanges{
		NewCourses: []Course{course},
	}
	alertItem := AlertItem{
		AlertID: "12345",
		AlertOptions: AlertOptions{
			NewCourses: true,
		},
		TeeTimeSearch: TeeTimeSearchRequest{
			Date:         "2025-06-07",
			ZipCode:      "60607",
			Radius:       20,
			Holes:        18,
			Players:      2,
			DealsOnly:    true,
			PriceMax:     100,
			StartHourMin: 6,
			StartHourMax: 18,
		},
	}

	title := generateAlertTitle(alertItem, searchChanges)
	assert.Equal(t, title, "River Oaks - New Courses (Sat Jun 7) - OpenTee")
	emailBody, err := generateNotificationBody(alertItem, searchChanges)
	assert.NoError(t, err)
	assert.NotEmpty(t, emailBody)
}

func TestNotificationCombinesCourseChanges(t *testing.T) {
	previous := Course{ID: 15771, Name: "Wilmette Golf Club", Location: "Wilmette, IL", TeeTimes: 2, PriceMin: 48}
	current := previous
	current.TeeTimes = 4
	current.PriceMin = 39
	current.StartTimeMin = "08:10"
	current.StartTimeMax = "13:00"
	current.ImageURL = "https://example.com/course.jpg"
	alert := AlertItem{
		AlertID:       "12345",
		AlertOptions:  AlertOptions{NewCourses: true, TeeTimeChanges: true, CostChanges: true},
		TeeTimeSearch: TeeTimeSearchRequest{Date: "2025-06-07", ZipCode: "60607", Radius: 20},
	}
	changes := SearchChanges{
		NewCourses:     []Course{current},
		TeeTimeChanges: []CourseChange{{Prev: previous, Current: current}},
		CostChanges:    []CourseChange{{Prev: previous, Current: current}},
	}

	html, err := generateNotificationBody(alert, changes)
	assert.NoError(t, err)
	assert.Equal(t, 1, strings.Count(html, "View tee times"))
	assert.Contains(t, html, "https://www.golfnow.com/tee-times/facility/15771-wilmette-golf-club/search")
	assert.Contains(t, html, "https://example.com/course.jpg")
	assert.Contains(t, html, "Tee times: 2 → 4")
	assert.Contains(t, html, "Price: $48.00 → $39.00")
	assert.Contains(t, html, "8:10am–1:00pm")

	plain := generateNotificationTextBody(alert, changes)
	assert.Equal(t, 1, strings.Count(plain, "View tee times:"))
	assert.NotContains(t, plain, "<table")
}

func TestNotificationUnavailableCourse(t *testing.T) {
	previous := Course{ID: 3321, Name: "River Oaks Golf Course", Location: "Calumet City, IL", TeeTimes: 3, PriceMin: 35.99, ImageURL: "http://example.com/insecure.jpg"}
	alert := AlertItem{
		AlertOptions:  AlertOptions{TeeTimeChanges: true},
		TeeTimeSearch: TeeTimeSearchRequest{Date: "2025-06-07"},
	}
	changes := SearchChanges{TeeTimeChanges: []CourseChange{{Prev: previous}}}

	html, err := generateNotificationBody(alert, changes)
	assert.NoError(t, err)
	assert.Contains(t, html, "No tee times currently available")
	assert.Contains(t, html, "Tee times: 3 → 0")
	assert.NotContains(t, html, "From $0.00")
	assert.NotContains(t, html, "insecure.jpg")
	assert.Contains(t, html, "View tee times")
}
