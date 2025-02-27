const express = require('express');
const mongoose = require('mongoose');
const NodeMediaServer = require('node-media-server');
const Stream = require('./models/Stream');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use('/media', express.static('D:\\Live\\server\\media'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Node-Media-Server configuration
const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 120
  },
  http: {
    port: 8000,
    mediaroot: 'D:\\Live\\server\\media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: 'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=4:hls_list_size=5:hls_flags=delete_segments]',
        mp4: true,
        mp4Flags: '[movflags=frag_keyframe+empty_moov]'
      }
    ]
  }
};

const nms = new NodeMediaServer(config);
// Event listeners for Node-Media-Server
nms.on('preConnect', (id, args) => {
  console.log('[RTMP] Client connected:', id, args);
});

nms.on('postConnect', (id, args) => {
  console.log('[RTMP] Client authenticated:', id, args);
});

nms.on('doneConnect', (id, args) => {
  console.log('[RTMP] Client disconnected:', id, args);
});

nms.on('prePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  console.log(`[RTMP] Pre-publish: ${streamKey}`);
  const stream = await Stream.findOne({ streamKey });
  if (!stream) {
    const session = nms.getSession(id);
    session.reject();
    console.log('Unauthorized stream attempt');
    return;
  }
  console.log(`[RTMP] Stream authorized: ${streamKey}`);
});

nms.on('postPublish', (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/')[2];
  const hlsDir = path.join('D:\\Live\\server\\media\\live', streamKey);
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
    console.log(`Created directory: ${hlsDir}`);
  } else {
    console.log(`Directory already exists: ${hlsDir}`);
  }
  console.log(`[HLS] Stream live: ${streamKey}, expecting HLS at ${hlsDir}\\index.m3u8`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(`[RTMP] Stream ended: ${StreamPath}`);
});

nms.on('error', (err, id, StreamPath) => {
  console.error(`[ERROR] ${StreamPath || 'Unknown'}: ${err.message}`);
});

// Start the Node-Media-Server
nms.run();

// API endpoints
app.get('/api/stream/key', async (req, res) => {
  const streamKey = uuidv4();
  const stream = new Stream({ title: 'New Stream', streamKey });
  await stream.save();
  res.json({ streamKey });
});

app.get('/api/streams', async (req, res) => {
  const streams = await Stream.find();
  res.json(streams);
});

app.listen(port, () => console.log(`Server running on port ${port}`));