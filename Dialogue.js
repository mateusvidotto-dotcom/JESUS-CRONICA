// Dialogue.js
// -----------------------------------------------------------------------
// Motor de diálogo orientado a nós (Especificação Mestra, seção 7). Não
// conhece Canvas nem DOM — apenas estado e transições; a apresentação
// fica inteiramente em UI.js ("Dados ≠ Representação").
//
// Nós e escolhas individuais podem ter `conditions`: uma escolha cujas
// condições não são satisfeitas fica oculta (não aparece como opção), e
// um nó cujas condições não são satisfeitas é pulado automaticamente para
// seu `next` alternativo, se `fallbackNext` existir — sem isso, diálogo
// condicional seria só decoração no schema, nunca de fato avaliado.
// -----------------------------------------------------------------------

import { gameState, setFlag } from "./GameState.js";
import { eventBus, EVENTS } from "./EventBus.js";
import { applyChoice } from "./Choices.js";
import { unlockCodexEntry } from "./Codex.js";
import { evaluateConditions } from "./Conditions.js";
import { startMission, completeMission, failMission } from "./Missions.js";

/** @type {Map<string, object>} */
const dialogueDefinitions = new Map();

export function defineDialogue(dialogue) {
  dialogueDefinitions.set(dialogue.id, dialogue);
}

export function getDialogueDefinition(id) {
  return dialogueDefinitions.get(id) || null;
}

export function startDialogue(dialogueId) {
  const def = dialogueDefinitions.get(dialogueId);
  if (!def) {
    console.error(`[Dialogue] Diálogo "${dialogueId}" não definido.`);
    return null;
  }

  gameState.dialogue.current = { dialogueId, nodeId: def.startNode };
  if (!gameState.dialogue.seen.includes(dialogueId)) {
    gameState.dialogue.seen.push(dialogueId);
  }

  eventBus.emit(EVENTS.DIALOGUE_STARTED, { dialogueId });
  return resolveDisplayableNode();
}

/**
 * Retorna o nó atual, mas se ele tiver `conditions` que falham, avança
 * automaticamente para `fallbackNext` (ou `next`, se não houver
 * fallback específico) até achar um nó exibível ou o diálogo terminar.
 * Isso é o que torna o campo `conditions` de um nó (schema seção 7) algo
 * realmente avaliado, e não só um array decorativo sempre vazio.
 */
function resolveDisplayableNode() {
  const current = gameState.dialogue.current;
  if (!current) return null;
  const def = dialogueDefinitions.get(current.dialogueId);
  if (!def) return null;

  let node = def.nodes[current.nodeId];
  let guard = 0;
  while (node && node.conditions && node.conditions.length > 0 && !evaluateConditions(node.conditions, gameState)) {
    const nextId = node.fallbackNext ?? node.next;
    if (!nextId) {
      // Nenhum nó alternativo: encerra o diálogo em vez de travar exibindo um nó que não deveria aparecer.
      const finishedId = current.dialogueId;
      gameState.dialogue.current = null;
      eventBus.emit(EVENTS.DIALOGUE_FINISHED, { dialogueId: finishedId, reason: "CONDITION_BLOCKED" });
      return null;
    }
    current.nodeId = nextId;
    node = def.nodes[nextId];
    guard += 1;
    if (guard > 64) {
      console.error(`[Dialogue] Possível loop infinito de condições em "${current.dialogueId}".`);
      break;
    }
  }
  return node || null;
}

export function getCurrentNode() {
  return resolveDisplayableNode();
}

/** Filtra as opções de um nó pelas `conditions` de cada uma — opções não elegíveis não são exibidas. */
export function getVisibleChoices(node) {
  if (!node || !node.choices) return [];
  return node.choices.filter((choice) => evaluateConditions(choice.conditions, gameState));
}

function applyConsequences(consequences = []) {
  for (const c of consequences) {
    switch (c.type) {
      case "CODEX_UNLOCK":
        unlockCodexEntry(c.entryId, c.status);
        break;
      case "FLAG_SET":
        setFlag(c.flag, c.value);
        break;
      case "MISSION_START":
        startMission(c.missionId);
        break;
      case "MISSION_COMPLETE":
        completeMission(c.missionId);
        break;
      case "MISSION_FAIL":
        failMission(c.missionId);
        break;
      default:
        console.warn(`[Dialogue] Tipo de consequência desconhecido: "${c.type}".`);
    }
  }
}

/** Avança o diálogo. `choiceId` é obrigatório se o nó atual tiver escolhas visíveis. */
export function advanceDialogue(choiceId = null) {
  const node = getCurrentNode();
  if (!node) return null;

  const visibleChoices = getVisibleChoices(node);

  if (visibleChoices.length > 0) {
    if (!choiceId) {
      console.warn("[Dialogue] Este nó exige uma escolha antes de avançar.");
      return node;
    }
    const option = visibleChoices.find((c) => c.id === choiceId);
    if (!option) {
      console.warn(`[Dialogue] Opção "${choiceId}" não existe ou não está visível neste nó.`);
      return node;
    }
    applyChoice(option, { dialogueId: gameState.dialogue.current.dialogueId, nodeId: node.id });
  }

  applyConsequences(node.consequences);

  if (node.next) {
    gameState.dialogue.current.nodeId = node.next;
    return resolveDisplayableNode();
  }

  const finishedId = gameState.dialogue.current.dialogueId;
  gameState.dialogue.current = null;
  eventBus.emit(EVENTS.DIALOGUE_FINISHED, { dialogueId: finishedId, reason: "COMPLETED" });
  return null;
}

export function isDialogueActive() {
  return gameState.dialogue.current !== null;
}
