export const MAPS = {
  city: { id: "city", name: "Main City Hub", allowMount: false, bg: 0x23395b },
  farm: { id: "farm", name: "Starter Plot", allowMount: true, bg: 0x2d6a4f }
};

export const ITEMS = {
  hoe: { id: "hoe", name: "Hoe", category: "tool", maxStack: 1, buyPrice: 0, sellPrice: 0 },
  watering_can: { id: "watering_can", name: "Watering Can", category: "tool", maxStack: 1, buyPrice: 0, sellPrice: 0 },
  axe: { id: "axe", name: "Axe", category: "tool", maxStack: 1, buyPrice: 0, sellPrice: 0 },
  turnip_seed: { id: "turnip_seed", name: "Turnip Seeds", category: "seed", maxStack: 99, buyPrice: 12, sellPrice: 5 },
  blueberry_seed: { id: "blueberry_seed", name: "Blueberry Seeds", category: "seed", maxStack: 99, buyPrice: 24, sellPrice: 10 },
  turnip: { id: "turnip", name: "Turnip", category: "crop", maxStack: 99, buyPrice: 0, sellPrice: 28 },
  blueberry: { id: "blueberry", name: "Blueberry", category: "crop", maxStack: 99, buyPrice: 0, sellPrice: 52 },
  wood: { id: "wood", name: "Wood", category: "material", maxStack: 99, buyPrice: 0, sellPrice: 8 }
};

export const CROPS = {
  turnip: { id: "turnip", seedItemId: "turnip_seed", harvestItemId: "turnip", growthDays: 2, color: 0xe9c46a },
  blueberry: { id: "blueberry", seedItemId: "blueberry_seed", harvestItemId: "blueberry", growthDays: 4, color: 0x5e60ce }
};

export const ROBOT_PARTS = {
  head: ["round", "square", "visor"],
  face: ["dot", "bar", "smile"],
  torso: ["light", "medium", "heavy"],
  arms: ["basic", "clamp", "sleek"],
  legs: ["walker", "piston", "hover"],
  palette: ["teal", "orange", "violet", "mint", "red"]
};

export const NPCS = [
  {
    id: "shopkeeper",
    name: "AX-01",
    role: "shopkeeper",
    homePos: { x: 630, y: 180 },
    shopPos: { x: 770, y: 260 },
    schedule: [
      { start: 540, end: 1020, behavior: "shopkeeper", pos: { x: 770, y: 260 } },
      { start: 1021, end: 1439, behavior: "idle", pos: { x: 630, y: 180 } },
      { start: 0, end: 539, behavior: "idle", pos: { x: 630, y: 180 } }
    ]
  },
  {
    id: "townie_1",
    name: "RX-22",
    role: "townie",
    homePos: { x: 420, y: 140 },
    schedule: [
      { start: 480, end: 720, behavior: "walk", pos: { x: 500, y: 220 } },
      { start: 721, end: 1100, behavior: "idle", pos: { x: 300, y: 320 } },
      { start: 1101, end: 1439, behavior: "idle", pos: { x: 420, y: 140 } },
      { start: 0, end: 479, behavior: "idle", pos: { x: 420, y: 140 } }
    ]
  }
];
