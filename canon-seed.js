// data/canon-seed.js
// -----------------------------------------------------------------------
// Entradas de canon extraídas diretamente da História Modular e da
// Bíblia do Universo. Isso NÃO é conteúdo inventado — cada entrada
// referencia a seção de origem em `sourceModule`. Serve como semente
// inicial do registro de canon de produção (Canon.js).
// -----------------------------------------------------------------------

import { registerCanonEntry, CANON_LEVEL, CANON_STATUS } from "../Canon.js";

export function seedCanon() {
  registerCanonEntry({
    id: "regra_viagem_temporal_sem_custo",
    type: "rule",
    canonLevel: CANON_LEVEL.PRINCIPIO_FUNDAMENTAL,
    canonStatus: CANON_STATUS.CONFIRMADO,
    description:
      "Nenhuma viagem temporal deve ser gratuita — toda viagem exige custo, consequência e limite definidos antes de virar mecânica jogável.",
    sourceModule: "EspecificacaoMestra:Secao14",
    dependencies: [],
    affectedSystems: ["timeSystem"]
  });

  registerCanonEntry({
    id: "regra_jesus_fora_do_sistema_de_poderes",
    type: "rule",
    canonLevel: CANON_LEVEL.PRINCIPIO_FUNDAMENTAL,
    canonStatus: CANON_STATUS.CONFIRMADO,
    description:
      "Jesus não deve ser tratado como Entity comum de combate/poder. Sua presença é registrada por acontecimentos, ensinamentos, perguntas, memórias e transformação do protagonista — nunca como ficha de combate.",
    sourceModule: "EspecificacaoMestra:Secao17;CodexEspecificacao:Secao18",
    dependencies: [],
    affectedSystems: ["dialogue", "entities", "combat", "codex"]
  });

  registerCanonEntry({
    id: "regra_poder_precisa_custo_consequencia_limite",
    type: "rule",
    canonLevel: CANON_LEVEL.PRINCIPIO_FUNDAMENTAL,
    canonStatus: CANON_STATUS.CONFIRMADO,
    description: "Toda habilidade mágica ou tecnológica relevante precisa definir custo, consequência e limite antes de ser implementada como mecânica.",
    sourceModule: "EspecificacaoMestra:Secao15;Secao16",
    dependencies: [],
    affectedSystems: ["magicSystem", "technologySystem"]
  });

  registerCanonEntry({
    id: "maquina_cronofago",
    type: "technology",
    canonLevel: CANON_LEVEL.ENTIDADE,
    canonStatus: CANON_STATUS.PROVISORIO, // nome PROVISÓRIO no documento-fonte
    description: "Máquina do tempo da organização secreta. Nome de trabalho: CRONÓFAGO.",
    sourceModule: "HistoriaModular:Parte02",
    dependencies: [],
    affectedSystems: ["timeSystem", "technologySystem"]
  });

  registerCanonEntry({
    id: "protagonista_identidade",
    type: "character",
    canonLevel: CANON_LEVEL.ELEMENTO_ABERTO,
    canonStatus: CANON_STATUS.PROVISORIO,
    description: "Nome e ficha completa do protagonista permanecem CANON ABERTO nos documentos recebidos.",
    sourceModule: "BibliaDoUniverso:CanonAberto",
    dependencies: [],
    affectedSystems: ["protagonist"]
  });

  registerCanonEntry({
    id: "arquivo_zero",
    type: "faction",
    canonLevel: CANON_LEVEL.ENTIDADE,
    canonStatus: CANON_STATUS.PROVISORIO,
    description: "Estrutura profunda de controle do mundo mencionada na arquitetura de dados. Nome e natureza exata permanecem provisórios.",
    sourceModule: "EspecificacaoMestraDoJogo:ModeloDeDados",
    dependencies: [],
    affectedSystems: ["world", "factions", "codex"]
  });

  registerCanonEntry({
    id: "organizacao_secreta",
    type: "faction",
    canonLevel: CANON_LEVEL.ENTIDADE,
    canonStatus: CANON_STATUS.CONFIRMADO,
    description: "Grupo clandestino que resgata o protagonista de uma zona de conflito e propõe a missão de alterar o destino do futuro devastado.",
    sourceModule: "HistoriaModular:Parte01",
    dependencies: [],
    affectedSystems: ["world", "factions", "dialogue"]
  });
}
