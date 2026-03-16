# 🦀 Craby Editor - Project Documentation

This document provides an overview of the project structure, file locations, and the core functions used within the Craby Editor ecosystem.

---

## 📂 File & Function Map

| File Name | Primary Purpose | Key Functions |
| :--- | :--- | :--- |
| **`tag.js`** | Analytics & Tracking | `gtag()`, `trackCrabyEvent()`, GTM Injection |
| **`editor.js`** | Core Logic & Text Handling | `initializeEditor()`, `handleInput()`, `saveFile()` |
| **`theme.js`** | UI/UX & Dark Mode | `toggleDarkMode()`, `applySyntaxHighlighting()` |
| **`storage.js`** | Local & Cloud Saving | `autoSaveToLocal()`, `fetchUserFiles()` |
| **`ui-utils.js`** | UI Components | `showNotification()`, `openModal()`, `closeModal()` |

---

## 🛠️ Detailed Function List

### 1. Analytics & Tracking (`tag.js`)
Responsible for monitoring user interaction and application health.
* **`gtag()`**: Interface for Google Analytics 4 data push.
* **`trackCrabyEvent(eventName, params)`**: Global helper to log events to both GTM and the console.
* **Auto-Loader**: Automatically triggers `editor_open` once the page is fully loaded on Vercel.

### 2. Editor Core (`editor.js`)
The "brain" of the application where text processing happens.
* **`handleInput()`**: Listens for keystrokes and updates the preview.
* **`exportFile()`**: Converts the current editor content into a downloadable format (e.g., `.md`, `.txt`).

### 3. Theme Engine (`theme.js`)
Controls how the editor looks.
* **`setTheme(themeName)`**: Switches between Light, Dark, and High Contrast modes.
* **`loadUserPreferences()`**: Remembers the user's chosen theme from the last session.

---

## 🌐 Site Map (Architecture)

Below is the logical flow of the Craby Editor web app:

1.  **Home Page (`/`)**
    * Main Editor Interface
    * Toolbar (Bold, Italic, Links)
    * Live Preview Pane
2.  **Dashboard (`/dashboard`)**
    * File History
    * Recent Documents
3.  **Settings (`/settings`)**
    * Theme Customization
    * Account Integration
4.  **About/Help (`/docs`)**
    * Keyboard Shortcuts
    * Markdown Guide

---

## 💡 Additional Information

* **Hosting:** Currently optimized for deployment on **Vercel**.
* **Tracking IDs:** * GTM: `GTM-TTVQBL6S`
    * GA4: `G-Z0BGJ1913H`
* **Debugging:** Use the browser console to see `[Analytics]` logs for real-time event verification.
