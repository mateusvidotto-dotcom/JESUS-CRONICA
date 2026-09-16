// Game.js
// ============================================================================
// Ponto de entrada. Não contém regras de jogo próprias — só conecta os
// sistemas já construídos (Engine, World, Player, Dialogue, Missions, Codex,
// SceneTransition, SaveSystem, UI) e define QUAL conteúdo é carregado nesta
// versão do protótipo.
//
// Ordem de boot (importa para dependências):
//   1. seeds de conteúdo (canon, codex, missões, localizações, diálogos)
//   2. configurações salvas (áudio)
//   3. criação do jogador e da engine
//   4. inscrição em eventos (troca de localização, save/load)
//   5. carregamento da localização inicial
//   6. start() do game loop
// ============================================================================

import { createEngine } from "./Engine.js";
import {
  initInput,
  consumeCodexTogglePress,
  consumePausePress,
  consumeDebugTogglePress
} from "./Input.js";
import { updateCamera } from "./Camera.js";
import { createPlayer, updatePlayer, checkInteraction } from "./Player.js";
import {
  loadLocation,
  getCurrentLocation,
  getObstaclesInCurrentLocation,
  getLocationDefinition,
  checkExitTrigger
} from "./World.js";
import {
  clearCanvas,
  renderLocationBackground,
  renderObstacles,
  renderExits,
  renderInteractables,
  renderPlayer,
  renderFadeOverlay,
  renderPauseDim
} from "./Renderer.js";
import {
  initUI,
  updateHud,
  setInteractPromptVisible,
  renderDialogue,
  handleContinueKey,
  toggleCodexPanel,
  setPauseVisible,
  setDebugVisible,
  updateDebugOverlay
} from "./UI.js";
import { startDialogue, isDialogueActive, defineDialogue } from "./Dialogue.js";
import {
  createTransitionController,
  startTransition,
  updateTransition,
  isTransitioning
} from "./SceneTransition.js";
import { gameState } from "./GameState.js";
import { eventBus, EVENTS } from "./EventBus.js";
import { loadSettings } from "./Settings.js";

import { seedCanon } from "./data/canon-seed.js";
import { seedCodex } from "./data/codex-seed.js";
import { seedMissions } from "./data/missions-seed.js";
import { seedLocations } from "./data/locations-seed.js";
import { prologueDialogue } from "./data/dialogues.js";

// --- Conteúdo desta versão -------------------------------------------------
seedCanon();
seedCodex();
seedMissions();
seedLocations();
defineDialogue(prologueDialogue);

loadSettings(); // aplica volume/mute salvos de uma sessão anterior, se houver

// --- Estado local de execução (não faz parte do gameState salvo, exceto pela
// cópia sincronizada em gameState.protagonist.position — ver GameState.js) --
const player = createPlayer(560, 420); // spawn inicial dentro de "zona_resgate"
let nearbyEntity = null;
let paused = false;
let debugVisible = false;
let fadeAlpha = 0;
const transitionController = createTransitionController();

// --- Update / Render ---------------------------------------------------------

function update(dt) {
  // Debug é sempre alternável, mesmo em diálogo/pausa.
  if (consumeDebugTogglePress()) {
    debugVisible = !debugVisible;
    setDebugVisible(debugVisible);
  }
  if (debugVisible) {
    updateDebugOverlay(engine.getDebugStats());
  }

  if (isDialogueActive()) {
    setInteractPromptVisible(false);
    return; // diálogo tem seu próprio fluxo (clique / Espaço), tratado em UI.js
  }

  if (consumePausePress()) {
    paused = !paused;
    setPauseVisible(paused);
  }
  if (paused) return;

  if (isTransitioning(transitionController)) {
    updateTransition(transitionController, dt, (alpha) => {
      fadeAlpha = alpha;
    });
    return; // gameplay congelado durante a transição de localização
  }

  // --- Gameplay normal --------------------------------------------------
  const obstacles = getObstaclesInCurrentLocation();
  updatePlayer(player, dt, obstacles);

  // Mantém gameState.protagonist.position sincronizado a cada frame, para
  // que saveGame() (chamado a qualquer momento pela UI) sempre capture a
  // posição atual sem precisar de um hook especial de "antes de salvar".
  gameState.protagonist.position = {
    x: player.x,
    y: player.y,
    locationId: gameState.world.currentLocationId
  };

  const location = getCurrentLocation();
  updateCamera(engine.camera, player, location.bounds);

  const exit = checkExitTrigger(player);
  if (exit && !isTransitioning(transitionController)) {
    startTransition(transitionController, () => {
      loadLocation(exit.targetLocationId, { spawn: exit.targetSpawn });
    });
  }

  const result = checkInteraction(player);
  nearbyEntity = result.entity;
  setInteractPromptVisible(Boolean(nearbyEntity));

  if (nearbyEntity && result.pressed) {
    if (nearbyEntity.dialogueId) {
      startDialogue(nearbyEntity.dialogueId);
      renderDialogue();
    } else {
      console.warn(`[Game] "${nearbyEntity.id}" não tem dialogueId associado — nada para interagir.`);
    }
  }

  if (consumeCodexTogglePress()) {
    toggleCodexPanel();
  }

  updateHud();
}

function render(ctx, camera) {
  clearCanvas(ctx, camera);

  const location = getCurrentLocation();
  if (location) {
    renderLocationBackground(ctx, camera, location);
    renderExits(ctx, camera, location.exits);
    renderObstacles(ctx, camera, location.obstacles);
    renderInteractables(ctx, camera, location.interactables, nearbyEntity ? nearbyEntity.id : null);
    renderPlayer(ctx, camera, player);
  }

  renderFadeOverlay(ctx, camera, fadeAlpha);
  if (paused) renderPauseDim(ctx, camera);
}

// --- Boot --------------------------------------------------------------------

const canvas = document.getElementById("game-canvas");
const viewport = document.getElementById("game-viewport");

const engine = createEngine({
  canvas,
  viewportElement: viewport,
  onUpdate: update,
  onRender: render
});

initInput(window);
initUI();
window.addEventListener("keydown", (e) => handleContinueKey(e.code));

// Reposiciona o jogador quando World.loadLocation() é chamado com um spawn
// explícito (saídas entre localizações). O carregamento inicial abaixo não
// passa `spawn`, então não interfere com a posição inicial definida acima.
eventBus.on(EVENTS.LOCATION_CHANGED, ({ spawn }) => {
  if (spawn) {
    player.x = spawn.x;
    player.y = spawn.y;
  }
});

// Ao carregar um save (gatilho: botão "Carregar Progresso" no painel de
// Configurações, via UI.js chamando SaveSystem.loadGame()), reposiciona o
// jogador na localização e coordenadas salvas. UI.js não conhece Player.js
// nem World.js diretamente — a reação mora aqui, o único lugar que já
// conhece `player` e o restante do runtime (ver nota de arquitetura no topo
// de UI.js).
eventBus.on(EVENTS.LOAD_COMPLETED, () => {
  const savedLocationId = gameState.world.currentLocationId;
  if (savedLocationId && getLocationDefinition(savedLocationId)) {
    loadLocation(savedLocationId);
  } else if (savedLocationId) {
    console.warn(`[Game] Save referencia localização "${savedLocationId}", que não está mais definida.`);
  }

  const pos = gameState.protagonist.position;
  if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
    player.x = pos.x;
    player.y = pos.y;
  }

  updateHud();
});

loadLocation("zona_resgate");
updateHud();

engine.start();

// Exposto apenas para depuração manual via console do navegador — nada no
// jogo em si depende desta variável global.
window.__jesusChronicles = { gameState, engine, player };
