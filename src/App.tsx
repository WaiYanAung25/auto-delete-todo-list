import { useReducer, useState } from 'react';
import { DepartmentsPage } from './components/DepartmentsPage';
import { TodoBoard } from './components/TodoBoard';
import { INITIAL_ITEMS } from './data/items';
import { createInitialState, todoReducer } from './state/todoReducer';

type Tab = 'todo' | 'departments';

export default function App() {
  const [state, dispatch] = useReducer(todoReducer, INITIAL_ITEMS, createInitialState);
  const [tab, setTab] = useState<Tab>('todo');

  return (
    <div className="app">
      <header className="app__header">
        <h1>Auto Delete Todo List</h1>
        <nav className="app__tabs">
          <button
            className={tab === 'todo' ? 'tab tab--active' : 'tab'}
            onClick={() => setTab('todo')}
          >
            Todo List
          </button>
          <button
            className={tab === 'departments' ? 'tab tab--active' : 'tab'}
            onClick={() => setTab('departments')}
          >
            Departments (API)
          </button>
        </nav>
      </header>
      <main>{tab === 'todo' ? <TodoBoard state={state} dispatch={dispatch} /> : <DepartmentsPage />}</main>
    </div>
  );
}
