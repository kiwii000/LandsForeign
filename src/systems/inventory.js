import { ITEMS } from "../data/gameData.js";

export function addItem(inventory, itemId, qty) {
  let remaining = qty;
  const def = ITEMS[itemId];
  for (const slot of inventory.slots) {
    if (slot.itemId === itemId && slot.qty < def.maxStack) {
      const delta = Math.min(def.maxStack - slot.qty, remaining);
      slot.qty += delta;
      remaining -= delta;
      if (!remaining) return 0;
    }
  }
  for (const slot of inventory.slots) {
    if (!slot.itemId) {
      const delta = Math.min(def.maxStack, remaining);
      slot.itemId = itemId;
      slot.qty = delta;
      remaining -= delta;
      if (!remaining) return 0;
    }
  }
  return remaining;
}

export function removeItem(inventory, itemId, qty) {
  let left = qty;
  for (const slot of inventory.slots) {
    if (slot.itemId === itemId && left > 0) {
      const delta = Math.min(slot.qty, left);
      slot.qty -= delta;
      left -= delta;
      if (slot.qty === 0) {
        slot.itemId = null;
      }
    }
  }
  return left === 0;
}

export function countItem(inventory, itemId) {
  return inventory.slots.filter((s) => s.itemId === itemId).reduce((a, b) => a + b.qty, 0);
}

export function getSelectedItem(inventory) {
  return inventory.slots[inventory.hotbarIndex]?.itemId ?? null;
}
