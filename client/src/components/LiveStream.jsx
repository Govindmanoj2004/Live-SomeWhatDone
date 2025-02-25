import React from 'react';
import ReactPlayer from 'react-player';

const LiveStream = ({ streamKey }) => {
  const hlsUrl = `http://localhost:8000/live/${streamKey}/index.m3u8`;
  return (
    <div>
      <h2>Live Stream</h2>
      <ReactPlayer
        url={hlsUrl}
        playing
        controls
        width="100%"
        height="auto"
        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    </div>
  );
};

export default LiveStream;