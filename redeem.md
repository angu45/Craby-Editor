It looks like you're setting up the tracking infrastructure for Craby Editor. I've organized the details from your JavaScript file into a clean, professional README.md file.
This documentation explains what the script does, the IDs used, and how to trigger events so other developers (or your future self) can understand it easily.
# Craby Editor - Analytics & Tracking System

This repository contains the configuration for the **Google Tag Manager (GTM)** and **Google Analytics 4 (GA4)** integration used in the Craby Editor web application.

## 📊 Tracking Identifiers

| Service | ID |
| :--- | :--- |
| **Google Tag Manager** | `GTM-TTVQBL6S` |
| **Google Analytics (GA4)** | `G-Z0BGJ1913H` |

---

## 🛠️ Implementation Details

The system uses a dual-layer tracking approach:
1.  **Direct GA4 Config:** Initialized via `gtag.js` for immediate page view tracking.
2.  **GTM Container:** Injected asynchronously to manage third-party tags and marketing pixels without changing the code.

### Global Tracking Function
A helper function `trackCrabyEvent` is provided to ensure data is sent consistently to both the `dataLayer` and `gtag`.

```javascript
trackCrabyEvent(eventName, params);

🚀 Usage
Automatic Events
The system automatically tracks the following on window load:
 * Event: editor_open
 * Parameters: { platform: 'Vercel' }
Manual Event Tracking
To track custom user interactions (like button clicks or file saves), use the following syntax:
// Example: Tracking a file save action
trackCrabyEvent('file_saved', {
    file_type: 'markdown',
    file_size: '2kb'
});

📂 File Structure
 * tag.js: The core script handled for GTM injection and global event definitions.
📝 Console Debugging
In the development environment, every event triggered will be logged to the browser console for easy verification:
[Analytics] event_name { params }

---

### What's next?
Would you like me to add a section on how to **test** these tags using Google Tag Assistant, or perhaps help you write more custom event triggers for specific editor features?

