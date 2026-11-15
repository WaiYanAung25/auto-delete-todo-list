# Auto Delete Todo List

A React + TypeScript todo list where clicking an item sends it to a type column (Fruit / Vegetable) for 5 seconds, then automatically returns it to the bottom of the main list.

## Features

- **Clickable buttons** — click an item in the main list to move it into its own type column
- **5-second auto-return** — each moved item shows a live countdown bar, then returns to the **bottom** of the main list
- **Immediate return** — click an item in a Fruit/Vegetable column and it goes back to the bottom of the main list instantly (timer cancelled)
- **No items lost or duplicated** — one reducer owns all state transitions

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm test` | Run 10 tests (reducer + component behaviour) |
| `npm run typecheck` | TypeScript type check |
| `npm run build` | Production build |

## How it works

```
src/
├── state/todoReducer.ts            # pure state transitions (MOVE / RETURN)
├── hooks/useAutoReturnTimers.ts    # 5s timers in a ref + light countdown ticker
├── components/TodoBoard.tsx        # 3-column board, click handlers
├── components/TodoButton.tsx       # button with countdown bar
└── data/items.ts                   # initial 11 items
```

- **State** — a single `useReducer` holds `{ main, fruit, vegetable }`. Every move is a pure action (`MOVE_TO_COLUMN`, `RETURN_TO_MAIN`), so transitions are easy to test and reason about.
- **Timers** — `useAutoReturnTimers` stores `setTimeout` handles in a `ref` map and arms them inside click handlers, so React StrictMode's double-rendering never double-schedules them. Clicking a waiting item calls `disarm()` before returning it, cancelling the pending auto-return.
- **Countdown UI** — one 100ms ticker runs only while at least one item is waiting; the progress bar width is derived from the remaining time.

### Flow

1. Click `Apple` (Fruit) in the main list → moves to the **Fruit** column, 5s countdown starts
2. Wait 5s → returns to the **bottom** of the main list
3. Or click it while it's in the Fruit column → returns to the **bottom** of the main list immediately

## Tests

```bash
npm test
```

- **Reducer** (6) — move, return to bottom, full cycle keeps every item exactly once
- **Component** (4) — auto-return after 5s, immediate return, timer cancellation, no items lost (runs under StrictMode with fake timers)

## Stack

React 18 · TypeScript · Vite · Vitest · Testing Library
