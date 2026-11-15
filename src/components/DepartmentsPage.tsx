import { useEffect, useState } from 'react';
import type { Departments } from '../../shared/types';

type Status = 'loading' | 'ready' | 'error';

export function DepartmentsPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [departments, setDepartments] = useState<Departments | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/departments')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Departments) => {
        if (!cancelled) {
          setDepartments(data);
          setStatus('ready');
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') return <p className="status">Loading departments…</p>;
  if (status === 'error') return <p className="status status--error">Failed to load: {error}</p>;
  if (!departments) return null;

  return (
    <div className="departments">
      {Object.entries(departments).map(([name, dept]) => (
        <section key={name} className="dept-card">
          <h2 className="dept-card__title">{name}</h2>
          <dl className="dept-card__stats">
            <div>
              <dt>Male</dt>
              <dd>{dept.male}</dd>
            </div>
            <div>
              <dt>Female</dt>
              <dd>{dept.female}</dd>
            </div>
            <div>
              <dt>Age range</dt>
              <dd>{dept.ageRange}</dd>
            </div>
          </dl>
          <h3>Hair</h3>
          <ul className="dept-card__chips">
            {Object.entries(dept.hair).map(([color, count]) => (
              <li key={color} className="chip">
                {color}: {count}
              </li>
            ))}
          </ul>
          <h3>Postal codes</h3>
          <table className="dept-card__table">
            <tbody>
              {Object.entries(dept.addressUser).map(([fullName, postalCode]) => (
                <tr key={fullName}>
                  <td>{fullName}</td>
                  <td>{postalCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
