package main

import (
	"YAMW/internal/database"
	"YAMW/internal/handlers"
	"YAMW/internal/services"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()
	Subsonic := database.NewSubsonic()

	hpService := services.NewHPService(Subsonic)
	health := handlers.NewHealth(hpService)

	listServ := services.NewListServ(Subsonic)
	list := handlers.NewList(listServ)

	streamServ := services.NewStreamServ()
	stream := handlers.NewStream(streamServ)

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "YAMW",
		Width:     1024,
		Height:    768,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			health,
			list,
			stream,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
