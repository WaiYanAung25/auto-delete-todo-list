import type { DepartmentSummary, Departments, DummyUser } from './types';

function emptySummary(): DepartmentSummary {
  return { male: 0, female: 0, ageRange: '', hair: {}, addressUser: {} };
}

/**
 * Groups users by company.department into the requested summary shape.
 *
 * Single pass O(n): counts genders, tracks min/max age, tallies hair
 * colors and builds the "firstNamelastName" -> postalCode map in one loop.
 */
export function transformDepartments(users: DummyUser[]): Departments {
  const groups = new Map<string, DepartmentSummary>();
  const ages = new Map<string, { min: number; max: number }>();

  for (const user of users) {
    const department = user.company?.department ?? 'Unknown';
    let summary = groups.get(department);
    if (!summary) {
      summary = emptySummary();
      groups.set(department, summary);
      ages.set(department, { min: user.age, max: user.age });
    }

    if (user.gender === 'male') summary.male += 1;
    else if (user.gender === 'female') summary.female += 1;

    const range = ages.get(department)!;
    range.min = Math.min(range.min, user.age);
    range.max = Math.max(range.max, user.age);

    const color = user.hair.color;
    summary.hair[color] = (summary.hair[color] ?? 0) + 1;

    summary.addressUser[`${user.firstName}${user.lastName}`] = user.address.postalCode;
  }

  const result: Departments = {};
  for (const [department, summary] of groups) {
    const range = ages.get(department)!;
    summary.ageRange = `${range.min}-${range.max}`;
    result[department] = summary;
  }
  return result;
}
