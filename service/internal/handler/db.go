package handler

import (
	"context"
	"opentee/common/dynamo"
)

const (
	OpenTeeTable    = "OpenTeeTable"
	OpenTeeTableKey = "key"
)

type AlertItem struct {
	AlertID       string                `dynamodbav:"key" json:"alertId"`
	AlertOptions  AlertOptions          `dynamodbav:"alertOptions" json:"alertOptions"`
	TeeTimeSearch TeeTimeSearchRequest  `dynamodbav:"teeTimeSearch" json:"teeTimeSearch"`
	Result        TeeTimeSearchResponse `dynamodbav:"result" json:"result"`
}

type alertDB struct {
	table dynamo.Table
}

func AlertDB() alertDB {
	return alertDB{
		table: dynamo.Table{
			TableName: OpenTeeTable,
			KeyName:   OpenTeeTableKey,
		},
	}
}

func (db alertDB) Put(ctx context.Context, item AlertItem) error {
	return db.table.PutItem(ctx, item)
}

func (db alertDB) Delete(ctx context.Context, alertID string) error {
	return db.table.DeleteItem(ctx, alertID)
}

func (db alertDB) Scan(ctx context.Context, limit int, out *[]AlertItem) error {
	return db.table.ScanItems(ctx, limit, out)
}
