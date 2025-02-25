import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player';

const StreamList = () => {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/streams')
      .then(res => setStreams(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Saved Streams</h2>
      <ul>
        {streams.map(stream => (
          <li key={stream._id} onClick={() => setSelectedStream(stream)}>
            {stream.title} - {new Date(stream.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
      {selectedStream && (
        <ReactPlayer
          url={`http://localhost:5000${selectedStream.hlsPath}`}
          playing
          controls
          width="100%"
          height="auto"
        />
      )}
    </div>
  );
};

export default StreamList;