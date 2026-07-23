package dto

type Song struct{
	ID string `json:"id"`
	Title string `json:"title"`
	Album string `json:"album"`
	Artist string `json:"artist"`
	Genre string `json:"genre"`
	CoverArt string `json:"coverArt"`
	Duration int `json:"duration"`
}

type SubsonicResponse struct {
	Response struct{
		RandomSongs struct{
			Song []Song `json:"song"`
		} `json:"randomSongs"`
	} `json:"subsonic-response"`
}