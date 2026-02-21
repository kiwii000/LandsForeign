import { GameState, randomRobot } from "../systems/gameState.js";
import { ITEMS } from "../data/gameData.js";
import { addItem } from "../systems/inventory.js";
import { generateRobotTexture, paletteColor } from "../systems/robotSprites.js";

export class CityHubScene extends Phaser.Scene {
  constructor() {
    super("CityHubScene");
  }

  createRobotTextures() {
    generateRobotTexture(this, "robot_player_dynamic", GameState.player.robot, { scale: 2 });
    for (const npc of GameState.npcs) {
      generateRobotTexture(this, `robot_npc_${npc.id}`, npc.robot, { scale: 2 });
    }
  }

  create() {
    this.createRobotTextures();

    this.cameras.main.setBackgroundColor(0x23395b);
    this.add.text(16, 12, "Main City Hub", { fontSize: "22px", color: "#ffffff" });
    this.add.text(16, 38, "WASD move | E interact/shop | T teleport | R regenerate robot sprite", { color: "#d7e3fc" });

    this.player = this.physics.add.sprite(GameState.player.x, GameState.player.y, "robot_player_dynamic");
    this.player.body.setSize(16, 20).setCollideWorldBounds(true);

    this.shopZone = this.add.rectangle(770, 270, 140, 90, 0x264653).setStrokeStyle(2, 0xffffff);
    this.add.text(728, 238, "Robot Shop", { color: "#ffffff" });
    this.teleportPad = this.add.rectangle(100, 450, 48, 48, 0x9d4edd).setStrokeStyle(2, 0xffffff);
    this.add.text(70, 478, "TP", { color: "#ffffff" });

    this.npcSprites = new Map();
    for (const npc of GameState.npcs) {
      const s = this.add.sprite(npc.x, npc.y, `robot_npc_${npc.id}`);
      s.setTint(paletteColor(npc.robot.palette));
      this.npcSprites.set(npc.id, s);
    }

    this.keys = this.input.keyboard.addKeys("W,A,S,D,E,T,R");
  }

  update(_, dt) {
    GameState.player.mapId = "city";
    const speed = GameState.player.baseSpeed;
    const body = this.player.body;
    body.setVelocity(0, 0);
    if (this.keys.A.isDown) body.setVelocityX(-speed);
    if (this.keys.D.isDown) body.setVelocityX(speed);
    if (this.keys.W.isDown) body.setVelocityY(-speed);
    if (this.keys.S.isDown) body.setVelocityY(speed);

    GameState.player.x = this.player.x;
    GameState.player.y = this.player.y;

    this.updateNPCSchedules(dt / 1000);

    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
      GameState.player.robot = randomRobot();
      generateRobotTexture(this, "robot_player_dynamic", GameState.player.robot, { scale: 2 });
      this.player.setTexture("robot_player_dynamic");
      this.scene.get("UIScene").events.emit("toast", `Generated new robot (${GameState.player.robot.head}/${GameState.player.robot.palette})`);
    }

    const nearPad = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.teleportPad.x, this.teleportPad.y) < 58;
    if (nearPad && Phaser.Input.Keyboard.JustDown(this.keys.T)) {
      GameState.player.x = 100;
      GameState.player.y = 480;
      this.scene.start("FarmPlotScene");
      return;
    }

    const shopkeeper = this.npcSprites.get("shopkeeper");
    const nearShop = Phaser.Math.Distance.Between(this.player.x, this.player.y, shopkeeper.x, shopkeeper.y) < 42;
    if (nearShop && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      const minute = GameState.time.minute;
      const open = minute >= 540 && minute <= 1020;
      if (!open) {
        this.scene.get("UIScene").events.emit("toast", "Shop closed (09:00-17:00)");
      } else {
        this.openQuickShop();
      }
    }
  }

  openQuickShop() {
    if (GameState.currency >= ITEMS.turnip_seed.buyPrice) {
      addItem(GameState.inventory, "turnip_seed", 1);
      GameState.currency -= ITEMS.turnip_seed.buyPrice;
      this.scene.get("UIScene").events.emit("toast", "Bought 1 Turnip Seed");
    } else {
      this.scene.get("UIScene").events.emit("toast", "Not enough credits");
    }
  }

  updateNPCSchedules() {
    const minute = GameState.time.minute;
    for (const npc of GameState.npcs) {
      const entry = npc.schedule.find((s) => minute >= s.start && minute <= s.end) ?? npc.schedule[0];
      npc.behavior = entry.behavior;
      npc.x = Phaser.Math.Linear(npc.x, entry.pos.x, 0.03);
      npc.y = Phaser.Math.Linear(npc.y, entry.pos.y, 0.03);
      const sprite = this.npcSprites.get(npc.id);
      sprite.setPosition(npc.x, npc.y);
    }
  }
}
