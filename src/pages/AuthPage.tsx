import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InlineMessage } from '../components/InlineMessage';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../lib/errors';
import { getRoleHome } from '../lib/format';
import type { Role } from '../types';

type AuthMode = 'login' | 'register';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'PASSENGER' as Role
};

export function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const profile =
        mode === 'login'
          ? await signIn({
              email: form.email,
              password: form.password
            })
          : await signUp({
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              password: form.password,
              role: form.role
            });

      navigate(getRoleHome(profile.role), { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-copy">
        <p className="section-eyebrow">Frontend oficial del laboratorio</p>
        <h1>Controla el flujo completo de viajes sin salir de una sola interfaz.</h1>
        <p className="auth-lead">
          Inicia sesion o registrate para entrar como pasajero o conductor. El token JWT se
          guarda localmente y cada request viaja autenticado al backend de Spring Boot.
        </p>

        <div className="seed-card">
          <h2>Usuarios seed para probar rapido</h2>
          <ul>
            <li>`ana@uber.com` / `pass123` para flujo PASSENGER</li>
            <li>`carlos@uber.com` / `pass123` para flujo DRIVER disponible</li>
            <li>`lucia@uber.com` / `pass123` para DRIVER con viaje activo</li>
          </ul>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === 'login' ? 'tab-active' : ''}
            onClick={() => switchMode('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === 'register' ? 'tab-active' : ''}
            onClick={() => switchMode('register')}
            type="button"
          >
            Registro
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <div className="form-grid two-columns">
              <label>
                Nombre
                <input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                  required
                  type="text"
                  value={form.firstName}
                />
              </label>
              <label>
                Apellido
                <input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                  required
                  type="text"
                  value={form.lastName}
                />
              </label>
            </div>
          ) : null}

          <label>
            Email
            <input
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="nombre@uber.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label>
            Password
            <input
              minLength={6}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              placeholder="Minimo 6 caracteres"
              required
              type="password"
              value={form.password}
            />
          </label>

          {mode === 'register' ? (
            <label>
              Rol
              <select
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as Role
                  }))
                }
                value={form.role}
              >
                <option value="PASSENGER">PASSENGER</option>
                <option value="DRIVER">DRIVER</option>
              </select>
            </label>
          ) : null}

          {errorMessage ? <InlineMessage message={errorMessage} tone="error" /> : null}

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting
              ? 'Procesando...'
              : mode === 'login'
                ? 'Entrar al dashboard'
                : 'Crear cuenta y continuar'}
          </button>
        </form>
      </section>
    </div>
  );
}
