package env

import (
	_ "embed"
	"encoding/json"
	"fmt"
)

//go:embed accounts.json
var accountsJSON []byte

type Account struct {
	Username string `json:"username"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Accounts struct {
	Accounts []Account `json:"accounts"`
}

var accounts *Accounts

func init() {
	var acc Accounts
	err := json.Unmarshal(accountsJSON, &acc)
	if err != nil {
		panic(err)
	}
	accounts = &acc
}

func GetAccount(username string) (*Account, error) {
	for _, acc := range accounts.Accounts {
		if acc.Username == username {
			return &acc, nil
		}
	}
	return nil, fmt.Errorf("account not found: %s", username)
}
