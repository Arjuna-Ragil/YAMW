package handlers

import (
	"YAMW/internal/services"
)

type Health struct {
	HPService *services.HPService 
}

func NewHealth(hpService *services.HPService) *Health {
	return &Health{HPService: hpService}
}

func (h *Health) PingTest() string {
	return h.HPService.PingS()
}