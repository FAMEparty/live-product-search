# Stream Deck Quick Reference

This guide provides a quick reference for configuring your Elgato Stream Deck to work with the Whatnot Product Display system.

---

## Required Plugin

Install one of the following plugins from the Stream Deck Marketplace:

- **API Request** (by API Monkey) - Recommended
- **Web Requests** - Free alternative

---

## Button Configuration

### Button 1: Push to Talk (Start Listening)

| Setting | Value |
|---------|-------|
| **Action** | API Request / Web Requests |
| **Request Type** | POST |
| **URL** | `http://localhost:3000/api/trpc/streamdeck.startListen` |
| **Headers** | (Leave empty) |
| **Body** | (Leave empty) |
| **Icon** | 🎤 or custom microphone icon |
| **Label** | LISTEN |

**What it does:** Activates voice recognition and starts listening for product names.

---

### Button 2: Push Live

| Setting | Value |
|---------|-------|
| **Action** | API Request / Web Requests |
| **Request Type** | POST |
| **URL** | `http://localhost:3000/api/trpc/streamdeck.pushLive` |
| **Headers** | (Leave empty) |
| **Body** | (Leave empty) |
| **Icon** | 📺 or custom "live" icon |
| **Label** | GO LIVE |

**What it does:** Changes the product display status to "LIVE" and signals that you are ready to show the product on stream.

---

## Optional: OBS Scene Switching

You can also configure Stream Deck buttons to switch OBS scenes directly. This is useful if you want to automate the transition to the product display overlay.

### Button 3: Switch to Product Display Scene

| Setting | Value |
|---------|-------|
| **Action** | OBS Studio > Switch Scene |
| **Scene** | (Select the scene containing your product display overlay) |
| **Icon** | Custom icon of your choice |
| **Label** | PRODUCT |

**What it does:** Instantly switches OBS to the scene showing the product display overlay.

---

## Recommended Layout

Here is a suggested layout for your Stream Deck:

```
┌─────────┬─────────┬─────────┐
│  🎤     │  📺     │  🔄     │
│ LISTEN  │ GO LIVE │  RESET  │
├─────────┼─────────┼─────────┤
│  🎬     │  🎥     │  🔇     │
│ PRODUCT │  MAIN   │  MUTE   │
└─────────┴─────────┴─────────┘
```

- **LISTEN:** Activates voice recognition
- **GO LIVE:** Pushes product display to "LIVE" status
- **RESET:** (Optional) Clears product data (requires custom webhook)
- **PRODUCT:** Switches OBS to product display scene
- **MAIN:** Switches OBS back to main camera scene
- **MUTE:** Mutes/unmutes microphone in OBS

---

## Troubleshooting

### Buttons Not Responding

1. Ensure the development server is running (`pnpm dev`).
2. Verify that the URL is exactly `http://localhost:3000/api/trpc/streamdeck.startListen` (no trailing slash).
3. Check the Stream Deck software logs for error messages.

### Wrong Scene Switching

If the OBS scene switching is not working as expected, ensure that:

- The OBS WebSocket plugin is installed and enabled.
- The scene name in the Stream Deck action matches the exact name in OBS (case-sensitive).

---

**Author:** Manus AI  
**Version:** 1.0
