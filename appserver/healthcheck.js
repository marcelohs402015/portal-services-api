/**
 * Health check para o Render - baseado no docker-compose.yml
 */

const http = require('http');

const port = process.env.PORT || 3001;
const host = 'localhost';

const options = {
  host: host,
  port: port,
  path: '/health',
  timeout: 2000
};

const request = http.get(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.abort();
  process.exit(1);
});

request.end();