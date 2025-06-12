package golfnow

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type TeeTimesRequest struct {
	Radius                    string `json:"Radius"`
	Latitude                  string `json:"Latitude"`
	Longitude                 string `json:"Longitude"`
	PageSize                  int    `json:"PageSize"`
	PageNumber                int    `json:"PageNumber"`
	SearchType                int    `json:"SearchType"`
	Date                      string `json:"Date"`
	HotDealsOnly              string `json:"HotDealsOnly"`
	PriceMin                  string `json:"PriceMin"`
	PriceMax                  string `json:"PriceMax"`
	Players                   string `json:"Players"`
	Holes                     string `json:"Holes"`
	FacilityType              string `json:"FacilityType"`
	RateType                  string `json:"RateType"`
	TimeMin                   string `json:"TimeMin"`
	TimeMax                   string `json:"TimeMax"`
	SortBy                    string `json:"SortBy"`
	SortDirection             string `json:"SortDirection"`
	SortByRollup              string `json:"SortByRollup"`
	View                      string `json:"View"`
	ExcludeFeaturedFacilities bool   `json:"ExcludeFeaturedFacilities"`
	TeeTimeCount              int    `json:"TeeTimeCount"`
	PromotedCampaignsOnly     string `json:"PromotedCampaignsOnly"`
}

type TeeTimesResponse struct {
	TTResults struct {
		Facilities []Facility `json:"facilities"`
	} `json:"ttResults"`
}

type Facility struct {
	ID               int     `json:"id"`
	Name             string  `json:"name"`
	Address          Address `json:"address"`
	NumberOfTeeTimes int     `json:"numberOfTeeTimes"`
	MinPrice         float64 `json:"minPrice"`
	MinDate          string  `json:"minDate"`
	MaxDate          string  `json:"maxDate"`
	AverageRating    float64 `json:"averageRating"`
}

type Address struct {
	City              string `json:"city"`
	StateProvinceCode string `json:"stateProvinceCode"`
}

func TeeTimes(request TeeTimesRequest) ([]Facility, error) {
	url := "https://www.golfnow.com/api/tee-times/tee-time-results"

	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var response TeeTimesResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	return response.TTResults.Facilities, nil
}
