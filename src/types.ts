export type ItemType = 'Fruit' | 'Vegetable';

export interface TodoItem {
  id: number;
  type: ItemType;
  name: string;
}

export type ColumnName = 'main' | 'fruit' | 'vegetable';

export interface TodoState {
  main: TodoItem[];
  fruit: TodoItem[];
  vegetable: TodoItem[];
}
