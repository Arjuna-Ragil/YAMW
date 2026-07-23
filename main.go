package main

import (
	"YAMW/internal/database"
	"YAMW/internal/handlers"
	"YAMW/internal/services"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
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
		AlwaysOnTop: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			health,
			list,
			stream,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			BackdropType:         windows.Acrylic, 
		},
		Mac: &mac.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
