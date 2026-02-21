import { ITEMS } from "../data/gameData.js";
import { advanceDay, GameState, loadGame, saveGame } from "../systems/gameState.js";
import { countItem, getSelectedItem, removeItem } from "../systems/inventory.js";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
    this.toast = "";
    this.toastTimer = 0;
  }

  create() {
    this.dayText = this.add.text(12, 510, "", { color: "#ffffff", fontSize: "14px" }).setScrollFactor(0);
    this.infoText = this.add.text(300, 510, "", { color: "#d9ed92", fontSize: "14px" }).setScrollFactor(0);
    this.toastText = this.add.text(12, 486, "", { color: "#ffd166", fontSize: "14px" }).setScrollFactor(0);

    this.keys = this.input.keyboard.addKeys("N,FIVE,NINE,X");
    this.events.on("toast", (msg) => {
      this.toast = msg;
      this.toastTimer = 180;
    });
  }

  update() {
    GameState.time.minute += 0.12;
    if (GameState.time.minute >= 1440) advanceDay();

    const hour = Math.floor(GameState.time.minute / 60)
      .toString()
      .padStart(2, "0");
    const minute = Math.floor(GameState.time.minute % 60)
      .toString()
      .padStart(2, "0");

    const selected = getSelectedItem(GameState.inventory) ?? "none";
    this.dayText.setText(`Day ${GameState.time.day} (${GameState.time.weekday}) ${hour}:${minute} | Credits: ${GameState.currency}`);
    this.infoText.setText(`Map: ${GameState.player.mapId} | Tool: ${selected} | Seed: ${GameState.selectedSeed} | TurnipSeed:${countItem(GameState.inventory, "turnip_seed")} BlueSeed:${countItem(GameState.inventory, "blueberry_seed")}`);

    if (this.toastTimer > 0) {
      this.toastTimer -= 1;
      this.toastText.setText(this.toast);
    } else {
      this.toastText.setText("N: next day | F5 save | F9 load | X sell all crops/materials");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.N)) {
      advanceDay();
      this.events.emit("toast", "Advanced to next day");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.FIVE)) {
      saveGame();
      this.events.emit("toast", "Saved game");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.NINE)) {
      if (loadGame()) this.events.emit("toast", "Loaded save");
      else this.events.emit("toast", "No save found");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.X)) {
      this.sellAll("turnip");
      this.sellAll("blueberry");
      this.sellAll("wood");
      this.events.emit("toast", "Sold all crops/materials");
    }
  }

  sellAll(itemId) {
    const total = countItem(GameState.inventory, itemId);
    if (!total) return;
    removeItem(GameState.inventory, itemId, total);
    GameState.currency += ITEMS[itemId].sellPrice * total;
  }
}
