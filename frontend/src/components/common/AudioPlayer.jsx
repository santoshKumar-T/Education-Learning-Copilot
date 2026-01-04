import React, { useState, useRef, useEffect } from 'react';
import './AudioPlayer.css';

const AudioPlayer = ({ audioUrl, filename, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Failed to play audio. Please check if the audio file is accessible.');
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (e.target.value / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const handleSpeedChange = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newSpeed = parseFloat(e.target.value);
    audio.playbackRate = newSpeed;
    setPlaybackRate(newSpeed);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = filename || 'audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleError = (e) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      alert('Failed to load audio. Please try generating audio again.');
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl]);

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="audio-player">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      <div className="audio-controls">
        <button 
          className="audio-btn play-pause"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <div className="audio-progress">
          <span className="time-current">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="progress-bar"
          />
          <span className="time-total">{formatTime(duration)}</span>
        </div>

        <div className="audio-settings">
          <div className="volume-control">
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-bar"
            />
          </div>

          <select
            value={playbackRate}
            onChange={handleSpeedChange}
            className="speed-select"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          <button
            className="audio-btn download"
            onClick={downloadAudio}
            aria-label="Download audio"
            title="Download audio"
          >
            ⬇️
          </button>

          {onDelete && (
            <button
              className="audio-btn delete"
              onClick={onDelete}
              aria-label="Delete audio"
              title="Delete audio"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

