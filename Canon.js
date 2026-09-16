// Canon.js
// -----------------------------------------------------------------------
// Registro de canon de PRODUÇÃO — a Bíblia do Universo representada como
// dado consultável (Especificação Mestra, seções 2.1, 24 e 25).
//
// IMPORTANTE: esta camada nunca é exposta diretamente ao jogador. O que o
// jogador sabe ou acredita saber vive em Codex.js, que é uma camada
// separada (Codex/Diário Especificação, seção 20: "BÍBLIA define o que é
// canon. CODEX define o que o jogador sabe ou acredita saber."). Uma
// entrada pode ser CANON CONFIRMADO aqui e ainda DESCONHECIDA no Codex —
// isso é obrigatório para preservar mistério, não um bug de sincronização.
// -----------------------------------------------------------------------

export const CANON_LEVEL = Object.freeze({
  PRINCIPIO_FUNDAMENTAL: 1,
  FATO_DA_HISTORIA: 2,
  REGRA_DO_UNIVERSO: 3,
  ENTIDADE: 4,
  ELEMENTO_ABERTO: 5
});

export const CANON_STATUS = Object.freeze({
  CONFIRMADO: "CONFIRMADO",
  COMPATIVEL: "COMPATIVEL",
  PROVISORIO: "PROVISORIO",
  CONTRADICAO: "CONTRADICAO"
});

/** @type {Map<string, object>} */
const registry = new Map();

/** @type {Array<object>} histórico de registros de retcon (seção 25) */
const retconLog = [];

/**
 * Registra (ou atualiza) uma entrada de canon. Entradas CONFIRMADAS não
 * podem ser sobrescritas por uma chamada direta — isso força quem quiser
 * mudar canon confirmado a passar por `createRetconRecord()`, deixando
 * rastro de auditoria em vez de uma sobrescrita silenciosa.
 */
export function registerCanonEntry(entry) {
  if (!entry || !entry.id) {
    throw new Error("[Canon] Entrada sem id não pode ser registrada.");
  }

  const existing = registry.get(entry.id);
  const isRealChange = existing && JSON.stringify(existing) !== JSON.stringify({ ...existing, ...entry });

  if (existing && existing.canonStatus === CANON_STATUS.CONFIRMADO && isRealChange) {
    console.warn(
      `[Canon] Tentativa de sobrescrever entrada CONFIRMADA "${entry.id}". ` +
        `Use createRetconRecord() para registrar a mudança com rastreabilidade em vez de sobrescrever diretamente.`
    );
    return existing;
  }

  registry.set(entry.id, { ...entry });
  return registry.get(entry.id);
}

export function getCanonEntry(id) {
  return registry.get(id) || null;
}

export function getCanonRegistry() {
  return Array.from(registry.values());
}

/**
 * Verifica se uma entrada pode ser tratada como canon válido para uso
 * ativo no jogo (Especificação Mestra, seção 24).
 *
 * Regras:
 * - status CONTRADICAO nunca é válido;
 * - toda dependência declarada precisa existir no registro;
 * - PROVISORIO e COMPATIVEL são válidos para uso (o jogo pode rodar com
 *   canon provisório), mas nunca são promovidos automaticamente a
 *   CONFIRMADO por esta função — só uma decisão humana explícita faz
 *   isso, via registerCanonEntry() com o novo status.
 */
export function canValidate(entry) {
  const problems = [];

  if (!entry || !entry.id) {
    return { valid: false, problems: ["Entrada sem id."] };
  }

  if (entry.canonStatus === CANON_STATUS.CONTRADICAO) {
    problems.push(`Entrada "${entry.id}" está marcada como CONTRADICAO e não pode ser usada como canon ativo.`);
  }

  if (Array.isArray(entry.dependencies)) {
    for (const depId of entry.dependencies) {
      if (!registry.has(depId)) {
        problems.push(`Dependência "${depId}" de "${entry.id}" não está registrada no canon.`);
      }
    }
  }

  return { valid: problems.length === 0, problems };
}

/**
 * Registra formalmente uma mudança em canon já confirmado
 * (Especificação Mestra, seção 25 — "SISTEMA DE NÃO-RETCON"). Isso nunca
 * sobrescreve a entrada original sozinho: `approved` começa `false` e
 * precisa ser virado manualmente por quem mantém o canon antes que a
 * mudança valha. O registro fica em `retconLog` para auditoria.
 */
export function createRetconRecord({
  originalId,
  conflict,
  reason,
  preservedElements = [],
  newInterpretation,
  affectedEntries = []
}) {
  const record = {
    originalId,
    conflict,
    reason,
    preservedElements,
    newInterpretation,
    affectedEntries,
    approved: false,
    createdAt: new Date().toISOString()
  };
  retconLog.push(record);
  return record;
}

/**
 * Aprova e aplica um retcon já registrado. Este é o ÚNICO caminho que pode
 * sobrescrever uma entrada CONFIRMADA: por isso ele escreve diretamente no
 * registry (em vez de chamar registerCanonEntry()) — se chamasse
 * registerCanonEntry(), o próprio guard de proteção contra sobrescrita de
 * CONFIRMADO (linhas acima) bloquearia esta atualização autorizada, o que
 * tornaria o sistema de retcon inútil na prática. (Bug real encontrado e
 * corrigido durante os testes desta versão — a primeira implementação
 * chamava registerCanonEntry() e a mudança era silenciosamente recusada.)
 */
export function approveRetcon(record, newEntryData) {
  if (!record || record.approved) {
    console.warn("[Canon] approveRetcon chamado com um registro inválido ou já aprovado.");
    return getCanonEntry(record?.originalId);
  }

  const existing = getCanonEntry(record.originalId);
  const updated = { ...existing, ...newEntryData, id: record.originalId };
  registry.set(record.originalId, updated);
  record.approved = true;
  return updated;
}

export function getRetconLog() {
  return [...retconLog];
}

/** Lista entradas com um determinado canonStatus — útil para auditoria (MODO AUDITORIA). */
export function listEntriesByStatus(status) {
  return getCanonRegistry().filter((entry) => entry.canonStatus === status);
}
