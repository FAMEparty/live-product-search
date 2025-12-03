# Setup Guide

## Required API Keys

This application requires two API keys to function:

### 1. OpenAI API Key (GPT-4 Vision)

Used for analyzing product images captured by the camera.

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

**Set as environment variable:**
```bash
export OPENAI_API_KEY=sk-your-key-here
```

### 2. ScrapingBee API Key

Used for scraping Amazon product data (images, prices, titles).

**How to get it:**
1. Go to [ScrapingBee](https://www.scrapingbee.com/)
2. Sign up for an account (free tier available)
3. Go to your dashboard
4. Copy your API key

**Set as environment variable:**
```bash
export SCRAPINGBEE_API_KEY=your-key-here
```

## Environment Variables

Create a `.env` file in the project root with these variables:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
SCRAPINGBEE_API_KEY=your-scrapingbee-api-key-here

# Optional (auto-configured in Manus deployment)
DATABASE_URL=mysql://user:password@localhost:3306/database
JWT_SECRET=your-jwt-secret-here
VITE_APP_TITLE=Live Product Search
VITE_APP_LOGO=/logo.png
```

## Running Locally

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set environment variables (see above)

3. Start the dev server:
   ```bash
   pnpm dev
   ```

4. Open browser:
   ```
   http://localhost:3000
   ```

## Camera Setup

The application requires camera access to capture product images.

**Supported cameras:**
- Hollyland Venus LIV
- Any USB webcam
- Built-in laptop camera

**Browser requirements:**
- Chrome or Edge (for Web Speech API support)
- HTTPS or localhost (required for camera/microphone access)

## OBS Configuration

1. **Add Browser Source**
   - Source: `http://localhost:3000`
   - Width: 1920
   - Height: 1080
   - FPS: 30

2. **Crop to OBS Preview**
   - Use the dashed border in the left panel as a guide
   - Crop the browser source to show only the ProductCard area

3. **Scene Switching** (optional)
   - Install OBS WebSocket plugin
   - Configure scene names in the app
   - Use "PUSH LIVE" button to trigger scene changes

## Stream Deck Integration

Configure two buttons to trigger these endpoints:

**Button 1: Capture Audio**
- Action: System → Website
- Method: POST
- URL: `http://localhost:3000/api/streamdeck/captureAudio`

**Button 2: Capture Image**
- Action: System → Website
- Method: POST
- URL: `http://localhost:3000/api/streamdeck/captureImage`

## Troubleshooting

**"Camera not found" error**
- Grant browser camera permissions
- Ensure camera is not in use by another app
- Try refreshing the page

**"Voice recognition not working"**
- Use Chrome or Edge browser
- Grant microphone permissions
- Ensure you're on HTTPS or localhost

**"Product images not loading"**
- Check ScrapingBee API key is valid
- Check browser console for errors
- Verify internet connection

**"Search returns no results"**
- Speak clearly and include brand name
- Hold product clearly in camera frame
- Try manual search with text input

## Development

**Run tests:**
```bash
pnpm test
```

**Build for production:**
```bash
pnpm build
```

**Database migrations:**
```bash
pnpm db:push
```

## Support

For issues, please open a GitHub issue with:
- Browser and OS version
- Camera model
- Console error messages
- Steps to reproduce
