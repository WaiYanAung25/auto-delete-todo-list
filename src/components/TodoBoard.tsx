import { useAutoReturnTimers, AUTO_RETURN_MS } from '../hooks/useAutoReturnTimers';
import type { TodoAction } from '../state/todoReducer';
import type { TodoItem, TodoState } from '../types';
import { TodoButton } from './TodoButton';

interface Props {
  state: TodoState;
  dispatch: (action: TodoAction) => void;
}

interface ColumnProps {
  title: string;
  items: TodoItem[];
  className?: string;
  renderItem: (item: TodoItem) => React.ReactNode;
}

function Column({ title, items, className = '', renderItem }: ColumnProps) {
  return (
    <section className={`column ${className}`}>
      <h2 className="column__title">
        {title} <span className="column__count">{items.length}</span>
      </h2>
      <div className="column__body">
        {items.length === 0 ? <p className="column__empty">Empty</p> : items.map(renderItem)}
      </div>
    </section>
  );
}

/**
 * Auto-delete todo list:
 * - clicking a main-list item moves it to its type column and starts a 5s timer;
 * - when the timer fires the item returns to the bottom of the main list;
 * - clicking an item already in a type column returns it immediately.
 */
export function TodoBoard({ state, dispatch }: Props) {
  const timers = useAutoReturnTimers((id) => dispatch({ type: 'RETURN_TO_MAIN', id }));

  const moveToColumn = (item: TodoItem) => {
    timers.arm(item.id);
    dispatch({ type: 'MOVE_TO_COLUMN', item });
  };

  const returnToMain = (item: TodoItem) => {
    timers.disarm(item.id);
    dispatch({ type: 'RETURN_TO_MAIN', id: item.id });
  };

  const waiting = (item: TodoItem) => timers.isRunning(item.id);

  return (
    <div className="board">
      <Column
        title="Todo List"
        items={state.main}
        className="column--main"
        renderItem={(item) => (
          <TodoButton
            key={item.id}
            item={item}
            autoReturnMs={AUTO_RETURN_MS}
            onClick={() => moveToColumn(item)}
          />
        )}
      />
      <div className="board__typed">
        <Column
          title="Fruit"
          items={state.fruit}
          className="column--fruit"
          renderItem={(item) => (
            <TodoButton
              key={item.id}
              item={item}
              autoReturnMs={AUTO_RETURN_MS}
              remainingMs={waiting(item) ? timers.remainingOf(item.id) : undefined}
              onClick={() => returnToMain(item)}
            />
          )}
        />
        <Column
          title="Vegetable"
          items={state.vegetable}
          className="column--vegetable"
          renderItem={(item) => (
            <TodoButton
              key={item.id}
              item={item}
              autoReturnMs={AUTO_RETURN_MS}
              remainingMs={waiting(item) ? timers.remainingOf(item.id) : undefined}
              onClick={() => returnToMain(item)}
            />
          )}
        />
      </div>
    </div>
  );
}
