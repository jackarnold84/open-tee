package message

import (
	"context"
	"fmt"
	"opentee/common/dynamo"
	"opentee/common/ses"
	"opentee/internal/env"
)

type dynamoMessage struct {
	Key     string `dynamodbav:"key"`
	Message string `dynamodbav:"message"`
}

func GetSimpleMessage() string {
	return "magnificent"
}

func GetDynamoMessage(ctx context.Context) (string, error) {
	if env.Cfg.IsLocal() {
		return getMockDynamoMessage(), nil
	}

	appStateTable := dynamo.Table{
		TableName: "appState",
		KeyName:   "key",
	}
	var msg dynamoMessage
	err := appStateTable.GetItem(ctx, "test#message", &msg)
	return msg.Message, err
}

func SendEmailMessage(ctx context.Context) error {
	email := ses.Email{
		FromAddress: "praisedformula5@gmail.com",
		ToAddress:   "jarno.push@yahoo.com",
		Subject:     "Go Lambda Test",
		Body:        "Hello world from Go Lambda",
	}
	if env.Cfg.IsLocal() {
		mockSendEmailMessage(email)
		return nil
	}
	return email.Send(ctx)
}

// mocks
func getMockDynamoMessage() string {
	return "mocked dynamo message"
}

func mockSendEmailMessage(email ses.Email) {
	fmt.Println("mock sending email:")
	fmt.Printf("to: %s, from: %s\n", email.ToAddress, email.FromAddress)
	fmt.Printf("subject: %s\n", email.Subject)
	fmt.Printf("%s\n\n", email.Body)
}
