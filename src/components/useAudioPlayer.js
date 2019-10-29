import { useState, useEffect } from "react";

function useAudioPlayer() {
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const audio = document.getElementById("audio");

    // React state listeners: update DOM on React state changes
    playing ? audio.play() : audio.pause();
    return () => {
    }
  });

  return {
    playing,
    setPlaying,
  }
}

export default useAudioPlayer;