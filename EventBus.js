// EventBus.js
// -----------------------------------------------------------------------
// Sistema de eventos desacoplado (pub/sub). Especificação Mestra, seção 27
// ("ARQUITETURA DE EVENTOS"): sistemas se comunicam por eventos em vez de
// se conhecerem diretamente, o que evita um "Everything.js" gigante e
// permite adicionar sistemas novos sem reescrever os existentes.
//
// Este módulo não conhece regras de jogo — é infraestrutura pura.
// -----------------------------------------------------------------------

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Registra um handler para um evento. Retorna uma função de
   * cancelamento, para permitir `const off = eventBus.on(...); off();`.
   */
  on(eventName, handler) {
    if (typeof handler !== "function") {
      throw new TypeError(`[EventBus] handler para "${eventName}" precisa ser uma função.`);
    }
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName).add(handler);
    return () => this.off(eventName, handler);
  }

  /** Registra um handler que executa apenas uma vez. */
  once(eventName, handler) {
    const off = this.on(eventName, (data) => {
      off();
      handler(data);
    });
    return off;
  }

  off(eventName, handler) {
    const set = this._listeners.get(eventName);
    if (set) set.delete(handler);
  }

  emit(eventName, data) {
    const set = this._listeners.get(eventName);
    if (!set || set.size === 0) return;
    // Copiamos para array antes de iterar: um handler pode se desinscrever
    // (ou inscrever um novo) durante o próprio emit, o que corromperia a
    // iteração se iterássemos o Set original diretamente.
    for (const handler of Array.from(set)) {
      handler(data);
    }
  }

  clear(eventName) {
    if (eventName) this._listeners.delete(eventName);
    else this._listeners.clear();
  }

  /** Número de listeners ativos para um evento — útil para depuração. */
  listenerCount(eventName) {
    const set = this._listeners.get(eventName);
    return set ? set.size : 0;
  }
}

export const eventBus = new EventBus();

// Nomes de evento padronizados (Especificação Mestra, seção 27) mais os
// eventos adicionais que os sistemas construídos nesta versão precisaram
// para se comunicar sem acoplamento direto. Centralizar as strings aqui
// evita erros de digitação silenciosos espalhados pelo código (um evento
// emitido como "MISSON_COMPLETED" por engano nunca seria ouvido por
// ninguém, e nada acusaria o erro).
export const EVENTS = Object.freeze({
  // Da Especificação Mestra, seção 27:
  CHOICE_MADE: "CHOICE_MADE",
  MISSION_COMPLETED: "MISSION_COMPLETED",
  DIALOGUE_STARTED: "DIALOGUE_STARTED",
  DIALOGUE_FINISHED: "DIALOGUE_FINISHED",
  TIME_TRAVEL: "TIME_TRAVEL",
  REVELATION_UNLOCKED: "REVELATION_UNLOCKED",
  WORLD_STATE_CHANGED: "WORLD_STATE_CHANGED",

  // Extensões necessárias para os sistemas implementados nesta versão:
  CODEX_ENTRY_UPDATED: "CODEX_ENTRY_UPDATED",
  MISSION_STARTED: "MISSION_STARTED",
  MISSION_FAILED: "MISSION_FAILED",
  MISSION_AVAILABLE: "MISSION_AVAILABLE",
  INTERACT_AVAILABLE: "INTERACT_AVAILABLE",
  INTERACT_UNAVAILABLE: "INTERACT_UNAVAILABLE",
  LOCATION_CHANGED: "LOCATION_CHANGED",
  SAVE_REQUESTED: "SAVE_REQUESTED",
  SAVE_COMPLETED: "SAVE_COMPLETED",
  LOAD_COMPLETED: "LOAD_COMPLETED",
  RELATIONSHIP_CHANGED: "RELATIONSHIP_CHANGED"
});
