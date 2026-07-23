package helper

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerURL string
	Username  string
	Password  string
}

func LoadConfig() Config{
	err := godotenv.Load(); if err != nil{
		fmt.Println("Failed to load env, using system env", err)
	}
	return Config{
		ServerURL: getEnv("SERVER_URL", "http://127.0.0.1:4533"),
		Username: getEnv("USERNAME", "admin"),
		Password: getEnv("PASSWORD", "admin"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}