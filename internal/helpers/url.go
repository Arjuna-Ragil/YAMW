package helper

import (
	"fmt"
)

func CreateSSURL(endpoint string) string {
	serverURL := LoadConfig().ServerURL
	username := LoadConfig().Username
	password := LoadConfig().Password

	salt := GenerateSalt(6)
	token := CreateToken(password, salt)

	SSURL := fmt.Sprintf("%s/rest/%s?u=%s&t=%s&s=%s&v=1.16.1&c=YAMW&f=json", serverURL, endpoint, username, token, salt)

	return SSURL
}