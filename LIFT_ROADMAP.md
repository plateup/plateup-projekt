# Lift App Implementation Roadmap 🏋️‍♂️

This document outlines the features and UI/UX elements inspired by the [Lift: Workout Tracker](https://apps.apple.com/pl/app/lift-workout-tracker-gym-log/id6745340505) app that are being integrated into this project.

## 1. Authentication & User Profile
- [x] **Username-based Registration**: Added a `username` field during sign-up.
- [x] **Username-based Login**: Logic to look up email by username for authentication.
- [ ] **Profile Setup**: Initial flow to set fitness goals (Hypertrophy, Strength, Endurance).
- [ ] **Muscle Recovery Tracking**: Backend logic to calculate recovery percentage per muscle group.

## 2. Dashboard (Home Screen) 🏠
- [x] **Personalized Greeting**: "Hey, {Username}" header.
- [x] **Horizontal Calendar**:
  - [x] Scrollable horizontal list of days (e.g., 26 Thu).
  - [x] Date selection logic.
  - [x] Visual indicators (dots) for days with completed workouts.
- [ ] **Goal Status Card**: Card showing current training goal (e.g., "Hypertrophy") and progress.
- [ ] **Muscle Recovery (Heatmap)**: 
  - [ ] Front/Back human silhouette with color-coded muscle fatigue.
  - [ ] Individual muscle recovery percentages (Chest, Quads, etc.).
- [ ] **Weekly Volume Chart**: 
  - [ ] Modern bar chart showing volume per day for the last 7 days.
  - [ ] "Weekly Average" and "Comparison to last week" indicators.

## 3. Workout Logging (The Core) ⚡
- [ ] **Live Workout View**:
  - [ ] "Current Session" title and duration timer.
  - [ ] **Exercise Cards**: Clean grouping of sets.
  - [ ] **Set Rows**: Weight, Reps, and a large circular "Check" button.
  - [ ] **Set Types**: Ability to tag sets as "Warmup", "Failure", or "Drop Set".
- [ ] **Smart Rest Timer**:
  - [ ] Automatic trigger after checking a set.
  - [ ] Minimalist circular countdown overlay.
- [ ] **Plate Calculator**: Visual aid for loading barbell weights.

## 4. Exercise Library 📚
- [ ] **Categorization**: Filter by Muscle Group (Chest, Back, Legs) or Equipment (Barbell, Dumbbell).
- [ ] **Search**: Real-time search with exercise previews.
- [ ] **Personal Records**: "Best Set" and "1RM" displayed directly in the library.

## 5. Statistics & Progress 📈
- [ ] **1RM Tracking**: Interactive line charts for main lifts.
- [ ] **Volume Analytics**: Breakdown of volume per muscle group (Pie chart).
- [ ] **Goal Progress**: Circular progress rings for monthly workout targets.

## 5. UI/UX Design System (Lift Style) ✨
- [x] **Dark Mode First**: High-contrast black background (`#000000`) with dark gray cards (`#1C1C1E`).
- [x] **Typography**: Bold, heavy fonts for key data (weights, dates) using SF Pro (Inter as fallback).
- [x] **Rounded Components**: Large corner radii (20px-40px) for a modern iOS feel.
- [ ] **Tactile Feedback**: Subtle animations and transitions during set completion.
- [x] **Bottom Navigation**: Floating-style tab bar with blur effect.

---

## Technical Tasks
1. [x] Initialize `profiles` table in Supabase.
2. [x] Install `date-fns` for calendar logic.
3. [ ] Implement `workouts` and `sets` tables in Supabase.
4. [ ] Build the Muscle Recovery calculation engine.
5. [ ] Create the "Exercise Library" data structure.
