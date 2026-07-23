import { useState, useEffect, useRef } from 'react';
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

    if (!url) return <div className={`bg-white/10 animate-pulse ${className || ''}`}></div>;
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
        <div className="max-w-250 mx-auto p-12 px-8 min-h-screen text-slate-100 font-outfit selection:bg-blue-500/30 [--wails-draggable:drag]">
            <header className="text-center mb-14 animate-[fadeInDown_0.8s_ease-out]">
                <h1 className="text-5xl font-bold mb-3 bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
                    My Music Library
                </h1>
                <p className="text-slate-400 text-lg font-light">
                    Discover your randomly selected tracks
                </p>
            </header>

            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleEnded} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                autoPlay
            />
            
            <main className="animate-[fadeIn_1s_ease-out]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-6 text-2xl text-slate-400 py-20 font-light">
                        <div className="w-10 h-10 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
                        <p>Loading your tunes...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {songs.length > 0 ? songs.map((song) => {
                            const isActive = song.id === activeSongId;
                            return (
                                <div 
                                    key={song.id} 
                                    className={`flex max-md:flex-col justify-between max-md:items-start items-center gap-4 bg-slate-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 px-6 transition-all duration-300 cursor-pointer shadow-md hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_12px_25px_-5px_rgba(0,0,0,0.3),0_0_15px_rgba(59,130,246,0.5)] hover:border-white/20 hover:bg-slate-700/85 [--wails-draggable:no-drag] ${
                                        isActive ? 'border-blue-500 bg-slate-700/95 shadow-[0_12px_25px_-5px_rgba(0,0,0,0.4),_0_0_20px_rgba(59,130,246,0.4)] -translate-y-1 scale-[1.02]' : ''
                                    }`}
                                    onClick={() => handlePlaySong(song)}
                                >
                                    <div className="flex items-center gap-5 flex-1 min-w-0 w-full">
                                        <CoverImage id={song.id} className="w-[60px] h-[60px] rounded-[10px] object-cover shrink-0 shadow-md" />
                                        <div className="flex flex-col gap-1.5 overflow-hidden w-full">
                                            <h2 className={`text-xl font-semibold m-0 truncate transition-colors duration-300 ${isActive ? 'text-blue-500' : 'text-slate-100'}`}>
                                                {isPlaying && isActive ? "▶ " : ""}{song.title || "Unknown Title"}
                                            </h2>
                                            <p className="text-base text-slate-400 m-0 font-normal truncate">{song.artist || "Unknown Artist"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 max-md:w-full max-md:justify-start max-md:flex-wrap">
                                        {song.album && <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-purple-500/10 text-purple-300 border border-purple-500/25">{song.album}</span>}
                                        {song.genre && <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-300 border border-blue-500/25">{song.genre}</span>}
                                        <span className="font-mono text-base text-slate-400 bg-black/25 px-2.5 py-1.5 rounded-lg min-w-[65px] text-center font-medium max-md:ml-auto">
                                            {isActive ? `${formatDuration(currentTime)} / ${formatDuration(song.duration)}` : formatDuration(song.duration)}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center gap-6 text-2xl text-slate-400 py-20 font-light">No songs found.</div>
                        )}
                    </div>
                )}
            </main>

            {/* Player Overlay layer */}
            <div className={`fixed top-full left-0 w-full h-screen bg-slate-900/85 backdrop-blur-[25px] z-50 transition-transform duration-500 flex flex-col p-8 pt-20 ${isPlayerOpen ? '-translate-y-full' : ''}`}>
                <button className="absolute top-8 left-8 bg-white/10 border border-white/10 text-white w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer text-[1.5rem] transition-all duration-300 hover:bg-white/20 hover:scale-105 z-[101] [--wails-draggable:no-drag]" onClick={() => setIsPlayerOpen(false)} title="Close Player">
                    ↓
                </button>
                
                {activeSong && (
                    <div className="flex flex-col items-center justify-center h-full max-w-[450px] mx-auto w-full">
                        <CoverImage id={activeSong.id} className="w-full aspect-square rounded-[20px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10" />
                        
                        <div className="text-center w-full mb-10">
                            <h2 className="text-[2.2rem] font-bold mb-2 text-slate-100">{activeSong.title || "Unknown Title"}</h2>
                            <p className="text-xl text-slate-400 mb-6">{activeSong.artist || "Unknown Artist"}</p>
                            <div className="flex items-center gap-4 w-full font-mono text-[0.9rem] text-slate-400 [--wails-draggable:no-drag]">
                                <span>{formatDuration(currentTime)}</span>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-[width] duration-100 linear" 
                                        style={{ width: `${activeSong.duration ? (currentTime / activeSong.duration) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span>{formatDuration(activeSong.duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-8 w-full [--wails-draggable:no-drag]">
                            <button 
                                className={`bg-transparent border-none text-[1.5rem] cursor-pointer transition-all duration-300 flex items-center justify-center w-[50px] h-[50px] rounded-full hover:text-slate-100 hover:bg-white/10 ${isMix ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400'}`} 
                                onClick={(e) => { e.stopPropagation(); setIsMix(!isMix); }}
                                title="Mix / Shuffle"
                            >
                                🔀
                            </button>
                            <button 
                                className="border-none text-[2rem] cursor-pointer transition-all duration-300 flex items-center justify-center w-[70px] h-[70px] rounded-full bg-blue-500 text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:scale-105 hover:bg-blue-600 hover:shadow-[0_10px_25px_rgba(59,130,246,0.5)]" 
                                onClick={togglePlayPause}
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? "⏸" : "▶"}
                            </button>
                            <button 
                                className={`bg-transparent border-none text-[1.5rem] cursor-pointer transition-all duration-300 flex items-center justify-center w-[50px] h-[50px] rounded-full hover:text-slate-100 hover:bg-white/10 ${isLooping ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400'}`} 
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
