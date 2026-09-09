import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import type { RegionId } from '../../types/ids';
import { canFinishEntry, INITIAL_MAP_STATE, mapReducer } from './mapMachine';
import type { MapEvent } from './mapMachine';

export function useMapController(active: boolean, onEnter: (id: RegionId) => void) {
  const [state, setState] = useState(INITIAL_MAP_STATE);
  const stateRef = useRef(state);
  const activeRef = useRef(active);
  const mounted = useRef(true);
  const enterRef = useRef(onEnter);
  activeRef.current = active;
  enterRef.current = onEnter;

  // Update the ref synchronously: two presses in a single React batch must not
  // both confirm, and queued UI-thread callbacks must see the newest revision.
  const send = useCallback((event: MapEvent) => {
    if (!mounted.current) return;
    const next = mapReducer(stateRef.current, event);
    if (next !== stateRef.current) {
      stateRef.current = next;
      setState(next);
    }
  }, []);

  const reset = useCallback(() => send({ type: 'reset' }), [send]);
  const cancel = useCallback(() => send({ type: 'cancel' }), [send]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!active) reset();
  }, [active, reset]);

  useFocusEffect(
    useCallback(() => {
      const back = BackHandler.addEventListener('hardwareBackPress', () => {
        if (stateRef.current.phase === 'idle') return false;
        cancel();
        return true;
      });
      return () => {
        back.remove();
        reset();
      };
    }, [cancel, reset])
  );

  const press = useCallback(
    (regionId: RegionId) => {
      if (!activeRef.current) return;
      const before = stateRef.current;
      send({ type: 'press', regionId });
      if (before !== stateRef.current) {
        void Haptics.selectionAsync().catch(() => {
          /* Optional feedback. */
        });
      }
    },
    [send]
  );

  const confirm = useCallback(() => {
    if (activeRef.current) send({ type: 'confirm' });
  }, [send]);

  const focusFinished = useCallback(
    (revision: number) => {
      if (activeRef.current) send({ type: 'focusFinished', revision });
    },
    [send]
  );

  const enterFinished = useCallback((revision: number) => {
    if (!mounted.current || !activeRef.current || !canFinishEntry(stateRef.current, revision))
      return;
    const id = stateRef.current.regionId!;
    // Consume the revision before navigating, including with zero-duration motion.
    stateRef.current = { ...stateRef.current, revision: stateRef.current.revision + 1 };
    enterRef.current(id);
  }, []);

  return { state, press, cancel, confirm, focusFinished, enterFinished };
}
