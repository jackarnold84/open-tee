package handler

import (
	"encoding/base64"
	"errors"
	"fmt"
	"opentee/internal/env"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

type AccountInfo struct {
	Username string `json:"username"`
	Name     string `json:"name"`
	Email    string `json:"email"`
}

func Authenticate(request events.APIGatewayProxyRequest) (*AccountInfo, error) {
	auth, ok := request.Headers["Authorization"]
	if !ok {
		return nil, errors.New("authorization header not present")
	}
	encodedData, ok := strings.CutPrefix(auth, "Basic ")
	if !ok {
		return nil, errors.New("authorization type Basic is required")
	}
	credsData, err := base64.StdEncoding.DecodeString(encodedData)
	if err != nil {
		return nil, err
	}
	creds := strings.Split(string(credsData), ":")
	if len(creds) < 2 {
		return nil, errors.New("missing username or password in basic authorization")
	}
	username := creds[0]
	password := creds[1]
	account, err := env.GetAccount(username)
	if err != nil {
		return nil, err
	}

	if account.Password != password {
		return nil, errors.New("incorrect password")
	}

	fmt.Printf("authenticated user: %s\n", username)
	return &AccountInfo{
		Username: account.Username,
		Name:     account.Name,
		Email:    account.Email,
	}, nil
}
