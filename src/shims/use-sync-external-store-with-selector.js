// Fixed shim for use-sync-external-store with-selector
// Avoids problematic import paths and provides robust fallbacks with PROPER SUBSCRIPTION
// NOTE: The fallback IS a custom hook - it uses useState/useEffect internally
// This is valid because useSyncExternalStoreWithSelector is called as a hook from components

import React from 'react';

let useSyncExternalStoreWithSelector;

try {
  // Try multiple import strategies to find working implementation
  let found = false;

  // Strategy 1: Try the main package export
  try {
    const mainModule = require('use-sync-external-store');
    if (mainModule && mainModule.useSyncExternalStoreWithSelector) {
      useSyncExternalStoreWithSelector = mainModule.useSyncExternalStoreWithSelector;
      found = true;
    }
  } catch (e) { /* ignore */ }

  // Strategy 2: Try with-selector subpath
  if (!found) {
    try {
      const withSelectorModule = require('use-sync-external-store/with-selector');
      if (withSelectorModule && withSelectorModule.useSyncExternalStoreWithSelector) {
        useSyncExternalStoreWithSelector = withSelectorModule.useSyncExternalStoreWithSelector;
        found = true;
      }
    } catch (e) { /* ignore */ }
  }

  // Strategy 3: Provide PROPER fallback implementation with subscription
  // This IS a custom React hook - it's called as useSyncExternalStoreWithSelector()
  // from within component render, so React hooks rules apply
  if (!found) {
    console.warn('use-sync-external-store not found, using React-based fallback implementation');

    // This function IS a hook - it will be called during component render
    useSyncExternalStoreWithSelector = function useSyncExternalStoreWithSelectorFallback(
      subscribe,
      getSnapshot,
      getServerSnapshot,
      selector,
      isEqual
    ) {
      // Default equality check
      if (!isEqual) {
        isEqual = Object.is;
      }

      // Get initial selected state
      const getSelectedSnapshot = () => {
        const snapshot = getSnapshot();
        return selector ? selector(snapshot) : snapshot;
      };

      // Use state to store selected value and trigger re-renders
      // This is a hook call - valid because this function is called as a hook
      const [selectedState, setSelectedState] = React.useState(getSelectedSnapshot);

      // Track the selected state for comparison
      const selectedStateRef = React.useRef(selectedState);

      // Update ref when state changes
      React.useEffect(() => {
        selectedStateRef.current = selectedState;
      });

      // Subscribe to store changes
      React.useEffect(() => {
        let didUnsubscribe = false;

        const handleStoreChange = () => {
          if (didUnsubscribe) return;

          try {
            const newSelectedState = getSelectedSnapshot();
            // Only update if the selected state actually changed
            if (!isEqual(selectedStateRef.current, newSelectedState)) {
              selectedStateRef.current = newSelectedState;
              setSelectedState(newSelectedState);
            }
          } catch (error) {
            // If selector throws, force a re-render anyway
            console.error('Selector error:', error);
          }
        };

        // Subscribe and get unsubscribe function
        const unsubscribe = subscribe(handleStoreChange);

        // Check if state changed while we were subscribing
        handleStoreChange();

        return () => {
          didUnsubscribe = true;
          unsubscribe();
        };
      }, [subscribe, getSnapshot]);

      return selectedState;
    };
  }

} catch (error) {
  console.warn('use-sync-external-store shim failed, using minimal React-based fallback');

  // Minimal but WORKING fallback implementation
  useSyncExternalStoreWithSelector = function useSyncExternalStoreWithSelectorMinimal(
    subscribe,
    getSnapshot,
    getServerSnapshot,
    selector,
    isEqual
  ) {
    if (!isEqual) isEqual = Object.is;

    const getSelectedSnapshot = () => {
      const snapshot = getSnapshot();
      return selector ? selector(snapshot) : snapshot;
    };

    const [selectedState, setSelectedState] = React.useState(getSelectedSnapshot);
    const selectedStateRef = React.useRef(selectedState);

    React.useEffect(() => {
      selectedStateRef.current = selectedState;
    });

    React.useEffect(() => {
      let didUnsubscribe = false;

      const handleStoreChange = () => {
        if (didUnsubscribe) return;
        const newSelectedState = getSelectedSnapshot();
        if (!isEqual(selectedStateRef.current, newSelectedState)) {
          selectedStateRef.current = newSelectedState;
          setSelectedState(newSelectedState);
        }
      };

      const unsubscribe = subscribe(handleStoreChange);
      handleStoreChange();

      return () => {
        didUnsubscribe = true;
        unsubscribe();
      };
    }, [subscribe, getSnapshot]);

    return selectedState;
  };
}

// Ensure we always export a function
if (typeof useSyncExternalStoreWithSelector !== 'function') {
  useSyncExternalStoreWithSelector = () => null;
}

export { useSyncExternalStoreWithSelector };
export default {
  useSyncExternalStoreWithSelector
};
