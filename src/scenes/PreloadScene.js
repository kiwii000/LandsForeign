export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  create() {
    this.scene.start("CityHubScene");
    this.scene.launch("UIScene");
  }
}
