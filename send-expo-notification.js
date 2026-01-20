const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Replace with your Expo push token
// You should get this from your app and store it in your backend
const EXPO_PUSH_TOKEN = 'ExponentPushToken[KMWVqXHHplwJ79bzp9mkv4]';

app.post('/send-notification', (req, res) => {
  const { title, body, data } = req.body;

  const message = {
    to: EXPO_PUSH_TOKEN,
    sound: 'default',
    title: title || 'Hello!',
    body: body || 'This is a test notification with deep linking.',
    data: data || { url: 'myapp://some/deep/link' }, // Deep link payload
  };

  const postData = JSON.stringify(message);
  const options = {
    hostname: 'exp.host',
    path: '/--/api/v2/push/send',
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: 'Invalid JSON response from Expo' });
      }
    });
  });

  request.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  request.write(postData);
  request.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
