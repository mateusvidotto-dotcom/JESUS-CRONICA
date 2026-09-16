// Conditions.js
// -----------------------------------------------------------------------
// Avaliador de condições compartilhado. Tanto o sistema de Diálogo (nós e
// escolhas têm `conditions: []`) quanto o de Missões (desbloqueio) e as
// Cenas (Especificação Mestra, seções 6, 7, 8 e 11) usam listas de
// condições no mesmo formato. Em vez de cada módulo reimplementar sua
// própria lógica de checagem (o que criaria comportamentos ligeiramente
// diferentes para a mesma ideia — "REUTILIZAÇÃO"), toda checagem passa
// por aqui.
//
// Este módulo só depende do FORMATO do gameState, não de outros módulos
// de sistema (Missions.js, Codex.js etc.) — ele lê os arrays/objetos do
// estado diretamente. Isso evita ciclos de import: Missions.js precisa
// avaliar condições, e também é razoável que uma condição precise saber
// o status de uma missão; se Conditions.js importasse Missions.js e
// Missions.js importasse Conditions.js, teríamos um ciclo. Como os dois
// só leem a mesma "fonte única de verdade" (gameState), não há problema.
// -----------------------------------------------------------------------

/**
 * Avalia uma única condição contra o gameState.
 *
 * Tipos suportados:
 * - FLAG                 { flag, equals? = true }
 * - STAT_AT_LEAST         { stat, value }
 * - STAT_AT_MOST          { stat, value }
 * - RELATIONSHIP_AT_LEAST { characterId, field = "trust", value }
 * - MISSION_STATUS        { missionId, status }
 * - CODEX_STATUS          { entryId, status }
 *
 * Uma condição de tipo desconhecido resulta em `false` com aviso no
 * console — falhar fechado (bloquear) é mais seguro que falhar aberto
 * (liberar algo que não deveria estar disponível) quando o tipo não é
 * reconhecido.
 */
export function evaluateCondition(condition, state) {
  if (!condition || !condition.type) return true;

  switch (condition.type) {
    case "FLAG": {
      const expected = condition.equals ?? true;
      return Boolean(state.story.flags[condition.flag]) === expected;
    }

    case "STAT_AT_LEAST": {
      const value = state.protagonist.stats[condition.stat] ?? 0;
      return value >= condition.value;
    }

    case "STAT_AT_MOST": {
      const value = state.protagonist.stats[condition.stat] ?? 0;
      return value <= condition.value;
    }

    case "RELATIONSHIP_AT_LEAST": {
      const rel = state.protagonist.relationships[condition.characterId];
      const field = condition.field || "trust";
      const value = rel ? rel[field] ?? 0 : 0;
      return value >= condition.value;
    }

    case "MISSION_STATUS": {
      const { missionId, status } = condition;
      if (status === "COMPLETED") return state.missions.completed.includes(missionId);
      if (status === "ACTIVE") return state.missions.active.includes(missionId);
      if (status === "FAILED") return state.missions.failed.includes(missionId);
      if (status === "HIDDEN") return state.missions.hidden.includes(missionId);
      // "LOCKED"/"AVAILABLE" não têm lista própria no gameState (ver nota
      // de engenharia em Missions.js) — condições sobre esses dois status
      // não podem ser resolvidas só com o gameState bruto, então falham
      // fechado aqui e devem ser expressas de outra forma pelo autor do
      // conteúdo (por exemplo, checando a ausência das outras quatro).
      console.warn(`[Conditions] MISSION_STATUS "${status}" não pode ser avaliado sem o registro de missões.`);
      return false;
    }

    case "CODEX_STATUS": {
      const entry = state.codex.unlockedEntries[condition.entryId];
      const currentStatus = entry ? entry.status : "DESCONHECIDO";
      return currentStatus === condition.status;
    }

    default:
      console.warn(`[Conditions] Tipo de condição desconhecido: "${condition.type}".`);
      return false;
  }
}

/** Todas as condições da lista precisam ser verdadeiras (E lógico). */
export function evaluateConditions(conditions, state) {
  if (!conditions || conditions.length === 0) return true;
  return conditions.every((condition) => evaluateCondition(condition, state));
}
