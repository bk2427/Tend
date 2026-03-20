# Tend.

An AI-powered iOS app that turns a photo of your fridge into five personalized recipes in under 20 seconds — filtered to your dietary preferences and health conditions. Over time, it learns from your food diary and surfaces patterns in how specific ingredients affect how you feel.

Built with React Native (Expo) and Claude AI (Anthropic).

---

## Try It Instantly — No Setup Required

Install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** on your iPhone, then scan the QR code below or open this link:

**→ [Open in Expo Go](https://expo.dev/accounts/bridgetkegelman/projects/TenexApp/updates/408f4020-cc4f-46ca-8d38-9cf6fb6cfd2b)**

The app opens immediately with live Claude AI. No API key, no terminal, no install step needed.

> The app launches with a few pre-filled diary entries so the health insight feature is ready to demo. See **Resetting Demo Data** below if you want a clean slate.

---

## Run Locally from Source

### Requirements

- Node.js v18+ — [nodejs.org](https://nodejs.org)
- Expo Go on your iPhone — [App Store](https://apps.apple.com/app/expo-go/id982107779)
- An Anthropic API key — [console.anthropic.com](https://console.anthropic.com) (free to create)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
cp .env.example .env
# Open .env and replace the placeholder with your real key

# 3. Start the dev server
npm start

# 4. Scan the QR code in Expo Go on your iPhone
```

---

## Resetting Demo Data

The app pre-loads three diary entries on first launch so the AI health insight feature has data to analyze. These are stored on your device and persist across sessions.

**To reset to a clean slate:**
- On your iPhone, long-press the Expo Go icon → **Remove App**, then reinstall from the App Store and re-scan the QR code.
- All diary entries, saved insights, and profile settings will be cleared.

---

## Project Structure

```
app/               Screens (Expo Router file-based routing)
services/          Claude AI integrations (3 functions — detect, generate, insight)
components/        ErrorBoundary, TabBar
constants/         Type definitions, theme, tag constants
context/           Global state + AsyncStorage persistence
assets/            Images and loading animation
```
