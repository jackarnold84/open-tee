package handler

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGolfSearchReal(t *testing.T) {
	t.Skip("skipping real api call")

	req := TeeTimeSearchRequest{
		Date:         "2025-06-07",
		ZipCode:      "60607",
		Radius:       20,
		Holes:        18,
		Players:      2,
		DealsOnly:    true,
		PriceMax:     100,
		StartHourMin: 6,
		StartHourMax: 18,
	}
	res, err := TeeTimeSearch(req)
	assert.NoError(t, err)
	assert.NotEmpty(t, res.Courses)

	b, err := json.MarshalIndent(res, "", "  ")
	assert.NoError(t, err)
	fmt.Println(string(b))
	t.Fatal()
}
