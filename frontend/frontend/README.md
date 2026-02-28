# CSI Expo - Offline Event Registration (Frontend)

This is the frontend application for the CSI Expo Event Registration system. It is designed to handle participant registrations reliably, even in environments with unstable internet connectivity.

## 🚀 Overview

The application provides a seamless registration experience by utilizing local storage as a buffer. Participants can fill out their details at any time, and the system ensures that the data reaches the backend server as soon as a connection is available.

## ✨ Core Features

-   **Offline First Registration**: Submit registration forms even without an internet connection.
-   **Automatic Synchronization**: Automatically detects when the device is back online and syncs pending registrations in chronological order.
-   **Admin Dashboard**: A dedicated interface for organizers to:
    -   Monitor total, used, and remaining registration slots.
    -   Search through participants by Name, Email, or USN.
    -   Delete invalid or duplicate registrations.
    -   **Export to Excel**: Download the complete list of participants for offline processing.
-   **Responsive Design**: A clean, user-friendly interface optimized for various devices.

## 🛠️ Technology Stack

-   **Framework**: [React](https://reactjs.org/)
-   **Routing**: [React Router](https://reactrouter.com/)
-   **Data Export**: [XLSX](https://www.npmjs.com/package/xlsx)
-   **State Management**: React Hooks (`useState`, `useEffect`, `useCallback`)
-   **Styling**: Vanilla CSS

## ⚙️ How It Works

1.  **Submission**: When a user submits the form, the app checks `navigator.onLine`.
2.  **Offline Storage**: If the device is offline, the data is assigned a timestamp and saved to `localStorage` under the key `offlineRegistrations`.
3.  **Sync Logic**: A `useEffect` hook monitors the browser's `online` event. When the connection is restored:
    -   Cached registrations are retrieved from `localStorage`.
    -   Data is sorted by timestamp to preserve the order of registration.
    -   Registrations are sent to the backend one by one.
    -   Successfully synced items are removed from local storage.

## 📦 Installation & Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    yarn install
    ```

3.  **Environment Configuration**:
    Create a `.env` file based on `.env.example`:
    ```env
    REACT_APP_API_URL=http://localhost:5000
    ```

4.  **Start the development server**:
    ```bash
    yarn start
    ```

## 📝 Recent Updates

-   **ESLint Optimization**: Refactored `App.js` to use `useCallback` for memoizing functions used in `useEffect` dependencies, preventing unnecessary re-renders and potential infinite loops. (See [ESLINT_FIX.md](./ESLINT_FIX.md) for details).
