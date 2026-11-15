/** Shape returned by https://dummyjson.com/users (fields we use). */
export interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  age: number;
  hair: { color: string; type: string };
  address: { postalCode: string };
  company?: { department: string };
}

export interface DummyUsersResponse {
  users: DummyUser[];
  total: number;
  skip: number;
  limit: number;
}

export interface DepartmentSummary {
  male: number;
  female: number;
  ageRange: string;
  hair: Record<string, number>;
  addressUser: Record<string, string>;
}

export type Departments = Record<string, DepartmentSummary>;
