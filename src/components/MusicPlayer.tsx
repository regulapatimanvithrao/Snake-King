import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'NEON PROTOCOL',
    artist: 'AI.Gen',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 2,
    title: 'CYBERNETIC PULSE',
    artist: 'AI.Gen',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 3,
    title: 'SYNTHETIC DREAMS',
    artist: 'AI.Gen',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => {
        console.error("Audio playback error:", e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  return (
    <div className="w-full bg-neon-surface border-t border-neon-cyan/30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        loop={false}
      />
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-full md:w-1/3">
        <div className="w-12 h-12 bg-black border border-neon-pink/50 rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(255,0,255,0.2)]">
          <Music className="text-neon-pink w-6 h-6" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-sans text-neon-green font-bold text-sm truncate uppercase tracking-widest">{currentTrack.title}</span>
          <span className="font-mono text-neon-cyan/70 text-xs truncate uppercase tracking-wider">{currentTrack.artist}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 w-full md:w-1/3">
        <div className="flex items-center gap-6">
          <button onClick={playPrev} className="text-white hover:text-neon-cyan transition-colors" aria-label="Previous track">
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 rounded-full border border-neon-green flex items-center justify-center text-neon-green hover:bg-neon-green hover:text-black transition-all shadow-[0_0_10px_rgba(57,255,20,0.3)]"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </button>

          <button onClick={playNext} className="text-white hover:text-neon-cyan transition-colors" aria-label="Next track">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div 
          className="w-full h-1 bg-gray-800 rounded-full overflow-hidden cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-neon-pink group-hover:bg-neon-cyan transition-colors relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_5px_#fff]"></div>
          </div>
        </div>
      </div>

      {/* Extras (Volume) */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
        <button onClick={toggleMute} className="text-white hover:text-neon-cyan transition-colors">
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-24 h-1 appearance-none bg-gray-800 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neon-cyan [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
        />
      </div>
    </div>
  );
}
