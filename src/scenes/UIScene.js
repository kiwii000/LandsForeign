import { ITEMS } from "../data/gameData.js";
import { advanceDay, GameState, loadGame, saveGame } from "../systems/gameState.js";
import { countItem, getSelectedItem, removeItem } from "../systems/inventory.js";

function itemLabel(itemId) {
  if (!itemId) return "";
  const map = {
    hoe: "Hoe",
    watering_can: "Can",
    axe: "Axe",
    turnip_seed: "T.Seed",
    blueberry_seed: "B.Seed",
    turnip: "Turnip",
    blueberry: "Berry",
    wood: "Wood"
  };
  return map[itemId] ?? itemId;
}

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
    this.toast = "";
    this.toastTimer = 0;
    this.inventoryOpen = false;
  }

  create() {
    this.dayText = this.add.text(12, 10, "", { color: "#ffffff", fontSize: "14px" }).setScrollFactor(0).setDepth(300);
    this.infoText = this.add.text(12, 30, "", { color: "#d9ed92", fontSize: "14px" }).setScrollFactor(0).setDepth(300);
    this.toastText = this.add.text(12, 50, "", { color: "#ffd166", fontSize: "14px" }).setScrollFactor(0).setDepth(300);

    this.keys = this.input.keyboard.addKeys("N,F5,F9,X,TAB");

    this.hotbarLayer = this.add.layer().setDepth(250);
    this.inventoryLayer = this.add.layer().setDepth(260);

    this.events.on("toast", (msg) => {
      this.toast = msg;
      this.toastTimer = 180;
    });

    this.renderInventoryUI();
  }

  makeSlot(x, y, w, h, selected = false) {
    const rect = this.add.rectangle(x, y, w, h, 0x1f2937, 0.9).setStrokeStyle(selected ? 3 : 1, selected ? 0xf6bd60 : 0xcbd5e1);
    return rect;
  }

  renderInventoryUI() {
    this.hotbarLayer.removeAll(true);
    this.inventoryLayer.removeAll(true);

    const slotW = 66;
    const slotH = 66;
    const y = 540 - 42;
    const startX = 960 / 2 - (GameState.inventory.hotbarSize * slotW) / 2 + slotW / 2;

    for (let i = 0; i < GameState.inventory.hotbarSize; i++) {
      const slot = GameState.inventory.slots[i];
      const x = startX + i * slotW;
      const selected = i === GameState.inventory.hotbarIndex;
      this.hotbarLayer.add(this.makeSlot(x, y, slotW - 4, slotH - 8, selected));
      this.hotbarLayer.add(this.add.text(x - 26, y - 28, `${i + 1 > 9 ? i - 8 : i + 1}`, { fontSize: "10px", color: "#94a3b8" }));
      this.hotbarLayer.add(this.add.text(x - 24, y - 8, itemLabel(slot.itemId), { fontSize: "11px", color: "#ffffff" }));
      if (slot.qty > 1) this.hotbarLayer.add(this.add.text(x + 14, y + 14, `${slot.qty}`, { fontSize: "12px", color: "#ffffff" }));
    }

    if (this.inventoryOpen) {
      const panel = this.add.rectangle(260, 250, 420, 260, 0x111827, 0.95).setStrokeStyle(2, 0xe5e7eb);
      this.inventoryLayer.add(panel);
      this.inventoryLayer.add(this.add.text(70, 130, "Inventory", { color: "#ffffff", fontSize: "18px" }));

      for (let i = 0; i < GameState.inventory.slots.length; i++) {
        const row = Math.floor(i / 6);
        const col = i % 6;
        const cx = 100 + col * 62;
        const cy = 170 + row * 52;
        const slot = GameState.inventory.slots[i];
        this.inventoryLayer.add(this.makeSlot(cx, cy, 56, 46, i === GameState.inventory.hotbarIndex));
        this.inventoryLayer.add(this.add.text(cx - 24, cy - 8, itemLabel(slot.itemId), { fontSize: "10px", color: "#ffffff" }));
        if (slot.qty > 1) this.inventoryLayer.add(this.add.text(cx + 14, cy + 9, `${slot.qty}`, { fontSize: "11px", color: "#ffffff" }));
      }
    }
  }

  update() {
    GameState.time.minute += 0.12;
    if (GameState.time.minute >= 1440) advanceDay();

    const hour = Math.floor(GameState.time.minute / 60).toString().padStart(2, "0");
    const minute = Math.floor(GameState.time.minute % 60).toString().padStart(2, "0");

    const selected = getSelectedItem(GameState.inventory) ?? "none";
    this.dayText.setText(`Day ${GameState.time.day} (${GameState.time.weekday}) ${hour}:${minute} | Credits: ${GameState.currency}`);
    this.infoText.setText(`Map: ${GameState.player.mapId} | Tool: ${selected} | Seed: ${GameState.selectedSeed}`);

    if (this.toastTimer > 0) {
      this.toastTimer -= 1;
      this.toastText.setText(this.toast);
    } else {
      this.toastText.setText("TAB inventory | N next day | F5 save | F9 load | X sell all");
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.TAB)) {
      this.inventoryOpen = !this.inventoryOpen;
      this.renderInventoryUI();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.N)) {
      advanceDay();
      this.events.emit("toast", "Advanced to next day");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F5)) {
      saveGame();
      this.events.emit("toast", "Saved game");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.F9)) {
      if (loadGame()) this.events.emit("toast", "Loaded save");
      else this.events.emit("toast", "No save found");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.X)) {
      this.sellAll("turnip");
      this.sellAll("blueberry");
      this.sellAll("wood");
      this.events.emit("toast", "Sold all crops/materials");
    }

    this.renderInventoryUI();
  }

  sellAll(itemId) {
    const total = countItem(GameState.inventory, itemId);
    if (!total) return;
    removeItem(GameState.inventory, itemId, total);
    GameState.currency += ITEMS[itemId].sellPrice * total;
  }
}
