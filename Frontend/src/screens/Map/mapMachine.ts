import type { RegionId } from '../../types/ids';

export type RegionPhase = 'idle' | 'focused' | 'selected' | 'entering';
export type MapState = { regionId: RegionId | null; phase: RegionPhase; revision: number };
export type MapEvent =
  | { type: 'press'; regionId: RegionId }
  | { type: 'focusFinished'; revision: number }
  | { type: 'confirm' }
  | { type: 'cancel' }
  | { type: 'reset' };

export const INITIAL_MAP_STATE: MapState = { regionId: null, phase: 'idle', revision: 0 };

export function mapReducer(state: MapState, event: MapEvent): MapState {
  switch (event.type) {
    case 'reset':
      return { ...INITIAL_MAP_STATE, revision: state.revision + 1 };
    case 'cancel':
      return state.phase === 'entering' || state.phase === 'idle'
        ? state
        : { ...INITIAL_MAP_STATE, revision: state.revision + 1 };
    case 'focusFinished':
      return state.phase === 'focused' && state.revision === event.revision
        ? { ...state, phase: 'selected' }
        : state;
    case 'confirm':
      return state.phase === 'selected'
        ? { ...state, phase: 'entering', revision: state.revision + 1 }
        : state;
    case 'press':
      if (state.phase === 'entering') return state;
      if (state.regionId === event.regionId) {
        return state.phase === 'selected'
          ? { ...state, phase: 'entering', revision: state.revision + 1 }
          : state;
      }
      return { regionId: event.regionId, phase: 'focused', revision: state.revision + 1 };
  }
}

export function canFinishEntry(state: MapState, revision: number) {
  return state.phase === 'entering' && state.revision === revision && state.regionId !== null;
}

export function regionPhase(state: MapState, id: RegionId): RegionPhase {
  return state.regionId === id ? state.phase : 'idle';
}
