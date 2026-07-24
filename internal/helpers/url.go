package helper

import (
	"fmt"
)

func CreateSSURL(endpoint string) string {
	config, err := LoadConfig(); if err != nil{
		return err.Error()
	}

	salt := GenerateSalt(6)
	token := CreateToken(config.Password, salt)

	SSURL := fmt.Sprintf("%s/rest/%s?u=%s&t=%s&s=%s&v=1.16.1&c=YAMW&f=json", config.ServerURL, endpoint, config.Username, token, salt)

	return SSURL
}