/* ==========================================================================
   JESUS CHRONICLES
   PROLOGUE MODULE
   ==========================================================================
   MÓDULO COMPLETO DO PRÓLOGO

   Este arquivo NÃO substitui:
   - app.js
   - app.continuation.js

   Este arquivo COMPLEMENTA os dois.

   RESPONSABILIDADES:
   - reconstruir o fluxo do Prólogo;
   - separar Prólogo de Ato I;
   - criar exploração contextual;
   - criar pontos de interesse;
   - registrar observações;
   - registrar decisões;
   - criar consequências;
   - controlar estado;
   - controlar tutorial;
   - preparar Ato I;
   - preservar save;
   - preservar HUD;
   - preservar Campaign Engine.

   IMPORTANTE:

   O PRÓLOGO NÃO DEVE CONSUMIR O ATO II/ATO III.

   O salto temporal continua sendo um conteúdo posterior.

   Aqui o jogador ainda está no futuro.
   ========================================================================== */

(() => {
  'use strict';

  /* =========================================================================
     ESPERA PELO MOTOR PRINCIPAL
     ========================================================================= */

  const waitForGame = (
    callback,
    attempt = 0
  ) => {
    if (
      window.game &&
      window.game.state &&
      window.game.narrative &&
      window.game.ui
    ) {
      callback(
        window.game
      );

      return;
    }

    if (
      attempt >=
      120
    ) {
      console.error(
        '[JC PROLOGUE] Motor principal não encontrado.'
      );

      return;
    }

    setTimeout(
      () =>
        waitForGame(
          callback,
          attempt + 1
        ),
      100
    );
  };

  /* =========================================================================
     UTILITÁRIOS
     ========================================================================= */

  const safe = (
    value
  ) =>
    String(
      value ??
        ''
    );

  const clamp = (
    value,
    min = 0,
    max = 100
  ) => {
    const number =
      Number(
        value
      );

    if (
      !Number.isFinite(
        number
      )
    ) {
      return min;
    }

    return Math.min(
      max,
      Math.max(
        min,
        number
      )
    );
  };

  const byId = (
    id
  ) =>
    document.getElementById(
      id
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

  const create = (
    tag,
    className = '',
    text = ''
  ) => {
    const node =
      document.createElement(
        tag
      );

    if (
      className
    ) {
      node.className =
        className;
    }

    if (
      text
    ) {
      node.textContent =
        text;
    }

    return node;
  };

  /* =========================================================================
     IDENTIDADE DO PRÓLOGO
     ========================================================================= */

  const PROLOGUE_ID =
    'prologue';

  const PROLOGUE_ACT_NUMBER =
    0;

  const ACT_I_ID =
    'act1';

  /* =========================================================================
     PONTOS DE EXPLORAÇÃO
     ========================================================================= */

  const PROLOGUE_POIS = {

    city_horizon: {
      id:
        'city_horizon',

      title:
        'Horizonte da Megacidade',

      short:
        'Observar a cidade a partir da zona elevada.',

      description:
        'Torres reconstruídas, ruínas antigas, barreiras energéticas e bairros inteiros separados por níveis de acesso revelam um futuro que não caiu completamente — apenas deixou de pertencer igualmente a todos.',

      consequence: {
        stats: {
          hope:
            2,

          freedom:
            2
        },

        flags: {
          sawSocialDivide:
            true
        }
      },

      discovery:
        'city_social_divide'
    },

    civilian_zone: {
      id:
        'civilian_zone',

      title:
        'Zona Civil',

      short:
        'Observar a população protegida pelos protocolos.',

      description:
        'Pessoas esperam por racionamento, drones verificam permissões e telas públicas repetem mensagens sobre segurança. Um menino olha para o céu sempre que um drone passa.',

      consequence: {
        stats: {
          hope:
            3,

          guilt:
            1
        },

        flags: {
          witnessedCivilianLife:
            true
        }
      },

      discovery:
        'controlled_population'
    },

    abandoned_sector: {
      id:
        'abandoned_sector',

      title:
        'Setor Abandonado',

      short:
        'Investigar uma região fora das barreiras.',

      description:
        'A cidade termina abruptamente. Estruturas quebradas são cobertas por vegetação contaminada e sinais antigos de evacuação. No interior de uma parede caída existe um símbolo técnico que você não reconhece.',

      consequence: {
        stats: {
          freedom:
            3,

          hope:
            -1
        },

        flags: {
          sawAbandonedSector:
            true
        }
      },

      discovery:
        'unknown_symbol'
    },

    resistance_signal: {
      id:
        'resistance_signal',

      title:
        'Sinal Interrompido',

      short:
        'Detectar uma transmissão clandestina.',

      description:
        'Entre frequências militares e propaganda oficial existe um sinal breve. Alguém está tentando transmitir uma mensagem fora dos canais autorizados. O conteúdo é incompleto.',

      consequence: {
        stats: {
          freedom:
            4,

          control:
            -2
        },

        flags: {
          heardIllegalSignal:
            true
        }
      },

      discovery:
        'illegal_signal'
    },

    cronos_gate: {
      id:
        'cronos_gate',

      title:
        'Entrada do Complexo Cronos',

      short:
        'Observar a instalação que mudará sua vida.',

      description:
        'A instalação parece mais antiga do que os documentos oficiais indicam. Camadas de segurança modernas escondem estruturas muito anteriores ao projeto anunciado.',

      consequence: {
        stats: {
          control:
            2
        },

        flags: {
          inspectedCronosExterior:
            true
        }
      },

      discovery:
        'cronos_anomaly'
    }
  };

  /* =========================================================================
     ESTADO EXTRA DO PRÓLOGO
     ========================================================================= */

  const ensurePrologueState = (
    game
  ) => {
    const state =
      game.state;

    const existing =
      state.get(
        'prologue'
      );

    if (
      existing
    ) {
      return;
    }

    state.set(
      'prologue',
      {
        active:
          true,

        completed:
          false,

        tutorialStep:
          0,

        explorationUnlocked:
          false,

        explorationComplete:
          false,

        objective:
          'Entender por que você foi escolhido.',

        visitedPOIs:
          [],

        discoveries:
          [],

        investigations:
          [],

        choices:
          [],

        briefingComplete:
          false,

        missionAccepted:
          false,

        missionQuestioned:
          false,

        missionRefused:
          false,

        civilianContact:
          false,

        cityObserved:
          false,

        cronosObserved:
          false,

        finalDecision:
          null,

        transitionReady:
          false
      },
      'prologue.initialize'
    );

    /*
     * Variáveis que serão úteis posteriormente.
     *
     * Não interferem no sistema existente.
     */
    const campaign =
      state.get(
        'campaign'
      );

    if (
      campaign
    ) {
      state.patch(
        'campaign',
        {
          prologue: {
            completed:
              false,

            discoveries:
              [],

            decisions:
              [],

            exploration:
              []
          }
        },
        'prologue.campaign.initialize'
      );
    }
  };

  /* =========================================================================
     CENAS DO PRÓLOGO
     ========================================================================= */

  const PROLOGUE_SCENES = {

    p00_operation: {
      id:
        'p00_operation',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'REGISTRO DE OPERAÇÃO',

      type:
        'ABERTURA',

      location:
        'mega_city',

      text:
        'A operação começou antes do amanhecer. Uma zona de conflito havia sido isolada depois de mais uma noite de confrontos. Você não sabia quem estava vencendo — apenas que havia pessoas tentando sobreviver entre destroços, drones e barreiras energéticas.',

      next:
        'p01_rescue'
    },

    p01_rescue: {
      id:
        'p01_rescue',

      speaker:
        'AGENTE DESCONHECIDO',

      role:
        'UNIDADE DE EXTRAÇÃO',

      type:
        'CINEMÁTICA',

      location:
        'mega_city',

      text:
        '“Você vem conosco.” A mão enluvada se estende. Atrás dela, uma aeronave silenciosa paira sobre a rua destruída. Você ainda não sabe por quê, mas alguém decidiu que sua sobrevivência importa.',

      choices: [
        {
          id:
            'accept_extraction',

          text:
            'Aceitar a extração.',

          effects: {
            hope:
              2
          },

          flags: {
            acceptedExtraction:
              true
          },

          next:
            'p02_arrival'
        },

        {
          id:
            'ask_reason',

          text:
            '“Quem mandou vocês?”',

          effects: {
            freedom:
              2,

            control:
              -1
          },

          flags: {
            askedExtractionReason:
              true
          },

          next:
            'p02_arrival'
        },

        {
          id:
            'refuse_extraction',

          text:
            'Recusar e tentar permanecer na zona.',

          effects: {
            control:
              3,

            hope:
              -2
          },

          flags: {
            resistedExtraction:
              true
          },

          next:
            'p02_arrival'
        }
      ]
    },

    p02_arrival: {
      id:
        'p02_arrival',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'SISTEMA',

      type:
        'NARRAÇÃO',

      location:
        'chrono_lab',

      text:
        'A aeronave atravessa a última camada de fumaça e entra em uma região protegida. O mundo muda em poucos quilômetros: ruínas dão lugar a concreto limpo, corredores sanitizados e barreiras que reconhecem cada pessoa antes que ela atravesse uma porta.',

      onEnter: {
        codex:
          'future'
      },

      next:
        'p03_briefing'
    },

    p03_briefing: {
      id:
        'p03_briefing',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'DIÁLOGO',

      location:
        'chrono_lab',

      text:
        '“Não estamos interessados apenas em sua capacidade de sobreviver.” Mirela coloca uma série de imagens sobre a mesa. “Precisamos saber por que você continua tentando ajudar pessoas quando praticamente todo o resto da cidade aprendeu a olhar para o outro lado.”',

      choices: [
        {
          id:
            'answer_people',

          text:
            '“Porque ainda são pessoas.”',

          effects: {
            hope:
              6,

            freedom:
              2
          },

          flags: {
            motiveHumanity:
              true
          },

          next:
            'p04_simulation'
        },

        {
          id:
            'answer_duty',

          text:
            '“Porque alguém precisa fazer o trabalho.”',

          effects: {
            control:
              5
          },

          flags: {
            motiveDuty:
              true
          },

          next:
            'p04_simulation'
        },

        {
          id:
            'answer_unknown',

          text:
            '“Eu não sei.”',

          effects: {
            hope:
              1,

            freedom:
              3
          },

          flags: {
            motiveUncertain:
              true
          },

          next:
            'p04_simulation'
        }
      ]
    },

    p04_simulation: {
      id:
        'p04_simulation',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'SIMULAÇÃO HISTÓRICA',

      type:
        'NARRAÇÃO',

      location:
        'chrono_lab',

      text:
        'As imagens começam. Uma guerra. Depois outra. Cidades inundadas. Colheitas perdidas. Hospitais lotados. Governos usando segurança como justificativa para ampliar vigilância. A tecnologia avançou mais rápido do que a responsabilidade necessária para controlá-la.',

      next:
        'p05_truth'
    },

    p05_truth: {
      id:
        'p05_truth',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'DIÁLOGO',

      location:
        'chrono_lab',

      text:
        '“O futuro não está simplesmente doente. O futuro aprendeu a funcionar doente.” Mirela pausa. “Nós estudamos milhares de possibilidades. Nenhuma solução direta permanece estável.”',

      choices: [
        {
          id:
            'ask_solution',

          text:
            '“Então por que me trouxeram aqui?”',

          effects: {
            freedom:
              4
          },

          flags: {
            askedSolution:
              true
          },

          next:
            'p06_hypothesis'
        },

        {
          id:
            'ask_cost',

          text:
            '“Quanto vai custar tentar?”',

          effects: {
            control:
              3,

            temporal:
              -1
          },

          flags: {
            askedCost:
              true
          },

          next:
            'p06_hypothesis'
        },

        {
          id:
            'remain_silent',

          text:
            'Permanecer em silêncio.',

          effects: {
            hope:
              1,

            temporal:
              1
          },

          flags: {
            silentBriefing:
              true
          },

          next:
            'p06_hypothesis'
        }
      ]
    },

    p06_hypothesis: {
      id:
        'p06_hypothesis',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'REVELAÇÃO',

      location:
        'chrono_lab',

      text:
        '“Encontramos uma possibilidade que não envolve tentar corrigir o futuro diretamente. Envolve buscar uma resposta no passado.” Ela finalmente diz o nome que todos naquela sala estavam evitando dizer: “Jesus.”',

      next:
        'p07_reaction'
    },

    p07_reaction: {
      id:
        'p07_reaction',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'NARRAÇÃO',

      type:
        'DECISÃO',

      location:
        'chrono_lab',

      text:
        'O silêncio da sala muda de qualidade. Não é mais o silêncio de uma reunião científica. É o silêncio de pessoas que acabaram de admitir que sua última esperança depende de uma hipótese que a própria ciência não consegue explicar.',

      choices: [
        {
          id:
            'believe',

          text:
            'Acreditar que talvez exista uma chance.',

          effects: {
            hope:
              7
          },

          flags: {
            initialBelief:
              true
          },

          next:
            'p08_choice'
        },

        {
          id:
            'doubt',

          text:
            'Questionar a hipótese.',

          effects: {
            freedom:
              5,

            hope:
              -1
          },

          flags: {
            initialDoubt:
              true
          },

          next:
            'p08_choice'
        },

        {
          id:
            'reject',

          text:
            '“Vocês querem transformar uma pessoa em uma solução.”',

          effects: {
            freedom:
              7,

            control:
              -3
          },

          flags: {
            recognizedInstrumentalization:
              true
          },

          next:
            'p08_choice'
        }
      ]
    },

    p08_choice: {
      id:
        'p08_choice',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'DIÁLOGO',

      location:
        'chrono_lab',

      text:
        '“Nós não sabemos se vai funcionar.” Mirela não tenta esconder a fragilidade da hipótese. “Mas sabemos que não conseguiríamos transportar um grupo inteiro com segurança. Precisamos de uma única pessoa.”',

      choices: [
        {
          id:
            'volunteer',

          text:
            '“Eu vou.”',

          effects: {
            hope:
              4,

            control:
              4
          },

          flags: {
            volunteered:
              true
          },

          next:
            'p09_selection'
        },

        {
          id:
            'ask_why_me',

          text:
            '“Por que eu?”',

          effects: {
            freedom:
              3
          },

          flags: {
            questionedSelection:
              true
          },

          next:
            'p09_selection'
        },

        {
          id:
            'ask_probability',

          text:
            '“Qual é a chance real disso funcionar?”',

          effects: {
            control:
              2
          },

          flags: {
            requestedProbability:
              true
          },

          next:
            'p09_selection'
        }
      ]
    },

    p09_selection: {
      id:
        'p09_selection',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'REVELAÇÃO',

      location:
        'chrono_lab',

      text:
        '“Você sobreviveu onde outros não sobreviveram. Consegue tomar decisões sob pressão. E ainda parece acreditar que uma escolha individual pode importar.” Ela toca a tela. “É exatamente por isso que você é perigoso para este projeto — e exatamente por isso que precisamos de você.”',

      onEnter: {
        prologueFlag:
          'selectedForMission'
      },

      next:
        'p10_exploration'
    },

    p10_exploration: {
      id:
        'p10_exploration',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'INTERFACE DE EXPLORAÇÃO',

      type:
        'TUTORIAL',

      location:
        'mega_city',

      text:
        'Antes de receber a missão definitiva, você recebe acesso limitado à megacidade. Mirela quer que você observe o mundo que pretende salvar. Não existe objetivo secundário obrigatório. Existe algo mais importante: entender o que está em jogo.',

      onEnter: {
        prologueExploration:
          true
      },

      next:
        'p11_return'
    },

    p11_return: {
      id:
        'p11_return',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'NARRAÇÃO',

      type:
        'TRANSIÇÃO',

      location:
        'chrono_lab',

      text:
        'Depois de observar a cidade, você retorna ao Complexo Cronos. Agora as imagens nas paredes parecem diferentes. Você já não está olhando apenas para números. Você está pensando nas pessoas atrás deles.',

      onEnter: {
        prologueExplorationComplete:
          true
      },

      next:
        'p12_final_briefing'
    },

    p12_final_briefing: {
      id:
        'p12_final_briefing',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'BRIEFING FINAL',

      location:
        'chrono_lab',

      text:
        '“Você sabe o que vai fazer agora.” Mirela ativa a projeção do histórico conhecido. “Viajar ao passado. Localizar Jesus. Explicar a destruição do futuro. Pedir que Ele venha conosco. A organização acredita que Sua presença poderá corrigir aquilo que nós não conseguimos corrigir.”',

      onEnter: {
        missionBriefingComplete:
          true
      },

      next:
        'p13_mission_question'
    },

    p13_mission_question: {
      id:
        'p13_mission_question',

      speaker:
        'DRA. MIRELA VOSS',

      role:
        'DIRETORA DO PROJETO',

      type:
        'DIÁLOGO',

      location:
        'chrono_lab',

      text:
        '“Você entende o tamanho do que está sendo pedido?”',

      choices: [
        {
          id:
            'accept_mission',

          text:
            '“Sim. Eu aceito a missão.”',

          effects: {
            control:
              7,

            hope:
              4,

            freedom:
              -2
          },

          flags: {
            missionAccepted:
              true
          },

          next:
            'p14_before_departure'
        },

        {
          id:
            'question_mission',

          text:
            '“Entendo a missão. Mas não sei se trazer alguém do passado para resolver o futuro é certo.”',

          effects: {
            freedom:
              8,

            hope:
              2,

            control:
              -4
          },

          flags: {
            missionQuestioned:
              true
          },

          next:
            'p14_before_departure'
        },

        {
          id:
            'reject_mission',

          text:
            '“Não. Não posso tratar uma pessoa como uma solução.”',

          effects: {
            freedom:
              10,

            hope:
              -3,

            control:
              -6
          },

          flags: {
            missionRefused:
              true
          },

          next:
            'p14_before_departure'
        }
      ]
    },

    p14_before_departure: {
      id:
        'p14_before_departure',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'SISTEMA',

      type:
        'NARRAÇÃO',

      location:
        'chrono_lab',

      text:
        'A sala fica em silêncio. A missão agora faz parte do seu registro. Não há mais como fingir que se trata de uma hipótese abstrata. Em poucas horas, sua decisão será registrada como uma das escolhas que definiram a história da organização.',

      next:
        'p15_last_question'
    },

    p15_last_question: {
      id:
        'p15_last_question',

      speaker:
        'MEMBRO DA ORGANIZAÇÃO',

      role:
        'OBSERVADOR',

      type:
        'GANCHO',

      location:
        'chrono_lab',

      text:
        'Um dos membros da organização se aproxima quando Mirela deixa a sala. Ele não sorri. Apenas pergunta: “Você tem certeza de que quer salvar o mundo?”',

      choices: [
        {
          id:
            'yes_save_world',

          text:
            '“Sim.”',

          effects: {
            hope:
              5,

            control:
              2
          },

          flags: {
            saidYesToSavingWorld:
              true
          },

          next:
            'p16_price'
        },

        {
          id:
            'yes_but',

          text:
            '“Sim. Mas não sei se nós sabemos o que significa salvá-lo.”',

          effects: {
            freedom:
              7,

            hope:
              2
          },

          flags: {
            qualifiedYes:
              true
          },

          next:
            'p16_price'
        },

        {
          id:
            'not_sure',

          text:
            '“Eu não tenho certeza.”',

          effects: {
            freedom:
              5,

            hope:
              -1
          },

          flags: {
            uncertainSavingWorld:
              true
          },

          next:
            'p16_price'
        }
      ]
    },

    p16_price: {
      id:
        'p16_price',

      speaker:
        'MEMBRO DA ORGANIZAÇÃO',

      role:
        'OBSERVADOR',

      type:
        'REVELAÇÃO',

      location:
        'chrono_lab',

      text:
        'Ele observa você por alguns segundos. Então responde: “Essa resposta será cobrada de você.” A porta se fecha. Pela primeira vez, você percebe que talvez a missão não esteja perguntando apenas se você consegue salvar o mundo. Talvez esteja perguntando quem você se tornará ao tentar fazê-lo.',

      onEnter: {
        prologueReady:
          true
      },

      next:
        'p17_transition'
    },

    p17_transition: {
      id:
        'p17_transition',

      speaker:
        'PROTOCOLO CRONOLÓGICO',

      role:
        'ENCERRAMENTO DO PRÓLOGO',

      type:
        'FINAL',

      location:
        'chrono_lab',

      text:
        'O registro do Prólogo é encerrado. Você ainda não entrou na máquina. Ainda não viu o passado. Ainda não encontrou Jesus. Mas agora possui uma missão, uma dúvida e um futuro que não pode mais ser ignorado.',

      choices: [
        {
          id:
            'enter_act1',

          text:
            'Encerrar o Prólogo e iniciar o Ato I.',

          effects: {
            hope:
              2
          },

          flags: {
            prologueClosed:
              true
          },

          next:
            null
        }
      ]
    }
  };

  /* =========================================================================
     PROLOGUE EXPLORATION SYSTEM
     ========================================================================= */

  class PrologueExploration {

    constructor(
      game,
      scenes
    ) {
      this.game =
        game;

      this.state =
        game.state;

      this.ui =
        game.ui;

      this.bus =
        game.bus;

      this.logger =
        game.logger;

      this.scenes =
        scenes;

      this.layer =
        null;

      this.initialized =
        false;

      this.active =
        false;

      this.locked =
        false;
    }

    init() {
      if (
        this.initialized
      ) {
        return;
      }

      this.initialized =
        true;

      ensurePrologueState(
        this.game
      );

      this.createInterface();

      this.bindEvents();

      this.logger.info(
        'Sistema de exploração do Prólogo preparado.'
      );
    }

    createInterface() {
      if (
        byId(
          'jcPrologueExploration'
        )
      ) {
        this.layer =
          byId(
            'jcPrologueExploration'
          );

        return;
      }

      const viewport =
        byId(
          'worldViewport'
        );

      if (!viewport) {
        return;
      }

      this.layer =
        create(
          'section',
          'jc-prologue-exploration'
        );

      this.layer.id =
        'jcPrologueExploration';

      this.layer.setAttribute(
        'aria-label',
        'Exploração do Prólogo'
      );

      const header =
        create(
          'div',
          'jc-prologue-exploration-header'
        );

      const title =
        create(
          'strong',
          '',
          'EXPLORAÇÃO // MEGACIDADE'
        );

      const status =
        create(
          'span',
          'jc-prologue-exploration-status',
          'OBSERVAÇÃO LIVRE'
        );

      header.append(
        title,
        status
      );

      const description =
        create(
          'p',
          'jc-prologue-exploration-description',
          'Escolha os pontos que deseja investigar. Algumas descobertas alteram sua percepção da missão.'
        );

      const grid =
        create(
          'div',
          'jc-prologue-poi-grid'
        );

      this.layer.append(
        header,
        description,
        grid
      );

      /*
       * Inserimos no viewport.
       */
      viewport.appendChild(
        this.layer
      );

      this.injectStyles();

      this.render();
    }

    injectStyles() {
      if (
        byId(
          'jcPrologueExplorationStyle'
        )
      ) {
        return;
      }

      const style =
        create(
          'style'
        );

      style.id =
        'jcPrologueExplorationStyle';

      style.textContent = `
        .jc-prologue-exploration {
          position: relative;
          z-index: 20;
          margin: 14px;
          padding: 14px;
          border: 1px solid rgba(139,200,255,.20);
          border-radius: 14px;
          background: rgba(5,9,16,.82);
          backdrop-filter: blur(14px);
          box-shadow: 0 18px 50px rgba(0,0,0,.30);
        }

        .jc-prologue-exploration-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .jc-prologue-exploration-header strong {
          font-size: .68rem;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .jc-prologue-exploration-status {
          font-size: .58rem;
          letter-spacing: .12em;
          color: #72f6dc;
        }

        .jc-prologue-exploration-description {
          margin: 0 0 12px;
          color: rgba(210,230,248,.72);
          font-size: .76rem;
          line-height: 1.5;
        }

        .jc-prologue-poi-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 8px;
        }

        .jc-prologue-poi {
          position: relative;
          min-height: 84px;
          padding: 11px;
          text-align: left;
          border: 1px solid rgba(139,200,255,.14);
          border-radius: 10px;
          color: inherit;
          background: rgba(11,20,34,.82);
          cursor: pointer;
          transition: transform .18s ease,
                      border-color .18s ease,
                      background .18s ease,
                      opacity .18s ease;
        }

        .jc-prologue-poi:hover {
          transform: translateY(-2px);
          border-color: rgba(139,200,255,.42);
          background: rgba(17,32,52,.94);
        }

        .jc-prologue-poi:focus-visible {
          outline: 2px solid #8bc8ff;
          outline-offset: 2px;
        }

        .jc-prologue-poi.visited {
          opacity: .58;
        }

        .jc-prologue-poi.locked {
          cursor: not-allowed;
          opacity: .35;
        }

        .jc-prologue-poi-code {
          display: block;
          margin-bottom: 4px;
          color: #8bc8ff;
          font-size: .56rem;
          letter-spacing: .12em;
        }

        .jc-prologue-poi strong {
          display: block;
          margin-bottom: 5px;
          font-size: .75rem;
        }

        .jc-prologue-poi small {
          display: block;
          color: rgba(210,230,248,.58);
          font-size: .66rem;
          line-height: 1.4;
        }

        @media (max-width: 680px) {
          .jc-prologue-poi-grid {
            grid-template-columns: 1fr;
          }
        }
      `;

      document.head.appendChild(
        style
      );
    }

    bindEvents() {
      this.layer?.addEventListener(
        'click',
        event => {
          const button =
            event.target instanceof
            Element
              ? event.target.closest(
                  '[data-prologue-poi]'
                )
              : null;

          if (!button) {
            return;
          }

          const id =
            button.dataset.prologuePoi;

          if (!id) {
            return;
          }

          this.inspect(
            id
          );
        }
      );
    }

    start() {
      this.init();

      this.active =
        true;

      this.state.set(
        'prologue.explorationUnlocked',
        true,
        'prologue.exploration.start'
      );

      this.render();

      this.ui.notify(
        'Exploração liberada',
        'Investigue a megacidade antes de retornar ao Complexo Cronos.',
        'info'
      );

      this.bus.emit(
        'prologue:explorationStarted'
      );
    }

    stop() {
      this.active =
        false;

      if (
        this.layer
      ) {
        this.layer.classList.remove(
          'active'
        );
      }
    }

    inspect(
      id
    ) {
      if (
        !this.active ||
        this.locked
      ) {
        return;
      }

      const poi =
        PROLOGUE_POIS[
          id
        ];

      if (!poi) {
        return;
      }

      const visited =
        this.state.get(
          'prologue.visitedPOIs'
        ) || [];

      const alreadyVisited =
        visited.includes(
          id
        );

      if (
        alreadyVisited
      ) {
        this.ui.notify(
          poi.title,
          'Você já registrou esta observação.',
          'info'
        );

        return;
      }

      this.locked =
        true;

      /*
       * Marca imediatamente.
       */
      this.state.set(
        'prologue.visitedPOIs',
        [
          ...visited,
          id
        ],
        'prologue.exploration.visit'
      );

      /*
       * Descoberta.
       */
      const discoveries =
        this.state.get(
          'prologue.discoveries'
        ) || [];

      if (
        poi.discovery &&
        !discoveries.includes(
          poi.discovery
        )
      ) {
        this.state.set(
          'prologue.discoveries',
          [
            ...discoveries,
            poi.discovery
          ],
          'prologue.discovery'
        );
      }

      /*
       * Consequências.
       */
      this.applyConsequence(
        poi
      );

      /*
       * Registra no Campaign Engine.
       */
      if (
        this.game.campaign
          ?.campaign
          ?.decisions
      ) {
        this.game.campaign.campaign.decisions.record({
          id:
            `explore_${id}`,

          scene:
            'p10_exploration',

          text:
            poi.title,

          metadata: {
            type:
              'exploration'
          }
        });
      }

      this.ui.notify(
        poi.title,
        poi.description,
        'info'
      );

      this.state.set(
        'prologue.cityObserved',
        true,
        'prologue.observation'
      );

      this.render();

      this.bus.emit(
        'prologue:poiInspected',
        {
          id,
          poi
        }
      );

      /*
       * Pequeno intervalo para permitir
       * que a interface mostre a descoberta.
       */
      setTimeout(
        () => {
          this.locked =
            false;

          this.checkComplete();
        },
        160
      );
    }

    applyConsequence(
      poi
    ) {
      const consequence =
        poi.consequence;

      if (!consequence) {
        return;
      }

      /*
       * Estatísticas.
       */
      if (
        consequence.stats
      ) {
        for (
          const [
            key,
            value
          ] of Object.entries(
            consequence.stats
          )
        ) {
          this.state.adjustStat(
            key,
            value,
            `prologue.poi.${poi.id}`
          );
        }
      }

      /*
       * Flags.
       */
      if (
        consequence.flags
      ) {
        for (
          const [
            key,
            value
          ] of Object.entries(
            consequence.flags
          )
        ) {
          this.state.set(
            `narrative.flags.${key}`,
            value,
            `prologue.poi.${poi.id}`
          );
        }
      }
    }

    checkComplete() {
      const visited =
        this.state.get(
          'prologue.visitedPOIs'
        ) || [];

      /*
       * Não obrigamos o jogador a fazer
       * todos os pontos.
       *
       * A exploração é considerada concluída
       * quando ele vê pelo menos três.
       */
      if (
        visited.length >=
        3
      ) {
        if (
          !this.state.get(
            'prologue.explorationComplete'
          )
        ) {
          this.state.set(
            'prologue.explorationComplete',
            true,
            'prologue.exploration.complete'
          );

          this.ui.notify(
            'Exploração concluída',
            'Você reuniu observações suficientes para retornar ao Complexo Cronos.',
            'success'
          );

          this.bus.emit(
            'prologue:explorationComplete'
          );
        }
      }

      this.render();
    }

    render() {
      if (!this.layer) {
        return;
      }

      const grid =
        this.layer.querySelector(
          '.jc-prologue-poi-grid'
        );

      const status =
        this.layer.querySelector(
          '.jc-prologue-exploration-status'
        );

      if (!grid) {
        return;
      }

      const visited =
        this.state.get(
          'prologue.visitedPOIs'
        ) || [];

      grid.replaceChildren();

      Object.values(
        PROLOGUE_POIS
      ).forEach(
        (
          poi,
          index
        ) => {
          const button =
            create(
              'button',
              'jc-prologue-poi'
            );

          button.type =
            'button';

          button.dataset.prologuePoi =
            poi.id;

          const already =
            visited.includes(
              poi.id
            );

          if (
            already
          ) {
            button.classList.add(
              'visited'
            );
          }

          const code =
            create(
              'span',
              'jc-prologue-poi-code',

              `POI-${String(
                index + 1
              ).padStart(
                2,
                '0'
              )}`
            );

          const title =
            create(
              'strong',
              '',
              poi.title
            );

          const short =
            create(
              'small',
              '',
              already
                ? 'Observação registrada.'
                : poi.short
            );

          button.append(
            code,
            title,
            short
          );

          grid.appendChild(
            button
          );
        }
      );

      if (status) {
        status.textContent =
          `${visited.length}/3 OBSERVAÇÕES`;
      }

      this.layer.classList.toggle(
        'active',
        this.active
      );
    }
  }

  /* =========================================================================
     PROLOGUE CONTROLLER
     ========================================================================= */

  class PrologueController {

    constructor(
      game
    ) {
      this.game =
        game;

      this.state =
        game.state;

      this.ui =
        game.ui;

      this.bus =
        game.bus;

      this.logger =
        game.logger;

      this.narrative =
        game.narrative;

      this.exploration =
        new PrologueExploration(
          game,
          PROLOGUE_SCENES
        );

      this.initialized =
        false;

      this.originalStartNewGame =
        null;

      this.originalContinueGame =
        null;

      this.originalGoto =
        null;

      this.originalSelectChoice =
        null;
    }

    init() {
      if (
        this.initialized
      ) {
        return;
      }

      this.initialized =
        true;

      ensurePrologueState(
        this.game
      );

      this.exploration.init();

      this.patchGameStart();

      this.patchNarrative();

      this.bindEvents();

      this.logger.info(
        'Prologue Controller conectado.'
      );
    }

    /* =======================================================================
       PATCH DE NOVO JOGO
       ======================================================================= */

    patchGameStart() {
      if (
        this.game.__prologueStartPatched
      ) {
        return;
      }

      this.game.__prologueStartPatched =
        true;

      this.originalStartNewGame =
        this.game.startNewGame.bind(
          this.game
        );

      this.game.startNewGame =
        () => {
          this.resetPrologueState();

          this.game.audio?.click();

          this.ui.transition(
            () => {
              this.ui.showScreen(
                'screenGame'
              );

              this.narrative.goto(
                'p00_operation'
              );
            }
          );

          this.logger.info(
            'Novo jogo iniciado diretamente no Prólogo.'
          );
        };
    }

    /* =======================================================================
       PATCH DO CARREGAMENTO
       ======================================================================= */

    patchContinue() {
      if (
        this.game.__prologueContinuePatched
      ) {
        return;
      }

      this.game.__prologueContinuePatched =
        true;

      this.originalContinueGame =
        this.game.continueGame.bind(
          this.game
        );

      this.game.continueGame =
        () => {
          const loaded =
            this.game.save.load();

          if (!loaded) {
            return false;
          }

          const current =
            this.state.get(
              'narrative.currentScene'
            );

          const prologueComplete =
            this.state.get(
              'prologue.completed'
            );

          if (
            !prologueComplete
          ) {
            this.ui.transition(
              () => {
                this.ui.showScreen(
                  'screenGame'
                );

                this.narrative.goto(
                  this.isPrologueScene(
                    current
                  )
                    ? current
                    : 'p00_operation'
                );
              }
            );

            return true;
          }

          this.resumeAfterPrologue(
            current
          );

          return true;
        };
    }

    /* =======================================================================
       PATCH NARRATIVE
       ======================================================================= */

    patchNarrative() {
      if (
        this.narrative.__prologuePatched
      ) {
        return;
      }

      this.narrative.__prologuePatched =
        true;

      this.originalGoto =
        this.narrative.goto.bind(
          this.narrative
        );

      this.originalSelectChoice =
        this.narrative.selectChoiceById.bind(
          this.narrative
        );

      /*
       * Novo goto.
       */
      this.narrative.goto =
        sceneId => {
          if (
            this.isPrologueScene(
              sceneId
            )
          ) {
            return this.gotoPrologueScene(
              sceneId
            );
          }

          return this.originalGoto(
            sceneId
          );
        };

      /*
       * Nova seleção de escolha.
       */
      this.narrative.selectChoiceById =
        choiceId => {
          if (
            this.isPrologueScene(
              this.narrative.current?.id ||
                this.state.get(
                  'narrative.currentScene'
                )
            )
          ) {
            return this.selectPrologueChoice(
              choiceId
            );
          }

          return this.originalSelectChoice(
            choiceId
          );
        };
    }

    /* =======================================================================
       DETECÇÃO DE CENA
       ======================================================================= */

    isPrologueScene(
      sceneId
    ) {
      return safe(
        sceneId
      ).startsWith(
        'p'
      ) &&
      /^p\d{2}_/.test(
        safe(sceneId)
      );
    }

    getCurrentScene() {
      const id =
        this.state.get(
          'narrative.currentScene'
        );

      return (
        PROLOGUE_SCENES[
          id
        ] ||
        null
      );
    }

    /* =======================================================================
       RESET
       ======================================================================= */

    resetPrologueState() {
      ensurePrologueState(
        this.game
      );

      this.state.set(
        'prologue',
        {
          active:
            true,

          completed:
            false,

          tutorialStep:
            0,

          explorationUnlocked:
            false,

          explorationComplete:
            false,

          objective:
            'Entender por que você foi escolhido.',

          visitedPOIs:
            [],

          discoveries:
            [],

          investigations:
            [],

          choices:
            [],

          briefingComplete:
            false,

          missionAccepted:
            false,

          missionQuestioned:
            false,

          missionRefused:
            false,

          civilianContact:
            false,

          cityObserved:
            false,

          cronosObserved:
            false,

          finalDecision:
            null,

          transitionReady:
            false
        },
        'prologue.reset'
      );

      /*
       * Algumas variáveis narrativas precisam
       * ser limpas para que um novo jogo nunca
       * herde escolhas antigas.
       */
      const flags =
        this.state.get(
          'narrative.flags'
        ) || {};

      const preserved =
        {};

      /*
       * Mantemos somente flags que pertençam
       * explicitamente a sistemas externos.
       */
      for (
        const [
          key,
          value
        ] of Object.entries(
          flags
        )
      ) {
        if (
          key.startsWith(
            'external_'
          )
        ) {
          preserved[key] =
            value;
        }
      }

      this.state.set(
        'narrative.flags',
        preserved,
        'prologue.flags.reset'
      );

      this.state.set(
        'narrative.choices',
        [],
        'prologue.choices.reset'
      );

      this.narrative.current =
        null;

      this.narrative.typing =
        false;

      this.narrative.choiceLocked =
        false;

      this.narrative.selectingChoice =
        false;

      this.exploration.active =
        false;

      this.exploration.locked =
        false;
    }

    /* =======================================================================
       CENA
       ======================================================================= */

    gotoPrologueScene(
      sceneId
    ) {
      const scene =
        PROLOGUE_SCENES[
          sceneId
        ];

      if (!scene) {
        this.logger.error(
          'Cena do Prólogo inexistente',
          sceneId
        );

        return false;
      }

      /*
       * Cancela digitação anterior.
       */
      clearTimeout(
        this.narrative.timer
      );

      this.narrative.typing =
        false;

      this.narrative.current =
        {
          ...scene,
          id:
            sceneId
        };

      /*
       * Nova transação.
       */
      this.narrative.choiceTransaction +=
        1;

      this.narrative.choiceLocked =
        false;

      this.narrative.selectingChoice =
        false;

      /*
       * Estado.
       */
      this.state.set(
        'narrative.currentScene',
        sceneId,
        'prologue.goto'
      );

      this.state.set(
        'phase',
        'game',
        'prologue.phase'
      );

      this.state.set(
        'world.location',
        scene.location ||
          'mega_city',

        'prologue.location'
      );

      this.state.set(
        'world.act',
        'PRÓLOGO',

        'prologue.act'
      );

      /*
       * Marca cena.
       */
      const seen =
        this.state.get(
          'narrative.seenScenes'
        ) || [];

      if (
        !seen.includes(
          sceneId
        )
      ) {
        this.state.set(
          'narrative.seenScenes',
          [
            ...seen,
            sceneId
          ],
          'prologue.scene.seen'
        );
      }

      /*
       * Efeitos de entrada.
       */
      this.applyOnEnter(
        scene.onEnter
      );

      /*
       * Interface.
       */
      this.renderSceneHeader(
        scene
      );

      this.renderChoices(
        scene
      );

      this.typeText(
        scene.text
      );

      /*
       * Tela.
       */
      this.ui.showScreen(
        'screenGame'
      );

      /*
       * Exploração.
       */
      if (
        sceneId ===
        'p10_exploration'
      ) {
        this.exploration.start();
      } else {
        this.exploration.stop();
      }

      /*
       * Atualização visual.
       */
      this.ui.render();

      this.game.visualLab?.refresh(
        true
      );

      this.bus.emit(
        'scene:changed',
        {
          id:
            sceneId,

          scene,

          previousId:
            null
        }
      );

      return true;
    }

    /* =======================================================================
       HEADER
       ======================================================================= */

    renderSceneHeader(
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

      if (
        speaker
      ) {
        speaker.textContent =
          scene.speaker;
      }

      if (
        role
      ) {
        role.textContent =
          scene.role;
      }

      if (
        type
      ) {
        type.textContent =
          scene.type;
      }

      const phase =
        byId(
          'phaseLabel'
        );

      if (
        phase
      ) {
        phase.textContent =
          `PRÓLOGO // ${scene.type}`;
      }

      const act =
        byId(
          'locationAct'
        );

      if (
        act
      ) {
        act.textContent =
          'PRÓLOGO';
      }

      const era =
        byId(
          'eraValue'
        );

      if (
        era
      ) {
        era.textContent =
          'FUTURO';
      }
    }

    /* =======================================================================
       ENTRADA
       ======================================================================= */

    applyOnEnter(
      data
    ) {
      if (!data) {
        return;
      }

      if (
        data.codex &&
        this.game.codex
      ) {
        this.game.codex.unlock(
          data.codex
        );
      }

      if (
        data.prologueFlag
      ) {
        this.state.set(
          `narrative.flags.${data.prologueFlag}`,
          true,
          'prologue.onEnter.flag'
        );
      }

      if (
        data.prologueExploration
      ) {
        this.state.set(
          'prologue.objective',
          'Observe o mundo antes de aceitar a missão.',
          'prologue.objective'
        );
      }

      if (
        data.prologueExplorationComplete
      ) {
        this.state.set(
          'prologue.objective',
          'Retorne ao Complexo Cronos e receba o briefing final.',
          'prologue.objective'
        );
      }

      if (
        data.missionBriefingComplete
      ) {
        this.state.set(
          'prologue.briefingComplete',
          true,
          'prologue.briefing'
        );
      }

      if (
        data.prologueReady
      ) {
        this.state.set(
          'prologue.transitionReady',
          true,
          'prologue.transition.ready'
        );
      }
    }

    /* =======================================================================
       TEXTO
       ======================================================================= */

    typeText(
      text
    ) {
      clearTimeout(
        this.narrative.timer
      );

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

      this.narrative.fullText =
        safe(
          text
        );

      this.narrative.charIndex =
        0;

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
        reduced
      ) {
        this.narrative.typing =
          false;

        output.textContent =
          this.narrative.fullText;

        cursor?.classList.remove(
          'active'
        );

        return;
      }

      this.narrative.typing =
        true;

      cursor?.classList.add(
        'active'
      );

      const speed =
        15;

      const tick =
        () => {
          if (
            !this.narrative.typing
          ) {
            return;
          }

          this.narrative.charIndex =
            Math.min(
              this.narrative.fullText.length,

              this.narrative.charIndex +
                1
            );

          output.textContent =
            this.narrative.fullText.slice(
              0,
              this.narrative.charIndex
            );

          if (
            this.narrative.charIndex >=
            this.narrative.fullText.length
          ) {
            this.narrative.typing =
              false;

            cursor?.classList.remove(
              'active'
            );

            return;
          }

          this.narrative.timer =
            setTimeout(
              tick,
              speed
            );
        };

      tick();

      this.state.increment(
        'statistics.dialogues',
        1,
        'prologue.dialogue'
      );
    }

    /* =======================================================================
       ESCOLHAS
       ======================================================================= */

    getAvailableChoices(
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

      return scene.choices;
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
          'choiceContainer não encontrado.'
        );

        return;
      }

      container.replaceChildren();

      const choices =
        this.getAvailableChoices(
          scene
        );

      container.dataset.sceneId =
        scene.id;

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
            create(
              'button',
              'choice-button'
            );

          button.type =
            'button';

          button.dataset.choiceId =
            safe(
              choice.id
            );

          button.dataset.choiceIndex =
            String(
              index
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
            create(
              'span',
              '',
              String(
                index + 1
              ).padStart(
                2,
                '0'
              )
            );

          number.setAttribute(
            'aria-hidden',
            'true'
          );

          const label =
            create(
              'strong',
              '',
              choice.text
            );

          button.append(
            number,
            label
          );

          container.appendChild(
            button
          );
        }
      );
    }

    /* =======================================================================
       EXECUÇÃO DA ESCOLHA
       ======================================================================= */

    selectPrologueChoice(
      choiceId
    ) {
      if (
        this.narrative.choiceLocked
      ) {
        return false;
      }

      const scene =
        this.getCurrentScene();

      if (!scene) {
        return false;
      }

      const choice =
        scene.choices?.find(
          item =>
            String(
              item.id
            ) ===
            String(
              choiceId
            )
        );

      if (!choice) {
        this.logger.warn(
          'Escolha inexistente no Prólogo',
          choiceId
        );

        return false;
      }

      this.narrative.choiceLocked =
        true;

      this.narrative.selectingChoice =
        true;

      /*
       * Desabilita todos.
       */
      const container =
        byId(
          'choiceContainer'
        );

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
            String(
              choice.id
            )
          ) {
            button.classList.add(
              'choice-selected'
            );
          }
        }
      );

      try {
        /*
         * Texto instantâneo antes da escolha.
         */
        if (
          this.narrative.typing
        ) {
          this.skipTyping();
        }

        this.game.audio?.choice();

        /*
         * APLICA EFEITOS.
         */
        this.applyChoiceEffects(
          choice
        );

        /*
         * REGISTRA ESCOLHA.
         */
        this.recordChoice(
          choice
        );

        /*
         * TRATAMENTO ESPECIAL.
         */
        this.handleSpecialChoice(
          choice
        );

        /*
         * DESTINO.
         */
        if (
          choice.next
        ) {
          setTimeout(
            () => {
              this.narrative.choiceLocked =
                false;

              this.narrative.selectingChoice =
                false;

              this.narrative.goto(
                choice.next
              );
            },
            100
          );

          return true;
        }

        /*
         * FIM DO PRÓLOGO.
         */
        this.finishPrologue();

        return true;
      } catch (
        error
      ) {
        this.logger.error(
          'Falha na escolha do Prólogo',
          error
        );

        this.narrative.choiceLocked =
          false;

        this.narrative.selectingChoice =
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

        this.ui.notify(
          'Erro na decisão',
          'A escolha não pôde ser processada.',
          'error'
        );

        return false;
      }
    }

    /* =======================================================================
       EFEITOS
       ======================================================================= */

    applyChoiceEffects(
      choice
    ) {
      const effects =
        choice.effects ||
        {};

      for (
        const [
          key,
          value
        ]
          of Object.entries(
            effects
          )
      ) {
        this.state.adjustStat(
          key,
          Number(
            value
          ) || 0,
          `prologue.choice.${choice.id}`
        );
      }

      const flags =
        choice.flags ||
        {};

      for (
        const [
          key,
          value
        ]
          of Object.entries(
            flags
          )
      ) {
        this.state.set(
          `narrative.flags.${key}`,
          value,
          `prologue.choice.${choice.id}`
        );
      }
    }

    /* =======================================================================
       HISTÓRICO
       ======================================================================= */

    recordChoice(
      choice
    ) {
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
        `prologue.choice.${choice.id}`
      );

      const prologueChoices =
        this.state.get(
          'prologue.choices'
        ) || [];

      this.state.set(
        'prologue.choices',
        [
          ...prologueChoices,
          choice.id
        ],
        `prologue.choice.history.${choice.id}`
      );

      this.state.increment(
        'statistics.choices',
        1,
        `prologue.choice.${choice.id}`
      );

      /*
       * Campaign Engine.
       */
      this.game.campaign?.campaign?.decisions?.record?.({
        id:
          `prologue_${choice.id}`,

        scene:
          this.getCurrentScene()?.id,

        text:
          choice.text,

        metadata: {
          type:
            'narrative',

          act:
            PROLOGUE_ID
        }
      });

      this.bus.emit(
        'choice:selected',
        {
          id:
            choice.id,

          scene:
            this.getCurrentScene()?.id,

          source:
            'prologue'
        }
      );
    }

    /* =======================================================================
       ESCOLHAS ESPECIAIS
       ======================================================================= */

    handleSpecialChoice(
      choice
    ) {
      switch (
        choice.id
      ) {

        case 'ask_reason':

          this.ui.notify(
            'Registro incompleto',
            'A organização não respondeu. O silêncio parece deliberado.',
            'warning'
          );

          break;

        case 'refuse_extraction':

          this.ui.notify(
            'Extração mantida',
            'A operação tinha autorização superior. Sua recusa não alterou o resultado.',
            'info'
          );

          break;

        case 'reject_mission':

          this.state.set(
            'prologue.missionRefused',
            true,
            'prologue.mission.refused'
          );

          break;

        case 'question_mission':

          this.state.set(
            'prologue.missionQuestioned',
            true,
            'prologue.mission.questioned'
          );

          break;

        case 'accept_mission':

          this.state.set(
            'prologue.missionAccepted',
            true,
            'prologue.mission.accepted'
          );

          break;

        case 'yes_save_world':

          this.state.set(
            'prologue.finalDecision',
            'yes_save_world',
            'prologue.final.question'
          );

          break;

        case 'yes_but':

          this.state.set(
            'prologue.finalDecision',
            'yes_but',
            'prologue.final.question'
          );

          break;

        case 'not_sure':

          this.state.set(
            'prologue.finalDecision',
            'not_sure',
            'prologue.final.question'
          );

          break;

        default:
          break;
      }
    }

    /* =======================================================================
       DIGITAÇÃO
       ======================================================================= */

    skipTyping() {
      if (
        !this.narrative.typing
      ) {
        return;
      }

      clearTimeout(
        this.narrative.timer
      );

      this.narrative.typing =
        false;

      const output =
        byId(
          'dialogueText'
        );

      if (
        output
      ) {
        output.textContent =
          this.narrative.fullText;
      }

      byId(
        'typingCursor'
      )?.classList.remove(
        'active'
      );
    }

    /* =======================================================================
       TRANSIÇÃO PARA ATO I
       ======================================================================= */

    finishPrologue() {
      const current =
        this.getCurrentScene();

      if (
        current?.id !==
        'p17_transition'
      ) {
        return;
      }

      /*
       * Prólogo concluído.
       */
      this.state.set(
        'prologue.completed',
        true,
        'prologue.complete'
      );

      this.state.set(
        'prologue.active',
        false,
        'prologue.complete'
      );

      this.state.set(
        'prologue.transitionReady',
        true,
        'prologue.complete'
      );

      this.state.set(
        'campaign.currentAct',
        ACT_I_ID,
        'prologue.toAct1'
      );

      this.state.set(
        'campaign.acts.act1.status',
        'active',
        'prologue.toAct1'
      );

      this.state.set(
        'world.act',
        'ATO I',
        'prologue.toAct1'
      );

      this.state.set(
        'narrative.act',
        1,
        'prologue.toAct1'
      );

      this.game.ui.notify(
        'PRÓLOGO CONCLUÍDO',
        'O Ato I — O Mundo Destruído foi desbloqueado.',
        'success'
      );

      this.bus.emit(
        'campaign:actChanged',
        {
          from:
            PROLOGUE_ID,

          to:
            ACT_I_ID,

          source:
            'prologue'
        }
      );

      this.createAct1Transition();
    }

    createAct1Transition() {
      let overlay =
        byId(
          'jcPrologueActTransition'
        );

      if (!overlay) {
        overlay =
          create(
            'div',
            'jc-prologue-act-transition'
          );

        overlay.id =
          'jcPrologueActTransition';

        overlay.innerHTML =
          `
            <div class="jc-prologue-act-transition-inner">
              <span class="jc-prologue-act-kicker">
                ARQUIVO CRONOLÓGICO // PRÓLOGO ENCERRADO
              </span>

              <h2>
                ATO I
              </h2>

              <strong>
                O MUNDO DESTRUÍDO
              </strong>

              <p>
                Você ainda não sabe se veio salvar o mundo
                ou apenas encontrar alguém que o salve por você.
              </p>

              <button
                type="button"
                id="jcEnterAct1"
              >
                CONTINUAR
              </button>
            </div>
          `;

        document.body.appendChild(
          overlay
        );

        const style =
          create(
            'style'
          );

        style.id =
          'jcPrologueActTransitionStyle';

        style.textContent =
          `
            .jc-prologue-act-transition {
              position: fixed;
              inset: 0;
              z-index: 999;
              display: grid;
              place-items: center;
              padding: 24px;
              background:
                radial-gradient(
                  circle at 50% 35%,
                  rgba(76,158,255,.10),
                  transparent 34%
                ),
                rgba(2,4,9,.96);
              backdrop-filter: blur(20px);
              opacity: 0;
              pointer-events: none;
              transition: opacity .45s ease;
            }

            .jc-prologue-act-transition.active {
              opacity: 1;
              pointer-events: auto;
            }

            .jc-prologue-act-transition-inner {
              width: min(720px, 92vw);
              padding: 42px;
              text-align: center;
              border: 1px solid rgba(139,200,255,.18);
              border-radius: 22px;
              background: rgba(7,12,21,.88);
              box-shadow:
                0 30px 100px rgba(0,0,0,.48),
                inset 0 0 60px rgba(139,200,255,.03);
            }

            .jc-prologue-act-kicker {
              color: #8bc8ff;
              font-size: .65rem;
              font-weight: 800;
              letter-spacing: .22em;
            }

            .jc-prologue-act-transition h2 {
              margin: 16px 0 2px;
              font-size: clamp(4rem,12vw,8rem);
              line-height: .85;
              letter-spacing: -.06em;
              color: #eef7ff;
            }

            .jc-prologue-act-transition strong {
              display: block;
              color: #72f6dc;
              font-size: .84rem;
              letter-spacing: .18em;
            }

            .jc-prologue-act-transition p {
              max-width: 560px;
              margin: 24px auto 28px;
              color: #92a6bb;
              font-size: .92rem;
              line-height: 1.7;
            }

            .jc-prologue-act-transition button {
              min-width: 190px;
              padding: 13px 22px;
              border: 1px solid rgba(139,200,255,.34);
              border-radius: 10px;
              color: #eef7ff;
              background: rgba(139,200,255,.10);
              cursor: pointer;
              font-weight: 800;
              letter-spacing: .12em;
              transition:
                transform .18s ease,
                background .18s ease,
                border-color .18s ease;
            }

            .jc-prologue-act-transition button:hover {
              transform: translateY(-2px);
              background: rgba(139,200,255,.18);
              border-color: rgba(139,200,255,.55);
            }

            @media (max-width: 600px) {
              .jc-prologue-act-transition-inner {
                padding: 28px 20px;
              }
            }
          `;

        document.head.appendChild(
          style
        );

        byId(
          'jcEnterAct1'
        )?.addEventListener(
          'click',
          () => {
            this.enterAct1();
          }
        );
      }

      requestAnimationFrame(
        () => {
          overlay.classList.add(
            'active'
          );
        }
      );
    }

    enterAct1() {
      const overlay =
        byId(
          'jcPrologueActTransition'
        );

      overlay?.classList.remove(
        'active'
      );

      /*
       * O Ato I ainda é FUTURO.

       * Não usamos a máquina.
       * Não viajamos ao passado.
       * Apenas transferimos o controle
       * narrativo para o próximo módulo.
       */

      this.state.set(
        'phase',
        'game',
        'act1.enter'
      );

      this.state.set(
        'world.act',
        'ATO I',
        'act1.enter'
      );

      this.state.set(
        'world.era',
        'FUTURO',
        'act1.enter'
      );

      this.state.set(
        'world.location',
        'mega_city',
        'act1.enter'
      );

      /*
       * O próximo módulo narrativo deverá
       * fornecer sua cena inicial.
       *
       * Enquanto ele não existe,
       * apresentamos um ponto de handoff
       * seguro em vez de enviar o jogador
       * ao passado.
       */

      this.game.ui.notify(
        'ATO I DESBLOQUEADO',
        'A próxima camada narrativa agora assume o controle da campanha.',
        'success'
      );

      this.state.set(
        'campaign.nextModule',
        'act1',
        'act1.handoff'
      );

      this.state.set(
        'narrative.currentScene',
        'act1_entry',
        'act1.handoff'
      );

      this.bus.emit(
        'campaign:moduleReady',
        {
          module:
            'act1',

          from:
            'prologue'
        }
      );

      this.renderAct1Placeholder();
    }

    renderAct1Placeholder() {
      /*
       * Não inventa uma sequência do Ato I que ainda
       * não foi implementada.
       *
       * O mundo continua no futuro.
       */

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

      const text =
        byId(
          'dialogueText'
        );

      const choices =
        byId(
          'choiceContainer'
        );

      if (speaker) {
        speaker.textContent =
          'PROTOCOLO CRONOLÓGICO';
      }

      if (role) {
        role.textContent =
          'ATO I';
      }

      if (type) {
        type.textContent =
          'TRANSIÇÃO';
      }

      if (text) {
        text.textContent =
          'O registro do Ato I foi desbloqueado. A campanha agora entra na etapa de investigação do mundo destruído.';
      }

      choices?.replaceChildren();

      this.game.visualLab?.refresh(
        true
      );
    }

    /* =======================================================================
       RESUMO / SAVE
       ======================================================================= */

    resumeAfterPrologue(
      current
    ) {
      this.game.ui.showScreen(
        'screenGame'
      );

      if (
        this.isPrologueScene(
          current
        )
      ) {
        this.narrative.goto(
          current
        );

        return;
      }

      if (
        this.state.get(
          'prologue.completed'
        )
      ) {
        this.renderAct1Placeholder();

        return;
      }

      this.narrative.goto(
        'p00_operation'
      );
    }

    bindEvents() {
      this.patchContinue();

      this.bus.on(
        'prologue:explorationComplete',
        () => {
          this.state.set(
            'prologue.objective',
            'Retorne ao Complexo Cronos.',
            'prologue.objective.return'
          );
        }
      );

      this.bus.on(
        'prologue:poiInspected',
        payload => {
          if (
            payload?.id ===
            'civilian_zone'
          ) {
            this.state.set(
              'prologue.civilianContact',
              true,
              'prologue.civilian'
            );
          }

          if (
            payload?.id ===
            'cronos_gate'
          ) {
            this.state.set(
              'prologue.cronosObserved',
              true,
              'prologue.cronos'
            );
          }
        }
      );

      /*
       * Autosave quando houver mudança relevante
       * no Prólogo.
       */
      this.bus.on(
        'choice:selected',
        payload => {
          if (
            payload?.source ===
            'prologue'
          ) {
            this.game.save?.schedule();
          }
        }
      );
    }
  }

  /* =========================================================================
     INICIALIZAÇÃO
     ========================================================================= */

  waitForGame(
    game => {
      if (
        game.prologueController
      ) {
        return;
      }

      const controller =
        new PrologueController(
          game
        );

      controller.init();

      game.prologueController =
        controller;

      /*
       * API pública.
       */
      window.JC =
        window.JC ||
        {};

      window.JC.prologue =
        controller;

      window.JC.prologueScenes =
        PROLOGUE_SCENES;

      window.JC.prologuePOIs =
        PROLOGUE_POIS;

      /*
       * Diagnóstico.
       */
      console.group(
        '[JC PROLOGUE]'
      );

      console.info(
        'Prólogo:',
        true
      );

      console.info(
        'Cenas:',
        Object.keys(
          PROLOGUE_SCENES
        ).length
      );

      console.info(
        'Pontos de exploração:',
        Object.keys(
          PROLOGUE_POIS
        ).length
      );

      console.info(
        'Separação para Ato I:',
        ACT_I_ID
      );

      console.groupEnd();

      /*
       * NOVO JOGO:
       *
       * O botão original foi substituído pelo
       * Prologue Controller.
       *
       * Atualiza também o estado inicial caso
       * a página tenha acabado de carregar.
       */
      if (
        game.state.get(
          'phase'
        ) ===
        'title'
      ) {
        ensurePrologueState(
          game
        );
      }
    }
  );

})();
