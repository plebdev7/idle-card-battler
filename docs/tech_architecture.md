# Technical Architecture: Idle Card Battler

## 1. Technology Stack
*   **Framework**: React (via Vite) - Fast development, component-based UI.
*   **Language**: TypeScript - Strict typing for complex game state.
*   **State Management**: **Zustand** - Lightweight, supports transient updates (high frequency) without re-rendering everything.
*   **Styling**: CSS Modules or Vanilla CSS (per project constraints).
*   **Build Tool**: Vite.

## 2. Core Architecture Pattern
We will use a **Decoupled Game Loop** pattern.
*   **Game State**: Holds the "True" state of the game (Enemy HP, Card positions, Cooldowns).
*   **Game Loop**: A `requestAnimationFrame` loop that updates the Game State `delta` ms.
*   **UI Layer**: React components that *subscribe* to state changes.
    *   *Optimization*: We will use Zustand's `useStore` with selectors to ensure components only re-render when their specific data changes, not on every tick.

## 3. State Management (Zustand)
### 3.1 Store Structure
```typescript
interface GameState {
  // Resources
  gold: number;
  mana: number;
  maxMana: number;
  
  // Combat State
  enemies: Enemy[];
  deck: Card[];
  hand: Card[];
  discard: Card[];
  
  // Tower
  towerHealth: number;
  
  // Meta
  isRunning: boolean;
  tick: (dt: number) => void;
}
```

### 3.2 The Tick System
The `tick` function is the heart of the engine.
1.  **Mana Regen**: `mana += regenRate * dt`
2.  **Cooldowns**: Reduce cooldowns of cards/enemies.
3.  **Enemy Logic**: Move enemies, attack Tower if in range.
4.  **Auto-Play Logic**: Check if Wizard can play a card (AI Tier check).

## 4. Data Structures
### 4.1 Card Entity
```typescript
interface Card {
  id: string; // Unique instance ID
  templateId: string; // "fireball", "skeleton"
  name: string;
  cost: number;
  type: 'Spell' | 'Summon' | 'Enchantment';
  effects: CardEffect[];
}
```

### 4.2 Enemy Entity
```typescript
interface Enemy {
  id: string;
  hp: number;
  maxHp: number;
  position: number; // 0 = Tower, 100 = Spawn
  speed: number;
  attackDamage: number;
  attackSpeed: number;
  nextAttack: number; // Timestamp
}
```

## 5. Persistence
*   **Storage**: `localStorage` (initially).
*   **Save Frequency**: Auto-save on Floor completion and Shop exit.
*   **Format**: JSON serialization of the `GameState` (excluding transient UI state).
