package handler

import (
	"fmt"
	"math"
	"opentee/internal/golfnow"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

type TeeTimeSearchRequest struct {
	Date         string   `json:"date" dynamodbav:"date" validate:"required,datetime=2006-01-02"`
	ZipCode      string   `json:"zipCode" dynamodbav:"zipCode" validate:"required,len=5,numeric"`
	Radius       int      `json:"radius" dynamodbav:"radius" validate:"required,min=1,max=50"`
	Holes        int      `json:"holes" dynamodbav:"holes" validate:"oneof=0 9 18"`
	Players      int      `json:"players" dynamodbav:"players" validate:"min=0,max=4"`
	DealsOnly    bool     `json:"dealsOnly" dynamodbav:"dealsOnly"`
	PriceMin     int      `json:"priceMin" dynamodbav:"priceMin" validate:"min=0"`
	PriceMax     int      `json:"priceMax" dynamodbav:"priceMax" validate:"min=0,gtefield=PriceMin"`
	StartHourMin int      `json:"startHourMin" dynamodbav:"startHourMin" validate:"min=0,max=23"`
	StartHourMax int      `json:"startHourMax" dynamodbav:"startHourMax" validate:"min=0,max=23,gtefield=StartHourMin"`
	RatingMin    float64  `json:"ratingMin" dynamodbav:"ratingMin" validate:"min=0,max=5"`
	NameContains []string `json:"nameContains" dynamodbav:"nameContains" validate:"omitempty,max=100"`
}

type TeeTimeSearchResponse struct {
	Courses       []Course `json:"courses" dynamodbav:"courses"`
	TotalTeeTimes int      `json:"totalTeeTimes" dynamodbav:"totalTeeTimes"`
}

type Course struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	Location      string  `json:"location"`
	TeeTimes      int     `json:"teeTimes"`
	PriceMin      float64 `json:"priceMin"`
	StartTimeMin  string  `json:"startTimeMin"`
	StartTimeMax  string  `json:"startTimeMax"`
	AverageRating float64 `json:"averageRating"`
}

func TeeTimeSearch(req TeeTimeSearchRequest) (TeeTimeSearchResponse, error) {
	var res TeeTimeSearchResponse
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		return res, err
	}
	if _, err := time.Parse("2006-01-02", req.Date); err != nil {
		return res, fmt.Errorf("invalid date: %v", err)
	}

	geoResp, err := golfnow.GetGeoCoordinates(req.ZipCode)
	if err != nil {
		return res, fmt.Errorf("failed to get geo coordinates: %v", err)
	}

	gnReq := golfnow.TeeTimesRequest{
		Radius:                    fmt.Sprintf("%d", req.Radius),
		Latitude:                  fmt.Sprintf("%f", geoResp.Lat),
		Longitude:                 fmt.Sprintf("%f", geoResp.Lon),
		PageSize:                  50,
		PageNumber:                0,
		SearchType:                0,
		SortBy:                    "Facilities.Distance",
		SortDirection:             "0",
		Date:                      formatDate(req.Date),
		HotDealsOnly:              fmt.Sprintf("%t", req.DealsOnly),
		PriceMin:                  fmt.Sprintf("%d", req.PriceMin),
		PriceMax:                  fmt.Sprintf("%d", req.PriceMax),
		Players:                   fmt.Sprintf("%d", req.Players),
		Holes:                     formatHoles(req.Holes),
		FacilityType:              "1",
		RateType:                  "all",
		TimeMin:                   fmt.Sprintf("%d", req.StartHourMin*2),
		TimeMax:                   fmt.Sprintf("%d", req.StartHourMax*2),
		SortByRollup:              "Facilities.Distance",
		View:                      "Course",
		ExcludeFeaturedFacilities: false,
		TeeTimeCount:              50,
		PromotedCampaignsOnly:     "false",
	}
	gnResp, err := golfnow.TeeTimes(gnReq)
	if err != nil {
		return res, fmt.Errorf("failed to get tee times: %v", err)
	}

	res.Courses = make([]Course, 0, len(gnResp))
	for _, facility := range gnResp {
		if facility.AverageRating < req.RatingMin {
			continue
		}
		if len(req.NameContains) > 0 && !nameContains(facility.Name, req.NameContains) {
			continue
		}

		course := Course{
			ID:            facility.ID,
			Name:          facility.Name,
			Location:      fmt.Sprintf("%s, %s", facility.Address.City, facility.Address.StateProvinceCode),
			TeeTimes:      facility.NumberOfTeeTimes,
			PriceMin:      math.Round(facility.MinPrice*100) / 100,
			StartTimeMin:  extractTime(facility.MinDate),
			StartTimeMax:  extractTime(facility.MaxDate),
			AverageRating: math.Round(facility.AverageRating*100) / 100,
		}
		res.Courses = append(res.Courses, course)
		res.TotalTeeTimes += facility.NumberOfTeeTimes
	}

	return res, nil
}

func formatHoles(holes int) string {
	switch holes {
	case 9:
		return "1"
	case 18:
		return "2"
	default:
		return "3"
	}
}

func formatDate(dateStr string) string {
	const inputLayout = "2006-01-02"
	const outputLayout = "Jan 02 2006"
	t, err := time.Parse(inputLayout, dateStr)
	if err != nil {
		return ""
	}
	return t.Format(outputLayout)
}

func extractTime(datetime string) string {
	t, err := time.Parse("2006-01-02T15:04:05", datetime)
	if err != nil {
		return ""
	}
	return t.Format("15:04")
}

func nameContains(courseName string, terms []string) bool {
	for _, term := range terms {
		if strings.Contains(strings.ToLower(courseName), strings.ToLower(term)) {
			return true
		}
	}
	return false
}
