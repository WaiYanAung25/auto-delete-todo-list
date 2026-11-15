import { columnFor } from '../data/items';
import type { TodoItem, TodoState } from '../types';

export type TodoAction =
  | { type: 'MOVE_TO_COLUMN'; item: TodoItem }
  | { type: 'RETURN_TO_MAIN'; id: number };

export function createInitialState(items: TodoItem[]): TodoState {
  return { main: [...items], fruit: [], vegetable: [] };
}

function withoutItem(list: TodoItem[], id: number): TodoItem[] {
  return list.filter((item) => item.id !== id);
}

/**
 * Pure state transitions:
 * - MOVE_TO_COLUMN: pull item out of main, push into its type column.
 * - RETURN_TO_MAIN: pull item out of any column, append to bottom of main.
 */
export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'MOVE_TO_COLUMN': {
      const { item } = action;
      const column = columnFor(item.type);
      return {
        ...state,
        main: withoutItem(state.main, item.id),
        [column]: [...state[column], item],
      };
    }
    case 'RETURN_TO_MAIN': {
      const { id } = action;
      const item =
        state.fruit.find((i) => i.id === id) ??
        state.vegetable.find((i) => i.id === id);
      if (!item) return state;
      return {
        ...state,
        fruit: withoutItem(state.fruit, id),
        vegetable: withoutItem(state.vegetable, id),
        main: [...state.main, item],
      };
    }
  }
}
