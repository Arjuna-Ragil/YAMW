import { useState, useEffect, useRef } from 'react';
import { GetRandomSongs } from "../wailsjs/go/handlers/List";
import { GetStreamURL, GetCoverURL } from "../wailsjs/go/handlers/Stream";
import { PingTest } from "../wailsjs/go/handlers/Health";
import { HasConfig, SaveConfig } from "../wailsjs/go/main/App";
import { dto } from "../wailsjs/go/models";
import { Shuffle, Repeat, Play, Pause, Repeat1, Volume2, VolumeX, Palette, Settings, X } from 'lucide-react';

const themes: Record<string, any> = {
    emerald: {
        base: 'text-emerald-400', muted: 'text-emerald-600', accent: 'text-emerald-300', dark: 'text-emerald-800',
        border: 'border-emerald-900/50', borderLight: 'border-emerald-800/60', borderActive: 'border-emerald-500/40',
        bgDark: 'bg-emerald-950', bgMuted: 'bg-emerald-900/30', bgActive: 'bg-emerald-500/20', bgHover: 'hover:bg-emerald-900/30',
        accentColor: 'accent-emerald-500', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', selection: 'selection:bg-emerald-500/30',
        dot: 'bg-emerald-500'
    },
    red: {
        base: 'text-red-400', muted: 'text-red-600', accent: 'text-red-300', dark: 'text-red-800',
        border: 'border-red-900/50', borderLight: 'border-red-800/60', borderActive: 'border-red-500/40',
        bgDark: 'bg-red-950', bgMuted: 'bg-red-900/30', bgActive: 'bg-red-500/20', bgHover: 'hover:bg-red-900/30',
        accentColor: 'accent-red-500', shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]', selection: 'selection:bg-red-500/30',
        dot: 'bg-red-500'
    },
    orange: {
        base: 'text-orange-400', muted: 'text-orange-600', accent: 'text-orange-300', dark: 'text-orange-800',
        border: 'border-orange-900/50', borderLight: 'border-orange-800/60', borderActive: 'border-orange-500/40',
        bgDark: 'bg-orange-950', bgMuted: 'bg-orange-900/30', bgActive: 'bg-orange-500/20', bgHover: 'hover:bg-orange-900/30',
        accentColor: 'accent-orange-500', shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]', selection: 'selection:bg-orange-500/30',
        dot: 'bg-orange-500'
    },
    blue: {
        base: 'text-blue-400', muted: 'text-blue-600', accent: 'text-blue-300', dark: 'text-blue-800',
        border: 'border-blue-900/50', borderLight: 'border-blue-800/60', borderActive: 'border-blue-500/40',
        bgDark: 'bg-blue-950', bgMuted: 'bg-blue-900/30', bgActive: 'bg-blue-500/20', bgHover: 'hover:bg-blue-900/30',
        accentColor: 'accent-blue-500', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', selection: 'selection:bg-blue-500/30',
        dot: 'bg-blue-500'
    },
    cyan: {
        base: 'text-cyan-400', muted: 'text-cyan-600', accent: 'text-cyan-300', dark: 'text-cyan-800',
        border: 'border-cyan-900/50', borderLight: 'border-cyan-800/60', borderActive: 'border-cyan-500/40',
        bgDark: 'bg-cyan-950', bgMuted: 'bg-cyan-900/30', bgActive: 'bg-cyan-500/20', bgHover: 'hover:bg-cyan-900/30',
        accentColor: 'accent-cyan-500', shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]', selection: 'selection:bg-cyan-500/30',
        dot: 'bg-cyan-500'
    },
    white: {
        base: 'text-slate-300', muted: 'text-slate-500', accent: 'text-white', dark: 'text-slate-700',
        border: 'border-slate-700/50', borderLight: 'border-slate-600/60', borderActive: 'border-slate-400/40',
        bgDark: 'bg-slate-900', bgMuted: 'bg-slate-800/30', bgActive: 'bg-slate-700/40', bgHover: 'hover:bg-slate-800/50',
        accentColor: 'accent-slate-400', shadow: 'shadow-[0_0_20px_rgba(255,255,255,0.1)]', selection: 'selection:bg-slate-500/30',
        dot: 'bg-slate-300'
    }
};

const CoverImage = ({ id, className, t }: { id: string, className?: string, t: any }) => {
    const [url, setUrl] = useState<string>('');
    useEffect(() => {
        let mounted = true;
        GetCoverURL(id).then(res => {
            if (mounted) setUrl(res);
        }).catch(console.error);
        return () => { mounted = false; };
    }, [id]);

    if (!url) return <div className={`${t.bgMuted} animate-pulse ${className || ''}`}></div>;
    return <img src={url} alt="Cover" className={className} />;
};

function App() {
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [serverUrl, setServerUrl] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [setupError, setSetupError] = useState<string>('');
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const [currentTheme, setCurrentTheme] = useState<string>('emerald');
    const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

    const [songs, setSongs] = useState<dto.Song[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Player state
    const [activeSongId, setActiveSongId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
    const [loopMode, setLoopMode] = useState<number>(0); // 0 = off, 1 = all, 2 = one
    const [isMix, setIsMix] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(1);
    const [showVolume, setShowVolume] = useState<boolean>(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);

    const t = themes[currentTheme];

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

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
        setLoading(true);
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
                setShowSettings(false);
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
        if (loopMode === 2 && audioRef.current) {
            audioRef.current.play();
            return;
        }

        if (isMix && songs.length > 0) {
            const randomIndex = Math.floor(Math.random() * songs.length);
            handlePlaySong(songs[randomIndex]);
            return;
        }

        if (songs.length > 0 && activeSongId) {
            const currentIndex = songs.findIndex(s => s.id === activeSongId);
            if (currentIndex !== -1) {
                const isLast = currentIndex === songs.length - 1;
                if (!isLast) {
                    handlePlaySong(songs[currentIndex + 1]);
                    return;
                } else if (loopMode === 1) {
                    handlePlaySong(songs[0]);
                    return;
                }
            }
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

    const renderSetupForm = (isOverlay = false) => (
        <div className={`flex flex-col h-full ${isOverlay ? 'p-6 bg-black/95 backdrop-blur-xl absolute inset-0 z-[60]' : 'p-4 flex-1'}`}>
            {isOverlay && (
                <button 
                    onClick={() => setShowSettings(false)} 
                    className={`absolute top-4 right-4 ${t.muted} hover:${t.base} transition-colors`}
                >
                    <X size={24} />
                </button>
            )}
            <h2 className={`text-xl font-bold mb-4 text-center ${t.accent}`}>SERVER CONFIG</h2>
            <form onSubmit={handleSetup} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-sm">Server URL</label>
                    <input 
                        type="url" 
                        required 
                        value={serverUrl} 
                        onChange={e => setServerUrl(e.target.value)} 
                        className={`bg-black/50 border ${t.border} rounded px-2 py-1 ${t.base} focus:outline-none focus:${t.borderActive} transition-colors placeholder:opacity-30`}
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
                        className={`bg-black/50 border ${t.border} rounded px-2 py-1 ${t.base} focus:outline-none focus:${t.borderActive} transition-colors`}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm">Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className={`bg-black/50 border ${t.border} rounded px-2 py-1 ${t.base} focus:outline-none focus:${t.borderActive} transition-colors`}
                    />
                </div>
                {setupError && <div className="text-red-400 text-sm mt-1 text-center bg-red-900/20 p-1 rounded border border-red-900/50">{setupError}</div>}
                <button 
                    type="submit" 
                    disabled={isTesting}
                    className={`mt-3 ${t.bgMuted} ${t.bgHover} border ${t.border} rounded py-2 text-center font-bold transition-colors disabled:opacity-50`}
                >
                    {isTesting ? "CONNECTING..." : "CONNECT & SAVE"}
                </button>
            </form>
        </div>
    );

    if (isConfigured === false) {
        return (
            <div className={`w-[306px] h-[384px] bg-slate-950/90 backdrop-blur-md border ${t.border} shadow-2xl flex flex-col overflow-hidden ${t.base} [--wails-draggable:drag] relative rounded-xl mx-auto ${t.selection} text-lg`}>
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.8)_50%)] bg-[length:100%_4px] z-50"></div>
                <header className={`px-3 py-2 border-b ${t.border} flex justify-between items-center bg-black/40 shrink-0 select-none`}>
                    <span className="text-xl font-bold tracking-wider">YAMW.exe</span>
                    <span className="text-sm tracking-widest opacity-70">SETUP</span>
                </header>
                <main className="flex-1 overflow-y-auto hide-scrollbar [--wails-draggable:no-drag] z-10 flex flex-col">
                    {renderSetupForm(false)}
                </main>
            </div>
        );
    }

    return (
        <div className={`w-[306px] h-[384px] bg-slate-950/90 backdrop-blur-md border ${t.border} shadow-2xl flex flex-col overflow-hidden ${t.base} [--wails-draggable:drag] relative rounded-xl mx-auto ${t.selection} text-lg`}>
            
            {showSettings && renderSetupForm(true)}

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
            <header className={`px-3 py-2 border-b ${t.border} flex justify-between items-center bg-black/40 shrink-0 select-none`}>
                <span className="text-xl font-bold tracking-wider">YAMW.exe</span>
                
                <div className="flex items-center gap-3 [--wails-draggable:no-drag]">
                    <span className={`text-sm tracking-widest ${isPlaying ? `animate-pulse ${t.accent}` : 'opacity-70'}`}>
                        {isPlaying ? 'PLAYING' : 'READY'}
                    </span>
                    
                    <div className="relative flex items-center">
                        <button 
                            onClick={() => setShowThemePicker(!showThemePicker)}
                            className={`${t.muted} hover:${t.base} transition-colors cursor-pointer`}
                        >
                            <Palette size={16} />
                        </button>
                        {showThemePicker && (
                            <div className={`absolute right-0 top-full mt-2 p-3 bg-slate-950 border ${t.border} rounded-lg shadow-2xl z-50 grid grid-cols-3 gap-3 w-[120px]`}>
                                {Object.keys(themes).map(key => (
                                    <button 
                                        key={key} 
                                        onClick={() => { setCurrentTheme(key); setShowThemePicker(false); }}
                                        className={`w-6 h-6 shrink-0 rounded-full ${themes[key].dot} border-2 ${currentTheme === key ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform cursor-pointer`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setShowSettings(true)}
                        className={`${t.muted} hover:${t.base} transition-colors cursor-pointer`}
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </header>
            
            <main className={`flex-1 overflow-y-auto p-2 space-y-1 hide-scrollbar [--wails-draggable:no-drag] z-10 ${activeSong ? 'pb-16' : ''}`}>
                {loading ? (
                    <div className={`flex flex-col items-center justify-center h-full gap-3 ${t.muted} animate-pulse`}>
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
                                        isActive ? `${t.bgActive} ${t.borderActive}` : `${t.bgHover} border-transparent`
                                    } border`}
                                    onClick={() => handlePlaySong(song)}
                                >
                                    <CoverImage id={song.id} className="w-10 h-10 object-cover shrink-0 rounded-[4px] shadow-sm" t={t} />
                                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                                        <div className="truncate text-lg leading-none mb-1">
                                            {isPlaying && isActive ? "▶ " : ""}{song.title || "Unknown"}
                                        </div>
                                        <div className={`truncate text-sm opacity-70 leading-none ${t.muted}`}>
                                            {song.artist || "Unknown"}
                                        </div>
                                    </div>
                                    <span className="text-sm shrink-0 opacity-80 px-1">
                                        {formatDuration(song.duration)}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className={`flex flex-col items-center justify-center h-full ${t.muted}`}>NO SONGS FOUND</div>
                        )}
                    </>
                )}
            </main>

            {/* Mini Player Bar */}
            {activeSong && (
                <div 
                    className={`absolute bottom-0 left-0 w-full p-2 bg-slate-950/95 backdrop-blur-xl border-t ${t.borderLight} z-30 cursor-pointer flex items-center gap-3 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 [--wails-draggable:no-drag] ${isPlayerOpen ? 'translate-y-full' : 'translate-y-0'}`}
                    onClick={() => setIsPlayerOpen(true)}
                >
                    <CoverImage id={activeSong.id} className="w-10 h-10 rounded-sm object-cover shrink-0" t={t} />
                    <div className="flex flex-col min-w-0 flex-1">
                        <div className={`truncate text-sm font-bold ${t.accent}`}>{activeSong.title || "Unknown"}</div>
                        <div className={`truncate text-xs ${t.muted}`}>{activeSong.artist || "Unknown"}</div>
                    </div>
                    <button 
                        className={`mr-2 shrink-0 ${t.base} hover:${t.accent} transition-transform hover:scale-110 cursor-pointer`}
                        onClick={(e) => { e.stopPropagation(); togglePlayPause(e); }}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>
                </div>
            )}

            {/* Player Overlay layer */}
            <div className={`absolute bottom-0 left-0 w-full h-[340px] bg-black/95 backdrop-blur-xl border-t ${t.borderLight} z-40 transition-transform duration-300 flex flex-col p-4 [--wails-draggable:no-drag] ${isPlayerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                <button 
                    className={`absolute top-2 right-3 ${t.muted} hover:${t.accent} text-[1.5rem] transition-colors cursor-pointer p-1`} 
                    onClick={() => setIsPlayerOpen(false)}
                    title="Close Player"
                >
                    ▼
                </button>
                
                {activeSong && (
                    <div className="flex flex-col h-full items-center mt-6">
                        <CoverImage id={activeSong.id} className={`w-[140px] h-[140px] object-cover rounded ${t.shadow} mb-5`} t={t} />
                        
                        <div className="text-center w-full min-w-0 mb-5 px-2">
                            <div className={`truncate text-xl font-bold ${t.accent} mb-1`}>{activeSong.title || "Unknown"}</div>
                            <div className={`truncate text-base ${t.muted}`}>{activeSong.artist || "Unknown"}</div>
                        </div>
                        
                        <div className={`w-full flex items-center gap-3 text-sm ${t.muted} mb-6 px-1`}>
                            <span>{formatDuration(currentTime)}</span>
                            <div 
                                className="flex-1 py-2 -my-2 cursor-pointer flex items-center group"
                                onClick={(e) => handleSeek(e, activeSong.duration)}
                            >
                                <div className={`w-full h-1.5 ${t.bgDark} rounded-full overflow-hidden transition-all group-hover:h-2`}>
                                    <div 
                                        className={`h-full ${t.bgAccent} rounded-full transition-[width] duration-100`}
                                        style={{ width: `${activeSong.duration ? (currentTime / activeSong.duration) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                            <span>{formatDuration(activeSong.duration)}</span>
                        </div>
                        
                        <div className={`flex items-center justify-center gap-6 ${t.accent} mt-auto mb-6 relative`}>
                            <button 
                                className={`transition-colors cursor-pointer ${isMix ? t.accent : `${t.dark} hover:${t.muted}`}`} 
                                onClick={(e) => { e.stopPropagation(); setIsMix(!isMix); }}
                            >
                                <Shuffle size={24} />
                            </button>
                            <button 
                                className={`hover:scale-110 transition-transform ${t.base} hover:${t.accent} flex items-center justify-center w-12 h-12 cursor-pointer`} 
                                onClick={togglePlayPause}
                            >
                                {isPlaying ? <Pause size={36} /> : <Play size={36} className="ml-1" />}
                            </button>
                            <button 
                                className={`transition-colors cursor-pointer ${loopMode !== 0 ? t.accent : `${t.dark} hover:${t.muted}`}`} 
                                onClick={(e) => { e.stopPropagation(); setLoopMode((prev) => (prev + 1) % 3); }}
                            >
                                {loopMode === 2 ? <Repeat1 size={24} /> : <Repeat size={24} />}
                            </button>
                            <div className="relative flex items-center">
                                <button 
                                    className={`transition-colors cursor-pointer ${showVolume ? t.base : `${t.dark} hover:${t.muted}`}`}
                                    onClick={(e) => { e.stopPropagation(); setShowVolume(!showVolume); }}
                                >
                                    {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                </button>
                                {showVolume && (
                                    <div 
                                        className={`absolute bottom-full right-[-10px] mb-3 p-3 bg-slate-950 border ${t.border} rounded-lg shadow-2xl z-50 flex flex-col items-center gap-2`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className={`text-xs ${t.muted} font-bold`}>{Math.round(volume * 100)}%</div>
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.01" 
                                            value={volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className={`w-24 h-1.5 ${t.bgDark} rounded-lg appearance-none cursor-pointer ${t.accentColor}`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
