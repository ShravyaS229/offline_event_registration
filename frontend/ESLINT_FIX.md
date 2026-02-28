# ESLint Warning Fix Walkthrough

This document explains the resolution of the `react-hooks/exhaustive-deps` warning in `src/App.js`.

## Problem
The `useEffect` hook in `src/App.js` was using functions like `sendToServer` but did not have them in its dependency array. However, simply adding them would cause an infinite loop because the functions were being recreated on every render.

## Solution
We followed React best practices by:
1. **Memoizing utility functions**: `removeFromLocal` was wrapped in `useCallback(..., [])`.
2. **Memoizing API call functions**: `sendToServer` was wrapped in `useCallback(..., [removeFromLocal])`.
3. **Updating useEffect**: Added `sendToServer` to the dependency array of the auto-sync `useEffect`.

## Changes Summary

### `src/App.js`
- Added `useCallback` to React imports.
- Wrapped `removeFromLocal` with `useCallback`.
- Wrapped `sendToServer` with `useCallback`.
- Added `sendToServer` to `useEffect` dependencies.

## Verification
- **Build Status**: Successful `yarn build`.
- **Warning Status**: `react-hooks/exhaustive-deps` warning is resolved.
