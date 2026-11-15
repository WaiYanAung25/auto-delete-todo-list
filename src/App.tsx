import { useReducer } from 'react';
import { TodoBoard } from './components/TodoBoard';
import { INITIAL_ITEMS } from './data/items';
import { createInitialState, todoReducer } from './state/todoReducer';

export default function App() {
  const [state, dispatch] = useReducer(todoReducer, INITIAL_ITEMS, createInitialState);

  return (
    <div className="app">
      <header className="app__header">
        <h1>Auto Delete Todo List</h1>
      </header>
      <main>
        <TodoBoard state={state} dispatch={dispatch} />
      </main>
    </div>
  );
}
