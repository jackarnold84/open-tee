package ses

import (
	"bytes"
	"context"
	"html/template"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

const (
	region = "us-east-2"
)

type Email struct {
	FromAddress string
	ToAddress   string
	Subject     string
	Body        string
}

var sesClient = newClient()

func newClient() *sesv2.Client {
	cfg, _ := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	return sesv2.NewFromConfig(cfg)
}

func (e Email) Send(ctx context.Context) error {
	_, err := sesClient.SendEmail(ctx, &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(e.FromAddress),
		Destination: &types.Destination{
			ToAddresses: []string{e.ToAddress},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Data: aws.String(e.Subject),
				},
				Body: &types.Body{
					Html: &types.Content{
						Data: aws.String(e.Body),
					},
					Text: &types.Content{
						Data: aws.String(e.Body),
					},
				},
			},
		},
	})
	return err
}

func HtmlTemplate(tmpl string, data any) (string, error) {
	t, err := template.New("").Parse(tmpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}
