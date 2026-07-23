import { useState, useEffect, useRef } from 'react';
import './App.css';
import { GetRandomSongs } from "../wailsjs/go/handlers/List";
import { GetStreamURL, GetCoverURL } from "../wailsjs/go/handlers/Stream";
import { dto } from "../wailsjs/go/models";

const CoverImage = ({ id, className }: { id: string, className?: string }) => {
    const [url, setUrl] = useState<string>('');
    useEffect(() => {
        let mounted = true;
        GetCoverURL(id).then(res => {
            if (mounted) setUrl(res);
        }).catch(console.error);
        return () => { mounted = false; };
    }, [id]);

    if (!url) return <div className={`cover-placeholder ${className || ''}`}></div>;
    return <img src={url} alt="Cover" className={className} />;
};

function App() {
    const [songs, setSongs] = useState<dto.Song[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Player state
    const [activeSongId, setActiveSongId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
    const [isLooping, setIsLooping] = useState<boolean>(false);
    const [isMix, setIsMix] = useState<boolean>(false);
    
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
        setIsPlayerOpen(true);

        if (activeSongId === song.id) {
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

    const togglePlayPause = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleEnded = () => {
        if (isLooping && audioRef.current) {
            audioRef.current.play();
            return;
        }

        if (isMix && songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            handlePlaySong(songs[randomIndex]);
            return;
        }

        setIsPlaying(false);
        setCurrentTime(0);
    };

    const activeSong = songs.find(s => s.id === activeSongId);

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
                                    <div className="song-info-container">
                                        <CoverImage id={song.id} className="list-cover" />
                                        <div className="song-info">
                                            <h2 className="song-title">
                                                {isPlaying && isActive ? "▶ " : ""}{song.title || "Unknown Title"}
                                            </h2>
                                            <p className="song-artist">{song.artist || "Unknown Artist"}</p>
                                        </div>
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

            {/* Player Overlay layer */}
            <div className={`player-overlay ${isPlayerOpen ? 'open' : ''}`}>
                <button className="player-close-btn" onClick={() => setIsPlayerOpen(false)} title="Close Player">
                    ↓
                </button>
                
                {activeSong && (
                    <div className="player-content">
                        <CoverImage id={activeSong.id} className="player-cover" />
                        
                        <div className="player-info">
                            <h2 className="player-title">{activeSong.title || "Unknown Title"}</h2>
                            <p className="player-artist">{activeSong.artist || "Unknown Artist"}</p>
                            <div className="player-progress">
                                <span>{formatDuration(currentTime)}</span>
                                <div className="progress-bar-bg">
                                    <div 
                                        className="progress-bar-fill" 
                                        style={{ width: `${activeSong.duration ? (currentTime / activeSong.duration) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span>{formatDuration(activeSong.duration)}</span>
                            </div>
                        </div>

                        <div className="player-controls">
                            <button 
                                className={`control-btn ${isMix ? 'active' : ''}`} 
                                onClick={(e) => { e.stopPropagation(); setIsMix(!isMix); }}
                                title="Mix / Shuffle"
                            >
                                🔀
                            </button>
                            <button 
                                className="control-btn play-pause" 
                                onClick={togglePlayPause}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? "⏸" : "▶"}
                            </button>
                            <button 
                                className={`control-btn ${isLooping ? 'active' : ''}`} 
                                onClick={(e) => { e.stopPropagation(); setIsLooping(!isLooping); }}
                                title="Loop"
                            >
                                🔁
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
