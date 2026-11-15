// @vitest-environment jsdom
import { StrictMode, useReducer } from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodoBoard } from './TodoBoard';
import { createInitialState, todoReducer } from '../state/todoReducer';
import { INITIAL_ITEMS } from '../data/items';

/** Real reducer state + the board, so React re-renders naturally. */
function Harness() {
  const [state, dispatch] = useReducer(todoReducer, INITIAL_ITEMS, createInitialState);
  return (
    <StrictMode>
      <TodoBoard state={state} dispatch={dispatch} />
    </StrictMode>
  );
}

function clickItem(name: string) {
  const button = [...document.querySelectorAll('.todo-button')].find(
    (b) => b.querySelector('.todo-button__name')?.textContent === name,
  );
  if (!button) throw new Error(`No button found for "${name}"`);
  fireEvent.click(button);
}

function namesIn(column: string): string[] {
  return [...document.querySelectorAll(`.${column} .todo-button__name`)].map(
    (el) => el.textContent ?? '',
  );
}

describe('TodoBoard auto-delete behaviour', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('moves a clicked main-list item into its type column', () => {
    render(<Harness />);
    clickItem('Apple');

    expect(namesIn('column--fruit')).toEqual(['Apple']);
    expect(namesIn('column--main')).not.toContain('Apple');
    expect(namesIn('column--vegetable')).toEqual([]);
  });

  it('returns the item to the bottom of the main list after 5 seconds', () => {
    render(<Harness />);
    clickItem('Apple');
    clickItem('Broccoli');
    expect(namesIn('column--fruit')).toEqual(['Apple']);
    expect(namesIn('column--vegetable')).toEqual(['Broccoli']);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const main = namesIn('column--main');
    // Both returned, appended to the bottom in completion order.
    expect(main.slice(-2)).toEqual(['Apple', 'Broccoli']);
    expect(namesIn('column--fruit')).toEqual([]);
    expect(namesIn('column--vegetable')).toEqual([]);
  });

  it('returns immediately when an item in a type column is clicked', () => {
    render(<Harness />);
    clickItem('Broccoli');
    expect(namesIn('column--vegetable')).toEqual(['Broccoli']);

    clickItem('Broccoli');
    const main = namesIn('column--main');
    expect(main[main.length - 1]).toBe('Broccoli');
    expect(namesIn('column--vegetable')).toEqual([]);

    // Timer was cancelled — advancing time must not move anything.
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    const after = namesIn('column--main');
    expect(after[after.length - 1]).toBe('Broccoli');
    expect(after).toHaveLength(INITIAL_ITEMS.length);
  });

  it('keeps every item exactly once through a full cycle', () => {
    render(<Harness />);
    for (const item of INITIAL_ITEMS) {
      clickItem(item.name);
    }
    expect(namesIn('column--main')).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const all = [
      ...namesIn('column--main'),
      ...namesIn('column--fruit'),
      ...namesIn('column--vegetable'),
    ];
    expect(all.sort()).toEqual(INITIAL_ITEMS.map((i) => i.name).sort());
  });
});
