# Stream Deck Configuration Guide

This guide will help you set up your Elgato Stream Deck to control the Live Product Search application using keyboard shortcuts.

## Prerequisites

- Elgato Stream Deck (any model)
- Stream Deck software installed
- Live Product Search application running in your browser

## Keyboard Shortcuts

The application listens for the following keyboard shortcuts:

| Action | Shortcut | Description |
|--------|----------|-------------|
| **AUDIO** | `Ctrl+Shift+A` | Toggle audio capture (start/stop voice recognition) |
| **IMAGE** | `Ctrl+Shift+I` | Capture product image from camera |
| **BARCODE** | `Ctrl+Shift+B` | Toggle barcode scanner mode |
| **PRODUCT 1** | `Ctrl+Shift+1` | Select first product from search results |
| **PRODUCT 2** | `Ctrl+Shift+2` | Select second product from search results |
| **PRODUCT 3** | `Ctrl+Shift+3` | Select third product from search results |
| **PUSH LIVE** | `Ctrl+Shift+L` | Push selected product to OBS display |
| **RESET** | `Ctrl+Shift+R` | Reset system (clear all data, keep camera enabled) |

**Note:** On Mac, use `Cmd+Shift` instead of `Ctrl+Shift`.

## Stream Deck Setup Instructions

### Step 1: Open Stream Deck Software

1. Launch the Stream Deck software on your computer
2. Create a new profile or use an existing one
3. Name it "Live Product Search" for easy identification

### Step 2: Add Hotkey Actions

For each button you want to configure:

1. **Drag "Hotkey" action** from the right panel onto a Stream Deck button
2. **Click the button** to configure it
3. **Enter the keyboard shortcut** (e.g., `Ctrl+Shift+A` for AUDIO)
4. **Add a title** (e.g., "AUDIO", "IMAGE", "BARCODE")
5. **Optional:** Add an icon or custom image

### Step 3: Recommended Button Layout

Here's a suggested 8-button layout for your Stream Deck:

```
┌─────────┬─────────┬─────────┬─────────┐
│  AUDIO  │  IMAGE  │ BARCODE │  RESET  │
│ Ctrl+⇧+A│ Ctrl+⇧+I│ Ctrl+⇧+B│ Ctrl+⇧+R│
├─────────┼─────────┼─────────┼─────────┤
│PRODUCT 1│PRODUCT 2│PRODUCT 3│PUSH LIVE│
│ Ctrl+⇧+1│ Ctrl+⇧+2│ Ctrl+⇧+3│ Ctrl+⇧+L│
└─────────┴─────────┴─────────┴─────────┘
```

### Step 4: Configure Each Button

#### AUDIO Button
- **Action:** Hotkey
- **Hotkey:** `Ctrl+Shift+A` (Windows) or `Cmd+Shift+A` (Mac)
- **Title:** AUDIO
- **Icon:** Microphone icon (optional)

#### IMAGE Button
- **Action:** Hotkey
- **Hotkey:** `Ctrl+Shift+I`
- **Title:** IMAGE
- **Icon:** Camera icon (optional)

#### BARCODE Button
- **Action:** Hotkey
- **Hotkey:** `Ctrl+Shift+B`
- **Title:** BARCODE
- **Icon:** Barcode icon (optional)

#### PRODUCT 1/2/3 Buttons
- **Action:** Hotkey
- **Hotkey:** `Ctrl+Shift+1`, `Ctrl+Shift+2`, `Ctrl+Shift+3`
- **Title:** PRODUCT 1, PRODUCT 2, PRODUCT 3
- **Icon:** Number icons (optional)

#### PUSH LIVE Button
- **Action:** Hotkey
- **Hotkey:** `Ctrl+Shift+L`
- **Title:** PUSH LIVE
- **Icon:** Broadcast icon (optional)
- **Styling:** Use green background to indicate "go live" action

#### RESET Button
- **Action:** Hotkey
- **Hotkey:** `Ctrl+Shift+R`
- **Title:** RESET
- **Icon:** Refresh icon (optional)
- **Styling:** Use red background to indicate destructive action

## Workflow Example

Here's how to use Stream Deck during a live auction:

1. **Press AUDIO** → Speak product name (e.g., "Philips Norelco OneBlade 360")
2. **Press IMAGE** → Hold product up to camera
3. Wait for 3 product options to appear
4. **Press PRODUCT 1/2/3** → Select the best match
5. **Press PUSH LIVE** → Product appears on OBS stream
6. Sell the item during your auction
7. **Press RESET** → Clear display and start next item

**Alternative workflow with barcode scanner:**

1. **Press BARCODE** → Activate scanner mode
2. Scan product barcode with Bluetooth scanner
3. Product options appear automatically
4. **Press PRODUCT 1/2/3** → Select best match
5. **Press PUSH LIVE** → Product goes live
6. **Press RESET** → Next item

## Troubleshooting

### Shortcuts not working?

1. **Make sure the browser window is focused** - Stream Deck sends keyboard shortcuts to the active window
2. **Check if another application is using the same shortcuts** - Try changing to different key combinations
3. **Verify Stream Deck software is running** - Check system tray/menu bar
4. **Restart the browser** - Sometimes keyboard listeners need a fresh start

### Button not responding?

1. **Check the hotkey configuration** - Make sure you entered the correct shortcut
2. **Test the shortcut manually** - Press `Ctrl+Shift+A` on your keyboard to verify it works
3. **Check Stream Deck connection** - Ensure the device is properly connected

### Products not selecting?

- **PRODUCT 1/2/3 only work after a search** - Make sure you've captured audio/image first
- **Wait for search to complete** - Don't press product buttons while "SEARCHING" status is active

## Advanced Tips

### Multi-Action Buttons

You can create multi-action buttons in Stream Deck to automate workflows:

**Example: "Quick Capture" button**
1. Add "Multi Action" to a button
2. Add `Ctrl+Shift+A` (AUDIO)
3. Add 2-second delay
4. Add `Ctrl+Shift+I` (IMAGE)

This will capture audio, wait 2 seconds, then capture image automatically.

### Folder Organization

Create folders in Stream Deck to organize different workflows:
- **Main Controls** - AUDIO, IMAGE, BARCODE, RESET
- **Product Selection** - PRODUCT 1, 2, 3
- **OBS Controls** - PUSH LIVE, CLEAR (future)

### Custom Icons

Download custom icons for each button to make your Stream Deck more visual:
- Use microphone icon for AUDIO
- Use camera icon for IMAGE
- Use barcode icon for BARCODE
- Use numbers 1, 2, 3 for product selection
- Use broadcast icon for PUSH LIVE
- Use refresh icon for RESET

## Support

For issues or questions:
- GitHub: https://github.com/FAMEparty/live-product-search
- Check the main README.md for general application documentation

---

**Last Updated:** December 2025
