import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

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

Audio.propTypes = {
  handleAudioEnd: PropTypes.func,
  shouldLoop: PropTypes.bool
};

export default Audio;
