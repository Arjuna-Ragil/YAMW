package handlers

import (
	"YAMW/internal/dto"
	"YAMW/internal/services"
)

type List struct {
	ListServ *services.ListServ
}

func NewList(listServ *services.ListServ) *List{
	return &List{ListServ: listServ}
}

func (l *List) GetRandomSongs() ([]dto.Song, error){
	return l.ListServ.SGetRandomSongs()
}