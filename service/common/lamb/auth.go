package lamb

import (
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

func Authenticate(request events.APIGatewayProxyRequest, password string, isLocal bool) error {
	auth, ok := request.Headers["Authorization"]
	if !ok {
		return errors.New("authorization header not present")
	}
	encodedData, ok := strings.CutPrefix(auth, "Basic ")
	if !ok {
		return errors.New("authorization type Basic is required")
	}
	if isLocal {
		return nil
	}
	credsData, err := base64.StdEncoding.DecodeString(encodedData)
	if err != nil {
		return err
	}
	creds := strings.Split(string(credsData), ":")
	if len(creds) < 2 {
		return errors.New("missing password in basic authorization")
	}
	if creds[1] != password {
		return errors.New("incorrect password")
	}
	fmt.Printf("authenticated user: %s\n", creds[0])
	return nil
}
