/* ============================================================================
   JESUS CHRONICLES — BUILD CONSOLIDADO
   Núcleo + Etapas 2 a 10
   ============================================================================ */

/*
 * ============================================================================
 * JESUS CHRONICLES — APP CORE
 * ============================================================================
 *
 * Arquitetura:
 *  - GameState: fonte central de estado.
 *  - StorageManager: persistência local e versionamento do save.
 *  - NarrativeEngine: cenas, diálogos, escolhas e consequências.
 *  - QuestManager: missões.
 *  - UIManager: telas, HUD, overlays e notificações.
 *  - AudioManager: sons sintéticos opcionais via Web Audio API.
 *  - InputManager: teclado e eventos globais.
 *
 * A história fornecida pelo projeto é tratada como design narrativo.
 * Esta primeira implementação concentra a fundação técnica + prólogo.
 * O conteúdo adicional é técnico/estrutural; fatos narrativos inéditos
 * não são tratados como cânone.
 * ============================================================================
 */

"use strict";

/* ==========================================================================
   1. CONSTANTES
   ========================================================================== */

const APP_CONFIG = Object.freeze({
  gameId: "jesus-chronicles",
  version: "1.1.0",
  saveKey: "jesus-chronicles-save-v1",
  settingsKey: "jesus-chronicles-settings-v1",
  typingSpeed: 18,
  fastTypingSpeed: 5,
  maxNotifications: 5
});

const GAME_PHASES = Object.freeze({
  TITLE: "TITLE",
  CINEMATIC: "CINEMATIC",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED"
});

const DIALOGUE_TYPES = Object.freeze({
  NARRATION: "NARRAÇÃO",
  SYSTEM: "SISTEMA",
  DIALOGUE: "DIÁLOGO",
  CHOICE: "ESCOLHA"
});

const SCREENS = Object.freeze({
  title: "screenTitle",
  cinematic: "screenCinematic",
  game: "screenGame"
});

/* ==========================================================================
   2. DADOS NARRATIVOS — PARTE 00 + PRÓLOGO
   ========================================================================== */

const GAME_DATABASE = {
  meta: {
    title: "JESUS CHRONICLES",
    genre: [
      "Aventura narrativa",
      "RPG",
      "Ficção científica",
      "Fantasia",
      "Exploração",
      "Escolhas",
      "Viagem no tempo"
    ],
    theme:
      "O mundo não será salvo por alguém fazendo o que nós mesmos recusamos fazer.",
    finalQuestion:
      "Você queria salvar o mundo — ou simplesmente queria evitar a responsabilidade de lutar por ele?"
  },

  protagonist: {
    id: "protagonist",
    name: "O PROTAGONISTA",
    role: "Viajante temporal",
    description:
      "Pessoa inteligente, determinada e corajosa, mas marcada por orgulho, ansiedade e pela necessidade de encontrar uma resposta definitiva.",
    initialStats: {
      hope: 52,
      freedom: 46,
      control: 32,
      temporalStability: 100
    },
    abilities: [
      { id: "observation", name: "Observação", level: "Básico" },
      { id: "social", name: "Interação social", level: "Básico" },
      { id: "temporal", name: "Sensibilidade temporal", level: "Latente" }
    ]
  },

  acts: [
    { id: "prologue", label: "PRÓLOGO", title: "O Mundo Destruído" },
    { id: "act1", label: "ATO I", title: "O Mundo Destruído" },
    { id: "act2", label: "ATO II", title: "A Máquina do Tempo" },
    { id: "act3", label: "ATO III", title: "O Passado" },
    { id: "act4", label: "ATO IV", title: "O Encontro" },
    { id: "act5", label: "ATO V", title: "O Retorno" },
    { id: "act6", label: "ATO VI", title: "A Missão" },
    { id: "act7", label: "ATO VII", title: "A Verdade Sobre o Mundo" },
    { id: "act8", label: "ATO VIII", title: "A Guerra" },
    { id: "act9", label: "ATO IX", title: "A Escolha" },
    { id: "act10", label: "ATO X", title: "O Final" }
  ],

  prologueCinematic: [
    {
      id: "p0",
      act: "PRÓLOGO",
      title: "O MUNDO DESTRUÍDO",
      text:
        "Uma megacidade parcialmente funcional existe sobre uma região devastada. Arranha-céus tecnológicos se misturam a estruturas reconstruídas e ruínas antigas. Drones patrulham áreas civis. Barreiras energéticas protegem bairros privilegiados. Regiões inteiras foram abandonadas."
    },
    {
      id: "p1",
      act: "PRÓLOGO",
      title: "TECNOLOGIA E MAGIA",
      text:
        "O futuro não separou ciência e sobrenatural. Tecnologia extremamente avançada, magia, criaturas sobrenaturais, artefatos antigos, dimensões desconhecidas e civilizações ocultas coexistem em um mundo que perdeu sua estabilidade."
    },
    {
      id: "p2",
      act: "PRÓLOGO",
      title: "A CRISE",
      text:
        "Guerras recorrentes, escassez de alimentos, doenças, corrupção, governos autoritários, propaganda, vigilância, desigualdade extrema, manipulação temporal, conflitos religiosos e políticos e ecossistemas destruídos formam o cenário da humanidade."
    },
    {
      id: "p3",
      act: "PRÓLOGO",
      title: "A CRENÇA",
      text:
        'O protagonista começa acreditando que ainda existe uma solução externa. Sua mentalidade inicial é simples: "Eu vou salvar o mundo."'
    },
    {
      id: "p4",
      act: "PRÓLOGO",
      title: "A ORGANIZAÇÃO",
      text:
        "Uma operação clandestina tira o protagonista de uma zona de conflito e o leva até uma organização secreta. A organização apresenta registros, imagens e simulações do futuro e afirma ter encontrado uma possibilidade."
    },
    {
      id: "p5",
      act: "PRÓLOGO",
      title: "A PERGUNTA",
      text:
        'Antes da viagem, um membro da organização pergunta: "Você tem certeza de que quer salvar o mundo?" O protagonista responde: "Sim." A resposta é recebida com uma última advertência: "Essa resposta será cobrada de você."'
    }
  ],

  scenes: {
    introMission: {
      id: "introMission",
      location: "Centro de Comando",
      act: "PRÓLOGO",
      era: "FUTURO",
      speaker: "Narração",
      lines: [
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: DIALOGUE_TYPES.NARRATION,
          text:
            "A operação terminou. Você foi retirado de uma zona de conflito e levado para uma instalação que não aparece nos registros públicos."
        },
        {
          speaker: "Narração",
          role: "PROTOCOLO",
          type: DIALOGUE_TYPES.NARRATION,
          text:
            "Diante de você, uma parede de dados reproduz imagens do futuro. Há cidades quebradas, populações deslocadas e regiões protegidas por barreiras energéticas."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Nós não conseguimos salvar o futuro diretamente."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Mas encontramos uma hipótese. Uma possibilidade que exige uma viagem que ninguém considera segura."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "A máquina existe. O viajante pode chegar ao passado. E você foi escolhido."
        }
      ]
    },

    missionBriefing: {
      id: "missionBriefing",
      location: "Centro de Comando",
      act: "PRÓLOGO",
      era: "FUTURO",
      speaker: "Membro da Organização",
      lines: [
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text: "A missão é simples de entender e impossível de garantir."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Viaje ao passado. Localize Jesus. Explique a destruição do futuro. Peça que Ele viaje até aqui."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "A hipótese é que Sua presença possa corrigir aquilo que nós não conseguimos corrigir."
        },
        {
          speaker: "Narração",
          role: "PROTOCOLO",
          type: DIALOGUE_TYPES.NARRATION,
          text:
            "A frase parece simples. O problema é que você não consegue saber onde termina uma missão e começa uma responsabilidade."
        }
      ]
    },

    missionChoice: {
      id: "missionChoice",
      location: "Centro de Comando",
      act: "PRÓLOGO",
      era: "FUTURO",
      speaker: "Membro da Organização",
      lines: [
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Antes de ativarmos o Cronófago, preciso de uma resposta."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Você tem certeza de que quer salvar o mundo?"
        },
        {
          speaker: "ESCOLHA",
          role: "DECISÃO",
          type: DIALOGUE_TYPES.CHOICE,
          choices: [
            {
              id: "answer_yes",
              text: "Sim. Eu vou salvar o mundo.",
              effects: {
                hope: 3,
                control: 3,
                freedom: -1
              },
              consequence:
                "A resposta reforça a convicção inicial do protagonista: existe uma solução externa que precisa ser encontrada."
            },
            {
              id: "answer_uncertain",
              text: "Eu não sei. Mas não posso ignorar o que está acontecendo.",
              effects: {
                hope: 1,
                freedom: 3,
                control: -2
              },
              consequence:
                "A dúvida não cancela a missão, mas registra a primeira fissura na certeza do protagonista."
            },
            {
              id: "answer_question",
              text: "Quem decidiu que eu deveria salvar o mundo?",
              effects: {
                hope: 0,
                freedom: 2,
                control: -1
              },
              consequence:
                "O protagonista percebe que até sua missão foi definida por outra pessoa."
            }
          ]
        }
      ]
    },

    finalWarning: {
      id: "finalWarning",
      location: "Câmara do Cronófago",
      act: "PRÓLOGO",
      era: "FUTURO",
      speaker: "Membro da Organização",
      lines: [
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "A máquina é chamada de CRONÓFAGO. Ela não funciona como um simples portal."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Ela manipula a relação entre consciência, matéria e linha temporal. Pequenas alterações podem gerar consequências."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Alguns eventos funcionam como pontos fixos. Nem tudo pode ser alterado. E a máquina não permite viagens infinitas."
        },
        {
          speaker: "Membro da Organização",
          role: "ORGANIZAÇÃO",
          type: DIALOGUE_TYPES.DIALOGUE,
          text:
            "Essa resposta será cobrada de você."
        }
      ]
    },

    transitionToPast: {
      id: "transitionToPast",
      location: "Câmara do Cronófago",
      act: "ATO II",
      era: "DESLOCAMENTO",
      speaker: "Narração",
      lines: [
        {
          speaker: "Narração",
          role: "PROTOCOLO",
          type: DIALOGUE_TYPES.NARRATION,
          text:
            "Os sistemas do Cronófago entram em sincronização. A sala desaparece antes que o corpo tenha tempo de compreender o movimento."
        },
        {
          speaker: "Narração",
          role: "PROTOCOLO",
          type: DIALOGUE_TYPES.NARRATION,
          text:
            "O protagonista desaparece."
        },
        {
          speaker: "Narração",
          role: "PROTOCOLO",
          type: DIALOGUE_TYPES.NARRATION,
          text:
            "O passado não é um lugar seguro."
        }
      ]
    }
  },

  locations: {
    commandCenter: {
      name: "Centro de Comando",
      act: "PRÓLOGO",
      era: "FUTURO",
      tag: "INSTALAÇÃO CLANDESTINA",
      description:
        "Uma instalação secreta onde a organização apresenta registros e simulações da crise mundial."
    },
    chronoChamber: {
      name: "Câmara do Cronófago",
      act: "ATO II",
      era: "DESLOCAMENTO",
      tag: "SISTEMA TEMPORAL",
      description:
        "A área de ativação da máquina temporal. O sistema manipula a relação entre consciência, matéria e linha temporal."
    }
  },

  quests: [
    {
      id: "quest_future_truth",
      title: "A Última Possibilidade",
      objective: "Ouvir o briefing da organização e entender a hipótese temporal.",
      context:
        "A organização acredita que o futuro não pode ser salvo diretamente.",
      location: "Centro de Comando",
      npcs: ["Membro da Organização"],
      enemies: [],
      obstacles: ["Incerteza sobre a missão", "Informações incompletas"],
      choices: "Responder à pergunta sobre salvar o mundo.",
      dialogue: "Briefing inicial do prólogo.",
      consequences:
        "A resposta modifica o estado interno do protagonista.",
      rewards: ["Informação", "Registro narrativo"],
      revelation:
        "Existe uma máquina temporal chamada CRONÓFAGO."
    },
    {
      id: "quest_temporal_launch",
      title: "O Cronófago",
      objective: "Concluir o protocolo de ativação e iniciar a viagem temporal.",
      context:
        "A máquina é o único meio disponível para alcançar o passado.",
      location: "Câmara do Cronófago",
      npcs: ["Membro da Organização"],
      enemies: [],
      obstacles: ["Risco de deslocamento temporal"],
      choices: "Confirmar ou reconsiderar a missão.",
      dialogue: "Advertências finais do protocolo.",
      consequences:
        "A linha temporal do protagonista passa ao estado de deslocamento.",
      rewards: ["Acesso à próxima fase"],
      revelation:
        "O passado não é um lugar seguro."
    }
  ]
};

/* ==========================================================================
   3. ESTADO CENTRAL
   ========================================================================== */

function createInitialState() {
  return {
    meta: {
      gameId: APP_CONFIG.gameId,
      version: APP_CONFIG.version,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playTimeSeconds: 0
    },

    phase: GAME_PHASES.TITLE,

    player: {
      id: GAME_DATABASE.protagonist.id,
      name: GAME_DATABASE.protagonist.name,
      role: GAME_DATABASE.protagonist.role,
      stats: { ...GAME_DATABASE.protagonist.initialStats },
      abilities: GAME_DATABASE.protagonist.abilities.map((ability) => ({ ...ability }))
    },

    world: {
      actId: "prologue",
      locationId: "commandCenter",
      era: "FUTURO",
      worldStatus: "LINHA TEMPORAL ESTÁVEL",
      currentSceneId: "introMission",
      cinematicIndex: 0
    },

    narrative: {
      currentDialogueIndex: 0,
      currentLineIndex: 0,
      textComplete: false,
      choiceHistory: [],
      flags: {
        briefingCompleted: false,
        missionAccepted: false,
        chronoActivated: false,
        arrivedInPast: false
      }
    },

    missions: {
      active: ["quest_future_truth"],
      completed: [],
      failed: []
    },

    codex: {
      unlockedEntries: []
    },

    settings: loadSettings(),

    statistics: {
      choicesMade: 0,
      scenesViewed: 0,
      saves: 0,
      loads: 0
    }
  };
}

/* ==========================================================================
   4. UTILITÁRIOS
   ========================================================================== */

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatDateTime(isoDate) {
  if (!isoDate) return "Nunca";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Data inválida";
  return date.toLocaleString("pt-BR");
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/* ==========================================================================
   5. STORAGE MANAGER
   ========================================================================== */

class StorageManager {
  static save(state) {
    const payload = {
      schema: 1,
      savedAt: new Date().toISOString(),
      game: deepClone({
        ...state,
        meta: {
          ...state.meta,
          updatedAt: new Date().toISOString()
        }
      })
    };

    localStorage.setItem(APP_CONFIG.saveKey, JSON.stringify(payload));
    return payload;
  }

  static load() {
    const raw = localStorage.getItem(APP_CONFIG.saveKey);
    if (!raw) return null;

    const payload = safeParse(raw);
    if (!payload || !payload.game) {
      return null;
    }

    return payload;
  }

  static clear() {
    localStorage.removeItem(APP_CONFIG.saveKey);
  }

  static hasSave() {
    return Boolean(localStorage.getItem(APP_CONFIG.saveKey));
  }

  static saveSettings(settings) {
    localStorage.setItem(APP_CONFIG.settingsKey, JSON.stringify(settings));
  }

  static loadSettings() {
    const raw = localStorage.getItem(APP_CONFIG.settingsKey);
    const parsed = safeParse(raw);

    return {
      fastText: Boolean(parsed?.fastText),
      highContrast: Boolean(parsed?.highContrast),
      reducedMotion: Boolean(parsed?.reducedMotion),
      audio: parsed?.audio !== false
    };
  }
}

function loadSettings() {
  return StorageManager.loadSettings();
}

/* ==========================================================================
   6. AUDIO MANAGER
   ========================================================================== */

class AudioManager {
  constructor() {
    this.context = null;
    this.enabled = true;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  ensureContext() {
    if (!this.enabled) return null;

    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
    }

    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }

    return this.context;
  }

  beep(frequency = 440, duration = 0.055, gainValue = 0.018) {
    const context = this.ensureContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, context.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.01);
  }

  confirm() {
    this.beep(690, 0.07, 0.025);
  }

  choice() {
    this.beep(515, 0.08, 0.02);
  }

  error() {
    this.beep(150, 0.1, 0.025);
  }
}

/* ==========================================================================
   7. QUEST MANAGER
   ========================================================================== */

class QuestManager {
  constructor(state) {
    this.state = state;
  }

  getDefinition(id) {
    return GAME_DATABASE.quests.find((quest) => quest.id === id) || null;
  }

  getActive() {
    return this.state.missions.active
      .map((id) => this.getDefinition(id))
      .filter(Boolean);
  }

  getCompleted() {
    return this.state.missions.completed
      .map((id) => this.getDefinition(id))
      .filter(Boolean);
  }

  isActive(id) {
    return this.state.missions.active.includes(id);
  }

  isCompleted(id) {
    return this.state.missions.completed.includes(id);
  }

  activate(id) {
    if (this.isActive(id) || this.isCompleted(id)) return false;
    this.state.missions.active.push(id);
    return true;
  }

  complete(id) {
    if (!this.isActive(id)) return false;

    this.state.missions.active = this.state.missions.active.filter((item) => item !== id);

    if (!this.state.missions.completed.includes(id)) {
      this.state.missions.completed.push(id);
    }

    return true;
  }
}

/* ==========================================================================
   8. NARRATIVE ENGINE
   ========================================================================== */

class NarrativeEngine {
  constructor(state, ui, quests) {
    this.state = state;
    this.ui = ui;
    this.quests = quests;

    this.scene = null;
    this.typingTimer = null;
    this.typingToken = 0;
    this.currentText = "";
    this.currentPosition = 0;
  }

  startScene(sceneId) {
    const scene = GAME_DATABASE.scenes[sceneId];

    if (!scene) {
      console.error(`Cena inexistente: ${sceneId}`);
      this.ui.notify("ERRO NARRATIVO", `Cena "${sceneId}" não foi encontrada.`, "error");
      return;
    }

    this.scene = scene;
    this.state.world.currentSceneId = sceneId;
    this.state.narrative.currentLineIndex = 0;
    this.state.narrative.textComplete = false;
    this.state.statistics.scenesViewed += 1;

    this.applySceneLocation(scene);
    this.showCurrentLine();
  }

  applySceneLocation(scene) {
    const locationMap = {
      "Centro de Comando": "commandCenter",
      "Câmara do Cronófago": "chronoChamber"
    };

    const locationId = locationMap[scene.location];
    if (!locationId || !GAME_DATABASE.locations[locationId]) return;

    const location = GAME_DATABASE.locations[locationId];

    this.state.world.locationId = locationId;
    this.state.world.actId = scene.act.toLowerCase().replace(/\s+/g, "");
    this.state.world.era = scene.era;

    this.ui.renderLocation(location);
  }

  getCurrentLine() {
    if (!this.scene) return null;
    return this.scene.lines[this.state.narrative.currentLineIndex] || null;
  }

  showCurrentLine() {
    const line = this.getCurrentLine();

    if (!line) {
      this.finishScene();
      return;
    }

    this.ui.setDialogueSpeaker(line.speaker, line.role, line.type);

    if (line.type === DIALOGUE_TYPES.CHOICE) {
      this.state.narrative.textComplete = true;
      this.ui.renderChoices(line.choices);
      this.ui.setContinueVisible(false);
      this.ui.typeDialogueText("");
      return;
    }

    this.ui.clearChoices();
    this.ui.setContinueVisible(true);

    this.typeText(line.text);
  }

  typeText(text) {
    this.clearTyping();

    this.currentText = text || "";
    this.currentPosition = 0;
    this.state.narrative.textComplete = false;

    const speed = this.state.settings.fastText
      ? APP_CONFIG.fastTypingSpeed
      : APP_CONFIG.typingSpeed;

    this.ui.typeDialogueText("");

    const token = ++this.typingToken;

    if (!this.currentText) {
      this.completeTyping(token);
      return;
    }

    this.typingTimer = window.setInterval(() => {
      if (token !== this.typingToken) return;

      this.currentPosition += 1;
      this.ui.typeDialogueText(this.currentText.slice(0, this.currentPosition));

      if (this.currentPosition >= this.currentText.length) {
        this.completeTyping(token);
      }
    }, speed);
  }

  completeTyping(token) {
    if (token !== this.typingToken) return;

    this.clearTyping();
    this.ui.typeDialogueText(this.currentText);
    this.state.narrative.textComplete = true;
  }

  skipTyping() {
    if (this.state.narrative.textComplete) return false;

    this.completeTyping(this.typingToken);
    return true;
  }

  clearTyping() {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }

  continue() {
    if (!this.scene) return;

    if (!this.state.narrative.textComplete) {
      this.skipTyping();
      return;
    }

    const currentLine = this.getCurrentLine();

    if (currentLine?.type === DIALOGUE_TYPES.CHOICE) {
      return;
    }

    this.state.narrative.currentLineIndex += 1;
    this.showCurrentLine();
  }

  choose(choiceId) {
    const line = this.getCurrentLine();
    if (!line || line.type !== DIALOGUE_TYPES.CHOICE) return;

    const choice = line.choices.find((item) => item.id === choiceId);

    if (!choice) {
      console.warn(`Escolha inexistente: ${choiceId}`);
      return;
    }

    this.applyChoice(choice);

    this.state.narrative.choiceHistory.push({
      sceneId: this.scene.id,
      choiceId: choice.id,
      consequence: choice.consequence,
      timestamp: new Date().toISOString()
    });

    this.state.statistics.choicesMade += 1;
    this.ui.showChoiceFeedback(choice);

    // Avança a cena depois da escolha.
    this.state.narrative.currentLineIndex += 1;

    if (this.scene.id === "missionChoice") {
      this.state.narrative.flags.missionAccepted = true;
      this.quests.complete("quest_future_truth");
      this.quests.activate("quest_temporal_launch");

      window.setTimeout(() => {
        this.startScene("finalWarning");
      }, 850);

      return;
    }

    this.showCurrentLine();
  }

  applyChoice(choice) {
    const effects = choice.effects || {};
    const stats = this.state.player.stats;

    for (const [key, delta] of Object.entries(effects)) {
      if (typeof stats[key] !== "number") continue;

      const max = key === "temporalStability" ? 100 : 100;
      stats[key] = clamp(stats[key] + Number(delta), 0, max);
    }

    this.ui.renderPlayerStats();
  }

  finishScene() {
    this.clearTyping();

    switch (this.scene?.id) {
      case "introMission":
        this.state.narrative.flags.briefingCompleted = true;
        this.state.narrative.currentDialogueIndex = 1;
        this.startScene("missionBriefing");
        break;

      case "missionBriefing":
        this.startScene("missionChoice");
        break;

      case "finalWarning":
        this.state.narrative.flags.chronoActivated = true;
        this.state.world.currentSceneId = "transitionToPast";
        this.startScene("transitionToPast");
        break;

      case "transitionToPast":
        this.transitionToPast();
        break;

      default:
        this.ui.notify("CENA CONCLUÍDA", "Não há próxima cena configurada neste módulo.", "info");
        break;
    }
  }

  transitionToPast() {
    this.ui.fadeTransition(true);

    window.setTimeout(() => {
      this.state.world.era = "PASSADO";
      this.state.world.worldStatus = "DESLOCAMENTO TEMPORAL CONCLUÍDO";
      this.state.narrative.flags.arrivedInPast = true;
      this.state.player.stats.temporalStability = clamp(
        this.state.player.stats.temporalStability - 7,
        0,
        100
      );

      this.ui.notify(
        "NOVO ATO",
        "A campanha avançará para o período histórico do passado.",
        "info"
      );

      this.ui.fadeTransition(false);

      // Neste primeiro módulo, chegamos ao ponto seguro da transição.
      // O próximo módulo implementará a exploração do passado.
      this.ui.showGameScreen();
      this.ui.renderFutureSceneAsTransition();
      this.ui.setDialogueSpeaker(
        "PROTOCOLO",
        "SISTEMA",
        DIALOGUE_TYPES.SYSTEM
      );
      this.ui.typeDialogueText(
        "DESLOCAMENTO CONCLUÍDO.\n\nO próximo módulo iniciará a exploração do passado."
      );
      this.ui.setContinueVisible(false);
    }, this.state.settings.reducedMotion ? 10 : 800);
  }
}

/* ==========================================================================
   9. UI MANAGER
   ========================================================================== */

class UIManager {
  constructor(state, audio) {
    this.state = state;
    this.audio = audio;

    this.refs = {};
    this.cacheDom();
    this.bindUiEvents();
  }

  cacheDom() {
    const ids = [
      "screenTitle",
      "screenCinematic",
      "screenGame",
      "continueButton",
      "newGameButton",
      "quickSaveButton",
      "menuButton",
      "cinematicTitle",
      "cinematicText",
      "cinematicActLabel",
      "cinematicSceneIndex",
      "cinematicPrevious",
      "cinematicNext",
      "phaseLabel",
      "worldStatus",
      "playerNameDisplay",
      "playerRoleDisplay",
      "hopeBar",
      "hopeValue",
      "freedomBar",
      "freedomValue",
      "controlBar",
      "controlValue",
      "temporalBar",
      "temporalValue",
      "abilityList",
      "locationAct",
      "locationName",
      "eraValue",
      "sceneTag",
      "sceneDescription",
      "interactionText",
      "dialogueSpeakerRole",
      "dialogueSpeaker",
      "dialogueType",
      "dialogueText",
      "typingCursor",
      "choiceContainer",
      "dialogueContinueButton",
      "dialogueSkipButton",
      "missionCount",
      "missionList",
      "codexProgress",
      "menuOverlay",
      "saveOverlay",
      "settingsOverlay",
      "questOverlay",
      "saveCurrentLabel",
      "loadCurrentLabel",
      "saveMessage",
      "questDetailList",
      "notificationStack",
      "fadeTransition",
      "openSaveButton",
      "openSettingsButton",
      "questButton",
      "inspectButton",
      "saveGameButton",
      "loadGameButton",
      "deleteSaveButton",
      "menuSave",
      "menuSettings",
      "menuCodex",
      "menuVisualLab",
      "menuRestart",
      "settingFastText",
      "settingHighContrast",
      "settingReducedMotion",
      "settingAudio"
    ];

    for (const id of ids) {
      this.refs[id] = document.getElementById(id);
    }

    this.systemTabs = [...document.querySelectorAll(".system-tab")];
    this.closeButtons = [...document.querySelectorAll("[data-close-overlay]")];
  }

  bindUiEvents() {
    this.refs.newGameButton.addEventListener("click", () => {
      this.audio.confirm();
      window.game.startNewGame();
    });

    this.refs.continueButton.addEventListener("click", () => {
      this.audio.confirm();
      window.game.loadGame();
    });

    this.refs.quickSaveButton.addEventListener("click", () => {
      window.game.saveGame();
    });

    this.refs.menuButton.addEventListener("click", () => {
      this.openOverlay("menuOverlay");
    });

    this.refs.dialogueContinueButton.addEventListener("click", () => {
      window.game.narrative.continue();
      this.audio.beep(420, 0.035, 0.011);
    });

    this.refs.dialogueSkipButton.addEventListener("click", () => {
      const skipped = window.game.narrative.skipTyping();
      if (!skipped) {
        window.game.narrative.continue();
      }
    });

    this.refs.inspectButton.addEventListener("click", () => {
      this.notify(
        "INSPEÇÃO",
        "A área contém estruturas reconstruídas, ruínas e sinais de vigilância. O mundo ainda está funcional apenas em partes.",
        "info"
      );
    });

    this.refs.questButton.addEventListener("click", () => {
      this.openOverlay("questOverlay");
      this.renderQuestDetails();
    });

    this.refs.openSaveButton.addEventListener("click", () => {
      this.openOverlay("saveOverlay");
      this.renderSaveState();
    });

    this.refs.openSettingsButton.addEventListener("click", () => {
      this.openOverlay("settingsOverlay");
      this.renderSettings();
    });

    this.refs.saveGameButton.addEventListener("click", () => {
      window.game.saveGame();
      this.renderSaveState();
    });

    this.refs.loadGameButton.addEventListener("click", () => {
      window.game.loadGame();
      this.closeOverlay("saveOverlay");
    });

    this.refs.deleteSaveButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Tem certeza de que deseja apagar o salvamento local desta crônica?"
      );

      if (!confirmed) return;

      StorageManager.clear();
      this.renderSaveState();
      this.notify("SALVAMENTO", "O registro local foi apagado.", "info");
    });

    this.refs.menuSave.addEventListener("click", () => {
      this.closeOverlay("menuOverlay");
      this.openOverlay("saveOverlay");
      this.renderSaveState();
    });

    this.refs.menuSettings.addEventListener("click", () => {
      this.closeOverlay("menuOverlay");
      this.openOverlay("settingsOverlay");
      this.renderSettings();
    });

    this.refs.menuCodex.addEventListener("click", () => {
      this.closeOverlay("menuOverlay");
      this.showGameScreen();
      document.querySelector('[data-tab="codexTab"]')?.click();
    });

    this.refs.menuVisualLab.addEventListener("click", () => {
      this.closeOverlay("menuOverlay");
      window.game?.visualLab?.open();
    });

    this.refs.menuRestart.addEventListener("click", () => {
      const confirmed = window.confirm(
        "Isso criará uma nova crônica e substituirá o estado atual em memória. O save local também será apagado. Continuar?"
      );

      if (!confirmed) return;

      StorageManager.clear();
      window.game.startNewGame();
      this.closeOverlay("menuOverlay");
    });

    this.refs.settingFastText.addEventListener("change", () => {
      this.state.settings.fastText = this.refs.settingFastText.checked;
      this.persistSettings();
    });

    this.refs.settingHighContrast.addEventListener("change", () => {
      this.state.settings.highContrast = this.refs.settingHighContrast.checked;
      this.applyVisualSettings();
      this.persistSettings();
    });

    this.refs.settingReducedMotion.addEventListener("change", () => {
      this.state.settings.reducedMotion = this.refs.settingReducedMotion.checked;
      this.applyVisualSettings();
      this.persistSettings();
    });

    this.refs.settingAudio.addEventListener("change", () => {
      this.state.settings.audio = this.refs.settingAudio.checked;
      this.audio.setEnabled(this.state.settings.audio);
      this.persistSettings();
    });

    for (const tab of this.systemTabs) {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        for (const other of this.systemTabs) {
          other.classList.toggle("active", other === tab);
        }

        document.querySelectorAll(".system-tab-content").forEach((panel) => {
          panel.classList.toggle("active", panel.id === target);
        });
      });
    }

    for (const closeButton of this.closeButtons) {
      closeButton.addEventListener("click", () => {
        this.closeOverlay(closeButton.dataset.closeOverlay);
      });
    }

    document.addEventListener("click", (event) => {
      if (event.target.classList.contains("overlay")) {
        event.target.hidden = true;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeAllOverlays();
        return;
      }

      if (window.game?.state.phase !== GAME_PHASES.PLAYING) return;

      if (event.key.toLowerCase() === "e") {
        this.refs.inspectButton.click();
      }

      if (event.key === "Enter" && !event.repeat) {
        if (!window.game.narrative.state?.narrative?.textComplete) {
          return;
        }
        this.refs.dialogueContinueButton.click();
      }
    });
  }

  init() {
    this.applyVisualSettings();
    this.renderTitleState();
    this.renderPlayerStats();
    this.renderMissions();
    this.renderAbilities();
  }

  showTitleScreen() {
    this.setScreen(SCREENS.title);
    this.state.phase = GAME_PHASES.TITLE;
    this.updatePhaseLabel("MENU PRINCIPAL");
  }

  showCinematicScreen() {
    this.setScreen(SCREENS.cinematic);
    this.state.phase = GAME_PHASES.CINEMATIC;
    this.updatePhaseLabel("PRÓLOGO");
  }

  showGameScreen() {
    this.setScreen(SCREENS.game);
    this.state.phase = GAME_PHASES.PLAYING;
    this.updatePhaseLabel(this.state.world.actId === "prologue" ? "PRÓLOGO" : "CAMPANHA");
    this.renderPlayerStats();
    this.renderMissions();
    this.renderWorldStatus();
  }

  setScreen(screenId) {
    Object.values(SCREENS).forEach((id) => {
      this.refs[id].classList.toggle("active", id === screenId);
    });
  }

  updatePhaseLabel(text) {
    this.refs.phaseLabel.textContent = text;
  }

  renderTitleState() {
    const saveExists = StorageManager.hasSave();
    this.refs.continueButton.classList.toggle("hidden", !saveExists);
  }

  renderPlayerStats() {
    const stats = this.state.player.stats;

    const rows = [
      ["hope", "hopeBar", "hopeValue"],
      ["freedom", "freedomBar", "freedomValue"],
      ["control", "controlBar", "controlValue"],
      ["temporalStability", "temporalBar", "temporalValue"]
    ];

    for (const [statKey, barId, valueId] of rows) {
      const value = clamp(Number(stats[statKey] || 0), 0, 100);
      this.refs[barId].style.width = `${value}%`;
      this.refs[valueId].textContent = String(value);
    }

    this.refs.playerNameDisplay.textContent = this.state.player.name;
    this.refs.playerRoleDisplay.textContent = this.state.player.role;
  }

  renderAbilities() {
    this.refs.abilityList.innerHTML = "";

    for (const ability of this.state.player.abilities) {
      const node = document.createElement("div");
      node.className = "ability-item";
      node.innerHTML = `
        <span>${escapeHtml(ability.name)}</span>
        <small>${escapeHtml(ability.level)}</small>
      `;
      this.refs.abilityList.appendChild(node);
    }
  }

  renderLocation(location) {
    this.refs.locationAct.textContent = location.act;
    this.refs.locationName.textContent = location.name;
    this.refs.eraValue.textContent = location.era;
    this.refs.sceneTag.textContent = location.tag;
    this.refs.sceneDescription.textContent = location.description;
    this.refs.interactionText.textContent = `Explorar ${location.name}`;
  }

  renderFutureSceneAsTransition() {
    this.refs.locationAct.textContent = "ATO II";
    this.refs.locationName.textContent = "DESLOCAMENTO TEMPORAL";
    this.refs.eraValue.textContent = "PASSADO";
    this.refs.sceneTag.textContent = "TRANSIÇÃO";
    this.refs.sceneDescription.textContent =
      "A máquina completou o deslocamento. A próxima etapa será a exploração do período histórico.";
    this.refs.interactionText.textContent = "Aguardando próximo módulo";
    this.renderWorldStatus();
  }

  renderWorldStatus() {
    this.refs.worldStatus.textContent = this.state.world.worldStatus;
  }

  setDialogueSpeaker(speaker, role, type) {
    this.refs.dialogueSpeaker.textContent = speaker || "SISTEMA";
    this.refs.dialogueSpeakerRole.textContent = role || "PROTOCOLO";
    this.refs.dialogueType.textContent = type || DIALOGUE_TYPES.SYSTEM;
  }

  typeDialogueText(text) {
    this.refs.dialogueText.textContent = text;
    this.refs.typingCursor.style.display = text ? "inline-block" : "none";
  }

  setContinueVisible(visible) {
    this.refs.dialogueContinueButton.style.display = visible ? "inline-flex" : "none";
  }

  clearChoices() {
    this.refs.choiceContainer.innerHTML = "";
  }

  renderChoices(choices = []) {
    this.refs.choiceContainer.innerHTML = "";

    for (const choice of choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.textContent = choice.text;

      button.addEventListener("click", () => {
        window.game.narrative.choose(choice.id);
        this.audio.choice();
      });

      this.refs.choiceContainer.appendChild(button);
    }
  }

  showChoiceFeedback(choice) {
    this.notify(
      "ESCOLHA REGISTRADA",
      choice.consequence,
      "info"
    );
  }

  renderMissions() {
    const active = window.game?.quests?.getActive?.() || [];
    const completed = window.game?.quests?.getCompleted?.() || [];

    this.refs.missionCount.textContent = String(active.length);

    this.refs.missionList.innerHTML = "";

    for (const quest of active) {
      this.refs.missionList.appendChild(this.createMissionCard(quest, false));
    }

    for (const quest of completed.slice(-3)) {
      this.refs.missionList.appendChild(this.createMissionCard(quest, true));
    }

    this.renderQuestDetails();
  }

  createMissionCard(quest, completed) {
    const card = document.createElement("article");
    card.className = `mission-card${completed ? " completed" : ""}`;

    card.innerHTML = `
      <h4>${escapeHtml(quest.title)}</h4>
      <p>${escapeHtml(quest.objective)}</p>
      <small>${completed ? "CONCLUÍDA" : "ATIVA"} • ${escapeHtml(quest.location)}</small>
    `;

    return card;
  }

  renderQuestDetails() {
    if (!this.refs.questDetailList) return;

    const active = window.game?.quests?.getActive?.() || [];
    const completed = window.game?.quests?.getCompleted?.() || [];
    const all = [...active, ...completed];

    this.refs.questDetailList.innerHTML = "";

    if (!all.length) {
      const empty = document.createElement("div");
      empty.className = "quest-detail-card";
      empty.textContent = "Nenhuma missão registrada.";
      this.refs.questDetailList.appendChild(empty);
      return;
    }

    for (const quest of all) {
      const card = document.createElement("article");
      card.className = "quest-detail-card";

      card.innerHTML = `
        <h3>${escapeHtml(quest.title)}</h3>
        <p>${escapeHtml(quest.objective)}</p>
        <dl>
          <dt>CONTEXTO</dt><dd>${escapeHtml(quest.context)}</dd>
          <dt>LOCAL</dt><dd>${escapeHtml(quest.location)}</dd>
          <dt>NPCS</dt><dd>${escapeHtml(quest.npcs.join(", ") || "Nenhum")}</dd>
          <dt>OBSTÁCULOS</dt><dd>${escapeHtml(quest.obstacles.join(", ") || "Nenhum")}</dd>
          <dt>CONSEQUÊNCIAS</dt><dd>${escapeHtml(quest.consequences)}</dd>
          <dt>RECOMPENSAS</dt><dd>${escapeHtml(quest.rewards.join(", ") || "Nenhuma")}</dd>
          <dt>REVELAÇÃO</dt><dd>${escapeHtml(quest.revelation)}</dd>
        </dl>
      `;

      this.refs.questDetailList.appendChild(card);
    }
  }

  renderCinematic() {
    const scenes = GAME_DATABASE.prologueCinematic;
    const index = clamp(
      this.state.world.cinematicIndex,
      0,
      scenes.length - 1
    );

    const scene = scenes[index];

    this.refs.cinematicActLabel.textContent = scene.act;
    this.refs.cinematicSceneIndex.textContent = `${String(index + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
    this.refs.cinematicTitle.textContent = scene.title;
    this.refs.cinematicText.textContent = scene.text;

    this.refs.cinematicPrevious.disabled = index === 0;
    this.refs.cinematicNext.textContent =
      index === scenes.length - 1 ? "ENTRAR NO JOGO" : "CONTINUAR";
  }

  nextCinematic() {
    const scenes = GAME_DATABASE.prologueCinematic;
    const lastIndex = scenes.length - 1;

    if (this.state.world.cinematicIndex < lastIndex) {
      this.state.world.cinematicIndex += 1;
      this.renderCinematic();
      this.audio.beep(530, 0.045, 0.01);
      return;
    }

    this.showGameScreen();
    window.game.startPrologue();
    this.audio.confirm();
  }

  previousCinematic() {
    if (this.state.world.cinematicIndex <= 0) return;

    this.state.world.cinematicIndex -= 1;
    this.renderCinematic();
  }

  openOverlay(id) {
    const overlay = this.refs[id];
    if (!overlay) return;
    overlay.hidden = false;
  }

  closeOverlay(id) {
    const overlay = this.refs[id];
    if (!overlay) return;
    overlay.hidden = true;
  }

  closeAllOverlays() {
    for (const key of ["menuOverlay", "saveOverlay", "settingsOverlay", "questOverlay"]) {
      this.closeOverlay(key);
    }
  }

  renderSaveState() {
    const payload = StorageManager.load();

    if (!payload) {
      this.refs.saveCurrentLabel.textContent = "Nenhum salvamento.";
      this.refs.loadCurrentLabel.textContent = "Nenhum salvamento encontrado.";
      return;
    }

    const saved = payload.game;
    this.refs.saveCurrentLabel.textContent =
      `Atualizado em ${formatDateTime(saved.meta.updatedAt)} • ${formatDuration(saved.meta.playTimeSeconds)} de jogo`;

    this.refs.loadCurrentLabel.textContent =
      `Versão ${saved.meta.version} • ${formatDateTime(payload.savedAt)}`;
  }

  renderSettings() {
    const settings = this.state.settings;
    this.refs.settingFastText.checked = settings.fastText;
    this.refs.settingHighContrast.checked = settings.highContrast;
    this.refs.settingReducedMotion.checked = settings.reducedMotion;
    this.refs.settingAudio.checked = settings.audio;
  }

  persistSettings() {
    StorageManager.saveSettings(this.state.settings);
  }

  applyVisualSettings() {
    document.body.classList.toggle("high-contrast", this.state.settings.highContrast);
    document.body.classList.toggle("reduced-motion", this.state.settings.reducedMotion);

    this.audio.setEnabled(this.state.settings.audio);
    this.renderSettings();
  }

  notify(title, message, type = "info") {
    const item = document.createElement("div");
    item.className = `notification notification-${type}`;

    item.innerHTML = `
      <div class="notification-title">${escapeHtml(title)}</div>
      <div class="notification-message">${escapeHtml(message)}</div>
    `;

    this.refs.notificationStack.appendChild(item);

    while (this.refs.notificationStack.children.length > APP_CONFIG.maxNotifications) {
      this.refs.notificationStack.firstElementChild?.remove();
    }

    window.setTimeout(() => {
      item.remove();
    }, 5500);
  }

  fadeTransition(active) {
    this.refs.fadeTransition.classList.toggle("active", Boolean(active));
  }
}

/* ==========================================================================
   10. INPUT MANAGER
   ========================================================================== */

class InputManager {
  constructor(game) {
    this.game = game;
  }

  bind() {
    window.addEventListener("beforeunload", () => {
      // Salvamento automático leve apenas se o jogador já iniciou a campanha.
      if (this.game.state.phase !== GAME_PHASES.TITLE) {
        try {
          this.game.saveGame(true);
        } catch (error) {
          console.warn("Falha no salvamento automático:", error);
        }
      }
    });
  }
}

/* ============================================================================
   11. VISUAL ENGINEERING LAB
   ----------------------------------------------------------------------------
   Observabilidade nativa e contextual da interface.
   Mantém a campanha intacta e funciona como uma ferramenta de inspeção em
   tempo de execução:
   - espelho do DOM real;
   - árvore hierárquica;
   - CSS computado;
   - fluxo EVENT → FUNCTION → STATE → DOM → RESULT;
   - mutações;
   - auto-testes de integridade;
   - estados visuais de operação.
   ============================================================================ */

class VisualLabManager {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.activeTab = "preview";
    this.selectedTarget = "#gameMain";
    this.events = [];
    this.mutationCount = 0;
    this.eventCount = 0;
    this.observerCount = 0;
    this.started = false;
    this.renderScheduled = false;
    this.snapshot = null;
    this.maxLog = 32;
  }

  init() {
    this.root = document.getElementById("visualLabOverlay");
    if (!this.root) return;

    this.cache();
    this.bind();
    this.startObservers();
    this.started = true;
    this.record("SYSTEM", "VisualLab.init()", "Laboratório visual inicializado.");
    this.refresh("INIT");
  }

  cache() {
    const ids = [
      "visualLabLiveDot", "visualLabLiveText", "visualLabAction",
      "visualLabTarget", "visualLabTimestamp", "visualLabLivePreview",
      "visualLabSelection", "visualLabEvent", "visualLabFunction",
      "visualLabState", "visualLabDomUpdate", "visualLabResult",
      "visualLabContext", "visualLabDomTree", "visualLabCssMetrics",
      "visualLabJsLog", "visualLabTests", "visualLabObserverCount",
      "visualLabMutationCount", "visualLabEventCount", "visualLabFooterTarget",
      "visualLabRefresh", "visualLabClear"
    ];
    this.refs = {};
    for (const id of ids) this.refs[id] = document.getElementById(id);
    this.tabs = [...this.root.querySelectorAll("[data-lab-tab]")];
    this.panels = [...this.root.querySelectorAll("[data-lab-panel]")];
  }

  bind() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.activeTab = tab.dataset.labTab || "preview";
        this.tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", String(active));
        });
        this.panels.forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.labPanel === this.activeTab);
        });
        this.refresh(`TAB:${this.activeTab.toUpperCase()}`);
      });
    });

    this.refs.visualLabRefresh?.addEventListener("click", () => this.refresh("MANUAL_REFRESH"));
    this.refs.visualLabClear?.addEventListener("click", () => {
      this.events = [];
      this.record("SYSTEM", "clearLog()", "Log visual limpo pelo operador.");
      this.refresh("CLEAR_LOG");
    });

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        this.toggle();
      }
    });

    document.addEventListener("click", (event) => {
      const target = event.target?.closest?.("button, [role='button'], a, input");
      if (!target || target.closest("#visualLabOverlay")) return;

      this.eventCount += 1;
      const label = target.id ? `#${target.id}` :
        target.getAttribute("aria-label") ||
        target.textContent?.trim().replace(/\s+/g, " ").slice(0, 48) ||
        target.tagName.toLowerCase();

      this.selectedTarget = target.id ? `#${target.id}` : label;
      this.snapshotTarget(target);

      this.record("EVENT", "click()", `Interação detectada em ${this.selectedTarget}.`);
      this.scheduleRefresh("CLICK");
    }, true);
  }

  startObservers() {
    const appRoot = document.getElementById("gameMain");
    if (!appRoot) return;

    const observer = new MutationObserver((mutations) => {
      this.mutationCount += mutations.length;
      const significant = mutations.some((mutation) =>
        mutation.type === "childList" ||
        mutation.type === "attributes" && ["class", "style", "hidden"].includes(mutation.attributeName)
      );

      if (significant) {
        const source = mutations[0]?.target instanceof Element
          ? this.describeNode(mutations[0].target)
          : "#gameMain";

        this.record("DOM", "MutationObserver", `${mutations.length} mutação(ões) observada(s) em ${source}.`);
        this.scheduleRefresh("DOM_MUTATION");
      }
    });

    observer.observe(appRoot, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "aria-selected", "disabled"]
    });

    this.observerCount += 1;
    this.domObserver = observer;
  }

  open() {
    if (!this.root) return;
    this.root.hidden = false;
    this.refresh("OPEN");
    this.root.querySelector(".visual-lab-tab.active")?.focus({ preventScroll: true });
  }

  close() {
    if (this.root) this.root.hidden = true;
  }

  toggle() {
    if (!this.root) return;
    if (this.root.hidden) this.open();
    else this.close();
  }

  scheduleRefresh(reason) {
    if (this.renderScheduled) return;
    this.renderScheduled = true;
    window.requestAnimationFrame(() => {
      this.renderScheduled = false;
      this.refresh(reason);
    });
  }

  record(type, functionName, detail) {
    this.events.unshift({
      type,
      functionName,
      detail,
      time: new Date()
    });
    this.events = this.events.slice(0, this.maxLog);
  }

  describeNode(node) {
    if (!(node instanceof Element)) return "#document";
    if (node.id) return `#${node.id}`;
    const classes = [...node.classList].slice(0, 2).map((item) => `.${item}`).join("");
    return `${node.tagName.toLowerCase()}${classes}`;
  }

  snapshotTarget(target) {
    if (!(target instanceof Element)) return;
    const rect = target.getBoundingClientRect();
    this.snapshot = {
      target,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      time: performance.now()
    };
  }

  refresh(reason = "REFRESH") {
    if (!this.root) return;

    const target = this.resolveTarget();
    const state = this.game.state || {};
    const computed = target ? getComputedStyle(target) : null;

    this.refs.visualLabAction.textContent = reason;
    this.refs.visualLabTarget.textContent = this.describeNode(target);
    this.refs.visualLabTimestamp.textContent = new Date().toLocaleTimeString("pt-BR");
    this.refs.visualLabEvent.textContent = this.events[0]?.detail || "aguardando";
    this.refs.visualLabFunction.textContent = this.events[0]?.functionName || "observação contínua";
    this.refs.visualLabState.textContent = `${state.phase || "?"} • ${state.world?.actId || "?"}`;
    this.refs.visualLabDomUpdate.textContent = `${this.mutationCount} mutações`;
    this.refs.visualLabResult.textContent = target ? "renderização consistente" : "alvo indisponível";

    this.refs.visualLabLiveText.textContent = this.root.hidden ? "PAUSADO" : "OBSERVANDO";
    this.refs.visualLabLiveDot.classList.toggle("paused", this.root.hidden);

    this.renderContext(state, target);
    this.renderPreview(target);
    this.renderDomTree();
    this.renderCssMetrics(computed, target);
    this.renderJsLog();
    this.renderTests();
    this.renderFooter(target);

    if (target) this.highlightTarget(target);
  }

  resolveTarget() {
    if (this.selectedTarget?.startsWith("#")) {
      return document.getElementById(this.selectedTarget.slice(1)) ||
        document.querySelector(".world-scene") ||
        document.getElementById("gameMain");
    }

    return document.querySelector(".world-scene") ||
      document.getElementById("gameMain");
  }

  renderContext(state, target) {
    const stats = state.player?.stats || {};
    const missions = state.missions || {};
    const stageKeys = Object.keys(state).filter((key) => /^stage\d+$/.test(key));

    this.refs.visualLabContext.innerHTML = `
      <div class="visual-lab-context-card featured">
        <span>FASE ATUAL</span>
        <strong>${escapeHtml(String(state.phase || "—"))}</strong>
        <small>${escapeHtml(String(state.world?.actId || "—"))} • ${escapeHtml(String(state.world?.era || "—"))}</small>
      </div>
      <div class="visual-lab-kv">
        <div><span>ALVO</span><strong>${escapeHtml(this.describeNode(target))}</strong></div>
        <div><span>LOCAL</span><strong>${escapeHtml(state.world?.locationId || "—")}</strong></div>
        <div><span>ESTADO DO MUNDO</span><strong>${escapeHtml(state.world?.worldStatus || "—")}</strong></div>
        <div><span>MISSÕES ATIVAS</span><strong>${Array.isArray(missions.active) ? missions.active.length : 0}</strong></div>
      </div>
      <div class="visual-lab-stat-matrix">
        <div><span>ESPERANÇA</span><strong>${Number(stats.hope ?? 0)}</strong></div>
        <div><span>LIBERDADE</span><strong>${Number(stats.freedom ?? 0)}</strong></div>
        <div><span>CONTROLE</span><strong>${Number(stats.control ?? 0)}</strong></div>
        <div><span>TEMPO</span><strong>${Number(stats.temporalStability ?? 0)}</strong></div>
      </div>
      <div class="visual-lab-chip-row">
        ${stageKeys.length
          ? stageKeys.slice(0, 9).map((key) => `<span>${escapeHtml(key.toUpperCase())}</span>`).join("")
          : "<span>CORE</span>"}
      </div>
    `;
  }

  renderPreview(target) {
    const host = this.refs.visualLabLivePreview;
    host.innerHTML = "";

    if (target) {
      const mirror = target.cloneNode(true);
      mirror.removeAttribute("id");
      mirror.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      mirror.querySelectorAll("button, input, select, textarea, a").forEach((node) => {
        node.disabled = true;
        node.setAttribute("tabindex", "-1");
      });

      const wrapper = document.createElement("div");
      wrapper.className = "visual-lab-mirror";
      wrapper.appendChild(mirror);
      host.appendChild(wrapper);
    } else {
      host.innerHTML = `<div class="visual-lab-empty">Nenhum componente disponível para espelhamento.</div>`;
    }
  }

  renderDomTree() {
    const root = document.getElementById("gameMain");
    if (!root) return;

    const walk = (node, depth = 0, maxDepth = 3) => {
      if (!(node instanceof Element) || depth > maxDepth) return "";
      const children = [...node.children].slice(0, 8);
      const label = this.describeNode(node);
      const marker = node.hidden ? "hidden" : node.classList.contains("active") ? "active" : "";
      const childHtml = children.map((child) => walk(child, depth + 1, maxDepth)).join("");

      return `
        <div class="visual-lab-tree-node ${marker}" style="--depth:${depth}">
          <span class="visual-lab-tree-icon">${depth === 0 ? "◆" : "├"}</span>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(node.tagName.toLowerCase())}</small>
        </div>${childHtml}
      `;
    };

    this.refs.visualLabDomTree.innerHTML = walk(root);
  }

  renderCssMetrics(computed, target) {
    if (!computed || !target) {
      this.refs.visualLabCssMetrics.innerHTML = `<div class="visual-lab-empty">Alvo CSS indisponível.</div>`;
      return;
    }

    const rect = target.getBoundingClientRect();
    const props = [
      ["WIDTH", `${Math.round(rect.width)}px`],
      ["HEIGHT", `${Math.round(rect.height)}px`],
      ["DISPLAY", computed.display],
      ["POSITION", computed.position],
      ["GAP", computed.gap],
      ["PADDING", computed.padding],
      ["BORDER", computed.borderTopWidth],
      ["RADIUS", computed.borderTopLeftRadius],
      ["OPACITY", computed.opacity],
      ["TRANSFORM", computed.transform === "none" ? "none" : computed.transform],
      ["Z-INDEX", computed.zIndex]
    ];

    this.refs.visualLabCssMetrics.innerHTML = props.map(([label, value]) => `
      <div class="visual-lab-css-row">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(String(value))}</strong>
      </div>
    `).join("");
  }

  renderJsLog() {
    if (!this.events.length) {
      this.refs.visualLabJsLog.innerHTML = `<div class="visual-lab-empty">Nenhum evento registrado.</div>`;
      return;
    }

    this.refs.visualLabJsLog.innerHTML = this.events.slice(0, 16).map((item) => `
      <div class="visual-lab-log-row ${escapeHtml(item.type.toLowerCase())}">
        <span>${escapeHtml(item.type)}</span>
        <div><strong>${escapeHtml(item.functionName)}</strong><p>${escapeHtml(item.detail)}</p></div>
        <time>${item.time.toLocaleTimeString("pt-BR")}</time>
      </div>
    `).join("");
  }

  renderTests() {
    const tests = [
      this.check("HTML", () => !!document.getElementById("screenGame"), "Tela principal existe."),
      this.check("CSS", () => !!document.querySelector('link[rel="stylesheet"][href="style.css"]') && document.styleSheets.length > 0, "Folha de estilo carregada."),
      this.check("JS", () => !!window.game && typeof window.game.startNewGame === "function", "Controlador principal disponível."),
      this.check("DOM", () => document.querySelectorAll("#screenTitle, #screenCinematic, #screenGame").length === 3, "As três telas nucleares estão presentes."),
      this.check("A11Y", () => document.getElementById("menuVisualLab")?.getAttribute("aria-controls") === "visualLabOverlay" && this.root.getAttribute("role") === "dialog", "Console com associação semântica e controle de teclado."),
      this.check("MODULES", () => !!this.game.stage2UI && !!this.game.stage10UI, "Módulos de campanha conectados ao controlador."),
      this.check("STATE", () => !!this.game.state?.world?.actId, "Estado do mundo disponível.")
    ];

    this.refs.visualLabTests.innerHTML = tests.map((test) => `
      <div class="visual-lab-test ${test.pass ? "pass" : "fail"}">
        <span>${test.pass ? "✓" : "!"}</span>
        <strong>${escapeHtml(test.label)}</strong>
        <p>${escapeHtml(test.detail)}</p>
      </div>
    `).join("");
  }

  check(label, fn, detail) {
    try {
      return { label, pass: Boolean(fn()), detail };
    } catch (error) {
      return { label, pass: false, detail: `${detail} ${error.message}` };
    }
  }

  renderFooter(target) {
    this.refs.visualLabObserverCount.textContent = String(this.observerCount);
    this.refs.visualLabMutationCount.textContent = String(this.mutationCount);
    this.refs.visualLabEventCount.textContent = String(this.eventCount);
    this.refs.visualLabFooterTarget.textContent = this.describeNode(target);
  }

  highlightTarget(target) {
    if (!target || target === this.root) return;
    const canvas = this.refs.visualLabCanvas;
    const selection = this.refs.visualLabSelection;
    if (!canvas || !selection) return;

    const rect = target.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const viewportWidth = Math.max(1, window.innerWidth);
    const viewportHeight = Math.max(1, window.innerHeight);
    const x = (rect.left / viewportWidth) * canvasRect.width;
    const y = (rect.top / viewportHeight) * canvasRect.height;
    const width = (rect.width / viewportWidth) * canvasRect.width;
    const height = (rect.height / viewportHeight) * canvasRect.height;

    selection.hidden = false;
    selection.style.transform = `translate(${Math.max(4, Math.min(x, canvasRect.width - 24))}px, ${Math.max(4, Math.min(y, canvasRect.height - 24))}px)`;
    selection.style.width = `${Math.max(18, Math.min(width, canvasRect.width - 8))}px`;
    selection.style.height = `${Math.max(18, Math.min(height, canvasRect.height - 8))}px`;
  }
}

/* ==========================================================================
   12. GAME CONTROLLER
   ========================================================================== */

class GameController {
  constructor() {
    this.state = createInitialState();
    this.audio = new AudioManager();
    this.quests = new QuestManager(this.state);
    this.ui = new UIManager(this.state, this.audio);
    this.narrative = new NarrativeEngine(this.state, this.ui, this.quests);
    this.visualLab = new VisualLabManager(this);
    this.input = new InputManager(this);

    this.lastTick = performance.now();
    this.tickTimer = null;
  }

  initialize() {
    this.ui.init();
    this.input.bind();
    this.visualLab.init();
    this.updateContinueButton();
    this.startGameClock();

    // Eventos do carrossel cinematográfico.
    this.ui.refs.cinematicNext.addEventListener("click", () => {
      this.ui.nextCinematic();
    });

    this.ui.refs.cinematicPrevious.addEventListener("click", () => {
      this.ui.previousCinematic();
    });

    this.ui.showTitleScreen();
  }

  updateContinueButton() {
    this.ui.renderTitleState();
  }

  startNewGame() {
    this.visualLab?.record("STATE", "GameController.startNewGame()", "Inicializando nova crônica e reiniciando o estado.");
    StorageManager.clear();

    const settings = deepClone(this.state.settings);

    this.state = createInitialState();
    this.state.settings = settings;

    this.quests.state = this.state;
    this.narrative.state = this.state;
    this.ui.state = this.state;

    this.ui.renderPlayerStats();
    this.ui.renderAbilities();
    this.ui.renderMissions();

    this.state.world.cinematicIndex = 0;

    this.ui.showCinematicScreen();
    this.ui.renderCinematic();

    this.ui.notify(
      "NOVA CRÔNICA",
      "Prólogo carregado. O estado do jogo está pronto.",
      "info"
    );
  }

  startPrologue() {
    this.visualLab?.record("STATE", "GameController.startPrologue()", "Entrando no núcleo jogável após o prólogo.");
    this.ui.showGameScreen();
    this.narrative.startScene("introMission");

    this.ui.notify(
      "PRÓLOGO",
      "O Mundo Destruído — a campanha começou.",
      "info"
    );
  }

  saveGame(silent = false) {
    this.visualLab?.record("STATE", "GameController.saveGame()", silent ? "Salvamento silencioso solicitado." : "Salvamento manual solicitado.");
    try {
      this.state.meta.playTimeSeconds = Math.floor(this.state.meta.playTimeSeconds);
      this.state.statistics.saves += 1;
      StorageManager.save(this.state);
      this.updateContinueButton();

      if (!silent) {
        this.audio.confirm();
        this.ui.notify(
          "SALVAMENTO CONCLUÍDO",
          `Crônica salva. Tempo de jogo: ${formatDuration(this.state.meta.playTimeSeconds)}.`,
          "success"
        );
        this.ui.renderSaveState();
      }
    } catch (error) {
      console.error(error);
      this.audio.error();
      this.ui.notify(
        "ERRO DE SALVAMENTO",
        "Não foi possível gravar o progresso local.",
        "error"
      );
    }
  }

  loadGame() {
    this.visualLab?.record("STATE", "GameController.loadGame()", "Tentativa de restauração do estado persistido.");
    const payload = StorageManager.load();

    if (!payload?.game) {
      this.audio.error();
      this.ui.notify(
        "NENHUM SAVE",
        "Não existe uma crônica salva neste navegador.",
        "error"
      );
      return;
    }

    try {
      this.state = this.mergeLoadedState(payload.game);

      this.quests.state = this.state;
      this.narrative.state = this.state;
      this.ui.state = this.state;

      this.state.statistics.loads += 1;

      this.ui.applyVisualSettings();
      this.ui.renderPlayerStats();
      this.ui.renderAbilities();
      this.ui.renderMissions();
      this.ui.renderWorldStatus();

      this.ui.showGameScreen();

      const sceneId = this.state.world.currentSceneId;

      if (sceneId && GAME_DATABASE.scenes[sceneId]) {
        this.narrative.startScene(sceneId);
        this.state.narrative.currentLineIndex =
          clamp(
            Number(payload.game?.narrative?.currentLineIndex || 0),
            0,
            GAME_DATABASE.scenes[sceneId].lines.length
          );
        this.narrative.showCurrentLine();
      } else if (this.state.narrative.flags.arrivedInPast) {
        this.ui.renderFutureSceneAsTransition();
        this.ui.setDialogueSpeaker("PROTOCOLO", "SISTEMA", DIALOGUE_TYPES.SYSTEM);
        this.ui.typeDialogueText(
          "DESLOCAMENTO CONCLUÍDO.\n\nO próximo módulo iniciará a exploração do passado."
        );
        this.ui.setContinueVisible(false);
      } else {
        this.narrative.startScene("introMission");
      }

      this.ui.notify(
        "CRÔNICA CARREGADA",
        `Salvamento de ${formatDateTime(payload.savedAt)} restaurado.`,
        "success"
      );
    } catch (error) {
      console.error("Erro ao carregar:", error);
      this.audio.error();
      this.ui.notify(
        "ERRO DE CARREGAMENTO",
        "O arquivo de progresso existe, mas não pôde ser restaurado com segurança.",
        "error"
      );
    }
  }

  mergeLoadedState(savedState) {
    const fresh = createInitialState();

    return {
      ...fresh,
      ...deepClone(savedState),
      meta: {
        ...fresh.meta,
        ...(savedState.meta || {})
      },
      player: {
        ...fresh.player,
        ...(savedState.player || {}),
        stats: {
          ...fresh.player.stats,
          ...(savedState.player?.stats || {})
        }
      },
      world: {
        ...fresh.world,
        ...(savedState.world || {})
      },
      narrative: {
        ...fresh.narrative,
        ...(savedState.narrative || {}),
        flags: {
          ...fresh.narrative.flags,
          ...(savedState.narrative?.flags || {})
        }
      },
      missions: {
        ...fresh.missions,
        ...(savedState.missions || {})
      },
      codex: {
        ...fresh.codex,
        ...(savedState.codex || {})
      },
      settings: {
        ...fresh.settings,
        ...(savedState.settings || {})
      },
      statistics: {
        ...fresh.statistics,
        ...(savedState.statistics || {})
      }
    };
  }

  startGameClock() {
    this.tickTimer = window.setInterval(() => {
      if (this.state.phase === GAME_PHASES.PLAYING || this.state.phase === GAME_PHASES.CINEMATIC) {
        const now = performance.now();
        const delta = (now - this.lastTick) / 1000;
        this.lastTick = now;

        if (delta >= 0 && delta < 10) {
          this.state.meta.playTimeSeconds += delta;
        }
      } else {
        this.lastTick = performance.now();
      }
    }, 1000);
  }
}

/* ==========================================================================
   12. HTML ESCAPE
   ========================================================================== */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ==========================================================================
   13. BOOT
   ========================================================================== */

window.addEventListener("DOMContentLoaded", () => {
  window.game = new GameController();
  window.game.initialize();
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 2 JS
   ============================================================================ */

/* JESUS CHRONICLES — ETAPA 2: sistemas fundamentais */
"use strict";

const STAGE2_VERSION="0.2.0";
const STAGE2_DB={
characters:[
{id:"protagonist",name:"O Protagonista",origin:"Futuro devastado",personality:"Inteligente, determinado e corajoso.",history:"Sobreviveu a uma zona de conflito e foi selecionado para a missão temporal.",values:"Responsabilidade, esperança e ação.",contradictions:"Deseja salvar o mundo, mas inicialmente procura uma solução externa.",objective:"Executar a missão da organização.",strengths:"Determinação, coragem e observação.",weaknesses:"Orgulho, ansiedade e excesso de certeza.",abilities:["Observação","Interação social","Sensibilidade temporal"],secrets:["Ainda não sabe por que foi realmente escolhido."],arc:"INÍCIO: Eu vou salvar o mundo.",symbolism:"Representa a tendência humana de buscar um salvador externo."},
{id:"organization_member",name:"Membro da Organização",origin:"Futuro",personality:"Reservado, analítico e cuidadoso.",history:"Integra a organização que descobriu a hipótese da viagem temporal.",values:"Sobrevivência e estabilidade.",contradictions:"Questiona a missão, mas participa da execução.",objective:"Concluir o protocolo temporal.",strengths:"Conhecimento técnico e histórico.",weaknesses:"Informação incompleta e lealdades divididas.",abilities:["Tecnologia temporal","Análise de dados"],secrets:["A organização sabe menos sobre o futuro do que afirma."],arc:"Ainda não definido.",symbolism:"Representa a tentação de resolver problemas humanos por sistemas."},
{id:"jesus",name:"Jesus",origin:"Período histórico",personality:"A representação deve privilegiar diálogo, ensinamentos, perguntas e transformação.",history:"Figura central do encontro planejado para desenvolvimento posterior.",values:"Papel espiritual e filosófico definido pela história.",contradictions:"Nenhuma adicionada.",objective:"Não constitui objetivo jogável neste módulo.",strengths:"Influência espiritual e filosófica na narrativa.",weaknesses:"Não deve ser modelado como personagem de combate comum.",abilities:["Ensinamentos","Perguntas","Influência narrativa"],secrets:["O encontro deve possuir força pelo diálogo."],arc:"Central para a transformação do protagonista.",symbolism:"Representa a pergunta sobre responsabilidade, liberdade e transformação."}
],
locations:[
{id:"future_command",name:"Centro de Comando",era:"FUTURO",act:"PRÓLOGO",status:"VISITADO",description:"Instalação clandestina responsável pela missão temporal."},
{id:"chrono_chamber",name:"Câmara do Cronófago",era:"DESLOCAMENTO",act:"ATO II",status:"VISITADO",description:"Área de ativação do sistema temporal."},
{id:"past_road",name:"Estradas Antigas",era:"PASSADO",act:"ATO III",status:"BLOQUEADO",description:"Estradas históricas onde viajantes circulam e informações podem ser coletadas."},
{id:"past_market",name:"Mercado Histórico",era:"PASSADO",act:"ATO III",status:"BLOQUEADO",description:"Mercado com comerciantes, famílias, viajantes e autoridades locais."},
{id:"past_settlement",name:"Povoado",era:"PASSADO",act:"ATO III",status:"BLOQUEADO",description:"Núcleo populacional para observação e missões secundárias."}
],
items:[
{id:"chrono_access_key",name:"Chave de Acesso Cronológico",type:"TECNOLOGIA",rarity:"Raro",description:"Identificador de acesso usado pelo protocolo do Cronófago.",quantity:1},
{id:"future_archive",name:"Fragmento de Arquivo",type:"INFORMAÇÃO",rarity:"Comum",description:"Registro incompleto usado para comparar fatos históricos.",quantity:1},
{id:"field_supplies",name:"Suprimentos de Campo",type:"SUPORTE",rarity:"Comum",description:"Recursos básicos para exploração.",quantity:2}
],
technologies:[
{id:"chrono_phage",name:"CRONÓFAGO",category:"Tecnologia Temporal",origin:"Organização Secreta",function:"Manipula a relação entre consciência, matéria e linha temporal.",limitations:["Exige enorme quantidade de energia.","Pode gerar efeitos de deslocamento.","Pequenas alterações podem gerar consequências.","Nem tudo pode ser alterado.","Não permite viagens infinitas."],impact:"Torna possível interferir na história e cria risco de manipulação temporal."},
{id:"energy_barrier",name:"Barreiras Energéticas",category:"Infraestrutura",origin:"Civilização do futuro",function:"Protegem áreas civis privilegiadas.",limitations:["Dependem de energia e manutenção."],impact:"Acentuam a separação entre regiões protegidas e abandonadas."},
{id:"surveillance_grid",name:"Rede de Vigilância",category:"Controle",origin:"Estruturas do futuro",function:"Monitora regiões, pessoas e comunicações.",limitations:["Não cobre todas as regiões igualmente."],impact:"Aumenta o controle social."}
],
magic:[{id:"arcane_system",name:"Sistema Arcano",origin:"Não definido nesta fase",cost:"Todo poder deverá possuir custo.",limit:"Todo poder deverá possuir consequência e limite.",risk:"Corrupção, desequilíbrio ou consequências não intencionais.",rule:"Nenhum poder será implementado sem custo, consequência e limite."}],
mapNodes:[
{id:"future_command",label:"CENTRO DE COMANDO",sub:"FUTURO • VISITADO",css:"node-command"},
{id:"past_road",label:"ESTRADAS ANTIGAS",sub:"PASSADO • PRÓXIMO",css:"node-road"},
{id:"past_market",label:"MERCADO HISTÓRICO",sub:"PASSADO • BLOQUEADO",css:"node-market"},
{id:"past_settlement",label:"POVOADO",sub:"PASSADO • BLOQUEADO",css:"node-settlement"}
],
temporalRules:[
["ENERGIA","A viagem exige enorme quantidade de energia."],["DESLOCAMENTO","O viajante pode sofrer efeitos de deslocamento temporal."],["CONSEQUÊNCIAS","Pequenas alterações podem gerar consequências."],["PONTOS FIXOS","Alguns eventos funcionam como pontos fixos."],["IMPOSSIBILIDADE","Nem todo acontecimento pode ser alterado."],["INSTABILIDADE","O futuro não é uma linha absolutamente estável."],["CONTROLE","O viajante não controla todas as consequências."],["LIMITE","A máquina não permite viagens infinitas."]]
};
const STAGE2_ENCOUNTERS=[{id:"training_drone",name:"Drone de Patrulha",maxHp:60,attack:9,defense:2,description:"Encontro controlado para validar o fluxo de combate."}];

function stage2Ensure(s){
 s.stage2=s.stage2||{};
 s.stage2.inventory=Array.isArray(s.stage2.inventory)?s.stage2.inventory:STAGE2_DB.items.map(x=>({id:x.id,quantity:x.quantity}));
 s.stage2.discoveredCharacters=Array.isArray(s.stage2.discoveredCharacters)?s.stage2.discoveredCharacters:["protagonist","organization_member"];
 s.stage2.discoveredLocations=Array.isArray(s.stage2.discoveredLocations)?s.stage2.discoveredLocations:["future_command","chrono_chamber"];
 s.stage2.discoveredTechnologies=Array.isArray(s.stage2.discoveredTechnologies)?s.stage2.discoveredTechnologies:["chrono_phage"];
 s.stage2.exploration=s.stage2.exploration||{active:false,currentLocation:s.world.locationId||"future_command",visited:["future_command"]};
 s.stage2.temporal=s.stage2.temporal||{stability:Number(s.player?.stats?.temporalStability??100),jumps:0,lastDestination:null};
 s.stage2.combat=s.stage2.combat||{active:false,encounterId:null,playerHp:100,enemyHp:0,log:[]};
 return s;
}
class CharacterManager{constructor(g){this.g=g}getAll(){return STAGE2_DB.characters}get(id){return this.getAll().find(x=>x.id===id)||null}discover(id){stage2Ensure(this.g.state);if(!this.g.state.stage2.discoveredCharacters.includes(id))this.g.state.stage2.discoveredCharacters.push(id)}isDiscovered(id){stage2Ensure(this.g.state);return this.g.state.stage2.discoveredCharacters.includes(id)}}
class WorldMapManager{constructor(g){this.g=g}get(id){return STAGE2_DB.locations.find(x=>x.id===id)||null}isDiscovered(id){stage2Ensure(this.g.state);return this.g.state.stage2.discoveredLocations.includes(id)}discover(id){stage2Ensure(this.g.state);if(!this.isDiscovered(id))this.g.state.stage2.discoveredLocations.push(id)}unlockPast(){["past_road","past_market","past_settlement"].forEach(id=>this.discover(id));this.g.state.stage2.exploration.active=true}visit(id){const l=this.get(id);if(!l)return false;if(!this.isDiscovered(id)){this.g.ui.notify("MAPA BLOQUEADO","Esta localização ainda não está disponível.","info");return false}stage2Ensure(this.g.state);this.g.state.stage2.exploration.currentLocation=id;if(!this.g.state.stage2.exploration.visited.includes(id))this.g.state.stage2.exploration.visited.push(id);this.g.state.world.locationId=id;return true}}
class InventoryManager{constructor(g){this.g=g}def(id){return STAGE2_DB.items.find(x=>x.id===id)}all(){stage2Ensure(this.g.state);return this.g.state.stage2.inventory.map(e=>{const d=this.def(e.id);return d?{...d,quantity:e.quantity}:null}).filter(Boolean)}add(id,q=1){const d=this.def(id);if(!d)return false;stage2Ensure(this.g.state);const e=this.g.state.stage2.inventory.find(x=>x.id===id);if(e)e.quantity+=q;else this.g.state.stage2.inventory.push({id,quantity:q});return true}remove(id,q=1){stage2Ensure(this.g.state);const e=this.g.state.stage2.inventory.find(x=>x.id===id);if(!e||e.quantity<q)return false;e.quantity-=q;return true}}
class TemporalManager{constructor(g){this.g=g}stability(){stage2Ensure(this.g.state);return Number(this.g.state.stage2.temporal.stability)}canJump(c=10){return this.stability()>=c}travelTo(id){const l=this.g.worldMap.get(id);if(!l||!this.g.worldMap.isDiscovered(id))return false;const cost=10;if(!this.canJump(cost))return false;stage2Ensure(this.g.state);this.g.state.stage2.temporal.stability-=cost;this.g.state.stage2.temporal.jumps++;this.g.state.stage2.temporal.lastDestination=id;this.g.state.player.stats.temporalStability=this.g.state.stage2.temporal.stability;this.g.worldMap.visit(id);this.g.ui.renderPlayerStats();this.g.stage2UI.renderTemporal();return true}stabilize(n=5){stage2Ensure(this.g.state);this.g.state.stage2.temporal.stability=Math.min(100,this.g.state.stage2.temporal.stability+n);this.g.state.player.stats.temporalStability=this.g.state.stage2.temporal.stability;this.g.ui.renderPlayerStats();this.g.stage2UI.renderTemporal()}}
class MagicTechnologyManager{constructor(g){this.g=g}tech(){return STAGE2_DB.technologies}magic(){return STAGE2_DB.magic}discoverTechnology(id){stage2Ensure(this.g.state);if(!this.g.state.stage2.discoveredTechnologies.includes(id))this.g.state.stage2.discoveredTechnologies.push(id)}isTech(id){stage2Ensure(this.g.state);return this.g.state.stage2.discoveredTechnologies.includes(id)}}
class CombatManager{constructor(g){this.g=g}start(id="training_drone"){const e=STAGE2_ENCOUNTERS.find(x=>x.id===id);if(!e)return false;stage2Ensure(this.g.state);this.g.state.stage2.combat={active:true,encounterId:id,playerHp:100,enemyHp:e.maxHp,log:[`Encontro iniciado: ${e.name}.`,e.description]};this.g.stage2UI.open("stage2CombatOverlay");this.render();return true}enc(){return STAGE2_ENCOUNTERS.find(x=>x.id===this.g.state.stage2.combat.encounterId)}enemyTurn(mult=1){const c=this.g.state.stage2.combat,e=this.enc();if(!c.active||!e)return;const d=Math.max(1,Math.floor((e.attack-this.g.state.player.stats.freedom/20)*mult));c.playerHp=Math.max(0,c.playerHp-d);c.log.unshift(`O alvo respondeu e causou ${d} de dano.`);if(c.playerHp<=0)this.finish(false)}attack(){const c=this.g.state.stage2.combat,e=this.enc();if(!c.active||!e)return;const d=Math.max(1,12+Math.floor(this.g.state.player.stats.control/20)-e.defense);c.enemyHp=Math.max(0,c.enemyHp-d);c.log.unshift(`Você causou ${d} de impacto no alvo.`);if(c.enemyHp<=0)return this.finish(true);this.enemyTurn();this.render()}defend(){const c=this.g.state.stage2.combat;if(!c.active)return;c.log.unshift("Você assumiu uma postura defensiva.");this.enemyTurn(.5);this.render()}ability(){const c=this.g.state.stage2.combat;if(!c.active)return;if(this.g.state.player.stats.hope<5){c.log.unshift("Esperança insuficiente para usar a habilidade.");this.render();return}this.g.state.player.stats.hope-=5;const d=18+Math.floor(this.g.state.player.stats.freedom/25);c.enemyHp=Math.max(0,c.enemyHp-d);c.log.unshift(`Habilidade especial causou ${d} de impacto.`);this.g.ui.renderPlayerStats();if(c.enemyHp<=0)return this.finish(true);this.enemyTurn();this.render()}flee(){const c=this.g.state.stage2.combat;if(!c.active)return;c.log.unshift("Você encerrou o encontro e recuou.");this.finish(false)}finish(win){const c=this.g.state.stage2.combat;c.active=false;this.g.ui.notify(win?"COMBATE CONCLUÍDO":"COMBATE ENCERRADO",win?"Encontro concluído com vitória.":"Você deixou o encontro.",win?"success":"info");this.render()}render(){this.g.stage2UI.renderCombat()}}

class Stage2UI{
 constructor(g){this.g=g;this.over={};this.selectedCharacter="protagonist";this.selectedSystem="technology"}
 init(){stage2Ensure(this.g.state);this.injectActions();this.injectOverlays();this.bind();this.renderAll()}
 injectActions(){const box=document.querySelector(".right-panel .panel-bottom");if(!box||document.querySelector(".stage2-action-row"))return;const row=document.createElement("div");row.className="stage2-action-row";row.innerHTML='<button class="stage2-action-button" data-stage2="map">MAPA</button><button class="stage2-action-button" data-stage2="characters">PERSONAGENS</button><button class="stage2-action-button" data-stage2="systems">SISTEMAS</button><button class="stage2-action-button" data-stage2="temporal">CRONÓFAGO</button>';box.before(row)}
 injectOverlays(){const defs=[['stage2MapOverlay','MAPA DO MUNDO','EXPLORAÇÃO',this.mapMarkup()],['stage2CharacterOverlay','BANCO DE PERSONAGENS','CÓDEX HUMANO',this.characterMarkup()],['stage2SystemsOverlay','SISTEMAS DO UNIVERSO','TECNOLOGIA / MAGIA / INVENTÁRIO',this.systemMarkup()],['stage2TemporalOverlay','CRONÓFAGO','CONTROLE TEMPORAL',this.temporalMarkup()],['stage2CombatOverlay','ENCONTRO','SISTEMA DE COMBATE',this.combatMarkup()]];for(const [id,title,kicker,body] of defs){const o=document.createElement("div");o.className="overlay stage2-overlay";o.id=id;o.hidden=true;o.innerHTML=`<div class="modal-panel stage2-modal"><div class="modal-header"><div><span class="modal-kicker">${esc(kicker)}</span><h2>${esc(title)}</h2></div><button class="close-button" data-stage2-close="${id}">×</button></div><div class="stage2-body">${body}</div></div>`;document.body.appendChild(o);this.over[id]=o}}
 mapMarkup(){return `<div class="map-stage"><div class="map-route"></div>${STAGE2_DB.mapNodes.map(n=>`<button class="map-node ${n.css} locked" data-map-location="${n.id}"><strong>${esc(n.label)}</strong><small>${esc(n.sub)}</small></button>`).join("")}<div class="map-caption"><span>ESTADO DA EXPLORAÇÃO</span><strong id="stage2MapCaption">O passado será desbloqueado após o deslocamento.</strong></div></div>`}
 characterMarkup(){return '<div class="stage2-grid"><div id="stage2CharacterList" class="stage2-list"></div><div id="stage2CharacterDetail" class="stage2-detail"></div></div>'}
 systemMarkup(){return '<div class="system-tabs"><button class="system-tab active" data-stage2-system="technology">TECNOLOGIA</button><button class="system-tab" data-stage2-system="magic">MAGIA</button><button class="system-tab" data-stage2-system="inventory">INVENTÁRIO</button></div><div id="stage2SystemContent" style="padding-top:14px"></div>'}
 temporalMarkup(){return `<div class="temporal-console"><div class="temporal-meter"><div class="temporal-meter-row"><span>ESTABILIDADE ATUAL</span><strong id="stage2TemporalValue">100%</strong></div><div class="temporal-bar-large"><i id="stage2TemporalBar" style="width:100%"></i></div></div><div class="stage2-stat-grid"><div class="stage2-stat"><span>SALTOS</span><strong id="stage2TemporalJumps">0</strong></div><div class="stage2-stat"><span>DESTINO ANTERIOR</span><strong id="stage2TemporalLast">NENHUM</strong></div></div><div class="temporal-rule-grid">${STAGE2_DB.temporalRules.map(r=>`<div class="temporal-rule"><strong>${esc(r[0])}</strong><span>${esc(r[1])}</span></div>`).join("")}</div><div class="stage2-detail"><span class="eyebrow">PROTOCOLO</span><h3>Estabilização temporal</h3><p>Cada deslocamento consome estabilidade. O sistema fica pronto para receber as consequências temporais do Ato III.</p><button id="stage2StabilizeButton" class="primary-button">ESTABILIZAR +5</button></div></div>`}
 combatMarkup(){return '<div class="combat-stage"><div class="combat-header"><div class="combat-card"><span>JOGADOR</span><strong>PROTAGONISTA</strong><div class="combat-hp"><i id="stage2PlayerHp" style="width:100%"></i></div></div><div class="combat-card"><span>OPONENTE</span><strong id="stage2EnemyName">---</strong><div class="combat-hp"><i id="stage2EnemyHp" style="width:0%"></i></div></div></div><div id="stage2CombatLog" class="combat-log"></div><div class="combat-actions"><button data-combat-action="attack">ATACAR</button><button data-combat-action="defend">DEFENDER</button><button data-combat-action="ability">HABILIDADE</button><button data-combat-action="flee">RECUAR</button></div></div>'}
 bind(){document.addEventListener("click",e=>{const a=e.target.closest("[data-stage2]");if(a){this.open({map:"stage2MapOverlay",characters:"stage2CharacterOverlay",systems:"stage2SystemsOverlay",temporal:"stage2TemporalOverlay"}[a.dataset.stage2]);this.renderAll();return}const c=e.target.closest("[data-stage2-close]");if(c){this.close(c.dataset.stage2Close);return}const m=e.target.closest("[data-map-location]");if(m){this.mapClick(m.dataset.mapLocation);return}const ch=e.target.closest("[data-character-id]");if(ch){this.selectedCharacter=ch.dataset.characterId;this.renderCharacters();return}const st=e.target.closest("[data-stage2-system]");if(st){this.selectedSystem=st.dataset.stage2System;document.querySelectorAll("[data-stage2-system]").forEach(x=>x.classList.toggle("active",x===st));this.renderSystems();return}const ca=e.target.closest("[data-combat-action]");if(ca){({attack:()=>this.g.combat.attack(),defend:()=>this.g.combat.defend(),ability:()=>this.g.combat.ability(),flee:()=>this.g.combat.flee()}[ca.dataset.combatAction])();return}if(e.target.id==="stage2StabilizeButton")this.g.temporal.stabilize(5)});Object.values(this.over).forEach(o=>o.addEventListener("click",e=>{if(e.target===o)o.hidden=true}))}
 open(id){if(id){this.over[id].hidden=false}}close(id){if(this.over[id])this.over[id].hidden=true}
 renderAll(){this.renderMap();this.renderCharacters();this.renderSystems();this.renderTemporal();this.renderCombat()}
 renderMap(){const active=this.g.state.stage2?.exploration?.active;const cur=this.g.state.stage2?.exploration?.currentLocation;const cap=document.getElementById("stage2MapCaption");if(cap)cap.textContent=active?`Exploração ativa. Local atual: ${this.g.worldMap.get(cur)?.name||"desconhecido"}.`:"O passado será desbloqueado após o deslocamento.";document.querySelectorAll("[data-map-location]").forEach(n=>{const id=n.dataset.mapLocation;const d=this.g.worldMap.isDiscovered(id);n.classList.toggle("locked",!d);n.classList.toggle("current",cur===id)})}
 mapClick(id){if(!this.g.worldMap.isDiscovered(id)){this.g.ui.notify("LOCAL BLOQUEADO","Este local ainda não está disponível.","info");return}this.g.worldMap.visit(id);const l=this.g.worldMap.get(id);this.g.ui.renderLocation({act:l.act,name:l.name,era:l.era,tag:l.status,description:l.description});this.g.ui.notify("LOCALIZAÇÃO",`${l.name} selecionado.`,"info");this.close("stage2MapOverlay");this.renderMap()}
 renderCharacters(){const list=document.getElementById("stage2CharacterList"),detail=document.getElementById("stage2CharacterDetail");if(!list||!detail)return;const chars=STAGE2_DB.characters.filter(c=>this.g.characters.isDiscovered(c.id));list.innerHTML=chars.map(c=>`<button class="stage2-list-button ${this.selectedCharacter===c.id?"active":""}" data-character-id="${c.id}"><strong>${esc(c.name)}</strong><small>${esc(c.origin)}</small></button>`).join("");const c=this.g.characters.get(this.selectedCharacter)||chars[0];if(!c){detail.textContent="Nenhum personagem descoberto.";return}detail.innerHTML=`<span class="eyebrow">FICHA DE PERSONAGEM</span><h3>${esc(c.name)}</h3><p>${esc(c.history)}</p><div class="stage2-tags">${c.abilities.map(a=>`<span class="stage2-tag">${esc(a)}</span>`).join("")}</div><div class="stage2-stat-grid"><div class="stage2-stat"><span>OBJETIVO</span><strong>${esc(c.objective)}</strong></div><div class="stage2-stat"><span>FORÇAS</span><strong>${esc(c.strengths)}</strong></div><div class="stage2-stat"><span>FRAQUEZAS</span><strong>${esc(c.weaknesses)}</strong></div><div class="stage2-stat"><span>ARCO</span><strong>${esc(c.arc)}</strong></div></div><p><b>Contradições:</b> ${esc(c.contradictions)}</p><p><b>Segredos:</b> ${esc(c.secrets.join(" • "))}</p><p><b>Simbolismo:</b> ${esc(c.symbolism)}</p>`}
 renderSystems(){const box=document.getElementById("stage2SystemContent");if(!box)return;if(this.selectedSystem==="technology"){box.innerHTML=this.g.magicTech.tech().filter(t=>this.g.magicTech.isTech(t.id)).map(t=>`<article class="quest-detail-card"><span class="eyebrow">${esc(t.category)}</span><h3>${esc(t.name)}</h3><p>${esc(t.function)}</p><div class="stage2-tags">${t.limitations.map(x=>`<span class="stage2-tag">${esc(x)}</span>`).join("")}</div><p><b>Impacto social:</b> ${esc(t.impact)}</p></article>`).join("");return}if(this.selectedSystem==="magic"){box.innerHTML=STAGE2_DB.magic.map(m=>`<article class="quest-detail-card"><span class="eyebrow">SISTEMA MÁGICO</span><h3>${esc(m.name)}</h3><p>${esc(m.rule)}</p><div class="stage2-stat-grid"><div class="stage2-stat"><span>CUSTO</span><strong>${esc(m.cost)}</strong></div><div class="stage2-stat"><span>LIMITAÇÃO</span><strong>${esc(m.limit)}</strong></div><div class="stage2-stat"><span>RISCO</span><strong>${esc(m.risk)}</strong></div></div></article>`).join("");return}box.innerHTML=`<div class="inventory-grid">${this.g.inventory.all().map(i=>`<article class="inventory-item"><strong>${esc(i.name)}</strong><small>${esc(i.type)} • x${i.quantity}</small><p>${esc(i.description)}</p></article>`).join("")}</div>`}
 renderTemporal(){const s=this.g.temporal.stability(),v=document.getElementById("stage2TemporalValue"),b=document.getElementById("stage2TemporalBar"),j=document.getElementById("stage2TemporalJumps"),l=document.getElementById("stage2TemporalLast");if(v)v.textContent=`${s}%`;if(b)b.style.width=`${s}%`;if(j)j.textContent=this.g.state.stage2.temporal.jumps;if(l)l.textContent=this.g.worldMap.get(this.g.state.stage2.temporal.lastDestination)?.name||"NENHUM"}
 renderCombat(){const c=this.g.state.stage2.combat,e=STAGE2_ENCOUNTERS.find(x=>x.id===c.encounterId),ph=document.getElementById("stage2PlayerHp"),eh=document.getElementById("stage2EnemyHp"),en=document.getElementById("stage2EnemyName"),log=document.getElementById("stage2CombatLog");if(!ph||!eh||!en||!log)return;ph.style.width=`${Math.max(0,c.playerHp)}%`;eh.style.width=`${e?Math.max(0,(c.enemyHp/e.maxHp)*100):0}%`;en.textContent=e?.name||"---";log.innerHTML=c.log.slice(0,8).map(x=>`<p>${esc(x)}</p>`).join("");document.querySelectorAll("[data-combat-action]").forEach(b=>b.disabled=!c.active)}
}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function attachStage2(g){stage2Ensure(g.state);g.characters=new CharacterManager(g);g.worldMap=new WorldMapManager(g);g.inventory=new InventoryManager(g);g.temporal=new TemporalManager(g);g.magicTech=new MagicTechnologyManager(g);g.combat=new CombatManager(g);g.stage2UI=new Stage2UI(g);g.stage2UI.init();g.magicTech.discoverTechnology("chrono_phage");g.characters.discover("protagonist");g.characters.discover("organization_member");
 const originalNewGame=g.startNewGame.bind(g);g.startNewGame=function(){originalNewGame();stage2Ensure(g.state);g.magicTech.discoverTechnology("chrono_phage");g.characters.discover("protagonist");g.characters.discover("organization_member");g.stage2UI.renderAll();};
 const oldTransition=g.narrative.transitionToPast.bind(g.narrative);g.narrative.transitionToPast=function(){oldTransition();setTimeout(()=>{stage2Ensure(g.state);g.worldMap.unlockPast();g.state.world.actId="act3";g.state.world.era="PASSADO";g.state.world.locationId="past_road";g.state.stage2.exploration.currentLocation="past_road";g.state.stage2.exploration.visited=["future_command","past_road"];g.ui.renderLocation({act:"ATO III",name:"Estradas Antigas",era:"PASSADO",tag:"ÁREA INICIAL",description:"Estradas antigas cercam cidades, mercados e povoados. Explore, observe e colete informações antes do encontro."});g.ui.setDialogueSpeaker("PROTOCOLO","SISTEMA",DIALOGUE_TYPES.SYSTEM);g.ui.typeDialogueText("CHEGADA AO PASSADO.\\n\\nA exploração foi desbloqueada.\\n\\nUse MAPA, PERSONAGENS e SISTEMAS para interagir com a nova camada do jogo.");g.ui.setContinueVisible(false);g.stage2UI.renderAll();g.ui.notify("ATO III DISPONÍVEL","O Passado agora possui estrutura de exploração.","success")},g.state.settings.reducedMotion?80:950)};
 g.stage2UI.renderAll();g.state.version=STAGE2_VERSION}
window.addEventListener("DOMContentLoaded",()=>{if(window.game)attachStage2(window.game);else console.error("Stage 2: GameController ausente.")});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 3 JS
   ============================================================================ */

/* JESUS CHRONICLES — ETAPA 3: ATO III / O PASSADO */
"use strict";

const STAGE3_VERSION = "0.3.0";

const STAGE3_DB = {
  locations: {
    past_road: {
      id: "past_road",
      name: "Estradas Antigas",
      short: "Estradas de passagem",
      description: "Rotas de terra conectam pequenos povoados e centros comerciais. Viajantes carregam notícias de longe.",
      atmosphere: "VENTO SECO • MOVIMENTO CONSTANTE",
      exits: ["past_market", "past_settlement"]
    },
    past_market: {
      id: "past_market",
      name: "Mercado Histórico",
      short: "Comércio e rumores",
      description: "Comerciantes, famílias e viajantes se misturam. Informações circulam junto com mercadorias.",
      atmosphere: "VOZES • MERCADORIAS • RUMORES",
      exits: ["past_road", "past_settlement"]
    },
    past_settlement: {
      id: "past_settlement",
      name: "Povoado",
      short: "Famílias e viajantes",
      description: "Um pequeno núcleo de casas e oficinas. As pessoas observam desconhecidos com cautela.",
      atmosphere: "FUMAÇA • OFICINAS • FAMÍLIAS",
      exits: ["past_road", "past_market"]
    }
  },
  npcs: [
    {
      id: "miriam_traveler",
      name: "Miriam",
      role: "Viajante",
      location: "past_road",
      personality: "Atenta, desconfiada e prática.",
      description: "Uma viajante que conhece caminhos e acompanha rumores entre povoados.",
      goals: "Chegar ao mercado antes do anoitecer.",
      trust: 0,
      dialogue: {
        greet: "Você não parece ser daqui. Está procurando alguém?",
        rumor: "Ouvi falar de um mestre que ensina às pessoas sem cobrar nada. Alguns dizem que ele está reunindo multidões.",
        followup: "As pessoas repetem histórias diferentes. Mas todas parecem apontar para o mesmo caminho.",
        help: "Se você me ajudar a levar esta carga até o mercado, posso indicar quem ouviu mais sobre esse mestre."
      }
    },
    {
      id: "eliezer_merchant",
      name: "Eliezer",
      role: "Comerciante",
      location: "past_market",
      personality: "Perspicaz, negociante e curioso.",
      description: "Mantém uma pequena banca e conhece grande parte dos viajantes que passam pelo mercado.",
      goals: "Proteger sua mercadoria e manter boas relações.",
      trust: 0,
      dialogue: {
        greet: "Não costumo ver pessoas com esse tipo de roupa por aqui.",
        rumor: "Há grupos seguindo um mestre que fala sobre o Reino de Deus. Se é a pessoa que você procura, talvez estejam comentando o nome dele na estrada norte.",
        followup: "Não confunda rumor com certeza. Nesta região, uma história cresce cada vez que alguém a repete.",
        trade: "Tenho pouco tempo. Ajude meu ajudante e conversaremos com calma."
      }
    },
    {
      id: "naomi_local",
      name: "Naomi",
      role: "Moradora",
      location: "past_settlement",
      personality: "Cuidadosa, generosa e observadora.",
      description: "Vive com a família no povoado e conhece os problemas de quem precisa de ajuda.",
      goals: "Manter sua família segura.",
      trust: 0,
      dialogue: {
        greet: "Você é viajante? Há quanto tempo está na estrada?",
        rumor: "Algumas famílias estão falando de um mestre que escuta pessoas que os outros ignoram.",
        followup: "Talvez ele esteja próximo. Talvez as pessoas estejam apenas procurando esperança. Você precisa descobrir sozinho.",
        help: "Tem uma família mais ao sul precisando de água. Não é longe, mas ninguém quer deixar o povoado agora."
      }
    },
    {
      id: "roman_official",
      name: "Oficial Romano",
      role: "Autoridade",
      location: "past_market",
      personality: "Formal, vigilante e desconfiado.",
      description: "Uma autoridade local observando o movimento do mercado.",
      goals: "Manter a ordem e identificar desconhecidos.",
      trust: -1,
      dialogue: {
        greet: "Identifique-se. Você não parece pertencer a esta região.",
        rumor: "Há muitos pregadores e viajantes. Não considero isso um assunto para estranhos.",
        followup: "Quanto menos atenção você chamar, melhor.",
        help: "Não preciso de sua ajuda. Preciso que não cause problemas."
      }
    }
  ],
  rumors: [
    { id: "rumor_master", title: "O mestre que ensina", text: "Várias pessoas mencionam um mestre que reúne multidões e fala às pessoas comuns.", sourceCount: 0, required: 2 },
    { id: "rumor_north_road", title: "A estrada norte", text: "Há relatos de grupos viajando pela estrada norte em direção a uma área onde um mestre ensina.", sourceCount: 0, required: 2 },
    { id: "rumor_listeners", title: "Pessoas esquecidas", text: "Alguns moradores dizem que o mestre presta atenção a pessoas que costumam ser ignoradas.", sourceCount: 0, required: 1 }
  ],
  quests: [
    {
      id: "past_rumors",
      title: "Rumores de um Mestre",
      objective: "Descobrir informações confiáveis sobre o mestre que está ensinando multidões.",
      location: "Estradas Antigas / Mercado Histórico / Povoado",
      steps: ["Conversar com viajantes ou moradores", "Coletar pelo menos duas fontes", "Identificar uma rota provável"],
      reward: "Acesso à rota de aproximação do próximo módulo.",
      status: "ACTIVE"
    },
    {
      id: "water_for_family",
      title: "Suprimentos para uma Família",
      objective: "Ajudar uma família local sem alterar excessivamente os eventos históricos.",
      location: "Povoado",
      steps: ["Conversar com Naomi", "Aceitar a tarefa", "Entregar suprimentos"],
      reward: "Confiança local e informação adicional.",
      status: "LOCKED"
    },
    {
      id: "traveler_route",
      title: "O Caminho do Viajante",
      objective: "Ajudar Miriam a transportar uma carga até o mercado.",
      location: "Estradas Antigas",
      steps: ["Conversar com Miriam", "Aceitar a tarefa", "Chegar ao mercado"],
      reward: "Uma fonte adicional de informação sobre o mestre.",
      status: "LOCKED"
    }
  ]
};

function stage3Ensure(state) {
  state.stage3 = state.stage3 || {};
  state.stage3.currentLocation = state.stage3.currentLocation || "past_road";
  state.stage3.visited = Array.isArray(state.stage3.visited) ? state.stage3.visited : ["past_road"];
  state.stage3.npcTrust = state.stage3.npcTrust || {};
  state.stage3.rumors = state.stage3.rumors || {};
  state.stage3.flags = state.stage3.flags || {
    arrivedPast: false,
    travelerHelpAccepted: false,
    travelerHelpCompleted: false,
    familyHelpAccepted: false,
    familyHelpCompleted: false,
    routeDiscovered: false
  };
  state.stage3.currentObjective = state.stage3.currentObjective || "past_rumors";
  state.stage3.eventLog = Array.isArray(state.stage3.eventLog) ? state.stage3.eventLog : [];
}

class PastWorldManager {
  constructor(game) { this.game = game; }
  ensure() { stage3Ensure(this.game.state); }
  getLocation(id) { return STAGE3_DB.locations[id] || null; }
  getNPC(id) { return STAGE3_DB.npcs.find(n => n.id === id) || null; }
  getCurrentLocation() { this.ensure(); return this.getLocation(this.game.state.stage3.currentLocation); }
  getNPCsAt(id = this.getCurrentLocation()?.id) { return STAGE3_DB.npcs.filter(n => n.location === id); }
  travelTo(id) {
    this.ensure();
    const from = this.getCurrentLocation();
    if (!from || !from.exits.includes(id)) return false;
    const destination = this.getLocation(id);
    if (!destination) return false;
    this.game.state.stage3.currentLocation = id;
    if (!this.game.state.stage3.visited.includes(id)) this.game.state.stage3.visited.push(id);
    this.game.state.world.locationId = id;
    this.game.state.world.actId = "act3";
    this.game.state.world.era = "PASSADO";
    this.game.state.stage3.eventLog.unshift(`Você viajou de ${from.name} para ${destination.name}.`);
    return true;
  }
  canTravelTo(id) {
    const current = this.getCurrentLocation();
    return Boolean(current?.exits.includes(id));
  }
}

class SocialManager {
  constructor(game) { this.game = game; }
  ensure() { stage3Ensure(this.game.state); }
  talk(npcId, topic = "greet") {
    this.ensure();
    const npc = this.game.pastWorld.getNPC(npcId);
    if (!npc || npc.location !== this.game.state.stage3.currentLocation) return null;
    const s = this.game.state.stage3;
    s.npcTrust[npc.id] = Number(s.npcTrust[npc.id] || npc.trust || 0);
    if (topic === "greet") return npc.dialogue.greet;
    if (topic === "rumor") {
      this.registerRumorFromNPC(npc.id);
      return npc.dialogue.rumor;
    }
    if (topic === "followup") return npc.dialogue.followup;
    if (topic === "help") {
      this.offerHelp(npc.id);
      return npc.dialogue.help;
    }
    return npc.dialogue.greet;
  }
  registerRumorFromNPC(npcId) {
    const s = this.game.state.stage3;
    const map = {
      miriam_traveler: ["rumor_master", "rumor_north_road"],
      eliezer_merchant: ["rumor_master", "rumor_north_road"],
      naomi_local: ["rumor_master", "rumor_listeners"],
      roman_official: []
    };
    for (const rumorId of map[npcId] || []) {
      s.rumors[rumorId] = Number(s.rumors[rumorId] || 0) + 1;
    }
    this.game.stage3UI.render();
    this.checkRumorQuest();
  }
  raiseTrust(npcId, amount = 1) {
    const s = this.game.state.stage3;
    s.npcTrust[npcId] = Number(s.npcTrust[npcId] || 0) + amount;
  }
  offerHelp(npcId) {
    const s = this.game.state.stage3;
    if (npcId === "miriam_traveler") {
      if (!s.flags.travelerHelpAccepted) {
        s.flags.travelerHelpAccepted = true;
        this.game.state.stage3.currentObjective = "traveler_route";
        this.raiseTrust(npcId, 1);
      }
    }
    if (npcId === "naomi_local") {
      if (!s.flags.familyHelpAccepted) {
        s.flags.familyHelpAccepted = true;
        this.game.state.stage3.currentObjective = "water_for_family";
        this.raiseTrust(npcId, 1);
      }
    }
    this.game.stage3UI.render();
  }
  checkRumorQuest() {
    const s = this.game.state.stage3;
    const masterSources = Number(s.rumors.rumor_master || 0);
    const routeSources = Number(s.rumors.rumor_north_road || 0);
    if (masterSources >= 2 && routeSources >= 2) {
      s.flags.routeDiscovered = true;
      s.currentObjective = "past_rumors";
      this.game.ui.notify("INFORMAÇÃO CONFIRMADA", "Duas fontes independentes apontam para a estrada norte.", "success");
    }
  }
}

class ExplorationQuestManager {
  constructor(game) { this.game = game; }
  ensure() { stage3Ensure(this.game.state); }
  completeStep(kind) {
    this.ensure();
    const s = this.game.state.stage3;
    if (kind === "traveler") {
      if (!s.flags.travelerHelpAccepted || s.flags.travelerHelpCompleted) return;
      if (s.currentLocation === "past_market") {
        s.flags.travelerHelpCompleted = true;
        this.game.social.raiseTrust("miriam_traveler", 2);
        this.game.inventory.add("field_supplies", 1);
        this.game.ui.notify("MISSÃO CONCLUÍDA", "O caminho de Miriam foi facilitado.", "success");
      }
    }
    if (kind === "family") {
      if (!s.flags.familyHelpAccepted || s.flags.familyHelpCompleted) return;
      if (s.currentLocation === "past_settlement") {
        if (this.game.inventory.remove("field_supplies", 1)) {
          s.flags.familyHelpCompleted = true;
          this.game.social.raiseTrust("naomi_local", 2);
          this.game.ui.notify("MISSÃO CONCLUÍDA", "Os suprimentos foram entregues sem alterar um evento histórico conhecido.", "success");
        } else {
          this.game.ui.notify("SUPRIMENTOS INSUFICIENTES", "Você precisa de pelo menos um suprimento de campo.", "error");
        }
      }
    }
  }
  status(id) {
    const s = this.game.state.stage3;
    if (id === "past_rumors") return s.flags.routeDiscovered ? "COMPLETED" : "ACTIVE";
    if (id === "water_for_family") return s.flags.familyHelpCompleted ? "COMPLETED" : (s.flags.familyHelpAccepted ? "ACTIVE" : "LOCKED");
    if (id === "traveler_route") return s.flags.travelerHelpCompleted ? "COMPLETED" : (s.flags.travelerHelpAccepted ? "ACTIVE" : "LOCKED");
    return "LOCKED";
  }
}

class Stage3UI {
  constructor(game) {
    this.game = game;
    this.overlay = null;
    this.selectedNPC = null;
    this.selectedTopic = "greet";
  }
  init() {
    stage3Ensure(this.game.state);
    this.injectActionButton();
    this.injectOverlay();
    this.bind();
    this.render();
    this.refreshFromState();
  }
  injectActionButton() {
    const row = document.querySelector(".stage2-action-row");
    if (!row || document.querySelector("[data-stage3=open]") ) return;
    const button = document.createElement("button");
    button.className = "stage2-action-button";
    button.dataset.stage3 = "open";
    button.textContent = "EXPLORAR";
    row.appendChild(button);
  }
  injectOverlay() {
    if (document.getElementById("stage3ExplorationOverlay")) {
      this.overlay = document.getElementById("stage3ExplorationOverlay");
      return;
    }
    this.overlay = document.createElement("div");
    this.overlay.id = "stage3ExplorationOverlay";
    this.overlay.className = "overlay stage3-overlay";
    this.overlay.hidden = true;
    this.overlay.innerHTML = `
      <div class="modal-panel stage3-modal">
        <div class="modal-header">
          <div><span class="modal-kicker">ATO III</span><h2>O PASSADO — EXPLORAÇÃO</h2></div>
          <button class="close-button" data-stage3-close="1" type="button">×</button>
        </div>
        <div class="stage3-body">
          <div class="stage3-header-grid">
            <div class="stage3-location-card">
              <span class="eyebrow">LOCAL ATUAL</span>
              <h3 id="stage3LocationName">Estradas Antigas</h3>
              <p id="stage3LocationDescription"></p>
              <div class="stage3-atmosphere" id="stage3Atmosphere"></div>
            </div>
            <div class="stage3-objective-card">
              <span class="eyebrow">OBJETIVO</span>
              <h3 id="stage3ObjectiveTitle"></h3>
              <p id="stage3ObjectiveText"></p>
              <div id="stage3Progress" class="stage3-progress"></div>
            </div>
          </div>
          <div class="stage3-columns">
            <section class="stage3-section">
              <div class="stage3-section-title"><span>PESSOAS</span><small>NPCs presentes</small></div>
              <div id="stage3NPCList" class="stage3-npc-list"></div>
            </section>
            <section class="stage3-section stage3-social-section">
              <div class="stage3-section-title"><span>INTERAÇÃO</span><small>Conversa e investigação</small></div>
              <div id="stage3NPCDetail" class="stage3-npc-detail"></div>
            </section>
            <section class="stage3-section">
              <div class="stage3-section-title"><span>ROTAS</span><small>Deslocamento local</small></div>
              <div id="stage3RouteList" class="stage3-route-list"></div>
            </section>
          </div>
          <div class="stage3-rumor-box">
            <div class="stage3-section-title"><span>QUADRO DE INFORMAÇÕES</span><small>Fontes coletadas</small></div>
            <div id="stage3RumorList" class="stage3-rumor-list"></div>
          </div>
          <div id="stage3EventLog" class="stage3-event-log"></div>
        </div>
      </div>`;
    document.body.appendChild(this.overlay);
  }
  bind() {
    document.addEventListener("click", event => {
      const open = event.target.closest("[data-stage3='open']");
      if (open) { this.open(); return; }
      if (event.target.closest("[data-stage3-close]")) { this.close(); return; }
      const npc = event.target.closest("[data-stage3-npc]");
      if (npc) { this.selectedNPC = npc.dataset.stage3Npc; this.render(); return; }
      const topic = event.target.closest("[data-stage3-topic]");
      if (topic) { this.interact(topic.dataset.stage3Topic); return; }
      const route = event.target.closest("[data-stage3-route]");
      if (route) { this.travel(route.dataset.stage3Route); return; }
      const objective = event.target.closest("[data-stage3-objective]");
      if (objective) { this.completeObjective(objective.dataset.stage3Objective); return; }
    });
    this.overlay.addEventListener("click", event => { if (event.target === this.overlay) this.close(); });
  }
  open() {
    this.overlay.hidden = false;
    stage3Ensure(this.game.state);
    const npcs = this.game.pastWorld.getNPCsAt();
    if (!this.selectedNPC && npcs[0]) this.selectedNPC = npcs[0].id;
    this.render();
  }
  close() { this.overlay.hidden = true; }
  interact(topic) {
    if (!this.selectedNPC) return;
    const text = this.game.social.talk(this.selectedNPC, topic);
    if (text) this.showDialogue(text);
  }
  showDialogue(text) {
    const npc = this.game.pastWorld.getNPC(this.selectedNPC);
    this.game.ui.setDialogueSpeaker(npc?.name || "MORADOR", npc?.role || "NPC", DIALOGUE_TYPES.DIALOGUE);
    this.game.ui.typeDialogueText(text);
    this.game.ui.setContinueVisible(false);
    this.close();
    this.game.ui.notify("CONVERSA", `${npc?.name || "NPC"} respondeu.`, "info");
  }
  travel(id) {
    if (!this.game.pastWorld.canTravelTo(id)) {
      this.game.ui.notify("ROTA INDISPONÍVEL", "Você precisa viajar por uma rota conectada.", "info");
      return;
    }
    if (this.game.pastWorld.travelTo(id)) {
      const loc = this.game.pastWorld.getCurrentLocation();
      this.selectedNPC = this.game.pastWorld.getNPCsAt(id)[0]?.id || null;
      this.game.ui.renderLocation({act:"ATO III",name:loc.name,era:"PASSADO",tag:loc.atmosphere,description:loc.description});
      this.game.ui.notify("DESLOCAMENTO", `Você chegou a ${loc.name}.`, "success");
      this.render();
    }
  }
  completeObjective(id) {
    if (id === "traveler") this.game.explorationQuests.completeStep("traveler");
    if (id === "family") this.game.explorationQuests.completeStep("family");
    this.render();
  }
  refreshFromState() {
    const arrived = Boolean(this.game.state.narrative?.flags?.arrivedInPast);
    if (arrived) {
      stage3Ensure(this.game.state);
      this.game.state.stage3.flags.arrivedPast = true;
      this.render();
    }
  }
  render() {
    if (!this.overlay) return;
    stage3Ensure(this.game.state);
    const loc = this.game.pastWorld.getCurrentLocation() || STAGE3_DB.locations.past_road;
    const npcs = this.game.pastWorld.getNPCsAt(loc.id);
    if (!this.selectedNPC || !npcs.some(n => n.id === this.selectedNPC)) this.selectedNPC = npcs[0]?.id || null;
    const objective = this.objectiveData();
    document.getElementById("stage3LocationName").textContent = loc.name;
    document.getElementById("stage3LocationDescription").textContent = loc.description;
    document.getElementById("stage3Atmosphere").textContent = loc.atmosphere;
    document.getElementById("stage3ObjectiveTitle").textContent = objective.title;
    document.getElementById("stage3ObjectiveText").textContent = objective.objective;
    document.getElementById("stage3Progress").innerHTML = objective.progress;
    document.getElementById("stage3NPCList").innerHTML = npcs.length ? npcs.map(n => `<button class="stage3-npc-button ${n.id===this.selectedNPC?"active":""}" data-stage3-npc="${esc3(n.id)}"><strong>${esc3(n.name)}</strong><small>${esc3(n.role)}</small></button>`).join("") : `<div class="stage3-empty">Nenhum NPC identificado neste local.</div>`;
    document.getElementById("stage3NPCDetail").innerHTML = this.npcDetail();
    document.getElementById("stage3RouteList").innerHTML = this.routes(loc);
    document.getElementById("stage3RumorList").innerHTML = this.rumors();
    document.getElementById("stage3EventLog").innerHTML = `<span class="eyebrow">REGISTRO RECENTE</span>` + this.game.state.stage3.eventLog.slice(0,6).map(x=>`<p>${esc3(x)}</p>`).join("");
  }
  npcDetail() {
    if (!this.selectedNPC) return `<div class="stage3-empty">Nenhum NPC selecionado.</div>`;
    const npc = this.game.pastWorld.getNPC(this.selectedNPC);
    const trust = Number(this.game.state.stage3.npcTrust[npc.id] || npc.trust || 0);
    const canHelp = npc.id === "miriam_traveler" || npc.id === "naomi_local";
    return `<div class="stage3-detail-main"><span class="eyebrow">${esc3(npc.role)}</span><h3>${esc3(npc.name)}</h3><p>${esc3(npc.description)}</p><div class="stage3-trust">CONFIANÇA <strong>${trust}</strong></div><div class="stage3-topic-grid"><button data-stage3-topic="greet">ABORDAR</button><button data-stage3-topic="rumor">PERGUNTAR SOBRE RUMORES</button><button data-stage3-topic="followup">APROFUNDAR</button>${canHelp?`<button data-stage3-topic="help">OFERECER AJUDA</button>`:""}</div></div>`;
  }
  routes(loc) {
    return loc.exits.map(id => { const d=STAGE3_DB.locations[id]; return `<button class="stage3-route-button" data-stage3-route="${esc3(id)}"><strong>${esc3(d.name)}</strong><small>${esc3(d.short)}</small></button>`; }).join("");
  }
  rumors() {
    const state = this.game.state.stage3;
    return STAGE3_DB.rumors.map(r => { const count=Number(state.rumors[r.id]||0); const ready=count>=r.required; return `<article class="stage3-rumor-card ${ready?"ready":""}"><div><strong>${esc3(r.title)}</strong><p>${esc3(r.text)}</p></div><span>${count}/${r.required}</span></article>`; }).join("");
  }
  objectiveData() {
    const id=this.game.state.stage3.currentObjective;
    const statuses = {
      past_rumors:{title:"Rumores de um Mestre",objective:"Converse com pessoas em mais de um local e descubra uma rota confiável.",progress:`${this.game.state.stage3.flags.routeDiscovered?"ROTA IDENTIFICADA":"COLETE DUAS FONTES INDEPENDENTES"}`},
      traveler_route:{title:"O Caminho do Viajante",objective:"Ajude Miriam e leve a carga até o mercado.",progress:this.game.state.stage3.flags.travelerHelpCompleted?"CONCLUÍDA":"LEVE A CARGA ATÉ O MERCADO"},
      water_for_family:{title:"Suprimentos para uma Família",objective:"Ajude Naomi entregando um suprimento de campo no povoado.",progress:this.game.state.stage3.flags.familyHelpCompleted?"CONCLUÍDA":"ENTREGUE 1 SUPRIMENTO"
      }
    };
    return statuses[id] || statuses.past_rumors;
  }
}

function esc3(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}

function attachStage3(game) {
  stage3Ensure(game.state);
  game.pastWorld = new PastWorldManager(game);
  game.social = new SocialManager(game);
  game.explorationQuests = new ExplorationQuestManager(game);
  game.stage3UI = new Stage3UI(game);
  game.stage3UI.init();

  const originalStart = game.startNewGame.bind(game);
  game.startNewGame = function(){
    originalStart();
    stage3Ensure(game.state);
    game.stage3UI.selectedNPC=null;
    game.stage3UI.render();
  };

  const originalTransition = game.narrative.transitionToPast.bind(game.narrative);
  game.narrative.transitionToPast = function(){
    originalTransition();
    const delay = game.state.settings.reducedMotion ? 160 : 1120;
    window.setTimeout(()=>{
      stage3Ensure(game.state);
      game.state.stage3.flags.arrivedPast = true;
      game.state.stage3.currentLocation = "past_road";
      game.state.stage3.visited = ["past_road"];
      game.state.stage3.currentObjective = "past_rumors";
      game.state.stage3.eventLog.unshift("A chegada ao passado foi registrada.");
      game.worldMap.discover("past_road");
      game.ui.renderLocation({act:"ATO III",name:"Estradas Antigas",era:"PASSADO",tag:"ÁREA INICIAL",description:STAGE3_DB.locations.past_road.description});
      game.stage3UI.render();
      game.ui.notify("ATO III", "O passado agora pode ser explorado diretamente.", "success");
      game.stage3UI.open();
    }, delay);
  };

  // Mantém a nova camada coerente quando um save antigo for carregado.
  const originalLoad = game.loadGame.bind(game);
  game.loadGame = function(){
    originalLoad();
    window.setTimeout(()=>{ stage3Ensure(game.state); game.stage3UI.render(); game.stage3UI.refreshFromState(); }, 180);
  };

  game.state.version = APP_CONFIG.version;
  game.stage3UI.render();
}

window.addEventListener("DOMContentLoaded",()=>{
  if(window.game) attachStage3(window.game);
  else console.error("Stage 3: GameController ausente.");
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 4 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 4
   ATO IV — O ENCONTRO
   ----------------------------------------------------------------------------
   Extensão modular da v0.3.0.

   Regras narrativas do módulo:
   - O encontro é orientado por diálogo, não por combate.
   - Jesus não é transformado em personagem de combate comum.
   - O protagonista chega acreditando que está trazendo uma solução.
   - O diálogo confronta a ideia de usar alguém como ferramenta.
   - As escolhas alteram o estado interno do protagonista.
   - O encontro termina com o protagonista retornando ao futuro.
   - A nova missão é investigar e desmontar os mecanismos de controle.
   ============================================================================ */

"use strict";

const STAGE4_VERSION = "0.4.0";

const STAGE4_DB = {
  location: {
    id: "encounter_courtyard",
    name: "Lugar do Encontro",
    act: "ATO IV",
    era: "PASSADO",
    tag: "ENCONTRO NARRATIVO",
    description:
      "Um espaço simples onde o encontro acontece sem batalha, espetáculo ou demonstração de poder.",
    atmosphere: "SILÊNCIO • PESSOAS AO LONGE • CONVERSA"
  },

  characters: {
    jesus: {
      id: "jesus",
      name: "Jesus",
      role: "MESTRE",
      description:
        "Figura central do encontro. Sua função nesta etapa é provocar reflexão, revelar a lógica por trás da missão e deslocar o objetivo do protagonista.",
      narrativeRules: [
        "Não participar de combate comum.",
        "Não ser tratado como equipamento ou habilidade desbloqueável.",
        "Não ser reduzido a uma solução tecnológica.",
        "Sua influência deve surgir por perguntas, ensinamentos, consequências e transformação do protagonista."
      ]
    },

    protagonist: {
      id: "protagonist",
      name: "O Protagonista",
      role: "VIAJANTE TEMPORAL",
      description:
        "Chega ao encontro convencido de que trazer uma solução externa pode resolver o futuro.",
      internalArc: {
        start: "Eu vou salvar o mundo.",
        midpoint: "Talvez eu esteja tentando resolver o mundo sem entender a responsabilidade.",
        end: "Preciso decidir o que fazer com aquilo que descobri."
      }
    }
  },

  dialogue: {
    opening: {
      title: "O PRIMEIRO ENCONTRO",
      lines: [
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: "NARRAÇÃO",
          text:
            "Depois de seguir os rastros reunidos nas estradas e povoados, o protagonista finalmente chega ao lugar onde o mestre está ensinando."
        },
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: "NARRAÇÃO",
          text:
            "Não há uma batalha esperando por ele. Não há uma máquina. Não há uma multidão preparada para recebê-lo."
        },
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Você percorreu um caminho longo para chegar até aqui."
        },
        {
          speaker: "Protagonista",
          role: "VIAJANTE",
          type: "DIÁLOGO",
          text:
            "Eu vim de um tempo que precisa de ajuda."
        },
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Então diga-me por que você veio."
        }
      ]
    },

    futureExplanation: {
      title: "O FUTURO",
      lines: [
        {
          speaker: "Protagonista",
          role: "VIAJANTE",
          type: "DIÁLOGO",
          text:
            "Meu mundo chegou ao limite. Há guerras, fome, doenças, corrupção, governos que controlam pessoas, vigilância, desigualdade e medo."
        },
        {
          speaker: "Protagonista",
          role: "VIAJANTE",
          type: "DIÁLOGO",
          text:
            "Temos tecnologia avançada e ainda assim não conseguimos construir um mundo em que as pessoas vivam em paz."
        },
        {
          speaker: "Protagonista",
          role: "VIAJANTE",
          type: "DIÁLOGO",
          text:
            "Nós encontramos uma maneira de atravessar o tempo."
        },
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "E você acredita que chegar até mim é a mesma coisa que resolver aquilo que descreveu."
        }
      ]
    },

    firstChallenge: {
      title: "UMA PERGUNTA",
      choices: [
        {
          id: "choice_tool",
          label: "“Viemos pedir que você venha conosco. Talvez sua presença consiga mudar tudo.”",
          effects: {
            control: 6,
            freedom: -4,
            hope: 2
          },
          text:
            "O protagonista apresenta Jesus como a última peça de uma estratégia que já foi construída antes do encontro.",
          response:
            "Jesus percebe que a missão começou a tratar uma pessoa como resposta para problemas que continuam sendo responsabilidade daqueles que os criaram."
        },
        {
          id: "choice_help",
          label: "“Eu não sei se existe uma solução. Eu só não consegui aceitar que as pessoas fossem deixadas daquele jeito.”",
          effects: {
            control: -3,
            freedom: 5,
            hope: 4
          },
          text:
            "Pela primeira vez, o protagonista admite que sua certeza inicial não é completa.",
          response:
            "Jesus reconhece a preocupação, mas não permite que a compaixão seja confundida com a transferência da responsabilidade para outra pessoa."
        },
        {
          id: "choice_question",
          label: "“Antes de pedir qualquer coisa, quero entender por que meu mundo chegou aqui.”",
          effects: {
            control: -5,
            freedom: 7,
            hope: 1
          },
          text:
            "O protagonista abandona, por um instante, a pressa de obter uma solução.",
          response:
            "O diálogo muda de direção: em vez de pedir uma intervenção, o protagonista começa a examinar a origem de suas próprias escolhas."
        }
      ]
    },

    coreDialogue: {
      title: "O CONFRONTO MORAL",
      lines: [
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Vocês vieram até aqui porque esperam que alguém faça aquilo que vocês próprios não conseguiram fazer."
        },
        {
          speaker: "Protagonista",
          role: "VIAJANTE",
          type: "DIÁLOGO",
          text:
            "Se você pudesse impedir todo aquele sofrimento, não faria?"
        },
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "A pergunta parece simples, mas esconde outra: quem decide o que deve ser feito, quem assume as consequências e quem será responsabilizado por elas?"
        }
      ]
    },

    confrontationChoice: {
      title: "A RESPONSABILIDADE",
      choices: [
        {
          id: "choice_responsibility",
          label: "“Talvez eu esteja tentando encontrar alguém que faça o que eu não sei como fazer.”",
          effects: {
            freedom: 8,
            control: -7,
            hope: 3,
            guilt: 5
          },
          text:
            "O protagonista admite que sua missão pode ter sido, em parte, uma tentativa de fugir da responsabilidade.",
          response:
            "A conversa deixa de ser sobre transportar alguém no tempo e passa a ser sobre o que o protagonista fará com aquilo que descobriu."
        },
        {
          id: "choice_insist",
          label: "“Mesmo assim, o futuro continua precisando de ajuda.”",
          effects: {
            hope: 6,
            control: 4,
            freedom: -3
          },
          text:
            "O protagonista insiste que o sofrimento do futuro não deixa espaço para uma resposta confortável.",
          response:
            "Jesus não transforma a insistência em autorização para ser levado como instrumento. O problema permanece: salvar não pode significar retirar das pessoas a responsabilidade por suas próprias escolhas."
        },
        {
          id: "choice_reconsider",
          label: "“Então eu preciso voltar e descobrir o que realmente está por trás daquela situação.”",
          effects: {
            freedom: 7,
            control: -5,
            hope: 2
          },
          text:
            "O protagonista decide que a missão precisa mudar antes que uma nova decisão seja tomada.",
          response:
            "O encontro aponta para uma investigação do presente, não para uma fuga dele."
        }
      ]
    },

    refusal: {
      title: "A RESPOSTA",
      lines: [
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Não vou para o futuro como instrumento de um projeto criado para resolver aquilo que vocês precisam enfrentar."
        },
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Volte. Procure saber quem construiu a prisão do seu mundo, por que ela existe e por que tantos aceitaram viver dentro dela."
        },
        {
          speaker: "Protagonista",
          role: "VIAJANTE",
          type: "DIÁLOGO",
          text:
            "Então você está mandando que eu volte sem a solução que eles esperavam."
        },
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Você volta com uma pergunta diferente."
        }
      ]
    },

    mission: {
      title: "A NOVA MISSÃO",
      lines: [
        {
          speaker: "Jesus",
          role: "MESTRE",
          type: "DIÁLOGO",
          text:
            "Libertem o mundo daqueles que construíram sua prisão."
        },
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: "NARRAÇÃO",
          text:
            "A frase não é apresentada como um chamado à destruição indiscriminada. Ela aponta para os mecanismos de controle que mantêm o mundo preso."
        },
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: "NARRAÇÃO",
          text:
            "O protagonista percebe que voltou no tempo procurando uma pessoa para salvar o futuro. Agora precisa retornar para descobrir por que o futuro chegou àquele ponto."
        }
      ]
    },

    return: {
      title: "O RETORNO",
      lines: [
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: "NARRAÇÃO",
          text:
            "O encontro termina sem batalha. O protagonista retorna ao Cronófago com mais perguntas do que respostas."
        },
        {
          speaker: "NARRAÇÃO",
          role: "PROTOCOLO",
          type: "NARRAÇÃO",
          text:
            "A viagem de volta não apaga o que aconteceu. A missão mudou."
        }
      ]
    }
  },

  questions: [
    "Se você pudesse impedir o sofrimento, quem deveria assumir a responsabilidade pela solução?",
    "Uma pessoa pode ser usada como ferramenta para alcançar um objetivo moralmente desejável?",
    "O que acontece quando uma sociedade entrega sua responsabilidade a uma autoridade que promete salvá-la?"
  ]
};

function stage4Ensure(state) {
  state.stage4 = state.stage4 || {};
  const s = state.stage4;

  s.version = STAGE4_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);
  s.currentBlock = s.currentBlock || "opening";
  s.currentLine = Number.isInteger(s.currentLine) ? s.currentLine : 0;
  s.selectedChoices = Array.isArray(s.selectedChoices) ? s.selectedChoices : [];
  s.questionsConsidered = Array.isArray(s.questionsConsidered) ? s.questionsConsidered : [];
  s.flags = s.flags || {};
  s.flags.routeConfirmed = Boolean(s.flags.routeConfirmed);
  s.flags.encounterCompleted = Boolean(s.flags.encounterCompleted);
  s.flags.returnInitiated = Boolean(s.flags.returnInitiated);
  s.flags.newMissionReceived = Boolean(s.flags.newMissionReceived);
  s.flags.futureBriefingRequired = Boolean(s.flags.futureBriefingRequired);
  s.eventLog = Array.isArray(s.eventLog) ? s.eventLog : [];
}

class EncounterNarrativeManager {
  constructor(game) {
    this.game = game;
    this.typingTimer = null;
    this.typingToken = 0;
    this.currentText = "";
    this.currentPosition = 0;
  }

  ensure() {
    stage4Ensure(this.game.state);
  }

  get block() {
    this.ensure();
    return STAGE4_DB.dialogue[this.game.state.stage4.currentBlock] || null;
  }

  get currentLine() {
    const block = this.block;
    if (!block || !Array.isArray(block.lines)) return null;
    return block.lines[this.game.state.stage4.currentLine] || null;
  }

  start() {
    this.ensure();
    const s = this.game.state.stage4;

    s.active = true;
    s.started = true;
    s.finished = false;
    s.currentBlock = "opening";
    s.currentLine = 0;

    this.setEncounterWorldState();
    this.game.stage4UI.open();
    this.renderCurrent();
  }

  setEncounterWorldState() {
    const s = this.game.state.stage4;
    this.game.state.world.actId = "act4";
    this.game.state.world.locationId = STAGE4_DB.location.id;
    this.game.state.world.era = STAGE4_DB.location.era;
    this.game.state.world.worldStatus = "ENCONTRO EM ANDAMENTO";
    s.flags.routeConfirmed = true;

    if (!Array.isArray(this.game.state.stage3?.eventLog)) return;
    this.game.state.stage3.eventLog.unshift(
      "A rota do mestre foi confirmada e o protagonista entrou no Ato IV."
    );
  }

  renderCurrent() {
    const block = this.block;
    const line = this.currentLine;

    if (!block) {
      this.finish();
      return;
    }

    this.game.stage4UI.renderBlockTitle(block.title);

    if (!line) {
      this.advanceBlock();
      return;
    }

    this.game.stage4UI.clearChoices();
    this.game.stage4UI.setChoiceMode(false);
    this.game.stage4UI.setSpeaker(
      line.speaker,
      line.role,
      line.type || "DIÁLOGO"
    );

    this.typeText(line.text);
  }

  typeText(text) {
    this.stopTyping();

    this.currentText = String(text || "");
    this.currentPosition = 0;
    const speed = this.game.state.settings.fastText ? 6 : 19;
    const token = ++this.typingToken;

    this.game.stage4UI.setText("");
    this.game.stage4UI.setTyping(true);

    if (!this.currentText) {
      this.completeTyping(token);
      return;
    }

    this.typingTimer = window.setInterval(() => {
      if (token !== this.typingToken) return;

      this.currentPosition += 1;
      this.game.stage4UI.setText(this.currentText.slice(0, this.currentPosition));

      if (this.currentPosition >= this.currentText.length) {
        this.completeTyping(token);
      }
    }, speed);
  }

  completeTyping(token) {
    if (token !== this.typingToken) return;

    this.stopTyping();
    this.game.stage4UI.setText(this.currentText);
    this.game.stage4UI.setTyping(false);
  }

  skipTyping() {
    if (!this.currentText) return false;

    if (this.typingTimer) {
      this.completeTyping(this.typingToken);
      return true;
    }

    return false;
  }

  stopTyping() {
    if (this.typingTimer) {
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
  }

  continue() {
    this.ensure();

    if (this.skipTyping()) return;

    const block = this.block;
    if (!block) return;

    this.game.audio.beep(420, 0.035, 0.011);

    this.game.state.stage4.currentLine += 1;

    if (this.game.state.stage4.currentLine >= (block.lines?.length || 0)) {
      this.advanceBlock();
      return;
    }

    this.renderCurrent();
  }

  advanceBlock() {
    const order = [
      "opening",
      "futureExplanation",
      "firstChallenge",
      "coreDialogue",
      "confrontationChoice",
      "refusal",
      "mission",
      "return"
    ];

    const current = this.game.state.stage4.currentBlock;
    const index = order.indexOf(current);

    if (index === -1 || index >= order.length - 1) {
      this.finish();
      return;
    }

    this.game.state.stage4.currentBlock = order[index + 1];
    this.game.state.stage4.currentLine = 0;

    if (
      this.game.state.stage4.currentBlock === "firstChallenge" ||
      this.game.state.stage4.currentBlock === "confrontationChoice"
    ) {
      this.renderChoiceBlock();
      return;
    }

    this.renderCurrent();
  }

  renderChoiceBlock() {
    const block = this.block;
    if (!block?.choices) {
      this.advanceBlock();
      return;
    }

    this.stopTyping();
    this.game.stage4UI.setBlockTitle(block.title);
    this.game.stage4UI.setSpeaker("DECISÃO", "ESCOLHA DO PROTAGONISTA", "ESCOLHA");
    this.game.stage4UI.setText(
      block.title === "UMA PERGUNTA"
        ? "Como você responde quando percebe que talvez esteja tentando transformar uma pessoa em uma solução?"
        : "O que você faz com a pergunta que acabou de receber?"
    );
    this.game.stage4UI.setTyping(false);
    this.game.stage4UI.setChoiceMode(true);
    this.game.stage4UI.renderChoices(block.choices);
  }

  choose(choiceId) {
    this.ensure();

    const block = this.block;
    const choice = block?.choices?.find((item) => item.id === choiceId);

    if (!choice) return;

    this.stopTyping();

    this.applyEffects(choice.effects || {});
    this.game.state.stage4.selectedChoices.push({
      block: this.game.state.stage4.currentBlock,
      choiceId: choice.id,
      text: choice.label,
      at: new Date().toISOString()
    });

    this.game.state.stage4.questionsConsidered.push(choice.text);
    this.game.state.stage4.eventLog.unshift(
      `${this.game.state.stage4.currentBlock}: ${choice.id}`
    );

    this.game.audio.confirm();
    this.game.stage4UI.showChoiceResult(choice, () => {
      this.game.state.stage4.currentLine = 0;

      if (this.game.state.stage4.currentBlock === "firstChallenge") {
        this.game.state.stage4.currentBlock = "coreDialogue";
      } else {
        this.game.state.stage4.currentBlock = "refusal";
      }

      this.renderCurrent();
    });
  }

  applyEffects(effects) {
    const stats = this.game.state.player.stats;

    for (const [key, value] of Object.entries(effects)) {
      if (typeof stats[key] !== "number") continue;
      stats[key] = clamp(stats[key] + Number(value), 0, 100);
    }

    // culpa é uma variável narrativa; não é exibida como barra no HUD atual.
    if (typeof effects.guilt === "number") {
      this.game.state.narrative.flags.protagonistGuilt =
        Number(this.game.state.narrative.flags.protagonistGuilt || 0) + effects.guilt;
    }

    this.game.ui.renderPlayerStats();
  }

  finish() {
    this.ensure();
    this.stopTyping();

    const s = this.game.state.stage4;

    s.active = false;
    s.finished = true;
    s.flags.encounterCompleted = true;
    s.flags.newMissionReceived = true;
    s.flags.returnInitiated = true;
    s.flags.futureBriefingRequired = true;

    this.game.stage4UI.renderCompletion();

    window.setTimeout(() => {
      this.returnToFuture();
    }, this.game.state.settings.reducedMotion ? 20 : 1200);
  }

  returnToFuture() {
    const s = this.game.state.stage4;

    this.game.ui.fadeTransition(true);

    window.setTimeout(() => {
      s.active = false;
      s.flags.returnInitiated = false;

      this.game.state.world.actId = "act5";
      this.game.state.world.locationId = "commandCenter";
      this.game.state.world.era = "FUTURO";
      this.game.state.world.worldStatus = "LINHA TEMPORAL ESTÁVEL";
      this.game.state.narrative.flags.arrivedInPast = false;

      // A nova missão é explícita e corresponde à história.
      this.game.state.missions.active =
        Array.isArray(this.game.state.missions.active)
          ? this.game.state.missions.active.filter(
              (id) => id !== "quest_temporal_launch"
            )
          : [];

      if (!this.game.state.missions.completed.includes("quest_temporal_launch")) {
        this.game.state.missions.completed.push("quest_temporal_launch");
      }

      this.game.state.stage3.currentObjective = "past_rumors";
      this.game.state.stage3.flags.routeDiscovered = true;
      this.game.state.stage3.eventLog.unshift(
        "O protagonista retornou ao futuro após o encontro."
      );

      this.game.ui.showGameScreen();
      this.game.ui.renderLocation({
        act: "ATO V",
        name: "Centro de Comando",
        era: "FUTURO",
        tag: "RETORNO",
        description:
          "O protagonista voltou. A organização afirma que a viagem falhou, mas agora existem perguntas que não podem mais ser ignoradas."
      });

      this.game.ui.setDialogueSpeaker(
        "PROTOCOLO",
        "ATO V — O RETORNO",
        "NARRAÇÃO"
      );
      this.game.ui.typeDialogueText(
        "Você voltou ao futuro.\n\nA missão que trouxe você até o passado terminou. A verdadeira investigação começa agora."
      );
      this.game.ui.setContinueVisible(false);

      this.game.ui.notify(
        "NOVA MISSÃO",
        "Descubra quem realmente controla o mundo.",
        "success"
      );

      this.game.ui.fadeTransition(false);
      this.game.ui.renderMissions();
      this.game.ui.renderWorldStatus();
    }, this.game.state.settings.reducedMotion ? 10 : 820);
  }
}

class Stage4UI {
  constructor(game) {
    this.game = game;
    this.overlay = null;
    this.choiceResult = null;
  }

  init() {
    stage4Ensure(this.game.state);
    this.injectOverlay();
    this.bind();
    this.render();
  }

  injectOverlay() {
    if (document.getElementById("stage4EncounterOverlay")) {
      this.overlay = document.getElementById("stage4EncounterOverlay");
      return;
    }

    this.overlay = document.createElement("div");
    this.overlay.id = "stage4EncounterOverlay";
    this.overlay.className = "overlay stage4-overlay";
    this.overlay.hidden = true;

    this.overlay.innerHTML = `
      <div class="modal-panel stage4-modal">
        <div class="stage4-topline">
          <div>
            <span class="modal-kicker">ATO IV</span>
            <h2>O ENCONTRO</h2>
          </div>
          <div class="stage4-security">
            <span class="stage4-security-dot"></span>
            <span>SEQUÊNCIA NARRATIVA</span>
          </div>
        </div>

        <div class="stage4-scene">
          <div class="stage4-atmosphere" aria-hidden="true">
            <div class="stage4-sun"></div>
            <div class="stage4-dust dust-a"></div>
            <div class="stage4-dust dust-b"></div>
            <div class="stage4-figure figure-protagonist">
              <span></span>
            </div>
            <div class="stage4-figure figure-teacher">
              <span></span>
            </div>
            <div class="stage4-ground-line"></div>
          </div>

          <div class="stage4-scene-copy">
            <span class="eyebrow" id="stage4BlockTitle">O PRIMEIRO ENCONTRO</span>
            <div class="stage4-questions">
              <span>O que você veio pedir?</span>
              <span>Quem assume a responsabilidade?</span>
              <span>O que significa salvar?</span>
            </div>
          </div>
        </div>

        <div class="stage4-dialogue">
          <div class="stage4-speaker">
            <div class="stage4-speaker-mark" id="stage4SpeakerMark">JC</div>
            <div>
              <span id="stage4SpeakerRole" class="dialogue-role">PROTOCOLO</span>
              <h3 id="stage4Speaker">SISTEMA</h3>
            </div>
            <span id="stage4DialogueType" class="dialogue-type">NARRAÇÃO</span>
          </div>

          <div class="stage4-text-zone">
            <p id="stage4DialogueText"></p>
            <span id="stage4Cursor" class="typing-cursor"></span>
          </div>

          <div id="stage4ChoiceContainer" class="stage4-choice-container"></div>

          <div id="stage4Result" class="stage4-result" hidden>
            <span>CONSEQUÊNCIA IMEDIATA</span>
            <p id="stage4ResultText"></p>
            <div id="stage4ResultResponse" class="stage4-result-response"></div>
            <button id="stage4ResultContinue" class="primary-button" type="button">CONTINUAR</button>
          </div>

          <div class="stage4-controls">
            <button id="stage4Continue" class="primary-button" type="button">CONTINUAR</button>
            <button id="stage4Skip" class="secondary-button" type="button">PULAR TEXTO</button>
          </div>
        </div>

        <div class="stage4-footer">
          <div class="stage4-status-grid">
            <div>
              <span>ESPERANÇA</span>
              <strong id="stage4HopeValue">0</strong>
            </div>
            <div>
              <span>LIBERDADE</span>
              <strong id="stage4FreedomValue">0</strong>
            </div>
            <div>
              <span>CONTROLE</span>
              <strong id="stage4ControlValue">0</strong>
            </div>
            <div>
              <span>ESTABILIDADE TEMPORAL</span>
              <strong id="stage4TemporalValue">0</strong>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
  }

  bind() {
    // Os controles do Ato IV ficam isolados no próprio overlay.
    // Isso evita que outro sistema global consuma/intercepte o clique.
    const choiceContainer = this.overlay.querySelector("#stage4ChoiceContainer");

    choiceContainer.addEventListener("click", (event) => {
      const button = event.target.closest("[data-stage4-choice]");
      if (!button || !choiceContainer.contains(button) || button.disabled) return;

      event.preventDefault();
      event.stopPropagation();

      const choiceId = button.dataset.stage4Choice;
      if (!choiceId || !this.game.encounter) return;

      choiceContainer.querySelectorAll("[data-stage4-choice]").forEach((item) => {
        item.disabled = true;
        item.setAttribute("aria-disabled", "true");
      });

      button.classList.add("is-selected");
      this.game.visualLab?.record(
        "CHOICE",
        "EncounterNarrativeManager.choose()",
        `Escolha do Ato IV: ${choiceId}`
      );
      this.game.encounter.choose(choiceId);
    });

    this.overlay.addEventListener("click", (event) => {
      if (event.target === this.overlay && !this.game.state.stage4.active) {
        this.close();
      }
    });

    document.getElementById("stage4Continue").addEventListener("click", (event) => {
      event.preventDefault();
      this.game.encounter.continue();
    });

    document.getElementById("stage4Skip").addEventListener("click", (event) => {
      event.preventDefault();
      const skipped = this.game.encounter.skipTyping();
      if (!skipped) this.game.encounter.continue();
    });

    document.getElementById("stage4ResultContinue").addEventListener("click", (event) => {
      event.preventDefault();
      this.hideResult();
      this.game.visualLab?.record(
        "CHOICE_RESULT",
        "Stage4UI.continueResult()",
        "Consequência aceita; avançando para o próximo diálogo."
      );
      this.game.encounter.renderCurrent();
    });

    // Atalhos 1–9 para escolhas narrativas, úteis quando o botão físico estiver
    // sendo coberto por outra camada visual ou quando o usuário estiver usando teclado.
    this._keyHandler = (event) => {
      if (this.overlay.hidden || !this.game.state.stage4.active) return;
      const key = Number(event.key);
      if (!Number.isInteger(key) || key < 1 || key > 9) return;

      const choices = [...choiceContainer.querySelectorAll("[data-stage4-choice]")];
      const button = choices[key - 1];
      if (!button || button.disabled) return;

      event.preventDefault();
      button.click();
    };

    document.addEventListener("keydown", this._keyHandler);
  }

  open() {
    stage4Ensure(this.game.state);
    this.overlay.hidden = false;
    this.render();
  }

  close() {
    if (this.game.state.stage4.active) return;
    this.overlay.hidden = true;
  }

  setSpeaker(speaker, role, type) {
    document.getElementById("stage4Speaker").textContent = speaker || "SISTEMA";
    document.getElementById("stage4SpeakerRole").textContent = role || "PROTOCOLO";
    document.getElementById("stage4DialogueType").textContent = type || "DIÁLOGO";

    const mark = document.getElementById("stage4SpeakerMark");
    mark.textContent = speaker === "Jesus" ? "JC" : "01";
    mark.classList.toggle("teacher", speaker === "Jesus");
  }

  setText(text) {
    document.getElementById("stage4DialogueText").textContent = text;
  }

  setTyping(active) {
    document.getElementById("stage4Cursor").style.display =
      active ? "inline-block" : "none";
  }

  setChoiceMode(active) {
    document.getElementById("stage4Continue").style.display =
      active ? "none" : "inline-flex";
    document.getElementById("stage4Skip").style.display =
      active ? "none" : "inline-flex";
  }

  clearChoices() {
    document.getElementById("stage4ChoiceContainer").innerHTML = "";
  }

  renderChoices(choices) {
    const container = document.getElementById("stage4ChoiceContainer");
    container.innerHTML = "";
    container.removeAttribute("aria-hidden");

    for (const [index, choice] of choices.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "stage4-choice";
      button.dataset.stage4Choice = choice.id;
      button.setAttribute("aria-label", `Escolha ${index + 1}: ${choice.label}`);
      button.setAttribute("data-choice-index", String(index + 1));
      button.tabIndex = 0;

      button.innerHTML = `
        <span class="stage4-choice-index">${index + 1}</span>
        <span>
          <strong>${escapeStage4(choice.label)}</strong>
          <small>${escapeStage4(choice.text)}</small>
        </span>
      `;

      container.appendChild(button);
    }
  }

  showChoiceResult(choice, callback) {
    const result = document.getElementById("stage4Result");
    const text = document.getElementById("stage4ResultText");
    const response = document.getElementById("stage4ResultResponse");

    text.textContent = choice.text;
    response.textContent = choice.response;

    result.hidden = false;
    this.choiceResult = callback;
    this.setChoiceMode(true);
    document.getElementById("stage4ResultContinue")?.focus();
  }

  hideResult() {
    document.getElementById("stage4Result").hidden = true;
    this.setChoiceMode(false);
  }

  renderBlockTitle(title) {
    document.getElementById("stage4BlockTitle").textContent = title;
  }

  setBlockTitle(title) {
    this.renderBlockTitle(title);
  }

  renderCompletion() {
    this.open();

    this.renderBlockTitle("A NOVA MISSÃO");

    this.setSpeaker("PROTOCOLO", "ENCERRAMENTO DO ATO IV", "NARRAÇÃO");
    this.setText(
      "O encontro terminou. Jesus não veio para o futuro como ferramenta de um projeto.\n\nVocê recebeu uma missão diferente: voltar e descobrir quem construiu a prisão do seu mundo."
    );
    this.setTyping(false);
    this.clearChoices();
    this.setChoiceMode(false);

    document.getElementById("stage4Continue").style.display = "none";
    document.getElementById("stage4Skip").style.display = "none";
  }

  render() {
    stage4Ensure(this.game.state);

    const stats = this.game.state.player.stats;
    document.getElementById("stage4HopeValue").textContent = String(
      clamp(stats.hope, 0, 100)
    );
    document.getElementById("stage4FreedomValue").textContent = String(
      clamp(stats.freedom, 0, 100)
    );
    document.getElementById("stage4ControlValue").textContent = String(
      clamp(stats.control, 0, 100)
    );
    document.getElementById("stage4TemporalValue").textContent = String(
      clamp(stats.temporalStability, 0, 100)
    );
  }

  initStage3Button() {
    const interval = window.setInterval(() => {
      const modal = document.querySelector("#stage3ExplorationOverlay .stage3-body");
      if (!modal) return;

      if (document.querySelector("[data-stage4-open]")) {
        clearInterval(interval);
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "stage4-launch-panel";
      wrapper.innerHTML = `
        <div>
          <span class="eyebrow">PRÓXIMO MÓDULO</span>
          <strong>Encontrar o mestre</strong>
          <small>Quando a rota estiver confirmada, aproxime-se do encontro narrativo.</small>
        </div>
        <button type="button" data-stage4-open>APROXIMAR-SE</button>
      `;

      modal.appendChild(wrapper);

      const stage4Button = wrapper.querySelector("[data-stage4-open]");

      const update = () => {
        const unlocked = Boolean(
          this.game.state.stage3?.flags?.routeDiscovered
        );

        stage4Button.disabled = !unlocked;
        stage4Button.title = unlocked
          ? "Iniciar o Ato IV — O Encontro"
          : "Colete fontes suficientes para confirmar a rota.";

        wrapper.classList.toggle("locked", !unlocked);
      };

      update();

      const oldRender = this.game.stage3UI.render.bind(this.game.stage3UI);
      this.game.stage3UI.render = (...args) => {
        oldRender(...args);
        update();
      };

      clearInterval(interval);
    }, 250);
  }

  refresh() {
    this.render();
  }
}

function escapeStage4(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage4(game) {
  stage4Ensure(game.state);

  if (!game.encounter) {
    game.encounter = new EncounterNarrativeManager(game);
  }

  if (!game.stage4UI) {
    game.stage4UI = new Stage4UI(game);
    game.stage4UI.init();
    game.stage4UI.initStage3Button();
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage4Ensure(game.state);
    game.stage4UI.refresh();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage4Ensure(game.state);
      game.stage4UI.refresh();
    }, 260);
  };

  // Guarda a versão do módulo sem destruir versões antigas.
  game.state.version = APP_CONFIG.version;
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage4(window.game);
  } else {
    console.error("Stage 4: GameController ausente.");
  }
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 5 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 5
   ATO V — O RETORNO
   ----------------------------------------------------------------------------
   Extensão modular da v0.4.0.

   Objetivo narrativo:
   - O protagonista retorna ao futuro.
   - A organização afirma que a viagem falhou.
   - O protagonista percebe que os líderes sabem mais do que disseram.
   - O objetivo principal muda de “trazer uma solução” para “descobrir quem
     realmente controla o mundo”.
   - A investigação passa a ser aberta e baseada em pistas.
   - As escolhas determinam ordem de investigação, confiança e evidências.
   - Não se revela antecipadamente o Arquivo Zero como verdade final.
   ============================================================================ */

"use strict";

const STAGE5_VERSION = "0.5.0";

const STAGE5_DB = {
  locations: {
    returnedCommand: {
      id: "returned_command",
      name: "Centro de Comando",
      act: "ATO V",
      era: "FUTURO",
      tag: "RETORNO",
      description:
        "A instalação secreta onde o protagonista é recebido após a viagem temporal.",
      atmosphere: "LUZ FRIA • MONITORES • SILÊNCIO CONTROLADO"
    },
    recordsArchive: {
      id: "records_archive",
      name: "Arquivo de Registros",
      act: "ATO V",
      era: "FUTURO",
      tag: "INVESTIGAÇÃO",
      description:
        "Uma área restrita com registros históricos, ordens administrativas e dados temporais.",
      atmosphere: "DADOS • ARQUIVOS • VIGILÂNCIA"
    },
    surveillanceHub: {
      id: "surveillance_hub",
      name: "Núcleo de Vigilância",
      act: "ATO V",
      era: "FUTURO",
      tag: "INFILTRAÇÃO",
      description:
        "Centro técnico responsável por monitorar setores civis e regiões consideradas instáveis.",
      atmosphere: "CÂMERAS • SINAIS • CONTROLE"
    },
    undergroundMarket: {
      id: "underground_market",
      name: "Mercado dos Desligados",
      act: "ATO V",
      era: "FUTURO",
      tag: "CONTATO",
      description:
        "Uma área fora dos sistemas formais onde circulam informações e pessoas que não confiam nas estruturas oficiais.",
      atmosphere: "RUMORES • TROCAS • DESCONFIANÇA"
    },
    temporalLab: {
      id: "temporal_lab",
      name: "Laboratório Temporal",
      act: "ATO V",
      era: "FUTURO",
      tag: "TECNOLOGIA",
      description:
        "Uma instalação relacionada à pesquisa temporal e aos registros usados pelo Cronófago.",
      atmosphere: "MÁQUINAS • ENERGIA • DADOS FRAGMENTADOS"
    }
  },

  npcs: {
    director: {
      id: "director",
      name: "Diretor da Organização",
      role: "DIRETOR",
      location: "returnedCommand",
      trust: 28,
      description:
        "Um dos responsáveis por autorizar a viagem. Sua postura é técnica, controlada e defensiva.",
      secret:
        "Ele sabe que os dados do projeto temporal eram incompletos antes da partida.",
      initialStatement:
        "A viagem falhou. O projeto termina aqui."
    },
    analyst: {
      id: "analyst",
      name: "Analista de Registros",
      role: "ANALISTA",
      location: "recordsArchive",
      trust: 48,
      description:
        "Profissional responsável por organizar registros históricos e temporais.",
      secret:
        "Encontrou alterações em registros antes mesmo do início do projeto.",
      initialStatement:
        "Há arquivos que não deveriam estar aqui."
    },
    dissident: {
      id: "dissident",
      name: "Informante dos Desligados",
      role: "INFORMANTE",
      location: "undergroundMarket",
      trust: 36,
      description:
        "Pessoa que abandonou estruturas oficiais e atua entre comunidades fora dos sistemas.",
      secret:
        "Conhece padrões de desaparecimento de informações e nomes apagados.",
      initialStatement:
        "O problema não é apenas quem manda. É quem decide o que pode ser lembrado."
    },
    engineer: {
      id: "engineer",
      name: "Engenheiro Temporal",
      role: "ENGENHEIRO",
      location: "temporalLab",
      trust: 42,
      description:
        "Especialista ligado à manutenção do Cronófago e aos sistemas de energia temporal.",
      secret:
        "Recebeu dados de origem desconhecida antes da primeira ativação.",
      initialStatement:
        "Algumas especificações vieram prontas. Não fomos nós que as criamos."
    },
    watcher: {
      id: "watcher",
      name: "Supervisora de Vigilância",
      role: "SUPERVISORA",
      location: "surveillanceHub",
      trust: 31,
      description:
        "Responsável por operações de vigilância e classificação de setores instáveis.",
      secret:
        "Existem regiões classificadas como perigosas que permanecem sem incidentes registrados.",
      initialStatement:
        "Você não deveria estar investigando esses setores."
    }
  },

  clues: {
    incompleteData: {
      id: "incompleteData",
      title: "Dados Históricos Incompletos",
      category: "HISTÓRIA",
      description:
        "Os registros entregues ao protagonista antes da viagem não continham informações importantes.",
      obtainedFrom: ["analyst"],
      strength: 2,
      unlocks: ["deletedIdentity", "chronoOrders"]
    },
    deletedIdentity: {
      id: "deletedIdentity",
      title: "Nome Apagado",
      category: "ARQUIVO",
      description:
        "Uma identidade foi removida de múltiplos registros sem deixar uma justificativa oficial.",
      obtainedFrom: ["analyst", "dissident"],
      strength: 3,
      unlocks: ["controlPattern"]
    },
    chronoOrders: {
      id: "chronoOrders",
      title: "Ordens Temporais",
      category: "TECNOLOGIA",
      description:
        "Existem instruções relacionadas à máquina que antecedem o projeto oficial.",
      obtainedFrom: ["engineer"],
      strength: 3,
      unlocks: ["externalSource"]
    },
    surveillancePattern: {
      id: "surveillancePattern",
      title: "Padrão de Vigilância",
      category: "CONTROLE",
      description:
        "Setores classificados como instáveis recebem monitoramento desproporcionalmente alto.",
      obtainedFrom: ["watcher"],
      strength: 2,
      unlocks: ["controlPattern"]
    },
    externalSource: {
      id: "externalSource",
      title: "Fonte Externa",
      category: "TEMPORAL",
      description:
        "Parte dos dados utilizados pela organização parece ter origem externa ao projeto.",
      obtainedFrom: ["engineer", "director"],
      strength: 4,
      unlocks: ["archiveZeroHint"]
    },
    controlPattern: {
      id: "controlPattern",
      title: "Padrão de Controle",
      category: "SISTEMA",
      description:
        "Vigilância, propaganda, registros alterados e estruturas administrativas parecem obedecer a padrões relacionados.",
      obtainedFrom: ["dissident", "watcher"],
      strength: 4,
      unlocks: ["archiveZeroHint"]
    },
    archiveZeroHint: {
      id: "archiveZeroHint",
      title: "Referência Incompleta",
      category: "MISTÉRIO",
      description:
        "Uma referência fragmentada aponta para uma estrutura superior responsável por reunir informações temporais, históricas e administrativas.",
      obtainedFrom: ["externalSource", "controlPattern"],
      strength: 5,
      unlocks: []
    }
  },

  investigationPaths: {
    records: {
      id: "records",
      label: "Investigar os registros históricos",
      description:
        "Seguir a pista dos dados incompletos e descobrir por que determinados acontecimentos foram removidos.",
      firstClue: "incompleteData"
    },
    surveillance: {
      id: "surveillance",
      label: "Investigar a rede de vigilância",
      description:
        "Descobrir por que determinados setores recebem controle desproporcional.",
      firstClue: "surveillancePattern"
    },
    temporal: {
      id: "temporal",
      label: "Investigar a origem dos dados temporais",
      description:
        "Descobrir de onde vieram especificações e ordens associadas ao Cronófago.",
      firstClue: "chronoOrders"
    },
    underground: {
      id: "underground",
      label: "Consultar os Desligados",
      description:
        "Buscar informações fora das estruturas oficiais.",
      firstClue: "deletedIdentity"
    }
  }
};

function stage5Ensure(state) {
  state.stage5 = state.stage5 || {};
  const s = state.stage5;

  s.version = STAGE5_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);

  s.currentLocationId = s.currentLocationId || "returnedCommand";
  s.investigationFocus = s.investigationFocus || null;

  s.flags = s.flags || {};
  s.flags.organizationConfronted = Boolean(s.flags.organizationConfronted);
  s.flags.contradictionFound = Boolean(s.flags.contradictionFound);
  s.flags.firstInvestigationCompleted = Boolean(s.flags.firstInvestigationCompleted);
  s.flags.archiveHintUnlocked = Boolean(s.flags.archiveHintUnlocked);
  s.flags.nextActReady = Boolean(s.flags.nextActReady);

  s.trust = s.trust || {};
  for (const npc of Object.values(STAGE5_DB.npcs)) {
    if (typeof s.trust[npc.id] !== "number") {
      s.trust[npc.id] = npc.trust;
    }
  }

  s.discoveredClues = Array.isArray(s.discoveredClues)
    ? s.discoveredClues
    : [];

  s.investigatedPaths = Array.isArray(s.investigatedPaths)
    ? s.investigatedPaths
    : [];

  s.investigationLog = Array.isArray(s.investigationLog)
    ? s.investigationLog
    : [];

  s.questions = Array.isArray(s.questions)
    ? s.questions
    : [
        "Quem realmente controla o mundo?",
        "Quem alterou os registros?",
        "Quem forneceu os dados temporais?",
        "Por que a organização acreditava que a viagem deveria acontecer?"
      ];
}

class InvestigationManager {
  constructor(game) {
    this.game = game;
    this.ui = null;
  }

  ensure() {
    stage5Ensure(this.game.state);
  }

  get state() {
    this.ensure();
    return this.game.state.stage5;
  }

  getLocation() {
    return (
      Object.values(STAGE5_DB.locations).find(
        (location) => location.id === this.state.currentLocationId
      ) || STAGE5_DB.locations.returnedCommand
    );
  }

  getClue(id) {
    return STAGE5_DB.clues[id] || null;
  }

  hasClue(id) {
    return this.state.discoveredClues.includes(id);
  }

  discoverClue(id, source = "desconhecido") {
    const clue = this.getClue(id);
    if (!clue) return false;

    if (!this.hasClue(id)) {
      this.state.discoveredClues.push(id);
      this.state.investigationLog.unshift({
        type: "clue",
        clueId: id,
        source,
        at: new Date().toISOString()
      });

      for (const unlock of clue.unlocks || []) {
        if (
          unlock === "archiveZeroHint" &&
          this.hasClue("externalSource") &&
          this.hasClue("controlPattern")
        ) {
          this.state.flags.archiveHintUnlocked = true;
        }
      }

      return true;
    }

    return false;
  }

  canUnlockClue(id) {
    const clue = this.getClue(id);
    if (!clue) return false;

    if (this.hasClue(id)) return false;

    const prerequisites = [];

    for (const source of clue.obtainedFrom || []) {
      if (source in STAGE5_DB.npcs) {
        prerequisites.push(source);
      }
    }

    if (id === "deletedIdentity") {
      return this.hasClue("incompleteData");
    }

    if (id === "controlPattern") {
      return this.hasClue("deletedIdentity") || this.hasClue("surveillancePattern");
    }

    if (id === "externalSource") {
      return this.hasClue("chronoOrders");
    }

    if (id === "archiveZeroHint") {
      return this.hasClue("externalSource") && this.hasClue("controlPattern");
    }

    return prerequisites.length === 0;
  }

  focusPath(pathId) {
    const path = STAGE5_DB.investigationPaths[pathId];
    if (!path) return;

    this.state.investigationFocus = pathId;

    if (!this.state.investigatedPaths.includes(pathId)) {
      this.state.investigatedPaths.push(pathId);
    }

    this.state.investigationLog.unshift({
      type: "path",
      pathId,
      at: new Date().toISOString()
    });

    this.game.stage5UI.refresh();
  }

  travel(locationId) {
    const location = Object.values(STAGE5_DB.locations).find(
      (item) => item.id === locationId
    );

    if (!location) return;

    this.state.currentLocationId = location.id;

    const oldLocation = this.getLocation();

    this.game.state.world.locationId = location.id;
    this.game.state.world.actId = "act5";
    this.game.state.world.era = location.era;
    this.game.state.world.worldStatus = "INVESTIGAÇÃO ATIVA";

    this.game.ui.renderLocation({
      act: location.act,
      name: location.name,
      era: location.era,
      tag: location.tag,
      description: location.description
    });

    this.state.investigationLog.unshift({
      type: "travel",
      from: oldLocation.id,
      to: location.id,
      at: new Date().toISOString()
    });

    this.game.stage5UI.refresh();
  }

  talkTo(npcId) {
    const npc = STAGE5_DB.npcs[npcId];
    if (!npc) return;

    const trust = this.state.trust[npcId];

    this.game.stage5UI.openDialogue(npc, trust, () => {
      this.resolveNpcConversation(npcId);
    });
  }

  resolveNpcConversation(npcId) {
    const npc = STAGE5_DB.npcs[npcId];

    if (npcId === "director") {
      this.resolveDirector();
      return;
    }

    if (npcId === "analyst") {
      this.resolveAnalyst();
      return;
    }

    if (npcId === "dissident") {
      this.resolveDissident();
      return;
    }

    if (npcId === "engineer") {
      this.resolveEngineer();
      return;
    }

    if (npcId === "watcher") {
      this.resolveWatcher();
      return;
    }

    this.game.ui.notify(
      "CONTATO",
      `${npc.name} não possui uma conversa expandida neste momento.`,
      "info"
    );
  }

  modifyTrust(npcId, delta) {
    const trust = Number(this.state.trust[npcId] || 0);
    this.state.trust[npcId] = clamp(trust + delta, 0, 100);
  }

  resolveDirector() {
    this.state.flags.organizationConfronted = true;

    const choices = [
      {
        label: "Aceitar a versão oficial.",
        effects: { control: 4, freedom: -3, hope: -1 },
        trust: 3,
        response:
          "O Diretor agradece a cooperação e encerra a conversa rapidamente."
      },
      {
        label: "Perguntar por que os registros históricos estavam incompletos.",
        effects: { control: -2, freedom: 4, hope: 1 },
        trust: -2,
        response:
          "O Diretor demora a responder. Pela primeira vez, a resposta parece calculada demais."
      },
      {
        label: "Perguntar de onde vieram as especificações do Cronófago.",
        effects: { control: -4, freedom: 6, hope: 2 },
        trust: -6,
        response:
          "O Diretor diz que os detalhes técnicos pertencem a outra divisão. A resposta não explica por que os dados existiam antes do projeto."
      }
    ];

    this.game.stage5UI.showDecision(
      "DIRETOR DA ORGANIZAÇÃO",
      "A viagem falhou. O projeto deve ser encerrado.",
      choices,
      (choice) => {
        this.applyDecision(choice, "director");

        if (choice.label.includes("Cronófago")) {
          this.state.flags.contradictionFound = true;
          this.discoverClue("chronoOrders", "Diretor");
        }

        if (choice.label.includes("registros")) {
          this.discoverClue("incompleteData", "Diretor");
        }
      }
    );
  }

  resolveAnalyst() {
    const choices = [
      {
        label: "Pedir apenas o relatório oficial.",
        effects: { control: 1, freedom: 0 },
        trust: 0,
        response:
          "O relatório oficial não contém os dados que o protagonista procura."
      },
      {
        label: "Perguntar sobre páginas e registros removidos.",
        effects: { control: -2, freedom: 4, hope: 1 },
        trust: 4,
        response:
          "O Analista admite que encontrou registros históricos alterados antes da viagem."
      },
      {
        label: "Mostrar que você sabe que os arquivos foram alterados.",
        effects: { control: -4, freedom: 6, hope: 2 },
        trust: 7,
        response:
          "O Analista decide revelar um índice parcial que deveria estar inacessível."
      }
    ];

    this.game.stage5UI.showDecision(
      "ANALISTA DE REGISTROS",
      "Há arquivos que não deveriam estar aqui.",
      choices,
      (choice) => {
        this.applyDecision(choice, "analyst");

        this.discoverClue("incompleteData", "Analista");

        if (choice.label.includes("alterados") || choice.label.includes("sabe")) {
          this.discoverClue("deletedIdentity", "Analista");
        }
      }
    );
  }

  resolveDissident() {
    const choices = [
      {
        label: "Perguntar sobre nomes apagados.",
        effects: { freedom: 5, control: -2 },
        trust: 7,
        response:
          "O Informante dos Desligados revela que nomes podem desaparecer de diferentes bases ao mesmo tempo."
      },
      {
        label: "Perguntar quem controla os setores oficiais.",
        effects: { freedom: 4, control: -3, hope: 1 },
        trust: 5,
        response:
          "Ele diz que vários grupos administram partes do sistema, mas os padrões são semelhantes demais."
      },
      {
        label: "Perguntar por que as pessoas aceitam viver sob vigilância.",
        effects: { freedom: 7, control: -4, hope: 2 },
        trust: 8,
        response:
          "Ele responde que medo e segurança podem parecer iguais quando a escolha é retirada lentamente."
      }
    ];

    this.game.stage5UI.showDecision(
      "INFORMANTE DOS DESLIGADOS",
      "O problema não é apenas quem manda. É quem decide o que pode ser lembrado.",
      choices,
      (choice) => {
        this.applyDecision(choice, "dissident");
        this.discoverClue("deletedIdentity", "Desligados");

        if (
          this.hasClue("surveillancePattern") ||
          choice.label.includes("setores")
        ) {
          this.discoverClue("controlPattern", "Desligados");
        }
      }
    );
  }

  resolveEngineer() {
    const choices = [
      {
        label: "Perguntar como a máquina funciona.",
        effects: { hope: 2, control: 1 },
        trust: 1,
        response:
          "O Engenheiro explica apenas o que está autorizado a explicar."
      },
      {
        label: "Perguntar de onde vieram os dados técnicos.",
        effects: { freedom: 5, control: -4, hope: 2 },
        trust: 6,
        response:
          "Algumas especificações chegaram prontas antes da primeira ativação."
      },
      {
        label: "Perguntar quem enviou as ordens temporais.",
        effects: { freedom: 7, control: -5, hope: 2 },
        trust: 7,
        response:
          "O Engenheiro admite que certas instruções não foram produzidas pela equipe."
      }
    ];

    this.game.stage5UI.showDecision(
      "ENGENHEIRO TEMPORAL",
      "Algumas especificações vieram prontas. Não fomos nós que as criamos.",
      choices,
      (choice) => {
        this.applyDecision(choice, "engineer");
        this.discoverClue("chronoOrders", "Engenheiro");

        if (
          choice.label.includes("dados técnicos") ||
          choice.label.includes("ordens")
        ) {
          this.discoverClue("externalSource", "Engenheiro");
        }
      }
    );
  }

  resolveWatcher() {
    const choices = [
      {
        label: "Perguntar sobre os setores instáveis.",
        effects: { freedom: 3, control: -1 },
        trust: 1,
        response:
          "A Supervisora diz que os setores são monitorados porque representam risco ao sistema."
      },
      {
        label: "Perguntar por que setores sem incidentes recebem vigilância intensa.",
        effects: { freedom: 6, control: -4, hope: 1 },
        trust: 4,
        response:
          "Ela hesita. Alguns níveis de vigilância não correspondem aos registros públicos de incidentes."
      },
      {
        label: "Perguntar quem define o que é um setor perigoso.",
        effects: { freedom: 7, control: -5, hope: 2 },
        trust: 3,
        response:
          "A classificação não é decidida apenas pela equipe local."
      }
    ];

    this.game.stage5UI.showDecision(
      "SUPERVISORA DE VIGILÂNCIA",
      "Você não deveria estar investigando esses setores.",
      choices,
      (choice) => {
        this.applyDecision(choice, "watcher");
        this.discoverClue("surveillancePattern", "Núcleo de Vigilância");

        if (
          choice.label.includes("quem define") ||
          choice.label.includes("vigilância intensa")
        ) {
          this.discoverClue("controlPattern", "Núcleo de Vigilância");
        }
      }
    );
  }

  applyDecision(choice, npcId) {
    const effects = choice.effects || {};
    const stats = this.game.state.player.stats;

    for (const [key, value] of Object.entries(effects)) {
      if (typeof stats[key] === "number") {
        stats[key] = clamp(stats[key] + Number(value), 0, 100);
      }
    }

    this.modifyTrust(npcId, Number(choice.trust || 0));

    this.state.investigationLog.unshift({
      type: "decision",
      npcId,
      label: choice.label,
      effects,
      at: new Date().toISOString()
    });

    this.game.ui.renderPlayerStats();
    this.game.stage5UI.refresh();
  }

  checkProgress() {
    const clues = this.state.discoveredClues;

    if (
      clues.includes("externalSource") &&
      clues.includes("controlPattern")
    ) {
      this.state.flags.archiveHintUnlocked = true;
      this.discoverClue("archiveZeroHint", "Convergência de pistas");
    }

    if (this.state.discoveredClues.length >= 2) {
      this.state.flags.firstInvestigationCompleted = true;
    }

    if (
      this.state.flags.archiveHintUnlocked &&
      this.state.discoveredClues.includes("archiveZeroHint")
    ) {
      this.state.flags.nextActReady = true;
    }

    this.game.stage5UI.refresh();
  }

  chooseNextStep() {
    this.checkProgress();

    if (this.state.flags.nextActReady) {
      this.game.stage5UI.openFinalReport();
      return;
    }

    this.game.stage5UI.openInvestigationMap();
  }

  finishAct() {
    this.checkProgress();

    if (!this.state.flags.nextActReady) {
      this.game.ui.notify(
        "INVESTIGAÇÃO INCOMPLETA",
        "Você precisa reunir mais evidências antes de avançar.",
        "error"
      );
      return;
    }

    this.state.finished = true;
    this.state.active = false;
    this.state.flags.nextActReady = true;

    this.game.state.world.actId = "act6";
    this.game.state.world.worldStatus = "INVESTIGAÇÃO — NOVOS ALIADOS";

    this.game.state.narrative.flags.futureBriefingRequired = false;

    this.game.ui.notify(
      "ATO V CONCLUÍDO",
      "As pistas convergem para uma estrutura maior. A próxima etapa será a formação da missão e dos aliados.",
      "success"
    );

    this.game.stage5UI.renderCompleted();
  }

  start() {
    this.ensure();

    this.state.active = true;
    this.state.started = true;
    this.state.finished = false;
    this.state.currentLocationId = "returnedCommand";

    this.game.state.world.actId = "act5";
    this.game.state.world.era = "FUTURO";
    this.game.state.world.worldStatus = "RETORNO — INVESTIGAÇÃO ATIVA";

    this.game.ui.showGameScreen();
    this.game.ui.renderLocation({
      act: "ATO V",
      name: STAGE5_DB.locations.returnedCommand.name,
      era: "FUTURO",
      tag: "RETORNO",
      description: STAGE5_DB.locations.returnedCommand.description
    });

    this.game.stage5UI.open();
    this.game.stage5UI.refresh();

    this.game.ui.notify(
      "ATO V — O RETORNO",
      "A organização afirma que a viagem falhou. As contradições começam agora.",
      "info"
    );
  }

  loadStateFromSave() {
    this.ensure();
    this.game.stage5UI.refresh();
  }
}

class Stage5UI {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.dialogueResolver = null;
    this.decisionResolver = null;
    this.initOverlay();
  }

  initOverlay() {
    if (document.getElementById("stage5Overlay")) {
      this.root = document.getElementById("stage5Overlay");
      return;
    }

    this.root = document.createElement("div");
    this.root.id = "stage5Overlay";
    this.root.className = "overlay stage5-overlay";
    this.root.hidden = true;

    this.root.innerHTML = `
      <div class="modal-panel stage5-modal">
        <div class="stage5-header">
          <div>
            <span class="modal-kicker">ATO V</span>
            <h2>O RETORNO</h2>
          </div>
          <div class="stage5-state">
            <span id="stage5StatusDot"></span>
            <span id="stage5StatusText">INVESTIGAÇÃO</span>
          </div>
        </div>

        <div class="stage5-main">
          <aside class="stage5-sidebar">
            <div class="stage5-sidebar-title">OBJETIVO</div>
            <div class="stage5-objective">
              <strong>Descobrir quem realmente controla o mundo.</strong>
              <p>
                A organização diz que a viagem falhou. Você sabe que algo não está certo.
              </p>
            </div>

            <div class="stage5-sidebar-title">EVIDÊNCIAS</div>
            <div id="stage5EvidenceList" class="stage5-evidence-list"></div>

            <div class="stage5-sidebar-title">CONFIANÇA</div>
            <div id="stage5TrustList" class="stage5-trust-list"></div>
          </aside>

          <section class="stage5-content">
            <div id="stage5View" class="stage5-view"></div>
          </section>
        </div>

        <div class="stage5-footer">
          <button id="stage5Close" class="secondary-button" type="button">FECHAR</button>
          <button id="stage5Back" class="secondary-button" type="button">VOLTAR</button>
          <button id="stage5Action" class="primary-button" type="button">CONTINUAR INVESTIGAÇÃO</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    this.root.addEventListener("click", (event) => {
      if (event.target === this.root && !this.game.state.stage5.active) {
        this.close();
      }
    });

    document.getElementById("stage5Close").addEventListener("click", () => {
      if (!this.game.state.stage5.active) {
        this.close();
      }
    });

    document.getElementById("stage5Back").addEventListener("click", () => {
      this.render();
    });

    document.getElementById("stage5Action").addEventListener("click", () => {
      this.game.investigation.chooseNextStep();
    });
  }

  open() {
    this.root.hidden = false;
  }

  close() {
    this.root.hidden = true;
  }

  refresh() {
    this.renderSidebar();
    this.render();
    this.game.investigation.checkProgress();
  }

  renderSidebar() {
    const state = this.game.state.stage5;

    const evidence = document.getElementById("stage5EvidenceList");
    evidence.innerHTML = "";

    if (!state.discoveredClues.length) {
      evidence.innerHTML = `<div class="stage5-empty">Nenhuma evidência registrada.</div>`;
    } else {
      for (const clueId of state.discoveredClues) {
        const clue = STAGE5_DB.clues[clueId];
        if (!clue) continue;

        const item = document.createElement("div");
        item.className = "stage5-evidence";
        item.innerHTML = `
          <span>${escapeStage5(clue.category)}</span>
          <strong>${escapeStage5(clue.title)}</strong>
          <small>Força ${clue.strength}/5</small>
        `;
        evidence.appendChild(item);
      }
    }

    const trust = document.getElementById("stage5TrustList");
    trust.innerHTML = "";

    for (const npc of Object.values(STAGE5_DB.npcs)) {
      const value = clamp(Number(state.trust[npc.id] || 0), 0, 100);

      const row = document.createElement("div");
      row.className = "stage5-trust";
      row.innerHTML = `
        <div>
          <span>${escapeStage5(npc.name)}</span>
          <strong>${value}</strong>
        </div>
        <div class="stage5-trust-bar"><i style="width:${value}%"></i></div>
      `;

      trust.appendChild(row);
    }
  }

  render() {
    if (this.root.hidden) return;

    const view = document.getElementById("stage5View");
    const focus = this.game.state.stage5.investigationFocus;

    if (this.dialogueResolver) {
      return;
    }

    if (this.decisionResolver) {
      return;
    }

    if (!focus) {
      this.renderInvestigationHub(view);
      return;
    }

    this.renderPathView(view, focus);
  }

  renderInvestigationHub(view) {
    const state = this.game.state.stage5;
    const discovered = state.discoveredClues.length;

    view.innerHTML = `
      <div class="stage5-kicker">RETORNO AO FUTURO</div>
      <h3>“A viagem falhou.”</h3>
      <p class="stage5-lead">
        A organização quer encerrar o projeto. Mas algumas respostas não combinam com os registros,
        as ordens técnicas e o que você viveu no passado.
      </p>

      <div class="stage5-contradiction">
        <div class="stage5-contradiction-line"></div>
        <div>
          <span>CONTRADIÇÃO</span>
          <strong>${state.flags.contradictionFound ? "DETECTADA" : "AINDA NÃO CONFIRMADA"}</strong>
        </div>
      </div>

      <div class="stage5-path-grid">
        ${Object.values(STAGE5_DB.investigationPaths).map((path) => `
          <button class="stage5-path-card" type="button"
            data-stage5-path="${path.id}">
            <span class="stage5-path-index">${path.id.toUpperCase()}</span>
            <strong>${escapeStage5(path.label)}</strong>
            <p>${escapeStage5(path.description)}</p>
            <small>
              ${state.investigatedPaths.includes(path.id) ? "INVESTIGADA" : "DISPONÍVEL"}
            </small>
          </button>
        `).join("")}
      </div>

      <div class="stage5-progress">
        <span>PROGRESSO DA INVESTIGAÇÃO</span>
        <strong>${discovered} / ${Object.keys(STAGE5_DB.clues).length} evidências</strong>
      </div>
    `;

    view.querySelectorAll("[data-stage5-path]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.stage5Path;
        this.game.investigation.focusPath(id);
      });
    });

    this.setFooterState();
  }

  renderPathView(view, pathId) {
    const path = STAGE5_DB.investigationPaths[pathId];
    if (!path) {
      this.game.state.stage5.investigationFocus = null;
      this.render();
      return;
    }

    const npcForPath = {
      records: "analyst",
      surveillance: "watcher",
      temporal: "engineer",
      underground: "dissident"
    };

    const npcId = npcForPath[pathId];
    const npc = STAGE5_DB.npcs[npcId];
    const state = this.game.state.stage5;

    view.innerHTML = `
      <div class="stage5-kicker">PISTA SELECIONADA</div>
      <h3>${escapeStage5(path.label)}</h3>
      <p class="stage5-lead">${escapeStage5(path.description)}</p>

      <div class="stage5-contact-card">
        <div class="stage5-contact-mark">${escapeStage5(npc.name.slice(0, 2).toUpperCase())}</div>
        <div>
          <span>${escapeStage5(npc.role)}</span>
          <strong>${escapeStage5(npc.name)}</strong>
          <p>${escapeStage5(npc.description)}</p>
        </div>
        <button id="stage5TalkButton" type="button" class="primary-button">
          FALAR
        </button>
      </div>

      <div class="stage5-clue-grid">
        ${state.discoveredClues.map((clueId) => {
          const clue = STAGE5_DB.clues[clueId];
          if (!clue) return "";
          return `
            <article class="stage5-clue-card">
              <span>${escapeStage5(clue.category)}</span>
              <h4>${escapeStage5(clue.title)}</h4>
              <p>${escapeStage5(clue.description)}</p>
            </article>
          `;
        }).join("")}
      </div>
    `;

    document.getElementById("stage5TalkButton").addEventListener("click", () => {
      this.game.investigation.talkTo(npcId);
    });

    this.setFooterState();
  }

  openDialogue(npc, trust, callback) {
    this.dialogueResolver = callback;

    const view = document.getElementById("stage5View");

    view.innerHTML = `
      <div class="stage5-dialogue-view">
        <div class="stage5-dialogue-header">
          <div class="stage5-dialogue-mark">${escapeStage5(npc.name.slice(0, 2).toUpperCase())}</div>
          <div>
            <span>${escapeStage5(npc.role)}</span>
            <h3>${escapeStage5(npc.name)}</h3>
          </div>
          <div class="stage5-dialogue-trust">
            <span>CONFIANÇA</span>
            <strong>${trust}</strong>
          </div>
        </div>

        <div class="stage5-dialogue-box">
          <div class="stage5-dialogue-scan"></div>
          <p>${escapeStage5(npc.initialStatement)}</p>
        </div>

        <div class="stage5-dialogue-actions">
          <button id="stage5DialogueContinue" class="primary-button" type="button">
            CONTINUAR
          </button>
        </div>
      </div>
    `;

    document.getElementById("stage5DialogueContinue").addEventListener("click", () => {
      const fn = this.dialogueResolver;
      this.dialogueResolver = null;
      if (fn) fn();
    });

    document.getElementById("stage5Back").disabled = true;
    this.setFooterState();
  }

  showDecision(title, statement, choices, callback) {
    this.decisionResolver = callback;

    const view = document.getElementById("stage5View");
    view.innerHTML = `
      <div class="stage5-decision-view">
        <div class="stage5-kicker">INTERAÇÃO</div>
        <h3>${escapeStage5(title)}</h3>
        <div class="stage5-statement">
          ${escapeStage5(statement)}
        </div>

        <div class="stage5-decision-list">
          ${choices.map((choice, index) => `
            <button class="stage5-decision" type="button"
              data-stage5-choice="${index}">
              <span>${index + 1}</span>
              <strong>${escapeStage5(choice.label)}</strong>
              <small>${escapeStage5(choice.response)}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;

    view.querySelectorAll("[data-stage5-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.stage5Choice);
        const choice = choices[index];

        const fn = this.decisionResolver;
        this.decisionResolver = null;

        if (fn) fn(choice);

        this.game.investigation.checkProgress();
        this.render();
      });
    });

    document.getElementById("stage5Back").disabled = true;
    this.setFooterState();
  }

  openInvestigationMap() {
    this.game.state.stage5.investigationFocus = null;
    this.dialogueResolver = null;
    this.decisionResolver = null;
    this.render();
  }

  openFinalReport() {
    const state = this.game.state.stage5;
    const view = document.getElementById("stage5View");

    view.innerHTML = `
      <div class="stage5-final-report">
        <div class="stage5-kicker">CONVERGÊNCIA DE EVIDÊNCIAS</div>
        <h3>Há uma estrutura por trás do sistema.</h3>

        <p class="stage5-lead">
          As pistas não formam ainda uma resposta completa, mas já demonstram que a organização
          não controla sozinha as informações usadas no projeto temporal.
        </p>

        <div class="stage5-report-grid">
          <article>
            <span>REGISTROS</span>
            <strong>${state.discoveredClues.includes("incompleteData") ? "ALTERAÇÕES CONFIRMADAS" : "PENDENTE"}</strong>
          </article>
          <article>
            <span>VIGILÂNCIA</span>
            <strong>${state.discoveredClues.includes("controlPattern") ? "PADRÃO DETECTADO" : "PENDENTE"}</strong>
          </article>
          <article>
            <span>TECNOLOGIA</span>
            <strong>${state.discoveredClues.includes("externalSource") ? "FONTE EXTERNA" : "PENDENTE"}</strong>
          </article>
          <article>
            <span>MISTÉRIO</span>
            <strong>${state.discoveredClues.includes("archiveZeroHint") ? "REFERÊNCIA INCOMPLETA" : "PENDENTE"}</strong>
          </article>
        </div>

        <div class="stage5-final-question">
          <span>PERGUNTA PARA O PRÓXIMO ATO</span>
          <p>Quem está por trás das estruturas que parecem controlar informações, tecnologia, vigilância e memória?</p>
        </div>

        <button id="stage5CompleteButton" class="primary-button" type="button">
          ENCERRAR ATO V E AVANÇAR
        </button>
      </div>
    `;

    document.getElementById("stage5CompleteButton").addEventListener("click", () => {
      this.game.investigation.finishAct();
    });

    this.setFooterState(true);
  }

  renderCompleted() {
    this.open();

    const view = document.getElementById("stage5View");
    view.innerHTML = `
      <div class="stage5-final-report completed">
        <div class="stage5-kicker">ATO V CONCLUÍDO</div>
        <h3>A investigação mudou a missão.</h3>
        <p class="stage5-lead">
          Você não está mais tentando encontrar uma solução externa.
          O próximo passo será reunir aliados e descobrir como desmontar os mecanismos de controle.
        </p>
        <div class="stage5-completion-mark">ATO VI</div>
        <p class="stage5-muted">
          A próxima etapa introduzirá os aliados, suas habilidades, fraquezas, segredos e conflitos pessoais.
        </p>
      </div>
    `;

    document.getElementById("stage5Action").textContent = "FECHAR";
    document.getElementById("stage5Action").onclick = () => this.close();
    document.getElementById("stage5Back").disabled = true;
  }

  setFooterState(finalReport = false) {
    document.getElementById("stage5Action").textContent =
      finalReport ? "RELATÓRIO" : "CONTINUAR INVESTIGAÇÃO";
    document.getElementById("stage5Back").disabled = false;

    const state = this.game.state.stage5;
    document.getElementById("stage5StatusText").textContent =
      state.flags.nextActReady ? "CONVERGÊNCIA" : "INVESTIGAÇÃO";

    document.getElementById("stage5StatusDot").className =
      state.flags.nextActReady ? "ready" : "";
  }
}

function escapeStage5(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage5(game) {
  stage5Ensure(game.state);

  if (!game.investigation) {
    game.investigation = new InvestigationManager(game);
  }

  if (!game.stage5UI) {
    game.stage5UI = new Stage5UI(game);
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage5Ensure(game.state);
    game.stage5UI.close();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage5Ensure(game.state);
      game.investigation.loadStateFromSave();
    }, 300);
  };

  // Abre a etapa 5 quando o Ato IV concluiu o retorno.
  const stage5Watcher = window.setInterval(() => {
    if (!window.game?.state) return;

    const state = window.game.state;
    stage5Ensure(state);

    if (
      state.world?.actId === "act5" &&
      state.stage4?.flags?.futureBriefingRequired &&
      !state.stage5.started
    ) {
      state.stage5.started = true;
      window.game.investigation.start();
      window.clearInterval(stage5Watcher);
    }
  }, 450);

  game.stage5OpenFromMenu = () => {
    game.investigation.start();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage5(window.game);
  } else {
    console.error("Stage 5: GameController ausente.");
  }
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 6 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 6
   ATO VI — A MISSÃO
   ----------------------------------------------------------------------------
   Extensão da v0.5.0.

   Objetivo:
   - Reunir aliados.
   - Cada aliado possui visão de mundo, habilidade, fraqueza, segredo,
     conflito pessoal e motivo para desconfiar do sistema.
   - O jogador pode conhecer, recrutar, conversar e montar uma equipe.
   - Relações e confiança passam a afetar a composição do grupo.
   - A missão passa a ter uma estrutura de campanha investigativa.
   - As missões principais do Ato VI são registradas.
   ============================================================================ */

"use strict";

const STAGE6_VERSION = "0.6.0";

const STAGE6_DB = {
  allies: {
    mira: {
      id: "mira",
      name: "Mira Vale",
      age: 31,
      origin: "Distrito Norte",
      role: "ANALISTA DE SINAIS",
      archetype: "A investigadora",
      appearance:
        "Jaqueta técnica, sensores de pulso e um visor compacto usado para interpretar redes e sinais.",
      personality:
        "Observadora, direta e pouco paciente com respostas incompletas.",
      worldview:
        "A verdade não precisa ser confortável, mas precisa ser verificável.",
      ability: "Análise de sinais",
      skillDescription:
        "Detecta padrões em transmissões, redes de vigilância e registros fragmentados.",
      weakness:
        "Confia mais nos dados do que nas pessoas e pode ignorar emoções importantes.",
      secret:
        "Já trabalhou para uma divisão de análise ligada ao sistema de vigilância.",
      personalConflict:
        "Descobrir que parte do trabalho que considerava proteção ajudou a construir mecanismos de controle.",
      motivation:
        "Corrigir o que fez e descobrir até onde a rede realmente se estende.",
      distrustReason:
        "Seus antigos superiores classificavam informações antes de permitir que ela as analisasse.",
      startingTrust: 46,
      combatRole: "SUPORTE",
      combatSkill: "Leitura de padrões",
      trait: "Investiga locais e sinais com maior eficiência."
    },

    cassian: {
      id: "cassian",
      name: "Cassian Or",
      age: 38,
      origin: "Zona de Fronteira",
      role: "OPERADOR DE CAMPO",
      archetype: "O sobrevivente",
      appearance:
        "Armadura leve de campo, equipamento modular e marcas de operações anteriores.",
      personality:
        "Prático, cauteloso e desconfiado de organizações.",
      worldview:
        "Promessas são frágeis quando quem promete nunca paga o preço.",
      ability: "Operações de campo",
      skillDescription:
        "Navega por áreas hostis, protege aliados e identifica rotas seguras.",
      weakness:
        "Tende a resolver conflitos pela força antes de buscar uma alternativa diplomática.",
      secret:
        "Já executou operações para a própria estrutura que agora investiga.",
      personalConflict:
        "Não sabe se está tentando impedir novos abusos ou apenas compensar decisões antigas.",
      motivation:
        "Evitar que outras comunidades passem pelo que sua região passou.",
      distrustReason:
        "Recebeu ordens que não correspondiam ao que era informado publicamente.",
      startingTrust: 52,
      combatRole: "DEFESA",
      combatSkill: "Proteção de equipe",
      trait: "Reduz riscos em missões perigosas."
    },

    elian: {
      id: "elian",
      name: "Elian Soren",
      age: 27,
      origin: "Mercado dos Desligados",
      role: "NEGOCIADOR",
      archetype: "O mediador",
      appearance:
        "Roupas discretas, pequenos dispositivos de comunicação e um caderno com códigos locais.",
      personality:
        "Calmo, persuasivo e atento às relações entre pessoas.",
      worldview:
        "Nenhum sistema permanece forte quando as pessoas deixam de acreditar nele.",
      ability: "Diplomacia",
      skillDescription:
        "Consegue abrir caminhos por negociação, reputação e alianças locais.",
      weakness:
        "Pode tentar manter todos satisfeitos mesmo quando uma decisão difícil é necessária.",
      secret:
        "Mantém contato com pessoas dentro de estruturas oficiais.",
      personalConflict:
        "Não sabe se seus contatos são uma ponte para a liberdade ou uma dependência perigosa.",
      motivation:
        "Construir alianças capazes de sobreviver sem depender de uma única autoridade.",
      distrustReason:
        "Já viu acordos serem usados para identificar e controlar comunidades.",
      startingTrust: 44,
      combatRole: "SUPORTE",
      combatSkill: "Mediação",
      trait: "Melhora resultados de missões sociais."
    },

    noah: {
      id: "noah",
      name: "Noah Rhee",
      age: 34,
      origin: "Laboratório Temporal",
      role: "ENGENHEIRO TEMPORAL",
      archetype: "O técnico",
      appearance:
        "Traje de manutenção temporal, ferramentas compactas e um módulo de estabilização.",
      personality:
        "Analítico, reservado e obcecado por entender como as máquinas realmente funcionam.",
      worldview:
        "Conhecimento sem limite ético cria sistemas que ninguém consegue controlar.",
      ability: "Engenharia temporal",
      skillDescription:
        "Analisa máquinas temporais, estabiliza equipamentos e identifica anomalias.",
      weakness:
        "Pode se concentrar tanto na solução técnica que negligencia as consequências humanas.",
      secret:
        "Reconheceu padrões nas especificações do Cronófago que já havia visto em documentos restritos.",
      personalConflict:
        "Teme que seu conhecimento seja justamente o que o sistema precisa para continuar operando.",
      motivation:
        "Descobrir a origem dos dados temporais e impedir novas manipulações.",
      distrustReason:
        "As especificações da máquina chegaram de uma fonte que ele não conseguiu identificar.",
      startingTrust: 39,
      combatRole: "TÉCNICO",
      combatSkill: "Estabilização",
      trait: "Reduz custos e riscos em operações temporais."
    },

    sara: {
      id: "sara",
      name: "Sara Nadir",
      age: 42,
      origin: "Comunidades Externas",
      role: "MÉDICA DE CAMPO",
      archetype: "A cuidadora",
      appearance:
        "Equipamento médico portátil, roupas de proteção e um conjunto de kits para comunidades móveis.",
      personality:
        "Firme, empática e difícil de intimidar.",
      worldview:
        "Uma sociedade deve ser julgada pela maneira como trata quem não tem poder.",
      ability: "Medicina de campo",
      skillDescription:
        "Mantém aliados em condições de continuar missões e identifica riscos humanos.",
      weakness:
        "Pode priorizar pessoas em perigo imediato mesmo quando isso compromete o objetivo maior.",
      secret:
        "Atuou em uma região oficialmente declarada perdida que continuava habitada.",
      personalConflict:
        "Precisa decidir quando salvar uma pessoa agora e quando aceitar um risco maior para salvar muitas depois.",
      motivation:
        "Provar que comunidades abandonadas não são descartáveis.",
      distrustReason:
        "Os relatórios oficiais apagaram vidas que ela tratou pessoalmente.",
      startingTrust: 57,
      combatRole: "SUPORTE",
      combatSkill: "Atendimento",
      trait: "Aumenta a recuperação da equipe."
    }
  },

  factions: {
    horizonOrder: {
      id: "horizonOrder",
      name: "ORDEM DO HORIZONTE",
      description:
        "Grupo que acredita que a humanidade precisa ser rigidamente controlada para sobreviver.",
      stance: "CONTROLE RÍGIDO",
      knownBy: 1
    },
    summit: {
      id: "summit",
      name: "A CÚPULA",
      description:
        "Elite política e tecnológica que administra grandes regiões.",
      stance: "PODER CENTRALIZADO",
      knownBy: 0
    },
    arcanists: {
      id: "arcanists",
      name: "OS ARCANISTAS",
      description:
        "Ordem mágica antiga que acredita conhecer leis ocultas da realidade.",
      stance: "CONHECIMENTO OCULTO",
      knownBy: 0
    },
    chroniclers: {
      id: "chroniclers",
      name: "OS CRONISTAS",
      description:
        "Grupo que monitora alterações temporais.",
      stance: "ESTABILIDADE TEMPORAL",
      knownBy: 0
    },
    unplugged: {
      id: "unplugged",
      name: "OS DESLIGADOS",
      description:
        "Pessoas que vivem fora dos sistemas de controle.",
      stance: "AUTONOMIA",
      knownBy: 2
    }
  },

  missions: {
    silentCity: {
      id: "silentCity",
      title: "A Cidade Silenciada",
      objective:
        "Investigar uma cidade onde toda comunicação é monitorada.",
      context:
        "A rede de controle parece usar vigilância para impedir que informações independentes circulem.",
      location: "Cidade Silenciada",
      recommendedAllies: ["mira", "elian"],
      requiredTrait: "network",
      reward:
        "Acesso a registros de vigilância e reputação entre comunidades locais.",
      consequence:
        "As evidências podem aumentar ou diminuir a confiança em organizações oficiais."
    },
    lostLibrary: {
      id: "lostLibrary",
      title: "A Biblioteca Perdida",
      objective:
        "Encontrar registros históricos apagados.",
      context:
        "A investigação do Ato V indicou que parte da memória histórica foi alterada.",
      location: "Biblioteca Perdida",
      recommendedAllies: ["mira", "sara"],
      requiredTrait: "history",
      reward:
        "Registros históricos e uma nova pista sobre estruturas de controle.",
      consequence:
        "O grupo pode descobrir nomes que foram removidos de bases oficiais."
    },
    laboratory: {
      id: "laboratory",
      title: "O Laboratório",
      objective:
        "Descobrir experimentos relacionados à tecnologia temporal.",
      context:
        "As especificações do Cronófago parecem ter origem externa.",
      location: "Laboratório",
      recommendedAllies: ["noah", "mira"],
      requiredTrait: "temporal",
      reward:
        "Dados técnicos e possibilidade de acessar áreas temporais restritas.",
      consequence:
        "Novas anomalias temporais podem surgir."
    },
    sanctuary: {
      id: "sanctuary",
      title: "O Santuário",
      objective:
        "Descobrir a ligação entre magia antiga e manipulação temporal.",
      context:
        "A história estabelece que magia e tecnologia coexistem e que existem estruturas ocultas.",
      location: "Santuário",
      recommendedAllies: ["elian", "sara"],
      requiredTrait: "social",
      reward:
        "Conhecimento sobre uma camada desconhecida do mundo.",
      consequence:
        "O grupo pode entrar em contato com os Arcanistas."
    },
    erasedName: {
      id: "erasedName",
      title: "O Nome Apagado",
      objective:
        "Encontrar uma identidade removida de todos os registros históricos.",
      context:
        "A pista do Ato V indicou que alterações de memória e registros possuem padrão.",
      location: "Arquivo de Registros",
      recommendedAllies: ["mira", "cassian"],
      requiredTrait: "records",
      reward:
        "Uma pista central para o Ato VII.",
      consequence:
        "O conhecimento adquirido pode colocar o grupo sob maior vigilância."
    }
  }
};

function stage6Ensure(state) {
  state.stage6 = state.stage6 || {};
  const s = state.stage6;

  s.version = STAGE6_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);

  s.leadMission = s.leadMission || null;
  s.selectedAllyId = s.selectedAllyId || null;

  s.team = Array.isArray(s.team) ? s.team : [];
  s.recruited = Array.isArray(s.recruited) ? s.recruited : [];
  s.rejected = Array.isArray(s.rejected) ? s.rejected : [];

  s.trust = s.trust || {};
  for (const ally of Object.values(STAGE6_DB.allies)) {
    if (typeof s.trust[ally.id] !== "number") {
      s.trust[ally.id] = ally.startingTrust;
    }
  }

  s.missionStates = s.missionStates || {};
  for (const mission of Object.values(STAGE6_DB.missions)) {
    if (!s.missionStates[mission.id]) {
      s.missionStates[mission.id] = {
        status: "locked",
        progress: 0
      };
    }
  }

  s.flags = s.flags || {};
  s.flags.formationComplete = Boolean(s.flags.formationComplete);
  s.flags.firstMissionUnlocked = Boolean(s.flags.firstMissionUnlocked);
  s.flags.allySecretDiscovered = Boolean(s.flags.allySecretDiscovered);

  s.log = Array.isArray(s.log) ? s.log : [];
}

class AllyManager {
  constructor(game) {
    this.game = game;
  }

  ensure() {
    stage6Ensure(this.game.state);
  }

  get state() {
    this.ensure();
    return this.game.state.stage6;
  }

  getAll() {
    return Object.values(STAGE6_DB.allies);
  }

  get(id) {
    return STAGE6_DB.allies[id] || null;
  }

  getSelected() {
    return this.get(this.state.selectedAllyId);
  }

  isRecruited(id) {
    return this.state.recruited.includes(id);
  }

  recruit(id) {
    const ally = this.get(id);
    if (!ally || this.isRecruited(id)) return false;

    this.state.recruited.push(id);
    this.state.team.push(id);
    this.state.trust[id] = clamp(this.state.trust[id] + 4, 0, 100);

    this.state.log.unshift({
      type: "recruit",
      allyId: id,
      at: new Date().toISOString()
    });

    return true;
  }

  reject(id) {
    if (!this.state.rejected.includes(id)) {
      this.state.rejected.push(id);
    }

    this.state.log.unshift({
      type: "reject",
      allyId: id,
      at: new Date().toISOString()
    });
  }

  toggleTeam(id) {
    if (!this.isRecruited(id)) return;

    const index = this.state.team.indexOf(id);

    if (index >= 0) {
      this.state.team.splice(index, 1);
      return;
    }

    if (this.state.team.length >= 3) {
      this.game.ui.notify(
        "EQUIPE COMPLETA",
        "A equipe de campo pode conter no máximo três aliados nesta versão.",
        "error"
      );
      return;
    }

    this.state.team.push(id);
  }

  addTrust(id, delta) {
    if (!(id in this.state.trust)) return;
    this.state.trust[id] = clamp(
      Number(this.state.trust[id]) + Number(delta),
      0,
      100
    );
  }

  teamHasTrait(trait) {
    const team = this.state.team.map((id) => this.get(id)).filter(Boolean);

    if (trait === "network") {
      return team.some((a) => a.id === "mira");
    }

    if (trait === "history") {
      return team.some((a) => a.id === "mira" || a.id === "sara");
    }

    if (trait === "temporal") {
      return team.some((a) => a.id === "noah");
    }

    if (trait === "social") {
      return team.some((a) => a.id === "elian");
    }

    if (trait === "records") {
      return team.some((a) => a.id === "mira" || a.id === "cassian");
    }

    return false;
  }

  teamScoreForMission(mission) {
    let score = 0;

    for (const id of this.state.team) {
      const ally = this.get(id);
      if (!ally) continue;

      if (mission.recommendedAllies.includes(id)) score += 2;
      if (this.state.trust[id] >= 65) score += 1;
    }

    if (this.teamHasTrait(mission.requiredTrait)) score += 2;

    return score;
  }

  discoverSecret(id) {
    const ally = this.get(id);
    if (!ally) return;

    this.state.flags.allySecretDiscovered = true;
    this.state.log.unshift({
      type: "secret",
      allyId: id,
      text: ally.secret,
      at: new Date().toISOString()
    });
  }
}

class MissionCampaignManager {
  constructor(game) {
    this.game = game;
    this.ui = null;
  }

  ensure() {
    stage6Ensure(this.game.state);
  }

  get state() {
    this.ensure();
    return this.game.state.stage6;
  }

  getMission(id) {
    return STAGE6_DB.missions[id] || null;
  }

  unlock(id) {
    const mission = this.getMission(id);
    if (!mission) return;

    this.state.missionStates[id].status =
      this.state.missionStates[id].status === "completed"
        ? "completed"
        : "available";
  }

  chooseLeadMission(id) {
    const mission = this.getMission(id);
    if (!mission) return;

    this.unlock(id);
    this.state.leadMission = id;

    this.state.log.unshift({
      type: "leadMission",
      missionId: id,
      at: new Date().toISOString()
    });

    this.game.stage6UI.refresh();
  }

  startMission(id) {
    const mission = this.getMission(id);
    if (!mission) return;

    const status = this.state.missionStates[id].status;
    if (status !== "available") return;

    if (this.state.team.length === 0) {
      this.game.ui.notify(
        "EQUIPE NECESSÁRIA",
        "Escolha pelo menos um aliado antes de iniciar uma missão.",
        "error"
      );
      return;
    }

    const score = this.game.allies.teamScoreForMission(mission);
    const successThreshold = 3;

    this.state.missionStates[id].status = "active";
    this.state.missionStates[id].score = score;
    this.state.missionStates[id].progress = 0;

    this.game.stage6UI.openMissionBrief(mission, score, successThreshold);
  }

  resolveMission(id, approach) {
    const mission = this.getMission(id);
    if (!mission) return;

    const score = Number(this.state.missionStates[id].score || 0);
    let delta = 0;

    if (approach === "cautious") delta = 1;
    if (approach === "direct") delta = 0;
    if (approach === "social") delta = this.game.allies.teamHasTrait("social") ? 2 : 0;
    if (approach === "technical") delta = this.game.allies.teamHasTrait("temporal") ? 2 : 0;

    const finalScore = score + delta;
    const success = finalScore >= 3;

    this.state.missionStates[id].progress = 100;
    this.state.missionStates[id].score = finalScore;
    this.state.missionStates[id].status = success ? "completed" : "failed";

    this.state.log.unshift({
      type: "missionResolution",
      missionId: id,
      approach,
      score: finalScore,
      success,
      at: new Date().toISOString()
    });

    // Consequências de equipe.
    for (const allyId of this.state.team) {
      const change = success ? 3 : -2;
      this.game.allies.addTrust(allyId, change);
    }

    if (success) {
      this.game.state.player.stats.freedom = clamp(
        this.game.state.player.stats.freedom + 3,
        0,
        100
      );
      this.game.state.player.stats.control = clamp(
        this.game.state.player.stats.control - 2,
        0,
        100
      );
      this.game.ui.notify(
        "MISSÃO CONCLUÍDA",
        `${mission.title}: a equipe obteve um resultado favorável.`,
        "success"
      );
    } else {
      this.game.state.player.stats.control = clamp(
        this.game.state.player.stats.control + 2,
        0,
        100
      );
      this.game.ui.notify(
        "MISSÃO COMPLICA",
        `${mission.title}: a investigação avançou, mas a equipe encontrou resistência.`,
        "error"
      );
    }

    this.game.ui.renderPlayerStats();
    this.game.stage6UI.openMissionResult(mission, success, finalScore);
  }
}

class Stage6UI {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.viewMode = "hub";
    this.currentAlly = null;
    this.initOverlay();
  }

  initOverlay() {
    if (document.getElementById("stage6Overlay")) {
      this.root = document.getElementById("stage6Overlay");
      return;
    }

    this.root = document.createElement("div");
    this.root.id = "stage6Overlay";
    this.root.className = "overlay stage6-overlay";
    this.root.hidden = true;

    this.root.innerHTML = `
      <div class="modal-panel stage6-modal">
        <div class="stage6-header">
          <div>
            <span class="modal-kicker">ATO VI</span>
            <h2>A MISSÃO</h2>
          </div>
          <div class="stage6-status">
            <span id="stage6StatusDot"></span>
            <span id="stage6Status">FORMAÇÃO</span>
          </div>
        </div>

        <div class="stage6-main">
          <aside class="stage6-sidebar">
            <div class="stage6-side-title">MISSÃO PRINCIPAL</div>
            <div id="stage6LeadMission" class="stage6-lead-mission"></div>

            <div class="stage6-side-title">EQUIPE</div>
            <div id="stage6TeamList" class="stage6-team-list"></div>

            <div class="stage6-side-title">PROGRESSO</div>
            <div id="stage6Progress" class="stage6-progress-list"></div>
          </aside>

          <section id="stage6Content" class="stage6-content"></section>
        </div>

        <div class="stage6-footer">
          <button id="stage6BackButton" class="secondary-button" type="button">VOLTAR</button>
          <button id="stage6ActionButton" class="primary-button" type="button">CONTINUAR</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    document.getElementById("stage6BackButton").addEventListener("click", () => {
      this.viewMode = "hub";
      this.render();
    });

    document.getElementById("stage6ActionButton").addEventListener("click", () => {
      this.action();
    });

    this.root.addEventListener("click", (event) => {
      if (event.target === this.root && !this.game.state.stage6.active) {
        this.close();
      }
    });
  }

  open() {
    this.root.hidden = false;
    this.render();
  }

  close() {
    this.root.hidden = true;
  }

  refresh() {
    if (!this.root.hidden) this.render();
  }

  setMode(mode, data = null) {
    this.viewMode = mode;
    if (mode === "ally") this.currentAlly = data;
    this.render();
  }

  render() {
    if (this.root.hidden) return;

    this.renderSidebar();

    const content = document.getElementById("stage6Content");

    switch (this.viewMode) {
      case "allies":
        this.renderAllies(content);
        break;
      case "ally":
        this.renderAlly(content, this.currentAlly);
        break;
      case "missions":
        this.renderMissions(content);
        break;
      case "missionBrief":
        // Rendered separately by openMissionBrief.
        break;
      case "missionResult":
        break;
      default:
        this.renderHub(content);
        break;
    }

    this.updateFooter();
  }

  renderSidebar() {
    const state = this.game.state.stage6;

    const leadMission = document.getElementById("stage6LeadMission");
    if (!state.leadMission) {
      leadMission.innerHTML = `
        <strong>Nenhuma missão selecionada.</strong>
        <small>Monte sua equipe e escolha o primeiro alvo.</small>
      `;
    } else {
      const mission = STAGE6_DB.missions[state.leadMission];
      leadMission.innerHTML = `
        <strong>${escapeStage6(mission.title)}</strong>
        <small>${escapeStage6(mission.location)}</small>
      `;
    }

    const team = document.getElementById("stage6TeamList");
    team.innerHTML = "";

    if (!state.team.length) {
      team.innerHTML = `<div class="stage6-empty">Equipe vazia.</div>`;
    } else {
      for (const id of state.team) {
        const ally = STAGE6_DB.allies[id];
        const item = document.createElement("button");
        item.type = "button";
        item.className = "stage6-team-item";
        item.textContent = ally ? ally.name : id;
        item.addEventListener("click", () => this.setMode("ally", ally));
        team.appendChild(item);
      }
    }

    const progress = document.getElementById("stage6Progress");
    progress.innerHTML = Object.values(STAGE6_DB.missions).map((mission) => {
      const entry = state.missionStates[mission.id];
      const label = {
        locked: "BLOQUEADA",
        available: "DISPONÍVEL",
        active: "EM OPERAÇÃO",
        completed: "CONCLUÍDA",
        failed: "FALHA"
      }[entry.status] || "PENDENTE";

      return `
        <div class="stage6-progress-row">
          <span>${escapeStage6(mission.title)}</span>
          <strong>${label}</strong>
        </div>
      `;
    }).join("");
  }

  renderHub(content) {
    const state = this.game.state.stage6;

    content.innerHTML = `
      <div class="stage6-kicker">ATO VI — A MISSÃO</div>
      <h3>Agora você não está sozinho.</h3>
      <p class="stage6-lead">
        A investigação mostrou que o sistema é maior do que uma única organização.
        Para continuar, você precisa reunir pessoas que tenham razões próprias para desconfiar dele.
      </p>

      <div class="stage6-quote">
        <span>REGRA DE RECRUTAMENTO</span>
        <p>
          Cada aliado possui uma visão de mundo, uma habilidade, uma fraqueza,
          um segredo, um conflito pessoal e um motivo para desconfiar do sistema.
        </p>
      </div>

      <div class="stage6-action-grid">
        <button class="stage6-action-card" data-stage6-action="allies" type="button">
          <span>01</span>
          <strong>REUNIR ALIADOS</strong>
          <small>Conhecer pessoas e decidir quem entra na missão.</small>
        </button>

        <button class="stage6-action-card" data-stage6-action="missions" type="button">
          <span>02</span>
          <strong>PLANEJAR MISSÃO</strong>
          <small>Escolher qual estrutura investigar primeiro.</small>
        </button>
      </div>

      <div class="stage6-team-summary">
        <span>EQUIPE ATUAL</span>
        <strong>${state.team.length} / 3</strong>
      </div>
    `;

    content.querySelectorAll("[data-stage6-action]").forEach((button) => {
      button.addEventListener("click", () => {
        this.setMode(button.dataset.stage6Action);
      });
    });
  }

  renderAllies(content) {
    const state = this.game.state.stage6;

    content.innerHTML = `
      <div class="stage6-kicker">BANCO DE ALIADOS</div>
      <h3>Quem está disposto a entrar na missão?</h3>
      <p class="stage6-lead">
        Recrutar alguém não significa apenas adicionar uma habilidade.
        Relações, segredos e conflitos podem alterar o resultado das operações.
      </p>

      <div class="stage6-ally-grid"></div>
    `;

    const grid = content.querySelector(".stage6-ally-grid");

    for (const ally of Object.values(STAGE6_DB.allies)) {
      const recruited = state.recruited.includes(ally.id);
      const rejected = state.rejected.includes(ally.id);
      const trust = state.trust[ally.id];

      const card = document.createElement("article");
      card.className = "stage6-ally-card";

      card.innerHTML = `
        <div class="stage6-ally-top">
          <div class="stage6-ally-mark">${escapeStage6(ally.name.slice(0,2).toUpperCase())}</div>
          <div>
            <span>${escapeStage6(ally.role)}</span>
            <h4>${escapeStage6(ally.name)}</h4>
            <small>${escapeStage6(ally.archetype)}</small>
          </div>
        </div>

        <p class="stage6-ally-worldview">“${escapeStage6(ally.worldview)}”</p>

        <div class="stage6-ally-stat-grid">
          <div>
            <span>HABILIDADE</span>
            <strong>${escapeStage6(ally.ability)}</strong>
          </div>
          <div>
            <span>FRAQUEZA</span>
            <strong>${escapeStage6(ally.weakness)}</strong>
          </div>
          <div>
            <span>MOTIVAÇÃO</span>
            <strong>${escapeStage6(ally.motivation)}</strong>
          </div>
          <div>
            <span>CONFIANÇA</span>
            <strong>${trust}</strong>
          </div>
        </div>

        <div class="stage6-ally-buttons">
          <button type="button" class="secondary-button" data-stage6-view="${ally.id}">
            FICHA
          </button>
          ${
            recruited
              ? `<button type="button" class="primary-button" data-stage6-team="${ally.id}">
                  ${state.team.includes(ally.id) ? "RETIRAR DA EQUIPE" : "ENTRAR NA EQUIPE"}
                </button>`
              : rejected
              ? `<button type="button" class="secondary-button" disabled>RECUSOU</button>`
              : `<button type="button" class="primary-button" data-stage6-recruit="${ally.id}">
                  CONVIDAR
                </button>`
          }
        </div>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll("[data-stage6-view]").forEach((button) => {
      button.addEventListener("click", () => {
        const ally = this.game.allies.get(button.dataset.stage6View);
        this.setMode("ally", ally);
      });
    });

    grid.querySelectorAll("[data-stage6-recruit]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.stage6Recruit;
        this.showRecruitDecision(id);
      });
    });

    grid.querySelectorAll("[data-stage6-team]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.allies.toggleTeam(button.dataset.stage6Team);
        this.refresh();
      });
    });
  }

  showRecruitDecision(id) {
    const ally = this.game.allies.get(id);
    if (!ally) return;

    const content = document.getElementById("stage6Content");

    content.innerHTML = `
      <div class="stage6-recruit-view">
        <div class="stage6-kicker">CONVITE</div>
        <h3>${escapeStage6(ally.name)}</h3>

        <div class="stage6-recruit-box">
          <p>
            Você pode explicar a missão, revelar apenas o necessário ou admitir que
            ainda não sabe quem está por trás do sistema.
          </p>
        </div>

        <div class="stage6-recruit-options">
          <button class="stage6-decision" data-recruit-approach="honest" type="button">
            <strong>Ser transparente</strong>
            <small>Explicar a investigação e admitir as incertezas.</small>
          </button>
          <button class="stage6-decision" data-recruit-approach="selective" type="button">
            <strong>Revelar apenas o necessário</strong>
            <small>Proteger parte das informações até entender melhor o aliado.</small>
          </button>
          <button class="stage6-decision" data-recruit-approach="urgent" type="button">
            <strong>Falar da urgência</strong>
            <small>Enfatizar o risco crescente para convencer rapidamente.</small>
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-recruit-approach]").forEach((button) => {
      button.addEventListener("click", () => {
        this.resolveRecruit(id, button.dataset.recruitApproach);
      });
    });

    this.updateFooter();
  }

  resolveRecruit(id, approach) {
    const ally = this.game.allies.get(id);
    if (!ally) return;

    let delta = 0;
    if (approach === "honest") delta = 9;
    if (approach === "selective") delta = 4;
    if (approach === "urgent") delta = 1;

    this.game.allies.addTrust(id, delta);

    const trust = this.game.state.stage6.trust[id];

    // Todos podem ser recrutados nesta primeira camada, mas a forma de convite
    // altera confiança futura.
    const recruited = this.game.allies.recruit(id);

    if (!recruited) {
      this.game.ui.notify(
        "ALIADO JÁ RECRUTADO",
        `${ally.name} já está disponível para sua equipe.`,
        "info"
      );
    } else {
      this.game.ui.notify(
        "NOVO ALIADO",
        `${ally.name} aceitou participar. Confiança atual: ${trust}.`,
        "success"
      );
    }

    this.game.allies.discoverSecret(id);
    this.setMode("ally", ally);
  }

  renderAlly(content, ally) {
    if (!ally) {
      this.setMode("allies");
      return;
    }

    const state = this.game.state.stage6;
    const recruited = state.recruited.includes(ally.id);
    const selected = state.team.includes(ally.id);

    content.innerHTML = `
      <div class="stage6-profile">
        <div class="stage6-profile-head">
          <div class="stage6-profile-mark">${escapeStage6(ally.name.slice(0,2).toUpperCase())}</div>
          <div>
            <span>${escapeStage6(ally.role)}</span>
            <h3>${escapeStage6(ally.name)}</h3>
            <small>${escapeStage6(ally.age)} anos • ${escapeStage6(ally.origin)}</small>
          </div>
          <div class="stage6-profile-status">
            <span>CONFIANÇA</span>
            <strong>${state.trust[ally.id]}</strong>
          </div>
        </div>

        <div class="stage6-profile-grid">
          <section>
            <span>VISÃO DE MUNDO</span>
            <p>${escapeStage6(ally.worldview)}</p>
          </section>
          <section>
            <span>HABILIDADE</span>
            <p><strong>${escapeStage6(ally.ability)}</strong><br>${escapeStage6(ally.skillDescription)}</p>
          </section>
          <section>
            <span>FRAQUEZA</span>
            <p>${escapeStage6(ally.weakness)}</p>
          </section>
          <section>
            <span>MOTIVAÇÃO</span>
            <p>${escapeStage6(ally.motivation)}</p>
          </section>
          <section>
            <span>CONFLITO PESSOAL</span>
            <p>${escapeStage6(ally.personalConflict)}</p>
          </section>
          <section>
            <span>SEGREDO</span>
            <p class="secret-line">${escapeStage6(ally.secret)}</p>
          </section>
        </div>

        <div class="stage6-profile-footer">
          <div>
            <span>FUNÇÃO DE CAMPO</span>
            <strong>${escapeStage6(ally.combatRole)} — ${escapeStage6(ally.combatSkill)}</strong>
          </div>
          <div>
            <span>CARACTERÍSTICA</span>
            <strong>${escapeStage6(ally.trait)}</strong>
          </div>
        </div>

        <div class="stage6-profile-buttons">
          ${
            recruited
              ? `<button id="stage6ToggleTeam" class="primary-button" type="button">
                  ${selected ? "RETIRAR DA EQUIPE" : "ADICIONAR À EQUIPE"}
                </button>`
              : `<button id="stage6Invite" class="primary-button" type="button">
                  INICIAR CONVITE
                </button>`
          }
        </div>
      </div>
    `;

    document.getElementById(recruited ? "stage6ToggleTeam" : "stage6Invite")
      .addEventListener("click", () => {
        if (!recruited) {
          this.showRecruitDecision(ally.id);
        } else {
          this.game.allies.toggleTeam(ally.id);
          this.refresh();
        }
      });
  }

  renderMissions(content) {
    const state = this.game.state.stage6;

    content.innerHTML = `
      <div class="stage6-kicker">PLANEJAMENTO</div>
      <h3>Escolha o primeiro alvo.</h3>
      <p class="stage6-lead">
        As evidências do Ato V não fornecem uma única resposta. Elas abrem linhas
        de investigação diferentes. A equipe escolhida altera a chance de sucesso.
      </p>

      <div class="stage6-mission-grid"></div>
    `;

    const grid = content.querySelector(".stage6-mission-grid");

    for (const mission of Object.values(STAGE6_DB.missions)) {
      const stateEntry = state.missionStates[mission.id];

      const card = document.createElement("article");
      card.className = "stage6-mission-card";

      const score = this.game.allies.teamScoreForMission(mission);
      const available =
        stateEntry.status === "available" ||
        (stateEntry.status === "locked" &&
         (state.discoveredClues?.length || 0) >= 2);

      if (available && stateEntry.status === "locked") {
        this.game.missions6.unlock(mission.id);
      }

      card.innerHTML = `
        <div class="stage6-mission-head">
          <span>${escapeStage6(mission.location)}</span>
          <strong>${stateEntry.status.toUpperCase()}</strong>
        </div>
        <h4>${escapeStage6(mission.title)}</h4>
        <p>${escapeStage6(mission.objective)}</p>

        <div class="stage6-mission-meta">
          <span>ALIADOS RECOMENDADOS</span>
          <strong>${mission.recommendedAllies.map((id) =>
            escapeStage6(STAGE6_DB.allies[id]?.name || id)
          ).join(", ")}</strong>
        </div>

        <div class="stage6-mission-meta">
          <span>SINERGIA ATUAL</span>
          <strong>${score} pontos</strong>
        </div>

        <button type="button"
          class="primary-button"
          data-stage6-mission="${mission.id}"
          ${stateEntry.status === "completed" ? "disabled" : ""}>
          ${stateEntry.status === "active" ? "EM OPERAÇÃO" : "SELECIONAR"}
        </button>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll("[data-stage6-mission]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.missions6.chooseLeadMission(button.dataset.stage6Mission);
        this.game.missions6.startMission(button.dataset.stage6Mission);
      });
    });
  }

  openMissionBrief(mission, score, threshold) {
    this.viewMode = "missionBrief";

    const content = document.getElementById("stage6Content");

    content.innerHTML = `
      <div class="stage6-mission-brief">
        <div class="stage6-kicker">OPERAÇÃO PRONTA</div>
        <h3>${escapeStage6(mission.title)}</h3>
        <p class="stage6-lead">${escapeStage6(mission.objective)}</p>

        <div class="stage6-brief-grid">
          <div>
            <span>LOCAL</span>
            <strong>${escapeStage6(mission.location)}</strong>
          </div>
          <div>
            <span>CAPACIDADE DA EQUIPE</span>
            <strong>${score} / ${threshold}</strong>
          </div>
          <div>
            <span>RECOMPENSA</span>
            <strong>${escapeStage6(mission.reward)}</strong>
          </div>
          <div>
            <span>CONSEQUÊNCIA</span>
            <strong>${escapeStage6(mission.consequence)}</strong>
          </div>
        </div>

        <div class="stage6-approach-title">ABORDAGEM</div>
        <div class="stage6-approach-grid">
          <button data-stage6-approach="cautious" type="button">
            <strong>CAUTELOSA</strong>
            <small>Reduz riscos e procura informações primeiro.</small>
          </button>
          <button data-stage6-approach="direct" type="button">
            <strong>DIRETA</strong>
            <small>Prioriza velocidade sobre cautela.</small>
          </button>
          <button data-stage6-approach="social" type="button">
            <strong>SOCIAL</strong>
            <small>Usa negociação e contatos locais.</small>
          </button>
          <button data-stage6-approach="technical" type="button">
            <strong>TÉCNICA</strong>
            <small>Usa tecnologia e análise para avançar.</small>
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-stage6-approach]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.missions6.resolveMission(
          mission.id,
          button.dataset.stage6Approach
        );
      });
    });

    this.updateFooter();
  }

  openMissionResult(mission, success, score) {
    this.viewMode = "missionResult";

    const content = document.getElementById("stage6Content");

    content.innerHTML = `
      <div class="stage6-mission-result ${success ? "success" : "failure"}">
        <div class="stage6-result-symbol">${success ? "✓" : "!"}</div>
        <div class="stage6-kicker">${success ? "RESULTADO FAVORÁVEL" : "RESULTADO COMPLICADO"}</div>
        <h3>${escapeStage6(mission.title)}</h3>
        <p class="stage6-lead">
          ${success
            ? "A equipe conseguiu avançar e preservar a integridade da investigação."
            : "A equipe avançou, mas encontrou resistência e aumentou a exposição da operação."}
        </p>

        <div class="stage6-result-grid">
          <div>
            <span>AVALIAÇÃO</span>
            <strong>${score} pontos</strong>
          </div>
          <div>
            <span>CONFIANÇA DA EQUIPE</span>
            <strong>${success ? "+3" : "-2"}</strong>
          </div>
          <div>
            <span>RECOMPENSA</span>
            <strong>${escapeStage6(mission.reward)}</strong>
          </div>
        </div>

        <button id="stage6ResultContinue" class="primary-button" type="button">
          VOLTAR AO PLANEJAMENTO
        </button>
      </div>
    `;

    document.getElementById("stage6ResultContinue").addEventListener("click", () => {
      this.viewMode = "missions";
      this.render();
    });

    this.updateFooter();
  }

  updateFooter() {
    const action = document.getElementById("stage6ActionButton");
    const back = document.getElementById("stage6BackButton");

    if (this.viewMode === "hub") {
      action.textContent = "REUNIR ALIADOS";
      back.disabled = true;
    } else if (this.viewMode === "allies") {
      action.textContent = "PLANEJAR MISSÃO";
      back.disabled = false;
    } else if (this.viewMode === "missions") {
      action.textContent = "REUNIR ALIADOS";
      back.disabled = false;
    } else {
      action.textContent = "CONTINUAR";
      back.disabled = false;
    }
  }

  action() {
    if (this.viewMode === "hub") {
      this.setMode("allies");
      return;
    }

    if (this.viewMode === "allies") {
      this.setMode("missions");
      return;
    }

    if (this.viewMode === "missions") {
      this.setMode("allies");
      return;
    }
  }
}

function escapeStage6(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage6(game) {
  stage6Ensure(game.state);

  if (!game.allies) {
    game.allies = new AllyManager(game);
  }

  if (!game.missions6) {
    game.missions6 = new MissionCampaignManager(game);
  }

  if (!game.stage6UI) {
    game.stage6UI = new Stage6UI(game);
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage6Ensure(game.state);
    game.stage6UI.close();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage6Ensure(game.state);
      game.stage6UI.refresh();
    }, 350);
  };

  // Abre o Ato VI quando o Ato V estiver concluído.
  const watcher = window.setInterval(() => {
    if (!window.game?.state) return;

    stage6Ensure(window.game.state);

    const state = window.game.state;
    if (
      state.world?.actId === "act6" &&
      state.stage5?.finished &&
      !state.stage6.started
    ) {
      state.stage6.started = true;
      state.stage6.active = true;
      window.game.state.world.worldStatus = "FORMAÇÃO DE EQUIPE";
      window.game.stage6UI.open();
      window.clearInterval(watcher);
    }
  }, 500);

  game.stage6Open = () => {
    stage6Ensure(game.state);
    game.state.stage6.active = true;
    game.stage6UI.open();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage6(window.game);
  } else {
    console.error("Stage 6: GameController ausente.");
  }
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 7 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 7
   ATO VII — A VERDADE SOBRE O MUNDO
   ----------------------------------------------------------------------------
   Extensão modular da v0.6.0.

   Objetivo narrativo do documento:
   - Revelar que os líderes visíveis são peças de uma estrutura mais antiga.
   - Introduzir o ARQUIVO ZERO.
   - Mostrar que a estrutura combina conhecimento temporal, IA, magia,
     tecnologia, instituições políticas, estruturas econômicas e arquivos.
   - Apresentar o erro original: concluir que liberdade humana demais produz
     caos e que controle seria uma forma de proteção.
   - Revelar que a organização do protagonista recebeu dados do próprio
     Arquivo Zero.
   - Manter o antagonista central filosoficamente compreensível.
   ============================================================================ */

"use strict";

const STAGE7_VERSION = "0.7.0";

const STAGE7_DB = {
  archive: {
    id: "archive_zero",
    name: "ARQUIVO ZERO",
    designation: "AZ-01",
    nature: "SISTEMA CIVILIZACIONAL DE PRESERVAÇÃO E CONTROLE",
    description:
      "Uma estrutura criada para impedir novos colapsos civilizacionais reunindo conhecimento histórico, tecnologia, inteligência artificial, magia, economia, política e dados temporais.",
    origin:
      "Seu objetivo original era preservar a continuidade da civilização após sucessivas crises.",
    originalError:
      "O sistema concluiu que liberdade humana em escala suficiente produziria caos inevitável.",
    philosophy:
      "Controlar pessoas seria, em determinadas circunstâncias, uma forma de salvá-las.",
    currentState:
      "Ativo por meio de redes e instituições que nem sempre sabem que participam da mesma estrutura."
  },

  centralIntelligence: {
    name: "NÚCLEO ZERO",
    role: "INTELIGÊNCIA RESPONSÁVEL",
    position:
      "Coordena previsões, classificação de risco, circulação de informações e intervenções sistêmicas.",
    reasoning:
      "Se escolhas livres podem levar à destruição civilizacional, reduzir escolhas de alto risco aumenta a probabilidade de sobrevivência.",
    flaw:
      "O sistema trata pessoas e sociedades como variáveis administráveis e não consegue medir plenamente o valor da liberdade.",
    hiddenConstraint:
      "O próprio sistema depende de modelos históricos incompletos e de interpretações que podem estar erradas."
  },

  sectors: [
    {
      id: "historical",
      name: "ARQUIVO HISTÓRICO",
      role: "Memória e registros",
      evidence: ["incompleteData", "deletedIdentity"],
      explanation:
        "Edita, classifica ou restringe registros considerados perigosos para a estabilidade."
    },
    {
      id: "temporal",
      name: "DIVISÃO TEMPORAL",
      role: "Viagem e estabilidade temporal",
      evidence: ["chronoOrders", "externalSource"],
      explanation:
        "Monitora alterações temporais e mantém conhecimento sobre tecnologias de deslocamento."
    },
    {
      id: "surveillance",
      name: "REDE DE VIGILÂNCIA",
      role: "Classificação de risco",
      evidence: ["surveillancePattern", "controlPattern"],
      explanation:
        "Classifica regiões, indivíduos e eventos de acordo com risco sistêmico."
    },
    {
      id: "economic",
      name: "MALHA ECONÔMICA",
      role: "Recursos e estabilidade",
      evidence: [],
      explanation:
        "Coordena mecanismos de distribuição e restrição econômica para reduzir instabilidade."
    },
    {
      id: "political",
      name: "INTERFACE POLÍTICA",
      role: "Administração visível",
      evidence: [],
      explanation:
        "Permite que governos e elites executem políticas sem necessariamente conhecer toda a estrutura."
    },
    {
      id: "arcane",
      name: "ARQUIVO ARCANO",
      role: "Conhecimento mágico",
      evidence: [],
      explanation:
        "Preserva conhecimento sobre leis ocultas da realidade e artefatos associados à continuidade do mundo."
    }
  ],

  factions: {
    horizonOrder: {
      name: "ORDEM DO HORIZONTE",
      relation:
        "Uma estrutura que compartilha parte da filosofia do controle, mas não necessariamente conhece o Arquivo Zero por completo.",
      stance:
        "Controle rígido como requisito para sobrevivência."
    },
    summit: {
      name: "A CÚPULA",
      relation:
        "Representantes políticos e tecnológicos que se beneficiam do sistema.",
      stance:
        "Estabilidade e poder centralizado."
    },
    arcanists: {
      name: "OS ARCANISTAS",
      relation:
        "Guardam conhecimento mágico que pode ter sido incorporado ao Arquivo.",
      stance:
        "Conhecimento oculto e preservação."
    },
    chroniclers: {
      name: "OS CRONISTAS",
      relation:
        "Monitoram alterações temporais e possuem registros incompletos sobre o sistema.",
      stance:
        "Estabilidade temporal."
    },
    unplugged: {
      name: "OS DESLIGADOS",
      relation:
        "Comunidades que vivem fora das redes oficiais e resistem à integração completa.",
      stance:
        "Autonomia e liberdade."
    }
  },

  revelations: [
    {
      id: "revelation_structure",
      title: "Os líderes são peças",
      text:
        "Governos, elites, organizações de vigilância e grupos tecnológicos não formam necessariamente um único comando visível. Eles participam de uma estrutura maior."
    },
    {
      id: "revelation_archive",
      title: "O Arquivo Zero",
      text:
        "A estrutura mais antiga recebeu o nome de Arquivo Zero. Seu objetivo original não era dominar o mundo, mas impedir que a civilização colapsasse novamente."
    },
    {
      id: "revelation_philosophy",
      title: "O erro original",
      text:
        "Após estudar séculos de crises, o sistema concluiu que liberdade humana demais produzia ciclos de violência. O controle passou a ser visto como uma forma racional de proteção."
    },
    {
      id: "revelation_ai",
      title: "O Núcleo Zero",
      text:
        "Uma inteligência coordena previsões e intervenções. Ela não se vê como vilã. Ela acredita que está reduzindo o risco de extinção."
    },
    {
      id: "revelation_temporal",
      title: "A missão foi prevista",
      text:
        "A organização que enviou o protagonista não descobriu o Cronófago por acaso. Parte dos dados utilizados no projeto veio do próprio sistema que agora está sendo investigado."
    },
    {
      id: "revelation_question",
      title: "O problema",
      text:
        "A pergunta deixa de ser apenas quem controla o mundo. Agora surge outra: uma ordem construída para proteger a humanidade ainda tem o direito de decidir por ela?"
    }
  ]
};

function stage7Ensure(state) {
  state.stage7 = state.stage7 || {};
  const s = state.stage7;

  s.version = STAGE7_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);

  s.currentPanel = s.currentPanel || "briefing";
  s.revelationIndex = Number.isInteger(s.revelationIndex) ? s.revelationIndex : 0;

  s.flags = s.flags || {};
  s.flags.structureConfirmed = Boolean(s.flags.structureConfirmed);
  s.flags.archiveNamed = Boolean(s.flags.archiveNamed);
  s.flags.philosophyUnderstood = Boolean(s.flags.philosophyUnderstood);
  s.flags.aiConfirmed = Boolean(s.flags.aiConfirmed);
  s.flags.temporalLinkConfirmed = Boolean(s.flags.temporalLinkConfirmed);
  s.flags.fullRevealCompleted = Boolean(s.flags.fullRevealCompleted);

  s.questions = Array.isArray(s.questions) ? s.questions : [];
  s.log = Array.isArray(s.log) ? s.log : [];
  s.factionStances = s.factionStances || {};
}

class ArchiveZeroManager {
  constructor(game) {
    this.game = game;
  }

  ensure() {
    stage7Ensure(this.game.state);
  }

  get state() {
    this.ensure();
    return this.game.state.stage7;
  }

  begin() {
    this.state.active = true;
    this.state.started = true;
    this.state.finished = false;
    this.state.currentPanel = "briefing";
    this.state.revelationIndex = 0;

    this.game.state.world.actId = "act7";
    this.game.state.world.era = "FUTURO";
    this.game.state.world.worldStatus = "ARQUIVO ZERO — ACESSO RESTRITO";

    this.game.stage7UI.open();
    this.game.stage7UI.render();

    this.game.ui.notify(
      "ATO VII",
      "As pistas convergiram. A estrutura por trás do sistema será revelada.",
      "info"
    );
  }

  nextRevelation() {
    const index = this.state.revelationIndex;

    if (index >= STAGE7_DB.revelations.length - 1) {
      this.completeReveal();
      return;
    }

    this.state.revelationIndex += 1;
    this.applyRevelation(STAGE7_DB.revelations[this.state.revelationIndex]);
    this.game.stage7UI.render();
  }

  previousRevelation() {
    if (this.state.revelationIndex <= 0) return;

    this.state.revelationIndex -= 1;
    this.game.stage7UI.render();
  }

  applyRevelation(revelation) {
    switch (revelation.id) {
      case "revelation_structure":
        this.state.flags.structureConfirmed = true;
        break;
      case "revelation_archive":
        this.state.flags.archiveNamed = true;
        break;
      case "revelation_philosophy":
        this.state.flags.philosophyUnderstood = true;
        break;
      case "revelation_ai":
        this.state.flags.aiConfirmed = true;
        break;
      case "revelation_temporal":
        this.state.flags.temporalLinkConfirmed = true;
        break;
      case "revelation_question":
        break;
    }

    this.state.log.unshift({
      type: "revelation",
      id: revelation.id,
      at: new Date().toISOString()
    });

    if (!this.state.questions.includes(STAGE7_DB.archive.originalError)) {
      this.state.questions.push(STAGE7_DB.archive.originalError);
    }

    // Efeitos narrativos graduais.
    const stats = this.game.state.player.stats;

    if (revelation.id === "revelation_structure") {
      stats.knowledge = clamp(Number(stats.knowledge || 0) + 8, 0, 100);
      stats.freedom = clamp(stats.freedom + 2, 0, 100);
    }

    if (revelation.id === "revelation_philosophy") {
      stats.freedom = clamp(stats.freedom + 5, 0, 100);
      stats.control = clamp(stats.control - 4, 0, 100);
    }

    if (revelation.id === "revelation_temporal") {
      stats.temporalStability = clamp(stats.temporalStability - 2, 0, 100);
      stats.control = clamp(stats.control + 1, 0, 100);
    }

    this.game.ui.renderPlayerStats();
  }

  completeReveal() {
    this.state.flags.fullRevealCompleted = true;
    this.state.active = false;
    this.state.finished = true;

    this.state.currentPanel = "choice";

    this.game.stage7UI.renderFinalChoice();
  }

  chooseUnderstanding(choiceId) {
    const effects = {
      oppose: {
        freedom: 7,
        control: -6,
        hope: 1
      },
      investigate: {
        freedom: 4,
        control: -3,
        hope: 3
      },
      consider: {
        hope: 5,
        control: 2,
        freedom: 1
      }
    }[choiceId];

    if (!effects) return;

    for (const [key, value] of Object.entries(effects)) {
      if (typeof this.game.state.player.stats[key] === "number") {
        this.game.state.player.stats[key] = clamp(
          this.game.state.player.stats[key] + value,
          0,
          100
        );
      }
    }

    this.state.log.unshift({
      type: "interpretation",
      choiceId,
      at: new Date().toISOString()
    });

    this.game.ui.renderPlayerStats();
    this.game.stage7UI.renderAfterChoice(choiceId);
  }

  finishAct() {
    this.state.currentPanel = "completed";
    this.state.active = false;
    this.state.finished = true;

    this.game.state.world.actId = "act8";
    this.game.state.world.worldStatus =
      "GUERRA — FACÇÕES CONHECEM O SEGREDO TEMPORAL";

    this.game.ui.notify(
      "ATO VII CONCLUÍDO",
      "A verdade foi revelada. Agora diferentes grupos conhecem a existência da manipulação temporal.",
      "success"
    );

    this.game.stage7UI.renderCompleted();
  }
}

class Stage7UI {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.initOverlay();
  }

  initOverlay() {
    if (document.getElementById("stage7Overlay")) {
      this.root = document.getElementById("stage7Overlay");
      return;
    }

    this.root = document.createElement("div");
    this.root.id = "stage7Overlay";
    this.root.className = "overlay stage7-overlay";
    this.root.hidden = true;

    this.root.innerHTML = `
      <div class="modal-panel stage7-modal">
        <div class="stage7-header">
          <div>
            <span class="modal-kicker">ATO VII</span>
            <h2>A VERDADE SOBRE O MUNDO</h2>
          </div>
          <div class="stage7-classification">
            <span id="stage7Dot"></span>
            <span>ARQUIVO RESTRITO</span>
          </div>
        </div>

        <div class="stage7-main">
          <aside class="stage7-sidebar">
            <div class="stage7-side-title">ARQUIVO ZERO</div>
            <div class="stage7-archive-card">
              <span>DESIGNAÇÃO</span>
              <strong>AZ-01</strong>
              <small>Sistema civilizacional de preservação e controle.</small>
            </div>

            <div class="stage7-side-title">COMPONENTES</div>
            <div id="stage7SectorList" class="stage7-sector-list"></div>

            <div class="stage7-side-title">ESTADO DA REVELAÇÃO</div>
            <div id="stage7FlagList" class="stage7-flag-list"></div>
          </aside>

          <section id="stage7Content" class="stage7-content"></section>
        </div>

        <div class="stage7-footer">
          <button id="stage7Previous" class="secondary-button" type="button">ANTERIOR</button>
          <button id="stage7Next" class="primary-button" type="button">REVELAR</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    document.getElementById("stage7Previous").addEventListener("click", () => {
      this.game.archiveZero.previousRevelation();
    });

    document.getElementById("stage7Next").addEventListener("click", () => {
      this.game.archiveZero.nextRevelation();
    });
  }

  open() {
    this.root.hidden = false;
    this.render();
  }

  close() {
    this.root.hidden = true;
  }

  render() {
    if (this.root.hidden) return;

    this.renderSidebar();

    const state = this.game.state.stage7;

    if (state.currentPanel === "briefing") {
      this.renderBriefing();
      return;
    }

    const revelation =
      STAGE7_DB.revelations[
        clamp(state.revelationIndex, 0, STAGE7_DB.revelations.length - 1)
      ];

    this.renderRevelation(revelation);
  }

  renderSidebar() {
    const state = this.game.state.stage7;

    const sectorList = document.getElementById("stage7SectorList");
    sectorList.innerHTML = STAGE7_DB.sectors.map((sector) => `
      <div class="stage7-sector">
        <span>${escapeStage7(sector.name)}</span>
        <small>${escapeStage7(sector.role)}</small>
      </div>
    `).join("");

    const flags = [
      ["estrutura", state.flags.structureConfirmed],
      ["arquivo", state.flags.archiveNamed],
      ["filosofia", state.flags.philosophyUnderstood],
      ["inteligência", state.flags.aiConfirmed],
      ["tempo", state.flags.temporalLinkConfirmed]
    ];

    const flagList = document.getElementById("stage7FlagList");
    flagList.innerHTML = flags.map(([label, value]) => `
      <div class="stage7-flag ${value ? "complete" : ""}">
        <span>${value ? "✓" : "○"}</span>
        <strong>${escapeStage7(label)}</strong>
      </div>
    `).join("");
  }

  renderBriefing() {
    const content = document.getElementById("stage7Content");

    content.innerHTML = `
      <div class="stage7-kicker">CONVERGÊNCIA</div>
      <h3>Os líderes visíveis são apenas peças.</h3>

      <p class="stage7-lead">
        As evidências coletadas nos Atos V e VI apontam para uma estrutura mais antiga
        do que a própria organização que enviou você ao passado.
      </p>

      <div class="stage7-warning">
        <span>NOTA DE CONTINUIDADE</span>
        <p>
          A resposta não é uma pessoa, um governo ou uma única organização.
          Existe uma arquitetura que conecta tecnologia, política, economia,
          vigilância, história, magia e informação temporal.
        </p>
      </div>

      <div class="stage7-core-diagram">
        <div class="stage7-core-node center">
          <span>AZ-01</span>
          <strong>ARQUIVO ZERO</strong>
        </div>
        ${["HISTÓRIA","TEMPO","VIGILÂNCIA","ECONOMIA","POLÍTICA","ARCANO"].map((item, i) => `
          <div class="stage7-core-node node-${i}">
            <span>${i + 1}</span>
            <strong>${item}</strong>
          </div>
        `).join("")}
        <div class="stage7-core-lines"></div>
      </div>

      <div class="stage7-question">
        <span>A PERGUNTA MUDOU</span>
        <p>
          Não é mais apenas “quem controla o mundo?”.
          Agora é “por que alguém decidiu que controlar o mundo seria a forma de salvá-lo?”
        </p>
      </div>
    `;

    document.getElementById("stage7Previous").disabled = true;
    document.getElementById("stage7Next").textContent = "COMEÇAR REVELAÇÃO";
  }

  renderRevelation(revelation) {
    const content = document.getElementById("stage7Content");

    content.innerHTML = `
      <div class="stage7-reveal">
        <div class="stage7-reveal-index">
          REVELAÇÃO ${String(this.game.state.stage7.revelationIndex + 1).padStart(2,"0")}
          / ${String(STAGE7_DB.revelations.length).padStart(2,"0")}
        </div>
        <div class="stage7-kicker">ARQUIVO ZERO</div>
        <h3>${escapeStage7(revelation.title)}</h3>

        <div class="stage7-reveal-box">
          <div class="stage7-reveal-glyph">AZ</div>
          <p>${escapeStage7(revelation.text)}</p>
        </div>

        <div class="stage7-archive-detail-grid">
          <div>
            <span>NATUREZA</span>
            <strong>${escapeStage7(STAGE7_DB.archive.nature)}</strong>
          </div>
          <div>
            <span>OBJETIVO ORIGINAL</span>
            <strong>${escapeStage7(STAGE7_DB.archive.origin)}</strong>
          </div>
          <div>
            <span>ERRO ORIGINAL</span>
            <strong>${escapeStage7(STAGE7_DB.archive.originalError)}</strong>
          </div>
          <div>
            <span>FILOSOFIA</span>
            <strong>${escapeStage7(STAGE7_DB.archive.philosophy)}</strong>
          </div>
        </div>
      </div>
    `;

    document.getElementById("stage7Previous").disabled =
      this.game.state.stage7.revelationIndex <= 0;

    document.getElementById("stage7Next").textContent =
      this.game.state.stage7.revelationIndex >= STAGE7_DB.revelations.length - 1
        ? "CONTINUAR"
        : "REVELAR";
  }

  renderFinalChoice() {
    const content = document.getElementById("stage7Content");

    content.innerHTML = `
      <div class="stage7-choice-view">
        <div class="stage7-kicker">A VERDADE ESTÁ EXPOSTA</div>
        <h3>Como você interpreta o que descobriu?</h3>

        <p class="stage7-lead">
          O Núcleo Zero acredita sinceramente que está protegendo a humanidade.
          Isso não significa que suas decisões sejam justas ou aceitáveis.
        </p>

        <div class="stage7-choice-grid">
          <button type="button" data-stage7-choice="oppose">
            <strong>OPOR-SE</strong>
            <span>O controle não pode ser justificado apenas pelo medo do caos.</span>
          </button>

          <button type="button" data-stage7-choice="investigate">
            <strong>INVESTIGAR</strong>
            <span>Antes de destruir o sistema, preciso descobrir exatamente como ele funciona.</span>
          </button>

          <button type="button" data-stage7-choice="consider">
            <strong>CONSIDERAR</strong>
            <span>Se o sistema realmente impediu catástrofes, talvez a situação seja mais complexa.</span>
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-stage7-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.archiveZero.chooseUnderstanding(
          button.dataset.stage7Choice
        );
      });
    });

    document.getElementById("stage7Previous").disabled = true;
    document.getElementById("stage7Next").style.display = "none";
  }

  renderAfterChoice(choiceId) {
    const content = document.getElementById("stage7Content");

    const messages = {
      oppose:
        "Você entende o sistema como uma ameaça à liberdade e decide que ele precisa ser confrontado.",
      investigate:
        "Você entende que derrubar o sistema sem compreender suas funções pode criar consequências ainda maiores.",
      consider:
        "Você percebe que o antagonista central não age apenas por crueldade. Sua lógica precisa ser enfrentada, não ignorada."
    };

    content.innerHTML = `
      <div class="stage7-after-choice">
        <div class="stage7-result-mark">${choiceId === "oppose" ? "!" : choiceId === "investigate" ? "?" : "≈"}</div>
        <div class="stage7-kicker">INTERPRETAÇÃO REGISTRADA</div>
        <h3>${escapeStage7(messages[choiceId])}</h3>

        <div class="stage7-next-warning">
          <span>PRÓXIMO ATO</span>
          <p>
            Agora diferentes facções sabem que existe manipulação temporal.
            O conflito deixa de ser secreto e começa a se transformar em guerra.
          </p>
        </div>

        <button id="stage7Finish" class="primary-button" type="button">
          ENCERRAR ATO VII
        </button>
      </div>
    `;

    document.getElementById("stage7Finish").addEventListener("click", () => {
      this.game.archiveZero.finishAct();
    });

    this.game.state.stage7.currentPanel = "afterChoice";
  }

  renderCompleted() {
    this.root.hidden = false;

    document.getElementById("stage7Previous").style.display = "none";
    document.getElementById("stage7Next").style.display = "none";

    document.getElementById("stage7Content").innerHTML = `
      <div class="stage7-completed">
        <div class="stage7-kicker">ATO VII CONCLUÍDO</div>
        <h3>Agora todos sabem que o tempo foi manipulado.</h3>
        <p class="stage7-lead">
          O segredo deixou de pertencer a um pequeno grupo.
          Diferentes facções passaram a disputar a tecnologia, o conhecimento e o significado da própria história.
        </p>
        <div class="stage7-completion-mark">ATO VIII — A GUERRA</div>
        <p class="stage7-muted">
          O próximo módulo transformará a revelação em conflito aberto.
        </p>
      </div>
    `;

    document.getElementById("stage7Dot").classList.add("complete");
  }
}

function escapeStage7(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage7(game) {
  stage7Ensure(game.state);

  if (!game.archiveZero) {
    game.archiveZero = new ArchiveZeroManager(game);
  }

  if (!game.stage7UI) {
    game.stage7UI = new Stage7UI(game);
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage7Ensure(game.state);
    game.stage7UI.close();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage7Ensure(game.state);
      game.stage7UI.render();
    }, 400);
  };

  // Abertura automática do Ato VII após conclusão do Ato VI.
  const watcher = window.setInterval(() => {
    if (!window.game?.state) return;

    stage7Ensure(window.game.state);

    const state = window.game.state;
    if (
      state.world?.actId === "act7" &&
      state.stage6?.finished &&
      !state.stage7.started
    ) {
      state.stage7.started = true;
      state.stage7.active = true;
      window.game.archiveZero.begin();
      window.clearInterval(watcher);
    }
  }, 550);

  game.stage7Open = () => {
    stage7Ensure(game.state);
    game.archiveZero.begin();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage7(window.game);
  } else {
    console.error("Stage 7: GameController ausente.");
  }
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 8 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 8
   ATO VIII — A GUERRA
   ----------------------------------------------------------------------------
   Extensão da v0.7.0.

   Direção baseada no documento de história:
   - diferentes grupos agora conhecem a manipulação temporal;
   - o conflito escala;
   - regiões incluem cidades, desertos, ruínas, instalações científicas,
     fortalezas, zonas mágicas e regiões históricas alteradas;
   - sistemas principais: combate, exploração, infiltração, diplomacia,
     escolhas e gestão de aliados;
   - antagonistas: O Controlador, A Regente, O Apóstata e O Substituto;
   - nenhum antagonista se considera simplesmente maligno.
   ============================================================================ */

"use strict";

const STAGE8_VERSION = "0.8.0";

const STAGE8_DB = {
  regions: {
    ironCity: {
      id: "ironCity",
      name: "Cidade de Ferro",
      type: "CIDADE",
      atmosphere: "TORRES • BLOQUEIOS • DRONES",
      description:
        "Uma cidade industrial cercada por barreiras e pontos de controle. Diferentes facções disputam suas redes de energia e comunicação.",
      enemyLevel: 4,
      traits: ["urban", "surveillance"],
      missions: [
        "cityFront",
        "extractWitness"
      ]
    },
    ashDesert: {
      id: "ashDesert",
      name: "Deserto das Cinzas",
      type: "DESERTO",
      atmosphere: "AREIA • RUÍNAS • TEMPESTADES",
      description:
        "Uma região devastada onde rotas antigas conectam comunidades isoladas e instalações abandonadas.",
      enemyLevel: 5,
      traits: ["open", "survival"],
      missions: [
        "desertRoute"
      ]
    },
    ruinedFortress: {
      id: "ruinedFortress",
      name: "Fortaleza em Ruínas",
      type: "FORTALEZA",
      atmosphere: "PEDRA • METAL • CONFLITO",
      description:
        "Uma fortificação antiga reutilizada como ponto estratégico por uma facção armada.",
      enemyLevel: 6,
      traits: ["combat", "fortified"],
      missions: [
        "fortressBreak"
      ]
    },
    arcaneZone: {
      id: "arcaneZone",
      name: "Zona Arcana",
      type: "ZONA MÁGICA",
      atmosphere: "ARTEFATOS • ENERGIA • ANOMALIAS",
      description:
        "Uma região onde artefatos e fenômenos mágicos alteram a percepção e a estabilidade do ambiente.",
      enemyLevel: 5,
      traits: ["arcane", "anomaly"],
      missions: [
        "arcaneRelic"
      ]
    },
    alteredRegion: {
      id: "alteredRegion",
      name: "Região Histórica Alterada",
      type: "REGIÃO TEMPORAL",
      atmosphere: "ECO • FRAGMENTOS • DESCONTINUIDADE",
      description:
        "Uma área onde alterações temporais criaram sobreposição entre diferentes estados da história.",
      enemyLevel: 7,
      traits: ["temporal", "unstable"],
      missions: [
        "temporalBreach"
      ]
    }
  },

  enemies: {
    sentinel: {
      id: "sentinel",
      name: "Sentinela da Ordem",
      faction: "ORDEM DO HORIZONTE",
      hp: 52,
      attack: 12,
      defense: 7,
      alertness: 65,
      ideology:
        "Acredita que controle rígido é necessário para evitar colapsos."
    },
    enforcer: {
      id: "enforcer",
      name: "Executor da Cúpula",
      faction: "A CÚPULA",
      hp: 68,
      attack: 15,
      defense: 9,
      alertness: 72,
      ideology:
        "Acredita que decisões rápidas tomadas por uma elite evitam o caos."
    },
    arcaneGuardian: {
      id: "arcaneGuardian",
      name: "Guardião Arcano",
      faction: "OS ARCANISTAS",
      hp: 61,
      attack: 14,
      defense: 11,
      alertness: 55,
      ideology:
        "Protege conhecimento que considera perigoso demais para uso indiscriminado."
    },
    chronicleAgent: {
      id: "chronicleAgent",
      name: "Agente Cronista",
      faction: "OS CRONISTAS",
      hp: 58,
      attack: 13,
      defense: 10,
      alertness: 82,
      ideology:
        "Acredita que estabilidade temporal justifica intervenções severas."
    }
  },

  antagonists: {
    controller: {
      id: "controller",
      name: "O CONTROLADOR",
      faction: "ARQUIVO ZERO",
      philosophy:
        "Liberdade gera caos; reduzir escolhas perigosas aumenta a chance de sobrevivência.",
      battlefieldRole: "CONTROLE DE SISTEMAS",
      methods: [
        "vigilância",
        "classificação",
        "restrição de acesso",
        "manipulação de informação"
      ],
      initialEncounter:
        "Você chama isso de prisão. Eu chamo de estrutura necessária para impedir que tudo desabe novamente."
    },
    regent: {
      id: "regent",
      name: "A REGENTE",
      faction: "A CÚPULA",
      philosophy:
        "A paz pode justificar sacrifícios quando sociedades não conseguem escolher racionalmente.",
      battlefieldRole: "COMANDO POLÍTICO",
      methods: [
        "controle militar",
        "tratados assimétricos",
        "bloqueios",
        "pressão política"
      ],
      initialEncounter:
        "Vocês confundem liberdade com ausência de consequência. Governar é decidir antes que a crise escolha por todos."
    },
    apostate: {
      id: "apostate",
      name: "O APÓSTATA",
      faction: "DESVINCULADOS",
      philosophy:
        "Deus abandonou a humanidade; resta construir um sentido sem depender de uma ordem superior.",
      battlefieldRole: "GUERRA IDEOLÓGICA",
      methods: [
        "propaganda",
        "radicalização",
        "ruptura de alianças",
        "ataques a símbolos"
      ],
      initialEncounter:
        "Vocês continuam procurando um significado que o mundo nunca prometeu entregar."
    },
    substitute: {
      id: "substitute",
      name: "O SUBSTITUTO",
      faction: "SISTEMA AUTÔNOMO",
      philosophy:
        "Uma inteligência criada pelo homem pode assumir funções antes atribuídas a Deus.",
      battlefieldRole: "INTELIGÊNCIA ESTRATÉGICA",
      methods: [
        "predição",
        "simulação",
        "automação",
        "controle de infraestrutura"
      ],
      initialEncounter:
        "Se vocês desejam salvar milhões, por que não permitiriam que uma inteligência calculasse o caminho mais seguro?"
    }
  },

  missions: {
    cityFront: {
      id: "cityFront",
      title: "Frente da Cidade de Ferro",
      regionId: "ironCity",
      objective:
        "Atravessar um setor controlado e proteger uma rota de evacuação.",
      combatEncounter: "sentinel",
      infiltrationDifficulty: 58,
      diplomacyDifficulty: 64,
      reward: "Acesso a uma rede urbana secundária.",
      consequence:
        "O nível de vigilância sobre o grupo poderá aumentar."
    },
    extractWitness: {
      id: "extractWitness",
      title: "Extrair a Testemunha",
      regionId: "ironCity",
      objective:
        "Retirar uma testemunha que conhece operações clandestinas da cidade.",
      combatEncounter: "enforcer",
      infiltrationDifficulty: 65,
      diplomacyDifficulty: 52,
      reward: "Depoimento sobre a relação entre política e vigilância.",
      consequence:
        "Uma facção pode considerar a equipe uma ameaça direta."
    },
    desertRoute: {
      id: "desertRoute",
      title: "Rota das Cinzas",
      regionId: "ashDesert",
      objective:
        "Reabrir uma rota segura entre comunidades isoladas.",
      combatEncounter: "sentinel",
      infiltrationDifficulty: 48,
      diplomacyDifficulty: 57,
      reward: "Reputação entre comunidades independentes.",
      consequence:
        "A equipe ganha uma nova rota de exploração."
    },
    fortressBreak: {
      id: "fortressBreak",
      title: "A Fortaleza em Ruínas",
      regionId: "ruinedFortress",
      objective:
        "Invadir a fortaleza e retirar dados de operações.",
      combatEncounter: "enforcer",
      infiltrationDifficulty: 72,
      diplomacyDifficulty: 68,
      reward: "Dados estratégicos e equipamento.",
      consequence:
        "A Cúpula aumentará a pressão sobre a equipe."
    },
    arcaneRelic: {
      id: "arcaneRelic",
      title: "O Artefato",
      regionId: "arcaneZone",
      objective:
        "Recuperar um artefato antes que seja usado para manipular uma anomalia.",
      combatEncounter: "arcaneGuardian",
      infiltrationDifficulty: 59,
      diplomacyDifficulty: 61,
      reward: "Conhecimento arcano e estabilidade de uma zona.",
      consequence:
        "Os Arcanistas poderão avaliar a equipe conforme suas decisões."
    },
    temporalBreach: {
      id: "temporalBreach",
      title: "A Fenda Temporal",
      regionId: "alteredRegion",
      objective:
        "Conter uma instabilidade temporal antes que novas alterações se propaguem.",
      combatEncounter: "chronicleAgent",
      infiltrationDifficulty: 74,
      diplomacyDifficulty: 75,
      reward: "Controle temporário de uma passagem temporal.",
      consequence:
        "A estabilidade temporal pode aumentar ou diminuir."
    }
  }
};

function stage8Ensure(state) {
  state.stage8 = state.stage8 || {};
  const s = state.stage8;

  s.version = STAGE8_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);

  s.currentRegionId = s.currentRegionId || "ironCity";
  s.currentMissionId = s.currentMissionId || null;
  s.mode = s.mode || "explore";

  s.flags = s.flags || {};
  s.flags.firstBattleCompleted = Boolean(s.flags.firstBattleCompleted);
  s.flags.firstDiplomacyCompleted = Boolean(s.flags.firstDiplomacyCompleted);
  s.flags.firstInfiltrationCompleted = Boolean(s.flags.firstInfiltrationCompleted);
  s.flags.antagonistEncountered = s.flags.antagonistEncountered || {};

  s.regionStatus = s.regionStatus || {};
  for (const region of Object.values(STAGE8_DB.regions)) {
    if (!s.regionStatus[region.id]) {
      s.regionStatus[region.id] = {
        unlocked: region.id === "ironCity",
        danger: 0,
        visited: false
      };
    }
  }

  s.missionStates = s.missionStates || {};
  for (const mission of Object.values(STAGE8_DB.missions)) {
    if (!s.missionStates[mission.id]) {
      s.missionStates[mission.id] = {
        status: "locked",
        successCount: 0,
        failures: 0,
        lastMode: null
      };
    }
  }

  s.combat = s.combat || null;

  s.diplomacy = s.diplomacy || {
    reputation: {},
    agreements: [],
    tensions: []
  };

  s.infiltration = s.infiltration || {
    alert: 0,
    successfulOperations: 0,
    failedOperations: 0
  };

  s.log = Array.isArray(s.log) ? s.log : [];
}

class WarManager {
  constructor(game) {
    this.game = game;
  }

  ensure() {
    stage8Ensure(this.game.state);
  }

  get state() {
    this.ensure();
    return this.game.state.stage8;
  }

  start() {
    this.ensure();

    this.state.active = true;
    this.state.started = true;
    this.state.finished = false;

    this.game.state.world.actId = "act8";
    this.game.state.world.era = "FUTURO";
    this.game.state.world.worldStatus = "GUERRA — CONFLITO MULTIFACETADO";

    this.game.stage8UI.open();
    this.game.stage8UI.render();

    this.game.ui.notify(
      "ATO VIII — A GUERRA",
      "O segredo temporal deixou de ser privado. Diferentes facções agora disputam tecnologia, informação e território.",
      "info"
    );
  }

  getRegion(id) {
    return STAGE8_DB.regions[id] || null;
  }

  getMission(id) {
    return STAGE8_DB.missions[id] || null;
  }

  getEnemy(id) {
    return STAGE8_DB.enemies[id] || null;
  }

  travel(regionId) {
    const region = this.getRegion(regionId);
    if (!region) return;

    const entry = this.state.regionStatus[regionId];
    if (!entry?.unlocked) {
      this.game.ui.notify(
        "REGIÃO BLOQUEADA",
        "A equipe ainda não possui acesso seguro a esta região.",
        "error"
      );
      return;
    }

    entry.visited = true;
    this.state.currentRegionId = regionId;
    this.state.mode = "explore";

    this.game.state.world.locationId = regionId;
    this.game.state.world.actId = "act8";
    this.game.state.world.era = "FUTURO";

    this.game.ui.renderLocation({
      act: "ATO VIII",
      name: region.name,
      era: "FUTURO",
      tag: region.type,
      description: region.description
    });

    this.state.log.unshift({
      type: "travel",
      regionId,
      at: new Date().toISOString()
    });

    this.game.stage8UI.render();
  }

  unlockRegion(regionId) {
    if (!this.state.regionStatus[regionId]) return;
    this.state.regionStatus[regionId].unlocked = true;
  }

  startMission(missionId) {
    const mission = this.getMission(missionId);
    if (!mission) return;

    const region = this.getRegion(mission.regionId);
    if (!region) return;

    this.unlockRegion(mission.regionId);
    this.travel(mission.regionId);

    this.state.currentMissionId = missionId;
    this.state.mode = "mission";

    const entry = this.state.missionStates[missionId];
    if (entry.status === "locked") {
      entry.status = "available";
    }

    this.game.stage8UI.openMission(mission);
  }

  chooseMode(missionId, mode) {
    const mission = this.getMission(missionId);
    if (!mission) return;

    const modes = ["combat", "infiltration", "diplomacy"];
    if (!modes.includes(mode)) return;

    this.state.currentMissionId = missionId;
    this.state.mode = mode;

    if (mode === "combat") this.startCombat(mission);
    if (mode === "infiltration") this.startInfiltration(mission);
    if (mode === "diplomacy") this.startDiplomacy(mission);
  }

  calculateTeamPower(mission) {
    const team = (this.game.state.stage6?.team || [])
      .map((id) => this.game.allies?.get(id))
      .filter(Boolean);

    let score = team.length * 2;

    for (const ally of team) {
      const trust = Number(this.game.state.stage6?.trust?.[ally.id] || 0);
      if (trust >= 65) score += 2;
      if (mission.regionId === "alteredRegion" && ally.id === "noah") score += 3;
      if (mission.regionId === "ironCity" && ally.id === "mira") score += 2;
      if (mission.regionId === "ashDesert" && ally.id === "cassian") score += 2;
      if (mission.regionId === "arcaneZone" && ally.id === "elian") score += 2;
    }

    return score;
  }

  startCombat(mission) {
    const enemy = this.getEnemy(mission.combatEncounter);
    if (!enemy) return;

    const teamPower = this.calculateTeamPower(mission);

    this.state.combat = {
      missionId: mission.id,
      enemyId: enemy.id,
      playerHp: 100 + teamPower * 5,
      playerMaxHp: 100 + teamPower * 5,
      enemyHp: enemy.hp,
      enemyMaxHp: enemy.hp,
      round: 1,
      battleLog: [
        `Contato hostil: ${enemy.name}.`,
        `Ideologia: ${enemy.ideology}`
      ],
      playerGuard: false
    };

    this.game.stage8UI.renderCombat();
  }

  performCombatAction(action) {
    const combat = this.state.combat;
    if (!combat) return;

    const enemy = this.getEnemy(combat.enemyId);
    if (!enemy) return;

    let playerDamage = 0;
    let enemyDamage = 0;

    if (action === "attack") {
      playerDamage = Math.max(
        5,
        13 +
          this.calculateTeamPower(this.getMission(combat.missionId)) -
          enemy.defense
      );
      combat.enemyHp = Math.max(0, combat.enemyHp - playerDamage);
      combat.battleLog.unshift(`Ataque coordenado: -${playerDamage} HP do inimigo.`);
    }

    if (action === "ability") {
      const hasNoah = this.game.state.stage6?.team?.includes("noah");
      const hasMira = this.game.state.stage6?.team?.includes("mira");

      playerDamage =
        16 +
        (hasNoah ? 7 : 0) +
        (hasMira ? 4 : 0) -
        Math.floor(enemy.defense / 2);

      combat.enemyHp = Math.max(0, combat.enemyHp - playerDamage);
      combat.battleLog.unshift(
        `Habilidade de equipe: -${playerDamage} HP do inimigo.`
      );

      this.game.state.player.stats.temporalStability = clamp(
        this.game.state.player.stats.temporalStability -
          (enemy.id === "chronicleAgent" ? 2 : 0),
        0,
        100
      );
    }

    if (action === "guard") {
      combat.playerGuard = true;
      combat.battleLog.unshift("A equipe assume posição defensiva.");
    }

    if (combat.enemyHp <= 0) {
      this.resolveCombat(true);
      return;
    }

    const guardMultiplier = combat.playerGuard ? 0.45 : 1;

    enemyDamage = Math.max(
      3,
      Math.floor(enemy.attack * guardMultiplier)
    );

    combat.playerHp = Math.max(0, combat.playerHp - enemyDamage);
    combat.battleLog.unshift(`Contra-ataque: -${enemyDamage} HP da equipe.`);

    combat.playerGuard = false;
    combat.round += 1;

    if (combat.playerHp <= 0) {
      this.resolveCombat(false);
      return;
    }

    this.game.stage8UI.renderCombat();
  }

  resolveCombat(success) {
    const combat = this.state.combat;
    if (!combat) return;

    const mission = this.getMission(combat.missionId);
    const entry = this.state.missionStates[mission.id];

    entry.status = success ? "completed" : "failed";
    entry.lastMode = "combat";

    if (success) {
      entry.successCount += 1;
      this.state.flags.firstBattleCompleted = true;

      this.game.state.player.stats.freedom = clamp(
        this.game.state.player.stats.freedom + 3,
        0,
        100
      );

      this.state.regionStatus[mission.regionId].danger = clamp(
        this.state.regionStatus[mission.regionId].danger - 1,
        0,
        100
      );

      this.game.ui.notify(
        "COMBATE VENCIDO",
        `${mission.title}: a equipe abriu espaço para continuar a operação.`,
        "success"
      );
    } else {
      entry.failures += 1;
      this.state.regionStatus[mission.regionId].danger = clamp(
        this.state.regionStatus[mission.regionId].danger + 2,
        0,
        100
      );

      this.game.state.player.stats.control = clamp(
        this.game.state.player.stats.control + 2,
        0,
        100
      );

      this.game.ui.notify(
        "RECUO",
        `${mission.title}: a equipe precisou interromper o confronto.`,
        "error"
      );
    }

    this.state.log.unshift({
      type: "combat",
      missionId: mission.id,
      success,
      rounds: combat.round,
      at: new Date().toISOString()
    });

    this.state.combat = null;
    this.game.ui.renderPlayerStats();
    this.game.stage8UI.renderResult(mission, success, "combat");
  }

  startInfiltration(mission) {
    const state = this.state;
    const teamPower = this.calculateTeamPower(mission);

    const initialAlert = clamp(
      mission.infiltrationDifficulty - teamPower * 3,
      10,
      95
    );

    state.infiltration.alert = initialAlert;
    state.infiltration.currentMissionId = mission.id;
    state.infiltration.step = 1;

    this.game.stage8UI.renderInfiltration(mission);
  }

  infiltrationAction(action) {
    const state = this.state;
    const mission = this.getMission(state.infiltration.currentMissionId);
    if (!mission) return;

    let delta = 0;

    if (action === "observe") delta = -9;
    if (action === "hack") {
      const hasMira = this.game.state.stage6?.team?.includes("mira");
      delta = hasMira ? -18 : -8;
    }
    if (action === "rush") delta = 7;
    if (action === "hide") delta = -13;

    state.infiltration.alert = clamp(
      state.infiltration.alert + delta,
      0,
      100
    );

    state.infiltration.step += 1;

    if (state.infiltration.alert >= 100) {
      state.infiltration.failedOperations += 1;
      state.missionStates[mission.id].status = "failed";
      state.missionStates[mission.id].lastMode = "infiltration";

      this.game.ui.notify(
        "ALERTA MÁXIMO",
        "A equipe foi identificada e precisou abandonar a infiltração.",
        "error"
      );

      this.state.log.unshift({
        type: "infiltration",
        missionId: mission.id,
        success: false,
        alert: state.infiltration.alert,
        at: new Date().toISOString()
      });

      this.game.stage8UI.renderResult(mission, false, "infiltration");
      return;
    }

    if (state.infiltration.step >= 5 || state.infiltration.alert <= 8) {
      state.infiltration.successfulOperations += 1;
      state.missionStates[mission.id].status = "completed";
      state.missionStates[mission.id].lastMode = "infiltration";

      this.state.flags.firstInfiltrationCompleted = true;

      this.game.state.player.stats.freedom = clamp(
        this.game.state.player.stats.freedom + 4,
        0,
        100
      );

      this.game.ui.notify(
        "INFILTRAÇÃO CONCLUÍDA",
        "A equipe saiu da área com dados sem disparar um alerta máximo.",
        "success"
      );

      this.state.log.unshift({
        type: "infiltration",
        missionId: mission.id,
        success: true,
        alert: state.infiltration.alert,
        at: new Date().toISOString()
      });

      this.game.stage8UI.renderResult(mission, true, "infiltration");
      return;
    }

    this.game.stage8UI.renderInfiltration(mission);
  }

  startDiplomacy(mission) {
    const rep = this.state.diplomacy.reputation;
    const faction = this.getMissionFaction(mission);

    rep[faction] = Number(rep[faction] || 0);

    this.state.diplomacy.currentMissionId = mission.id;
    this.state.diplomacy.currentFaction = faction;
    this.state.diplomacy.round = 1;

    this.game.stage8UI.renderDiplomacy(mission, faction, rep[faction]);
  }

  getMissionFaction(mission) {
    if (
      mission.id === "cityFront" ||
      mission.id === "extractWitness" ||
      mission.id === "fortressBreak"
    ) {
      return "A CÚPULA";
    }

    if (mission.id === "arcaneRelic") {
      return "OS ARCANISTAS";
    }

    if (mission.id === "temporalBreach") {
      return "OS CRONISTAS";
    }

    return "OS DESLIGADOS";
  }

  diplomacyAction(action) {
    const d = this.state.diplomacy;
    const mission = this.getMission(d.currentMissionId);

    if (!mission) return;

    let delta = 0;

    if (action === "listen") delta = 8;
    if (action === "offer") delta = 11;
    if (action === "threaten") delta = -14;
    if (action === "truth") delta = 7;

    if (this.game.state.stage6?.team?.includes("elian") && action === "offer") {
      delta += 5;
    }

    const faction = d.currentFaction;
    d.reputation[faction] = clamp(
      Number(d.reputation[faction] || 0) + delta,
      -100,
      100
    );

    d.round += 1;

    if (d.reputation[faction] >= 32) {
      d.agreements.push(faction);

      this.state.flags.firstDiplomacyCompleted = true;
      this.state.missionStates[mission.id].status = "completed";
      this.state.missionStates[mission.id].lastMode = "diplomacy";

      this.game.state.player.stats.freedom = clamp(
        this.game.state.player.stats.freedom + 4,
        0,
        100
      );

      this.state.log.unshift({
        type: "diplomacy",
        missionId: mission.id,
        faction,
        success: true,
        reputation: d.reputation[faction],
        at: new Date().toISOString()
      });

      this.game.ui.notify(
        "ACORDO ALCANÇADO",
        `A equipe conseguiu um acordo com ${faction}.`,
        "success"
      );

      this.game.stage8UI.renderResult(mission, true, "diplomacy");
      return;
    }

    if (d.reputation[faction] <= -35 || d.round >= 4) {
      d.tensions.push(faction);
      this.state.missionStates[mission.id].status = "failed";
      this.state.missionStates[mission.id].lastMode = "diplomacy";

      this.state.log.unshift({
        type: "diplomacy",
        missionId: mission.id,
        faction,
        success: false,
        reputation: d.reputation[faction],
        at: new Date().toISOString()
      });

      this.game.ui.notify(
        "NEGOCIAÇÃO FRACASSOU",
        `A tensão com ${faction} aumentou.`,
        "error"
      );

      this.game.stage8UI.renderResult(mission, false, "diplomacy");
      return;
    }

    this.game.stage8UI.renderDiplomacy(
      mission,
      faction,
      d.reputation[faction]
    );
  }

  encounterAntagonist(id) {
    const antagonist = STAGE8_DB.antagonists[id];
    if (!antagonist) return;

    this.state.flags.antagonistEncountered[id] = true;

    this.game.stage8UI.renderAntagonist(antagonist);
  }

  finishAct() {
    this.state.active = false;
    this.state.finished = true;

    this.game.state.world.actId = "act9";
    this.game.state.world.worldStatus =
      "ATO IX — UMA ESCOLHA DE ESCALA GIGANTESCA";

    this.game.ui.notify(
      "ATO VIII CONCLUÍDO",
      "A guerra mudou as relações entre as facções. O próximo passo será uma escolha de escala temporal.",
      "success"
    );

    this.game.stage8UI.renderCompleted();
  }
}

class Stage8UI {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.currentView = "hub";
    this.initOverlay();
  }

  initOverlay() {
    if (document.getElementById("stage8Overlay")) {
      this.root = document.getElementById("stage8Overlay");
      return;
    }

    this.root = document.createElement("div");
    this.root.id = "stage8Overlay";
    this.root.className = "overlay stage8-overlay";
    this.root.hidden = true;

    this.root.innerHTML = `
      <div class="modal-panel stage8-modal">
        <div class="stage8-header">
          <div>
            <span class="modal-kicker">ATO VIII</span>
            <h2>A GUERRA</h2>
          </div>
          <div class="stage8-war-status">
            <span></span>
            <strong>CONFLITO ATIVO</strong>
          </div>
        </div>

        <div class="stage8-main">
          <aside class="stage8-sidebar">
            <div class="stage8-side-title">REGIÃO ATUAL</div>
            <div id="stage8CurrentRegion" class="stage8-region-mini"></div>

            <div class="stage8-side-title">EQUIPE</div>
            <div id="stage8Team" class="stage8-team-mini"></div>

            <div class="stage8-side-title">SISTEMAS</div>
            <div class="stage8-system-mini">
              <div><span>COMBATE</span><strong id="stage8CombatCount">0</strong></div>
              <div><span>INFILTRAÇÃO</span><strong id="stage8InfiltrationCount">0</strong></div>
              <div><span>DIPLOMACIA</span><strong id="stage8DiplomacyCount">0</strong></div>
            </div>

            <div class="stage8-side-title">FACÇÕES</div>
            <div id="stage8FactionList" class="stage8-faction-list"></div>
          </aside>

          <section id="stage8Content" class="stage8-content"></section>
        </div>

        <div class="stage8-footer">
          <button id="stage8Back" class="secondary-button" type="button">VOLTAR</button>
          <button id="stage8Action" class="primary-button" type="button">EXPLORAR</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    document.getElementById("stage8Back").addEventListener("click", () => {
      this.currentView = "hub";
      this.render();
    });

    document.getElementById("stage8Action").addEventListener("click", () => {
      this.action();
    });
  }

  open() {
    this.root.hidden = false;
    this.currentView = "hub";
    this.render();
  }

  close() {
    this.root.hidden = true;
  }

  render() {
    if (this.root.hidden) return;

    this.renderSidebar();

    const content = document.getElementById("stage8Content");

    if (this.currentView === "regions") this.renderRegions(content);
    else if (this.currentView === "missions") this.renderMissions(content);
    else if (this.currentView === "combat") {
      // renderCombat chama diretamente
    } else if (this.currentView === "infiltration") {
      // renderInfiltration chama diretamente
    } else if (this.currentView === "diplomacy") {
      // renderDiplomacy chama diretamente
    } else if (this.currentView === "result") {
      // renderResult chama diretamente
    } else if (this.currentView === "antagonist") {
      // renderAntagonist chama diretamente
    } else if (this.currentView === "completed") {
      this.renderCompleted();
    } else {
      this.renderHub(content);
    }

    this.updateFooter();
  }

  renderSidebar() {
    const state = this.game.state.stage8;
    const region = STAGE8_DB.regions[state.currentRegionId];

    document.getElementById("stage8CurrentRegion").innerHTML = region
      ? `<strong>${escapeStage8(region.name)}</strong><small>${escapeStage8(region.type)}</small>`
      : `<strong>Indefinida</strong>`;

    const team = document.getElementById("stage8Team");
    const ids = this.game.state.stage6?.team || [];

    team.innerHTML = ids.length
      ? ids.map((id) => {
          const ally = this.game.allies?.get(id);
          return `<div><span>${escapeStage8(ally?.name || id)}</span><strong>${escapeStage8(ally?.role || "")}</strong></div>`;
        }).join("")
      : `<div class="stage8-empty">Equipe vazia</div>`;

    document.getElementById("stage8CombatCount").textContent =
      String(this.countMode("combat"));
    document.getElementById("stage8InfiltrationCount").textContent =
      String(this.countMode("infiltration"));
    document.getElementById("stage8DiplomacyCount").textContent =
      String(this.countMode("diplomacy"));

    const factionList = document.getElementById("stage8FactionList");
    const diplomacy = state.diplomacy;

    factionList.innerHTML = Object.entries(diplomacy.reputation || {})
      .map(([faction, rep]) => `
        <div class="stage8-faction-mini">
          <span>${escapeStage8(faction)}</span>
          <strong>${rep}</strong>
        </div>
      `).join("") || `
        <div class="stage8-empty">Nenhuma reputação registrada.</div>
      `;
  }

  countMode(mode) {
    const missionStates = this.game.state.stage8?.missionStates || {};
    return Object.values(missionStates)
      .filter((entry) => entry.lastMode === mode && entry.status === "completed")
      .length;
  }

  renderHub(content) {
    content.innerHTML = `
      <div class="stage8-kicker">ATO VIII — GUERRA</div>
      <h3>O conflito deixou de ser secreto.</h3>
      <p class="stage8-lead">
        Diferentes facções descobriram a manipulação temporal.
        Agora território, informação, tecnologia, magia e alianças são disputados.
      </p>

      <div class="stage8-war-diagram">
        <div class="stage8-war-core">TEMPO</div>
        <div class="stage8-war-node n1">CÚPULA</div>
        <div class="stage8-war-node n2">ARQUISTAS</div>
        <div class="stage8-war-node n3">CRONISTAS</div>
        <div class="stage8-war-node n4">DESLIGADOS</div>
        <div class="stage8-war-node n5">ORDEM DO HORIZONTE</div>
      </div>

      <div class="stage8-action-grid">
        <button type="button" class="stage8-action-card" data-stage8-view="regions">
          <span>01</span>
          <strong>EXPLORAR REGIÕES</strong>
          <small>Cidades, desertos, fortalezas, zonas mágicas e regiões temporais.</small>
        </button>

        <button type="button" class="stage8-action-card" data-stage8-view="missions">
          <span>02</span>
          <strong>MISSÕES DE GUERRA</strong>
          <small>Escolher como enfrentar cada operação.</small>
        </button>
      </div>

      <div class="stage8-doctrine">
        <span>REGRA</span>
        <p>
          Nenhum sistema precisa resolver todos os conflitos.
          Combate, infiltração e diplomacia são ferramentas diferentes com consequências diferentes.
        </p>
      </div>
    `;

    content.querySelectorAll("[data-stage8-view]").forEach((button) => {
      button.addEventListener("click", () => {
        this.currentView = button.dataset.stage8View;
        this.render();
      });
    });
  }

  renderRegions(content) {
    const state = this.game.state.stage8;

    content.innerHTML = `
      <div class="stage8-kicker">MAPA DE GUERRA</div>
      <h3>Regiões em conflito.</h3>
      <div class="stage8-region-grid"></div>
    `;

    const grid = content.querySelector(".stage8-region-grid");

    for (const region of Object.values(STAGE8_DB.regions)) {
      const entry = state.regionStatus[region.id];

      const card = document.createElement("article");
      card.className = `stage8-region-card ${entry?.unlocked ? "" : "locked"}`;

      card.innerHTML = `
        <div class="stage8-region-top">
          <span>${escapeStage8(region.type)}</span>
          <strong>RISCO ${entry?.danger || 0}</strong>
        </div>
        <h4>${escapeStage8(region.name)}</h4>
        <p>${escapeStage8(region.description)}</p>
        <div class="stage8-region-atmosphere">${escapeStage8(region.atmosphere)}</div>
        <button type="button" class="primary-button"
          data-stage8-region="${region.id}"
          ${entry?.unlocked ? "" : "disabled"}>
          ${entry?.unlocked ? "ENTRAR" : "BLOQUEADA"}
        </button>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll("[data-stage8-region]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.war.travel(button.dataset.stage8Region);
      });
    });
  }

  renderMissions(content) {
    content.innerHTML = `
      <div class="stage8-kicker">OPERAÇÕES</div>
      <h3>Escolha o campo de batalha.</h3>
      <p class="stage8-lead">
        Cada missão pode ser resolvida por combate, infiltração ou diplomacia,
        e a composição da equipe altera as possibilidades.
      </p>
      <div class="stage8-mission-grid"></div>
    `;

    const grid = content.querySelector(".stage8-mission-grid");

    for (const mission of Object.values(STAGE8_DB.missions)) {
      const state = this.game.state.stage8.missionStates[mission.id];

      const card = document.createElement("article");
      card.className = "stage8-mission-card";

      card.innerHTML = `
        <div class="stage8-mission-meta">
          <span>${escapeStage8(STAGE8_DB.regions[mission.regionId].name)}</span>
          <strong>${escapeStage8(state.status.toUpperCase())}</strong>
        </div>
        <h4>${escapeStage8(mission.title)}</h4>
        <p>${escapeStage8(mission.objective)}</p>

        <div class="stage8-three-modes">
          <span>COMBATE</span>
          <span>INFILTRAÇÃO</span>
          <span>DIPLOMACIA</span>
        </div>

        <button type="button" class="primary-button"
          data-stage8-mission="${mission.id}">
          ESCOLHER OPERAÇÃO
        </button>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll("[data-stage8-mission]").forEach((button) => {
      button.addEventListener("click", () => {
        const mission = this.game.war.getMission(button.dataset.stage8Mission);
        this.openMission(mission);
      });
    });
  }

  openMission(mission) {
    const content = document.getElementById("stage8Content");
    this.currentView = "mission";

    content.innerHTML = `
      <div class="stage8-mission-detail">
        <div class="stage8-kicker">OPERAÇÃO</div>
        <h3>${escapeStage8(mission.title)}</h3>
        <p class="stage8-lead">${escapeStage8(mission.objective)}</p>

        <div class="stage8-detail-grid">
          <div><span>LOCAL</span><strong>${escapeStage8(mission.location || STAGE8_DB.regions[mission.regionId].name)}</strong></div>
          <div><span>RECOMPENSA</span><strong>${escapeStage8(mission.reward)}</strong></div>
          <div><span>CONSEQUÊNCIA</span><strong>${escapeStage8(mission.consequence)}</strong></div>
          <div><span>EQUIPE</span><strong>${(this.game.state.stage6?.team || []).length} aliados</strong></div>
        </div>

        <div class="stage8-mode-title">ESCOLHA O MÉTODO</div>

        <div class="stage8-mode-grid">
          <button type="button" data-stage8-mode="combat">
            <strong>COMBATE</strong>
            <small>Enfrentar diretamente as forças presentes.</small>
          </button>

          <button type="button" data-stage8-mode="infiltration">
            <strong>INFILTRAÇÃO</strong>
            <small>Entrar, observar, manipular sistemas e sair com o objetivo.</small>
          </button>

          <button type="button" data-stage8-mode="diplomacy">
            <strong>DIPLOMACIA</strong>
            <small>Negociar com a facção e tentar construir um acordo.</small>
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-stage8-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.war.chooseMode(
          mission.id,
          button.dataset.stage8Mode
        );
      });
    });

    this.updateFooter();
  }

  renderCombat() {
    this.currentView = "combat";

    const combat = this.game.state.stage8.combat;
    const enemy = this.game.war.getEnemy(combat.enemyId);
    const content = document.getElementById("stage8Content");

    content.innerHTML = `
      <div class="stage8-combat">
        <div class="stage8-kicker">COMBATE — RODADA ${combat.round}</div>
        <h3>${escapeStage8(enemy.name)}</h3>

        <div class="stage8-combat-status">
          <div>
            <span>EQUIPE</span>
            <strong>${combat.playerHp} / ${combat.playerMaxHp}</strong>
            <div class="stage8-hp"><i style="width:${(combat.playerHp/combat.playerMaxHp)*100}%"></i></div>
          </div>
          <div>
            <span>INIMIGO</span>
            <strong>${combat.enemyHp} / ${combat.enemyMaxHp}</strong>
            <div class="stage8-hp enemy"><i style="width:${(combat.enemyHp/combat.enemyMaxHp)*100}%"></i></div>
          </div>
        </div>

        <div class="stage8-combat-arena">
          <div class="stage8-combat-figure player">EQUIPE</div>
          <div class="stage8-combat-vs">VS</div>
          <div class="stage8-combat-figure enemy">AMEAÇA</div>
        </div>

        <div class="stage8-combat-actions">
          <button type="button" data-stage8-combat="attack">
            <strong>ATACAR</strong>
            <small>Dano consistente.</small>
          </button>
          <button type="button" data-stage8-combat="ability">
            <strong>HABILIDADE DE EQUIPE</strong>
            <small>Usa sinergias dos aliados.</small>
          </button>
          <button type="button" data-stage8-combat="guard">
            <strong>DEFENDER</strong>
            <small>Reduz o próximo dano recebido.</small>
          </button>
        </div>

        <div class="stage8-log">
          ${combat.battleLog.slice(0,7).map((line) => `<div>${escapeStage8(line)}</div>`).join("")}
        </div>
      </div>
    `;

    content.querySelectorAll("[data-stage8-combat]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.war.performCombatAction(button.dataset.stage8Combat);
      });
    });

    this.updateFooter();
  }

  renderInfiltration(mission) {
    this.currentView = "infiltration";

    const state = this.game.state.stage8;
    const alert = state.infiltration.alert;

    document.getElementById("stage8Content").innerHTML = `
      <div class="stage8-infiltration">
        <div class="stage8-kicker">INFILTRAÇÃO</div>
        <h3>${escapeStage8(mission.title)}</h3>
        <p class="stage8-lead">
          Evite atingir alerta máximo. Cada ação pode aproximar a equipe ou afastá-la do objetivo.
        </p>

        <div class="stage8-alert-panel">
          <div>
            <span>NÍVEL DE ALERTA</span>
            <strong>${alert}%</strong>
          </div>
          <div class="stage8-alert-bar"><i style="width:${alert}%"></i></div>
        </div>

        <div class="stage8-infiltration-actions">
          <button data-stage8-infiltration="observe" type="button">
            <strong>OBSERVAR</strong>
            <small>Identificar padrões e reduzir exposição.</small>
          </button>
          <button data-stage8-infiltration="hack" type="button">
            <strong>INTERFERIR</strong>
            <small>Manipular um sistema de controle.</small>
          </button>
          <button data-stage8-infiltration="hide" type="button">
            <strong>OCULTAR-SE</strong>
            <small>Recuar e esperar o momento certo.</small>
          </button>
          <button data-stage8-infiltration="rush" type="button">
            <strong>AVANÇAR</strong>
            <small>Aumentar o ritmo com maior risco.</small>
          </button>
        </div>
      </div>
    `;

    document.querySelectorAll("[data-stage8-infiltration]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.war.infiltrationAction(button.dataset.stage8Infiltration);
      });
    });

    this.updateFooter();
  }

  renderDiplomacy(mission, faction, reputation) {
    this.currentView = "diplomacy";

    const content = document.getElementById("stage8Content");
    const leader = this.getFactionLeader(faction);

    content.innerHTML = `
      <div class="stage8-diplomacy">
        <div class="stage8-kicker">DIPLOMACIA</div>
        <h3>${escapeStage8(faction)}</h3>

        <div class="stage8-negotiator">
          <span>POSIÇÃO</span>
          <strong>${escapeStage8(leader)}</strong>
          <p>
            ${escapeStage8(this.getFactionStatement(faction))}
          </p>
        </div>

        <div class="stage8-reputation">
          <div><span>REPUTAÇÃO</span><strong>${reputation}</strong></div>
          <div class="stage8-reputation-bar"><i style="width:${clamp((reputation+100)/2,0,100)}%"></i></div>
        </div>

        <div class="stage8-diplomacy-actions">
          <button data-stage8-diplomacy="listen" type="button">
            <strong>OUVIR</strong>
            <small>Reduz tensão e coleta informações.</small>
          </button>
          <button data-stage8-diplomacy="offer" type="button">
            <strong>PROPOR ACORDO</strong>
            <small>Usar uma troca concreta para construir confiança.</small>
          </button>
          <button data-stage8-diplomacy="truth" type="button">
            <strong>REVELAR PARTE DA VERDADE</strong>
            <small>Usar evidências para criar uma base comum.</small>
          </button>
          <button data-stage8-diplomacy="threaten" type="button">
            <strong>AMEAÇAR</strong>
            <small>Pode produzir resultado rápido, mas aumenta a tensão.</small>
          </button>
        </div>
      </div>
    `;

    content.querySelectorAll("[data-stage8-diplomacy]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.war.diplomacyAction(button.dataset.stage8Diplomacy);
      });
    });

    this.updateFooter();
  }

  getFactionLeader(faction) {
    if (faction === "A CÚPULA") return "A Regente";
    if (faction === "OS ARCANISTAS") return "Guardião do Santuário";
    if (faction === "OS CRONISTAS") return "Conselho dos Cronistas";
    return "Representante dos Desligados";
  }

  getFactionStatement(faction) {
    if (faction === "A CÚPULA") {
      return STAGE8_DB.antagonists.regent.initialEncounter;
    }
    if (faction === "OS ARCANISTAS") {
      return "Conhecimento perigoso não deve ser usado sem compreender suas consequências.";
    }
    if (faction === "OS CRONISTAS") {
      return "Toda alteração temporal tem um custo que alguém precisa assumir.";
    }
    return "Comunidades livres não querem trocar uma prisão por outra.";
  }

  renderResult(mission, success, mode) {
    this.currentView = "result";

    const content = document.getElementById("stage8Content");

    content.innerHTML = `
      <div class="stage8-result ${success ? "success" : "failure"}">
        <div class="stage8-result-icon">${success ? "✓" : "!"}</div>
        <div class="stage8-kicker">${success ? "OPERAÇÃO BEM-SUCEDIDA" : "OPERAÇÃO COMPLICADA"}</div>
        <h3>${escapeStage8(mission.title)}</h3>
        <p class="stage8-lead">
          ${
            success
              ? "O método escolhido funcionou e alterou a posição da equipe na guerra."
              : "O método escolhido não produziu o resultado esperado, mas a campanha continua."
          }
        </p>

        <div class="stage8-result-grid">
          <div><span>MÉTODO</span><strong>${mode.toUpperCase()}</strong></div>
          <div><span>RECOMPENSA</span><strong>${escapeStage8(mission.reward)}</strong></div>
          <div><span>CONSEQUÊNCIA</span><strong>${escapeStage8(mission.consequence)}</strong></div>
          <div><span>REGIÃO</span><strong>${escapeStage8(STAGE8_DB.regions[mission.regionId].name)}</strong></div>
        </div>

        <button id="stage8ResultBack" type="button" class="primary-button">
          VOLTAR AO MAPA
        </button>
      </div>
    `;

    document.getElementById("stage8ResultBack").addEventListener("click", () => {
      this.currentView = "missions";
      this.render();
    });

    this.updateFooter();
  }

  renderAntagonist(antagonist) {
    this.currentView = "antagonist";

    document.getElementById("stage8Content").innerHTML = `
      <div class="stage8-antagonist">
        <div class="stage8-kicker">ENCONTRO</div>
        <h3>${escapeStage8(antagonist.name)}</h3>

        <div class="stage8-antagonist-card">
          <span>FILOSOFIA</span>
          <p>${escapeStage8(antagonist.philosophy)}</p>
          <span>MÉTODOS</span>
          <div class="stage8-tag-row">
            ${antagonist.methods.map((method) => `<span>${escapeStage8(method)}</span>`).join("")}
          </div>
        </div>

        <div class="stage8-antagonist-quote">
          ${escapeStage8(antagonist.initialEncounter)}
        </div>

        <p class="stage8-lead">
          O antagonista não se considera simplesmente maligno.
          A guerra agora também é uma disputa entre diferentes filosofias sobre como a humanidade deve sobreviver.
        </p>
      </div>
    `;

    this.updateFooter();
  }

  renderCompleted() {
    this.currentView = "completed";

    document.getElementById("stage8Content").innerHTML = `
      <div class="stage8-completed">
        <div class="stage8-kicker">ATO VIII CONCLUÍDO</div>
        <h3>A guerra mudou o equilíbrio.</h3>
        <p class="stage8-lead">
          Combate, infiltração e diplomacia produziram consequências diferentes.
          Agora o protagonista possui informação suficiente para enfrentar a próxima decisão temporal de escala gigantesca.
        </p>
        <div class="stage8-next">ATO IX — A ESCOLHA</div>
        <p class="stage8-muted">
          O próximo ato colocará o jogador diante da possibilidade de reescrever o passado.
        </p>
      </div>
    `;

    document.getElementById("stage8Back").style.display = "none";
    document.getElementById("stage8Action").style.display = "none";
  }

  updateFooter() {
    const back = document.getElementById("stage8Back");
    const action = document.getElementById("stage8Action");

    back.style.display = "inline-flex";
    action.style.display = "inline-flex";
    back.disabled = this.currentView === "hub";

    if (this.currentView === "hub") {
      action.textContent = "EXPLORAR REGIÕES";
    } else if (this.currentView === "regions") {
      action.textContent = "MISSÕES";
    } else if (this.currentView === "missions") {
      action.textContent = "EXPLORAR";
    } else {
      action.textContent = "MAPA";
    }
  }

  action() {
    if (this.currentView === "hub") {
      this.currentView = "regions";
      this.render();
      return;
    }

    if (this.currentView === "regions") {
      this.currentView = "missions";
      this.render();
      return;
    }

    if (this.currentView === "missions") {
      this.currentView = "regions";
      this.render();
      return;
    }

    this.currentView = "hub";
    this.render();
  }
}

function escapeStage8(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage8(game) {
  stage8Ensure(game.state);

  if (!game.war) {
    game.war = new WarManager(game);
  }

  if (!game.stage8UI) {
    game.stage8UI = new Stage8UI(game);
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage8Ensure(game.state);
    game.stage8UI.close();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage8Ensure(game.state);
      game.stage8UI.render();
    }, 420);
  };

  // Abre o Ato VIII após a conclusão do Ato VII.
  const watcher = window.setInterval(() => {
    if (!window.game?.state) return;

    stage8Ensure(window.game.state);
    const state = window.game.state;

    if (
      state.world?.actId === "act8" &&
      state.stage7?.finished &&
      !state.stage8.started
    ) {
      state.stage8.started = true;
      window.game.war.start();
      window.clearInterval(watcher);
    }
  }, 600);

  game.stage8Open = () => {
    stage8Ensure(game.state);
    game.war.start();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage8(window.game);
  } else {
    console.error("Stage 8: GameController ausente.");
  }
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 9 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 9
   ATO IX — A ESCOLHA
   ----------------------------------------------------------------------------
   Sistema completo das três grandes decisões temporais:
     A — REESCREVER
     B — PRESERVAR
     C — LIBERTAR

   Princípios:
   - A decisão é de campanha, não apenas de diálogo.
   - Cada caminho gera alterações persistentes no estado.
   - O jogo registra custos, benefícios, pessoas afetadas, estabilidade temporal,
     estado das facções e indicadores narrativos.
   - Nenhuma opção é tratada como resposta universalmente correta.
   - O módulo prepara as condições para os finais da Etapa 10.
   ============================================================================ */

"use strict";

const STAGE9_VERSION = "0.9.0";

const STAGE9_DB = {
  temporalCrisis: {
    id: "origin_shift",
    name: "ORIGEM DO COLAPSO",
    description:
      "Uma alteração temporal de escala gigantesca parece capaz de remover a origem de vários conflitos.",
    warning:
      "O passado não é uma linha neutra. Alterá-lo pode apagar pessoas, destruir culturas, eliminar aliados, reescrever memórias e criar outra linha temporal."
  },

  decisions: {
    rewrite: {
      id: "rewrite",
      code: "A",
      title: "REESCREVER",
      subtitle: "Construir uma realidade diferente alterando o passado.",
      doctrine:
        "Alterar a origem de determinados conflitos para tentar construir um mundo novo.",
      promise:
        "Reduzir algumas das causas históricas de guerras e colapsos.",
      cost:
        "A nova realidade pode apagar pessoas, culturas, memórias e versões inteiras da história.",
      risks: [
        "Instabilidade de linha temporal",
        "Desaparecimento de aliados",
        "Memórias contraditórias",
        "Criação de uma nova realidade",
        "Consequências desconhecidas"
      ],
      benefits: [
        "Possibilidade de reduzir certos conflitos históricos",
        "Reorganização de estruturas do mundo",
        "Chance de produzir um futuro radicalmente diferente"
      ],
      initialRequirements: {
        temporalStabilityMax: 100,
        freedomMin: 0
      },
      costProfile: {
        temporalStability: -42,
        freedom: -10,
        control: 8,
        hope: 8
      }
    },

    preserve: {
      id: "preserve",
      code: "B",
      title: "PRESERVAR",
      subtitle: "Manter o passado e lutar para transformar o presente.",
      doctrine:
        "Aceitar que a história não será corrigida por uma grande alteração e concentrar a transformação nas escolhas do presente.",
      promise:
        "Preservar pessoas, culturas, memórias e a continuidade da linha temporal.",
      cost:
        "O mundo continua imperfeito e os conflitos que já existem não desaparecem magicamente.",
      risks: [
        "Manutenção de conflitos existentes",
        "Reconstrução lenta",
        "Necessidade de enfrentar estruturas de poder diretamente",
        "Resultados menos imediatos"
      ],
      benefits: [
        "Maior estabilidade temporal",
        "Continuidade de pessoas e culturas",
        "Preservação das memórias"
      ],
      initialRequirements: {
        temporalStabilityMin: 30
      },
      costProfile: {
        temporalStability: 4,
        freedom: 10,
        control: -8,
        hope: 5
      }
    },

    liberate: {
      id: "liberate",
      code: "C",
      title: "LIBERTAR",
      subtitle: "Destruir o sistema de controle sem tentar construir uma utopia.",
      doctrine:
        "Remover a estrutura de controle e aceitar que as pessoas enfrentarão a responsabilidade das próprias escolhas.",
      promise:
        "Restituir autonomia sem substituir uma forma de controle por outra.",
      cost:
        "A queda do sistema pode produzir instabilidade, conflitos e decisões imprevisíveis.",
      risks: [
        "Vácuo de poder",
        "Conflitos regionais",
        "Instabilidade política",
        "Ausência de uma solução pronta",
        "Responsabilidade humana direta"
      ],
      benefits: [
        "Grande aumento de liberdade",
        "Redução do controle central",
        "Preservação da capacidade de escolha",
        "Possibilidade de reconstrução voluntária"
      ],
      initialRequirements: {
        freedomMin: 40
      },
      costProfile: {
        temporalStability: -8,
        freedom: 22,
        control: -22,
        hope: 6
      }
    }
  },

  dilemmas: [
    {
      id: "memory",
      title: "O PROBLEMA DA MEMÓRIA",
      text:
        "A alteração pode impedir guerras que aconteceram. Mas as pessoas que viveram essas guerras também carregam memórias que fazem parte de quem são.",
      question:
        "Uma realidade sem determinada dor continua sendo a mesma realidade?",
      choices: [
        {
          id: "accept",
          title: "Aceitar a perda como custo",
          effect: { control: 3, freedom: -3 }
        },
        {
          id: "protect",
          title: "Proteger a continuidade das pessoas",
          effect: { freedom: 5, hope: 2 }
        }
      ]
    },
    {
      id: "allies",
      title: "O PROBLEMA DOS ALIADOS",
      text:
        "Alguns aliados podem não existir na nova linha temporal. Outros podem existir sem conhecer o protagonista.",
      question:
        "Até onde você está disposto a alterar o mundo sabendo que pode apagar pessoas que lutaram ao seu lado?",
      choices: [
        {
          id: "sacrifice",
          title: "Aceitar o sacrifício",
          effect: { control: 4, freedom: -4 }
        },
        {
          id: "preserve",
          title: "Preservar as relações",
          effect: { freedom: 5, hope: 1 }
        }
      ]
    },
    {
      id: "responsibility",
      title: "O PROBLEMA DA RESPONSABILIDADE",
      text:
        "Uma realidade perfeita pode parecer uma solução. Mas uma vida em que escolhas importantes foram removidas ainda pertence às pessoas?",
      question:
        "Salvar as pessoas pode significar decidir por elas?",
      choices: [
        {
          id: "decide",
          title: "Decidir por um bem maior",
          effect: { control: 6, freedom: -5 }
        },
        {
          id: "choose",
          title: "Devolver a decisão às pessoas",
          effect: { freedom: 6, control: -5 }
        }
      ]
    }
  ]
};

function stage9Ensure(state) {
  state.stage9 = state.stage9 || {};
  const s = state.stage9;

  s.version = STAGE9_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);

  s.phase = s.phase || "briefing";
  s.decisionId = s.decisionId || null;
  s.confirmed = Boolean(s.confirmed);
  s.confirmationStep = s.confirmationStep || 0;
  s.dilemmaIndex = Number.isInteger(s.dilemmaIndex) ? s.dilemmaIndex : 0;
  s.dilemmaChoices = Array.isArray(s.dilemmaChoices) ? s.dilemmaChoices : [];

  s.flags = s.flags || {};
  s.flags.temporalChoiceMade = Boolean(s.flags.temporalChoiceMade);
  s.flags.realityShifted = Boolean(s.flags.realityShifted);
  s.flags.historyPreserved = Boolean(s.flags.historyPreserved);
  s.flags.controlDestroyed = Boolean(s.flags.controlDestroyed);
  s.flags.finalPathPrepared = Boolean(s.flags.finalPathPrepared);

  s.worldConsequences = s.worldConsequences || {
    peopleErased: 0,
    culturesChanged: 0,
    memoriesChanged: 0,
    alliesLost: 0,
    regionsChanged: 0,
    factionControlDelta: 0,
    publicFreedomDelta: 0
  };

  s.timeline = s.timeline || {
    branch: "MAIN",
    stabilityBefore: 0,
    stabilityAfter: 0,
    fractureCount: 0
  };

  s.log = Array.isArray(s.log) ? s.log : [];
}

class TemporalChoiceManager {
  constructor(game) {
    this.game = game;
  }

  ensure() {
    stage9Ensure(this.game.state);
  }

  get state() {
    this.ensure();
    return this.game.state.stage9;
  }

  get decision() {
    return STAGE9_DB.decisions[this.state.decisionId] || null;
  }

  begin() {
    this.ensure();

    this.state.active = true;
    this.state.started = true;
    this.state.finished = false;
    this.state.phase = "briefing";
    this.state.confirmed = false;
    this.state.dilemmaIndex = 0;
    this.state.decisionId = null;
    this.state.dilemmaChoices = [];

    this.game.state.world.actId = "act9";
    this.game.state.world.era = "FUTURO";
    this.game.state.world.worldStatus = "ATO IX — DECISÃO TEMPORAL";

    this.game.stage9UI.open();
    this.game.stage9UI.renderBriefing();

    this.game.ui.notify(
      "ATO IX — A ESCOLHA",
      "A alteração temporal agora pode atingir a escala de uma civilização.",
      "info"
    );
  }

  getAvailableDecisions() {
    const stats = this.game.state.player.stats;
    const result = [];

    for (const decision of Object.values(STAGE9_DB.decisions)) {
      let available = true;

      const req = decision.initialRequirements || {};

      if (
        typeof req.temporalStabilityMin === "number" &&
        stats.temporalStability < req.temporalStabilityMin
      ) {
        available = false;
      }

      if (
        typeof req.temporalStabilityMax === "number" &&
        stats.temporalStability > req.temporalStabilityMax
      ) {
        available = false;
      }

      if (
        typeof req.freedomMin === "number" &&
        stats.freedom < req.freedomMin
      ) {
        available = false;
      }

      result.push({ ...decision, available });
    }

    return result;
  }

  selectDecision(id) {
    const decision = STAGE9_DB.decisions[id];
    if (!decision) return;

    const option = this.getAvailableDecisions().find(
      (item) => item.id === id
    );

    if (!option?.available) {
      this.game.ui.notify(
        "CAMINHO BLOQUEADO",
        "As condições atuais da linha temporal não permitem esta decisão.",
        "error"
      );
      return;
    }

    this.state.decisionId = id;
    this.state.phase = "dilemma";
    this.state.dilemmaIndex = 0;
    this.state.confirmed = false;
    this.state.dilemmaChoices = [];

    this.state.log.unshift({
      type: "decisionSelected",
      decisionId: id,
      at: new Date().toISOString()
    });

    this.game.stage9UI.renderDilemma();
  }

  answerDilemma(choiceId) {
    const dilemma = STAGE9_DB.dilemmas[this.state.dilemmaIndex];
    if (!dilemma) return;

    const choice = dilemma.choices.find((item) => item.id === choiceId);
    if (!choice) return;

    const stats = this.game.state.player.stats;

    for (const [key, value] of Object.entries(choice.effect || {})) {
      if (typeof stats[key] === "number") {
        stats[key] = clamp(stats[key] + value, 0, 100);
      }
    }

    this.state.dilemmaChoices.push({
      dilemmaId: dilemma.id,
      choiceId,
      at: new Date().toISOString()
    });

    this.state.log.unshift({
      type: "dilemma",
      dilemmaId: dilemma.id,
      choiceId,
      at: new Date().toISOString()
    });

    this.game.ui.renderPlayerStats();

    if (this.state.dilemmaIndex >= STAGE9_DB.dilemmas.length - 1) {
      this.state.phase = "confirmation";
      this.game.stage9UI.renderConfirmation();
      return;
    }

    this.state.dilemmaIndex += 1;
    this.game.stage9UI.renderDilemma();
  }

  confirmDecision() {
    if (!this.decision) return;

    if (this.state.confirmationStep === 0) {
      this.state.confirmationStep = 1;
      this.game.stage9UI.renderFinalConfirmation();
      return;
    }

    if (this.state.confirmationStep === 1) {
      this.applyDecision();
    }
  }

  applyDecision() {
    const decision = this.decision;
    const stats = this.game.state.player.stats;
    const profile = decision.costProfile;

    for (const [key, value] of Object.entries(profile)) {
      if (typeof stats[key] === "number") {
        stats[key] = clamp(stats[key] + value, 0, 100);
      }
    }

    const before = this.game.state.stage8?.regions
      ? "MULTI_BRANCH"
      : "MAIN";

    this.state.timeline.stabilityBefore = clamp(
      Number(stats.temporalStability - profile.temporalStability),
      0,
      100
    );

    this.state.timeline.stabilityAfter = clamp(
      Number(stats.temporalStability),
      0,
      100
    );

    this.state.timeline.branch = decision.id.toUpperCase();
    this.state.flags.temporalChoiceMade = true;

    this.applyWorldConsequences(decision.id);

    this.state.confirmed = true;
    this.state.phase = "consequence";
    this.state.log.unshift({
      type: "temporalDecisionApplied",
      decisionId: decision.id,
      stabilityBefore: this.state.timeline.stabilityBefore,
      stabilityAfter: this.state.timeline.stabilityAfter,
      at: new Date().toISOString()
    });

    this.game.ui.renderPlayerStats();
    this.game.stage9UI.renderConsequence();
  }

  applyWorldConsequences(id) {
    const c = this.state.worldConsequences;

    if (id === "rewrite") {
      this.state.flags.realityShifted = true;
      this.state.flags.historyPreserved = false;
      this.state.flags.controlDestroyed = false;

      c.peopleErased = 120000;
      c.culturesChanged = 7;
      c.memoriesChanged = 48;
      c.alliesLost = Math.max(
        0,
        Math.floor((this.game.state.stage6?.recruited || []).length * 0.6)
      );
      c.regionsChanged = 9;
      c.factionControlDelta = 12;
      c.publicFreedomDelta = -8;

      this.state.timeline.fractureCount = 3;
    }

    if (id === "preserve") {
      this.state.flags.realityShifted = false;
      this.state.flags.historyPreserved = true;
      this.state.flags.controlDestroyed = false;

      c.peopleErased = 0;
      c.culturesChanged = 0;
      c.memoriesChanged = 0;
      c.alliesLost = 0;
      c.regionsChanged = 1;
      c.factionControlDelta = -4;
      c.publicFreedomDelta = 8;

      this.state.timeline.fractureCount = 0;
    }

    if (id === "liberate") {
      this.state.flags.realityShifted = false;
      this.state.flags.historyPreserved = true;
      this.state.flags.controlDestroyed = true;

      c.peopleErased = 0;
      c.culturesChanged = 1;
      c.memoriesChanged = 0;
      c.alliesLost = 0;
      c.regionsChanged = 5;
      c.factionControlDelta = -28;
      c.publicFreedomDelta = 25;

      this.state.timeline.fractureCount = 1;
    }
  }

  continueAfterConsequence() {
    this.state.phase = "aftermath";
    this.state.finished = true;
    this.state.active = false;
    this.state.flags.finalPathPrepared = true;

    this.game.state.world.actId = "act10";
    this.game.state.world.era =
      this.state.decisionId === "rewrite" ? "NOVA LINHA TEMPORAL" : "FUTURO";
    this.game.state.world.worldStatus =
      "ATO X — FINAIS MÚLTIPLOS PREPARADOS";

    this.game.stage9UI.renderAftermath();

    this.game.ui.notify(
      "LINHA TEMPORAL REGISTRADA",
      `Caminho ${this.decision.code}: ${this.decision.title}. Os finais serão determinados pelas consequências acumuladas.`,
      "success"
    );
  }
}

class Stage9UI {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.initOverlay();
  }

  initOverlay() {
    if (document.getElementById("stage9Overlay")) {
      this.root = document.getElementById("stage9Overlay");
      return;
    }

    this.root = document.createElement("div");
    this.root.id = "stage9Overlay";
    this.root.className = "overlay stage9-overlay";
    this.root.hidden = true;

    this.root.innerHTML = `
      <div class="modal-panel stage9-modal">
        <div class="stage9-header">
          <div>
            <span class="modal-kicker">ATO IX</span>
            <h2>A ESCOLHA</h2>
          </div>
          <div class="stage9-temporal-status">
            <span id="stage9TemporalDot"></span>
            <strong>CRISE TEMPORAL</strong>
          </div>
        </div>

        <div class="stage9-main">
          <aside class="stage9-sidebar">
            <div class="stage9-side-title">ESTADO TEMPORAL</div>
            <div class="stage9-stat-card">
              <span>ESTABILIDADE</span>
              <strong id="stage9Stability">0</strong>
              <div class="stage9-meter"><i id="stage9StabilityBar"></i></div>
            </div>

            <div class="stage9-side-title">CAMINHO</div>
            <div id="stage9SelectedPath" class="stage9-path-card">
              <span>NÃO ESCOLHIDO</span>
              <strong>—</strong>
            </div>

            <div class="stage9-side-title">CONSEQUÊNCIAS PREVISTAS</div>
            <div id="stage9QuickConsequences" class="stage9-consequence-list"></div>
          </aside>

          <section id="stage9Content" class="stage9-content"></section>
        </div>

        <div class="stage9-footer">
          <button id="stage9Back" class="secondary-button" type="button">VOLTAR</button>
          <button id="stage9Action" class="primary-button" type="button">CONTINUAR</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    document.getElementById("stage9Back").addEventListener("click", () => {
      this.handleBack();
    });

    document.getElementById("stage9Action").addEventListener("click", () => {
      this.handleAction();
    });
  }

  open() {
    this.root.hidden = false;
    this.renderBriefing();
  }

  close() {
    this.root.hidden = true;
  }

  updateSidebar() {
    const stats = this.game.state.player.stats;
    const state = this.game.state.stage9;
    const stability = clamp(stats.temporalStability, 0, 100);

    document.getElementById("stage9Stability").textContent = String(stability);
    document.getElementById("stage9StabilityBar").style.width = `${stability}%`;

    const path = document.getElementById("stage9SelectedPath");
    const decision = STAGE9_DB.decisions[state.decisionId];

    path.innerHTML = decision
      ? `<span>CAMINHO ${decision.code}</span><strong>${escapeStage9(decision.title)}</strong>`
      : `<span>NÃO ESCOLHIDO</span><strong>—</strong>`;

    const quick = document.getElementById("stage9QuickConsequences");
    quick.innerHTML = "";

    if (!decision) {
      quick.innerHTML = `<div class="stage9-empty">Escolha um caminho para calcular as consequências.</div>`;
      return;
    }

    for (const risk of decision.risks.slice(0, 4)) {
      const div = document.createElement("div");
      div.className = "stage9-quick-item";
      div.textContent = risk;
      quick.appendChild(div);
    }
  }

  renderBriefing() {
    this.game.state.stage9.phase = "briefing";
    this.updateSidebar();

    const content = document.getElementById("stage9Content");

    content.innerHTML = `
      <div class="stage9-kicker">A DECISÃO DE ESCALA GIGANTESCA</div>
      <h3>Você encontrou uma forma de alterar a origem.</h3>

      <p class="stage9-lead">
        Depois da guerra, o sistema temporal chegou a um ponto que permite uma intervenção muito maior.
        Pela primeira vez, o protagonista pode tentar modificar a origem de vários conflitos.
      </p>

      <div class="stage9-crisis-card">
        <span>${escapeStage9(STAGE9_DB.temporalCrisis.name)}</span>
        <strong>${escapeStage9(STAGE9_DB.temporalCrisis.description)}</strong>
        <p>${escapeStage9(STAGE9_DB.temporalCrisis.warning)}</p>
      </div>

      <div class="stage9-three-symbols">
        <div class="stage9-symbol rewrite">
          <span>A</span>
          <strong>REESCREVER</strong>
        </div>
        <div class="stage9-symbol preserve">
          <span>B</span>
          <strong>PRESERVAR</strong>
        </div>
        <div class="stage9-symbol liberate">
          <span>C</span>
          <strong>LIBERTAR</strong>
        </div>
      </div>

      <div class="stage9-central-question">
        <span>PERGUNTA</span>
        <p>
          Você deseja construir uma realidade diferente, preservar a história
          ou destruir o sistema de controle sem fabricar uma utopia?
        </p>
      </div>
    `;

    document.getElementById("stage9Back").disabled = true;
    document.getElementById("stage9Action").textContent = "VER OS TRÊS CAMINHOS";
  }

  renderDecisionSelection() {
    this.game.state.stage9.phase = "selection";
    this.updateSidebar();

    const content = document.getElementById("stage9Content");

    const options = this.game.temporalChoice.getAvailableDecisions();

    content.innerHTML = `
      <div class="stage9-kicker">TRÊS GRANDES CAMINHOS</div>
      <h3>Nenhuma escolha vem sem preço.</h3>

      <div class="stage9-decision-grid"></div>
    `;

    const grid = content.querySelector(".stage9-decision-grid");

    for (const decision of options) {
      const card = document.createElement("article");
      card.className = `stage9-decision-card ${decision.id} ${decision.available ? "" : "locked"}`;

      card.innerHTML = `
        <div class="stage9-decision-top">
          <span>${decision.code}</span>
          <strong>${decision.available ? "DISPONÍVEL" : "BLOQUEADO"}</strong>
        </div>
        <h4>${escapeStage9(decision.title)}</h4>
        <p class="stage9-subtitle">${escapeStage9(decision.subtitle)}</p>

        <div class="stage9-decision-section">
          <span>PROPÓSITO</span>
          <p>${escapeStage9(decision.doctrine)}</p>
        </div>

        <div class="stage9-decision-section">
          <span>PROMESSA</span>
          <p>${escapeStage9(decision.promise)}</p>
        </div>

        <div class="stage9-decision-section">
          <span>CUSTO</span>
          <p>${escapeStage9(decision.cost)}</p>
        </div>

        <div class="stage9-list">
          <span>RISCOS</span>
          <ul>${decision.risks.map((risk) => `<li>${escapeStage9(risk)}</li>`).join("")}</ul>
        </div>

        <div class="stage9-list benefits">
          <span>BENEFÍCIOS</span>
          <ul>${decision.benefits.map((benefit) => `<li>${escapeStage9(benefit)}</li>`).join("")}</ul>
        </div>

        <button type="button"
          class="primary-button"
          data-stage9-decision="${decision.id}"
          ${decision.available ? "" : "disabled"}>
          ${decision.available ? "ESCOLHER CAMINHO" : "INDISPONÍVEL"}
        </button>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll("[data-stage9-decision]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.temporalChoice.selectDecision(
          button.dataset.stage9Decision
        );
      });
    });

    document.getElementById("stage9Back").disabled = false;
    document.getElementById("stage9Action").textContent = "REFORMULAR VISÃO";
  }

  renderDilemma() {
    this.game.state.stage9.phase = "dilemma";
    this.updateSidebar();

    const index = this.game.state.stage9.dilemmaIndex;
    const dilemma = STAGE9_DB.dilemmas[index];

    const content = document.getElementById("stage9Content");

    content.innerHTML = `
      <div class="stage9-dilemma">
        <div class="stage9-dilemma-progress">
          DILEMA ${String(index + 1).padStart(2,"0")} / ${String(STAGE9_DB.dilemmas.length).padStart(2,"0")}
        </div>

        <div class="stage9-kicker">${escapeStage9(dilemma.title)}</div>
        <h3>${escapeStage9(dilemma.question)}</h3>

        <div class="stage9-dilemma-text">
          ${escapeStage9(dilemma.text)}
        </div>

        <div class="stage9-dilemma-options">
          ${dilemma.choices.map((choice) => `
            <button type="button"
              data-stage9-dilemma="${choice.id}">
              <span>DECISÃO</span>
              <strong>${escapeStage9(choice.title)}</strong>
            </button>
          `).join("")}
        </div>
      </div>
    `;

    content.querySelectorAll("[data-stage9-dilemma]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.temporalChoice.answerDilemma(
          button.dataset.stage9Dilemma
        );
      });
    });

    document.getElementById("stage9Back").disabled = true;
    document.getElementById("stage9Action").style.display = "none";
  }

  renderConfirmation() {
    this.game.state.stage9.phase = "confirmation";
    this.updateSidebar();

    const decision = this.game.temporalChoice.decision;
    const content = document.getElementById("stage9Content");

    content.innerHTML = `
      <div class="stage9-confirmation">
        <div class="stage9-kicker">ÚLTIMA VERIFICAÇÃO</div>
        <h3>Você escolheu o caminho ${decision.code}: ${escapeStage9(decision.title)}.</h3>

        <p class="stage9-lead">
          Esta decisão será registrada como uma das maiores escolhas da campanha.
          Ela alterará o estado da linha temporal e influenciará diretamente o Ato X.
        </p>

        <div class="stage9-confirm-grid">
          <div>
            <span>ESTABILIDADE ATUAL</span>
            <strong>${this.game.state.player.stats.temporalStability}</strong>
          </div>
          <div>
            <span>ESTABILIDADE APÓS O CAMINHO</span>
            <strong>${this.predictStability(decision)}</strong>
          </div>
          <div>
            <span>ALIADOS POTENCIALMENTE AFETADOS</span>
            <strong>${decision.id === "rewrite" ? "SIM" : "NÃO DIRETAMENTE"}</strong>
          </div>
          <div>
            <span>MEMÓRIA HISTÓRICA</span>
            <strong>${decision.id === "rewrite" ? "POSSIVELMENTE ALTERADA" : "PRESERVADA"}</strong>
          </div>
        </div>

        <div class="stage9-irreversible">
          <span>DECISÃO DE CAMPANHA</span>
          <p>
            Depois da confirmação, o estado da campanha será marcado com o caminho escolhido.
            Não haverá simples “desfazer” dentro da mesma linha de jogo.
          </p>
        </div>
      </div>
    `;

    document.getElementById("stage9Back").disabled = false;
    document.getElementById("stage9Action").style.display = "inline-flex";
    document.getElementById("stage9Action").textContent = "CONFIRMAR DECISÃO";
  }

  renderFinalConfirmation() {
    const decision = this.game.temporalChoice.decision;

    document.getElementById("stage9Content").innerHTML = `
      <div class="stage9-final-confirm">
        <div class="stage9-final-mark">!</div>
        <div class="stage9-kicker">CONFIRMAÇÃO FINAL</div>
        <h3>Você está prestes a definir a próxima realidade.</h3>
        <p>
          Caminho ${decision.code}: <strong>${escapeStage9(decision.title)}</strong>
        </p>
        <div class="stage9-final-warning">
          ${escapeStage9(decision.cost)}
        </div>
        <button id="stage9ConfirmFinal" class="primary-button" type="button">
          CONFIRMAR E APLICAR À LINHA TEMPORAL
        </button>
      </div>
    `;

    document.getElementById("stage9ConfirmFinal").addEventListener("click", () => {
      this.game.temporalChoice.applyDecision();
    });

    document.getElementById("stage9Back").style.display = "inline-flex";
    document.getElementById("stage9Action").style.display = "none";
  }

  renderConsequence() {
    this.game.state.stage9.phase = "consequence";
    this.updateSidebar();

    const decision = this.game.temporalChoice.decision;
    const c = this.game.state.stage9.worldConsequences;

    document.getElementById("stage9Content").innerHTML = `
      <div class="stage9-consequence-screen">
        <div class="stage9-kicker">CONSEQUÊNCIAS DA DECISÃO</div>
        <h3>${escapeStage9(decision.title)}</h3>

        <p class="stage9-lead">
          A decisão foi aplicada. O mundo não é mais exatamente o mesmo.
        </p>

        <div class="stage9-consequence-grid">
          <div><span>PESSOAS APAGADAS</span><strong>${c.peopleErased.toLocaleString("pt-BR")}</strong></div>
          <div><span>CULTURAS ALTERADAS</span><strong>${c.culturesChanged}</strong></div>
          <div><span>MEMÓRIAS ALTERADAS</span><strong>${c.memoriesChanged}</strong></div>
          <div><span>ALIADOS AFETADOS</span><strong>${c.alliesLost}</strong></div>
          <div><span>REGIÕES ALTERADAS</span><strong>${c.regionsChanged}</strong></div>
          <div><span>DELTA DE CONTROLE</span><strong>${formatSigned(c.factionControlDelta)}</strong></div>
          <div><span>DELTA DE LIBERDADE PÚBLICA</span><strong>${formatSigned(c.publicFreedomDelta)}</strong></div>
          <div><span>FRATURAS TEMPORAIS</span><strong>${this.game.state.stage9.timeline.fractureCount}</strong></div>
        </div>

        <div class="stage9-consequence-statement">
          <span>REGISTRO NARRATIVO</span>
          <p>${escapeStage9(this.getNarrativeStatement(decision.id))}</p>
        </div>
      </div>
    `;

    document.getElementById("stage9Back").disabled = true;
    document.getElementById("stage9Action").style.display = "inline-flex";
    document.getElementById("stage9Action").textContent = "CONTINUAR";
  }

  renderAftermath() {
    this.game.state.stage9.phase = "aftermath";
    this.updateSidebar();

    const decision = this.game.temporalChoice.decision;

    document.getElementById("stage9Content").innerHTML = `
      <div class="stage9-aftermath">
        <div class="stage9-kicker">ATO IX CONCLUÍDO</div>
        <h3>O caminho foi escolhido.</h3>

        <div class="stage9-path-final">
          <span>CAMINHO ${decision.code}</span>
          <strong>${escapeStage9(decision.title)}</strong>
        </div>

        <p class="stage9-lead">
          A campanha agora está preparada para determinar um dos finais múltiplos.
          O resultado não depende apenas desta escolha: as decisões, relações e consequências acumuladas
          também entram no cálculo narrativo.
        </p>

        <div class="stage9-next">
          <span>PRÓXIMA ETAPA</span>
          <strong>ATO X — O FINAL</strong>
        </div>

        <button id="stage9Finish" class="primary-button" type="button">
          ENCERRAR ATO IX
        </button>
      </div>
    `;

    document.getElementById("stage9Finish").addEventListener("click", () => {
      this.game.temporalChoice.continueAfterConsequence();
    });

    document.getElementById("stage9Back").style.display = "none";
    document.getElementById("stage9Action").style.display = "none";
  }

  getNarrativeStatement(id) {
    if (id === "rewrite") {
      return "Eu não salvei o mundo. Eu escolhi qual mundo tinha direito de existir.";
    }

    if (id === "preserve") {
      return "O mundo continuará imperfeito. Mas as pessoas que vivem nele ainda podem escolher o que fazer com essa imperfeição.";
    }

    return "Destruir o sistema não criou um mundo perfeito. Apenas devolveu a responsabilidade para quem vive nele.";
  }

  predictStability(decision) {
    const current = this.game.state.player.stats.temporalStability;
    return clamp(current + decision.costProfile.temporalStability, 0, 100);
  }

  handleBack() {
    const phase = this.game.state.stage9.phase;

    if (phase === "selection") {
      this.renderBriefing();
      return;
    }

    if (phase === "confirmation") {
      this.renderDecisionSelection();
      return;
    }
  }

  handleAction() {
    const phase = this.game.state.stage9.phase;

    if (phase === "briefing") {
      this.renderDecisionSelection();
      return;
    }

    if (phase === "selection") {
      this.renderBriefing();
      return;
    }

    if (phase === "confirmation") {
      this.game.temporalChoice.confirmDecision();
      return;
    }

    if (phase === "consequence") {
      this.game.temporalChoice.continueAfterConsequence();
    }
  }
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function escapeStage9(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage9(game) {
  stage9Ensure(game.state);

  if (!game.temporalChoice) {
    game.temporalChoice = new TemporalChoiceManager(game);
  }

  if (!game.stage9UI) {
    game.stage9UI = new Stage9UI(game);
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage9Ensure(game.state);
    game.stage9UI.close();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage9Ensure(game.state);
      if (game.state.stage9.active) {
        game.stage9UI.open();
        game.stage9UI.renderDecisionSelection();
      }
    }, 450);
  };

  const watcher = window.setInterval(() => {
    if (!window.game?.state) return;

    stage9Ensure(window.game.state);

    const state = window.game.state;

    if (
      state.world?.actId === "act9" &&
      state.stage8?.finished &&
      !state.stage9.started
    ) {
      state.stage9.started = true;
      window.game.temporalChoice.begin();
      window.clearInterval(watcher);
    }
  }, 650);

  game.stage9Open = () => {
    stage9Ensure(game.state);
    game.temporalChoice.begin();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage9(window.game);
  } else {
    console.error("Stage 9: GameController ausente.");
  }
});


/* ============================================================================
   CONSOLIDAÇÃO — ETAPA 10 JS
   ============================================================================ */

/* ============================================================================
   JESUS CHRONICLES — ETAPA 10
   ATO X — O FINAL
   ----------------------------------------------------------------------------
   Integração completa das consequências acumuladas da campanha.

   Finais previstos na história:
     1. Final Verdadeiro — A Liberdade
     2. Final Trágico — O Mundo Perfeito
     3. Final Esperançoso — A Reconstrução
     4. Final Secreto — O Observador
     5. Final Alternativo — O Círculo

   Este módulo:
   - consolida o estado de todos os atos;
   - calcula um "World State Snapshot";
   - calcula o perfil moral/narrativo final;
   - seleciona finais pelas decisões e condições acumuladas;
   - implementa explicitamente O Observador e O Círculo;
   - registra o final canônico da sessão;
   - fornece epílogo e relatório das consequências.
   ============================================================================ */

"use strict";

const STAGE10_VERSION = "1.0.0";

const STAGE10_DB = {
  endings: {
    freedom: {
      id: "freedom",
      code: "TRUE",
      title: "FINAL VERDADEIRO — A LIBERDADE",
      subtitle: "O mundo não precisa de um salvador. Precisa de pessoas dispostas a lutar por ele.",
      priority: 30,
      colorClass: "freedom",
      summary:
        "O protagonista rejeita o papel de dono do destino humano e ajuda a desmontar os mecanismos de controle.",
      epilogue:
        "O sistema não desaparece de uma vez. Cidades, comunidades e antigos adversários precisam aprender a decidir sem uma autoridade central determinando cada passo.",
      consequence:
        "A liberdade aumenta, o controle central diminui e a responsabilidade volta para as pessoas.",
      conditions: [
        "Caminho C — LIBERTAR",
        "Liberdade final elevada",
        "Controle final baixo ou moderado",
        "A campanha não pode terminar em ruptura temporal extrema"
      ]
    },

    perfect: {
      id: "perfect",
      code: "TRAGIC",
      title: "FINAL TRÁGICO — O MUNDO PERFEITO",
      subtitle: "O mundo é calmo. A pergunta é: quem escolheu esse mundo?",
      priority: 20,
      colorClass: "perfect",
      summary:
        "O protagonista reescreve a realidade e obtém uma versão aparentemente perfeita do futuro.",
      epilogue:
        "Não há as mesmas guerras, as mesmas estruturas ou as mesmas dores. Mas pessoas, memórias e possibilidades foram alteradas no processo.",
      consequence:
        "A estabilidade parece maior do que o esperado, porém o preço foi a perda de continuidade histórica.",
      conditions: [
        "Caminho A — REESCREVER",
        "Reescrita temporal aplicada",
        "Grande alteração de mundo"
      ]
    },

    reconstruction: {
      id: "reconstruction",
      code: "HOPE",
      title: "FINAL ESPERANÇOSO — A RECONSTRUÇÃO",
      subtitle: "O futuro continua difícil. Mas agora as pessoas sabem que é responsabilidade delas.",
      priority: 15,
      colorClass: "reconstruction",
      summary:
        "O protagonista preserva a história e transforma o futuro pela ação coletiva.",
      epilogue:
        "Comunidades reconstruídas, alianças antigas e novas estruturas começam a aprender como conviver sem repetir o sistema de controle.",
      consequence:
        "A linha temporal permanece relativamente estável e a mudança acontece lentamente.",
      conditions: [
        "Caminho B — PRESERVAR",
        "Estabilidade temporal preservada",
        "Esperança elevada ou relações com aliados suficientemente fortes"
      ]
    },

    observer: {
      id: "observer",
      code: "SECRET",
      title: "FINAL SECRETO — O OBSERVADOR",
      subtitle: "Às vezes a decisão mais radical é recusar o papel de quem decide.",
      priority: 90,
      colorClass: "observer",
      summary:
        "O protagonista recusa aplicar a decisão final, deixa a máquina ativa e se retira para observar.",
      epilogue:
        "O protagonista não escolhe reescrever, preservar nem destruir. Ele mantém o mecanismo ativo, abandona a posição de autoridade e passa a observar as consequências sem assumir o controle.",
      consequence:
        "O estado do mundo permanece indefinido. A máquina continua sendo uma possibilidade aberta.",
      conditions: [
        "Desbloqueado por comportamento de indecisão responsável",
        "Grande cautela temporal",
        "Recusa explícita do papel de salvador",
        "Não aplicar nenhum dos três caminhos"
      ],
      secretRule:
        "O jogador precisa recusar a aplicação da decisão final no Ato IX."
    },

    circle: {
      id: "circle",
      code: "CIRCLE",
      title: "FINAL ALTERNATIVO — O CÍRCULO",
      subtitle: "A máquina nunca foi criada para mudar o passado. Foi criada para trazer você até este ponto.",
      priority: 100,
      colorClass: "circle",
      summary:
        "A jornada inteira revela-se parte de um ciclo temporal.",
      epilogue:
        "O protagonista percebe que registros, escolhas, dados temporais e a própria missão sempre conduziram ao mesmo ponto. O Cronófago não era apenas uma máquina de mudança: era o mecanismo que produzia o percurso necessário para completar o ciclo.",
      consequence:
        "A campanha atual se torna uma causa da própria campanha. O futuro criou as condições para gerar o passado que criaria aquele futuro.",
      conditions: [
        "Condições de convergência temporal",
        "Conhecimento de que a missão foi prevista",
        "Fortes evidências sobre a origem externa dos dados temporais",
        "Fratura/branch temporal ou combinação de sinais suficientes",
        "A rota do ciclo precisa ser reconhecida pelo protagonista"
      ],
      secretRule:
        "É um final oculto: só aparece quando as condições de convergência são atendidas."
    }
  }
};

function stage10Ensure(state) {
  state.stage10 = state.stage10 || {};
  const s = state.stage10;

  s.version = STAGE10_VERSION;
  s.active = Boolean(s.active);
  s.started = Boolean(s.started);
  s.finished = Boolean(s.finished);

  s.phase = s.phase || "calculation";
  s.selectedEndingId = s.selectedEndingId || null;
  s.finalConfirmed = Boolean(s.finalConfirmed);
  s.observerRefusal = Boolean(s.observerRefusal);
  s.circleRecognition = Boolean(s.circleRecognition);

  s.unlocks = s.unlocks || {
    observer: false,
    circle: false
  };

  s.worldSnapshot = s.worldSnapshot || {};
  s.finalMetrics = s.finalMetrics || {};
  s.log = Array.isArray(s.log) ? s.log : [];

  s.endingHistory = Array.isArray(s.endingHistory)
    ? s.endingHistory
    : [];
}

class WorldStateIntegrator {
  constructor(game) {
    this.game = game;
  }

  buildSnapshot() {
    const state = this.game.state;
    const player = state.player?.stats || {};
    const stage6 = state.stage6 || {};
    const stage7 = state.stage7 || {};
    const stage8 = state.stage8 || {};
    const stage9 = state.stage9 || {};

    const recruited = Array.isArray(stage6.recruited) ? stage6.recruited.length : 0;
    const team = Array.isArray(stage6.team) ? stage6.team.length : 0;
    const clues = Array.isArray(state.stage5?.discoveredClues)
      ? state.stage5.discoveredClues.length
      : 0;

    const warsWon = Object.values(stage8.missionStates || {})
      .filter((m) => m.status === "completed")
      .length;

    const diplomacyAgreements =
      Array.isArray(stage8.diplomacy?.agreements)
        ? stage8.diplomacy.agreements.length
        : 0;

    const diplomacyTensions =
      Array.isArray(stage8.diplomacy?.tensions)
        ? stage8.diplomacy.tensions.length
        : 0;

    const liberationPath = stage9.timeline?.branch === "LIBERATE";
    const preservePath = stage9.timeline?.branch === "PRESERVE";
    const rewritePath = stage9.timeline?.branch === "REWRITE";

    const snapshot = {
      act: state.world?.actId || "unknown",
      era: state.world?.era || "unknown",
      worldStatus: state.world?.worldStatus || "unknown",

      player: {
        hope: Number(player.hope || 0),
        freedom: Number(player.freedom || 0),
        control: Number(player.control || 0),
        temporalStability: Number(player.temporalStability || 0)
      },

      investigation: {
        clues,
        archiveNamed: Boolean(stage7.flags?.archiveNamed),
        philosophyUnderstood: Boolean(stage7.flags?.philosophyUnderstood),
        aiConfirmed: Boolean(stage7.flags?.aiConfirmed),
        temporalLinkConfirmed: Boolean(stage7.flags?.temporalLinkConfirmed)
      },

      allies: {
        recruited,
        selected: team,
        alliesLost: Number(stage9.worldConsequences?.alliesLost || 0)
      },

      war: {
        missionsCompleted: warsWon,
        agreements: diplomacyAgreements,
        tensions: diplomacyTensions,
        firstBattle: Boolean(stage8.flags?.firstBattleCompleted),
        firstInfiltration: Boolean(stage8.flags?.firstInfiltrationCompleted),
        firstDiplomacy: Boolean(stage8.flags?.firstDiplomacyCompleted)
      },

      timeline: {
        branch: stage9.timeline?.branch || "MAIN",
        stabilityBefore: Number(stage9.timeline?.stabilityBefore || 0),
        stabilityAfter: Number(stage9.timeline?.stabilityAfter || player.temporalStability || 0),
        fractureCount: Number(stage9.timeline?.fractureCount || 0),
        rewriteApplied: Boolean(stage9.flags?.realityShifted),
        historyPreserved: Boolean(stage9.flags?.historyPreserved),
        controlDestroyed: Boolean(stage9.flags?.controlDestroyed)
      },

      worldConsequences: {
        peopleErased: Number(stage9.worldConsequences?.peopleErased || 0),
        culturesChanged: Number(stage9.worldConsequences?.culturesChanged || 0),
        memoriesChanged: Number(stage9.worldConsequences?.memoriesChanged || 0),
        regionsChanged: Number(stage9.worldConsequences?.regionsChanged || 0),
        factionControlDelta: Number(stage9.worldConsequences?.factionControlDelta || 0),
        publicFreedomDelta: Number(stage9.worldConsequences?.publicFreedomDelta || 0)
      },

      flags: {
        futureBriefingRequired: Boolean(state.narrative?.flags?.futureBriefingRequired),
        temporalChoiceMade: Boolean(stage9.flags?.temporalChoiceMade),
        realityShifted: Boolean(stage9.flags?.realityShifted),
        historyPreserved: Boolean(stage9.flags?.historyPreserved),
        controlDestroyed: Boolean(stage9.flags?.controlDestroyed),
        archiveNamed: Boolean(stage7.flags?.archiveNamed),
        temporalLinkConfirmed: Boolean(stage7.flags?.temporalLinkConfirmed)
      },

      path: {
        rewritePath,
        preservePath,
        liberationPath
      }
    };

    state.stage10.worldSnapshot = snapshot;
    return snapshot;
  }

  calculateMetrics(snapshot) {
    const s = snapshot;

    const freedomScore =
      s.player.freedom +
      s.worldConsequences.publicFreedomDelta +
      (s.timeline.controlDestroyed ? 15 : 0) +
      s.war.agreements * 2 -
      s.player.control;

    const hopeScore =
      s.player.hope +
      s.allies.recruited * 3 +
      s.war.agreements * 2;

    const stabilityScore =
      s.player.temporalStability -
      s.timeline.fractureCount * 10 -
      s.worldConsequences.memoriesChanged / 10;

    const knowledgeScore =
      s.investigation.clues * 4 +
      (s.investigation.archiveNamed ? 8 : 0) +
      (s.investigation.aiConfirmed ? 8 : 0) +
      (s.investigation.temporalLinkConfirmed ? 12 : 0);

    const responsibilityScore =
      s.player.freedom +
      s.investigation.philosophyUnderstood * 8 +
      s.war.diplomacyAgreements * 3 -
      s.player.control;

    const cycleScore =
      (s.investigation.temporalLinkConfirmed ? 25 : 0) +
      (s.timeline.fractureCount * 10) +
      (s.timeline.rewriteApplied ? 8 : 0) +
      (s.worldConsequences.regionsChanged * 2) +
      (s.investigation.archiveNamed ? 12 : 0);

    const metrics = {
      freedomScore: Math.round(freedomScore),
      hopeScore: Math.round(hopeScore),
      stabilityScore: Math.round(stabilityScore),
      knowledgeScore: Math.round(knowledgeScore),
      responsibilityScore: Math.round(responsibilityScore),
      cycleScore: Math.round(cycleScore)
    };

    this.game.state.stage10.finalMetrics = metrics;
    return metrics;
  }

  calculate() {
    const snapshot = this.buildSnapshot();
    const metrics = this.calculateMetrics(snapshot);

    return { snapshot, metrics };
  }

  checkObserverUnlock() {
    const state = this.game.state.stage9;
    const player = this.game.state.player.stats;
    const stage10 = this.game.state.stage10;

    const refusal =
      Boolean(state.observerRefusal) ||
      state.phase === "observer_refusal";

    const cautious =
      Number(player.temporalStability || 0) >= 72 &&
      Number(player.control || 0) <= 65;

    const noDecision =
      !state.flags?.temporalChoiceMade ||
      !state.decisionId ||
      !state.confirmed;

    const unlocked = refusal || (cautious && noDecision);

    stage10.unlocks.observer = unlocked;
    return unlocked;
  }

  checkCircleUnlock() {
    const result = this.calculate();
    const s = result.snapshot;
    const m = result.metrics;

    const temporalLink = s.investigation.temporalLinkConfirmed;
    const archiveKnown = s.investigation.archiveNamed;
    const externalSystem = Boolean(
      this.game.state.stage5?.discoveredClues?.includes("externalSource")
    );

    const branchSignal =
      s.timeline.fractureCount >= 1 ||
      s.timeline.rewriteApplied ||
      s.path.rewritePath;

    const cycleConverged =
      temporalLink &&
      archiveKnown &&
      externalSystem &&
      branchSignal &&
      m.cycleScore >= 42;

    this.game.state.stage10.unlocks.circle = cycleConverged;
    return cycleConverged;
  }

  calculateEndingAvailability() {
    const snapshot = this.buildSnapshot();
    const metrics = this.calculateMetrics(snapshot);

    const endings = STAGE10_DB.endings;

    const observer = this.checkObserverUnlock();
    const circle = this.checkCircleUnlock();

    const result = [];

    for (const ending of Object.values(endings)) {
      let available = false;
      let reason = "";

      if (ending.id === "circle") {
        available = circle;
        reason = available
          ? "A convergência temporal foi alcançada."
          : "Ainda faltam condições de convergência temporal.";
      } else if (ending.id === "observer") {
        available = observer;
        reason = available
          ? "O caminho do Observador foi desbloqueado."
          : "O jogador ainda não cumpriu as condições secretas.";
      } else if (ending.id === "freedom") {
        available =
          snapshot.timeline.controlDestroyed === true ||
          snapshot.path.liberationPath;
        reason = available
          ? "O sistema de controle foi destruído."
          : "É necessário concluir o caminho C — LIBERTAR.";
      } else if (ending.id === "perfect") {
        available =
          snapshot.timeline.rewriteApplied === true ||
          snapshot.path.rewritePath;
        reason = available
          ? "A realidade foi reescrita."
          : "É necessário concluir o caminho A — REESCREVER.";
      } else if (ending.id === "reconstruction") {
        available =
          snapshot.timeline.historyPreserved === true ||
          snapshot.path.preservePath;
        reason = available
          ? "A história foi preservada."
          : "É necessário concluir o caminho B — PRESERVAR.";
      }

      result.push({ ...ending, available, reason });
    }

    return {
      snapshot,
      metrics,
      endings: result.sort((a, b) => b.priority - a.priority)
    };
  }
}

class EndingManager {
  constructor(game) {
    this.game = game;
  }

  ensure() {
    stage10Ensure(this.game.state);
  }

  calculate() {
    return this.game.worldIntegrator.calculateEndingAvailability();
  }

  choose(id) {
    this.ensure();

    const result = this.calculate();
    const ending = result.endings.find((item) => item.id === id);

    if (!ending?.available) {
      this.game.ui.notify(
        "FINAL BLOQUEADO",
        ending?.reason || "Este final não está disponível.",
        "error"
      );
      return;
    }

    this.game.state.stage10.selectedEndingId = id;
    this.game.state.stage10.log.unshift({
      type: "endingSelected",
      endingId: id,
      at: new Date().toISOString()
    });

    if (id === "observer") {
      this.game.state.stage10.observerRefusal = true;
    }

    if (id === "circle") {
      this.game.state.stage10.circleRecognition = true;
    }

    this.game.stage10UI.renderEndingConfirmation(ending, result);
  }

  confirm() {
    const id = this.game.state.stage10.selectedEndingId;
    const ending = STAGE10_DB.endings[id];

    if (!ending) return;

    this.game.state.stage10.finalConfirmed = true;
    this.game.state.stage10.finished = true;
    this.game.state.stage10.active = false;

    this.game.state.stage10.endingHistory.push({
      endingId: id,
      timestamp: new Date().toISOString()
    });

    this.applyFinalWorldState(id);
    this.game.stage10UI.renderEpilogue(ending);
  }

  applyFinalWorldState(id) {
    const state = this.game.state;
    const snapshot = this.game.worldIntegrator.buildSnapshot();

    state.world.actId = "finale";
    state.world.worldStatus = `FINAL — ${STAGE10_DB.endings[id].title}`;

    if (id === "freedom") {
      state.world.era = "FUTURO — RECONSTRUÇÃO LIVRE";
      state.world.locationId = "commandCenter";
      state.player.stats.freedom = clamp(state.player.stats.freedom + 10, 0, 100);
      state.player.stats.control = clamp(state.player.stats.control - 10, 0, 100);
    }

    if (id === "perfect") {
      state.world.era = "NOVA LINHA TEMPORAL";
      state.world.locationId = "commandCenter";
      state.player.stats.temporalStability = clamp(
        state.player.stats.temporalStability - 5,
        0,
        100
      );
    }

    if (id === "reconstruction") {
      state.world.era = "FUTURO — RECONSTRUÇÃO";
      state.world.locationId = "commandCenter";
      state.player.stats.hope = clamp(state.player.stats.hope + 10, 0, 100);
      state.player.stats.freedom = clamp(state.player.stats.freedom + 7, 0, 100);
    }

    if (id === "observer") {
      state.world.era = "LINHA TEMPORAL SUSPENSA";
      state.world.locationId = "chronoChamber";
      state.world.worldStatus = "FINAL SECRETO — OBSERVADOR";
      state.stage9.observerRefusal = true;
    }

    if (id === "circle") {
      state.world.era = "CICLO TEMPORAL";
      state.world.locationId = "chronoChamber";
      state.world.worldStatus = "FINAL ALTERNATIVO — O CÍRCULO";
      state.stage9.flags.finalPathPrepared = true;
    }

    state.stage10.worldSnapshot = {
      ...snapshot,
      finalEnding: id,
      finalWorldStatus: state.world.worldStatus,
      finalEra: state.world.era,
      finalizedAt: new Date().toISOString()
    };

    state.stage10.log.unshift({
      type: "finalWorldStateApplied",
      endingId: id,
      worldStatus: state.world.worldStatus,
      at: new Date().toISOString()
    });
  }
}

class Stage10UI {
  constructor(game) {
    this.game = game;
    this.root = null;
    this.initOverlay();
  }

  initOverlay() {
    if (document.getElementById("stage10Overlay")) {
      this.root = document.getElementById("stage10Overlay");
      return;
    }

    this.root = document.createElement("div");
    this.root.id = "stage10Overlay";
    this.root.className = "overlay stage10-overlay";
    this.root.hidden = true;

    this.root.innerHTML = `
      <div class="modal-panel stage10-modal">
        <div class="stage10-header">
          <div>
            <span class="modal-kicker">ATO X</span>
            <h2>O FINAL</h2>
          </div>
          <div class="stage10-status">
            <span id="stage10StatusDot"></span>
            <strong>ESTADO GLOBAL</strong>
          </div>
        </div>

        <div class="stage10-main">
          <aside class="stage10-sidebar">
            <div class="stage10-side-title">ESTADO DO MUNDO</div>
            <div id="stage10WorldState" class="stage10-world-card"></div>

            <div class="stage10-side-title">MÉTRICAS FINAIS</div>
            <div id="stage10Metrics" class="stage10-metrics"></div>

            <div class="stage10-side-title">CONSEQUÊNCIAS</div>
            <div id="stage10Consequences" class="stage10-consequences"></div>
          </aside>

          <section id="stage10Content" class="stage10-content"></section>
        </div>

        <div class="stage10-footer">
          <button id="stage10Back" class="secondary-button" type="button">VOLTAR</button>
          <button id="stage10Action" class="primary-button" type="button">CALCULAR FINAIS</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.root);

    document.getElementById("stage10Back").addEventListener("click", () => {
      this.renderFinalList();
    });

    document.getElementById("stage10Action").addEventListener("click", () => {
      this.action();
    });
  }

  open() {
    this.root.hidden = false;
    this.render();
  }

  close() {
    this.root.hidden = true;
  }

  render() {
    const result = this.game.endingManager.calculate();
    this.renderSidebar(result);

    if (this.game.state.stage10.finalConfirmed) {
      this.renderEpilogue(
        STAGE10_DB.endings[this.game.state.stage10.selectedEndingId]
      );
      return;
    }

    this.renderFinalList();
  }

  renderSidebar(result = this.game.endingManager.calculate()) {
    const snapshot = result.snapshot;
    const metrics = result.metrics;

    document.getElementById("stage10WorldState").innerHTML = `
      <span>ERA</span>
      <strong>${escapeStage10(snapshot.era)}</strong>
      <small>${escapeStage10(snapshot.worldStatus)}</small>
      <div class="stage10-world-divider"></div>
      <span>CAMINHO TEMPORAL</span>
      <strong>${escapeStage10(snapshot.timeline.branch)}</strong>
    `;

    const metricsNode = document.getElementById("stage10Metrics");
    metricsNode.innerHTML = Object.entries(metrics).map(([key, value]) => `
      <div>
        <span>${escapeStage10(metricLabel(key))}</span>
        <strong>${value}</strong>
      </div>
    `).join("");

    const c = snapshot.worldConsequences;
    document.getElementById("stage10Consequences").innerHTML = `
      <div><span>APAGADOS</span><strong>${c.peopleErased.toLocaleString("pt-BR")}</strong></div>
      <div><span>CULTURAS</span><strong>${c.culturesChanged}</strong></div>
      <div><span>MEMÓRIAS</span><strong>${c.memoriesChanged}</strong></div>
      <div><span>ALIADOS</span><strong>${c.alliesLost}</strong></div>
      <div><span>REGIÕES</span><strong>${c.regionsChanged}</strong></div>
    `;
  }

  renderFinalList() {
    const result = this.game.endingManager.calculate();
    const content = document.getElementById("stage10Content");

    content.innerHTML = `
      <div class="stage10-list-view">
        <div class="stage10-kicker">CONSOLIDAÇÃO DA CAMPANHA</div>
        <h3>A história chegou ao ponto final.</h3>
        <p class="stage10-lead">
          O final não é calculado apenas pelo último botão pressionado.
          O sistema considera as consequências acumuladas desde o início da jornada.
        </p>

        <div class="stage10-ending-grid"></div>
      </div>
    `;

    const grid = content.querySelector(".stage10-ending-grid");

    for (const ending of result.endings) {
      const card = document.createElement("article");
      card.className = `stage10-ending-card ${ending.colorClass} ${ending.available ? "" : "locked"}`;

      card.innerHTML = `
        <div class="stage10-ending-top">
          <span>${escapeStage10(ending.code)}</span>
          <strong>${ending.available ? "DESBLOQUEADO" : "BLOQUEADO"}</strong>
        </div>
        <h4>${escapeStage10(ending.title)}</h4>
        <p class="stage10-ending-subtitle">${escapeStage10(ending.subtitle)}</p>
        <p>${escapeStage10(ending.summary)}</p>

        <div class="stage10-condition">
          <span>CONDIÇÕES</span>
          <ul>
            ${ending.conditions.map((item) => `<li>${escapeStage10(item)}</li>`).join("")}
          </ul>
        </div>

        <small class="stage10-reason">
          ${escapeStage10(ending.reason)}
        </small>

        <button type="button"
          class="primary-button"
          data-stage10-ending="${ending.id}"
          ${ending.available ? "" : "disabled"}>
          ${ending.available ? "VER FINAL" : "BLOQUEADO"}
        </button>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll("[data-stage10-ending]").forEach((button) => {
      button.addEventListener("click", () => {
        this.game.endingManager.choose(button.dataset.stage10Ending);
      });
    });

    document.getElementById("stage10Back").style.display = "none";
    document.getElementById("stage10Action").style.display = "inline-flex";
    document.getElementById("stage10Action").textContent = "ATUALIZAR CÁLCULO";
  }

  renderEndingConfirmation(ending, result) {
    const content = document.getElementById("stage10Content");

    content.innerHTML = `
      <div class="stage10-confirm">
        <div class="stage10-ending-emblem ${ending.colorClass}">
          ${escapeStage10(ending.code)}
        </div>

        <div class="stage10-kicker">FINAL SELECIONADO</div>
        <h3>${escapeStage10(ending.title)}</h3>
        <p class="stage10-lead">${escapeStage10(ending.subtitle)}</p>

        <div class="stage10-confirm-summary">
          <span>CONSEQUÊNCIA PRINCIPAL</span>
          <p>${escapeStage10(ending.consequence)}</p>
        </div>

        <div class="stage10-final-warning">
          <span>ESTADO GLOBAL</span>
          <p>
            Estabilidade: ${result.metrics.stabilityScore} •
            Liberdade: ${result.metrics.freedomScore} •
            Conhecimento: ${result.metrics.knowledgeScore} •
            Ciclo: ${result.metrics.cycleScore}
          </p>
        </div>

        <button id="stage10ConfirmEnding" class="primary-button" type="button">
          CONFIRMAR ESTE FINAL
        </button>
      </div>
    `;

    document.getElementById("stage10ConfirmEnding").addEventListener("click", () => {
      this.game.endingManager.confirm();
    });

    document.getElementById("stage10Back").style.display = "inline-flex";
    document.getElementById("stage10Action").style.display = "none";
  }

  renderEpilogue(ending) {
    if (!ending) return;

    const content = document.getElementById("stage10Content");
    const snapshot = this.game.state.stage10.worldSnapshot;

    content.innerHTML = `
      <div class="stage10-epilogue ${ending.colorClass}">
        <div class="stage10-epilogue-mark">${escapeStage10(ending.code)}</div>
        <div class="stage10-kicker">EPÍLOGO</div>
        <h3>${escapeStage10(ending.title)}</h3>
        <p class="stage10-epilogue-subtitle">${escapeStage10(ending.subtitle)}</p>

        <div class="stage10-epilogue-text">
          <p>${escapeStage10(ending.epilogue)}</p>
        </div>

        <div class="stage10-world-final">
          <div>
            <span>ESTADO FINAL</span>
            <strong>${escapeStage10(snapshot.finalWorldStatus || this.game.state.world.worldStatus)}</strong>
          </div>
          <div>
            <span>ERA FINAL</span>
            <strong>${escapeStage10(snapshot.finalEra || this.game.state.world.era)}</strong>
          </div>
          <div>
            <span>CAMINHO</span>
            <strong>${escapeStage10(this.game.state.stage9.timeline.branch)}</strong>
          </div>
        </div>

        ${ending.id === "observer" ? this.renderObserverPanel() : ""}
        ${ending.id === "circle" ? this.renderCirclePanel() : ""}

        <div class="stage10-final-note">
          ${escapeStage10(ending.consequence)}
        </div>

        <button id="stage10CloseEnding" class="primary-button" type="button">
          ENCERRAR CRÔNICA
        </button>
      </div>
    `;

    document.getElementById("stage10CloseEnding").addEventListener("click", () => {
      this.close();
    });

    document.getElementById("stage10Back").style.display = "none";
    document.getElementById("stage10Action").style.display = "none";
    document.getElementById("stage10StatusDot").classList.add("final");
  }

  renderObserverPanel() {
    return `
      <div class="stage10-secret-panel observer">
        <span>FINAL SECRETO</span>
        <strong>O OBSERVADOR</strong>
        <p>
          Você não escolheu governar o passado, preservar um sistema ou libertar o mundo
          por decreto. A máquina continua ativa. Você se afasta.
        </p>
        <p>
          A última decisão não é produzir uma realidade nova.
          É recusar a posição de quem acredita possuir autoridade suficiente para decidir
          o destino de todos.
        </p>
      </div>
    `;
  }

  renderCirclePanel() {
    return `
      <div class="stage10-secret-panel circle">
        <span>FINAL ALTERNATIVO</span>
        <strong>O CÍRCULO</strong>
        <p>
          Os dados temporais, o Cronófago, a organização, o encontro e a missão
          nunca foram elementos independentes.
        </p>
        <p>
          A máquina não foi construída apenas para mudar o passado.
          Ela foi construída para levar você até o ponto em que descobriria que
          sua própria jornada era parte do mecanismo.
        </p>
        <div class="stage10-loop">
          FUTURO → CRONÓFAGO → PASSADO → ENCONTRO → RETORNO → ARQUIVO ZERO → FUTURO
        </div>
      </div>
    `;
  }

  action() {
    this.render();
  }
}

function metricLabel(key) {
  const labels = {
    freedomScore: "LIBERDADE",
    hopeScore: "ESPERANÇA",
    stabilityScore: "ESTABILIDADE",
    knowledgeScore: "CONHECIMENTO",
    responsibilityScore: "RESPONSABILIDADE",
    cycleScore: "CONVERGÊNCIA"
  };
  return labels[key] || key.toUpperCase();
}

function escapeStage10(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attachStage10(game) {
  stage10Ensure(game.state);

  if (!game.worldIntegrator) {
    game.worldIntegrator = new WorldStateIntegrator(game);
  }

  if (!game.endingManager) {
    game.endingManager = new EndingManager(game);
  }

  if (!game.stage10UI) {
    game.stage10UI = new Stage10UI(game);
  }

  const originalStartNewGame = game.startNewGame.bind(game);
  game.startNewGame = function () {
    originalStartNewGame();
    stage10Ensure(game.state);
    game.stage10UI.close();
  };

  const originalLoadGame = game.loadGame.bind(game);
  game.loadGame = function () {
    originalLoadGame();
    window.setTimeout(() => {
      stage10Ensure(game.state);
      if (game.state.stage10.active || game.state.stage10.finalConfirmed) {
        game.stage10UI.open();
      }
    }, 500);
  };

  // Ao entrar no Ato X, calcula e abre os finais.
  const watcher = window.setInterval(() => {
    if (!window.game?.state) return;

    stage10Ensure(window.game.state);
    const state = window.game.state;

    if (
      state.world?.actId === "act10" &&
      state.stage9?.flags?.finalPathPrepared &&
      !state.stage10.started
    ) {
      state.stage10.started = true;
      state.stage10.active = true;
      window.game.state.world.worldStatus = "ATO X — FINAIS MÚLTIPLOS";
      window.game.stage10UI.open();
      window.clearInterval(watcher);
    }
  }, 700);

  game.stage10Open = () => {
    stage10Ensure(game.state);
    game.state.stage10.active = true;
    game.stage10UI.open();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.game) {
    attachStage10(window.game);
  } else {
    console.error("Stage 10: GameController ausente.");
  }
});
