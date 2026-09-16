// data/codex-seed.js
// -----------------------------------------------------------------------
// Definições de entradas de Codex. Todas começam com status
// DESCONHECIDO por padrão (Codex.js aplica isso automaticamente) — a
// evolução de status acontece em runtime, via unlockCodexEntry(),
// disparada por diálogo, missões ou inspeção de objetos. Nenhuma entrada
// aqui é marcada CONFIRMADO de fábrica: mesmo conteúdo que é CONFIRMADO
// na Bíblia do Universo (Canon.js) começa DESCONHECIDO no Codex, porque
// o Codex representa o que o PROTAGONISTA sabe, não o que é verdade no
// universo (Codex Especificação, seção 20).
// -----------------------------------------------------------------------

import { defineCodexEntry, CATEGORIES } from "../Codex.js";

export function seedCodex() {
  defineCodexEntry({
    id: "codex_organizacao_secreta",
    category: CATEGORIES.FACCOES,
    title: "A Organização",
    summary: "Um grupo secreto afirma ter encontrado uma forma de alterar o destino de um futuro devastado.",
    relatedCharacters: ["membro_organizacao"],
    unlockConditions: []
  });

  defineCodexEntry({
    id: "codex_maquina_tempo",
    category: CATEGORIES.TECNOLOGIA,
    title: "A Máquina do Tempo",
    summary: "Nome de trabalho: CRONÓFAGO. Sua verdadeira natureza ainda não foi totalmente explicada.",
    relatedEntries: ["codex_organizacao_secreta"],
    unlockConditions: []
  });

  defineCodexEntry({
    id: "codex_membro_organizacao",
    category: CATEGORIES.PERSONAGENS,
    title: "Membro da Organização",
    summary: "Um agente da Organização. Nome próprio ainda não revelado.",
    relatedCharacters: ["membro_organizacao"],
    unlockConditions: []
  });

  // Entrada de mistério de exemplo, inspirada literalmente no exemplo
  // dado pela Especificação do Codex, seção 8 ("Quem realmente controla
  // o mundo?"). Marcada explicitamente como ilustrativa/PROVISÓRIA — não
  // é uma afirmação de que este mistério específico existe no enredo
  // final, só demonstra o sistema de mistérios funcionando com um caso
  // real de uso, em vez de um "Mistério de Teste 1" genérico.
  defineCodexEntry({
    id: "codex_misterio_quem_controla",
    category: CATEGORIES.MISTERIOS,
    title: "Quem realmente controla o mundo?",
    summary: "Uma pergunta em aberto sobre quem está por trás dos eventos que levaram à devastação.",
    details: "PROVISÓRIO — entrada ilustrativa baseada no exemplo da Especificação do Codex, seção 8. Precisa ser confirmada ou substituída por um mistério definido oficialmente.",
    unlockConditions: []
  });
}
