// ─── Barramento de eventos ───────────────────────────────────────────────────
// Destino dos `EngineEvent` que as funções puras já devolvem. A engine emite sem
// saber quem escuta; é o gancho para o Saci, que vive numa área separada da tela.
//
// **Nenhuma lógica do Saci aqui** — ver docs/FUTURE.md.

import type { EngineEvent, EngineEventListener } from '@/types/events';

export type EventBus = {
  emit(event: EngineEvent): void;
  emitAll(events: EngineEvent[]): void;
  subscribe(listener: EngineEventListener): () => void;
};

export function createEventBus(): EventBus {
  const listeners = new Set<EngineEventListener>();

  return {
    emit(event) {
      // Cópia antes de iterar: um listener pode se desinscrever ao ser chamado.
      for (const listener of [...listeners]) listener(event);
    },
    emitAll(events) {
      for (const event of events) this.emit(event);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

export const eventBus = createEventBus();
