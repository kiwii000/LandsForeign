import { CROPS, NPCS, ROBOT_PARTS } from "../data/gameData.js";

function randPick(arr, rng = Math.random) {
  return arr[Math.floor(rng() * arr.length)];
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

export const GameState = {
  time: { day: 1, minute: 480, weekday: "Mon" },
  player: {
    mapId: "city",
    x: 180,
    y: 280,
    baseSpeed: 130,
    mounted: false,
    robot: randomRobot()
  },
  flags: { gotPlot: true },
  currency: 120,
  selectedSeed: "turnip",
  inventory: {
    hotbarIndex: 0,
    slots: [
      { itemId: "hoe", qty: 1 },
      { itemId: "watering_can", qty: 1 },
      { itemId: "axe", qty: 1 },
      { itemId: "turnip_seed", qty: 6 },
      { itemId: "blueberry_seed", qty: 4 },
      { itemId: null, qty: 0 },
      { itemId: null, qty: 0 },
      { itemId: null, qty: 0 },
      { itemId: null, qty: 0 },
      { itemId: null, qty: 0 },
      { itemId: null, qty: 0 },
      { itemId: null, qty: 0 }
    ]
  },
  farmTiles: {},
  trees: [
    { id: "t1", x: 580, y: 150, hp: 3, maxHp: 3 },
    { id: "t2", x: 710, y: 260, hp: 3, maxHp: 3 },
    { id: "t3", x: 520, y: 370, hp: 3, maxHp: 3 }
  ],
  npcs: NPCS.map((n) => ({ ...n, x: n.homePos.x, y: n.homePos.y, behavior: "idle" }))
};

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
  GameState.npcs = parsed.npcs;
  return true;
}
