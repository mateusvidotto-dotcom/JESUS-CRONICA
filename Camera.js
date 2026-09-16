// Camera.js
// -----------------------------------------------------------------------
// Separa WORLD SPACE de SCREEN SPACE. A câmera segue o alvo (o jogador),
// com os limites travados nas bordas da localização atual, e centraliza
// automaticamente quando a localização é menor que o viewport (em vez de
// colar no canto, o que pareceria um bug de câmera).
// -----------------------------------------------------------------------

import { clamp } from "./Physics.js";

export function createCamera() {
  return { x: 0, y: 0, viewportWidth: 960, viewportHeight: 600 };
}

/**
 * Atualiza a posição da câmera para centralizar `target` (qualquer
 * entidade com x, y, width, height), respeitando os limites de
 * `locationBounds` ({ width, height }).
 */
export function updateCamera(camera, target, locationBounds) {
  const desiredX = target.x + target.width / 2 - camera.viewportWidth / 2;
  const desiredY = target.y + target.height / 2 - camera.viewportHeight / 2;

  const maxX = Math.max(0, locationBounds.width - camera.viewportWidth);
  const maxY = Math.max(0, locationBounds.height - camera.viewportHeight);

  camera.x = clamp(desiredX, 0, maxX);
  camera.y = clamp(desiredY, 0, maxY);

  // Se a localização for menor que o viewport em algum eixo, centraliza
  // nesse eixo em vez de deixar a câmera colada em (0,0).
  if (locationBounds.width < camera.viewportWidth) {
    camera.x = -(camera.viewportWidth - locationBounds.width) / 2;
  }
  if (locationBounds.height < camera.viewportHeight) {
    camera.y = -(camera.viewportHeight - locationBounds.height) / 2;
  }
}

export function worldToScreen(camera, worldX, worldY) {
  return { x: worldX - camera.x, y: worldY - camera.y };
}

export function screenToWorld(camera, screenX, screenY) {
  return { x: screenX + camera.x, y: screenY + camera.y };
}
