import { describe, expect, it } from 'vitest';
import { INITIAL_ITEMS } from '../data/items';
import { createInitialState, todoReducer } from './todoReducer';
import type { TodoState } from '../types';

const initial = () => createInitialState(INITIAL_ITEMS);

describe('todoReducer', () => {
  it('moves a fruit item from main to the fruit column', () => {
    const state = todoReducer(initial(), { type: 'MOVE_TO_COLUMN', item: INITIAL_ITEMS[0] });
    expect(state.main.find((i) => i.name === 'Apple')).toBeUndefined();
    expect(state.fruit.map((i) => i.name)).toEqual(['Apple']);
    expect(state.vegetable).toHaveLength(0);
  });

  it('moves a vegetable item from main to the vegetable column', () => {
    const state = todoReducer(initial(), { type: 'MOVE_TO_COLUMN', item: INITIAL_ITEMS[1] });
    expect(state.vegetable.map((i) => i.name)).toEqual(['Broccoli']);
    expect(state.fruit).toHaveLength(0);
  });

  it('appends a returned item to the bottom of the main list', () => {
    let state: TodoState = initial();
    const apple = INITIAL_ITEMS[0];
    const banana = INITIAL_ITEMS[3];

    state = todoReducer(state, { type: 'MOVE_TO_COLUMN', item: apple });
    state = todoReducer(state, { type: 'MOVE_TO_COLUMN', item: banana });
    state = todoReducer(state, { type: 'RETURN_TO_MAIN', id: apple.id });

    expect(state.fruit.map((i) => i.name)).toEqual(['Banana']);
    expect(state.main[state.main.length - 1].name).toBe('Apple');
    // Apple returned, Banana still waiting in fruit column — nothing lost
    expect(state.main.length + state.fruit.length + state.vegetable.length).toBe(
      INITIAL_ITEMS.length,
    );
  });

  it('returns an item from the vegetable column as well', () => {
    let state = initial();
    const broccoli = INITIAL_ITEMS[1];
    state = todoReducer(state, { type: 'MOVE_TO_COLUMN', item: broccoli });
    state = todoReducer(state, { type: 'RETURN_TO_MAIN', id: broccoli.id });
    expect(state.vegetable).toHaveLength(0);
    expect(state.main[state.main.length - 1].name).toBe('Broccoli');
  });

  it('is a no-op when returning an item that is already in main', () => {
    const before = initial();
    const after = todoReducer(before, { type: 'RETURN_TO_MAIN', id: INITIAL_ITEMS[0].id });
    expect(after).toEqual(before);
  });

  it('never duplicates or loses items across a full cycle', () => {
    let state = initial();
    for (const item of INITIAL_ITEMS) {
      state = todoReducer(state, { type: 'MOVE_TO_COLUMN', item });
    }
    expect(state.main).toHaveLength(0);
    expect(state.fruit.length + state.vegetable.length).toBe(INITIAL_ITEMS.length);

    for (const item of INITIAL_ITEMS) {
      state = todoReducer(state, { type: 'RETURN_TO_MAIN', id: item.id });
    }
    const names = state.main.map((i) => i.name).sort();
    expect(names).toEqual(INITIAL_ITEMS.map((i) => i.name).sort());
    expect(state.fruit).toHaveLength(0);
    expect(state.vegetable).toHaveLength(0);
  });
});
