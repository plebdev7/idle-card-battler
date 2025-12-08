# Spec: Full Greybox Integration

## 1. Overview
This spec defines the requirements for integrating the backend combat systems into the Greybox UI. The goal is to provide visual feedback for all game state changes, including entity movement, combat interactions (damage/healing), and resource generation.

## 2. UI Components

### 2.1 BattlefieldView Updates
The `BattlefieldView` must be updated to render all entity types:
*   **Summons**: Rendered similar to enemies but with a distinct style (e.g., Blue/Green color) and positioned relative to the Tower.
*   **Projectiles**: Rendered as small moving elements (e.g., dots or arrows) based on their `position` and `targetId`.

### 2.2 New Component: VisualEffectsOverlay
A new layer on top of the `BattlefieldView` to display transient visual feedback:
*   **Damage Numbers**: Floating text showing damage taken (Red).
*   **Healing Numbers**: Floating text showing health restored (Green).
*   **Status Effects**: Icons or text indicating status application (e.g., "SLOWED", "STUNNED").
*   **Block/Shield**: Visual indicator for damage mitigation.

### 2.3 CombatScreen Updates
*   **Essence Display**: Add a display for the `essence` resource, similar to `ManaDisplay`.
*   **AI Indicator**: (Optional) A visual indicator when the AI is active/thinking.

## 3. Data Structures & State

### 3.1 Visual Effects System
To decouple the engine from the UI, we will introduce a `visualEffects` queue in the `GameStore`.

```typescript
export type VisualEffectType = "DAMAGE" | "HEAL" | "BUFF" | "DEBUFF" | "BLOCK";

export interface VisualEffect {
    id: string;
    type: VisualEffectType;
    value?: number; // For damage/heal
    text?: string; // For status names
    position: number; // Lane position (0-100)
    timestamp: number;
}

// Store Update
interface GameState {
    // ... existing state
    visualEffects: VisualEffect[];
}
```

### 3.2 Engine Integration
The `CombatSystem` functions (`applyDamage`, `healTarget`, `applyStatus`) will be updated to push events to the `visualEffects` queue.

*   **Lifecycle**: The UI will render these effects and they will naturally expire (CSS animation). The store should periodically clean up old effects to prevent memory leaks, or the UI can handle the "pop" animation and the store just holds the recent history.
*   **Optimization**: To avoid rapid state updates causing re-renders, we might limit the history size or use a transient subscription model if performance becomes an issue. For now, a simple array in the store is sufficient for the Greybox.

## 4. Implementation Plan

1.  **Store Update**: Add `visualEffects` to `GameStore`.
2.  **Engine Hooks**: Update `CombatSystem` to dispatch effects.
3.  **BattlefieldView**:
    *   Add rendering for `summons`.
    *   Add rendering for `projectiles`.
    *   Implement `VisualEffectsOverlay`.
4.  **CombatScreen**: Add `EssenceDisplay`.

## 5. Edge Cases
*   **Rapid Fire**: Multiple damage numbers appearing at once. *Solution*: Offset slightly or stack them.
*   **Off-screen**: Entities dying off-screen. *Solution*: Effects are tied to position, if position is visible, effect is visible.
