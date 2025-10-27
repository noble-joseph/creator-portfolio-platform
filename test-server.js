const http = require('http');

console.log('🧪 Testing server connection...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`);
  console.log(`🌐 Server URL: http://localhost:${options.port}`);
  console.log(`📊 Health Check: http://localhost:${options.port}/health`);
  console.log(`🔗 API Base: http://localhost:${options.port}/api`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('\n📋 Server Response:');
      console.log(JSON.stringify(response, null, 2));
    } catch (e) {
      console.log('\n📋 Server Response:');
      console.log(data);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Server is not running or not accessible');
  console.log('🔧 Please start the server with: cd server && node index.js');
  console.log('📝 Error:', err.message);
});

req.on('timeout', () => {
  console.log('⏰ Connection timeout - server might be starting up');
  console.log('🔄 Please wait a moment and try again');
  req.destroy();
});

req.end();
