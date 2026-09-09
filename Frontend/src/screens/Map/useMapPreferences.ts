import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useReducedMotion } from 'react-native-reanimated';

export function useMapPreferences() {
  const focused = useIsFocused();
  const initialReducedMotion = useReducedMotion();
  const [reducedMotion, setReducedMotion] = useState(initialReducedMotion);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let mounted = true;
    let preferenceRevision = 0;
    const refresh = () => {
      const revision = preferenceRevision;
      void AccessibilityInfo.isReduceMotionEnabled()
        .then((enabled) => {
          if (mounted && revision === preferenceRevision) setReducedMotion(enabled);
        })
        .catch(() => {
          /* Keep the synchronous system preference if unavailable. */
        });
    };
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      preferenceRevision += 1;
      setReducedMotion(enabled);
    });
    const app = AppState.addEventListener('change', (status) => {
      setForeground(status === 'active');
      if (status === 'active') refresh();
    });
    refresh();
    return () => {
      mounted = false;
      motion?.remove();
      app.remove();
    };
  }, []);

  return { reducedMotion, active: focused && foreground };
}
