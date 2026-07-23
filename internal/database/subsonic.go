package database

import (
	"YAMW/internal/dto"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Subsonic struct {}

func NewSubsonic() *Subsonic {
	return &Subsonic{}
}

func (s *Subsonic) FetchSubsonic(SSURL string) string {
	res, err := http.Get(SSURL)
	if err != nil {
		fmt.Println("Failed to fetch subsonic")
		return err.Error()
	}
	defer res.Body.Close()

	content, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("Failed to read content")
		return err.Error()
	}

	return string(content)
}

func (s *Subsonic) FetchRandomSongs(SSURL string) ([]dto.Song, error){
	res, err := http.Get(SSURL)
	if err != nil {
		return nil, fmt.Errorf("Failed to fetch subsonic: %s", err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)

	var data dto.SubsonicResponse

	err = json.Unmarshal(body, &data); if err != nil{
		return nil, fmt.Errorf("Failed to convert: %s", err)
	}

	return data.Response.RandomSongs.Song, nil
}