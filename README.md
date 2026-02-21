npm install
npm run dev

# LandsForeign

Phaser 3 + Vite + JavaScript prototype implementing the requested V1 foundation:
- City hub + farm plot with teleport pads
- Farming (till, plant, water, harvest) with Turnip and Blueberry
- Tree chopping + wood gathering
- Humanoid robot player randomization/customization shortcut
- Robot NPC schedules + shop hours behavior
- Inventory + hotbar tools + basic economy sell/buy loop
- Spaceship mount speed boost on farm
- Save/load to localStorage

## Controls
- Move: WASD
- City: `E` interact shopkeeper, `T` teleport to farm pad, `R` random robot, `K` cycle robot palette
- Farm: `1/2/3` select Hoe/Watering Can/Axe, `Q` switch seed, `E` till/plant/water/harvest, `J` chop tree, `M` mount, `T` return city (near pad)
- Global: `N` next day, `F5` save, `F9` load, `X` sell all crops/materials
