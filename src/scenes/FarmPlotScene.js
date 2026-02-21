import { CROPS } from "../data/gameData.js";
import { GameState, getOrCreateFarmTile } from "../systems/gameState.js";
import { addItem, getSelectedItem, removeItem } from "../systems/inventory.js";

const TILE = 32;

export class FarmPlotScene extends Phaser.Scene {
  constructor() {
    super("FarmPlotScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x2d6a4f);
    this.add.text(16, 12, "Starter Farm Plot", { fontSize: "22px", color: "#ffffff" });
    this.add.text(16, 38, "1/2/3 tools | Q seed select | E use tool/plant/harvest | J chop tree | M mount | T city", { color: "#e9f5db", fontSize: "14px" });

    this.player = this.physics.add.existing(this.add.rectangle(GameState.player.x, GameState.player.y, 18, 18, 0x7bdff2));
    this.player.body.setCollideWorldBounds(true);

    this.mount = this.add.ellipse(0, 0, 30, 14, 0xa8dadc).setVisible(false);

    this.teleportPad = this.add.rectangle(100, 480, 48, 48, 0x9d4edd).setStrokeStyle(2, 0xffffff);

    this.soilLayer = this.add.layer();
    this.cropLayer = this.add.layer();

    this.treeSprites = new Map();
    for (const tree of GameState.trees) {
      const s = this.add.rectangle(tree.x, tree.y, 24, 30, tree.hp > 0 ? 0x386641 : 0x6c757d);
      this.treeSprites.set(tree.id, s);
    }

    this.keys = this.input.keyboard.addKeys("W,A,S,D,E,Q,J,M,T,ONE,TWO,THREE");
  }

  getTileUnderPlayer() {
    const tx = Math.floor(this.player.x / TILE);
    const ty = Math.floor(this.player.y / TILE);
    return { tx, ty, tile: getOrCreateFarmTile(tx, ty) };
  }

  useSelectedAction() {
    const selected = getSelectedItem(GameState.inventory);
    const { tile } = this.getTileUnderPlayer();

    if (selected === "hoe") {
      tile.soil = "tilled";
      this.scene.get("UIScene").events.emit("toast", "Soil tilled");
      return;
    }

    if (selected === "watering_can") {
      if (tile.cropId) {
        tile.wateredToday = true;
        this.scene.get("UIScene").events.emit("toast", "Crop watered");
      }
      return;
    }

    if (selected === "axe") return;

    if (tile.soil === "tilled" && !tile.cropId) {
      const seedItemId = `${GameState.selectedSeed}_seed`;
      if (removeItem(GameState.inventory, seedItemId, 1)) {
        tile.cropId = GameState.selectedSeed;
        tile.growthDays = 0;
        tile.mature = false;
        this.scene.get("UIScene").events.emit("toast", `Planted ${GameState.selectedSeed}`);
      } else {
        this.scene.get("UIScene").events.emit("toast", `No ${seedItemId}`);
      }
      return;
    }

    if (tile.cropId && tile.mature) {
      addItem(GameState.inventory, CROPS[tile.cropId].harvestItemId, 1);
      tile.cropId = null;
      tile.growthDays = 0;
      tile.mature = false;
      this.scene.get("UIScene").events.emit("toast", "Harvested crop");
    }
  }

  chopNearbyTree() {
    const near = GameState.trees.find((t) => t.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y) < 54);
    if (!near) return;
    near.hp -= 1;
    if (near.hp <= 0) {
      addItem(GameState.inventory, "wood", 3);
      this.scene.get("UIScene").events.emit("toast", "Tree chopped: +3 wood");
    }
  }

  drawFarmTiles() {
    this.soilLayer.removeAll(true);
    this.cropLayer.removeAll(true);
    for (const tile of Object.values(GameState.farmTiles)) {
      const x = tile.tx * TILE + TILE / 2;
      const y = tile.ty * TILE + TILE / 2;
      if (tile.soil === "tilled") {
        const color = tile.wateredToday ? 0x6d597a : 0x9c6644;
        this.soilLayer.add(this.add.rectangle(x, y, TILE - 2, TILE - 2, color));
      }
      if (tile.cropId) {
        const cropColor = CROPS[tile.cropId].color;
        const h = tile.mature ? 18 : 10 + tile.growthDays * 2;
        this.cropLayer.add(this.add.rectangle(x, y, 10, h, cropColor));
      }
    }
  }

  update() {
    GameState.player.mapId = "farm";
    const body = this.player.body;
    const speed = GameState.player.baseSpeed * (GameState.player.mounted ? 1.7 : 1);
    body.setVelocity(0, 0);
    if (this.keys.A.isDown) body.setVelocityX(-speed);
    if (this.keys.D.isDown) body.setVelocityX(speed);
    if (this.keys.W.isDown) body.setVelocityY(-speed);
    if (this.keys.S.isDown) body.setVelocityY(speed);

    GameState.player.x = this.player.x;
    GameState.player.y = this.player.y;

    if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) GameState.inventory.hotbarIndex = 0;
    if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) GameState.inventory.hotbarIndex = 1;
    if (Phaser.Input.Keyboard.JustDown(this.keys.THREE)) GameState.inventory.hotbarIndex = 2;

    if (Phaser.Input.Keyboard.JustDown(this.keys.Q)) {
      GameState.selectedSeed = GameState.selectedSeed === "turnip" ? "blueberry" : "turnip";
      this.scene.get("UIScene").events.emit("toast", `Selected ${GameState.selectedSeed} seed`);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.useSelectedAction();
    if (Phaser.Input.Keyboard.JustDown(this.keys.J)) this.chopNearbyTree();

    if (Phaser.Input.Keyboard.JustDown(this.keys.M)) {
      GameState.player.mounted = !GameState.player.mounted;
      this.scene.get("UIScene").events.emit("toast", GameState.player.mounted ? "Mounted spaceship" : "Dismounted spaceship");
    }

    this.mount.setVisible(GameState.player.mounted);
    this.mount.setPosition(this.player.x, this.player.y + 11);

    for (const tree of GameState.trees) {
      this.treeSprites.get(tree.id).setFillStyle(tree.hp > 0 ? 0x386641 : 0x6c757d);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.T) && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.teleportPad.x, this.teleportPad.y) < 52) {
      GameState.player.mounted = false;
      GameState.player.x = 120;
      GameState.player.y = 430;
      this.scene.start("CityHubScene");
      return;
    }

    this.drawFarmTiles();
  }
}
