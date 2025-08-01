# Environment Setup

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# 3D API Configuration
VITE_API_3D_BASE_URL=http://localhost:3001
```

## Environment Variables Explanation

### `VITE_API_3D_BASE_URL`
- **Purpose**: Base URL for the 3D conversion API service
- **Default**: `http://localhost:3001`
- **Format**: Full URL including protocol and port
- **Example**: `http://localhost:3001` or `https://api.example.com`

## Development vs Production

### Development
```env
VITE_API_3D_BASE_URL=http://localhost:3001
```

### Production
```env
VITE_API_3D_BASE_URL=https://your-production-api.com
```

## How to Use

1. **Create `.env` file** in the project root
2. **Add the variables** as shown above
3. **Restart the development server** if running
4. **The service will automatically use** the configured URL

## Vite Environment Variables

- All environment variables must be prefixed with `VITE_` to be accessible in the browser
- Variables are available via `import.meta.env.VITE_VARIABLE_NAME`
- The service includes fallback to `http://localhost:3001` if not configured

## API Endpoint

The service will call:
```
{VITE_API_3D_BASE_URL}/api/aps/v2/upload-step
```

Example with default:
```
http://localhost:3001/api/aps/v2/upload-step
``` 