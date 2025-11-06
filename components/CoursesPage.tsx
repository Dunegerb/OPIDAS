import React, { useState, useEffect, useRef } from 'react';

interface Episode {
    id: number;
    title: string;
    description: string;
    duration: string;
    episodeNumber: number;
    image: string;
    progress: number;
    videoUrl: string;
    trackUrl?: string;
}

const initialEpisodes: Episode[] = [
    { id: 1, title: "Os primórdios", description: "Entendendo a evolução do cérebro e como ele foi programado para se auto-satisfazer.", duration: "32 min", episodeNumber: 1, image: "https://c.animaapp.com/dWBnxj7P/img/rectangle-35@2x.png", progress: 0, videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", trackUrl: "https://raw.githubusercontent.com/andreybleme/legendas/main/big-buck-bunny/pt-br.vtt" },
    { id: 2, title: "Obtendo a visão clara", description: "Entenda como criar uma visão clara de quem quer se tornar e com isso ter uma o norte para sua vida de sucesso.", duration: "35 min", episodeNumber: 2, image: "https://c.animaapp.com/dWBnxj7P/img/rectangle-36@2x.png", progress: 0, videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    { id: 3, title: "Entendendo o vício", description: "Como o cérebro constroe um caminho neural para sempre buscar pelo confortável e fácil?", duration: "42 min", episodeNumber: 3, image: "https://c.animaapp.com/dWBnxj7P/img/rectangle-37@2x.png", progress: 0, videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
    { id: 4, title: "A cirurgia na alma", description: "Saiba como fazer a cirurgia na alma, e veja essa filosofia de vida mudar o rumo do seu futuro.", duration: "49 min", episodeNumber: 4, image: "https://c.animaapp.com/dWBnxj7P/img/rectangle-38@2x.png", progress: 0, videoUrl: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
];

const STORAGE_KEY = 'opidasEpisodeProgress';

const CoursesPage: React.FC = () => {
    const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

    useEffect(() => {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            setEpisodes(prevEpisodes =>
                prevEpisodes.map(ep => {
                    const savedEp = progressData.find((p: { id: number; }) => p.id === ep.id);
                    return savedEp ? { ...ep, progress: savedEp.progress } : ep;
                })
            );
        }
    }, []);

    const saveProgress = (updatedEpisodes: Episode[]) => {
        const progressToSave = updatedEpisodes.map(ep => ({ id: ep.id, progress: ep.progress }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressToSave));
    };
    
    const handleProgressUpdate = (episodeId: number, newProgress: number) => {
        const updatedEpisodes = episodes.map(ep => 
            ep.id === episodeId ? { ...ep, progress: newProgress > 95 ? 100 : newProgress } : ep
        );
        setEpisodes(updatedEpisodes);
    };

    const openPlayer = (episode: Episode) => {
        setCurrentEpisode(episode);
    };

    const closePlayer = () => {
        saveProgress(episodes);
        setCurrentEpisode(null);
    };

    return (
        <div className="bg-[#0b0b0a] min-h-screen text-[#eeeeee] p-5 sm:p-10 font-['Inter',_sans-serif]">
            <div className="max-w-[1280px] mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 md:mb-24 relative">
                    <div className="flex items-center gap-4">
                        <img src="https://c.animaapp.com/dWBnxj7P/img/profile-photo@2x.png" alt="Profile" className="w-[34px] h-[34px] rounded-full"/>
                        <div>
                            <div className="text-xs text-[#d9d9d9]">Bem vindo(a) de volta</div>
                            <div className="text-xl font-medium text-[#d9d9d9] leading-tight">Soldado Stravelli</div>
                        </div>
                    </div>
                    <img className="logo absolute left-1/2 -translate-x-1/2 hidden md:block w-[41px] h-[41px]" src="https://c.animaapp.com/dWBnxj7P/img/campologo@4x.png" alt="Logo"/>
                    <div className="bg-[#151515] rounded-lg p-2 flex items-center gap-4 mt-4 md:mt-0">
                        <div className="bg-[#0b0b0a] w-[41px] h-[41px] rounded-md flex justify-center items-center">
                            <img src="https://c.animaapp.com/dWBnxj7P/img/recruta@2x.png" alt="Ícone de Recruta" className="w-[21px] h-[19px]"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm">07<span className="text-[#909090]">/09 Dias</span></p>
                            <div className="w-[116px] h-[9px] bg-[#7a7a7a] rounded-full"><div className="w-[78%] h-full bg-[#eeeeeee8] rounded-full"></div></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <img src="https://c.animaapp.com/dWBnxj7P/img/notifica--obutton@2x.png" alt="Notifications" className="w-[41px] h-[41px] cursor-pointer"/>
                            <img src="https://c.animaapp.com/dWBnxj7P/img/light-darkmode@2x.png" alt="Theme" className="w-[41px] h-[41px] cursor-pointer"/>
                        </div>
                    </div>
                </header>

                <section className="relative">
                     <div className="absolute top-[-48px] left-[5%] right-[5%] h-[13px] items-center hidden xl:flex">
                        <div className="w-full h-[1px] bg-[#444] absolute top-1/2 -translate-y-1/2"></div>
                        <div className="w-full flex justify-between relative z-10">
                            {[ 'bg-[#dfdfdf]', 'bg-[#a3a3a2]', 'bg-[#676766]', 'bg-[#2d2d2b]'].map((color, i) => (
                                <div key={i} className={`w-[13px] h-[13px] rounded-full border-2 border-[#0b0b0a] ${color}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
                        {episodes.map(episode => (
                            <EpisodeCard key={episode.id} episode={episode} onPlay={openPlayer} />
                        ))}
                    </div>
                </section>
            </div>
            {currentEpisode && <VideoPlayer episode={currentEpisode} onClose={closePlayer} onProgressUpdate={handleProgressUpdate} />}
        </div>
    );
};

interface EpisodeCardProps {
    episode: Episode;
    onPlay: (episode: Episode) => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onPlay }) => {
    return (
        <div className="cursor-pointer group" onClick={() => onPlay(episode)}>
            <h3 className="text-xl font-medium mb-5 truncate">{episode.title}</h3>
            <p className="text-sm font-light leading-tight h-14 mb-6 text-[#d9d9d9]">{episode.description}</p>
            <div className={`relative rounded-lg overflow-hidden ${episode.progress === 0 ? 'mix-blend-luminosity' : ''}`}>
                <img src={episode.image} alt={episode.title} className="w-full h-[333px] object-cover transition-transform duration-300 group-hover:scale-105"/>
                <div className="absolute bottom-5 left-5 right-5">
                    <div className="flex items-center gap-1 text-xs mb-2.5">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-2 h-2"><path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.3-208-208S141.3 48 256 48s208 93.3 208 208S370.7 464 256 464zM328 272H256c-4.4 0-8-3.6-8-8V144c0-4.4 3.6-8 8-8s8 3.6 8 8v112h64c4.4 0 8 3.6 8 8s-3.6 8-8 8z"/></svg>
                        <span>{episode.duration} • Episódio {episode.episodeNumber}</span>
                    </div>
                    <div className="w-full h-[5px] bg-[#7a7a7a] rounded-full mix-blend-difference">
                        <div className="h-full bg-[#eeeeee] rounded-full" style={{ width: `${episode.progress}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface VideoPlayerProps {
    episode: Episode;
    onClose: () => void;
    onProgressUpdate: (episodeId: number, progress: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ episode, onClose, onProgressUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);

    const formatTime = (s: number) => (isNaN(s) ? "00:00" : new Date(s * 1000).toISOString().substr(14, 5));

    const togglePlay = () => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause();

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            const startTime = (episode.progress / 100) * video.duration;
            if (startTime < video.duration - 2) video.currentTime = startTime;
            setDuration(video.duration);
            video.play();
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onProgressUpdate(episode.id, (video.currentTime / video.duration) * 100);
        };
        
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        
        // Inactivity timer
        // Fix: Changed NodeJS.Timeout to number for browser compatibility.
        let inactivityTimeout: number;
        const resetInactivityTimer = () => {
            setShowControls(true);
            clearTimeout(inactivityTimeout);
            if (!video.paused) {
              inactivityTimeout = window.setTimeout(() => setShowControls(false), 3000);
            }
        };
        containerRef.current?.addEventListener('mousemove', resetInactivityTimer);
        containerRef.current?.addEventListener('mouseleave', () => clearTimeout(inactivityTimeout));

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            clearTimeout(inactivityTimeout);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [episode.id]);
    
    const handleProgressSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const newTime = ((e.clientX - rect.left) / rect.width) * duration;
        if (!isNaN(newTime)) video.currentTime = newTime;
    };
    
    const toggleFullscreen = () => containerRef.current?.requestFullscreen();

    return (
        <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex justify-center items-center" onMouseMove={() => setShowControls(true)} onMouseLeave={() => !isPlaying && setShowControls(false)}>
            <video ref={videoRef} className="w-full h-full object-contain" onClick={togglePlay}>
                <source src={episode.videoUrl} type="video/mp4" />
                {episode.trackUrl && <track label="Português" kind="subtitles" srcLang="pt" src={episode.trackUrl} default />}
            </video>

            <div className={`absolute inset-0 text-white transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'} bg-gradient-to-t from-black/70 via-black/30 to-black/50`}>
                <header className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center">
                    <h1 className="text-xl font-medium text-[#d3d3d3]">{episode.title}</h1>
                    <nav className="flex items-center gap-6">
                        <button onClick={toggleFullscreen}><img alt="Fullscreen" src="https://c.animaapp.com/VdjJnM12/img/vector-8.svg"/></button>
                        <div className="w-px h-4 bg-[#7a7a7a]"></div>
                        <button onClick={onClose}><img alt="Close" src="https://c.animaapp.com/VdjJnM12/img/vector-7.svg"/></button>
                    </nav>
                </header>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-24">
                    <button onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)}><img alt="Back 10s" src="https://c.animaapp.com/VdjJnM12/img/union-3.svg"/></button>
                    <button onClick={togglePlay}>
                        <img alt={isPlaying ? 'Pause' : 'Play'} src={isPlaying ? "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjkiIHZpZXdCb3g9IjAgMCAyNSAyOSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEg0QzEuNzkgMCAwIDEuNzkgMCA0VjI1QzAgMjcuMjEgMS43OSAyOSA0IDI5SDhDMTAuMjEgMjkgMTIgMjcuMjEgMTIgMjVWNEMxMiAxLjc5IDEwLjIxIDAgOCAwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIxIDBIMTdDMTQuNzkgMCAxMyAxLjc5IDEzIDRWMjVDMTMgMjcuMjEgMTQuNzkgMjkgMTcgMjlIMjFDMjMuMjEgMjkgMjUgMjcuMjEgMjUgMjVWNEMyNSAxLjc5IDIzLjIxIDAgMjEgMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" : "https://c.animaapp.com/VdjJnM12/img/polygon-1.svg"}/>
                    </button>
                    <button onClick={() => videoRef.current && (videoRef.current.currentTime += 10)}><img alt="Forward 10s" src="https://c.animaapp.com/VdjJnM12/img/union-4.svg"/></button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-10">
                    <div className="w-full h-[5px] bg-white/30 rounded-full cursor-pointer group" onClick={handleProgressSeek}>
                        <div className="h-full bg-white rounded-full relative" style={{ width: `${(currentTime/duration)*100}%` }}>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm">
                            <span>{formatTime(currentTime)}</span>
                            <span className="text-[#7a7a7a]"> / {formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-[#7a7a7a]">HD</span>
                            <button><img alt="CC" src="https://c.animaapp.com/VdjJnM12/img/subtract.svg"/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CoursesPage;