# WEXO Mobile App - Build Guide

This directory contains the Flutter source code for the WEXO worker application.

## 🚀 Prerequisites
- Flutter SDK (Latest Stable version recommended)
- Android Studio / VS Code with Flutter extension
- Supabase Project Credentials

## 🛠️ How to Build
1. **Initialize Project**:
   If you haven't yet, run this in the `mobile` folder:
   ```bash
   flutter create .
   ```
2. **Install Dependencies**:
   ```bash
   flutter pub get
   ```
3. **Configure Supabase**:
   Open `lib/main.dart` and add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4. **Build APK for Latest Android**:
   To support the latest Android phones (SDK 34+), ensure your `android/app/build.gradle` has:
   ```gradle
   compileSdkVersion 34
   targetSdkVersion 34
   ```
   
   Then run:
   ```bash
   flutter build apk --release
   ```

## 📱 Features Implemented
- **Jobs Screen**: View and start assigned tasks with 3D UI.
- **Attendance**: 1-tap animated Punch-in/Out.
- **Earnings**: Live balance tracking and job history.
- **Glassmorphism UI**: Premium mobile-first design.
