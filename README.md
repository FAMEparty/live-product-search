# Live Product Search

Voice-activated Amazon product display system for OBS with Stream Deck integration, designed for live auction streaming on platforms like Whatnot.

## Features

- **Dual-Input AI Recognition**: Combines voice recognition and camera image analysis for accurate product identification
- **Amazon Product Search**: Real-time product search with ScrapingBee integration
- **OBS-Ready Display**: Professional broadcast overlay with Cyber-Industrial design
- **Stream Deck Integration**: Separate webhook endpoints for audio and image capture buttons
- **Smart Product Selection**: Shows top 3 Amazon results with thumbnails for manual selection
- **Visual Feedback**: Camera flash effects, analyzing overlays, and status indicators

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express + tRPC 11
- **AI**: OpenAI GPT-4 Vision API
- **Voice**: Web Speech API (browser-based)
- **Product Search**: ScrapingBee Amazon scraping
- **Design**: Cyber-Industrial theme with Chakra Petch and JetBrains Mono fonts

## Prerequisites

- Node.js 22+ and pnpm
- OpenAI API key (for GPT-4 Vision)
- ScrapingBee API key (for Amazon product search)
- Camera access (Hollyland Venus LIV or any webcam)
- OBS Studio (for broadcast overlay)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/live-product-search.git
   cd live-product-search
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage

### For Streamers (Manual Mode)

1. **Enable Camera**: Click "ENABLE CAMERA" and select your camera device
2. **Capture Audio**: Press "CAPTURE AUDIO" and speak the product name
3. **Capture Image**: Press "📸 CAPTURE IMAGE" while holding the product in frame
4. **Select Product**: Choose the best match from the 3 Amazon results
5. **Push Live**: Press "PUSH LIVE" to display in OBS

### For Stream Deck Users

Configure two buttons to trigger these webhooks:

- **Audio Capture Button**: `POST http://localhost:3000/api/streamdeck/captureAudio`
- **Image Capture Button**: `POST http://localhost:3000/api/streamdeck/captureImage`

The system automatically searches when both captures are complete.

## OBS Setup

1. **Add Browser Source**
   - URL: `http://localhost:3000`
   - Width: 1920
   - Height: 1080
   - Custom CSS (optional): Crop to OBS Preview area

2. **Configure Scene**
   - Create a scene for product display
   - Position the browser source overlay
   - Use "PUSH LIVE" to trigger scene switch (requires OBS WebSocket)

## API Endpoints

### tRPC Routes

- `amazon.search` - Search Amazon products with voice + vision analysis
  ```typescript
  input: { query: string, image?: string }
  output: { products: Product[], capturedImage: string, ... }
  ```

### Stream Deck Webhooks

- `POST /api/streamdeck/captureAudio` - Trigger audio capture
- `POST /api/streamdeck/captureImage` - Trigger image capture

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ProductCard.tsx      # OBS overlay card
│   │   │   ├── ControlPanel.tsx     # Operator controls
│   │   │   └── CameraSelector.tsx   # Camera device picker
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useVoiceRecognition.ts
│   │   │   └── useCamera.ts
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities
├── server/
│   ├── routes.ts           # tRPC API routes
│   ├── services/
│   │   ├── visionAnalyzer.ts    # OpenAI GPT-4 Vision
│   │   ├── productExtractor.ts  # Voice transcript processing
│   │   └── amazonScraper.ts     # ScrapingBee integration
│   └── _core/              # Framework code
├── drizzle/                # Database schema (for future features)
└── shared/                 # Shared types
```

## Design System

**Cyber-Industrial Theme**
- Background: Slate 900 (`#0f172a`)
- Primary Accent: Amber 500 (`#f59e0b`)
- Fonts: Chakra Petch (headings), JetBrains Mono (monospace)
- Visual Elements: Corner brackets, scanlines, status indicators

## Roadmap

- [x] Voice recognition with Web Speech API
- [x] Camera image capture and AI vision analysis
- [x] Hybrid AI extraction (voice + vision)
- [x] ScrapingBee Amazon product search
- [x] Product selection UI with thumbnails
- [x] Captured image preview
- [ ] Stream Deck webhook endpoints
- [ ] OBS WebSocket integration for scene switching
- [ ] Multi-user SaaS deployment
- [ ] User authentication and session management
- [ ] Analytics dashboard

## Troubleshooting

**Camera not detected**
- Ensure browser has camera permissions
- Try a different browser (Chrome/Edge recommended)
- Check camera is not in use by another application

**Product images not displaying**
- Check browser console for URIError messages
- Verify ScrapingBee API key is valid
- Clear browser cache (Ctrl+Shift+R)

**Voice recognition not working**
- Only works in Chrome/Edge (uses Web Speech API)
- Requires HTTPS or localhost
- Check microphone permissions

## License

MIT License - See LICENSE file for details

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.
