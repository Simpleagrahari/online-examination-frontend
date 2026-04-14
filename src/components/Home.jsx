import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login } from '../api';

const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required')
});

const Home = () => {
    const [view, setView] = useState('zones'); // 'zones' or 'login'
    const [loginTab, setLoginTab] = useState('adm'); // 'adm', 'fac', 'std'
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(loginSchema)
    });

    const sv = (v) => { setView(v); setError(''); reset(); };
    const st = (t) => { setLoginTab(t); setError(''); reset(); };

    const onLoginSubmit = async (data) => {
        setLoading(true);
        setError('');
        try {
            const resp = await login({ email: data.email, password: data.password });

            // Role match check based on the selected tab
            if (loginTab === 'adm' && resp.role !== 'admin') throw new Error('Not an admin account.');
            if (loginTab === 'fac' && resp.role !== 'faculty' && resp.role !== 'admin') throw new Error('Not a faculty account.');

            localStorage.setItem('token', resp.token);
            localStorage.setItem('user', JSON.stringify(resp));
            
            if (resp.role === 'admin') navigate('/admin/dashboard');
            else if (resp.role === 'faculty') navigate('/faculty/dashboard');
            else navigate('/student/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.ex-nav')) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div style={{ background: 'var(--s900)', color: 'rgba(255,255,255,.55)', minHeight: '100vh' }}>
            <style>
                {`
                :root{--s900:#060D1F;--s800:#0A1330;--in5:#4338CA;--in4:#6366F1;--in3:#818CF8;--cy5:#0891B2;--cy3:#22D3EE;--s200:#A8B8F0;--amber:#D97706;--green:#059669;--fd:'Outfit',sans-serif;--fb:'DM Sans',sans-serif;}
                .bg-mesh{position:fixed;inset:0;z-index:0;background:radial-gradient(ellipse at 15% 50%,rgba(67,56,202,.35) 0%,transparent 55%),radial-gradient(ellipse at 85% 25%,rgba(8,145,178,.18) 0%,transparent 50%),linear-gradient(160deg,#060D1F 0%,#080e22 100%);}
                .bg-grid{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);background-size:38px 38px;}
                .blob{position:fixed;border-radius:50%;filter:blur(90px);opacity:.15;animation:fl 12s ease-in-out infinite;}
                .b1{width:600px;height:600px;background:radial-gradient(circle,var(--in5),transparent);top:-150px;left:-150px;}
                .b2{width:400px;height:400px;background:radial-gradient(circle,var(--cy5),transparent);bottom:-80px;right:0;animation-delay:-6s;}
                .b3{width:300px;height:300px;background:radial-gradient(circle,var(--amber),transparent);top:40%;right:25%;animation-delay:-3s;opacity:.08;}
                @keyframes fl{0%,100%{transform:translateY(0);}50%{transform:translateY(-28px);}}
                .page{position:relative;z-index:1;min-height:100vh;}
                .ex-nav{background:rgba(6,13,31,.85);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.06);padding:18px 48px;position:sticky;top:0;z-index:100;}
                .lm{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--in5),var(--in4));box-shadow:0 4px 14px rgba(67,56,202,.4);}
                .ln{font-family:var(--fd);font-size:17px;font-weight:800;color:#fff;letter-spacing:-.03em;}
                .ln em{font-style:normal;color:var(--cy3);}
                .nl{padding:6px 14px;font-size:13px;font-weight:500;color:rgba(255,255,255,.4);border-radius:8px;cursor:pointer;transition:.18s;text-decoration:none;}
                .nl:hover{color:#fff;background:rgba(255,255,255,.07);}
                .nl.nla{color:#fff;font-weight:600;}
                .nbtn-g{padding:8px 18px;border-radius:9px;font-size:13px;font-weight:600;border:1.5px solid rgba(255,255,255,.12);color:rgba(255,255,255,.6);background:transparent;cursor:pointer;transition:.18s;}
                .nbtn-g:hover{border-color:rgba(255,255,255,.3);color:#fff;}
                .nbtn-p{padding:8px 20px;border-radius:9px;font-size:13px;font-weight:700;border:none;background:linear-gradient(135deg,var(--in5),var(--in4));color:#fff;cursor:pointer;transition:.18s;box-shadow:0 4px 14px rgba(67,56,202,.4);}
                .nbtn-p:hover{box-shadow:0 6px 20px rgba(67,56,202,.5);transform:translateY(-1px);}
                .eyebrow{display:inline-block;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:12px;font-weight:600;letter-spacing:.07em;padding:5px 14px;border-radius:99px;margin-bottom:24px;}
                .edot{width:7px;height:7px;border-radius:50%;background:var(--cy3);display:inline-block;vertical-align:middle;margin-right:6px;animation:blink 2s ease-in-out infinite;}
                @keyframes blink{0%,100%{opacity:1;}50%{opacity:.3;}}
                h1{font-family:var(--fd);font-size:62px;font-weight:800;line-height:1.04;letter-spacing:-.05em;color:#fff;margin-bottom:18px;}
                h1 .g1{background:linear-gradient(90deg,var(--s200),var(--in3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                h1 .g2{background:linear-gradient(90deg,var(--cy3),#86EFAC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                .hero-sub{font-size:16px;color:rgba(255,255,255,.45);line-height:1.75;margin:0 auto 40px;max-width:580px;}
                .vt-btn{padding:8px 22px;border-radius:99px;font-size:13px;font-weight:600;cursor:pointer;transition:.18s;border:1.5px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4);background:transparent;}
                .vt-btn.act{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.25);}
                .zcard{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);border-radius:18px;padding:26px 22px;cursor:pointer;transition:all .25s;text-decoration:none;display:block;position:relative;overflow:hidden;}
                .zcard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:18px 18px 0 0;}
                .zcard.za::before{background:linear-gradient(90deg,var(--amber),#FCD34D);}
                .zcard.zf::before{background:linear-gradient(90deg,var(--green),#34D399);}
                .zcard.zs::before{background:linear-gradient(90deg,var(--in5),var(--cy3));}
                .zcard:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.14);transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.3);}
                .zc-icon{width:48px;height:48px;border-radius:13px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:22px;}
                .zi-a{background:rgba(217,119,6,.15);} .zi-f{background:rgba(5,150,105,.15);} .zi-s{background:rgba(67,56,202,.18);}
                .zc-title{font-family:var(--fd);font-size:16px;font-weight:800;color:#fff;margin-bottom:7px;}
                .zc-desc{font-size:12px;color:rgba(255,255,255,.4);line-height:1.6;margin-bottom:14px;}
                .zc-cta{font-size:12px;font-weight:700;}
                .za .zc-cta{color:#FCD34D;} .zf .zc-cta{color:#6EE7B7;} .zs .zc-cta{color:var(--in3);}
                .sn{font-family:var(--fd);font-size:28px;font-weight:800;color:#fff;}
                .sn.c1{background:linear-gradient(135deg,var(--in4),var(--in3));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                .sn.c2{background:linear-gradient(135deg,var(--cy3),#86EFAC);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                .sn.c3{background:linear-gradient(135deg,var(--amber),#FCD34D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
                .sl{font-size:11px;color:rgba(255,255,255,.3);margin-top:3px;}
                .sep{width:1px;height:34px;background:rgba(255,255,255,.07);}
                .fchip{display:inline-block;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:99px;padding:6px 14px;font-size:12px;color:rgba(255,255,255,.4);margin:3px;}
                .ql-tabs{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:4px;}
                .ql-tab{padding:8px 6px;border-radius:9px;font-size:12px;font-weight:700;color:rgba(255,255,255,.35);border:none;background:transparent;cursor:pointer;transition:.18s;width:100%;}
                .ql-tab.act{background:rgba(255,255,255,.1);color:#fff;}
                .ql-tab.ta.act{background:rgba(217,119,6,.2);color:#FCD34D;}
                .ql-tab.tf.act{background:rgba(5,150,105,.18);color:#6EE7B7;}
                .ql-tab.ts.act{background:rgba(67,56,202,.25);color:var(--in3);}
                .ql-form{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:22px;display:none;}
                .ql-form.act{display:block;}
                .ll{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.4);margin-bottom:5px;letter-spacing:.03em;}
                .li{width:100%;padding:10px 13px;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.08);border-radius:99px;font-size:13px;color:#fff;margin-bottom:12px;transition:.18s;}
                .li:focus{outline:none;border-color:rgba(129,140,248,.5);background:rgba(255,255,255,.08);}
                .li::placeholder{color:rgba(255,255,255,.2);}
                .li option{background:#0F1C45;color:#fff;}
                .lb{width:100%;padding:11px;border-radius:99px;font-size:14px;font-weight:700;border:none;cursor:pointer;transition:.18s;color:#fff;font-family:var(--fd);}
                .lb.la{background:linear-gradient(135deg,var(--amber),#FBBF24);color:#060D1F;}
                .lb.lf{background:linear-gradient(135deg,var(--green),#34D399);color:#060D1F;}
                .lb.ls{background:linear-gradient(135deg,var(--in5),var(--in4));}
                .lfoot{text-align:center;margin-top:12px;font-size:12px;color:rgba(255,255,255,.3);}
                .lfoot a{color:var(--cy3);font-weight:600;cursor:pointer;}
                .ai-strip{background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);padding:28px 48px;}
                .ai-icon{font-size:28px;margin-bottom:8px;}
                .ai-title{font-family:var(--fd);font-size:13px;font-weight:700;color:#fff;margin-bottom:4px;}
                .ai-desc{font-size:11px;color:rgba(255,255,255,.35);line-height:1.6;}
                footer{border-top:1px solid rgba(255,255,255,.06);padding:16px 48px;}
                .fc{font-size:11px;color:rgba(255,255,255,.2);}
                .fl-lnk{font-size:11px;color:rgba(255,255,255,.2);cursor:pointer;transition:.15s;text-decoration:none;}
                .fl-lnk:hover{color:rgba(255,255,255,.6);}
                
                /* ── NAV MOBILE ── */
                .ex-nav-mob-btn{display:none;background:transparent;border:1.5px solid rgba(255,255,255,.15);border-radius:8px;width:38px;height:38px;cursor:pointer;color:rgba(255,255,255,.7);align-items:center;justify-content:center;flex-shrink:0;margin-left:auto;}
                .ex-nav-mob-menu{display:none;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(6,13,31,.97);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.07);padding:8px 0;z-index:99;}
                .ex-nav-mob-menu.open{display:flex;}
                .ex-nav-mob-menu .nl{padding:11px 24px;border-bottom:1px solid rgba(255,255,255,.05);border-radius:0;font-size:14px;display:block;}
                .ex-nav-mob-menu .nbtn-g,.ex-nav-mob-menu .nbtn-p{margin:8px 16px;display:block;text-align:center;}
                @media(max-width:991px){.ex-nav{padding:12px 20px !important;position:relative !important;}.ex-nav-links{display:none !important;}.ex-nav-right{display:none !important;}.ex-nav-mob-btn{display:flex !important;}}
                @media(max-width:576px){h1{font-size:32px;letter-spacing:-.03em;} .ex-nav{padding:12px 16px;} .ai-strip{padding:20px 16px;} footer{padding:16px;}}
                `}
            </style>
            <div className="bg-mesh"></div>
            <div className="bg-grid"></div>
            <div className="blob b1"></div>
            <div className="blob b2"></div>
            <div className="blob b3"></div>
            <div className="page">
                <nav className="ex-nav d-flex align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <div className="lm d-flex align-items-center justify-content-center">
                            <svg fill="none" height="18" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" width="18">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                            </svg>
                        </div>
                        <span className="ln">ExamControl <em>AI</em></span>
                    </div>
                    <div className="d-none d-md-flex align-items-center ms-4 gap-1 ex-nav-links">
                        <span className={`nl ${view === 'zones' ? 'nla' : ''}`} onClick={() => sv('zones')}>Home</span>
                        <span className={`nl ${view === 'login' ? 'nla' : ''}`} onClick={() => sv('login')}>Sign In</span>
                    </div>
                    <div className="ms-auto d-flex align-items-center gap-2 ex-nav-right">
                        <button className="nbtn-g" onClick={() => sv('login')}>Sign In</button>
                        <button className="nbtn-p" onClick={() => { sv('login'); st('std'); }}>Student Portal</button>
                    </div>


                    <button aria-label="Open menu" className="ex-nav-mob-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg fill="none" height="18" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18">
                            <line x1="3" x2="21" y1="6" y2="6"></line>
                            <line x1="3" x2="21" y1="12" y2="12"></line>
                            <line x1="3" x2="21" y1="18" y2="18"></line>
                        </svg>
                    </button>
                    <div className={`ex-nav-mob-menu ${isMenuOpen ? 'open' : ''}`}>
                        <span className="nl" onClick={() => { sv('zones'); setIsMenuOpen(false); }}>Home</span>
                        <span className="nl" onClick={() => { sv('login'); setIsMenuOpen(false); }}>Sign In</span>
                    </div>
                </nav>

                <main className="py-5 text-center">
                    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '0 24px' }}>
                        <div className="eyebrow"><span className="edot"></span> AI-Powered Examination System · Face Recognition Proctoring</div>
                        <h1>Secure Exams.<br /><span className="g1">AI-Verified.</span><br /><span className="g2">Zero Cheating.</span></h1>
                        <p className="hero-sub">A complete online examination management platform with real-time AI face recognition, live proctoring, automated grading, and comprehensive analytics — built for academic institutions.</p>
                        <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                            <button className={`vt-btn ${view === 'zones' ? 'act' : ''}`} onClick={() => sv('zones')}>Choose Your Zone</button>
                            <button className={`vt-btn ${view === 'login' ? 'act' : ''}`} onClick={() => sv('login')}>Quick Sign In</button>
                        </div>

                        {view === 'zones' && (
                            <div id="view-zones">
                                <div className="row g-3 mb-4" style={{ maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                                    <div className="col-12 col-md-4">
                                        <div className="zcard za" onClick={() => { sv('login'); st('adm'); }}>
                                            <div className="zc-icon zi-a">⚙️</div>
                                            <div className="zc-title">Admin Zone</div>
                                            <div className="zc-desc">Full institutional control — manage users, schedule exams, configure AI proctoring, monitor results and generate analytics reports.</div>
                                            <div className="zc-cta">Enter Admin Panel →</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="zcard zf" onClick={() => { sv('login'); st('fac'); }}>
                                            <div className="zc-icon zi-f">🎓</div>
                                            <div className="zc-title">Faculty Zone</div>
                                            <div className="zc-desc">Create and schedule exams, upload questions, monitor live attempts with AI proctoring alerts, grade and publish results.</div>
                                            <div className="zc-cta">Enter Faculty Portal →</div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <div className="zcard zs" onClick={() => { sv('login'); st('std'); }}>
                                            <div className="zc-icon zi-s">📋</div>
                                            <div className="zc-title">Student Zone</div>
                                            <div className="zc-desc">View upcoming exams, complete face authentication, attempt exams with timer, receive AI proctoring alerts, and view results.</div>
                                            <div className="zc-cta">Enter Student Portal →</div>
                                        </div>
                                    </div>

                                </div>

                                <div className="d-flex justify-content-center align-items-center gap-4 pb-4 flex-wrap">
                                    <div className="text-center"><div className="sn c1">2,840</div><div className="sl">Students</div></div>
                                    <div className="sep"></div>
                                    <div className="text-center"><div className="sn" style={{ color: '#fff' }}>86</div><div className="sl">Faculty</div></div>
                                    <div className="sep"></div>
                                    <div className="text-center"><div className="sn c2">142</div><div className="sl">Exams This Semester</div></div>
                                    <div className="sep"></div>
                                    <div className="text-center"><div className="sn c3">99.2%</div><div className="sl">Face Auth Accuracy</div></div>
                                    <div className="sep"></div>
                                    <div className="text-center"><div className="sn" style={{ color: '#fff' }}>74.8%</div><div className="sl">Overall Pass Rate</div></div>
                                </div>
                                <div className="pb-3">
                                    <span className="fchip">🔐 Face Recognition Auth</span>
                                    <span className="fchip">📷 Live AI Proctoring</span>
                                    <span className="fchip">⏱ Timed Exam Interface</span>
                                    <span className="fchip">🚨 Cheat Detection</span>
                                    <span className="fchip">📊 Auto-Grading</span>
                                    <span className="fchip">📈 Performance Analytics</span>
                                    <span className="fchip">📋 Question Bank</span>
                                    <span className="fchip">🔔 Real-time Alerts</span>
                                </div>
                            </div>
                        )}

                        {view === 'login' && (
                            <div id="view-login" style={{ maxWidth: '440px', margin: '0 auto' }}>
                                <div className="ql-tabs mb-2">
                                    <div className="row g-1">
                                        <div className="col-4"><button className={`ql-tab ta ${loginTab === 'adm' ? 'act' : ''}`} onClick={() => st('adm')}>⚙ Admin</button></div>
                                        <div className="col-4"><button className={`ql-tab tf ${loginTab === 'fac' ? 'act' : ''}`} onClick={() => st('fac')}>🎓 Faculty</button></div>
                                        <div className="col-4"><button className={`ql-tab ts ${loginTab === 'std' ? 'act' : ''}`} onClick={() => st('std')}>📋 Student</button></div>
                                    </div>
                                </div>
                                {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
                                
                                <form onSubmit={handleSubmit(onLoginSubmit)}>
                                    {loginTab === 'adm' && (
                                        <div className="ql-form act">
                                            <label className="ll">Admin Email</label>
                                            <input className={`li ${errors.email ? 'is-invalid' : ''}`} placeholder="admin@examcontrol.ai" {...register('email')} />
                                            {errors.email && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.email.message}</div>}
                                            <label className="ll">Password</label>
                                            <input className={`li ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" type="password" {...register('password')} />
                                            {errors.password && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.password.message}</div>}
                                            <button className="lb la" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In to Admin Panel →'}</button>
                                            <div className="lfoot">Restricted to authorised administrators only</div>
                                        </div>
                                    )}

                                    {loginTab === 'fac' && (
                                        <div className="ql-form act">
                                            <label className="ll">Faculty Email</label>
                                            <input className={`li ${errors.email ? 'is-invalid' : ''}`} placeholder="faculty@college.edu" {...register('email')} />
                                            {errors.email && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.email.message}</div>}
                                            <label className="ll">Password</label>
                                            <input className={`li ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" type="password" {...register('password')} />
                                            {errors.password && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.password.message}</div>}
                                            <button className="lb lf" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In to Faculty Portal →'}</button>
                                            <div className="lfoot">Need access? Contact your department admin</div>
                                        </div>
                                    )}

                                    {loginTab === 'std' && (
                                        <div className="ql-form act">
                                            <label className="ll">Student Email / Roll No.</label>
                                            <input className={`li ${errors.email ? 'is-invalid' : ''}`} placeholder="CS2021001 or rahul@college.edu" {...register('email')} />
                                            {errors.email && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.email.message}</div>}
                                            <label className="ll">Password</label>
                                            <input className={`li ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" type="password" {...register('password')} />
                                            {errors.password && <div style={{ color: '#ff6b6b', fontSize: '11px', marginTop: '-10px', marginBottom: '10px' }}>{errors.password.message}</div>}
                                            <button className="lb ls" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In to Student Portal →'}</button>
                                            <div className="lfoot">New student? <Link to="/student/register">Enroll your Identity here →</Link></div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}

                    </div>
                </main>

                <div className="ai-strip">
                    <div className="row g-4 text-center" style={{ maxWidth: '960px', margin: '0 auto' }}>
                        <div className="col-6 col-md-3"><div className="ai-icon">🔐</div><div className="ai-title">Face Authentication</div><div className="ai-desc">Webcam-based identity verification before exam entry. 99.2% accuracy with landmark mapping.</div></div>
                        <div className="col-6 col-md-3"><div className="ai-icon">👁</div><div className="ai-title">Live Monitoring</div><div className="ai-desc">Periodic face captures during exam. Detects face absence, multiple faces, and identity switches.</div></div>
                        <div className="col-6 col-md-3"><div className="ai-icon">🚨</div><div className="ai-title">Cheat Detection</div><div className="ai-desc">Monitors tab switching, screen minimization, multiple faces, and no-face scenarios in real-time.</div></div>
                        <div className="col-6 col-md-3"><div className="ai-icon">📋</div><div className="ai-title">Proctoring Report</div><div className="ai-desc">Generates post-exam violation log with timestamps. Accessible by admin and faculty for review.</div></div>
                    </div>
                </div>

                <footer>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span className="fc">© 2026 ExamControl AI · Online Examination Control System with AI Proctoring · Final Year Project</span>
                        <div className="d-flex gap-3">
                            <span className="fl-lnk" onClick={() => sv('login')}>Sign In</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
