// Choices.js
// -----------------------------------------------------------------------
// Aplica os `effects` de uma opção de escolha (Especificação Mestra,
// seção 8) ao gameState via GameState.mergeEffects(), e registra a
// escolha em si (não só seus efeitos) para consulta futura — por exemplo,
// para uma condição de final perguntar "o jogador escolheu X no diálogo
// Y?" sem precisar reconstruir isso a partir dos efeitos aplicados.
// -----------------------------------------------------------------------

import { gameState, mergeEffects } from "./GameState.js";
import { eventBus, EVENTS } from "./EventBus.js";

/**
 * @param {object} option Uma opção de escolha no formato da seção 8.
 * @param {object} context Metadado de onde a escolha ocorreu (dialogueId, nodeId).
 * @param {"major"|"minor"} importance Em qual balde (`gameState.choices.major`/`minor`) registrar.
 */
export function applyChoice(option, context = {}, importance = "minor") {
  const record = {
    optionId: option.id,
    text: option.text,
    context,
    timestamp: new Date().toISOString()
  };

  const bucket = importance === "major" ? gameState.choices.major : gameState.choices.minor;
  bucket[option.id] = record;

  if (option.effects) {
    mergeEffects(option.effects);
    gameState.choices.consequences[option.id] = option.effects;
  }

  eventBus.emit(EVENTS.CHOICE_MADE, { option, context, importance });
}

export function wasChoiceMade(optionId) {
  return Boolean(gameState.choices.major[optionId] || gameState.choices.minor[optionId]);
}

export function getChoiceRecord(optionId) {
  return gameState.choices.major[optionId] || gameState.choices.minor[optionId] || null;
}
