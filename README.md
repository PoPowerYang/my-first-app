# US States Travel Map 🗺️

A React Native (Expo) app that tracks which US states you've visited by extracting GPS data from your photos.

## Features

- **Interactive Map** — View all 50 US states colored with a four-color algorithm
- **Photo Geotagging** — Pick a photo from your library; the app reads its EXIF GPS data and marks the state as visited
- **Persistent Storage** — Visited states are saved locally via AsyncStorage

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Project Structure

```
app/              → Screens & navigation (Expo Router file-based routing)
  _layout.tsx     → Root Stack navigator with theme support
  index.tsx       → Dashboard / home screen
  map.tsx         → Map screen with GeoJSON state boundaries
assets/           → Static assets (images, GeoJSON data)
constants/        → Theme colors, fonts, shadows, and shared styles
hooks/            → Custom React hooks (color scheme, visited states)
utils/            → Runtime utilities (GPS extraction, map coloring)
scripts/          → Dev scripts (project reset)
```

## Tech Stack

- [Expo](https://expo.dev) (SDK 54) with [Expo Router](https://docs.expo.dev/router/introduction/)
- [react-native-maps](https://github.com/react-native-maps/react-native-maps) for map rendering
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) for photo selection
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) for reverse geocoding
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for persistence
