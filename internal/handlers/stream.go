package handlers

import "YAMW/internal/services"

type Stream struct {
	StreamServ *services.StreamServ
}

func NewStream(streamServ *services.StreamServ) *Stream{
	return &Stream{StreamServ: streamServ}
}

func (s *Stream) GetStreamURL(id string) string{
	return s.StreamServ.CreateStream(id)
}