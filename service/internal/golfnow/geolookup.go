package golfnow

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

type GeoLookupRequest struct {
	SearchKey string `json:"searchkey"`
	Take      int    `json:"take"`
}

type Geo struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

type GeoLookupHit struct {
	Geo Geo `json:"geo"`
}

type GeoLookupResponse struct {
	Hits []GeoLookupHit `json:"hits"`
}

func GetGeoCoordinates(searchKey string) (Geo, error) {
	url := "https://www.golfnow.com/api/autocomplete/geolookup"

	reqBody := GeoLookupRequest{
		SearchKey: searchKey,
		Take:      1,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return Geo{}, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return Geo{}, err
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("content-type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return Geo{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return Geo{}, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var geoResp GeoLookupResponse
	if err := json.NewDecoder(resp.Body).Decode(&geoResp); err != nil {
		return Geo{}, err
	}

	if len(geoResp.Hits) == 0 {
		return Geo{}, errors.New("no hits found")
	}

	return geoResp.Hits[0].Geo, nil
}
