import { useState, useEffect, useCallback } from "react";

import {
  DEFAULT_PREFERENCES,
  STORAGE_KEY,
  normalizePreferences
} from "../config/designPreferences";

function loadStoredPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    return normalizePreferences(JSON.parse(stored));
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function useDesignPreferences() {
  const [preferences, setPreferencesState] = useState(loadStoredPreferences);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setPreferences = useCallback((updates) => {
    setPreferencesState((prev) => normalizePreferences({ ...prev, ...updates }));
  }, []);

  const setProductType = useCallback((productType) => {
    setPreferencesState((prev) => {
      return normalizePreferences({ ...prev, productType });
    });
  }, []);

  const setDesignType = useCallback((designType) => {
    setPreferences({ designType });
  }, [setPreferences]);

  const setColor = useCallback((color) => {
    setPreferences({ selectedColor: color, color });
  }, [setPreferences]);

  return {
    preferences,
    setPreferences,
    setProductType,
    setDesignType,
    setColor,
    setSelectedColor: setColor
  };
}
