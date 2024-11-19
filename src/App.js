import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && audioContext) {
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedBuffer);
    }
  };

  const playNote = (noteFrequency) => {
    if (!audioBuffer || !audioContext) return;

    stopAllAudio();

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    const baseFrequency = 130.81; // C3
    const playbackRate = noteFrequency / baseFrequency;
    source.playbackRate.value = playbackRate;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
    setCurrentSource(source);

    source.onended = () => {
      if (currentSource === source) {
        setCurrentSource(null);
      }
    };
  };

  const stopAllAudio = () => {
    if (currentSource) {
      currentSource.stop();
      setCurrentSource(null);
    }
  };

  const renderPianoKeys = () => {
    const keys = [
      { note: "C2", freq: 65.41 },
      { note: "D2", freq: 73.42 },
      { note: "E2", freq: 82.41 },
      { note: "F2", freq: 87.31 },
      { note: "G2", freq: 98.00 },
      { note: "A2", freq: 110.00 },
      { note: "B2", freq: 123.47 },
      { note: "C3", freq: 130.81 },
      { note: "D3", freq: 146.83 },
      { note: "E3", freq: 164.81 },
      { note: "F3", freq: 174.61 },
      { note: "G3", freq: 196.00 },
      { note: "A3", freq: 220.00 },
      { note: "B3", freq: 246.94 },
      { note: "C4", freq: 261.63 },
    ];

    return (
        <div className="piano">
          {keys.map((key, index) => (
              <div
                  key={index}
                  className="white-key"
                  onClick={() => playNote(key.freq)}
              >
                {key.note}
              </div>
          ))}
        </div>
    );
  };

  return (
      <div className="App">
        <h1 className="app-title">🎹 Audio Sampler</h1>
        <input
            type="file"
            accept="audio/mp3"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="file-input"
        />
        {renderPianoKeys()}
        <button className="stop-button" onClick={stopAllAudio}>
          Stop All Audio
        </button>
      </div>
  );
};

export default App;
