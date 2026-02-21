const ROBOT_PALETTES = {
  teal: { metal: 0x93d5d8, trim: 0x3a86a8, visor: 0x48cae4, dark: 0x2f3e46 },
  orange: { metal: 0xf6bd60, trim: 0xe07a5f, visor: 0xf4a261, dark: 0x5f0f40 },
  violet: { metal: 0xcdb4db, trim: 0x9d4edd, visor: 0x7b2cbf, dark: 0x240046 },
  mint: { metal: 0xb7e4c7, trim: 0x52b788, visor: 0x95d5b2, dark: 0x1b4332 },
  red: { metal: 0xf28482, trim: 0xe5383b, visor: 0xff758f, dark: 0x4a1c25 }
};

function px(g, x, y, scale, color) {
  g.fillStyle(color, 1);
  g.fillRect(x * scale, y * scale, scale, scale);
}

function rect(g, x1, y1, x2, y2, scale, color) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) px(g, x, y, scale, color);
  }
}

export function generateRobotTexture(scene, key, robotSpec, options = {}) {
  const scale = options.scale ?? 2;
  const w = 12;
  const h = 14;
  const p = ROBOT_PALETTES[robotSpec.palette] ?? ROBOT_PALETTES.teal;

  const g = scene.add.graphics();

  const headShapes = {
    round: [2, 0, 9, 4],
    square: [2, 0, 9, 4],
    visor: [1, 0, 10, 4]
  };
  const [hx1, hy1, hx2, hy2] = headShapes[robotSpec.head] ?? headShapes.round;
  rect(g, hx1, hy1, hx2, hy2, scale, p.metal);

  // head contour variants
  if (robotSpec.head === "round") {
    px(g, hx1, hy1, scale, p.trim);
    px(g, hx2, hy1, scale, p.trim);
    px(g, hx1, hy2, scale, p.trim);
    px(g, hx2, hy2, scale, p.trim);
  } else if (robotSpec.head === "visor") {
    rect(g, 2, 2, 9, 2, scale, p.visor);
  } else {
    rect(g, hx1, hy1, hx2, hy1, scale, p.trim);
  }

  // face panel
  rect(g, 3, 1, 8, 3, scale, p.dark);
  if (robotSpec.face === "dot") {
    px(g, 4, 2, scale, p.visor);
    px(g, 7, 2, scale, p.visor);
  } else if (robotSpec.face === "bar") {
    rect(g, 4, 2, 7, 2, scale, p.visor);
  } else {
    px(g, 4, 2, scale, p.visor);
    px(g, 7, 2, scale, p.visor);
    rect(g, 5, 3, 6, 3, scale, p.visor);
  }

  // torso variants
  const torsoShapes = {
    light: [3, 5, 8, 9],
    medium: [2, 5, 9, 9],
    heavy: [2, 5, 9, 10]
  };
  const [tx1, ty1, tx2, ty2] = torsoShapes[robotSpec.torso] ?? torsoShapes.medium;
  rect(g, tx1, ty1, tx2, ty2, scale, p.trim);
  rect(g, tx1 + 1, ty1 + 1, tx2 - 1, ty2 - 1, scale, p.metal);

  // chest panel
  rect(g, 5, 6, 6, 7, scale, p.dark);

  // arms variants
  if (robotSpec.arms === "basic") {
    rect(g, tx1 - 1, 6, tx1 - 1, 9, scale, p.metal);
    rect(g, tx2 + 1, 6, tx2 + 1, 9, scale, p.metal);
  } else if (robotSpec.arms === "clamp") {
    rect(g, tx1 - 1, 6, tx1 - 1, 9, scale, p.metal);
    rect(g, tx2 + 1, 6, tx2 + 1, 9, scale, p.metal);
    px(g, tx1 - 2, 9, scale, p.dark);
    px(g, tx2 + 2, 9, scale, p.dark);
  } else {
    rect(g, tx1 - 1, 6, tx1 - 1, 8, scale, p.trim);
    rect(g, tx2 + 1, 6, tx2 + 1, 8, scale, p.trim);
    px(g, tx1 - 1, 9, scale, p.metal);
    px(g, tx2 + 1, 9, scale, p.metal);
  }

  // legs variants
  if (robotSpec.legs === "walker") {
    rect(g, 4, ty2 + 1, 5, 13, scale, p.dark);
    rect(g, 6, ty2 + 1, 7, 13, scale, p.dark);
  } else if (robotSpec.legs === "piston") {
    rect(g, 4, ty2 + 1, 5, 13, scale, p.trim);
    rect(g, 6, ty2 + 1, 7, 13, scale, p.trim);
    rect(g, 4, ty2 + 2, 7, ty2 + 2, scale, p.dark);
  } else {
    rect(g, 4, ty2 + 1, 7, 11, scale, p.dark);
    rect(g, 3, 12, 8, 12, scale, p.visor);
  }

  if (scene.textures.exists(key)) scene.textures.remove(key);
  g.generateTexture(key, w * scale, h * scale);
  g.destroy();
}

export function paletteColor(name) {
  return (ROBOT_PALETTES[name] ?? ROBOT_PALETTES.teal).trim;
}
