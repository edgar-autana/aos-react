# CORS Setup for 3D API Server

## Problem
Your Vite app (likely running on `http://localhost:5173`) is making requests to your 3D API server (`http://localhost:3001`), which is a cross-origin request that requires CORS configuration.

## Solution

### If using Express.js:
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
```

### If using Fastify:
```javascript
const fastify = require('fastify')({
  logger: true
});

fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});
```

### If using Koa:
```javascript
const cors = require('@koa/cors');

app.use(cors({
  origin: (ctx) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];
    const origin = ctx.request.header.origin;
    return allowedOrigins.includes(origin) ? origin : false;
  },
  credentials: false,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
```

### If using raw Node.js HTTP:
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Your existing route handling...
});
```

## Development vs Production

### Development (Current Setup)
```javascript
origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173']
```

### Production
```javascript
origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
```

## Testing CORS

You can test if CORS is working by running this in your browser console:

```javascript
fetch('http://localhost:3001/api/aps/v2/upload-step', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    file_url: "https://example.com/test.step",
    scopes: ["data:read", "data:write", "data:create", "bucket:read", "bucket:create"]
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Common Issues

1. **Server not running**: Make sure your 3D API server is running on port 3001
2. **Wrong origin**: Ensure the origin matches your Vite dev server port
3. **Missing headers**: Make sure all required headers are allowed
4. **Preflight requests**: Handle OPTIONS requests properly

## Debug Steps

1. Check browser console for CORS errors
2. Verify server is running: `curl http://localhost:3001/api/aps/v2/upload-step`
3. Test with Postman or similar tool
4. Check server logs for incoming requests 