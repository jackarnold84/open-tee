package dynamo

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

const (
	region = "us-east-2"
)

type Table struct {
	TableName      string
	KeyName        string
	ConsistentRead bool
}

var dynamoClient = newClient()

func newClient() *dynamodb.Client {
	cfg, _ := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	return dynamodb.NewFromConfig(cfg)
}

func (t Table) GetItem(ctx context.Context, key string, v any) error {
	dbKey, _ := attributevalue.MarshalMap(map[string]string{t.KeyName: key})
	out, err := dynamoClient.GetItem(ctx, &dynamodb.GetItemInput{
		TableName:      aws.String(t.TableName),
		Key:            dbKey,
		ConsistentRead: aws.Bool(t.ConsistentRead),
	})
	if err != nil {
		return err
	}
	dbItem := out.Item

	err = attributevalue.UnmarshalMap(dbItem, v)
	return err
}

func (t Table) PutItem(ctx context.Context, item any) error {
	dbItem, _ := attributevalue.MarshalMap(item)
	_, err := dynamoClient.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(t.TableName),
		Item:      dbItem,
	})
	return err
}

func (t Table) DeleteItem(ctx context.Context, key string) error {
	dbKey, _ := attributevalue.MarshalMap(map[string]string{t.KeyName: key})
	_, err := dynamoClient.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(t.TableName),
		Key:       dbKey,
	})
	return err
}
