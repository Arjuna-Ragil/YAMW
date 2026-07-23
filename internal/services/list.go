package services

import (
	"YAMW/internal/database"
	"YAMW/internal/dto"
	helper "YAMW/internal/helpers"
)

type ListServ struct {
	Subsonic *database.Subsonic
}

func NewListServ(subsonic *database.Subsonic) *ListServ{
	return &ListServ{Subsonic: subsonic}
}

func (l *ListServ) SGetRandomSongs() ([]dto.Song, error){
	endpoint := "getRandomSongs"
	SSURL := helper.CreateSSURL(endpoint)
	
	return l.Subsonic.FetchRandomSongs(SSURL)
}