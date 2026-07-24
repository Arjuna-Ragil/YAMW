import { useState, useEffect, useRef } from 'react';
import { GetRandomSongs } from "../wailsjs/go/handlers/List";
import { GetStreamURL, GetCoverURL } from "../wailsjs/go/handlers/Stream";
import { PingTest } from "../wailsjs/go/handlers/Health";
import { HasConfig, SaveConfig } from "../wailsjs/go/main/App";
import { dto } from "../wailsjs/go/models";
import { Shuffle, Repeat, Play, Pause } from 'lucide-react';

const CoverImage = ({ id, className }: { id: string, className?: string }) => {
    const [url, setUrl] = useState<string>('');
    useEffect(() => {
        let mounted = true;
        GetCoverURL(id).then(res => {
            if (mounted) setUrl(res);
        }).catch(console.error);
        return () => { mounted = false; };
    }, [id]);

    if (!url) return <div className={`bg-emerald-900/30 animate-pulse ${className || ''}`}></div>;
    return <img src={url} alt="Cover" className={className} />;
};

function App() {
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [serverUrl, setServerUrl] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [setupError, setSetupError] = useState<string>('');
    const [isTesting, setIsTesting] = useState<boolean>(false);

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
        HasConfig().then(has => {
            if (has) {
                setIsConfigured(true);
                fetchSongs();
            } else {
                setIsConfigured(false);
                setLoading(false);
            }
        }).catch(err => {
            console.error("Config check failed:", err);
            setIsConfigured(false);
            setLoading(false);
        });
    }, []);

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

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSetupError('');
        setIsTesting(true);
        try {
            const resStr = await PingTest(serverUrl, username, password);
            const res = JSON.parse(resStr);
            if (res["subsonic-response"] && res["subsonic-response"].status === "ok") {
                await SaveConfig(serverUrl, username, password);
                setIsConfigured(true);
                setLoading(true);
                fetchSongs();
            } else {
                setSetupError(res["subsonic-response"]?.error?.message || "Failed to connect.");
            }
        } catch (err: any) {
            setSetupError(err.toString() || "Connection error.");
        } finally {
            setIsTesting(false);
        }
    };

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

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>, duration: number) => {
        if (audioRef.current) {
            const bounds = e.currentTarget.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
            const newTime = percent * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // Show setup screen if config doesn't exist
    if (isConfigured === false) {
        return (
            <div className="w-[306px] h-[384px] bg-slate-950/90 backdrop-blur-md border border-emerald-900/50 shadow-2xl flex flex-col overflow-hidden text-emerald-400 [--wails-draggable:drag] relative rounded-xl mx-auto selection:bg-emerald-500/30 text-lg">
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] z-50"></div>
                <header className="px-3 py-2 border-b border-emerald-900/50 flex justify-between items-center bg-black/40 shrink-0 select-none">
                    <span className="text-xl font-bold tracking-wider">YAMW.exe</span>
                    <span className="text-sm tracking-widest opacity-70">SETUP</span>
                </header>
                <main className="flex-1 overflow-y-auto p-4 flex flex-col hide-scrollbar [--wails-draggable:no-drag] z-10">
                    <h2 className="text-xl font-bold mb-4 text-center text-emerald-300">SERVER CONFIG</h2>
                    <form onSubmit={handleSetup} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm">Server URL</label>
                            <input 
                                type="url" 
                                required 
                                value={serverUrl} 
                                onChange={e => setServerUrl(e.target.value)} 
                                className="bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-emerald-900"
                                placeholder="http://192.168.1.10:4533"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm">Username</label>
                            <input 
                                type="text" 
                                required 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                className="bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm">Password</label>
                            <input 
                                type="password" 
                                required 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="bg-black/50 border border-emerald-900/50 rounded px-2 py-1 text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        {setupError && <div className="text-red-400 text-sm mt-1 text-center bg-red-900/20 p-1 rounded border border-red-900/50">{setupError}</div>}
                        <button 
                            type="submit" 
                            disabled={isTesting}
                            className="mt-3 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 rounded py-2 text-center font-bold transition-colors disabled:opacity-50"
                        >
                            {isTesting ? "CONNECTING..." : "CONNECT & SAVE"}
                        </button>
                    </form>
                </main>
            </div>
        );
    }

    return (
        <div className="w-[306px] h-[384px] bg-slate-950/90 backdrop-blur-md border border-emerald-900/50 shadow-2xl flex flex-col overflow-hidden text-emerald-400 [--wails-draggable:drag] relative rounded-xl mx-auto selection:bg-emerald-500/30 text-lg">
            
            {/* CRT Screen Scanline effect overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] z-50"></div>

            <audio 
                ref={audioRef} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleEnded} 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                autoPlay
            />

            {/* Header */}
            <header className="px-3 py-2 border-b border-emerald-900/50 flex justify-between items-center bg-black/40 shrink-0 select-none">
                <span className="text-xl font-bold tracking-wider">YAMW.exe</span>
                <span className={`text-sm tracking-widest ${isPlaying ? 'animate-pulse text-emerald-300' : 'opacity-70'}`}>
                    {isPlaying ? 'PLAYING' : 'READY'}
                </span>
            </header>
            
            <main className="flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar [--wails-draggable:no-drag] z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-emerald-600/70 animate-pulse">
                        <p className="text-xl">LOADING...</p>
                    </div>
                ) : (
                    <>
                        {songs.length > 0 ? songs.map((song) => {
                            const isActive = song.id === activeSongId;
                            return (
                                <div 
                                    key={song.id} 
                                    className={`flex items-center gap-3 p-1.5 rounded cursor-pointer transition-all ${
                                        isActive ? 'bg-emerald-500/20 border-emerald-500/40' : 'hover:bg-emerald-900/30 border-transparent'
                                    } border`}
                                    onClick={() => handlePlaySong(song)}
                                >
                                    <CoverImage id={song.id} className="w-10 h-10 object-cover shrink-0 rounded-[4px] shadow-sm" />
                                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                                        <div className="truncate text-lg leading-none mb-1">
                                            {isPlaying && isActive ? "▶ " : ""}{song.title || "Unknown"}
                                        </div>
                                        <div className="truncate text-sm opacity-70 leading-none">
                                            {song.artist || "Unknown"}
                                        </div>
                                    </div>
                                    <span className="text-sm shrink-0 opacity-80 px-1">
                                        {formatDuration(song.duration)}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center h-full text-emerald-600/70">NO SONGS FOUND</div>
                        )}
                    </>
                )}
            </main>

            {/* Player Overlay layer */}
            <div className={`absolute bottom-0 left-0 w-full h-[340px] bg-black/95 backdrop-blur-xl border-t border-emerald-800/60 z-40 transition-transform duration-300 flex flex-col p-4 [--wails-draggable:no-drag] ${isPlayerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                <button 
                    className="absolute top-2 right-3 text-emerald-600 hover:text-emerald-300 text-[1.5rem] transition-colors cursor-pointer p-1" 
                    onClick={() => setIsPlayerOpen(false)}
                    title="Close Player"
                >
                    ▼
                </button>
                
                {activeSong && (
                    <div className="flex flex-col h-full items-center mt-6">
                        <CoverImage id={activeSong.id} className="w-[140px] h-[140px] object-cover rounded shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-5" />
                        
                        <div className="text-center w-full min-w-0 mb-5 px-2">
                            <div className="truncate text-xl font-bold text-emerald-300 mb-1">{activeSong.title || "Unknown"}</div>
                            <div className="truncate text-base text-emerald-600">{activeSong.artist || "Unknown"}</div>
                        </div>
                        
                        <div className="w-full flex items-center gap-3 text-sm text-emerald-600 mb-6 px-1">
                            <span>{formatDuration(currentTime)}</span>
                            <div 
                                className="flex-1 py-2 -my-2 cursor-pointer flex items-center group"
                                onClick={(e) => handleSeek(e, activeSong.duration)}
                            >
                                <div className="w-full h-1.5 bg-emerald-950 rounded-full overflow-hidden transition-all group-hover:h-2">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full transition-[width] duration-100" 
                                        style={{ width: `${activeSong.duration ? (currentTime / activeSong.duration) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span>{formatDuration(activeSong.duration)}</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-8 text-emerald-500 mt-auto mb-6">
                            <button 
                                className={`transition-colors cursor-pointer ${isMix ? 'text-emerald-300' : 'text-emerald-800 hover:text-emerald-600'}`} 
                                onClick={(e) => { e.stopPropagation(); setIsMix(!isMix); }}
                            >
                                <Shuffle size={26} />
                            </button>
                            <button 
                                className="hover:scale-110 transition-transform text-emerald-400 hover:text-emerald-300 flex items-center justify-center w-12 h-12 cursor-pointer" 
                                onClick={togglePlayPause}
                            >
                                {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                            </button>
                            <button 
                                className={`transition-colors cursor-pointer ${isLooping ? 'text-emerald-300' : 'text-emerald-800 hover:text-emerald-600'}`} 
                                onClick={(e) => { e.stopPropagation(); setIsLooping(!isLooping); }}
                            >
                                <Repeat size={26} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
