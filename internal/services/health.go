package services

import (
	"YAMW/internal/database"
	helper "YAMW/internal/helpers"
)

type HPService struct {
	Subsonic *database.Subsonic
}

func NewHPService(Subsonic *database.Subsonic) *HPService {
	return &HPService{Subsonic: Subsonic}
}

func (h *HPService) PingS() string {
	endpoint := "ping"
	SSURL := helper.CreateSSURL(endpoint)

	return h.Subsonic.FetchSubsonic(SSURL)
}
