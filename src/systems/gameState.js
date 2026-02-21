import { CROPS, NPCS, ROBOT_PARTS } from "../data/gameData.js";

function randPick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRng(seedInput) {
  let seed = typeof seedInput === "number" ? seedInput >>> 0 : hashString(seedInput);
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function randomRobot(rng = Math.random) {
  return {
    head: randPick(ROBOT_PARTS.head, rng),
    face: randPick(ROBOT_PARTS.face, rng),
    torso: randPick(ROBOT_PARTS.torso, rng),
    arms: randPick(ROBOT_PARTS.arms, rng),
    legs: randPick(ROBOT_PARTS.legs, rng),
    palette: randPick(ROBOT_PARTS.palette, rng)
  };
}

export function robotFromSeed(seedValue) {
  return randomRobot(seededRng(seedValue));
}

export const GameState = {
  time: { day: 1, minute: 480, weekday: "Mon" },
  player: {
    mapId: "city",
    x: 180,
    y: 280,
    baseSpeed: 120,
    mounted: false,
    facing: "down",
    robot: randomRobot()
  },
  flags: { gotPlot: true },
  currency: 120,
  selectedSeed: "turnip",
  inventory: {
    hotbarIndex: 0,
    hotbarSize: 12,
    slots: Array.from({ length: 24 }, () => ({ itemId: null, qty: 0 }))
  },
  farmTiles: {},
  trees: [
    { id: "t1", x: 560, y: 160, hp: 3, maxHp: 3 },
    { id: "t2", x: 710, y: 240, hp: 3, maxHp: 3 },
    { id: "t3", x: 520, y: 360, hp: 3, maxHp: 3 }
  ],
  npcs: NPCS.map((n) => ({ ...n, x: n.homePos.x, y: n.homePos.y, behavior: "idle", robot: robotFromSeed(n.id) }))
};

GameState.inventory.slots[0] = { itemId: "hoe", qty: 1 };
GameState.inventory.slots[1] = { itemId: "watering_can", qty: 1 };
GameState.inventory.slots[2] = { itemId: "axe", qty: 1 };
GameState.inventory.slots[3] = { itemId: "turnip_seed", qty: 8 };
GameState.inventory.slots[4] = { itemId: "blueberry_seed", qty: 6 };

export function tileKey(tx, ty) {
  return `${tx},${ty}`;
}

export function getOrCreateFarmTile(tx, ty) {
  const key = tileKey(tx, ty);
  if (!GameState.farmTiles[key]) {
    GameState.farmTiles[key] = {
      tx,
      ty,
      soil: "untilled",
      wateredToday: false,
      cropId: null,
      growthDays: 0,
      mature: false
    };
  }
  return GameState.farmTiles[key];
}

export function advanceDay() {
  GameState.time.day += 1;
  GameState.time.minute = 360;
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  GameState.time.weekday = weekdays[(GameState.time.day - 1) % weekdays.length];

  for (const tile of Object.values(GameState.farmTiles)) {
    if (tile.cropId && tile.wateredToday) {
      tile.growthDays += 1;
      const def = CROPS[tile.cropId];
      if (tile.growthDays >= def.growthDays) tile.mature = true;
    }
    tile.wateredToday = false;
  }
}

export function saveGame() {
  localStorage.setItem("landsforeign-save", JSON.stringify(GameState));
}

export function loadGame() {
  const raw = localStorage.getItem("landsforeign-save");
  if (!raw) return false;
  const parsed = JSON.parse(raw);
  Object.assign(GameState.time, parsed.time);
  Object.assign(GameState.player, parsed.player);
  GameState.flags = parsed.flags;
  GameState.currency = parsed.currency;
  GameState.selectedSeed = parsed.selectedSeed;
  GameState.inventory = parsed.inventory;
  GameState.farmTiles = parsed.farmTiles;
  GameState.trees = parsed.trees;
  GameState.npcs = parsed.npcs.map((npc) => ({ ...npc, robot: npc.robot ?? robotFromSeed(npc.id) }));
  return true;
}
