import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { PreloadScene } from "./scenes/PreloadScene.js";
import { CityHubScene } from "./scenes/CityHubScene.js";
import { FarmPlotScene } from "./scenes/FarmPlotScene.js";
import { UIScene } from "./scenes/UIScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: "app",
  pixelArt: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [BootScene, PreloadScene, CityHubScene, FarmPlotScene, UIScene]
});
