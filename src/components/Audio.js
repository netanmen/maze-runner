import React, { useEffect, useRef } from 'react';

function Audio({source, handleAudioEnd, shouldLoop}) {
  const audioElement = useRef(null)
  
  useEffect(() => {
      if (source) {
        audioElement.current.loop = shouldLoop ? true : false;
        audioElement.current.play();
      } else {
        audioElement.current.pause();  
      }
  }, [source, shouldLoop]);

  return (
    <div>
      <audio ref={audioElement} src={source} onEnded={handleAudioEnd}>
        Your browser does not support the <code>audio</code> element.
      </audio>
    </div>
  );
}

export default Audio;
