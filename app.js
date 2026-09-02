/* ==========================================================================
   SISTEMA DE ESCOLHAS — INTERAÇÃO ROBUSTA
   ========================================================================== */

renderChoices(scene) {
  const box = byId('choiceContainer');

  if (!box) {
    this.logger.warn(
      'choiceContainer não encontrado no DOM'
    );
    return;
  }

  /*
   * Limpa somente as escolhas antigas.
   * O container continua existindo, então a delegação de eventos
   * permanece funcional mesmo após novos renders.
   */
  box.replaceChildren();

  const sceneId =
    this.state.get(
      'narrative.currentScene'
    ) ||
    '';

  box.dataset.sceneId =
    sceneId;

  const choices =
    this.availableChoices(
      scene
    );

  box.setAttribute(
    'aria-label',
    choices.length
      ? 'Escolhas disponíveis'
      : 'Nenhuma escolha disponível'
  );

  if (!choices.length) {
    this._choiceLocked = false;
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
        String(
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

      button.setAttribute(
        'aria-disabled',
        'false'
      );

      button.innerHTML =
        `<span aria-hidden="true">${
          String(
            index + 1
          ).padStart(
            2,
            '0'
          )
        }</span>` +
        `<strong>${
          this.ui.escape(
            choice.text
          )
        }</strong>`;

      /*
       * PRIMEIRA CAMADA:
       * listener direto no botão.
       *
       * Isso garante que a escolha funcione mesmo que outro
       * sistema modifique a propagação do evento.
       */
      button.addEventListener(
        'click',
        (
          event
        ) => {
          event.preventDefault();
          event.stopPropagation();

          if (
            button.disabled
          ) {
            return;
          }

          this.selectChoiceById(
            choice.id
          );
        }
      );

      box.appendChild(
        button
      );
    }
  );

  /*
   * A escolha começa liberada sempre que uma nova cena
   * é renderizada.
   */
  this._choiceLocked =
    false;
}


/* ==========================================================================
   LOCALIZAÇÃO DE ESCOLHA
   ========================================================================== */

selectChoiceById(
  choiceId
) {
  if (
    !choiceId ||
    this._choiceLocked
  ) {
    return false;
  }

  /*
   * Confirma que a escolha pertence à cena atualmente ativa.
   * Isso impede que um clique atrasado execute uma escolha
   * pertencente à cena anterior.
   */
  const stateSceneId =
    this.state.get(
      'narrative.currentScene'
    );

  const currentSceneId =
    this.current?.id ||
    stateSceneId;

  if (
    stateSceneId &&
    currentSceneId &&
    stateSceneId !==
      currentSceneId
  ) {
    this.logger.warn(
      'Escolha rejeitada: cena visual e estado divergentes',
      `${stateSceneId} != ${currentSceneId}`
    );

    return false;
  }

  /*
   * Busca a escolha diretamente no conjunto de escolhas
   * disponíveis da cena atual.
   */
  const choices =
    this.availableChoices(
      this.current
    );

  const choice =
    choices.find(
      (
        item
      ) =>
        String(
          item.id
        ) ===
        String(
          choiceId
        )
    );

  if (!choice) {
    this.logger.warn(
      'Escolha inválida ou indisponível',
      choiceId
    );

    return false;
  }

  /*
   * Bloqueia imediatamente todos os botões para evitar
   * duplo clique ou duas decisões simultâneas.
   */
  this._choiceLocked =
    true;

  const box =
    byId(
      'choiceContainer'
    );

  box?.querySelectorAll(
    '.choice-button'
  ).forEach(
    (
      button
    ) => {
      button.disabled =
        true;

      button.setAttribute(
        'aria-disabled',
        'true'
      );

      button.classList.toggle(
        'choice-selected',
        button.dataset.choiceId ===
          String(
            choice.id
          )
      );
    }
  );

  try {
    return this.selectChoice(
      choice
    );
  } catch (
    error
  ) {
    /*
     * Se qualquer parte da decisão gerar exceção,
     * os botões são restaurados para o usuário poder
     * tentar novamente.
     */
    this._choiceLocked =
      false;

    box?.querySelectorAll(
      '.choice-button'
    ).forEach(
      (
        button
      ) => {
        button.disabled =
          false;

        button.setAttribute(
          'aria-disabled',
          'false'
        );
      }
    );

    this.logger.error(
      `Falha ao executar escolha ${choice.id}`,
      error
    );

    this.ui.notify(
      'Falha na escolha',
      'A decisão não pôde ser aplicada. Tente novamente.',
      'error'
    );

    return false;
  }
}


/* ==========================================================================
   EXECUÇÃO DA ESCOLHA
   ========================================================================== */

selectChoice(
  choice
) {
  if (
    !choice ||
    this.state.get(
      'phase'
    ) !== 'game'
  ) {
    return false;
  }

  /*
   * Caso o texto ainda esteja sendo digitado,
   * o texto é concluído antes da decisão.
   */
  if (
    this.typing
  ) {
    this.skipTyping();
  }

  this.audio.choice();

  /*
   * ============================================================
   * EFEITOS DE ATRIBUTOS
   * ============================================================
   */

  const effects =
    choice.effects ||
    {};

  for (
    const [
      key,
      value
    ] of Object.entries(
      effects
    )
  ) {
    this.state.adjustStat(
      key,
      value,
      `choice.${choice.id}`
    );
  }

  /*
   * ============================================================
   * FLAGS NARRATIVAS
   * ============================================================
   */

  for (
    const [
      key,
      value
    ] of Object.entries(
      choice.flags ||
        {}
    )
  ) {
    this.state.set(
      `narrative.flags.${key}`,
      value,
      `choice.${choice.id}`
    );
  }

  /*
   * ============================================================
   * CÓDEX
   * ============================================================
   */

  if (
    choice.codex
  ) {
    this.codex.unlock(
      choice.codex
    );
  }

  /*
   * ============================================================
   * PROGRESSO DE MISSÃO
   * ============================================================
   */

  if (
    choice.missionProgress
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
      amount
    );
  }

  /*
   * ============================================================
   * REGISTRO DA ESCOLHA
   * ============================================================
   */

  const taken =
    this.state.get(
      'narrative.choices'
    ) ||
    [];

  this.state.set(
    'narrative.choices',
    [
      ...taken,
      choice.id
    ],
    `choice.${choice.id}`
  );

  /*
   * ============================================================
   * ESTATÍSTICAS
   * ============================================================
   */

  this.state.increment(
    'statistics.choices',
    1,
    `choice.${choice.id}`
  );

  /*
   * ============================================================
   * EVENTO
   * ============================================================
   */

  this.bus.emit(
    'choice:selected',
    {
      id:
        choice.id
    }
  );

  /*
   * ============================================================
   * PRÓXIMA CENA
   * ============================================================
   */

  const destination =
    choice.next ||
    this.current?.next;

  if (
    !destination ||
    !SCENES[
      destination
    ]
  ) {
    this.logger.error(
      `Destino narrativo inválido para ${choice.id}`,
      destination
    );

    this.ui.notify(
      'Erro narrativo',
      'A próxima cena não foi encontrada. A escolha não foi perdida.',
      'error'
    );

    this._choiceLocked =
      false;

    return false;
  }

  /*
   * Vai para a próxima cena.
   *
   * IMPORTANTE:
   * não desbloqueamos manualmente aqui.
   * A nova cena será renderizada e
   * renderChoices() liberará novamente
   * os novos botões.
   */
  this.goto(
    destination
  );

  return true;
}


/* ==========================================================================
   CONDIÇÕES DAS ESCOLHAS
   ========================================================================== */

availableChoices(
  scene
) {
  return (
    scene?.choices ||
    []
  ).filter(
    (
      choice
    ) =>
      this.checkConditions(
        choice.conditions
      ) &&
      !(
        choice.once &&
        (
          this.state.get(
            'narrative.choices'
          ) ||
          []
        ).includes(
          choice.id
        )
      )
  );
}


/* ==========================================================================
   VALIDAÇÃO DE CONDIÇÕES
   ========================================================================== */

checkConditions(
  condition
) {
  if (
    !condition
  ) {
    return true;
  }

  if (
    condition.flag
  ) {
    const flagValue =
      this.state.get(
        `narrative.flags.${condition.flag}`
      );

    if (
      !flagValue
    ) {
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
      ) ||
      0;

    if (
      hope <
      condition.minHope
    ) {
      return false;
    }
  }

  return true;
}
