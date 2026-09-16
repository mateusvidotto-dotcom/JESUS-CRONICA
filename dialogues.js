// data/dialogues.js
// -----------------------------------------------------------------------
// Conteúdo do Prólogo. Os nós n1–n3 são texto CONFIRMADO, extraído
// literalmente da História Modular, Parte 01 ("Gancho"):
//
//   "Antes da viagem, um membro da organização faz uma pergunta:
//   'Você tem certeza de que quer salvar o mundo?' O protagonista
//   responde: 'Sim.' O membro apenas diz: 'Essa resposta será cobrada
//   de você.'"
//
// O protagonista responde "Sim." de forma fixa no material-fonte — por
// isso este trecho NÃO é modelado como uma escolha do jogador (fazer
// disso uma escolha com mais de uma opção contradiria o que já está
// estabelecido). O nó n4_provisional É uma escolha real, mas é conteúdo
// de RASCUNHO escrito para demonstrar o sistema de escolhas/consequências
// — não está nos documentos-fonte e precisa de aprovação antes de virar
// canon confirmado (ver PROJETO.md).
// -----------------------------------------------------------------------

export const prologueDialogue = {
  id: "dlg_prologo_gancho",
  canonStatus: "CONFIRMADO",
  sourceModule: "HistoriaModular:Parte01",
  startNode: "n1",
  nodes: {
    n1: {
      id: "n1",
      speaker: "membro_organizacao",
      text: "Você tem certeza de que quer salvar o mundo?",
      conditions: [],
      choices: [],
      consequences: [],
      next: "n2"
    },
    n2: {
      id: "n2",
      speaker: "protagonist",
      text: "Sim.",
      conditions: [],
      choices: [],
      consequences: [],
      next: "n3"
    },
    n3: {
      id: "n3",
      speaker: "membro_organizacao",
      text: "Essa resposta será cobrada de você.",
      conditions: [],
      choices: [],
      consequences: [
        { type: "CODEX_UNLOCK", entryId: "codex_organizacao_secreta", status: "DESCOBERTO" },
        { type: "CODEX_UNLOCK", entryId: "codex_membro_organizacao", status: "DESCOBERTO" },
        { type: "FLAG_SET", flag: "prologueHookHeard", value: true }
      ],
      next: "n4_provisional"
    },
    n4_provisional: {
      id: "n4_provisional",
      canonStatus: "PROVISORIO",
      speaker: "membro_organizacao",
      text: "Antes de você partir, preciso registrar sua disposição. Como você encara o que viu aqui?",
      conditions: [],
      choices: [
        {
          id: "choice_resolve",
          text: "\u201cIsso só me dá mais motivo para agir.\u201d",
          conditions: [],
          consequences: [],
          effects: {
            relationships: { membro_organizacao: { trust: 2 } },
            world: {},
            missions: {},
            temporal: {},
            codex: {},
            stats: { hope: 1 }
          }
        },
        {
          id: "choice_doubt",
          text: "\u201cNão sei se algum dia isso pode ser consertado.\u201d",
          conditions: [],
          consequences: [],
          effects: {
            relationships: { membro_organizacao: { trust: -1, fear: 1 } },
            world: {},
            missions: {},
            temporal: {},
            codex: {},
            stats: { guilt: 1 }
          }
        }
      ],
      consequences: [
        { type: "CODEX_UNLOCK", entryId: "codex_maquina_tempo", status: "DESCOBERTO" },
        { type: "MISSION_COMPLETE", missionId: "missao_prologo_proposta" }
      ],
      next: null
    }
  }
};
