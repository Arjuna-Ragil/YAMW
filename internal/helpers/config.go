package helper

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Config struct {
	ServerURL string
	Username  string
	Password  string
}

func GetConfigPath() (string, error){
	configDir, err := os.UserConfigDir(); if err != nil{
		return "", fmt.Errorf("Failed to get config directory")
	}

	appDir := filepath.Join(configDir, "YAMW")

	err = os.MkdirAll(appDir, 0755); if err != nil{
		return "", fmt.Errorf("Failed to make directory")
	}

	return filepath.Join(appDir, "config.json"), nil
}

func LoadConfig() (Config, error){
	var Config Config
	filepath, err := GetConfigPath(); if err != nil{
		return Config, fmt.Errorf("%s", err)
	}
	data, err := os.ReadFile(filepath); if err != nil{
		return Config, fmt.Errorf("Failed to read config file: %s", err)
	}

	err = json.Unmarshal(data, &Config)

	return Config, nil
	
}