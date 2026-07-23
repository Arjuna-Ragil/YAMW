import { useState, useEffect } from 'react';
import './App.css';
import { GetRandomSongs } from "../wailsjs/go/handlers/List";
import { GetStreamURL} from "../wailsjs/go/handlers/Stream";
import { dto } from "../wailsjs/go/models";

function App() {
    const [songs, setSongs] = useState<dto.Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const results = await GetRandomSongs();
                if (results) {
                    setSongs(results);
                }
            } catch (err) {
                console.error("Error fetching songs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSongs();
    }, []);

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>My Music Library</h1>
                <p>Discover your randomly selected tracks</p>
            </header>

            {/* 

            Dont Remove this, it is used as a button to test function from the backend
            
            <button onClick={() => GetStreamURL("7b308YAsUovOpTyufndR3h")}>TestStream</button> 
            
            */}
            
            <main className="main-content">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading your tunes...</p>
                    </div>
                ) : (
                    <div className="song-list">
                        {songs.length > 0 ? songs.map((song) => (
                            <div key={song.id} className="song-card">
                                <div className="song-info">
                                    <h2 className="song-title">{song.title || "Unknown Title"}</h2>
                                    <p className="song-artist">{song.artist || "Unknown Artist"}</p>
                                </div>
                                <div className="song-meta">
                                    {song.album && <span className="badge album">{song.album}</span>}
                                    {song.genre && <span className="badge genre">{song.genre}</span>}
                                    <span className="duration">{formatDuration(song.duration)}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-state">No songs found.</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
