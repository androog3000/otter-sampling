import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const App = () => {
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyserNode, setAnalyserNode] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [canvasContext, setCanvasContext] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = context.createAnalyser();
    analyser.fftSize = 2048; // Number of frequency bins
    setAudioContext(context);
    setAnalyserNode(analyser);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasContext(canvasRef.current.getContext("2d"));
    }
  }, [canvasRef]);

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

    stopAllAudio(); // Stop any currently playing audio

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Transpose the sound by changing playback rate
    const playbackRate = noteFrequency / 440; // Assuming 440 Hz as the base note (A4)
    source.playbackRate.value = playbackRate;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.5; // Set volume

    source.connect(gainNode);
    gainNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    source.start();
    setCurrentSource(source);
    visualizeWaveform();

    // Automatically stop the audio after it finishes playing
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

  const visualizeWaveform = () => {
    if (!analyserNode || !canvasContext) return;

    const bufferLength = analyserNode.fftSize;
    const newArray = new Uint8Array(bufferLength);
    setDataArray(newArray);

    const draw = () => {
      analyserNode.getByteTimeDomainData(newArray);

      canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasContext.fillStyle = "#222";
      canvasContext.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = "#0f0";
      canvasContext.beginPath();

      const sliceWidth = canvasRef.current.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = newArray[i] / 128.0;
        const y = (v * canvasRef.current.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
      canvasContext.stroke();

      if (currentSource) {
        requestAnimationFrame(draw);
      }
    };

    draw();
  };

  const renderPianoKeys = () => {
    const notes = [
      { label: "C4", freq: 261.63 },
      { label: "D4", freq: 293.66 },
      { label: "E4", freq: 329.63 },
      { label: "F4", freq: 349.23 },
      { label: "G4", freq: 392.0 },
      { label: "A4", freq: 440.0 },
      { label: "B4", freq: 493.88 },
      { label: "C5", freq: 523.25 },
    ];

    return notes.map((note) => (
        <button
            key={note.label}
            className="piano-key"
            onClick={() => playNote(note.freq)}
        >
          {note.label}
        </button>
    ));
  };

  return (
      <div className="App">
        <h1>🎹 Audio Sampler with Piano</h1>
        <input
            type="file"
            accept="audio/mp3"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="file-input"
        />
        <div className="piano">{renderPianoKeys()}</div>
        <button className="stop-button" onClick={stopAllAudio}>
          Stop All Audio
        </button>
        <canvas ref={canvasRef} width="800" height="200" className="waveform-canvas"></canvas>
      </div>
  );
};

export default App;
