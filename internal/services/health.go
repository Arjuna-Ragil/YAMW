package services

import (
	"YAMW/internal/database"
	helper "YAMW/internal/helpers"
)

type HPService struct {
	HPRepo *database.HPRepo
}

func NewHPService(hpRepo *database.HPRepo) *HPService {
	return &HPService{HPRepo: hpRepo}
}

func (h *HPService) PingS() string{
	endpoint := "ping"
	SSURL := helper.CreateSSURL(endpoint)

	return h.HPRepo.PingR(SSURL)
}