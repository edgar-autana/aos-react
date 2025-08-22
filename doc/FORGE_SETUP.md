# Autodesk Forge Setup for 3D Viewer

## Prerequisites

1. **Autodesk Forge Account**: You need an Autodesk Forge developer account
2. **Forge App**: Create a Forge application to get credentials

## Setup Steps

### 1. Create Forge Application

1. Go to [Autodesk Forge Developer Portal](https://forge.autodesk.com/)
2. Sign in with your Autodesk account
3. Create a new application
4. Note down your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```env
# Autodesk Forge Credentials
VITE_FORGE_CLIENT_ID=your_forge_client_id_here
VITE_FORGE_CLIENT_SECRET=your_forge_client_secret_here
```

### 3. Forge App Configuration

In your Forge app settings, configure:

- **Callback URL**: `http://localhost:5173` (for development)
- **Scopes**: 
  - `data:read`
  - `data:write` 
  - `bucket:read`
  - `bucket:create`

### 4. Bucket Setup

Your Forge app needs a bucket to store models. The bucket name should match your URN:

```
urn:adsk.objects:os.object:aos-files-urn/step-v2-...
```

Bucket name: `aos-files-urn`

## Testing

1. **Start your development server**: `npm run dev`
2. **Upload a STEP file** to a part number
3. **Click 3D Viewer** button
4. **Click "Show 3D Viewer"** in the modal

## Troubleshooting

### Common Issues

1. **"Forge credentials not configured"**
   - Check that `VITE_FORGE_CLIENT_ID` and `VITE_FORGE_CLIENT_SECRET` are set
   - Restart your development server after adding environment variables

2. **"Failed to get Forge token"**
   - Verify your Client ID and Secret are correct
   - Check that your Forge app has the correct scopes
   - Ensure your Forge app is active

3. **"Failed to load 3D model"**
   - Verify the URN is correct
   - Check that the model exists in your Forge bucket
   - Ensure the model has been translated to SVF format

### Development Mode

For development without Forge credentials, the viewer will show a placeholder:

```typescript
// In forge-viewer.tsx, line ~85
callback('test-token', 3600); // Placeholder for development
```

## Production Deployment

For production:

1. **Update callback URLs** in your Forge app
2. **Set production environment variables**
3. **Ensure HTTPS** (required for Forge in production)
4. **Configure CORS** properly

## Forge Viewer Features

The integrated viewer includes:

- ✅ **3D Model Loading**: Loads STEP files via URN
- ✅ **Interactive Controls**: Zoom, pan, rotate
- ✅ **Model Tree**: Shows model hierarchy
- ✅ **Properties Panel**: Shows object properties
- ✅ **Measurement Tools**: Distance, angle, area
- ✅ **Section Views**: Cut through the model
- ✅ **Explode Views**: Separate model parts

## API Endpoints

- `GET /api/forge/token` - Get Forge access token
- Uses environment variables for authentication
- Returns JWT token for Forge API access 