package services

import (
	"YAMW/internal/database"
	"YAMW/internal/dto"
	helper "YAMW/internal/helpers"
	"fmt"
)

type ListServ struct {
	Subsonic *database.Subsonic
}

func NewListServ(subsonic *database.Subsonic) *ListServ{
	return &ListServ{Subsonic: subsonic}
}

func (l *ListServ) SGetRandomSongs() ([]dto.Song, error){
	endpoint := "getRandomSongs"
	rawSSURL := helper.CreateSSURL(endpoint)
	SSURL := fmt.Sprintf("%s&size=%s", rawSSURL, "50")
	
	return l.Subsonic.FetchRandomSongs(SSURL)
}