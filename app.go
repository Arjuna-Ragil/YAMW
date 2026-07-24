package main

import (
	helper "YAMW/internal/helpers"
	"context"
	"encoding/json"
	"fmt"
	"os"
)

type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) SaveConfig(serverURL, username, password string) error{
	config := helper.Config{
		ServerURL: serverURL,
		Username: username,
		Password: password,
	}

	filePath, err := helper.GetConfigPath(); if err != nil{
		return fmt.Errorf("%s", err)
	}

	data, err := json.MarshalIndent(config, "", "  "); if err != nil{
		return fmt.Errorf("Failed to convert data to json")
	}

	return os.WriteFile(filePath, data, 0644)
}
