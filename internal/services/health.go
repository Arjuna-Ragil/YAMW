package services

import (
	"YAMW/internal/database"
	helper "YAMW/internal/helpers"
	"fmt"
)

type HPService struct {
	Subsonic *database.Subsonic
}

func NewHPService(Subsonic *database.Subsonic) *HPService {
	return &HPService{Subsonic: Subsonic}
}

func (h *HPService) PingS(serverURL, username, password string) string {
	endpoint := "ping"

	salt := helper.GenerateSalt(6)
	token := helper.CreateToken(password, salt)

	SSURL := fmt.Sprintf("%s/rest/%s?u=%s&t=%s&s=%s&v=1.16.1&c=YAMW&f=json", serverURL, endpoint, username, token, salt)

	return h.Subsonic.FetchSubsonic(SSURL)
}
