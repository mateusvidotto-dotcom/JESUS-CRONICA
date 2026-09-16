// Codex.js
// -----------------------------------------------------------------------
// Camada de conhecimento do JOGADOR/protagonista — distinta do Canon.js
// (camada de produção). Ver Codex/Diário Especificação, seção 20 e 25:
// o Codex nunca transforma CANON ABERTO em verdade automática, e uma
// entrada pode permanecer DESCONHECIDA mesmo que o fato já seja
// CONFIRMADO na Bíblia do Universo.
// -----------------------------------------------------------------------

import { gameState } from "./GameState.js";
import { eventBus, EVENTS } from "./EventBus.js";

export const ENTRY_STATUS = Object.freeze({
  DESCONHECIDO: "DESCONHECIDO",
  DESCOBERTO: "DESCOBERTO",
  SUSPEITA: "SUSPEITA",
  TEORIA: "TEORIA",
  CONFIRMADO: "CONFIRMADO",
  CONTRADITO: "CONTRADITO"
});

// Ordem usada para exibição e para decidir "isso é uma evolução válida?" —
// não impomos essa ordem estritamente (a Codex Especificação, seção 6,
// mostra descoberta progressiva, mas seção 19 também permite que duas
// fontes conflitantes gerem CONTRADITO a partir de qualquer estado), mas
// ela é útil para a interface saber como colorir/ordenar entradas.
export const STATUS_ORDER = [
  ENTRY_STATUS.DESCONHECIDO,
  ENTRY_STATUS.SUSPEITA,
  ENTRY_STATUS.DESCOBERTO,
  ENTRY_STATUS.TEORIA,
  ENTRY_STATUS.CONFIRMADO,
  ENTRY_STATUS.CONTRADITO
];

export const CATEGORIES = Object.freeze({
  PERSONAGENS: "personagens",
  LOCAIS: "locais",
  FACCOES: "faccoes",
  CRIATURAS: "criaturas",
  TECNOLOGIA: "tecnologia",
  MAGIA: "magia",
  EVENTOS: "eventos",
  CRONOLOGIA: "cronologia",
  MISTERIOS: "misterios",
  PROFECIAS: "profecias",
  ARTEFATOS: "artefatos",
  VIAGEM_TEMPORAL: "viagem_temporal",
  DOCUMENTOS: "documentos",
  DECISOES: "decisoes",
  ESTADO_DO_MUNDO: "estado_do_mundo"
});

/** @type {Map<string, object>} definições estáticas (conteúdo), por id */
const definitions = new Map();

/**
 * Registra a definição estática de uma entrada de codex (o "conteúdo",
 * que não muda com o progresso do jogador). O estado de progresso
 * (status, discoveredAt, playerTheory) vive em gameState.codex, não aqui
 * — Dados ≠ Representação/Progresso.
 */
export function defineCodexEntry(entry) {
  definitions.set(entry.id, {
    status: ENTRY_STATUS.DESCONHECIDO,
    details: "",
    clues: [],
    relatedEntries: [],
    relatedCharacters: [],
    relatedLocations: [],
    timelineDate: null,
    unlockConditions: [],
    ...entry
  });
}

export function getCodexEntry(id) {
  const def = definitions.get(id);
  if (!def) return null;
  const runtime = gameState.codex.unlockedEntries[id];
  return runtime ? { ...def, ...runtime } : def;
}

export function listCodexEntries(category = null) {
  return Array.from(definitions.keys())
    .map(getCodexEntry)
    .filter((entry) => entry && (!category || entry.category === category));
}

export function listDiscoveredCodexEntries(category = null) {
  return listCodexEntries(category).filter((entry) => entry.status !== ENTRY_STATUS.DESCONHECIDO);
}

/**
 * Atualiza o estado de descoberta de uma entrada para o jogador. Nunca
 * promove sozinha PROVISORIO/CANON ABERTO a verdade definitiva — quem
 * chama esta função decide explicitamente o status (Codex Especificação,
 * seção 25 — "REGRA FINAL").
 */
export function unlockCodexEntry(id, status = ENTRY_STATUS.DESCOBERTO) {
  const def = definitions.get(id);
  if (!def) {
    console.warn(`[Codex] Entrada "${id}" não foi definida com defineCodexEntry().`);
    return null;
  }

  const current = gameState.codex.unlockedEntries[id] || {
    status: ENTRY_STATUS.DESCONHECIDO,
    discoveredAt: null,
    playerTheory: null
  };

  const previousStatus = current.status;
  current.status = status;
  if (!current.discoveredAt) current.discoveredAt = new Date().toISOString();

  gameState.codex.unlockedEntries[id] = current;

  if (status === ENTRY_STATUS.CONFIRMADO && !gameState.codex.confirmedFacts.includes(id)) {
    gameState.codex.confirmedFacts.push(id);
  }
  if (status === ENTRY_STATUS.TEORIA && !gameState.codex.theories.includes(id)) {
    gameState.codex.theories.push(id);
  }

  if (previousStatus !== status) {
    eventBus.emit(EVENTS.CODEX_ENTRY_UPDATED, { id, status, previousStatus });
    eventBus.emit(EVENTS.REVELATION_UNLOCKED, { id, status });
  }

  return getCodexEntry(id);
}

/** Registra a teoria que o próprio jogador formulou para uma entrada (seção 8 da Codex Especificação). */
export function setPlayerTheory(id, theoryText) {
  const current = gameState.codex.unlockedEntries[id];
  if (!current) {
    console.warn(`[Codex] Não é possível registrar teoria para "${id}": entrada ainda não foi descoberta.`);
    return;
  }
  current.playerTheory = theoryText;
}

/**
 * Marca duas entradas como estando em contradição — Codex Especificação,
 * seção 19: preservar ambas até a história resolver o conflito, em vez de
 * escolher uma automaticamente.
 */
export function flagContradiction(entryIdA, entryIdB) {
  unlockCodexEntry(entryIdA, ENTRY_STATUS.CONTRADITO);
  unlockCodexEntry(entryIdB, ENTRY_STATUS.CONTRADITO);
}
