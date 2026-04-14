import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register as registerUser } from '../api';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const TopBar = ({ activeZone, badge }) => (
  <div className="ztop d-flex align-items-center gap-2">
    <div className="ztop-brand d-flex align-items-center gap-2">
      <div className="ztop-ic d-flex align-items-center justify-content-center">
        <svg fill="none" height="12" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="12">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
      </div>
      ExamControl AI
    </div>
    <div className="ztop-sep"></div>
    <div className="ztop-links">
      <Link className={`ztop-lnk ${activeZone === 'admin' ? 'act' : ''}`} to="/admin/login">Admin</Link>
      <Link className={`ztop-lnk ${activeZone === 'faculty' ? 'act' : ''}`} to="/faculty/login">Faculty</Link>
      <Link className={`ztop-lnk ${activeZone === 'student' ? 'act' : ''}`} to="/student/login">Student</Link>
      <Link className="ztop-lnk" to="/">Home</Link>
    </div>
    <div className="ms-auto"><span className={`ztop-badge ${badge.cls}`}>{badge.text}</span></div>
  </div>
);

/* ─── VALIDATION SCHEMAS ─── */
const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

/* ─── ADMIN LOGIN ─── */
export const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      const data = await login({ email: form.email, password: form.password });
      if (data.role !== 'admin') {
        throw new Error('Access Denied: This portal is for Administrators only.');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar activeZone="admin" badge={{ cls: 'tb-adm', text: '⚙ Admin Zone' }} />
      <div style={{ marginTop: '36px' }}>
        <div className="login-wrap" style={{ minHeight: 'calc(100vh - 36px)' }}>
          <div className="login-card">
            <div className="lc-bar" style={{ background: 'linear-gradient(90deg,var(--amber),#FBBF24,var(--in5))' }}></div>
            <div className="login-logo d-flex align-items-center gap-2">
              <div className="ll-mark sm-adm d-inline-flex align-items-center justify-content-center">
                <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 800, color: 'var(--g900)' }}>ExamControl AI</div>
                <div style={{ fontSize: '11px', color: 'var(--g300)' }}>Admin Access Only</div>
              </div>
            </div>
            <div className="login-h">Admin Sign In</div>
            <div className="login-sub">Authorised administrators only</div>
            {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="fg">
                <label className="fl req">Admin Email</label>
                <input className={`fi ${errors.email ? 'is-invalid' : ''}`} placeholder="admin@examcontrol.ai" {...register('email')} />
                {errors.email && <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{errors.email.message}</div>}
              </div>
              <div className="fg">
                <label className="fl req">Password</label>
                <input className={`fi ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" type="password" {...register('password')} />
                {errors.password && <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{errors.password.message}</div>}
              </div>
              <button className="login-btn lb-adm" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In to Admin Panel'}
              </button>
            </form>
            <div className="login-foot">Restricted to authorised personnel only</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── FACULTY LOGIN ─── */
export const FacultyLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (form) => {
    setLoading(true);
    setError('');
    try {
      const data = await login({ email: form.email, password: form.password });
      if (data.role !== 'faculty' && data.role !== 'admin') {
        throw new Error('Access Denied: Faculty credentials required.');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar activeZone="faculty" badge={{ cls: 'tb-fac', text: '🎓 Faculty Zone' }} />
      <div style={{ marginTop: '36px' }}>
        <div className="login-wrap" style={{ minHeight: 'calc(100vh - 36px)' }}>
          <div className="login-card">
            <div className="lc-bar" style={{ background: 'linear-gradient(90deg,var(--green),#34D399,var(--cy4))' }}></div>
            <div className="login-logo d-flex align-items-center gap-2">
              <div className="ll-mark sm-fac d-inline-flex align-items-center justify-content-center">
                <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 800, color: 'var(--g900)' }}>ExamControl AI</div>
                <div style={{ fontSize: '11px', color: 'var(--g300)' }}>Faculty Portal</div>
              </div>
            </div>
            <div className="login-h">Faculty Login</div>
            <div className="login-sub">Sign in with your department credentials</div>
            {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="fg">
                <label className="fl">Department</label>
                <select className="fi" {...register('dept')}>
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="fg">
                <label className="fl req">Faculty ID / Email</label>
                <input className={`fi ${errors.email ? 'is-invalid' : ''}`} placeholder="faculty@college.edu" {...register('email')} />
                {errors.email && <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{errors.email.message}</div>}
              </div>
              <div className="fg">
                <label className="fl req">Password</label>
                <input className={`fi ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" type="password" {...register('password')} />
                {errors.password && <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{errors.password.message}</div>}
              </div>
              <button className="login-btn lb-fac" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In to Faculty Portal'}
              </button>
            </form>
            <div className="login-foot">Need access? Contact your department admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── STUDENT LOGIN ─── */
export const StudentLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register: regLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onLoginSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const resp = await login({ email: data.email, password: data.password });
      localStorage.setItem('token', resp.token);
      localStorage.setItem('user', JSON.stringify(resp));
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TopBar activeZone="student" badge={{ cls: 'tb-std', text: '🎓 Student Zone' }} />
      <div style={{ marginTop: '36px' }}>
        <div className="login-wrap" style={{ minHeight: 'calc(100vh - 36px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px' }}>
          <div className="login-card">
            <div className="lc-bar" style={{ background: 'linear-gradient(90deg,var(--in5),var(--in3),var(--cy4))' }}></div>
            <div className="login-logo d-flex align-items-center gap-2">
              <div className="ll-mark sm-std d-inline-flex align-items-center justify-content-center">
                <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--fd)', fontSize: '13px', fontWeight: 800, color: 'var(--g900)' }}>ExamControl AI</div>
                <div style={{ fontSize: '11px', color: 'var(--g300)' }}>Student Portal</div>
              </div>
            </div>
            <div className="login-h">Student Login</div>
            <div className="login-sub">Sign in to your account</div>
            {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
              <div className="fg">
                <label className="fl req">Roll No. / Email</label>
                <input className={`fi ${loginErrors.email ? 'is-invalid' : ''}`} placeholder="cs2021001@college.edu or rahul@college.edu" {...regLogin('email')} />
                {loginErrors.email && <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{loginErrors.email.message}</div>}
              </div>
              <div className="fg">
                <label className="fl req">Password</label>
                <input className={`fi ${loginErrors.password ? 'is-invalid' : ''}`} placeholder="••••••••" type="password" {...regLogin('password')} />
                {loginErrors.password && <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{loginErrors.password.message}</div>}
              </div>
              <button className="login-btn lb-std" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="login-foot">New student? <Link to="/student/register" style={{color: 'var(--in5)', fontWeight: 700}}>Enroll your Identity here →</Link></div>
          </div>
        </div>
      </div>
    </div>
  );
};
