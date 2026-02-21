function drawPixel(g, x, y, size, color) {
  g.fillStyle(color, 1);
  g.fillRect(x * size, y * size, size, size);
}

function makeTexture(scene, key, matrix, palette, scale = 2) {
  const h = matrix.length;
  const w = matrix[0].length;
  const g = scene.add.graphics();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cell = matrix[y][x];
      if (cell === ".") continue;
      drawPixel(g, x, y, scale, palette[cell]);
    }
  }
  g.generateTexture(key, w * scale, h * scale);
  g.destroy();
}

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create() {
    makeTexture(this, "tree", [
      "...gggg...",
      "..gggggg..",
      ".gggggggg.",
      ".gggggggg.",
      "..gggggg..",
      "...gggg...",
      "....tt....",
      "....tt....",
      "....tt....",
      "....tt...."
    ], { g: 0x2d6a4f, t: 0x7f5539 }, 3);

    makeTexture(this, "stump", [
      "..tttt..",
      ".tttttt.",
      ".tttttt.",
      "..tttt.."
    ], { t: 0x7f5539 }, 3);

    makeTexture(this, "crop_turnip", [
      "...g...",
      "..ggg..",
      "...g...",
      "..yyy..",
      ".yyyyy.",
      "..yyy.."
    ], { g: 0x2a9d8f, y: 0xe9c46a }, 2);

    makeTexture(this, "crop_blueberry", [
      "...g...",
      "..ggg..",
      "..bbb..",
      ".bbbbb.",
      "..bbb..",
      "...b..."
    ], { g: 0x2a9d8f, b: 0x5e60ce }, 2);

    makeTexture(this, "ship", [
      "....cc....",
      "...cccc...",
      "..cceecc..",
      ".ccceeecc.",
      "..cceecc..",
      "...cccc..."
    ], { c: 0xa8dadc, e: 0x457b9d }, 2);

    this.scene.start("CityHubScene");
    this.scene.launch("UIScene");
  }
}
