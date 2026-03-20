# Tend.

<p align="center">
  <img width="300" src="https://github.com/user-attachments/assets/d52538cc-fcfc-40ee-9e77-77bdc2453743" />
</p>

An AI-powered iOS app that turns a photo of your fridge into five personalized recipes in under 20 seconds — filtered to your dietary preferences and health conditions. Over time, it learns from your food diary and surfaces patterns in how specific ingredients affect how you feel.

Built with React Native (Expo) and Claude AI (Anthropic).

---

## Running the App

### Option A — Live demo link (no setup needed)

If I've shared a live session link with you, just install **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** on your iPhone and scan the QR code. No API key or terminal required.

### Option B — Run it yourself from source

**What you need**
- **[Expo Go](https://apps.apple.com/app/expo-go/id982107779)** on your iPhone
- **Node.js v18+** — [nodejs.org](https://nodejs.org)
- **An Anthropic API key** — [console.anthropic.com](https://console.anthropic.com) (free to create, takes 2 minutes)

```bash
# 1. Clone the repo
git clone https://github.com/bk2427/Tend.git
cd Tend

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# Open .env and paste your Anthropic API key

# 4. Start the dev server
npx expo start --tunnel

# 5. Scan the QR code with Expo Go on your iPhone
```

> The app launches with a few pre-filled diary entries so the AI health insight feature is ready to demo immediately. See **Resetting Demo Data** below if you want a clean slate.

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
