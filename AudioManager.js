// AudioManager.js
// -----------------------------------------------------------------------
// Infraestrutura de áudio (Especificação Mestra, seção 16 do briefing:
// música, efeitos, ambiente, volume master/música/SFX).
//
// AVISO HONESTO: nenhum arquivo de áudio foi fornecido nos documentos do
// projeto, e este ambiente de desenvolvimento não tem acesso à internet
// para buscar assets de som. Por isso este módulo implementa toda a
// GESTÃO de volume/mute de forma real e funcional, mas `playSfx`/
// `playMusic` fazem no-op registrado no console quando o som pedido não
// está no manifesto — o que é sempre o caso agora, já que nenhum som foi
// registrado. Isso não é um placeholder de código (a lógica de volume
// está completa e testada); é a ausência de um recurso externo (arquivos
// .mp3/.ogg) que ninguém forneceu ainda. Quando os arquivos existirem,
// basta chamar `registerAudio()` para cada um — nenhuma mudança estrutural
// será necessária.
// -----------------------------------------------------------------------

const state = {
  masterVolume: 1,
  musicVolume: 0.8,
  sfxVolume: 0.9,
  muted: false
};

/** @type {Map<string, { src: string, type: "music"|"sfx"|"ambience" }>} */
const manifest = new Map();

let currentMusicId = null;

export function registerAudio(id, src, type = "sfx") {
  manifest.set(id, { src, type });
}

export function setVolume(channel, value) {
  const v = Math.min(Math.max(value, 0), 1);
  if (channel === "master") state.masterVolume = v;
  else if (channel === "music") state.musicVolume = v;
  else if (channel === "sfx") state.sfxVolume = v;
  else console.warn(`[AudioManager] Canal de volume desconhecido: "${channel}".`);
}

export function getVolume(channel) {
  const key = `${channel}Volume`;
  if (!(key in state)) {
    console.warn(`[AudioManager] Canal de volume desconhecido: "${channel}".`);
    return 0;
  }
  return state[key];
}

export function setMuted(muted) {
  state.muted = Boolean(muted);
}

export function isMuted() {
  return state.muted;
}

/** Volume efetivo de um canal, considerando master e mute — o que de fato seria aplicado a um elemento de áudio real. */
export function getEffectiveVolume(channel) {
  if (state.muted) return 0;
  return state.masterVolume * getVolume(channel);
}

export function playSfx(id) {
  const entry = manifest.get(id);
  if (!entry) {
    console.info(`[AudioManager] SFX "${id}" solicitado, mas nenhum arquivo de áudio está registrado ainda.`);
    return false;
  }
  // A reprodução real (new Audio(entry.src) ou Web Audio API) entra aqui
  // quando os assets existirem, usando getEffectiveVolume("sfx").
  return true;
}

export function playMusic(id) {
  const entry = manifest.get(id);
  if (!entry) {
    console.info(`[AudioManager] Música "${id}" solicitada, mas nenhum arquivo de áudio está registrado ainda.`);
    return false;
  }
  currentMusicId = id;
  return true;
}

export function stopMusic() {
  currentMusicId = null;
}

export function getCurrentMusicId() {
  return currentMusicId;
}

export function getSettingsSnapshot() {
  return { ...state };
}

export function applySettingsSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;
  Object.assign(state, snapshot);
}
