// GameState.js
// -----------------------------------------------------------------------
// Fonte única de verdade do estado do jogo em runtime. Estrutura definida
// na Especificação Mestra do Jogo, seção 3.1 — reproduzida aqui campo a
// campo, sem adicionar estruturas paralelas para a mesma informação
// ("PRINCÍPIO UMA ÚNICA FONTE DE VERDADE").
//
// Campos ainda não definidos pelo canon permanecem `null`, vazios ou
// explicitamente marcados como desconhecidos (Especificação Mestra,
// seção 31 — "REGRA DE IMPLEMENTAÇÃO"). Nada aqui inventa fatos do
// universo; onde uma decisão de arquitetura teve que ser tomada para o
// código funcionar, ela está comentada como tal.
// -----------------------------------------------------------------------

import { eventBus, EVENTS } from "./EventBus.js";

export const SAVE_VERSION = 1;

export function createInitialState() {
  return {
    saveVersion: SAVE_VERSION,

    story: {
      currentAct: "PROLOGO",
      currentScene: null,
      completedModules: [],
      flags: {}
    },

    protagonist: {
      identity: {
        id: "protagonist",
        // CANON ABERTO (Bíblia do Universo, seção 32 / "Elementos em Aberto"):
        // nome e ficha completa do protagonista não foram definidos nos
        // documentos recebidos. Mantido null propositalmente — nunca deve
        // ser preenchido com um nome inventado só para o código funcionar.
        name: null
      },
      // DECISÃO DE ARQUITETURA (não é fato narrativo): a Especificação
      // Mestra, seção 9, lista estas variáveis narrativas como "arquitetura
      // disponível" sem dizer onde no gameState elas residem. Como são
      // estatísticas internas do protagonista (não do mundo, não de um
      // relacionamento específico), foram alocadas em `protagonist.stats`,
      // que a própria seção 3.1 já reserva como objeto livre. Início
      // neutro (0) para todas — nenhum valor inicial foi definido no canon.
      stats: {
        hope: 0,
        freedom: 0,
        control: 0,
        faith: 0,
        guilt: 0,
        corruption: 0,
        temporalStability: 0,
        politicalReputation: 0,
        knowledge: 0,
        allyTrust: 0
      },
      traits: [],
      // relationships: { [characterId]: { trust, respect, fear, loyalty, flags[] } }
      // Formato definido na Especificação Mestra, seção 12.
      relationships: {},
      // EXTENSÃO NECESSÁRIA (não estava na seção 3.1 original): posição do
      // jogador no mundo de exploração. Sem isto, SaveSystem.js salvava o
      // progresso narrativo mas não onde o jogador estava fisicamente — ao
      // carregar um save, o protagonista reapareceria sempre no spawn
      // inicial do Prólogo, mesmo tendo avançado para outra localização.
      // `locationId` é redundante com `world.currentLocationId` abaixo por
      // conveniência de leitura, mas World.js é quem escreve os dois.
      position: { x: null, y: null, locationId: null }
    },

    world: {
      locations: {},
      factions: {},
      politicalState: {},
      temporalStability: null,
      discoveredSecrets: [],
      // EXTENSÃO NECESSÁRIA: World.js mantinha `currentLocationId` apenas
      // como variável de módulo (fora do gameState), então também não era
      // persistida. Ver mesmo comentário em `protagonist.position` acima.
      currentLocationId: null
    },

    choices: {
      major: {},
      minor: {},
      consequences: {}
    },

    missions: {
      active: [],
      completed: [],
      failed: [],
      hidden: []
    },

    inventory: {
      items: [],
      artifacts: [],
      technology: [],
      resources: {}
    },

    dialogue: {
      current: null,
      seen: [],
      unlocked: [],
      relationshipFlags: {}
    },

    codex: {
      // unlockedEntries: { [entryId]: { status, discoveredAt, playerTheory } }
      unlockedEntries: {},
      theories: [],
      confirmedFacts: []
    },

    endings: {
      conditions: {},
      unlocked: []
    }
  };
}

export const gameState = createInitialState();

/** Restaura o gameState para o estado inicial, preservando a mesma referência de objeto. */
export function resetState() {
  const fresh = createInitialState();
  for (const key of Object.keys(gameState)) delete gameState[key];
  Object.assign(gameState, fresh);
  return gameState;
}

export function setFlag(flagName, value = true) {
  gameState.story.flags[flagName] = value;
  eventBus.emit(EVENTS.WORLD_STATE_CHANGED, { flag: flagName, value });
}

export function getFlag(flagName) {
  return gameState.story.flags[flagName] ?? false;
}

/**
 * Aplica um objeto `effects` (Especificação Mestra, seção 8) ao gameState.
 *
 * Chaves suportadas: `relationships`, `world`, `missions`, `temporal`,
 * `codex` (as cinco documentadas na seção 8) mais a extensão `stats`
 * (ver comentário em `protagonist.stats` acima). Chaves desconhecidas são
 * ignoradas com aviso no console — um efeito malformado não deve derrubar
 * o jogo, mas também não deve falhar silenciosamente sem registro.
 *
 * `missions` e `codex` são delegados via evento em vez de mutados
 * diretamente aqui: Missions.js e Codex.js são donos daquele estado e
 * podem ter lógica própria de validação (por exemplo, Missions.js decide
 * se uma missão pode ou não ser completada). Duplicar essa lógica aqui
 * criaria duas fontes de verdade para a mesma regra.
 */
export function mergeEffects(effects) {
  if (!effects || typeof effects !== "object") return;

  if (effects.stats) {
    for (const [stat, delta] of Object.entries(effects.stats)) {
      if (!(stat in gameState.protagonist.stats)) {
        console.warn(`[GameState] Stat narrativa desconhecida ignorada: "${stat}".`);
        continue;
      }
      gameState.protagonist.stats[stat] += delta;
    }
  }

  if (effects.relationships) {
    for (const [charId, delta] of Object.entries(effects.relationships)) {
      const current = gameState.protagonist.relationships[charId] || {
        trust: 0,
        respect: 0,
        fear: 0,
        loyalty: 0,
        flags: []
      };
      for (const [field, value] of Object.entries(delta)) {
        if (field === "flags" && Array.isArray(value)) {
          current.flags = Array.from(new Set([...current.flags, ...value]));
        } else if (field in current) {
          current[field] += value;
        } else {
          console.warn(`[GameState] Campo de relacionamento desconhecido ignorado: "${field}".`);
        }
      }
      gameState.protagonist.relationships[charId] = current;
      eventBus.emit(EVENTS.RELATIONSHIP_CHANGED, { characterId: charId, relationship: current });
    }
  }

  if (effects.world) {
    Object.assign(gameState.world.politicalState, effects.world);
  }

  if (effects.missions) {
    eventBus.emit("MISSION_EFFECT_QUEUED", effects.missions);
  }

  if (effects.temporal) {
    if (typeof effects.temporal.stabilityDelta === "number") {
      gameState.world.temporalStability =
        (gameState.world.temporalStability || 0) + effects.temporal.stabilityDelta;
    }
  }

  if (effects.codex) {
    eventBus.emit("CODEX_EFFECT_QUEUED", effects.codex);
  }

  eventBus.emit(EVENTS.WORLD_STATE_CHANGED, { source: "mergeEffects", effects });
}
