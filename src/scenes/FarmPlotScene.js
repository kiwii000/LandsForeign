import { CROPS } from "../data/gameData.js";
import { GameState, getOrCreateFarmTile } from "../systems/gameState.js";
import { addItem, getSelectedItem, removeItem } from "../systems/inventory.js";
import { generateRobotTexture } from "../systems/robotSprites.js";

const TILE = 32;

export class FarmPlotScene extends Phaser.Scene {
  constructor() {
    super("FarmPlotScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x2d6a4f);
    this.add.text(16, 12, "Starter Farm Plot", { fontSize: "22px", color: "#ffffff" });
    this.add.text(16, 38, "1-9/0/-/= hotbar | E action | Q seed | M mount | T city | TAB inventory", { color: "#e9f5db", fontSize: "14px" });

    generateRobotTexture(this, "robot_player_dynamic", GameState.player.robot, { scale: 2 });
    this.player = this.physics.add.sprite(GameState.player.x, GameState.player.y, "robot_player_dynamic");
    this.player.body.setSize(16, 20).setCollideWorldBounds(true);

    this.mount = this.add.sprite(0, 0, "ship").setVisible(false);
    this.teleportPad = this.add.rectangle(100, 480, 48, 48, 0x9d4edd).setStrokeStyle(2, 0xffffff);

    this.soilLayer = this.add.layer();
    this.cropLayer = this.add.layer();

    this.targetOutline = this.add.rectangle(0, 0, TILE - 2, TILE - 2).setStrokeStyle(2, 0xfff3b0).setFillStyle(0xffffff, 0);

    this.treeSprites = new Map();
    for (const tree of GameState.trees) {
      const s = this.add.sprite(tree.x, tree.y, tree.hp > 0 ? "tree" : "stump");
      this.treeSprites.set(tree.id, s);
    }

    this.keys = this.input.keyboard.addKeys("W,A,S,D,E,Q,J,M,T,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,ZERO,MINUS,EQUALS");
  }

  getFacingOffset() {
    const facing = GameState.player.facing;
    if (facing === "left") return { x: -1, y: 0 };
    if (facing === "right") return { x: 1, y: 0 };
    if (facing === "up") return { x: 0, y: -1 };
    return { x: 0, y: 1 };
  }

  getTargetTile() {
    const px = Math.floor(this.player.x / TILE);
    const py = Math.floor(this.player.y / TILE);
    const off = this.getFacingOffset();
    const tx = px + off.x;
    const ty = py + off.y;
    return { tx, ty, tile: getOrCreateFarmTile(tx, ty) };
  }

  useSelectedAction() {
    const selected = getSelectedItem(GameState.inventory);
    const { tile } = this.getTargetTile();

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

    if (selected === "axe") {
      this.chopNearbyTree();
      return;
    }

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
    const near = GameState.trees.find((t) => t.hp > 0 && Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y) < 64);
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
        this.soilLayer.add(this.add.rectangle(x, y, TILE - 2, TILE - 2, color).setStrokeStyle(1, 0x5a3e2b));
      }

      if (tile.cropId) {
        const key = tile.cropId === "turnip" ? "crop_turnip" : "crop_blueberry";
        const plant = this.add.sprite(x, y + 2, key);
        const scale = tile.mature ? 1.25 : 0.75 + tile.growthDays * 0.15;
        plant.setScale(scale);
        this.cropLayer.add(plant);
      }
    }
  }

  update() {
    GameState.player.mapId = "farm";
    const body = this.player.body;
    const speed = GameState.player.baseSpeed * (GameState.player.mounted ? 1.7 : 1);
    body.setVelocity(0, 0);

    if (this.keys.A.isDown) {
      body.setVelocityX(-speed);
      GameState.player.facing = "left";
    }
    if (this.keys.D.isDown) {
      body.setVelocityX(speed);
      GameState.player.facing = "right";
    }
    if (this.keys.W.isDown) {
      body.setVelocityY(-speed);
      GameState.player.facing = "up";
    }
    if (this.keys.S.isDown) {
      body.setVelocityY(speed);
      GameState.player.facing = "down";
    }

    GameState.player.x = this.player.x;
    GameState.player.y = this.player.y;

    const hotbarKeys = [
      this.keys.ONE, this.keys.TWO, this.keys.THREE, this.keys.FOUR, this.keys.FIVE, this.keys.SIX,
      this.keys.SEVEN, this.keys.EIGHT, this.keys.NINE, this.keys.ZERO, this.keys.MINUS, this.keys.EQUALS
    ];
    hotbarKeys.forEach((k, i) => {
      if (Phaser.Input.Keyboard.JustDown(k)) GameState.inventory.hotbarIndex = i;
    });

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
    this.mount.setPosition(this.player.x, this.player.y + 14);

    for (const tree of GameState.trees) {
      const sprite = this.treeSprites.get(tree.id);
      sprite.setTexture(tree.hp > 0 ? "tree" : "stump");
    }

    const target = this.getTargetTile();
    this.targetOutline.setPosition(target.tx * TILE + TILE / 2, target.ty * TILE + TILE / 2);

    if (Phaser.Input.Keyboard.JustDown(this.keys.T) && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.teleportPad.x, this.teleportPad.y) < 58) {
      GameState.player.mounted = false;
      GameState.player.x = 120;
      GameState.player.y = 430;
      this.scene.start("CityHubScene");
      return;
    }

    this.drawFarmTiles();
  }
}
