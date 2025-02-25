import React from 'react';
import LiveStream from './components/LiveStream';
import StreamList from './components/StreamList';

const App = () => {
  const sampleStreamKey = '51b6cb89-a63c-4fb0-b7fc-d0c25d957809'; // Replace with a real key from /api/stream/key

  return (
    <div>
      <h1>Live Streaming App</h1>
      <LiveStream streamKey={sampleStreamKey} />
      <StreamList />
    </div>
  );
};

export default App;