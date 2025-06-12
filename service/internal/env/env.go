package env

import (
	"os"
	"strings"
)

type Config struct {
	Env      string
	Password string
}

var Cfg = Config{
	Env:      getEnvOrDefault("ENV", "dev"),
	Password: getEnvOrDefault("PASSWORD", "admin"),
}

func getEnvOrDefault(key string, def string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		return def
	}
	return value
}

func (c Config) IsLocal() bool {
	return strings.EqualFold(c.Env, "local") || strings.EqualFold(c.Env, "test")
}
