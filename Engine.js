// Engine.js
// -----------------------------------------------------------------------
// Game loop com delta time. Controla timing, canvas e devicePixelRatio —
// não conhece regras de jogo (Engine != Gameplay). O movimento de
// qualquer entidade no restante do código usa `velocidade * dt`, nunca
// "por frame", para não depender da taxa de atualização do dispositivo.
//
// Inclui rastreamento de FPS/tempo de frame (média móvel simples) para
// alimentar o overlay de depuração — a Especificação Mestra pede
// "PROFILING CONCEITUAL" (FPS, tempo de update/render) antes de qualquer
// otimização real, e isso é o mínimo necessário para medir algo de
// verdade em vez de "parece mais lento".
// -----------------------------------------------------------------------

import { createCamera } from "./Camera.js";

const FRAME_TIME_SAMPLE_SIZE = 60;

export function createEngine({ canvas, viewportElement, onUpdate, onRender }) {
  const ctx = canvas.getContext("2d");
  let lastTime = null;
  let running = false;
  let rafHandle = null;

  const camera = createCamera();
  const frameTimes = [];

  function resize() {
    const rect = viewportElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    camera.viewportWidth = Math.max(1, Math.round(rect.width));
    camera.viewportHeight = Math.max(1, Math.round(rect.height));

    canvas.width = Math.round(camera.viewportWidth * dpr);
    canvas.height = Math.round(camera.viewportHeight * dpr);
    canvas.style.width = `${camera.viewportWidth}px`;
    canvas.style.height = `${camera.viewportHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function recordFrameTime(ms) {
    frameTimes.push(ms);
    if (frameTimes.length > FRAME_TIME_SAMPLE_SIZE) frameTimes.shift();
  }

  function frame(timestamp) {
    if (!running) return;

    if (lastTime === null) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    const frameMs = timestamp - lastTime;
    lastTime = timestamp;

    // Evita "spiral of death" se a aba ficar em segundo plano e voltar
    // (dt gigante faria entidades atravessarem paredes/pularem no mundo).
    dt = Math.min(dt, 0.05);

    recordFrameTime(frameMs);

    onUpdate(dt);
    onRender(ctx, camera);

    rafHandle = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = null;
    rafHandle = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafHandle) cancelAnimationFrame(rafHandle);
  }

  function getDebugStats() {
    if (frameTimes.length === 0) return { fps: 0, avgFrameMs: 0 };
    const avgFrameMs = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    return { fps: avgFrameMs > 0 ? Math.round(1000 / avgFrameMs) : 0, avgFrameMs: Math.round(avgFrameMs * 100) / 100 };
  }

  window.addEventListener("resize", resize);
  resize();

  return { start, stop, resize, camera, ctx, getDebugStats };
}
