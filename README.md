# Snitch 2.0 🛍️

A full-stack, feature-rich **fashion e-commerce mobile app** built with React Native & Expo. Browse products, manage a cart, save to wishlist, checkout with saved addresses & payment methods, and track orders — all powered by Firebase.

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-blue?logo=react" />
  <img src="https://img.shields.io/badge/Expo_SDK-54-black?logo=expo" />
  <img src="https://img.shields.io/badge/Firebase-v12-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" />
  <img src="https://img.shields.io/github/actions/workflow/status/shivenchandra/snitch-2.0/build-android.yml?label=APK%20Build&logo=github" />
</p>

---

## 📱 Download APK

> **Latest Android APK** → [Releases](https://github.com/shivenchandra/snitch-2.0/releases/latest)

Install on any Android device:
1. Download the `.apk` from Releases
2. Go to **Settings → Security → Install unknown apps** and enable it
3. Open the downloaded APK and install

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 **Home Feed** | Banner carousel, category grid, featured products |
| 🔍 **Search** | Real-time product search with filtering |
| 🛍️ **Product Detail** | Size & color selection, image gallery, wishlist toggle |
| 🛒 **Cart** | Add/remove items, quantity control, live total |
| ❤️ **Wishlist** | Save & manage favourite products (synced to Firebase) |
| 📦 **Orders** | Full order history with status tracking & cancellation |
| 📍 **Addresses** | Save multiple shipping addresses |
| 💳 **Payment Methods** | Save & manage payment cards |
| 🔐 **Auth** | Email/password sign up & login via Firebase Auth |
| 🌍 **Currency** | Toggle between INR (₹) and USD ($) |
| 🛠️ **Admin Panel** | Add/delete products, manage & update order statuses |

---

## 🛠️ Tech Stack

- **React Native 0.81** + **Expo SDK 54**
- **Expo Router v6** — file-based navigation
- **Firebase v12** — Firestore database + Firebase Auth
- **React Native Reanimated v4** — smooth animations
- **React Native Gesture Handler** — swipe gestures
- **React Navigation** — Drawer + Bottom Tabs
- **TypeScript** — full type safety
- **GitHub Actions** — automated APK builds

---

## 📂 Project Structure

```
client/
├── app/                     # Expo Router pages
│   ├── (auth)/              # Login & Signup screens
│   ├── (drawer)/            # Drawer navigation screens
│   │   ├── (tabs)/          # Bottom tab screens (Home, Cart, etc.)
│   │   ├── admin.tsx        # Admin dashboard
│   │   ├── orders.tsx       # Order history
│   │   ├── addresses.tsx    # Saved addresses
│   │   └── payment.tsx      # Payment methods
│   ├── product/[id].tsx     # Product detail screen
│   ├── checkout.tsx         # Checkout flow
│   └── search.tsx           # Search screen
├── components/              # Reusable UI components
├── context/                 # React Context (Auth, Cart, Wishlist, etc.)
├── services/                # Firebase service functions
├── constants/               # Colors, product data
├── types/                   # TypeScript interfaces
└── utils/                   # Storage & validation helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/shivenchandra/snitch-2.0.git
cd snitch-2.0/client

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with **Expo Go** (Android) or **Camera app** (iOS).

### Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Replace the config in `config/firebase.ts` with your own Firebase credentials

---

## 🤖 CI/CD — Automated APK Build

This project uses **GitHub Actions** to automatically build and release the Android APK on every push to `main`.

The workflow:
1. Sets up Java 17 + Android SDK on an Ubuntu runner
2. Runs `expo prebuild` to generate the native Android project
3. Builds with Gradle (`./gradlew assembleRelease`)
4. Publishes the APK to [GitHub Releases](https://github.com/shivenchandra/snitch-2.0/releases)

To trigger a manual build: **Actions → Build Android APK → Run workflow**

---

## 👨‍💻 Author

**Shiven Chandra**

- GitHub: [@shivenchandra](https://github.com/shivenchandra)

---

## 📄 License

This project is for portfolio and educational purposes.
