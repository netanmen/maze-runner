import React from 'react';

import useAudioPlayer from './useAudioPlayer';

function Audio() {
  const { playing, setPlaying } = useAudioPlayer();

  return (
    <div className="player">
      <audio controls id="audio" onClick={() => setPlaying(true)}>
        <source src="maze.mp3" />
        Your browser does not support the <code>audio</code> element.
      </audio>
    </div>
  );
}

export default Audio;
