import { useEffect, useRef, useState } from "react";

const notes = [523.25, 587.33, 659.25, 783.99, 880];

function createNoiseBuffer(audioContext) {
  const frameCount = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    data[index] = (Math.random() * 2 - 1) * 0.35;
  }

  return buffer;
}

export function MusicPlayer() {
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  useEffect(() => {
    if (audioRef.current?.gain) {
      audioRef.current.gain.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const playBell = (audioContext, destination) => {
    const note = notes[Math.floor(Math.random() * notes.length)];
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const now = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = note;
    filter.type = "lowpass";
    filter.frequency.value = 1700;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    oscillator.start(now);
    oscillator.stop(now + 2.5);
  };

  const startAudio = async () => {
    if (audioRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      setAudioUnavailable(true);
      setPlaying(false);
      return;
    }

    try {
      const audioContext = new AudioContext();
      const masterGain = audioContext.createGain();
      const noiseSource = audioContext.createBufferSource();
      const noiseGain = audioContext.createGain();
      const noiseFilter = audioContext.createBiquadFilter();

      masterGain.gain.value = volume;
      noiseSource.buffer = createNoiseBuffer(audioContext);
      noiseSource.loop = true;
      noiseGain.gain.value = 0.045;
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.value = 950;

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      masterGain.connect(audioContext.destination);

      noiseSource.start();
      intervalRef.current = window.setInterval(() => {
        playBell(audioContext, masterGain);
      }, 3200);

      audioRef.current = { context: audioContext, noiseSource, gain: masterGain };
      setPlaying(true);
      audioContext.resume().catch(() => {
        setAudioUnavailable(true);
        stopAudio();
      });
    } catch {
      setAudioUnavailable(true);
      stopAudio();
    }
  };

  const stopAudio = () => {
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;

    if (audioRef.current) {
      try {
        audioRef.current.noiseSource.stop();
      } catch {
        // The source may already be stopped when React cleans up.
      }
      audioRef.current.context.close();
      audioRef.current = null;
    }

    setPlaying(false);
  };

  return (
    <div className="musicPlayer">
      <button
        className={`musicButton ${audioUnavailable ? "unsupported" : ""}`}
        type="button"
        disabled={audioUnavailable}
        aria-label={
          audioUnavailable ? "当前浏览器不支持氛围音" : playing ? "暂停氛围音" : "播放氛围音"
        }
        title={audioUnavailable ? "当前浏览器不支持氛围音" : "氛围音"}
        onClick={playing ? stopAudio : startAudio}
      >
        {audioUnavailable ? "×" : playing ? "❚❚" : "♫"}
      </button>
      <input
        aria-label="音量"
        type="range"
        min="0"
        max="0.8"
        step="0.01"
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
      />
    </div>
  );
}
