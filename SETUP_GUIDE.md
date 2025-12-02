# Whatnot Product Display - Setup Guide

**Version:** 1.0  
**Author:** Manus AI  
**Last Updated:** December 2, 2025

---

## Overview

The **Whatnot Product Display** system is a voice-activated, broadcast-ready tool designed for live auction streamers on Whatnot. This application enables you to display Amazon product information—including retail prices—in real-time during your live streams using OBS (Open Broadcaster Software). The system integrates with the Elgato Stream Deck for push-to-talk voice control, allowing you to search for products hands-free and display them seamlessly on your stream.

### Key Features

The system provides a complete workflow for displaying product information during live auctions. At its core, the application uses browser-based voice recognition to capture product names spoken during your stream. When you press a designated button on your Stream Deck (or click the on-screen control), the system listens to your voice, transcribes the product name, and automatically searches Amazon for matching results. The search results are then displayed in a broadcast-ready overlay that can be captured by OBS and shown to your viewers.

The interface is divided into two primary views. The **Control Panel** is what you see on your secondary monitor—it contains the push-to-talk button, a live transcript of what you're saying, and controls to push the product display live or reset the system. The **OBS Overlay** is a clean, transparent view designed specifically for OBS Browser Source capture, showing only the product card with corner brackets and HUD-style indicators that match a professional broadcast aesthetic.

### System Architecture

The application is built as a modern web application with both client-side and server-side components. The frontend uses React 19 with Tailwind CSS 4 for styling, providing a responsive and visually striking interface. The backend is powered by Express and tRPC, which handles API requests for Amazon product searches and Stream Deck webhook integrations. Voice recognition is handled entirely in the browser using the Web Speech API, which means no additional software or API keys are required for speech-to-text functionality.

Data synchronization between the control panel and the OBS overlay happens through localStorage, allowing the two browser windows to communicate changes in real-time. This approach ensures that when you update the product display on your control panel, the OBS overlay instantly reflects those changes without requiring a page refresh.

---

## Prerequisites

Before you begin setting up the Whatnot Product Display system, ensure you have the following hardware and software ready.

### Hardware Requirements

You will need a computer capable of running OBS and a web browser simultaneously. The system has been tested on both **Windows 10/11** and **macOS 12+**. A dual-monitor setup is highly recommended, as it allows you to keep the control panel on your secondary monitor while OBS captures the overlay on the primary display. While not strictly required, an **Elgato Stream Deck** (any model) significantly enhances the workflow by providing dedicated physical buttons for push-to-talk and scene switching.

### Software Requirements

The following software must be installed on your streaming computer:

- **OBS Studio** (version 28.0 or later) for capturing and broadcasting your stream
- **Google Chrome** or **Microsoft Edge** (Chromium-based browsers) for voice recognition support
- **Node.js** (version 18 or later) and **pnpm** for running the development server locally
- **Elgato Stream Deck Software** (if using a Stream Deck device)

### Browser Compatibility

Voice recognition is a critical component of this system, and it relies on the Web Speech API. This API is currently supported in **Google Chrome**, **Microsoft Edge**, and other Chromium-based browsers. **Firefox** and **Safari** do not fully support the Web Speech API at this time, so you must use a Chromium-based browser for the voice recognition feature to work.

---

## Installation

Follow these steps to install and run the Whatnot Product Display application on your local machine.

### Step 1: Clone or Download the Project

If you have received the project as a ZIP file, extract it to a location on your computer (e.g., `C:\Projects\whatnot-product-display` on Windows or `~/Projects/whatnot-product-display` on macOS). If you have access to the Git repository, you can clone it using the command line:

```bash
git clone <repository-url>
cd whatnot-product-display
```

### Step 2: Install Dependencies

Open a terminal or command prompt in the project directory and run the following command to install all required Node.js packages:

```bash
pnpm install
```

This command will download and install all dependencies listed in the `package.json` file, including React, Express, tRPC, and Tailwind CSS.

### Step 3: Start the Development Server

Once the dependencies are installed, start the local development server by running:

```bash
pnpm dev
```

The server will start on **http://localhost:3000**. You should see output in the terminal indicating that the server is running. Open your browser and navigate to `http://localhost:3000` to verify that the application loads correctly.

### Step 4: Access the Control Panel and Overlay

The application has two primary routes:

- **Control Panel:** `http://localhost:3000/` (this is your main interface)
- **OBS Overlay:** `http://localhost:3000/overlay` (this is the view OBS will capture)

Open both URLs in separate browser tabs or windows. The control panel should display the "Operator Console" with the push-to-talk button, while the overlay should show a transparent background with the product card.

---

## OBS Configuration

To display the product information on your live stream, you need to configure OBS to capture the overlay view.

### Adding a Browser Source

In OBS Studio, create a new **Browser Source** by following these steps:

1. In your OBS scene, click the **+** button in the **Sources** panel.
2. Select **Browser** from the list of source types.
3. Name the source "Product Display Overlay" (or any name you prefer).
4. In the **URL** field, enter: `http://localhost:3000/overlay`
5. Set the **Width** to `1920` and **Height** to `1080` (or match your stream resolution).
6. Check the box for **Shutdown source when not visible** to save resources.
7. Click **OK** to add the source.

### Positioning and Cropping

The overlay is designed to be flexible in terms of positioning. You can resize and crop the browser source to fit your desired layout. For example, if you want to show the product card in the bottom-right corner of your stream, you can:

1. Right-click the "Product Display Overlay" source in OBS.
2. Select **Transform > Edit Transform**.
3. Adjust the **Position** and **Bounding Box Size** to fit your layout.
4. Use the **Crop** settings to remove any unwanted transparent areas.

The product card itself has a maximum width of `28rem` (approximately 448 pixels), so you can crop the browser source to that width for a cleaner look.

### Using OBS Studio Mode (Preview)

OBS Studio Mode allows you to preview scenes before pushing them live. This is highly recommended for this workflow, as it lets you verify that the product information is correct before showing it to your viewers.

To enable Studio Mode:

1. Click the **Studio Mode** button in the bottom-right corner of OBS.
2. You will now see a **Preview** panel on the left and a **Program** panel on the right.
3. When you press "PUSH LIVE" in the control panel, you can manually transition the scene in OBS by clicking the **Transition** button.

---

## Stream Deck Integration

The Elgato Stream Deck provides physical buttons that can trigger actions in the Whatnot Product Display system. This section explains how to configure your Stream Deck to control the application.

### Installing the Required Plugin

To send HTTP requests from your Stream Deck, you need to install a plugin that supports webhook or API calls. Two popular options are:

- **API Request** (by API Monkey) - Available in the Stream Deck Marketplace
- **Web Requests** - A free plugin for sending HTTP GET/POST requests

Install one of these plugins by opening the **Stream Deck Software**, navigating to the **Stream Deck Store**, and searching for "API Request" or "Web Requests". Follow the on-screen instructions to install the plugin.

### Configuring the "Push to Talk" Button

Once the plugin is installed, you can configure a button to trigger the "Start Listening" action:

1. Drag the **API Request** or **Web Requests** action onto an empty button on your Stream Deck.
2. Set the **Request Type** to **POST**.
3. Set the **URL** to: `http://localhost:3000/api/trpc/streamdeck.startListen`
4. Leave the **Headers** and **Body** fields empty (the default tRPC endpoint handles this).
5. Customize the button icon and label (e.g., "🎤 LISTEN").

When you press this button, the application will start listening for your voice input.

### Configuring the "Push Live" Button

Similarly, configure a second button to trigger the "Push Live" action:

1. Drag the **API Request** or **Web Requests** action onto another button.
2. Set the **Request Type** to **POST**.
3. Set the **URL** to: `http://localhost:3000/api/trpc/streamdeck.pushLive`
4. Customize the button icon and label (e.g., "📺 GO LIVE").

When you press this button, the status of the product display will change to "LIVE", and you can manually transition the scene in OBS.

### Alternative: Using OBS Hotkeys

If you do not have a Stream Deck, you can configure OBS hotkeys to switch scenes manually. In OBS, go to **Settings > Hotkeys** and assign a keyboard shortcut to the "Transition" action in Studio Mode. You can then press this hotkey after verifying the product preview in the control panel.

---

## Usage Workflow

This section describes the step-by-step process for using the Whatnot Product Display system during a live stream.

### Step 1: Start the Application

Before you begin streaming, ensure that the development server is running (`pnpm dev`) and that both the control panel (`http://localhost:3000/`) and the OBS overlay (`http://localhost:3000/overlay`) are open in your browser.

### Step 2: Activate Voice Listening

When you are ready to search for a product, press the **PUSH TO TALK** button in the control panel (or the corresponding Stream Deck button). The button will turn red, and the status indicator will change to "MIC ACTIVE". You will also see a live transcript appear in the "Control Deck" panel as you speak.

### Step 3: Say the Product Name

Clearly say the name of the product you want to display. For example, if you are auctioning a pair of Nike Air Max shoes, say "Nike Air Max" into your microphone. The system will transcribe your speech in real-time and display it in the transcript box.

### Step 4: Wait for Auto-Search

Once you stop speaking and the microphone is no longer active, the system will automatically trigger an Amazon search using the transcribed text. The status will change to "SEARCHING", and after a brief delay (approximately 1-2 seconds), the product card will populate with the search results. The status will then change to "READY".

### Step 5: Verify the Preview

Check the OBS Preview panel (if using Studio Mode) or the control panel's "OBS PREVIEW" section to ensure that the product information is correct. The product card will display the product title, an image, and the retail price.

### Step 6: Push Live

When you are satisfied with the preview, press the **PUSH LIVE** button in the control panel (or the corresponding Stream Deck button). The status will change to "ON AIR", and the product card will be highlighted with a red indicator. In OBS, you can now transition to the scene containing the product display overlay.

### Step 7: Reset for the Next Product

After you have finished displaying the product, press the **RESET SYSTEM** button in the control panel to clear the product data and return the status to "IDLE". You can then repeat the process for the next product.

---

## Customization

The Whatnot Product Display system is designed to be modular and customizable. This section provides guidance on how to modify the appearance and behavior of the application.

### Changing the Color Scheme

The application uses a "Cyber-Industrial" color scheme with **Amber** (#f59e0b) as the primary accent color and **Slate 900** (#0f172a) as the background. If you want to change these colors, you can edit the CSS variables in the `client/src/index.css` file.

For example, to change the primary accent color to **Cyan**, update the following line:

```css
--primary: oklch(0.769 0.188 70.08); /* Amber 500 */
```

to:

```css
--primary: oklch(0.704 0.14 208.41); /* Sky 500 (Cyan) */
```

After making changes, the application will automatically reload in the browser.

### Modifying the Product Card Layout

The product card component is located in `client/src/components/ProductCard.tsx`. You can modify the layout, font sizes, or corner bracket styles by editing this file. For example, to increase the size of the price text, change the `text-2xl` class to `text-4xl` in the following line:

```tsx
<div className="text-2xl font-bold text-primary font-mono tracking-tight">
```

### Adding Real Amazon Scraping

Currently, the Amazon search returns mock data. To implement real Amazon scraping, you will need to modify the `server/routers.ts` file and add a scraping library such as **Cheerio** or **Puppeteer**. Alternatively, you can integrate the **Amazon Product Advertising API** (requires an Amazon affiliate account and API key).

Here is an example of how you might use Cheerio to scrape Amazon search results:

```typescript
import axios from "axios";
import * as cheerio from "cheerio";

const response = await axios.get(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
const $ = cheerio.load(response.data);
const firstProduct = $('[data-component-type="s-search-result"]').first();
const title = firstProduct.find('h2 a span').text();
const price = firstProduct.find('.a-price-whole').text();
const image = firstProduct.find('img').attr('src');
```

Note that Amazon may block scraping attempts, so you may need to use a proxy or rotate user agents.

---

## Troubleshooting

This section addresses common issues you may encounter while setting up or using the Whatnot Product Display system.

### Voice Recognition Not Working

If the voice recognition feature is not working, check the following:

- **Browser Compatibility:** Ensure you are using Google Chrome or Microsoft Edge. Firefox and Safari do not support the Web Speech API.
- **Microphone Permissions:** The browser will prompt you to allow microphone access the first time you press "PUSH TO TALK". Make sure you click "Allow".
- **HTTPS Requirement:** The Web Speech API requires a secure context (HTTPS). If you are running the application locally, `localhost` is considered secure, so this should not be an issue. However, if you deploy the application to a remote server, you must use HTTPS.

### OBS Overlay Not Updating

If the OBS overlay is not updating when you change the product in the control panel, try the following:

- **Refresh the Browser Source:** Right-click the "Product Display Overlay" source in OBS and select **Refresh**. This will reload the browser source and sync it with the latest data.
- **Check localStorage:** Open the browser console (F12) in the OBS overlay tab and type `localStorage.getItem('obs_product_data')`. If this returns `null`, the data is not being saved correctly. Ensure that both the control panel and the overlay are open in the same browser (not in different browsers or incognito mode).

### Stream Deck Buttons Not Working

If your Stream Deck buttons are not triggering actions in the application, verify the following:

- **Correct URL:** Ensure that the URL in the Stream Deck action is exactly `http://localhost:3000/api/trpc/streamdeck.startListen` (or `.pushLive`). Do not include a trailing slash.
- **Server Running:** Make sure the development server is running (`pnpm dev`). If the server is not running, the Stream Deck will not be able to send requests.
- **Firewall:** Check that your firewall is not blocking local HTTP requests on port 3000.

### Product Card Not Displaying in OBS

If the product card is not visible in OBS, check the following:

- **Browser Source URL:** Ensure that the URL in the OBS Browser Source is `http://localhost:3000/overlay` (not the root URL).
- **Transparent Background:** The overlay has a transparent background by default. If you are testing in OBS, make sure you have a background scene (e.g., a webcam or video feed) so you can see the product card.
- **CSS Rendering:** Some OBS versions have issues rendering certain CSS properties. If the product card is not displaying correctly, try simplifying the CSS in `client/src/components/ProductCard.tsx`.

---

## Future Enhancements

The Whatnot Product Display system is designed as a prototype with the potential to evolve into a full-fledged SaaS product. Here are some planned enhancements for future versions:

### Real-Time Amazon Data

The current version uses mock data for Amazon product searches. A future version will integrate with the Amazon Product Advertising API or a web scraping service to fetch real-time product titles, prices, and images. This will require users to provide their own Amazon API keys or affiliate credentials.

### Multi-User Support

To support multiple Whatnot sellers, the application will be upgraded to include user authentication and database storage. Each user will have their own account, and their product search history will be saved for future reference. This will also enable features like product favorites and custom pricing overrides.

### OBS WebSocket Integration

Currently, the "PUSH LIVE" button only changes the status indicator. A future version will integrate with the **OBS WebSocket API** to automatically switch scenes in OBS when you press the button. This will eliminate the need for manual scene transitions and make the workflow even more seamless.

### Custom Product Templates

Users will be able to create custom product card templates with different layouts, fonts, and color schemes. This will allow each seller to match the product display to their unique brand identity.

### Analytics and Reporting

The application will track which products are displayed most frequently and provide analytics on viewer engagement. This data can help sellers optimize their product selection and pricing strategies.

---

## Conclusion

The Whatnot Product Display system provides a professional, broadcast-ready solution for displaying Amazon product information during live auctions. By combining voice recognition, Stream Deck integration, and OBS overlays, the system streamlines the workflow and enhances the viewer experience. With the modular architecture and clear documentation provided in this guide, you can customize the application to fit your specific needs and scale it for future use as a SaaS product.

For questions, feedback, or feature requests, please contact the development team or refer to the project repository for updates.

---

**Author:** Manus AI  
**Version:** 1.0  
**Last Updated:** December 2, 2025
