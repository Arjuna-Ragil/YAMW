import { useState, useEffect, useRef } from 'react';
import './App.css';
import { GetRandomSongs } from "../wailsjs/go/handlers/List";
import { GetStreamURL } from "../wailsjs/go/handlers/Stream";
import { dto } from "../wailsjs/go/models";

function App() {
    const [songs, setSongs] = useState<dto.Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSongId, setActiveSongId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);

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
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlaySong = async (song: dto.Song) => {
        if (activeSongId === song.id) {
            // Toggle play/pause if the same song is clicked again
            if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause();
                } else {
                    audioRef.current.play();
                }
            }
            return;
        }

        try {
            const url = await GetStreamURL(song.id);
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play();
                setActiveSongId(song.id);
                setIsPlaying(true);
            }
        } catch (err) {
            console.error("Failed to play song:", err);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>My Music Library</h1>
                <p>Discover your randomly selected tracks</p>
            </header>

            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleEnded} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                autoPlay
            />
            
            <main className="main-content">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading your tunes...</p>
                    </div>
                ) : (
                    <div className="song-list">
                        {songs.length > 0 ? songs.map((song) => {
                            const isActive = song.id === activeSongId;
                            return (
                                <div 
                                    key={song.id} 
                                    className={`song-card ${isActive ? 'active' : ''}`}
                                    onClick={() => handlePlaySong(song)}
                                >
                                    <div className="song-info">
                                        <h2 className="song-title">
                                            {isPlaying && isActive ? "▶ " : ""}{song.title || "Unknown Title"}
                                        </h2>
                                        <p className="song-artist">{song.artist || "Unknown Artist"}</p>
                                    </div>
                                    <div className="song-meta">
                                        {song.album && <span className="badge album">{song.album}</span>}
                                        {song.genre && <span className="badge genre">{song.genre}</span>}
                                        <span className="duration">
                                            {isActive ? `${formatDuration(currentTime)} / ${formatDuration(song.duration)}` : formatDuration(song.duration)}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="empty-state">No songs found.</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
