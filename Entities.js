// Entities.js
// -----------------------------------------------------------------------
// Representação de entidades interativas do mundo. Duas variantes:
//
//  - NPC ("kind: npc"): possui `dialogueId` e conversa via Dialogue.js.
//  - Objeto interativo ("kind: object"): possui `interactionType: INSPECT`
//    e mostra um texto único + opcionalmente desbloqueia codex, sem abrir
//    uma árvore de diálogo completa. Útil para terminais, documentos,
//    inscrições — coisas com as quais o protagonista interage sem ter
//    uma "conversa".
//
// REGRA ABSOLUTA (Especificação Mestra, seção 17; Bíblia do Universo,
// seção 3): Jesus NUNCA deve ser instanciado por este módulo como uma
// entidade comum. A presença Dele pertence a um módulo narrativo dedicado
// e ainda não implementado nesta versão — ver PROJETO.md, seção "Próximos
// passos". `createNpc`/`createInteractableObject` não têm nenhum caminho
// especial para "personagens sagrados" propositalmente: se alguém tentar
// usar este módulo para representar Jesus, a ausência desse caminho é o
// lembrete de que a decisão de arquitetura ainda precisa ser tomada à
// parte, não usada por acidente.
// -----------------------------------------------------------------------

export function createNpc({
  id,
  name,
  x,
  y,
  width = 28,
  height = 36,
  color = "#4C9A94",
  dialogueId = null,
  interactionRadius = 52
}) {
  return {
    id,
    kind: "npc",
    name,
    x,
    y,
    width,
    height,
    color,
    dialogueId,
    interactionType: "DIALOGUE",
    interactionRadius
  };
}

export function createInteractableObject({
  id,
  name,
  x,
  y,
  width = 32,
  height = 32,
  color = "#8C7BB0",
  inspectText,
  codexUnlock = null, // { entryId, status }
  interactionRadius = 48
}) {
  return {
    id,
    kind: "object",
    name,
    x,
    y,
    width,
    height,
    color,
    inspectText,
    codexUnlock,
    interactionType: "INSPECT",
    interactionRadius
  };
}

export function getEntityCenter(entity) {
  return { x: entity.x + entity.width / 2, y: entity.y + entity.height / 2 };
}

export function distanceBetweenEntities(a, b) {
  const ca = getEntityCenter(a);
  const cb = getEntityCenter(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}
