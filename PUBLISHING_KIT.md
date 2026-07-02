# Statedex — App Store & Google Play Publishing Kit

Everything needed to publish **Statedex** (US States Travel Map) to the Apple App Store and Google Play Store. Copy-paste the listing fields, host the privacy policy, capture screenshots, then run the build/submit commands.

- **App name:** Statedex
- **Bundle ID / Package (permanent):** `com.yanweiyang.statedex`
- **Version:** 1.0.0
- **Category:** Travel
- **Age rating:** 4+ (Apple) / Everyone (Google)
- **Support email:** yyang0989@gmail.com

---

## 0. What's already configured

Done in the codebase for you:

- `app.json` — real display name (**Statedex**), permanent bundle ID + Android package (`com.yanweiyang.statedex`), removed the stray `RECORD_AUDIO` permission (app has no audio code), set Android `permissions: []`, and pre-answered Apple's encryption question (`ITSAppUsesNonExemptEncryption: false`).
- `eas.json` — build profiles (development / preview / production) with remote build-number management and auto-increment on production.
- `privacy-policy.html` — ready to host (see §3).

---

## 1. Apple App Store listing (copy-paste)

| Field | Value |
|---|---|
| **App Name** (30 char max) | Statedex |
| **Subtitle** (30 char max) | Collect all 50 US states |
| **Primary category** | Travel |
| **Secondary category** (optional) | Navigation |
| **Age rating** | 4+ |
| **Support URL** | (your hosted page / GitHub repo URL) |
| **Marketing/Privacy Policy URL** | (hosted privacy-policy.html — see §3) |

**Promotional text** (170 char max, editable anytime without review):
> Turn your photo library into a travel map. Pick a photo and Statedex reads where it was taken, then fills in the states you've visited. How many of the 50 can you collect?

**Keywords** (100 char max, comma-separated, no spaces after commas):
```
travel,states,map,us,trip,vacation,road trip,geography,tracker,passport,visited,journal,adventure
```

**Description:**
```
Statedex turns your photo library into a map of everywhere you've been.

Pick a photo and Statedex reads the location stored in it, then automatically marks the U.S. state where it was taken. No manual check-ins, no typing — just add a photo and watch your map fill in.

HOW IT WORKS
• Choose a photo from your library
• Statedex reads the photo's embedded GPS location on your device
• The matching state lights up on your interactive map of all 50 states
• Hit milestones as you collect more states

FEATURES
• Interactive map of all 50 U.S. states
• Automatic state detection from your photos
• Travel timeline of when you visited each state
• Milestones and unlocks as your collection grows
• Everything stays on your device

PRIVACY FIRST
Statedex works without an account. Your visited states are stored only on your device. We don't run analytics, we don't show ads, and we never upload your photos.

How many states can you collect?
```

---

## 2. Google Play listing (copy-paste)

| Field | Value |
|---|---|
| **App name** (30 char max) | Statedex |
| **Category** | Travel & Local |
| **Content rating** | Everyone |
| **Contact email** | yyang0989@gmail.com |
| **Privacy Policy URL** | (hosted privacy-policy.html — see §3) |

**Short description** (80 char max):
```
Turn your photos into a travel map and collect all 50 US states you've visited.
```

**Full description** (4000 char max):
```
Statedex turns your photo library into a map of everywhere you've been.

Pick a photo and Statedex reads the location stored in it, then automatically marks the U.S. state where it was taken. No manual check-ins, no typing — just add a photo and watch your map fill in.

HOW IT WORKS
• Choose a photo from your library
• Statedex reads the photo's embedded GPS location on your device
• The matching state lights up on your interactive map of all 50 states
• Hit milestones as you collect more states

FEATURES
• Interactive map of all 50 U.S. states
• Automatic state detection from your photos
• Travel timeline of when you visited each state
• Milestones and unlocks as your collection grows
• Everything stays on your device

PRIVACY FIRST
Statedex works without an account. Your visited states are stored only on your device. We don't run analytics, we don't show ads, and we never upload your photos.

How many states can you collect?
```

---

## 3. Privacy policy (required by both stores)

Both stores require a **publicly reachable URL**. `privacy-policy.html` is ready to host. Easiest free options:

- **GitHub Pages** — push the repo, enable Pages, the file is served at `https://<username>.github.io/<repo>/privacy-policy.html`.
- **Gist / any static host** — paste the HTML and use the raw/published URL.

Use that URL in both listings (Apple: App Privacy → Privacy Policy URL; Google: Store listing → Privacy Policy).

---

## 4. App privacy questionnaires

**Apple — App Privacy:** Answer **"Data Not Collected."** Statedex sends nothing to servers you control, has no analytics/ads, and reverse-geocoding is handled by the OS, not by you.

**Google Play — Data safety:**
- Does your app collect or share any of the required user data types? → **No.** Photos are processed on-device and not transmitted to you; visited states are stored locally.
- Is all user data encrypted in transit? → N/A (no data leaves the device to you).
- Do you provide a way to request data deletion? → Data lives only on-device; deleting the app removes it.

> Note on location: the app converts photo GPS to a state name using the OS geocoder, which may send coordinates to Apple/Google. This is disclosed in the privacy policy. It is not data *you* collect, so "no collection" is accurate for both questionnaires.

---

## 5. Screenshots & graphics you need to capture

These must come from the running app (I can help capture them from a simulator/emulator).

**Apple App Store**
- iPhone 6.9" display: **1320 × 2868** (or 6.5": 1242 × 2688) — at least 1, up to 10.
- iPad 13" display: **2048 × 2732** — **required because `supportsTablet: true`.**
  - To skip iPad screenshots for a faster first release, set `ios.supportsTablet` to `false` in app.json (tell me and I'll flip it).

**Google Play**
- Phone screenshots: at least 2, min 1080 px on the short side (9:16).
- **Feature graphic: 1024 × 500** (required).
- App icon: 512 × 512 (already have `assets/images/icon.png` — export at 512).

---

## 6. Build & submit commands (run in your project terminal)

```bash
# one-time: install the EAS CLI
npm install -g eas-cli

# log in to your Expo account
eas login

# link this project to EAS (writes a projectId into app.json)
eas init

# build both platforms for the stores
eas build --platform all --profile production
#   - iOS: let EAS manage credentials (creates your distribution cert + provisioning profile)
#   - Android: let EAS generate the upload keystore
#   - builds run in the cloud (~15-25 min each); you'll get download/dashboard links

# after builds succeed, submit to the stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

For the **first** submission, uploading manually can be more reliable than `eas submit`:
- **iOS:** download the `.ipa` from the EAS dashboard → upload with **Transporter** (Mac App Store) → it appears in App Store Connect → attach to the version → submit for review.
- **Android:** download the `.aab` → Play Console → Production (or Internal testing) → Create release → upload.

---

## 7. Submission checklist

**Apple (App Store Connect → apps)**
- [ ] Create app record (name Statedex, bundle ID com.yanweiyang.statedex, SKU e.g. `statedex-001`)
- [ ] Fill listing (§1), upload iPhone (+ iPad) screenshots
- [ ] App Privacy → Data Not Collected + privacy policy URL
- [ ] Age rating questionnaire → 4+
- [ ] Attach the build from EAS/Transporter
- [ ] Export compliance: already pre-answered (no non-exempt encryption)
- [ ] Submit for review

**Google (Play Console → create app)**
- [ ] Create app (Statedex, App, Free)
- [ ] Store listing (§2) + phone screenshots + feature graphic + 512 icon
- [ ] Content rating questionnaire → Everyone
- [ ] Data safety (§4) → no data collected
- [ ] Target audience, ads (No), news (No), government (No)
- [ ] App content: privacy policy URL
- [ ] Create Production release → upload `.aab` → roll out → send for review

**Typical review time:** Apple ~1-3 days, Google a few hours to a few days (first submission can take longer).
