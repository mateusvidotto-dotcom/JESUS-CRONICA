/* ==========================================================================
   JESUS CHRONICLES
   CORE ENGINE
   ==========================================================================
   Versão: 1.1.0

   Arquitetura:
   - EventBus
   - GameLogger
   - StateManager
   - AudioManager
   - SaveManager
   - MissionManager
   - CodexManager
   - UIManager
   - NarrativeEngine
   - SettingsManager
   - ParticleSystem
   - VisualLab
   - GameController

   Objetivos:
   - Inicialização segura
   - Sistema narrativo robusto
   - Escolhas realmente funcionais
   - Consequências persistentes
   - Salvamento local
   - Autosave
   - Missões
   - Códex
   - HUD
   - Teclado
   - Laboratório visual
   - Diagnóstico
   - Proteção contra duplo clique
   - Proteção contra cenas inconsistentes
   - Preservação das estruturas existentes
   ========================================================================== */

(() => {
  'use strict';

  /* ==========================================================================
     CONFIGURAÇÃO GLOBAL
     ========================================================================== */

  const VERSION = '1.1.0';

  const SAVE_KEY =
    'jesus-chronicles:save:v1';

  const SETTINGS_KEY =
    'jesus-chronicles:settings:v1';

  const AUTOSAVE_DELAY =
    700;

  const PLAY_CLOCK_INTERVAL =
    1000;

  const MIN_STAT =
    0;

  const MAX_STAT =
    100;

  /* ==========================================================================
     UTILITÁRIOS
     ========================================================================== */

  const clamp = (
    value,
    min = MIN_STAT,
    max = MAX_STAT
  ) => {
    const numeric =
      Number(value);

    if (!Number.isFinite(numeric)) {
      return min;
    }

    return Math.min(
      max,
      Math.max(
        min,
        numeric
      )
    );
  };

  const safeText = (
    value
  ) => String(
    value ?? ''
  );

  const deepClone = (
    value
  ) => {
    try {
      return JSON.parse(
        JSON.stringify(
          value
        )
      );
    } catch {
      return value;
    }
  };

  const nowISO = () =>
    new Date().toISOString();

  const byId = (
    id
  ) =>
    document.getElementById(
      id
    );

  const qs = (
    selector,
    root = document
  ) =>
    root.querySelector(
      selector
    );

  const qsa = (
    selector,
    root = document
  ) =>
    [
      ...root.querySelectorAll(
        selector
      )
    ];

  const isObject = (
    value
  ) =>
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(
      value
    );

  const escapeHTML = (
    value
  ) =>
    safeText(value)
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );

  const formatDate = (
    iso
  ) => {
    if (!iso) {
      return 'Nenhum registro';
    }

    try {
      return new Intl.DateTimeFormat(
        'pt-BR',
        {
          dateStyle:
            'short',

          timeStyle:
            'short'
        }
      ).format(
        new Date(
          iso
        )
      );
    } catch {
      return 'Registro existente';
    }
  };

  /* ==========================================================================
     EVENT BUS
     ========================================================================== */

  class EventBus {
    constructor(
      logger
    ) {
      this.logger =
        logger;

      this.events =
        new Map();
    }

    on(
      name,
      callback
    ) {
      if (
        !this.events.has(
          name
        )
      ) {
        this.events.set(
          name,
          new Set()
        );
      }

      this.events
        .get(name)
        .add(
          callback
        );

      return () =>
        this.off(
          name,
          callback
        );
    }

    off(
      name,
      callback
    ) {
      this.events
        .get(name)
        ?.delete(
          callback
        );
    }

    emit(
      name,
      payload
    ) {
      this.logger?.trackEvent(
        name,
        payload
      );

      const listeners =
        this.events.get(
          name
        );

      if (!listeners) {
        return;
      }

      for (
        const callback
        of [
          ...listeners
        ]
      ) {
        try {
          callback(
            payload
          );
        } catch (
          error
        ) {
          this.logger?.error(
            `Erro no evento ${name}`,
            error
          );
        }
      }
    }
  }

  /* ==========================================================================
     LOGGER
     ========================================================================== */

  class GameLogger {
    constructor() {
      this.entries = [];

      this.maxEntries =
        250;

      this.eventCount =
        0;

      this.mutationCount =
        0;

      this.observerCount =
        0;

      this.lastFlow = {
        event:
          '—',

        function:
          '—',

        state:
          '—',

        dom:
          '—',

        result:
          '—'
      };
    }

    push(
      level,
      message,
      detail = ''
    ) {
      this.entries.push({
        time:
          new Date()
            .toLocaleTimeString(
              'pt-BR'
            ),

        level,

        message:
          safeText(
            message
          ),

        detail:
          safeText(
            detail
          )
      });

      if (
        this.entries.length >
        this.maxEntries
      ) {
        this.entries.splice(
          0,
          this.entries.length -
            this.maxEntries
        );
      }

      if (
        level ===
        'error'
      ) {
        console.error(
          '[JC]',
          message,
          detail
        );
      } else if (
        level ===
        'warn'
      ) {
        console.warn(
          '[JC]',
          message,
          detail
        );
      } else {
        console.info(
          '[JC]',
          message,
          detail
        );
      }
    }

    info(
      message,
      detail = ''
    ) {
      this.push(
        'info',
        message,
        detail
      );
    }

    warn(
      message,
      detail = ''
    ) {
      this.push(
        'warn',
        message,
        detail
      );
    }

    error(
      message,
      error
    ) {
      this.push(
        'error',
        message,
        error?.stack ||
          error?.message ||
          error
      );
    }

    trackEvent(
      name,
      payload
    ) {
      this.eventCount += 1;

      this.lastFlow.event =
        safeText(
          name
        );

      this.lastFlow.result =
        payload?.id ||
        payload?.source ||
        'ok';
    }

    mutation(
      path,
      source
    ) {
      this.mutationCount += 1;

      this.lastFlow.function =
        source ||
        'state.patch';

      this.lastFlow.state =
        path;

      this.lastFlow.dom =
        'render';
    }

    latest(
      count = 10
    ) {
      return this.entries.slice(
        -count
      );
    }

    clear() {
      this.entries =
        [];
    }
  }

  /* ==========================================================================
     ESTADO PADRÃO
     ========================================================================== */

  const DEFAULT_STATE = {
    version:
      VERSION,

    phase:
      'title',

    meta: {
      createdAt:
        null,

      updatedAt:
        null,

      playSeconds:
        0,

      lastAutosave:
        null
    },

    player: {
      name:
        'O PROTAGONISTA',

      role:
        'Viajante temporal',

      portrait:
        '01',

      stats: {
        hope:
          45,

        freedom:
          40,

        control:
          55,

        temporal:
          100
      },

      abilities: [
        {
          id:
            'observe',

          name:
            'Leitura de contexto',

          description:
            'Percebe detalhes históricos e sociais.',

          unlocked:
            true
        },

        {
          id:
            'anchor',

          name:
            'Âncora temporal',

          description:
            'Reduz instabilidade após decisões críticas.',

          unlocked:
            true
        },

        {
          id:
            'empathy',

          name:
            'Escuta ativa',

          description:
            'Abre opções de diálogo baseadas em esperança.',

          unlocked:
            false
        }
      ]
    },

    world: {
      location:
        'mega_city',

      discovered: [
        'mega_city'
      ],

      visited: [
        'mega_city'
      ],

      inspectCount:
        0,

      era:
        'FUTURO',

      act:
        'PRÓLOGO'
    },

    narrative: {
      cinematicIndex:
        0,

      currentScene:
        'g_intro',

      act:
        1,

      flags:
        {},

      choices:
        [],

      seenScenes:
        [],

      ending:
        null
    },

    missions: {
      intro: {
        id:
          'intro',

        title:
          'Entenda a missão',

        description:
          'Investigue a instalação e descubra por que você foi escolhido.',

        status:
          'active',

        progress:
          0,

        goal:
          2
      },

      responsibility: {
        id:
          'responsibility',

        title:
          'O peso da escolha',

        description:
          'Tome decisões sem transferir toda a responsabilidade para o passado.',

        status:
          'locked',

        progress:
          0,

        goal:
          3
      },

      truth: {
        id:
          'truth',

        title:
          'O que realmente aconteceu',

        description:
          'Reconstrua o motivo da crise temporal.',

        status:
          'locked',

        progress:
          0,

        goal:
          3
      }
    },

    codex: {
      future: {
        id:
          'future',

        title:
          'O Futuro',

        category:
          'Mundo',

        text:
          'Uma civilização tecnicamente avançada que normalizou crises permanentes.',

        unlocked:
          true
      },

      project: {
        id:
          'project',

        title:
          'Projeto Cronos',

        category:
          'Organização',

        text:
          'Programa experimental de deslocamento temporal.',

        unlocked:
          false
      },

      paradox: {
        id:
          'paradox',

        title:
          'Paradoxo de Responsabilidade',

        category:
          'Teoria',

        text:
          'Quanto mais o presente tenta terceirizar suas escolhas, mais instável se torna a linha temporal.',

        unlocked:
          false
      },

      archive: {
        id:
          'archive',

        title:
          'Arquivo de Ruptura',

        category:
          'História',

        text:
          'Registros censurados sobre a origem da crise global.',

        unlocked:
          false
      }
    },

    settings: {
      fastText:
        false,

      highContrast:
        false,

      reducedMotion:
        false,

      audio:
        true
    },

    statistics: {
      choices:
        0,

      dialogues:
        0,

      inspections:
        0,

      saves:
        0,

      sceneChanges:
        0
    }
  };

  /* ==========================================================================
     STATE MANAGER
     ========================================================================== */

  class StateManager {
    constructor(
      bus,
      logger
    ) {
      this.bus =
        bus;

      this.logger =
        logger;

      this.state =
        deepClone(
          DEFAULT_STATE
        );

      this.silentDepth =
        0;
    }

    snapshot() {
      return deepClone(
        this.state
      );
    }

    get(
      path = ''
    ) {
      if (!path) {
        return this.state;
      }

      return path
        .split('.')
        .reduce(
          (
            current,
            key
          ) =>
            current?.[
              key
            ],
          this.state
        );
    }

    reset(
      preserveSettings = true
    ) {
      const settings =
        preserveSettings
          ? deepClone(
              this.state.settings
            )
          : deepClone(
              DEFAULT_STATE.settings
            );

      this.state =
        deepClone(
          DEFAULT_STATE
        );

      this.state.settings =
        settings;

      this.state.meta.createdAt =
        nowISO();

      this.state.meta.updatedAt =
        nowISO();

      this.emitChange(
        'state:reset',
        {
          path:
            '*',

          source:
            'state.reset'
        }
      );

      return this.state;
    }

    replace(
      next,
      source = 'load'
    ) {
      this.state =
        this.sanitize(
          next
        );

      this.logger.mutation(
        '*',
        source
      );

      this.emitChange(
        'state:changed',
        {
          path:
            '*',

          source,

          state:
            this.snapshot()
        }
      );
    }

    set(
      path,
      value,
      source = 'unknown'
    ) {
      if (!path) {
        return;
      }

      const keys =
        path.split('.');

      let cursor =
        this.state;

      for (
        let i = 0;
        i <
        keys.length - 1;
        i += 1
      ) {
        const key =
          keys[i];

        if (
          !cursor[key] ||
          typeof cursor[key] !==
            'object'
        ) {
          cursor[key] =
            {};
        }

        cursor =
          cursor[key];
      }

      const last =
        keys[
          keys.length - 1
        ];

      const before =
        deepClone(
          cursor[last]
        );

      cursor[last] =
        value;

      this.state.meta.updatedAt =
        nowISO();

      this.logger.mutation(
        path,
        source
      );

      if (
        this.silentDepth ===
        0
      ) {
        this.emitChange(
          'state:changed',
          {
            path,

            before,

            value:
              deepClone(
                value
              ),

            source
          }
        );
      }
    }

    patch(
      path,
      partial,
      source = 'unknown'
    ) {
      const base =
        this.get(
          path
        );

      this.set(
        path,
        {
          ...(isObject(
            base
          )
            ? base
            : {}),

          ...partial
        },
        source
      );
    }

    increment(
      path,
      amount = 1,
      source = 'increment'
    ) {
      const current =
        Number(
          this.get(
            path
          )
        ) || 0;

      this.set(
        path,
        current +
          amount,
        source
      );
    }

    adjustStat(
      key,
      amount,
      source = 'narrative'
    ) {
      const allowed =
        new Set([
          'hope',
          'freedom',
          'control',
          'temporal'
        ]);

      if (
        !allowed.has(
          key
        )
      ) {
        return;
      }

      const path =
        `player.stats.${key}`;

      const current =
        Number(
          this.get(
            path
          )
        ) || 0;

      this.set(
        path,

        clamp(
          current +
            Number(
              amount
            )
        ),

        source
      );
    }

    batch(
      callback,
      source = 'batch'
    ) {
      this.silentDepth +=
        1;

      try {
        callback();
      } finally {
        this.silentDepth -=
          1;
      }

      this.state.meta.updatedAt =
        nowISO();

      this.logger.mutation(
        '*',
        source
      );

      this.emitChange(
        'state:changed',
        {
          path:
            '*',

          source,

          state:
            this.snapshot()
        }
      );
    }

    emitChange(
      eventName,
      payload
    ) {
      this.bus.emit(
        eventName,
        payload
      );
    }

    sanitize(
      input
    ) {
      const output =
        deepClone(
          DEFAULT_STATE
        );

      const merge =
        (
          target,
          source
        ) => {
          if (
            !source ||
            typeof source !==
              'object'
          ) {
            return target;
          }

          for (
            const [
              key,
              value
            ] of Object.entries(
              source
            )
          ) {
            if (
              Array.isArray(
                value
              )
            ) {
              target[key] =
                deepClone(
                  value
                );

              continue;
            }

            if (
              value &&
              typeof value ===
                'object'
            ) {
              target[key] =
                merge(
                  target[key] &&
                    typeof target[
                      key
                    ] ===
                      'object'
                    ? target[key]
                    : {},

                  value
                );

              continue;
            }

            target[key] =
              value;
          }

          return target;
        };

      merge(
        output,
        input
      );

      for (
        const key of [
          'hope',
          'freedom',
          'control',
          'temporal'
        ]
      ) {
        output.player.stats[
          key
        ] =
          clamp(
            output.player.stats[
              key
            ]
          );
      }

      output.version =
        VERSION;

      return output;
    }
  }

  /* ==========================================================================
     AUDIO
     ========================================================================== */

  class AudioManager {
    constructor(
      state,
      logger
    ) {
      this.state =
        state;

      this.logger =
        logger;

      this.context =
        null;

      this.master =
        null;
    }

    ensure() {
      if (
        !this.state.get(
          'settings.audio'
        )
      ) {
        return false;
      }

      try {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) {
          return false;
        }

        if (!this.context) {
          this.context =
            new AudioContext();

          this.master =
            this.context.createGain();

          this.master.gain.value =
            0.07;

          this.master.connect(
            this.context.destination
          );
        }

        if (
          this.context.state ===
          'suspended'
        ) {
          this.context.resume();
        }

        return true;
      } catch (
        error
      ) {
        this.logger.warn(
          'Áudio indisponível',
          error
        );

        return false;
      }
    }

    tone(
      frequency = 440,
      duration = 0.06,
      type = 'sine',
      volume = 0.2,
      delay = 0
    ) {
      if (
        !this.ensure()
      ) {
        return;
      }

      const start =
        this.context.currentTime +
        delay;

      const oscillator =
        this.context.createOscillator();

      const gain =
        this.context.createGain();

      oscillator.type =
        type;

      oscillator.frequency.setValueAtTime(
        frequency,
        start
      );

      gain.gain.setValueAtTime(
        0.0001,
        start
      );

      gain.gain.exponentialRampToValueAtTime(
        Math.max(
          0.001,
          volume
        ),
        start +
          0.01
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start +
          duration
      );

      oscillator.connect(
        gain
      );

      gain.connect(
        this.master
      );

      oscillator.start(
        start
      );

      oscillator.stop(
        start +
          duration +
          0.02
      );
    }

    click() {
      this.tone(
        520,
        0.045,
        'triangle',
        0.18
      );
    }

    confirm() {
      this.tone(
        420,
        0.08,
        'sine',
        0.20
      );

      this.tone(
        660,
        0.11,
        'sine',
        0.15,
        0.05
      );
    }

    choice() {
      this.tone(
        300,
        0.06,
        'triangle',
        0.20
      );

      this.tone(
        480,
        0.09,
        'triangle',
        0.15,
        0.045
      );
    }

    alert() {
      this.tone(
        160,
        0.14,
        'sawtooth',
        0.13
      );
    }
  }

  /* ==========================================================================
     SAVE MANAGER
     ========================================================================== */

  class SaveManager {
    constructor(
      state,
      bus,
      logger,
      notify
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.logger =
        logger;

      this.notify =
        notify;

      this.timer =
        null;
    }

    hasSave() {
      try {
        return Boolean(
          localStorage.getItem(
            SAVE_KEY
          )
        );
      } catch {
        return false;
      }
    }

    readRaw() {
      try {
        const raw =
          localStorage.getItem(
            SAVE_KEY
          );

        if (!raw) {
          return null;
        }

        return JSON.parse(
          raw
        );
      } catch (
        error
      ) {
        this.logger.error(
          'Save corrompido',
          error
        );

        return null;
      }
    }

    migrate(
      payload
    ) {
      if (!payload) {
        return null;
      }

      if (
        payload.state
      ) {
        return {
          ...payload,

          version:
            VERSION,

          state:
            this.state.sanitize(
              payload.state
            )
        };
      }

      return {
        version:
          VERSION,

        timestamp:
          payload.timestamp ||
          nowISO(),

        state:
          this.state.sanitize(
            payload
          )
      };
    }

    save({
      silent = false,
      autosave = false
    } = {}) {
      try {
        const timestamp =
          nowISO();

        if (
          autosave
        ) {
          this.state.set(
            'meta.lastAutosave',
            timestamp,
            'autosave'
          );
        }

        const payload = {
          version:
            VERSION,

          timestamp,

          checksum:
            'JC-V1',

          state:
            this.state.snapshot()
        };

        localStorage.setItem(
          SAVE_KEY,
          JSON.stringify(
            payload
          )
        );

        this.state.increment(
          'statistics.saves',
          1,
          autosave
            ? 'autosave'
            : 'save'
        );

        this.bus.emit(
          'save:completed',
          payload
        );

        if (
          !silent
        ) {
          this.notify(
            'Crônica salva',

            autosave
              ? 'Salvamento automático concluído.'
              : 'Seu progresso foi armazenado neste navegador.',

            'success'
          );
        }

        return true;
      } catch (
        error
      ) {
        this.logger.error(
          'Falha ao salvar',
          error
        );

        if (
          !silent
        ) {
          this.notify(
            'Falha ao salvar',

            'O navegador bloqueou o armazenamento local.',

            'error'
          );
        }

        return false;
      }
    }

    schedule() {
      clearTimeout(
        this.timer
      );

      this.timer =
        setTimeout(
          () =>
            this.save({
              silent:
                true,

              autosave:
                true
            }),
          AUTOSAVE_DELAY
        );
    }

    load({
      silent = false
    } = {}) {
      try {
        const payload =
          this.migrate(
            this.readRaw()
          );

        if (
          !payload?.state
        ) {
          throw new Error(
            'Nenhum save válido encontrado.'
          );
        }

        this.state.replace(
          payload.state,
          'save.load'
        );

        this.bus.emit(
          'save:loaded',
          payload
        );

        if (
          !silent
        ) {
          this.notify(
            'Crônica restaurada',

            `Save de ${formatDate(
              payload.timestamp
            )}.`,

            'success'
          );
        }

        return true;
      } catch (
        error
      ) {
        this.logger.error(
          'Falha ao carregar save',
          error
        );

        if (
          !silent
        ) {
          this.notify(
            'Não foi possível carregar',

            'O save está ausente ou inválido. Uma nova crônica continua disponível.',

            'error'
          );
        }

        return false;
      }
    }

    delete() {
      try {
        localStorage.removeItem(
          SAVE_KEY
        );

        this.bus.emit(
          'save:deleted'
        );

        this.notify(
          'Save apagado',

          'A crônica local foi removida.',

          'warning'
        );

        return true;
      } catch (
        error
      ) {
        this.logger.error(
          'Falha ao apagar save',
          error
        );

        return false;
      }
    }
  }

  /* ==========================================================================
     LOCAIS
     ========================================================================== */

  const LOCATIONS = {
    mega_city: {
      name:
        'Megacidade',

      act:
        'PRÓLOGO',

      era:
        'FUTURO',

      tag:
        'ZONA DE CONFLITO',

      description:
        'Região parcialmente funcional sobre uma área devastada.',

      interaction:
        'Explorar área'
    },

    chrono_lab: {
      name:
        'Complexo Cronos',

      act:
        'ATO I',

      era:
        'FUTURO',

      tag:
        'SETOR RESTRITO',

      description:
        'O maior experimento temporal já construído pulsa sob toneladas de concreto.',

      interaction:
        'Examinar o núcleo temporal'
    },

    archive: {
      name:
        'Arquivo de Ruptura',

      act:
        'ATO I',

      era:
        'FUTURO',

      tag:
        'ARQUIVO CENSURADO',

      description:
        'Relatórios antigos contradizem a versão oficial da missão.',

      interaction:
        'Ler registros ocultos'
    },

    transit: {
      name:
        'Corredor de Salto',

      act:
        'ATO II',

      era:
        'ENTRE ERAS',

      tag:
        'INSTABILIDADE',

      description:
        'O espaço perde profundidade. Memórias e possibilidades aparecem como ruído.',

      interaction:
        'Estabilizar coordenadas'
    },

    galilee: {
      name:
        'Galileia',

      act:
        'ATO III',

      era:
        'SÉCULO I',

      tag:
        'LINHA HISTÓRICA',

      description:
        'O passado não parece um arquivo. Parece vivo — e não espera por você.',

      interaction:
        'Observar antes de interferir'
    }
  };

  /* ==========================================================================
     CINEMÁTICAS
     ========================================================================== */

  const CINEMATICS = [
    {
      title:
        'O MUNDO DESTRUÍDO',

      text:
        'No fim do século XXI, a humanidade não chegou ao apocalipse de uma só vez. Ela chegou em pequenas decisões, repetidas por décadas, até que viver em crise se tornou normal.'
    },

    {
      title:
        'UMA SOLUÇÃO IMPOSSÍVEL',

      text:
        'Governos ruíram. Recursos tornaram-se instrumentos de controle. Então surgiu o Projeto Cronos: não uma máquina para consertar o passado, mas para pedir ao passado uma resposta.'
    },

    {
      title:
        'A HIPÓTESE',

      text:
        'Se a humanidade pudesse encontrar Jesus antes que a história o transformasse em símbolo, talvez pudesse trazer ao futuro uma orientação capaz de unir o que restou.'
    },

    {
      title:
        'O VOLUNTÁRIO',

      text:
        'Você foi escolhido porque sobreviveu à guerra, conhece sistemas antigos e, segundo os avaliadores, ainda consegue acreditar que escolhas individuais importam.'
    },

    {
      title:
        'A REGRA',

      text:
        'A viagem não permite mudanças ilimitadas. Cada interferência cobra estabilidade temporal. E a máquina registra não só o que você faz — mas por que fez.'
    },

    {
      title:
        'A PERGUNTA',

      text:
        'A missão oficial é simples: encontre Jesus e peça ajuda para salvar o mundo. A pergunta que ninguém quer responder é outra: e se o futuro estiver procurando um salvador apenas para evitar mudar a si mesmo?'
    }
  ];

  /* ==========================================================================
     ROTEIRO
     ========================================================================== */

  const SCENES = {

    g_intro: {
      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'SISTEMA',

      type:
        'NARRAÇÃO',

      location:
        'mega_city',

      text:
        'A autorização final foi emitida. Antes do salto, você tem acesso à zona externa e ao Complexo Cronos. Observe o mundo que a missão pretende salvar.',

      next:
        'g_city_choice'
    },

    g_city_choice: {
      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'DIÁLOGO',

      location:
        'mega_city',

      text:
        'Não precisamos que você julgue o presente. Precisamos que encontre uma resposta no passado. Está claro?',

      choices: [
        {
          id:
            'obey',

          text:
            '“Está claro. Eu cumpro a missão.”',

          effects: {
            control:
              8,

            freedom:
              -2
          },

          flags: {
            obedient:
              true
          },

          next:
            'g_lab'
        },

        {
          id:
            'question',

          text:
            '“E se a resposta não estiver no passado?”',

          effects: {
            hope:
              5,

            freedom:
              8,

            control:
              -4
          },

          flags: {
            questionedMission:
              true
          },

          codex:
            'paradox',

          next:
            'g_lab'
        },

        {
          id:
            'silence',

          text:
            'Permanecer em silêncio.',

          effects: {
            control:
              -2,

            temporal:
              1
          },

          flags: {
            silentOpening:
              true
          },

          next:
            'g_lab'
        }
      ]
    },

    g_lab: {
      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'DIÁLOGO',

      location:
        'chrono_lab',

      text:
        'O núcleo está em 97%. Você terá uma janela limitada. Antes de entrar, há um arquivo que o Conselho preferia que você não visse.',

      onEnter: {
        missionProgress: [
          'intro',
          1
        ],

        codex:
          'project'
      },

      next:
        'g_archive_choice'
    },

    g_archive_choice: {
      speaker:
        'SISTEMA DE ARQUIVOS',

      role:
        'RESTRITO',

      type:
        'DECISÃO',

      location:
        'archive',

      text:
        'Acesso não autorizado detectado. O arquivo “RUPTURA-00” contém registros anteriores ao Projeto Cronos. Abrir pode atrasar o lançamento.',

      choices: [
        {
          id:
            'open_archive',

          text:
            'Abrir o arquivo mesmo assim.',

          effects: {
            freedom:
              7,

            control:
              -5,

            temporal:
              -2
          },

          flags: {
            archiveOpened:
              true
          },

          codex:
            'archive',

          missionProgress: [
            'truth',
            1
          ],

          next:
            'g_archive_reveal'
        },

        {
          id:
            'ignore_archive',

          text:
            'Ignorar e seguir o protocolo.',

          effects: {
            control:
              7,

            hope:
              -2
          },

          flags: {
            archiveIgnored:
              true
          },

          next:
            'g_jump'
        }
      ]
    },

    g_archive_reveal: {
      speaker:
        'ARQUIVO RUPTURA-00',

      role:
        'REGISTRO HISTÓRICO',

      type:
        'NARRAÇÃO',

      location:
        'archive',

      text:
        '“A crise não começou com falta de tecnologia. Começou quando instituições perceberam que o medo tornava populações mais fáceis de administrar.” O relatório termina com páginas removidas.',

      onEnter: {
        missionUnlock:
          'truth'
      },

      next:
        'g_jump'
    },

    g_jump: {
      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'SISTEMA',

      type:
        'ALERTA',

      location:
        'transit',

      text:
        'SALTO INICIADO. Coordenadas históricas adquiridas. A estabilidade está oscilando. Concentre-se em uma lembrança que defina por que você quer salvar o futuro.',

      choices: [
        {
          id:
            'memory_people',

          text:
            'As pessoas que ainda tentam ajudar umas às outras.',

          effects: {
            hope:
              10,

            temporal:
              3
          },

          flags: {
            motivePeople:
              true
          },

          next:
            'g_arrival'
        },

        {
          id:
            'memory_loss',

          text:
            'Tudo que você perdeu.',

          effects: {
            control:
              6,

            hope:
              -3,

            temporal:
              -1
          },

          flags: {
            motiveLoss:
              true
          },

          next:
            'g_arrival'
        },

        {
          id:
            'memory_choice',

          text:
            'A chance de provar que o futuro ainda pode escolher diferente.',

          effects: {
            freedom:
              10,

            hope:
              4
          },

          flags: {
            motiveChoice:
              true
          },

          next:
            'g_arrival'
        }
      ]
    },

    g_arrival: {
      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'SISTEMA',

      type:
        'NARRAÇÃO',

      location:
        'galilee',

      text:
        'Deslocamento concluído. O ar é quente, o chão é irregular e não existe interface separando você da história. Pela primeira vez, o passado não parece distante.',

      onEnter: {
        missionProgress: [
          'intro',
          1
        ],

        missionComplete:
          'intro',

        missionUnlock:
          'responsibility'
      },

      next:
        'g_first_witness'
    },

    g_first_witness: {
      speaker:
        'VIAJANTE DESCONHECIDO',

      role:
        'MORADOR LOCAL',

      type:
        'DIÁLOGO',

      location:
        'galilee',

      text:
        'Você está perdido? Suas roupas... nunca vi tecido assim. Se procura alguém, talvez seja melhor começar perguntando quem você é.',

      choices: [
        {
          id:
            'tell_truth',

          text:
            '“Sou alguém de muito longe procurando respostas.”',

          effects: {
            hope:
              5,

            freedom:
              5
          },

          flags: {
            honestStranger:
              true
          },

          missionProgress: [
            'responsibility',
            1
          ],

          next:
            'g_open_end'
        },

        {
          id:
            'lie_safe',

          text:
            '“Sou mercador. Só estou de passagem.”',

          effects: {
            control:
              6,

            temporal:
              -2
          },

          flags: {
            liedStranger:
              true
          },

          missionProgress: [
            'responsibility',
            1
          ],

          next:
            'g_open_end'
        }
      ]
    },

    g_open_end: {
      speaker:
        'NARRADOR',

      role:
        'CRÔNICA',

      type:
        'NARRAÇÃO',

      location:
        'galilee',

      text:
        'A busca começou. Mas a primeira mudança importante talvez já tenha acontecido: você entrou na história acreditando que veio encontrar uma resposta — e encontrou uma pergunta.',

      next:
        null
    }
  };

  /* ==========================================================================
     MISSION MANAGER
     ========================================================================== */

  class MissionManager {
    constructor(
      state,
      bus,
      notify
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.notify =
        notify;
    }

    get(
      id
    ) {
      return this.state.get(
        `missions.${id}`
      );
    }

    unlock(
      id
    ) {
      const mission =
        this.get(
          id
        );

      if (
        !mission ||
        mission.status !==
          'locked'
      ) {
        return;
      }

      this.state.patch(
        `missions.${id}`,
        {
          status:
            'active'
        },

        'mission.unlock'
      );

      this.notify(
        'Nova missão',
        mission.title,
        'info'
      );

      this.bus.emit(
        'mission:updated',
        {
          id,

          type:
            'unlock'
        }
      );
    }

    progress(
      id,
      amount = 1
    ) {
      const mission =
        this.get(
          id
        );

      if (
        !mission ||
        mission.status !==
          'active'
      ) {
        return;
      }

      const next =
        Math.min(
          mission.goal,
          Number(
            mission.progress
          ) +
            Number(
              amount
            )
        );

      this.state.set(
        `missions.${id}.progress`,
        next,

        'mission.progress'
      );

      this.bus.emit(
        'mission:updated',
        {
          id,

          type:
            'progress',

          progress:
            next
        }
      );

      if (
        next >=
        mission.goal
      ) {
        this.complete(
          id
        );
      }
    }

    complete(
      id
    ) {
      const mission =
        this.get(
          id
        );

      if (
        !mission ||
        mission.status ===
          'completed'
      ) {
        return;
      }

      this.state.patch(
        `missions.${id}`,
        {
          status:
            'completed',

          progress:
            mission.goal
        },

        'mission.complete'
      );

      this.notify(
        'Missão concluída',
        mission.title,
        'success'
      );

      this.bus.emit(
        'mission:updated',
        {
          id,

          type:
            'complete'
        }
      );
    }

    active() {
      return Object.values(
        this.state.get(
          'missions'
        )
      ).filter(
        mission =>
          mission.status ===
          'active'
      );
    }
  }

  /* ==========================================================================
     CODEX MANAGER
     ========================================================================== */

  class CodexManager {
    constructor(
      state,
      bus,
      notify
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.notify =
        notify;
    }

    unlock(
      id
    ) {
      if (!id) {
        return;
      }

      const entry =
        this.state.get(
          `codex.${id}`
        );

      if (
        !entry ||
        entry.unlocked
      ) {
        return;
      }

      this.state.patch(
        `codex.${id}`,
        {
          unlocked:
            true
        },

        'codex.unlock'
      );

      this.notify(
        'Códex atualizado',
        entry.title,
        'info'
      );

      this.bus.emit(
        'codex:updated',
        {
          id
        }
      );
    }

    unlocked() {
      return Object.values(
        this.state.get(
          'codex'
        )
      ).filter(
        entry =>
          entry.unlocked
      );
    }
  }

  /* ==========================================================================
     UI MANAGER
     ========================================================================== */

  class UIManager {
    constructor(
      state,
      bus,
      logger,
      audio
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.logger =
        logger;

      this.audio =
        audio;

      this.game =
        null;

      this.initialized =
        false;

      this.overlayStack =
        [];

      this.bindingRegistry =
        new WeakMap();

      this.notificationTimers =
        new Set();
    }

    el(
      id
    ) {
      return byId(
        id
      );
    }

    bind(
      element,
      event,
      callback,
      options
    ) {
      if (
        !element
      ) {
        this.logger.warn(
          `Elemento ausente: ${event}`
        );

        return false;
      }

      let registry =
        this.bindingRegistry.get(
          element
        );

      if (!registry) {
        registry =
          new Set();

        this.bindingRegistry.set(
          element,
          registry
        );
      }

      const signature =
        `${event}:${String(
          callback
        )}`;

      if (
        registry.has(
          signature
        )
      ) {
        return false;
      }

      element.addEventListener(
        event,
        callback,
        options
      );

      registry.add(
        signature
      );

      return true;
    }

    showScreen(
      screenId
    ) {
      qsa(
        '.screen'
      ).forEach(
        screen => {
          screen.classList.toggle(
            'active',

            screen.id ===
              screenId
          );
        }
      );

      let phase =
        'title';

      if (
        screenId ===
        'screenCinematic'
      ) {
        phase =
          'cinematic';
      }

      if (
        screenId ===
        'screenGame'
      ) {
        phase =
          'game';
      }

      this.state.set(
        'phase',
        phase,
        'ui.showScreen'
      );

      this.bus.emit(
        'screen:changed',
        {
          id:
            screenId,

          phase
        }
      );
    }

    transition(
      callback
    ) {
      const layer =
        this.el(
          'fadeTransition'
        );

      if (!layer) {
        callback();
        return;
      }

      layer.classList.add(
        'active'
      );

      const reduced =
        this.state.get(
          'settings.reducedMotion'
        );

      const duration =
        reduced
          ? 0
          : 140;

      setTimeout(
        () => {
          callback();

          setTimeout(
            () => {
              layer.classList.remove(
                'active'
              );
            },
            duration
          );
        },
        duration
      );
    }

    openOverlay(
      id
    ) {
      const overlay =
        this.el(
          id
        );

      if (
        !overlay
      ) {
        this.logger.warn(
          `Overlay não encontrado: ${id}`
        );

        return;
      }

      this.overlayStack =
        this.overlayStack.filter(
          item =>
            item !==
            id
        );

      this.overlayStack.push(
        id
      );

      overlay.hidden =
        false;

      overlay.classList.add(
        'active'
      );

      overlay.setAttribute(
        'aria-hidden',
        'false'
      );

      if (
        id ===
        'saveOverlay'
      ) {
        this.renderSaveStatus();
      }

      if (
        id ===
        'questOverlay'
      ) {
        this.renderQuestDetail();
      }

      if (
        id ===
        'settingsOverlay'
      ) {
        this.renderSettings();
      }

      this.bus.emit(
        'overlay:opened',
        {
          id
        }
      );
    }

    closeOverlay(
      id
    ) {
      const overlay =
        this.el(
          id
        );

      if (
        !overlay
      ) {
        return;
      }

      overlay.classList.remove(
        'active'
      );

      overlay.hidden =
        true;

      overlay.setAttribute(
        'aria-hidden',
        'true'
      );

      this.overlayStack =
        this.overlayStack.filter(
          item =>
            item !==
            id
        );

      this.bus.emit(
        'overlay:closed',
        {
          id
        }
      );
    }

    closeTopOverlay() {
      const id =
        this.overlayStack.at(
          -1
        );

      if (!id) {
        return false;
      }

      this.closeOverlay(
        id
      );

      return true;
    }

    notify(
      title,
      message,
      type = 'info'
    ) {
      const stack =
        this.el(
          'notificationStack'
        );

      if (!stack) {
        return;
      }

      const item =
        document.createElement(
          'div'
        );

      item.className =
        `notification notification-${type}`;

      const titleElement =
        document.createElement(
          'strong'
        );

      titleElement.textContent =
        safeText(
          title
        );

      const messageElement =
        document.createElement(
          'span'
        );

      messageElement.textContent =
        safeText(
          message
        );

      item.append(
        titleElement,
        messageElement
      );

      stack.appendChild(
        item
      );

      requestAnimationFrame(
        () => {
          item.classList.add(
            'show'
          );
        }
      );

      const timer =
        setTimeout(
          () => {
            item.classList.remove(
              'show'
            );

            setTimeout(
              () =>
                item.remove(),
              300
            );

            this.notificationTimers.delete(
              timer
            );
          },
          3500
        );

      this.notificationTimers.add(
        timer
      );
    }

    render() {
      const state =
        this.state.get();

      this.renderStats(
        state
      );

      this.renderPlayer(
        state
      );

      this.renderWorld(
        state
      );

      this.renderMissions(
        state
      );

      this.renderCodex(
        state
      );

      this.renderSettings(
        state
      );

      this.renderSaveStatus();

      this.applyAccessibility(
        state
      );
    }

    renderPlayer(
      state
    ) {
      const name =
        this.el(
          'playerNameDisplay'
        );

      const role =
        this.el(
          'playerRoleDisplay'
        );

      if (name) {
        name.textContent =
          state.player.name;
      }

      if (role) {
        role.textContent =
          state.player.role;
      }
    }

    renderStats(
      state
    ) {
      const mapping = {
        hope: [
          'hopeBar',
          'hopeValue'
        ],

        freedom: [
          'freedomBar',
          'freedomValue'
        ],

        control: [
          'controlBar',
          'controlValue'
        ],

        temporal: [
          'temporalBar',
          'temporalValue'
        ]
      };

      for (
        const [
          key,
          [
            barId,
            valueId
          ]
        ] of Object.entries(
          mapping
        )
      ) {
        const value =
          clamp(
            state.player.stats[
              key
            ]
          );

        const bar =
          this.el(
            barId
          );

        const label =
          this.el(
            valueId
          );

        if (bar) {
          bar.style.width =
            `${value}%`;

          bar.setAttribute(
            'role',
            'progressbar'
          );

          bar.setAttribute(
            'aria-valuenow',
            String(
              value
            )
          );

          bar.setAttribute(
            'aria-valuemin',
            '0'
          );

          bar.setAttribute(
            'aria-valuemax',
            '100'
          );
        }

        if (label) {
          label.textContent =
            String(
              Math.round(
                value
              )
            );
        }
      }
    }

    renderWorld(
      state
    ) {
      const location =
        LOCATIONS[
          state.world.location
        ] ||
        LOCATIONS.mega_city;

      const mapping = {
        locationAct:
          location.act,

        locationName:
          location.name,

        eraValue:
          location.era,

        sceneTag:
          location.tag,

        sceneDescription:
          location.description,

        interactionText:
          location.interaction
      };

      for (
        const [
          id,
          value
        ] of Object.entries(
          mapping
        )
      ) {
        const node =
          this.el(
            id
          );

        if (node) {
          node.textContent =
            safeText(
              value
            );
        }
      }

      const scene =
        this.el(
          'worldScene'
        );

      if (scene) {
        scene.dataset.location =
          state.world.location;
      }

      const phase =
        this.el(
          'phaseLabel'
        );

      if (phase) {
        phase.textContent =
          `${location.act} // ${location.era}`;
      }

      const status =
        this.el(
          'worldStatus'
        );

      if (status) {
        const temporal =
          clamp(
            state.player.stats.temporal
          );

        if (
          temporal <=
          20
        ) {
          status.textContent =
            'INSTABILIDADE CRÍTICA';
        } else if (
          temporal <=
          50
        ) {
          status.textContent =
            'LINHA TEMPORAL OSCILANTE';
        } else {
          status.textContent =
            'LINHA TEMPORAL ESTÁVEL';
        }
      }
    }

    renderMissions(
      state
    ) {
      const list =
        this.el(
          'missionList'
        );

      const count =
        this.el(
          'missionCount'
        );

      if (!list) {
        return;
      }

      list.replaceChildren();

      const missions =
        Object.values(
          state.missions
        ).filter(
          mission =>
            mission.status !==
            'locked'
        );

      if (count) {
        count.textContent =
          String(
            missions.filter(
              mission =>
                mission.status ===
                'active'
            ).length
          );
      }

      for (
        const mission
        of missions
      ) {
        const item =
          document.createElement(
            'div'
          );

        item.className =
          'mission-item';

        const top =
          document.createElement(
            'div'
          );

        top.className =
          'mission-item-top';

        const title =
          document.createElement(
            'strong'
          );

        title.textContent =
          mission.title;

        const progress =
          document.createElement(
            'span'
          );

        progress.textContent =
          `${mission.progress}/${mission.goal}`;

        top.append(
          title,
          progress
        );

        const description =
          document.createElement(
            'p'
          );

        description.textContent =
          mission.description;

        const progressBar =
          document.createElement(
            'div'
          );

        progressBar.className =
          'mission-progress';

        const progressInner =
          document.createElement(
            'i'
          );

        const percentage =
          Math.min(
            100,

            (
              Number(
                mission.progress
              ) /
              Math.max(
                1,
                Number(
                  mission.goal
                )
              )
            ) *
              100
          );

        progressInner.style.width =
          `${percentage}%`;

        progressBar.append(
          progressInner
        );

        item.append(
          top,
          description,
          progressBar
        );

        list.appendChild(
          item
        );
      }
    }

    renderQuestDetail() {
      const list =
        this.el(
          'questDetailList'
        );

      if (!list) {
        return;
      }

      list.replaceChildren();

      const missions =
        Object.values(
          this.state.get(
            'missions'
          )
        ).filter(
          mission =>
            mission.status !==
            'locked'
        );

      for (
        const mission
        of missions
      ) {
        const item =
          document.createElement(
            'div'
          );

        item.className =
          'quest-detail-item';

        const title =
          document.createElement(
            'h3'
          );

        title.textContent =
          mission.title;

        const description =
          document.createElement(
            'p'
          );

        description.textContent =
          mission.description;

        const state =
          document.createElement(
            'span'
          );

        state.textContent =
          `PROGRESSO: ${mission.progress}/${mission.goal}`;

        item.append(
          title,
          description,
          state
        );

        list.appendChild(
          item
        );
      }
    }

    renderCodex(
      state
    ) {
      const progress =
        this.el(
          'codexProgress'
        );

      const unlocked =
        Object.values(
          state.codex
        ).filter(
          entry =>
            entry.unlocked
        );

      if (progress) {
        progress.textContent =
          `${unlocked.length} de ${
            Object.keys(
              state.codex
            ).length
          } registros desbloqueados.`;
      }

      const panel =
        this.el(
          'codexTab'
        );

      if (!panel) {
        return;
      }

      qsa(
        '.jc-codex-generated',
        panel
      ).forEach(
        node =>
          node.remove()
      );

      for (
        const entry
        of unlocked
      ) {
        if (
          entry.id ===
          'future'
        ) {
          continue;
        }

        const node =
          document.createElement(
            'div'
          );

        node.className =
          'codex-entry jc-codex-generated';

        const label =
          document.createElement(
            'span'
          );

        label.className =
          'codex-label';

        label.textContent =
          entry.category;

        const text =
          document.createElement(
            'p'
          );

        const strong =
          document.createElement(
            'strong'
          );

        strong.textContent =
          entry.title;

        text.append(
          strong,
          document.createElement(
            'br'
          ),
          document.createTextNode(
            entry.text
          )
        );

        node.append(
          label,
          text
        );

        panel.appendChild(
          node
        );
      }
    }

    renderSettings() {
      const settings =
        this.state.get(
          'settings'
        );

      const map = {
        settingFastText:
          'fastText',

        settingHighContrast:
          'highContrast',

        settingReducedMotion:
          'reducedMotion',

        settingAudio:
          'audio'
      };

      for (
        const [
          id,
          key
        ] of Object.entries(
          map
        )
      ) {
        const input =
          this.el(
            id
          );

        if (input) {
          input.checked =
            Boolean(
              settings[
                key
              ]
            );
        }
      }
    }

    renderSaveStatus() {
      const save =
        this.game?.save;

      if (!save) {
        return;
      }

      const hasSave =
        save.hasSave();

      const payload =
        hasSave
          ? save.readRaw()
          : null;

      const text =
        hasSave
          ? `Último registro: ${formatDate(
              payload?.timestamp
            )}`
          : 'Nenhum save encontrado';

      [
        'saveCurrentLabel',
        'loadCurrentLabel'
      ].forEach(
        id => {
          const node =
            this.el(
              id
            );

          if (node) {
            node.textContent =
              text;
          }
        }
      );

      const loadButton =
        this.el(
          'loadGameButton'
        );

      const deleteButton =
        this.el(
          'deleteSaveButton'
        );

      if (
        loadButton
      ) {
        loadButton.disabled =
          !hasSave;
      }

      if (
        deleteButton
      ) {
        deleteButton.disabled =
          !hasSave;
      }
    }

    applyAccessibility(
      state
    ) {
      document.body.classList.toggle(
        'high-contrast',
        Boolean(
          state.settings
            .highContrast
        )
      );

      document.body.classList.toggle(
        'reduced-motion',
        Boolean(
          state.settings
            .reducedMotion
        )
      );
    }

    initBindings(
      game
    ) {
      if (
        this.initialized
      ) {
        return;
      }

      this.initialized =
        true;

      this.game =
        game;

      /* ----------------------------------------------------------------------
         MENU PRINCIPAL / TELA INICIAL
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'newGameButton'
        ),
        'click',
        () =>
          game.startNewGame()
      );

      this.bind(
        this.el(
          'continueButton'
        ),
        'click',
        () =>
          game.continueGame()
      );

      /* ----------------------------------------------------------------------
         CINEMÁTICA
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'cinematicNext'
        ),
        'click',
        () =>
          game.narrative.nextCinematic()
      );

      this.bind(
        this.el(
          'cinematicPrevious'
        ),
        'click',
        () =>
          game.narrative.prevCinematic()
      );

      /* ----------------------------------------------------------------------
         DIÁLOGO
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'dialogueContinueButton'
        ),
        'click',
        () =>
          game.narrative.continue()
      );

      this.bind(
        this.el(
          'dialogueSkipButton'
        ),
        'click',
        () =>
          game.narrative.skipTyping()
      );

      /* ----------------------------------------------------------------------
         MUNDO
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'inspectButton'
        ),
        'click',
        () =>
          game.inspect()
      );

      this.bind(
        this.el(
          'questButton'
        ),
        'click',
        () =>
          this.openOverlay(
            'questOverlay'
          )
      );

      /* ----------------------------------------------------------------------
         SALVAMENTO
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'quickSaveButton'
        ),
        'click',
        () =>
          game.save.save()
      );

      this.bind(
        this.el(
          'openSaveButton'
        ),
        'click',
        () =>
          this.openOverlay(
            'saveOverlay'
          )
      );

      /* ----------------------------------------------------------------------
         MENU
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'menuButton'
        ),
        'click',
        () =>
          this.openOverlay(
            'menuOverlay'
          )
      );

      /* ----------------------------------------------------------------------
         CONFIGURAÇÕES
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'openSettingsButton'
        ),
        'click',
        () =>
          this.openOverlay(
            'settingsOverlay'
          )
      );

      /* ----------------------------------------------------------------------
         SALVAR / CARREGAR
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'saveGameButton'
        ),
        'click',
        () => {
          game.save.save();

          this.renderSaveStatus();
        }
      );

      this.bind(
        this.el(
          'loadGameButton'
        ),
        'click',
        () => {
          game.loadSavedGame();
        }
      );

      this.bind(
        this.el(
          'deleteSaveButton'
        ),
        'click',
        () => {
          game.deleteSaveWithConfirm();
        }
      );

      /* ----------------------------------------------------------------------
         CONFIGURAÇÕES
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'settingFastText'
        ),
        'change',
        event =>
          game.settings.set(
            'fastText',
            event.target.checked
          )
      );

      this.bind(
        this.el(
          'settingHighContrast'
        ),
        'change',
        event =>
          game.settings.set(
            'highContrast',
            event.target.checked
          )
      );

      this.bind(
        this.el(
          'settingReducedMotion'
        ),
        'change',
        event =>
          game.settings.set(
            'reducedMotion',
            event.target.checked
          )
      );

      this.bind(
        this.el(
          'settingAudio'
        ),
        'change',
        event =>
          game.settings.set(
            'audio',
            event.target.checked
          )
      );

      /* ----------------------------------------------------------------------
         MENU DE OPÇÕES
         ---------------------------------------------------------------------- */

      this.bind(
        this.el(
          'menuSave'
        ),
        'click',
        () => {
          this.closeOverlay(
            'menuOverlay'
          );

          this.openOverlay(
            'saveOverlay'
          );
        }
      );

      this.bind(
        this.el(
          'menuSettings'
        ),
        'click',
        () => {
          this.closeOverlay(
            'menuOverlay'
          );

          this.openOverlay(
            'settingsOverlay'
          );
        }
      );

      this.bind(
        this.el(
          'menuCodex'
        ),
        'click',
        () => {
          this.closeOverlay(
            'menuOverlay'
          );

          game.activateSystemTab(
            'codexTab'
          );
        }
      );

      this.bind(
        this.el(
          'menuVisualLab'
        ),
        'click',
        () => {
          this.closeOverlay(
            'menuOverlay'
          );

          this.openOverlay(
            'visualLabOverlay'
          );
        }
      );

      this.bind(
        this.el(
          'menuRestart'
        ),
        'click',
        () => {
          this.closeOverlay(
            'menuOverlay'
          );

          game.restartToTitle();
        }
      );

      /* ----------------------------------------------------------------------
         FECHAMENTO DE OVERLAYS
         ---------------------------------------------------------------------- */

      qsa(
        '.close-button'
      ).forEach(
        button => {
          this.bind(
            button,
            'click',
            () => {
              const overlay =
                button.closest(
                  '.overlay'
                );

              if (
                overlay
              ) {
                this.closeOverlay(
                  overlay.id
                );
              }
            }
          );
        }
      );

      qsa(
        '.overlay'
      ).forEach(
        overlay => {
          this.bind(
            overlay,
            'click',
            event => {
              if (
                event.target ===
                overlay
              ) {
                this.closeOverlay(
                  overlay.id
                );
              }
            }
          );
        }
      );

      /* ----------------------------------------------------------------------
         ABAS DO HUD
         ---------------------------------------------------------------------- */

      this.bind(
        document,
        'click',
        event => {
          const target =
            event.target instanceof
            Element
              ? event.target.closest(
                  '.system-tab'
                )
              : null;

          if (!target) {
            return;
          }

          const tab =
            target.dataset.tab;

          if (
            tab
          ) {
            game.activateSystemTab(
              tab
            );
          }
        }
      );

      /* ----------------------------------------------------------------------
         ABAS DO LABORATÓRIO VISUAL
         ---------------------------------------------------------------------- */

      this.bind(
        document,
        'click',
        event => {
          const target =
            event.target instanceof
            Element
              ? event.target.closest(
                  '.visual-lab-tab'
                )
              : null;

          if (!target) {
            return;
          }

          const mode =
            target.dataset.mode ||
            'process';

          game.visualLab.setMode(
            mode
          );
        }
      );

      this.bind(
        this.el(
          'visualLabRefresh'
        ),
        'click',
        () =>
          game.visualLab.refresh(
            true
          )
      );

      this.bind(
        this.el(
          'visualLabClear'
        ),
        'click',
        () =>
          game.visualLab.clear()
      );

      /* ----------------------------------------------------------------------
         ESCOLHAS — CORREÇÃO PRINCIPAL
         ----------------------------------------------------------------------

         O container #choiceContainer NÃO é destruído.

         Os botões internos são recriados a cada cena.

         Por isso o evento é delegado ao container.

         Exemplo:

         choiceContainer
             ├── button choice #1
             ├── button choice #2
             └── button choice #3

         Quando os botões forem recriados, o listener permanece.
         ---------------------------------------------------------------------- */

      const choiceContainer =
        this.el(
          'choiceContainer'
        );

      this.bind(
        choiceContainer,
        'click',
        event => {
          const source =
            event.target;

          const button =
            source instanceof
            Element
              ? source.closest(
                  'button.choice-button'
                )
              : null;

          if (!button) {
            return;
          }

          if (
            !choiceContainer.contains(
              button
            )
          ) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          if (
            button.disabled
          ) {
            return;
          }

          const choiceId =
            safeText(
              button.dataset.choiceId
            ).trim();

          if (!choiceId) {
            this.logger.error(
              'choice-button sem data-choice-id'
            );

            return;
          }

          game.narrative.selectChoiceById(
            choiceId
          );
        }
      );

      /* ----------------------------------------------------------------------
         TECLADO
         ---------------------------------------------------------------------- */

      this.bind(
        document,
        'keydown',
        event =>
          game.handleKey(
            event
          )
      );

      this.renderSaveStatus();
    }
  }

  /* ==========================================================================
     NARRATIVE ENGINE
     ========================================================================== */

  class NarrativeEngine {
    constructor(
      state,
      bus,
      ui,
      logger,
      audio,
      missions,
      codex
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.ui =
        ui;

      this.logger =
        logger;

      this.audio =
        audio;

      this.missions =
        missions;

      this.codex =
        codex;

      this.current =
        null;

      this.timer =
        null;

      this.typing =
        false;

      this.fullText =
        '';

      this.charIndex =
        0;

      /*
       * CONTROLE DE TRANSAÇÃO DAS ESCOLHAS
       */
      this.choiceLocked =
        false;

      this.selectingChoice =
        false;

      this.choiceTransaction =
        0;
    }

    renderCinematic() {
      const index =
        clamp(
          this.state.get(
            'narrative.cinematicIndex'
          ),
          0,
          CINEMATICS.length -
            1
        );

      const cinematic =
        CINEMATICS[
          index
        ];

      const title =
        byId(
          'cinematicTitle'
        );

      const text =
        byId(
          'cinematicText'
        );

      const counter =
        byId(
          'cinematicSceneIndex'
        );

      const act =
        byId(
          'cinematicActLabel'
        );

      const previous =
        byId(
          'cinematicPrevious'
        );

      const next =
        byId(
          'cinematicNext'
        );

      if (title) {
        title.textContent =
          cinematic.title;
      }

      if (text) {
        text.textContent =
          cinematic.text;
      }

      if (counter) {
        counter.textContent =
          `${String(
            index + 1
          ).padStart(
            2,
            '0'
          )} / ${String(
            CINEMATICS.length
          ).padStart(
            2,
            '0'
          )}`;
      }

      if (act) {
        act.textContent =
          'PRÓLOGO';
      }

      if (previous) {
        previous.disabled =
          index <=
          0;
      }

      if (next) {
        next.textContent =
          index >=
          CINEMATICS.length -
            1
            ? 'ENTRAR NA CRÔNICA'
            : 'CONTINUAR';
      }
    }

    nextCinematic() {
      this.audio.click();

      const index =
        Number(
          this.state.get(
            'narrative.cinematicIndex'
          )
        ) || 0;

      if (
        index >=
        CINEMATICS.length -
          1
      ) {
        this.ui.transition(
          () => {
            this.ui.showScreen(
              'screenGame'
            );

            this.goto(
              this.state.get(
                'narrative.currentScene'
              ) ||
                'g_intro'
            );
          }
        );

        return;
      }

      this.state.set(
        'narrative.cinematicIndex',
        index + 1,
        'cinematic.next'
      );

      this.renderCinematic();
    }

    prevCinematic() {
      const index =
        Number(
          this.state.get(
            'narrative.cinematicIndex'
          )
        ) || 0;

      if (
        index <=
        0
      ) {
        return;
      }

      this.audio.click();

      this.state.set(
        'narrative.cinematicIndex',
        index - 1,
        'cinematic.prev'
      );

      this.renderCinematic();
    }

    goto(
      sceneId
    ) {
      const safeId =
        SCENES[
          sceneId
        ]
          ? sceneId
          : 'g_intro';

      const scene =
        SCENES[
          safeId
        ];

      const previousId =
        this.state.get(
          'narrative.currentScene'
        );

      /*
       * Nova cena.
       */
      this.current =
        {
          ...scene,
          id:
            safeId
        };

      /*
       * Cancela digitação anterior.
       */
      clearTimeout(
        this.timer
      );

      this.typing =
        false;

      /*
       * INICIA UMA NOVA TRANSAÇÃO DE ESCOLHA.
       */
      this.choiceTransaction +=
        1;

      this.choiceLocked =
        false;

      this.selectingChoice =
        false;

      /*
       * Estado da narrativa.
       */
      this.state.set(
        'narrative.currentScene',
        safeId,
        'narrative.goto'
      );

      this.state.increment(
        'statistics.sceneChanges',
        1,
        'narrative.goto'
      );

      /*
       * Cenas vistas.
       */
      const seen =
        this.state.get(
          'narrative.seenScenes'
        ) || [];

      if (
        !seen.includes(
          safeId
        )
      ) {
        this.state.set(
          'narrative.seenScenes',
          [
            ...seen,
            safeId
          ],
          'narrative.scene.seen'
        );
      }

      /*
       * Localização.
       */
      this.applyLocation(
        scene.location
      );

      /*
       * Efeitos de entrada.
       */
      this.applyOnEnter(
        scene.onEnter
      );

      /*
       * Header do diálogo.
       */
      this.renderDialogueHeader(
        scene
      );

      /*
       * ESCOLHAS PRIMEIRO.
       *
       * Isso é importante porque o botão
       * já fica associado ao ID correto
       * antes de qualquer interação.
       */
      this.renderChoices(
        scene
      );

      /*
       * Texto.
       */
      this.typeText(
        scene.text
      );

      /*
       * Render.
       */
      this.ui.render();

      /*
       * Evento.
       */
      this.bus.emit(
        'scene:changed',
        {
          id:
            safeId,

          previousId,

          scene
        }
      );
    }

    applyLocation(
      locationId
    ) {
      if (
        !locationId ||
        !LOCATIONS[
          locationId
        ]
      ) {
        return;
      }

      const discovered =
        this.state.get(
          'world.discovered'
        ) || [];

      if (
        !discovered.includes(
          locationId
        )
      ) {
        this.state.set(
          'world.discovered',
          [
            ...discovered,
            locationId
          ],
          'world.discover'
        );
      }

      const visited =
        this.state.get(
          'world.visited'
        ) || [];

      if (
        !visited.includes(
          locationId
        )
      ) {
        this.state.set(
          'world.visited',
          [
            ...visited,
            locationId
          ],
          'world.visit'
        );
      }

      this.state.set(
        'world.location',
        locationId,
        'narrative.location'
      );

      this.state.set(
        'world.act',
        LOCATIONS[
          locationId
        ].act,

        'narrative.location'
      );

      this.state.set(
        'world.era',
        LOCATIONS[
          locationId
        ].era,

        'narrative.location'
      );
    }

    applyOnEnter(
      data
    ) {
      if (!data) {
        return;
      }

      if (
        data.codex
      ) {
        this.codex.unlock(
          data.codex
        );
      }

      if (
        data.missionUnlock
      ) {
        this.missions.unlock(
          data.missionUnlock
        );
      }

      if (
        data.missionProgress
      ) {
        const [
          missionId,
          amount
        ] =
          data.missionProgress;

        this.missions.progress(
          missionId,
          amount
        );
      }

      if (
        data.missionComplete
      ) {
        this.missions.complete(
          data.missionComplete
        );
      }
    }

    renderDialogueHeader(
      scene
    ) {
      const speaker =
        byId(
          'dialogueSpeaker'
        );

      const role =
        byId(
          'dialogueSpeakerRole'
        );

      const type =
        byId(
          'dialogueType'
        );

      if (speaker) {
        speaker.textContent =
          safeText(
            scene.speaker
          );
      }

      if (role) {
        role.textContent =
          safeText(
            scene.role
          );
      }

      if (type) {
        type.textContent =
          safeText(
            scene.type
          );
      }
    }

    typeText(
      text
    ) {
      clearTimeout(
        this.timer
      );

      this.fullText =
        safeText(
          text
        );

      this.charIndex =
        0;

      const output =
        byId(
          'dialogueText'
        );

      const cursor =
        byId(
          'typingCursor'
        );

      if (!output) {
        return;
      }

      output.textContent =
        '';

      const fast =
        Boolean(
          this.state.get(
            'settings.fastText'
          )
        );

      const reduced =
        Boolean(
          this.state.get(
            'settings.reducedMotion'
          )
        );

      if (
        fast ||
        reduced ||
        !this.fullText.length
      ) {
        this.typing =
          false;

        output.textContent =
          this.fullText;

        cursor?.classList.remove(
          'active'
        );

        return;
      }

      this.typing =
        true;

      cursor?.classList.add(
        'active'
      );

      const speed =
        fast
          ? 3
          : 16;

      const step =
        fast
          ? 5
          : 1;

      const tick =
        () => {
          if (
            !this.typing
          ) {
            return;
          }

          this.charIndex =
            Math.min(
              this.fullText.length,

              this.charIndex +
                step
            );

          output.textContent =
            this.fullText.slice(
              0,
              this.charIndex
            );

          if (
            this.charIndex >=
            this.fullText.length
          ) {
            this.typing =
              false;

            cursor?.classList.remove(
              'active'
            );

            return;
          }

          this.timer =
            setTimeout(
              tick,
              speed
            );
        };

      tick();

      this.state.increment(
        'statistics.dialogues',
        1,
        'narrative.dialogue'
      );
    }

    skipTyping() {
      if (
        !this.typing
      ) {
        return;
      }

      clearTimeout(
        this.timer
      );

      this.typing =
        false;

      const output =
        byId(
          'dialogueText'
        );

      if (output) {
        output.textContent =
          this.fullText;
      }

      byId(
        'typingCursor'
      )?.classList.remove(
        'active'
      );

      this.audio.click();
    }

    continue() {
      if (
        this.typing
      ) {
        this.skipTyping();
        return;
      }

      const choices =
        this.availableChoices(
          this.current
        );

      if (
        choices.length >
        0
      ) {
        this.ui.notify(
          'Escolha necessária',
          'Selecione uma resposta antes de continuar.',
          'warning'
        );

        this.audio.alert();

        return;
      }

      const next =
        this.current?.next;

      if (!next) {
        this.ui.notify(
          'Cena concluída',
          'Este segmento da crônica terminou.',
          'info'
        );

        return;
      }

      if (
        !SCENES[
          next
        ]
      ) {
        this.logger.error(
          'Próxima cena inexistente',
          next
        );

        this.ui.notify(
          'Erro narrativo',
          'A próxima cena não foi encontrada.',
          'error'
        );

        return;
      }

      this.audio.confirm();

      this.goto(
        next
      );
    }

    availableChoices(
      scene
    ) {
      if (
        !scene ||
        !Array.isArray(
          scene.choices
        )
      ) {
        return [];
      }

      const taken =
        this.state.get(
          'narrative.choices'
        ) || [];

      return scene.choices.filter(
        choice => {
          if (
            !choice ||
            !choice.id
          ) {
            return false;
          }

          if (
            choice.once &&
            taken.includes(
              choice.id
            )
          ) {
            return false;
          }

          return this.checkConditions(
            choice.conditions
          );
        }
      );
    }

    checkConditions(
      condition
    ) {
      if (!condition) {
        return true;
      }

      if (
        condition.flag
      ) {
        const value =
          Boolean(
            this.state.get(
              `narrative.flags.${condition.flag}`
            )
          );

        if (!value) {
          return false;
        }
      }

      if (
        condition.minHope !=
        null
      ) {
        const hope =
          Number(
            this.state.get(
              'player.stats.hope'
            )
          ) || 0;

        if (
          hope <
          Number(
            condition.minHope
          )
        ) {
          return false;
        }
      }

      if (
        condition.minFreedom !=
        null
      ) {
        const freedom =
          Number(
            this.state.get(
              'player.stats.freedom'
            )
          ) || 0;

        if (
          freedom <
          Number(
            condition.minFreedom
          )
        ) {
          return false;
        }
      }

      if (
        condition.minControl !=
        null
      ) {
        const control =
          Number(
            this.state.get(
              'player.stats.control'
            )
          ) || 0;

        if (
          control <
          Number(
            condition.minControl
          )
        ) {
          return false;
        }
      }

      if (
        condition.minTemporal !=
        null
      ) {
        const temporal =
          Number(
            this.state.get(
              'player.stats.temporal'
            )
          ) || 0;

        if (
          temporal <
          Number(
            condition.minTemporal
          )
        ) {
          return false;
        }
      }

      return true;
    }

    renderChoices(
      scene
    ) {
      const container =
        byId(
          'choiceContainer'
        );

      if (!container) {
        this.logger.error(
          'choiceContainer não encontrado'
        );

        return;
      }

      /*
       * REMOVE OS BOTÕES ANTIGOS
       */
      container.replaceChildren();

      /*
       * NOVA JANELA DE ESCOLHA
       */
      this.choiceLocked =
        false;

      this.selectingChoice =
        false;

      container.dataset.sceneId =
        safeText(
          this.state.get(
            'narrative.currentScene'
          )
        );

      const choices =
        this.availableChoices(
          scene
        );

      container.setAttribute(
        'aria-live',
        'polite'
      );

      container.setAttribute(
        'role',
        'group'
      );

      container.setAttribute(
        'aria-label',
        choices.length
          ? 'Escolhas disponíveis'
          : 'Nenhuma escolha disponível'
      );

      if (
        choices.length ===
        0
      ) {
        return;
      }

      choices.forEach(
        (
          choice,
          index
        ) => {
          const button =
            document.createElement(
              'button'
            );

          button.type =
            'button';

          button.className =
            'choice-button';

          button.dataset.choiceId =
            safeText(
              choice.id
            );

          button.dataset.choiceIndex =
            String(
              index
            );

          button.disabled =
            false;

          button.setAttribute(
            'aria-disabled',
            'false'
          );

          button.setAttribute(
            'aria-label',

            `Escolha ${
              index + 1
            }: ${
              choice.text
            }`
          );

          const number =
            document.createElement(
              'span'
            );

          number.setAttribute(
            'aria-hidden',
            'true'
          );

          number.textContent =
            String(
              index + 1
            ).padStart(
              2,
              '0'
            );

          const text =
            document.createElement(
              'strong'
            );

          text.textContent =
            safeText(
              choice.text
            );

          button.append(
            number,
            text
          );

          container.appendChild(
            button
          );
        }
      );
    }

    /*
     * ========================================================================
     * SELEÇÃO ROBUSTA DA ESCOLHA
     * ========================================================================
     *
     * Toda decisão passa por este método.
     *
     * Nunca executar uma escolha simplesmente
     * chamando executeChoice() diretamente.
     *
     * ========================================================================
     */

    selectChoiceById(
      choiceId
    ) {
      const normalizedId =
        safeText(
          choiceId
        ).trim();

      if (
        !normalizedId
      ) {
        return false;
      }

      /*
       * Proteção contra duplo clique.
       */
      if (
        this.choiceLocked ||
        this.selectingChoice
      ) {
        return false;
      }

      /*
       * Cena realmente ativa.
       */
      const sceneId =
        safeText(
          this.state.get(
            'narrative.currentScene'
          )
        );

      if (!sceneId) {
        this.logger.error(
          'Nenhuma cena narrativa ativa'
        );

        return false;
      }

      const scene =
        SCENES[
          sceneId
        ];

      if (!scene) {
        this.logger.error(
          'Cena narrativa não encontrada',
          sceneId
        );

        return false;
      }

      /*
       * Garante que o botão pertence à cena atual.
       */
      const container =
        byId(
          'choiceContainer'
        );

      if (
        container &&
        container.dataset.sceneId !==
          sceneId
      ) {
        this.logger.warn(
          'Container de escolhas desatualizado',

          `${container.dataset.sceneId} -> ${sceneId}`
        );

        this.renderChoices(
          scene
        );

        return false;
      }

      /*
       * Procura somente entre escolhas realmente disponíveis.
       */
      const choices =
        this.availableChoices(
          scene
        );

      const choice =
        choices.find(
          item =>
            String(
              item.id
            ) ===
            normalizedId
        );

      if (!choice) {
        this.logger.warn(
          'Escolha inválida ou indisponível',

          `${normalizedId} @ ${sceneId}`
        );

        return false;
      }

      /*
       * Inicia transação.
       */
      const transaction =
        ++this.choiceTransaction;

      this.choiceLocked =
        true;

      this.selectingChoice =
        true;

      /*
       * Desabilita os botões imediatamente.
       */
      qsa(
        '.choice-button',
        container || document
      ).forEach(
        button => {
          button.disabled =
            true;

          button.setAttribute(
            'aria-disabled',
            'true'
          );

          if (
            String(
              button.dataset.choiceId
            ) ===
            normalizedId
          ) {
            button.classList.add(
              'choice-selected'
            );
          }
        }
      );

      try {
        /*
         * Proteção contra mudança de cena
         * entre o começo e a execução.
         */
        if (
          transaction !==
          this.choiceTransaction
        ) {
          throw new Error(
            'Transação narrativa invalidada.'
          );
        }

        const result =
          this.executeChoice(
            choice,
            sceneId
          );

        return result;
      } catch (
        error
      ) {
        this.logger.error(
          `Falha na escolha ${normalizedId}`,
          error
        );

        /*
         * Só desbloqueia se ainda estivermos
         * na mesma cena.
         */
        if (
          safeText(
            this.state.get(
              'narrative.currentScene'
            )
          ) ===
          sceneId
        ) {
          this.choiceLocked =
            false;

          this.selectingChoice =
            false;

          qsa(
            '.choice-button',
            container || document
          ).forEach(
            button => {
              button.disabled =
                false;

              button.setAttribute(
                'aria-disabled',
                'false'
              );

              button.classList.remove(
                'choice-selected'
              );
            }
          );
        }

        this.ui.notify(
          'Falha na decisão',
          'A escolha não pôde ser processada. Nenhum progresso foi perdido.',
          'error'
        );

        return false;
      }
    }

    /*
     * ========================================================================
     * EXECUTA A ESCOLHA
     * ========================================================================
     */

    executeChoice(
      choice,
      sceneId
    ) {
      if (!choice) {
        return false;
      }

      /*
       * Determina o próximo destino ANTES das mutações.
       */
      const destination =
        choice.next ||
        SCENES[
          sceneId
        ]?.next ||
        null;

      if (
        destination &&
        !SCENES[
          destination
        ]
      ) {
        throw new Error(
          `Destino inexistente: ${destination}`
        );
      }

      /*
       * Termina o texto se necessário.
       */
      if (
        this.typing
      ) {
        this.skipTyping();
      }

      this.audio.choice();

      /*
       * ==============================================================
       * APLICA TODAS AS CONSEQUÊNCIAS
       * ==============================================================
       */

      this.state.batch(
        () => {
          /*
           * Efeitos estatísticos
           */
          const effects =
            isObject(
              choice.effects
            )
              ? choice.effects
              : {};

          for (
            const [
              key,
              amount
            ] of Object.entries(
              effects
            )
          ) {
            this.state.adjustStat(
              key,
              Number(
                amount
              ) || 0,
              `choice.${choice.id}`
            );
          }

          /*
           * Flags
           */
          const flags =
            isObject(
              choice.flags
            )
              ? choice.flags
              : {};

          for (
            const [
              key,
              value
            ] of Object.entries(
              flags
            )
          ) {
            this.state.set(
              `narrative.flags.${key}`,
              value,

              `choice.${choice.id}`
            );
          }

          /*
           * Histórico da escolha
           */
          const choices =
            this.state.get(
              'narrative.choices'
            ) || [];

          this.state.set(
            'narrative.choices',
            [
              ...choices,
              choice.id
            ],

            `choice.${choice.id}`
          );

          /*
           * Estatística
           */
          this.state.increment(
            'statistics.choices',
            1,

            `choice.${choice.id}`
          );
        },

        `choice.${choice.id}`
      );

      /*
       * Códex
       */
      if (
        choice.codex
      ) {
        this.codex.unlock(
          choice.codex
        );
      }

      /*
       * Missões
       */
      if (
        Array.isArray(
          choice.missionProgress
        )
      ) {
        const [
          missionId,
          amount
        ] =
          choice.missionProgress;

        this.missions.unlock(
          missionId
        );

        this.missions.progress(
          missionId,
          Number(
            amount
          ) || 0
        );
      }

      /*
       * Evento global.
       */
      this.bus.emit(
        'choice:selected',
        {
          id:
            choice.id,

          scene:
            sceneId,

          next:
            destination
        }
      );

      /*
       * Se não existir destino,
       * encerra o segmento.
       */
      if (!destination) {
        this.selectingChoice =
          false;

        this.choiceLocked =
          false;

        this.ui.notify(
          'Decisão registrada',
          'A escolha foi armazenada na crônica.',
          'success'
        );

        return true;
      }

      /*
       * CAMINHO PRINCIPAL:
       * próxima cena.
       */
      this.goto(
        destination
      );

      /*
       * goto() já abriu uma nova transação.
       */
      this.selectingChoice =
        false;

      this.choiceLocked =
        false;

      /*
       * Autosave será disparado
       * pelo StateManager/EventBus.
       */
      return true;
    }

    selectChoiceByIndex(
      index
    ) {
      const choices =
        this.availableChoices(
          this.current
        );

      if (
        !Number.isInteger(
          index
        )
      ) {
        return false;
      }

      const choice =
        choices[
          index
        ];

      if (!choice) {
        return false;
      }

      return this.selectChoiceById(
        choice.id
      );
    }
  }

  /* ==========================================================================
     SETTINGS MANAGER
     ========================================================================== */

  class SettingsManager {
    constructor(
      state,
      bus,
      ui,
      logger
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.ui =
        ui;

      this.logger =
        logger;
    }

    load() {
      try {
        const raw =
          localStorage.getItem(
            SETTINGS_KEY
          );

        if (!raw) {
          return;
        }

        const settings =
          JSON.parse(
            raw
          );

        if (
          !isObject(
            settings
          )
        ) {
          return;
        }

        this.state.patch(
          'settings',
          settings,
          'settings.load'
        );
      } catch (
        error
      ) {
        this.logger.warn(
          'Configurações anteriores ignoradas',
          error
        );
      }
    }

    set(
      key,
      value
    ) {
      const allowed =
        new Set([
          'fastText',
          'highContrast',
          'reducedMotion',
          'audio'
        ]);

      if (
        !allowed.has(
          key
        )
      ) {
        return;
      }

      this.state.set(
        `settings.${key}`,
        Boolean(
          value
        ),
        'settings.change'
      );

      try {
        localStorage.setItem(
          SETTINGS_KEY,

          JSON.stringify(
            this.state.get(
              'settings'
            )
          )
        );
      } catch (
        error
      ) {
        this.logger.warn(
          'Não foi possível salvar configurações',
          error
        );
      }

      this.bus.emit(
        'settings:changed',
        {
          key,

          value:
            Boolean(
              value
            )
        }
      );

      this.ui.render();
    }
  }

  /* ==========================================================================
     PARTICLE SYSTEM
     ========================================================================== */

  class ParticleSystem {
    constructor(
      state
    ) {
      this.state =
        state;

      this.container =
        null;

      this.timer =
        null;
    }

    start() {
      this.container =
        byId(
          'backgroundParticles'
        );

      if (!this.container) {
        return;
      }

      this.stop();

      if (
        this.state.get(
          'settings.reducedMotion'
        )
      ) {
        return;
      }

      this.loop();
    }

    loop() {
      this.spawn();

      this.timer =
        setTimeout(
          () =>
            this.loop(),
          1100
        );
    }

    spawn() {
      if (!this.container) {
        return;
      }

      const particle =
        document.createElement(
          'i'
        );

      particle.className =
        'jc-particle';

      particle.style.setProperty(
        '--x',
        `${Math.random() * 100}%`
      );

      particle.style.setProperty(
        '--size',
        `${1 + Math.random() * 3}px`
      );

      particle.style.setProperty(
        '--dur',
        `${5 + Math.random() * 7}s`
      );

      particle.style.setProperty(
        '--delay',
        `${Math.random() * 1.5}s`
      );

      this.container.appendChild(
        particle
      );

      setTimeout(
        () =>
          particle.remove(),
        15000
      );
    }

    stop() {
      clearTimeout(
        this.timer
      );

      this.timer =
        null;
    }
  }

  /* ==========================================================================
     VISUAL LAB
     ========================================================================== */

  class VisualLab {
    constructor(
      state,
      bus,
      logger
    ) {
      this.state =
        state;

      this.bus =
        bus;

      this.logger =
        logger;

      this.canvas =
        null;

      this.context =
        null;

      this.mode =
        'process';

      this.initialized =
        false;

      this.frame =
        null;

      this.lastRefresh =
        0;
    }

    init() {
      this.canvas =
        byId(
          'visualLabCanvas'
        );

      if (this.canvas) {
        this.context =
          this.canvas.getContext(
            '2d'
          );
      }

      this.initialized =
        true;

      this.resize();

      window.addEventListener(
        'resize',
        () =>
          this.resize()
      );

      this.refresh(
        true
      );
    }

    resize() {
      if (
        !this.canvas ||
        !this.context
      ) {
        return;
      }

      const rect =
        this.canvas.getBoundingClientRect();

      const width =
        Math.max(
          300,
          Math.floor(
            rect.width ||
              600
          )
        );

      const height =
        Math.max(
          180,
          Math.floor(
            rect.height ||
              260
          )
        );

      const dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          2
        );

      this.canvas.width =
        Math.floor(
          width *
            dpr
        );

      this.canvas.height =
        Math.floor(
          height *
            dpr
        );

      this.context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      this.draw();
    }

    setMode(
      mode
    ) {
      const allowed =
        new Set([
          'process',
          'dom',
          'css',
          'js',
          'system'
        ]);

      this.mode =
        allowed.has(
          mode
        )
          ? mode
          : 'process';

      qsa(
        '.visual-lab-tab'
      ).forEach(
        tab => {
          tab.classList.toggle(
            'active',

            (
              tab.dataset.mode ||
              'process'
            ) ===
              this.mode
          );
        }
      );

      this.refresh(
        true
      );
    }

    refresh(
      force = false
    ) {
      if (
        !this.initialized
      ) {
        return;
      }

      const now =
        performance.now();

      if (
        !force &&
        now -
          this.lastRefresh <
          30
      ) {
        return;
      }

      this.lastRefresh =
        now;

      this.updateDOM();

      this.draw();
    }

    updateDOM() {
      const flow =
        this.logger.lastFlow;

      const mapping = {
        visualLabAction:
          this.getActionLabel(),

        visualLabTarget:
          this.getTargetLabel(),

        visualLabTimestamp:
          new Date()
            .toLocaleTimeString(
              'pt-BR'
            ),

        visualLabEvent:
          flow.event,

        visualLabFunction:
          flow.function,

        visualLabState:
          flow.state,

        visualLabDomUpdate:
          flow.dom,

        visualLabResult:
          flow.result,

        visualLabFooterTarget:
          this.getTargetLabel(),

        visualLabObserverCount:
          String(
            this.logger.observerCount
          ),

        visualLabMutationCount:
          String(
            this.logger.mutationCount
          ),

        visualLabEventCount:
          String(
            this.logger.eventCount
          )
      };

      for (
        const [
          id,
          value
        ] of Object.entries(
          mapping
        )
      ) {
        const node =
          byId(
            id
          );

        if (node) {
          node.textContent =
            safeText(
              value
            );
        }
      }

      const context =
        byId(
          'visualLabContext'
        );

      if (context) {
        context.textContent =
          this.buildContext();
      }

      const tree =
        byId(
          'visualLabDomTree'
        );

      if (tree) {
        tree.textContent =
          this.buildDOMTree();
      }

      const metrics =
        byId(
          'visualLabCssMetrics'
        );

      if (metrics) {
        metrics.textContent =
          this.buildMetrics();
      }

      const log =
        byId(
          'visualLabJsLog'
        );

      if (log) {
        log.textContent =
          this.logger
            .latest(9)
            .map(
              entry =>
                `[${entry.time}] ${entry.level.toUpperCase()} — ${entry.message}`
            )
            .join(
              '\n'
            );
      }

      const tests =
        byId(
          'visualLabTests'
        );

      if (tests) {
        tests.textContent =
          this.buildTests();
      }
    }

    getActionLabel() {
      const labels = {
        process:
          'LIVE PROCESS // ENGINE',

        dom:
          'ANÁLISE // DOM',

        css:
          'ANÁLISE // CSS',

        js:
          'ANÁLISE // JAVASCRIPT',

        system:
          'ANÁLISE // SISTEMA'
      };

      return (
        labels[
          this.mode
        ] ||
        labels.process
      );
    }

    getTargetLabel() {
      return (
        this.state.get(
          'narrative.currentScene'
        ) ||
        'SYSTEM'
      );
    }

    buildContext() {
      const sceneId =
        this.state.get(
          'narrative.currentScene'
        );

      const scene =
        SCENES[
          sceneId
        ];

      if (!scene) {
        return 'Nenhuma cena ativa.';
      }

      return [
        `CENA: ${sceneId}`,
        `ORADOR: ${scene.speaker}`,
        `TIPO: ${scene.type}`,
        `LOCAL: ${scene.location}`,
        `ESCOLHAS: ${
          scene.choices?.length ||
          0
        }`,
        `FASE: ${
          this.state.get(
            'phase'
          )
        }`
      ].join(
        ' • '
      );
    }

    buildDOMTree() {
      return [
        'DOCUMENT',

        '├── HEADER',

        '│   ├── BRAND',

        '│   ├── STATUS',

        '│   └── ACTIONS',

        '├── MAIN',

        '│   ├── TITLE',

        '│   ├── CINEMATIC',

        '│   └── GAME',

        '│       ├── PLAYER HUD',

        '│       ├── WORLD',

        '│       ├── DIALOGUE',

        '│       └── SYSTEM HUD',

        '└── OVERLAYS'
      ].join(
        '\n'
      );
    }

    buildMetrics() {
      const sceneId =
        this.state.get(
          'narrative.currentScene'
        );

      const scene =
        SCENES[
          sceneId
        ];

      return [
        'WIDTH       AUTO',

        'HEIGHT      AUTO',

        'DISPLAY     GRID',

        `SCENE       ${sceneId}`,

        `LOCATION    ${this.state.get(
          'world.location'
        )}`,

        `CHOICES     ${
          scene?.choices?.length ||
          0
        }`,

        `TEMPORAL    ${
          Math.round(
            this.state.get(
              'player.stats.temporal'
            ) || 0
          )
        }%`
      ].join(
        '\n'
      );
    }

    buildTests() {
      const choice =
        Boolean(
          byId(
            'choiceContainer'
          )
        );

      const sceneId =
        this.state.get(
          'narrative.currentScene'
        );

      const scene =
        Boolean(
          SCENES[
            sceneId
          ]
        );

      const phase =
        Boolean(
          this.state.get(
            'phase'
          )
        );

      return [
        `DOM         ${
          choice
            ? 'OK'
            : 'FAIL'
        }`,

        `STATE       ${
          phase
            ? 'OK'
            : 'FAIL'
        }`,

        `SCENE       ${
          scene
            ? 'OK'
            : 'FAIL'
        }`,

        `CHOICES     ${
          this.state.get(
            'narrative.choices'
          )?.length ||
          0
        }`,

        `EVENTS      ${
          this.logger.eventCount
        }`
      ].join(
        '\n'
      );
    }

    draw() {
      if (
        !this.canvas ||
        !this.context
      ) {
        return;
      }

      const rect =
        this.canvas.getBoundingClientRect();

      const width =
        Math.max(
          300,
          Math.floor(
            rect.width ||
              600
          )
        );

      const height =
        Math.max(
          180,
          Math.floor(
            rect.height ||
              260
          )
        );

      const dpr =
        Math.min(
          window.devicePixelRatio ||
            1,
          2
        );

      this.context.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      const ctx =
        this.context;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      /*
       * GRADE
       */
      ctx.strokeStyle =
        'rgba(139,200,255,.16)';

      ctx.lineWidth =
        1;

      for (
        let x = 0;
        x < width;
        x += 32
      ) {
        ctx.beginPath();

        ctx.moveTo(
          x,
          0
        );

        ctx.lineTo(
          x,
          height
        );

        ctx.stroke();
      }

      for (
        let y = 0;
        y < height;
        y += 32
      ) {
        ctx.beginPath();

        ctx.moveTo(
          0,
          y
        );

        ctx.lineTo(
          width,
          y
        );

        ctx.stroke();
      }

      /*
       * NÓS DO FLUXO
       */
      const nodes = [
        {
          label:
            'EVENT',

          x:
            width * 0.18,

          y:
            height * 0.48
        },

        {
          label:
            'STATE',

          x:
            width * 0.39,

          y:
            height * 0.32
        },

        {
          label:
            'DOM',

          x:
            width * 0.61,

          y:
            height * 0.66
        },

        {
          label:
            'RESULT',

          x:
            width * 0.82,

          y:
            height * 0.42
        }
      ];

      /*
       * CONEXÕES
       */
      ctx.strokeStyle =
        'rgba(114,246,220,.34)';

      ctx.lineWidth =
        1.5;

      for (
        let i = 0;
        i <
        nodes.length -
          1;
        i += 1
      ) {
        ctx.beginPath();

        ctx.moveTo(
          nodes[i].x,
          nodes[i].y
        );

        ctx.lineTo(
          nodes[i + 1].x,
          nodes[i + 1].y
        );

        ctx.stroke();
      }

      /*
       * NÓS
       */
      nodes.forEach(
        node => {
          ctx.beginPath();

          ctx.arc(
            node.x,
            node.y,
            18,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            'rgba(114,246,220,.26)';

          ctx.fill();

          ctx.beginPath();

          ctx.arc(
            node.x,
            node.y,
            5,
            0,
            Math.PI * 2
          );

          ctx.fillStyle =
            'rgba(240,250,255,.95)';

          ctx.fill();

          ctx.font =
            '700 10px ui-monospace, monospace';

          ctx.textAlign =
            'center';

          ctx.fillStyle =
            'rgba(220,239,255,.82)';

          ctx.fillText(
            node.label,

            node.x,

            node.y + 31
          );
        }
      );

      /*
       * TELEMETRIA
       */
      ctx.textAlign =
        'left';

      ctx.font =
        '700 10px ui-monospace, monospace';

      ctx.fillStyle =
        'rgba(220,239,255,.72)';

      const telemetry = [
        `PHASE  ${safeText(
          this.state.get(
            'phase'
          )
        ).toUpperCase()}`,

        `SCENE  ${safeText(
          this.state.get(
            'narrative.currentScene'
          )
        )}`,

        `EVENTS ${this.logger.eventCount}`,

        `MUT    ${this.logger.mutationCount}`,

        `MODE   ${this.mode.toUpperCase()}`
      ];

      telemetry.forEach(
        (
          line,
          index
        ) => {
          ctx.fillText(
            line,
            12,
            18 +
              index *
                15
          );
        }
      );

      /*
       * SCANNER
       */
      if (
        !this.state.get(
          'settings.reducedMotion'
        )
      ) {
        const t =
          performance.now() *
          0.0005;

        const scanX =
          (
            (
              Math.sin(
                t
              ) +
              1
            ) /
            2
          ) *
          width;

        ctx.strokeStyle =
          'rgba(114,246,220,.18)';

        ctx.beginPath();

        ctx.moveTo(
          scanX,
          0
        );

        ctx.lineTo(
          scanX,
          height
        );

        ctx.stroke();

        cancelAnimationFrame(
          this.frame
        );

        this.frame =
          requestAnimationFrame(
            () =>
              this.draw()
          );
      }
    }

    clear() {
      if (
        !this.canvas ||
        !this.context
      ) {
        return;
      }

      const rect =
        this.canvas.getBoundingClientRect();

      const width =
        rect.width ||
        600;

      const height =
        rect.height ||
        260;

      this.context.clearRect(
        0,
        0,
        width,
        height
      );
    }
  }

  /* ==========================================================================
     GAME CONTROLLER
     ========================================================================== */

  class GameController {
    constructor() {
      this.logger =
        new GameLogger();

      this.bus =
        new EventBus(
          this.logger
        );

      this.state =
        new StateManager(
          this.bus,
          this.logger
        );

      this.audio =
        new AudioManager(
          this.state,
          this.logger
        );

      this.ui =
        new UIManager(
          this.state,
          this.bus,
          this.logger,
          this.audio
        );

      this.missions =
        new MissionManager(
          this.state,
          this.bus,

          (...args) =>
            this.ui.notify(
              ...args
            )
        );

      this.codex =
        new CodexManager(
          this.state,
          this.bus,

          (...args) =>
            this.ui.notify(
              ...args
            )
        );

      this.save =
        new SaveManager(
          this.state,
          this.bus,
          this.logger,

          (...args) =>
            this.ui.notify(
              ...args
            )
        );

      this.settings =
        new SettingsManager(
          this.state,
          this.bus,
          this.ui,
          this.logger
        );

      this.narrative =
        new NarrativeEngine(
          this.state,
          this.bus,
          this.ui,
          this.logger,
          this.audio,
          this.missions,
          this.codex
        );

      this.particles =
        new ParticleSystem(
          this.state
        );

      this.visualLab =
        new VisualLab(
          this.state,
          this.bus,
          this.logger
        );

      this.started =
        false;

      this.playTimer =
        null;

      this.lastClock =
        performance.now();

      this.renderScheduled =
        false;

      this.lastRender =
        0;
    }

    init() {
      if (
        this.started
      ) {
        return;
      }

      this.started =
        true;

      window.game =
        this;

      this.settings.load();

      this.bindSystemEvents();

      this.ui.initBindings(
        this
      );

      this.ui.render();

      this.narrative.renderCinematic();

      this.visualLab.init();

      this.particles.start();

      this.startPlayClock();

      this.ui.showScreen(
        'screenTitle'
      );

      this.ui.render();

      this.updateContinueButton();

      this.logger.info(
        'JESUS CHRONICLES inicializado',
        VERSION
      );

      this.visualLab.refresh(
        true
      );
    }

    bindSystemEvents() {
      /*
       * Estado.
       */
      this.bus.on(
        'state:changed',
        payload => {
          this.scheduleRender();

          if (
            this.shouldAutosave(
              payload?.source
            )
          ) {
            this.save.schedule();
          }

          this.visualLab.refresh();
        }
      );

      this.bus.on(
        'state:reset',
        () => {
          this.scheduleRender();

          this.visualLab.refresh(
            true
          );
        }
      );

      /*
       * Eventos importantes.
       */
      [
        'screen:changed',
        'scene:changed',
        'choice:selected',
        'mission:updated',
        'codex:updated',
        'save:completed',
        'save:loaded',
        'save:deleted',
        'settings:changed',
        'overlay:opened',
        'overlay:closed'
      ].forEach(
        eventName => {
          this.bus.on(
            eventName,
            () => {
              this.scheduleRender();

              this.visualLab.refresh(
                true
              );
            }
          );
        }
      );

      /*
       * Erros globais.
       */
      window.addEventListener(
        'error',
        event => {
          this.logger.error(
            'Erro global de JavaScript',
            event.error ||
              event.message
          );

          this.visualLab.refresh(
            true
          );
        }
      );

      window.addEventListener(
        'unhandledrejection',
        event => {
          this.logger.error(
            'Promise rejeitada',
            event.reason
          );

          this.visualLab.refresh(
            true
          );
        }
      );
    }

    scheduleRender() {
      if (
        this.renderScheduled
      ) {
        return;
      }

      this.renderScheduled =
        true;

      requestAnimationFrame(
        () => {
          this.renderScheduled =
            false;

          this.render();
        }
      );
    }

    render() {
      const now =
        performance.now();

      if (
        now -
          this.lastRender <
        8
      ) {
        return;
      }

      this.lastRender =
        now;

      try {
        this.ui.render();

        this.updateContinueButton();
      } catch (
        error
      ) {
        this.logger.error(
          'Erro de renderização',
          error
        );
      }
    }

    shouldAutosave(
      source = ''
    ) {
      const phase =
        this.state.get(
          'phase'
        );

      if (
        phase ===
        'title'
      ) {
        return false;
      }

      if (!source) {
        return true;
      }

      const normalized =
        String(
          source
        );

      if (
        normalized.startsWith(
          'save'
        )
      ) {
        return false;
      }

      if (
        normalized.startsWith(
          'autosave'
        )
      ) {
        return false;
      }

      if (
        normalized ===
        'clock.tick'
      ) {
        return false;
      }

      if (
        normalized ===
        'settings.change'
      ) {
        return false;
      }

      return true;
    }

    updateContinueButton() {
      const button =
        byId(
          'continueButton'
        );

      if (!button) {
        return;
      }

      const available =
        this.save.hasSave();

      button.classList.toggle(
        'hidden',
        !available
      );

      button.disabled =
        false;
    }

    startPlayClock() {
      clearInterval(
        this.playTimer
      );

      this.lastClock =
        performance.now();

      this.playTimer =
        setInterval(
          () => {
            const phase =
              this.state.get(
                'phase'
              );

            const now =
              performance.now();

            const delta =
              Math.min(
                5000,

                Math.max(
                  0,

                  now -
                    this.lastClock
                )
              );

            this.lastClock =
              now;

            if (
              phase !==
              'game'
            ) {
              return;
            }

            this.state.silentDepth +=
              1;

            try {
              this.state.state.meta.playSeconds +=
                delta /
                1000;
            } finally {
              this.state.silentDepth -=
                1;
            }
          },

          PLAY_CLOCK_INTERVAL
        );
    }

    startNewGame() {
      this.audio.click();

      clearTimeout(
        this.narrative.timer
      );

      this.narrative.typing =
        false;

      this.narrative.current =
        null;

      this.narrative.choiceLocked =
        false;

      this.narrative.selectingChoice =
        false;

      this.narrative.choiceTransaction +=
        1;

      this.state.reset(
        true
      );

      this.state.set(
        'meta.createdAt',
        nowISO(),
        'newGame'
      );

      this.state.set(
        'narrative.currentScene',
        'g_intro',
        'newGame'
      );

      this.state.set(
        'narrative.cinematicIndex',
        0,
        'newGame'
      );

      this.ui.transition(
        () => {
          this.ui.showScreen(
            'screenCinematic'
          );

          this.narrative.renderCinematic();
        }
      );

      this.visualLab.refresh(
        true
      );
    }

    continueGame() {
      return this.loadSavedGame();
    }

    loadSavedGame() {
      const loaded =
        this.save.load();

      if (!loaded) {
        this.render();

        return false;
      }

      const phase =
        this.state.get(
          'phase'
        );

      this.ui.transition(
        () => {
          if (
            phase ===
            'cinematic'
          ) {
            this.ui.showScreen(
              'screenCinematic'
            );

            this.narrative.renderCinematic();

            return;
          }

          if (
            phase ===
            'game'
          ) {
            this.ui.showScreen(
              'screenGame'
            );

            this.narrative.goto(
              this.state.get(
                'narrative.currentScene'
              ) ||
                'g_intro'
            );

            return;
          }

          this.ui.showScreen(
            'screenTitle'
          );
        }
      );

      this.render();

      this.visualLab.refresh(
        true
      );

      return true;
    }

    deleteSaveWithConfirm() {
      if (
        !this.save.hasSave()
      ) {
        return false;
      }

      const confirmed =
        window.confirm(
          'Apagar o save local desta crônica?'
        );

      if (
        !confirmed
      ) {
        return false;
      }

      const result =
        this.save.delete();

      this.render();

      return result;
    }

    restartToTitle() {
      clearTimeout(
        this.narrative.timer
      );

      this.narrative.typing =
        false;

      this.narrative.choiceLocked =
        false;

      this.narrative.selectingChoice =
        false;

      this.narrative.choiceTransaction +=
        1;

      this.ui.transition(
        () => {
          this.ui.showScreen(
            'screenTitle'
          );
        }
      );

      this.visualLab.refresh(
        true
      );
    }

    inspect() {
      if (
        this.state.get(
          'phase'
        ) !==
        'game'
      ) {
        return;
      }

      this.audio.click();

      this.state.increment(
        'world.inspectCount',
        1,
        'inspect'
      );

      this.state.increment(
        'statistics.inspections',
        1,
        'inspect'
      );

      const locationId =
        this.state.get(
          'world.location'
        );

      const messages = {
        mega_city:
          'Sinais civis ainda funcionam em intervalos. Há zonas onde a população resiste fora dos protocolos.',

        chrono_lab:
          'O núcleo temporal apresenta microvariações incompatíveis com a previsão oficial.',

        archive:
          'Os registros ocultos possuem lacunas deliberadas. Alguém decidiu quais partes da história deveriam sobreviver.',

        transit:
          'A passagem não é um corredor: é uma sobreposição de possibilidades.',

        galilee:
          'Antes de interferir, observe. Pessoas reais não sabem que você veio de uma era diferente.'
      };

      this.missions.progress(
        'intro',
        1
      );

      this.ui.notify(
        `LEITURA // ${safeText(
          LOCATIONS[
            locationId
          ]?.name ||
            locationId
        ).toUpperCase()}`,

        messages[
          locationId
        ] ||
          'Nenhum dado adicional disponível.',

        'info'
      );

      this.bus.emit(
        'world:inspected',
        {
          location:
            locationId
        }
      );
    }

    activateSystemTab(
      tabId
    ) {
      const allowed =
        new Set([
          'missionTab',
          'timelineTab',
          'codexTab'
        ]);

      const target =
        allowed.has(
          tabId
        )
          ? tabId
          : 'missionTab';

      qsa(
        '.system-tab'
      ).forEach(
        button => {
          const active =
            button.dataset.tab ===
            target;

          button.classList.toggle(
            'active',
            active
          );

          button.setAttribute(
            'aria-selected',
            String(
              active
            )
          );
        }
      );

      qsa(
        '.system-tab-content'
      ).forEach(
        panel => {
          panel.classList.toggle(
            'active',
            panel.id ===
              target
          );
        }
      );

      this.audio.click();

      this.bus.emit(
        'system:tabChanged',
        {
          id:
            target
        }
      );

      this.visualLab.refresh(
        true
      );
    }

    handleKey(
      event
    ) {
      if (!event) {
        return;
      }

      /*
       * CTRL/CMD + S
       */
      if (
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key.toLowerCase() ===
          's'
      ) {
        event.preventDefault();

        this.save.save();

        return;
      }

      /*
       * ESC
       */
      if (
        event.key ===
        'Escape'
      ) {
        if (
          this.ui.closeTopOverlay()
        ) {
          event.preventDefault();
        }

        return;
      }

      const phase =
        this.state.get(
          'phase'
        );

      /*
       * CINEMÁTICA
       */
      if (
        phase ===
        'cinematic'
      ) {
        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault();

          this.narrative.nextCinematic();
        }

        return;
      }

      /*
       * JOGO
       */
      if (
        phase !==
        'game'
      ) {
        return;
      }

      /*
       * INSPEÇÃO
       */
      if (
        event.key.toLowerCase() ===
        'e'
      ) {
        event.preventDefault();

        this.inspect();

        return;
      }

      /*
       * ENTER
       */
      if (
        event.key ===
        'Enter'
      ) {
        event.preventDefault();

        this.narrative.continue();

        return;
      }

      /*
       * ESCOLHAS 1-9
       */
      if (
        /^[1-9]$/.test(
          event.key
        )
      ) {
        event.preventDefault();

        this.narrative.selectChoiceByIndex(
          Number(
            event.key
          ) - 1
        );
      }
    }
  }

  /* ==========================================================================
     BOOT
     ========================================================================== */

  const boot = () => {
    try {
      const game =
        new GameController();

      game.init();

      window.game =
        game;

      document.documentElement.dataset.jcBoot =
        'ok';

      console.info(
        '[JC] Boot concluído'
      );
    } catch (
      error
    ) {
      console.error(
        '[JC] Falha crítica na inicialização',
        error
      );

      document.documentElement.dataset.jcBoot =
        'error';

      const stack =
        byId(
          'notificationStack'
        );

      if (stack) {
        const item =
          document.createElement(
            'div'
          );

        item.className =
          'notification notification-error show';

        const title =
          document.createElement(
            'strong'
          );

        title.textContent =
          'Falha ao iniciar';

        const message =
          document.createElement(
            'span'
          );

        message.textContent =
          'O sistema detectou um erro na inicialização. Verifique o console do navegador.';

        item.append(
          title,
          message
        );

        stack.appendChild(
          item
        );
      }
    }
  };

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {
        once:
          true
      }
    );
  } else {
    boot();
  }

})();
