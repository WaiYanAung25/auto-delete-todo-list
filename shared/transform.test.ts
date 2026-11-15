import { describe, expect, it } from 'vitest';
import { transformDepartments } from './transform';
import type { DummyUser } from './types';

function user(overrides: Partial<DummyUser> = {}): DummyUser {
  return {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    gender: 'male',
    age: 30,
    hair: { color: 'Brown', type: 'Straight' },
    address: { postalCode: '10000' },
    company: { department: 'Engineering' },
    ...overrides,
  };
}

describe('transformDepartments', () => {
  it('returns an empty object for no users', () => {
    expect(transformDepartments([])).toEqual({});
  });

  it('groups users by department with gender counts', () => {
    const result = transformDepartments([
      user({ firstName: 'Ada', lastName: 'Lovelace', gender: 'female', company: { department: 'R&D' } }),
      user({ firstName: 'Alan', lastName: 'Turing', gender: 'male', company: { department: 'R&D' } }),
      user({ firstName: 'Grace', lastName: 'Hopper', gender: 'female', company: { department: 'Sales' } }),
    ]);

    expect(result['R&D']).toMatchObject({ male: 1, female: 1 });
    expect(result['Sales']).toMatchObject({ male: 0, female: 1 });
  });

  it('computes the age range per department', () => {
    const result = transformDepartments([
      user({ age: 42 }),
      user({ age: 25 }),
      user({ age: 33, company: { department: 'Sales' } }),
    ]);

    expect(result['Engineering'].ageRange).toBe('25-42');
    expect(result['Sales'].ageRange).toBe('33-33');
  });

  it('tallies hair colors', () => {
    const result = transformDepartments([
      user({ hair: { color: 'Black', type: 'Straight' } }),
      user({ hair: { color: 'Blond', type: 'Wavy' } }),
      user({ hair: { color: 'Black', type: 'Curly' } }),
    ]);

    expect(result['Engineering'].hair).toEqual({ Black: 2, Blond: 1 });
  });

  it('maps firstNamelastName to postalCode', () => {
    const result = transformDepartments([
      user({ firstName: 'Terry', lastName: 'Medhurst', address: { postalCode: '12345' } }),
      user({ firstName: 'Sheldon', lastName: 'Curtis', address: { postalCode: '67890' } }),
    ]);

    expect(result['Engineering'].addressUser).toEqual({
      TerryMedhurst: '12345',
      SheldonCurtis: '67890',
    });
  });

  it('handles users without a company department', () => {
    const result = transformDepartments([user({ company: undefined })]);
    expect(result['Unknown']).toMatchObject({ male: 1, female: 0 });
  });

  it('produces the summary for multiple departments in one pass', () => {
    const users = [
      user({ firstName: 'Terry', lastName: 'Medhurst', gender: 'male', age: 41, hair: { color: 'Black', type: 'Straight' }, address: { postalCode: '12345' }, company: { department: 'Engineering' } }),
      user({ firstName: 'Sheldon', lastName: 'Curtis', gender: 'male', age: 21, hair: { color: 'Blond', type: 'Wavy' }, address: { postalCode: '67890' }, company: { department: 'Engineering' } }),
      user({ firstName: 'Trisha', lastName: 'Cummerata', gender: 'female', age: 55, hair: { color: 'Brown', type: 'Curly' }, address: { postalCode: '11111' }, company: { department: 'Marketing' } }),
    ];

    expect(transformDepartments(users)).toEqual({
      Engineering: {
        male: 2,
        female: 0,
        ageRange: '21-41',
        hair: { Black: 1, Blond: 1 },
        addressUser: { TerryMedhurst: '12345', SheldonCurtis: '67890' },
      },
      Marketing: {
        male: 0,
        female: 1,
        ageRange: '55-55',
        hair: { Brown: 1 },
        addressUser: { TrishaCummerata: '11111' },
      },
    });
  });
});
