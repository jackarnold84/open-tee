package handler

import (
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

	subject := generateEmailSubject(alertItem, searchChanges)
	emailBody, err := generateNotificationBody(alertItem, searchChanges, subject)
	assert.NoError(t, err)
	assert.Equal(t, subject, "OpenTee - Sat Jun 7 - New Courses")
	assert.NotEmpty(t, emailBody)
}
