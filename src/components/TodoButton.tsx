import type { TodoItem } from '../types';

interface Props {
  item: TodoItem;
  remainingMs?: number;
  autoReturnMs: number;
  onClick: () => void;
}

/** A single clickable item. When waiting in a column it shows a countdown bar. */
export function TodoButton({ item, remainingMs, autoReturnMs, onClick }: Props) {
  const waiting = remainingMs !== undefined;
  const progress = waiting ? (remainingMs / autoReturnMs) * 100 : null;

  return (
    <button className={`todo-button todo-button--${item.type.toLowerCase()}`} onClick={onClick}>
      <span className="todo-button__name">{item.name}</span>
      {waiting && progress !== null && (
        <span className="todo-button__countdown" aria-hidden="true">
          <span className="todo-button__countdown-fill" style={{ width: `${progress}%` }} />
        </span>
      )}
      {waiting && (
        <span className="todo-button__seconds">{Math.ceil(remainingMs / 1000)}s</span>
      )}
    </button>
  );
}
