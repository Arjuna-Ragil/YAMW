package database

import (
	"fmt"
	"io"
	"net/http"
)

type HPRepo struct {
}

func NewHPRepo() *HPRepo {
	return &HPRepo{}
}

func (h *HPRepo) PingR(SSURL string) string {
	res, err := http.Get(SSURL)
	if err != nil {
		fmt.Println("Failed to ping subsonic")
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
