npm install
npm run dev

# LandsForeign

Phaser 3 + Vite + JavaScript prototype implementing the requested V1 foundation:
- City hub + farm plot with teleport pads
- Stardew-like bottom toolbar (12 slots) + toggleable inventory grid (TAB)
- Farming (till, plant, water, harvest) with Turnip and Blueberry
- Outlined target tile in front of the player for precise soil/crop actions
- Procedurally generated pixel-art humanoid robot sprites for player/NPCs
- Basic pixel-art tree/stump and crop sprites
- Tree chopping + wood gathering
- Robot NPC schedules + shop hours behavior
- Spaceship mount speed boost on farm
- Save/load to localStorage

## Controls
- Move: WASD
- City: `E` interact shopkeeper, `T` teleport to farm pad, `R` random robot parts
- Farm: `1..=` select hotbar slot, `Q` switch seed, `E` action (till/plant/water/harvest), `J` chop tree, `M` mount, `T` return city (near pad)
- UI: `TAB` inventory, `N` next day, `F5` save, `F9` load, `X` sell all crops/materials
