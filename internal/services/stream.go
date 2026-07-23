package services

import (
	helper "YAMW/internal/helpers"
	"fmt"
)

type StreamServ struct{}

func NewStreamServ() *StreamServ {
	return &StreamServ{}
}

func (s *StreamServ) CreateStream(id string) string{
	endpoint := "stream"
	rawSSURL := helper.CreateSSURL(endpoint)
	SSURL := fmt.Sprintf("%s&id=%s", rawSSURL, id)

	return SSURL
}

func (s *StreamServ) CreateCover(id string) string{
	endpoint := "getCoverArt"
	rawSSURL := helper.CreateSSURL(endpoint)
	SSURL := fmt.Sprintf("%s&id=%s", rawSSURL, id)

	return SSURL
}