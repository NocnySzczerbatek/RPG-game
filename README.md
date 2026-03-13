# God-Slayer: Rise from Ashes

Dark fantasy turn-based RPG built with React 18 + Tailwind CSS + Vite 5.

---

## Quickstart (requires Node.js 18+)

```bash
# 1. Install Node.js from https://nodejs.org (LTS version)

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# -> Opens at http://localhost:5173

# 4. Build for production
npm run build
```

---

## Project Structure

```
src/
├── data/
│   ├── classes.js      # 4 player classes (Warrior, Mage, Paladin, Ninja)
│   ├── items.js        # 50+ items, shop inventory, forge recipes
│   ├── cities.js       # 3 cities + full NPC dialogue trees
│   ├── enemies.js      # 16 enemies + 4 bosses with Enrage Phase
│   └── quests.js       # 7-stage main quest + infinite bounty generator
├── engine/
│   ├── combat.js       # Pure functional turn-based combat engine
│   ├── saveSystem.js   # localStorage save/load
│   └── gameReducer.js  # Central useReducer (20+ action types)
├── components/
│   ├── Game.jsx        # Main orchestrator + screen router
│   ├── HUD.jsx         # Persistent top bar (HP/MP/EXP bars)
│   ├── TitleScreen.jsx
│   ├── DifficultySelect.jsx
│   ├── CharacterCreation.jsx
│   ├── CityView.jsx    # City hub with NPCs, combat, services
│   ├── CombatView.jsx  # Full battle screen with skills/items
│   ├── WorldMap.jsx    # City travel + shard tracker
│   ├── ShopView.jsx    # Buy/sell with merchant gold limit
│   ├── ForgeView.jsx   # Divine Forge (Cytadela only)
│   ├── InventoryPanel.jsx  # Inventory + equipment slots
│   ├── QuestTracker.jsx
│   ├── BountyBoard.jsx
│   ├── DialogueSystem.jsx  # Branching NPC dialogue
│   └── Notifications.jsx
└── index.css           # Gothic theme + custom Tailwind utilities
```

---

## Features Implemented

- ✅ 4 classes: Warrior, Mage, Paladin, Ninja (unique mechanics, 5 skills each)
- ✅ 3 cities: Bastion, Iglicze, Cytadela (unlocked by main quest progress)
- ✅ 50+ items across 5 rarities (Common → Divine)
- ✅ Turn-based combat: dodge, crit, 20+ status effects, skills, items
- ✅ Boss Enrage Phase (4 bosses with unique mechanics)
- ✅ 7-stage main quest "Odłamki Słońca" + infinite bounty generator
- ✅ Divine Forge (craft legendary weapons at Cytadela)
- ✅ Shop with per-city merchant gold limits
- ✅ Equipment system (click to equip/unequip)
- ✅ Gothic dark UI (bg-slate-950, amber-500, Cinzel font)
- ✅ Auto-save to localStorage
- ✅ 3 Difficulty modes: Normal, Nightmare, Hardcore (permadeath)
- ✅ 12 NPCs with full branching dialogues (5+ per city)
- ✅ 6 AI art prompts (see `AI_ART_PROMPTS.md`)

---

## Difficulty Modes

| Mode | XP Mult | Gold Mult | Enemy HP | Permadeath |
|------|---------|-----------|----------|------------|
| Normal | 1× | 1× | 1× | No |
| Nightmare | 1.2× | 0.8× | 1.5× | No |
| Hardcore | 1.5× | 0.6× | 2× | **Yes** |

---

## Tech Stack

- React 18.2
- Vite 5.1
- Tailwind CSS 3.4
- Google Fonts: Cinzel + Crimson Text
- Pure useReducer state management (no Redux)
