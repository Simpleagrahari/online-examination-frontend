import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { register } from '../../api';
import { toast } from 'react-toastify';

/* ── Validation Schema ── */
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid institutional email').required('Email is required'),
  college: yup.string().required('Institution name is required'),
  dept: yup.string().required('Department is required'),
  rollNo: yup.string().required('Roll/Enrollment No is required'),
  year: yup.string().required('Year of study is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
  agreed: yup.boolean().oneOf([true], 'Biometric consent is mandatory')
});

/* ── Step indicator ── */
const StepTrack = ({ current }) => {
  const steps = ['Identity', 'Academic', 'Security', 'Finish'];
  return (
    <div className="d-flex justify-content-between mb-5 position-relative px-1">
      <div className="position-absolute top-50 start-0 end-0 translate-middle-y bg-light" style={{ height: '3px', zIndex: 0 }}></div>
      {steps.map((lbl, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={n} className="text-center position-relative" style={{ zIndex: 1, width: '60px' }}>
            <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm transition ${done ? 'bg-indigo text-white border-indigo' : active ? 'bg-white border-3 border-indigo text-indigo scale-up' : 'bg-white text-muted border border-light'}`} 
                 style={{ width: '36px', height: '36px', fontSize: '13px', fontWeight: 800 }}>
              {done ? '✓' : n}
            </div>
            <div className="small text-uppercase ls-1" style={{ fontSize: '9px', fontWeight: 800, color: active ? 'var(--indigo)' : '#adb5bd' }}>{lbl}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Left Side Branding ── */
const Branding = () => (
  <div className="bg-indigo p-5 text-white d-flex flex-column justify-content-center h-100 position-relative animate-bg overflow-hidden">
    <div className="branding-mesh position-absolute top-0 start-0 w-100 h-100 opacity-20"></div>
    <div className="mb-5 animate__animated animate__fadeInDown text-center text-lg-start">
      <div className="glass-ic rounded-4 p-3 d-inline-flex border border-white border-opacity-25 shadow">
        <svg fill="none" height="32" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24" width="32">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      </div>
    </div>
    <h2 className="display-6 fw-black mb-3 lh-1 animate__animated animate__fadeInLeft">ExamControl <span className="text-indigo-light text-opacity-75">AI</span></h2>
    <p className="text-white text-opacity-75 mb-5 fs-6 fw-light animate__animated animate__fadeInUp">Next-Generation Biometric Examination Registry for Institutional Integrity.</p>
    
    <div className="vstack gap-3 mt-4">
      {[
        { ic: '👤', t: 'Identity Enrollment', d: 'Secure permanent Face ID registration.' },
        { ic: '📋', t: 'Verified Access', d: 'Institutional validation through Roll No.' },
        { ic: '🛡️', t: 'Anti-Fraud System', d: 'Self-sovereign biometric consent.' }
      ].map((f, i) => (
        <div key={i} className="glass-card d-flex align-items-center gap-3 p-3 rounded-4 animate__animated animate__fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
          <span className="fs-4">{f.ic}</span>
          <div>
            <div className="fw-bold extra-small text-white ls-1" style={{fontSize:'11px'}}>{f.t}</div>
            <div className="text-white text-opacity-50 mt-1" style={{ fontSize: '10px' }}>{f.d}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StudentRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const { register: reg, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur'
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  };

  /* Validate and move to next step */
  const nextStep = async (fields) => {
    const isStepValid = await trigger(fields);
    if (isStepValid) {
        if (step === 1 && !photoFile) {
            toast.warning("Biometric Capture Required to Proceed!");
            return;
        }
        setStep(step + 1);
    } else {
        toast.error("Please fill all required fields correctly.");
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', `${data.firstName} ${data.lastName}`);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('rollNo', data.rollNo);
      formData.append('dept', data.dept);
      formData.append('year', data.year);
      formData.append('role', 'student');
      formData.append('image', photoFile);

      const resp = await register(formData);
      localStorage.setItem('token', resp.token);
      localStorage.setItem('user', JSON.stringify(resp));
      setSuccess(true);
      toast.success("Identity Enrolled Successfully!");
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-soft-light d-flex flex-column font-outfit overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&display=swap');
        :root { --indigo: #4338ca; --indigo-light: #818cf8; --bg-indigo: linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%); }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .bg-indigo { background: var(--bg-indigo); }
        .text-indigo { color: var(--indigo); }
        .text-indigo-light { color: var(--indigo-light); }
        .border-indigo { border-color: var(--indigo) !important; }
        .bg-soft-light { background: #f8fafc; }
        .ls-1 { letter-spacing: 0.05rem; }
        .fw-black { font-weight: 900; }
        .glass-ic { background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); }
        .glass-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); transition: all 0.3s; }
        .glass-card:hover { background: rgba(255,255,255,0.15); transform: translateX(8px); }
        
        .enroll-btn { 
          background: linear-gradient(90deg, var(--indigo), #6366f1);
          color: white; border: none;
          padding: 14px 28px;
          height: auto;
          box-shadow: 0 4px 15px rgba(67, 56, 202, 0.35);
          transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .enroll-btn:hover:not(:disabled) { 
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 25px rgba(67, 56, 202, 0.45);
          color: white;
        }
        .enroll-btn:active { transform: translateY(0) scale(1.01); }
        .enroll-btn:disabled { opacity: 0.8; background: #94a3b8; box-shadow: none; }
        
        .form-control-premium { 
          padding: 12px 16px;
          border-radius: 12px; 
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 14px;
          transition: all 0.2s;
        }
        .form-control-premium:focus { 
          border-color: var(--indigo-light);
          box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.06);
          outline: none;
        }
        .invalid-feedback { font-weight: 600; font-size: 11px; margin-top: 5px; }
        .extra-small { font-size: 11px; }
        .scale-up { transform: scale(1.15); }
        @media (max-width: 991px) { .branding-pane { display: none; } }
      `}</style>

      {/* Top Navbar */}
      <div className="bg-white border-bottom py-3 px-4 d-flex align-items-center shadow-sm position-relative" style={{zIndex:10}}>
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
          <div className="bg-indigo rounded-3 p-1 shadow-sm d-flex align-items-center justify-content-center" style={{width:30, height:30}}>
            <svg fill="none" height="18" stroke="white" strokeWidth="3" viewBox="0 0 24 24" width="18"><path d="M12 2L2 7l10 5 10-5-10-5z"></path></svg>
          </div>
          <span className="fw-black text-uppercase ls-1 small mb-0">ExamControl AI</span>
        </Link>
        <div className="ms-auto"><span className="badge rounded-pill bg-indigo bg-opacity-10 text-indigo fw-bold px-3 py-2 border border-indigo border-opacity-10">BIMOETRIC ENROLLMENT</span></div>
      </div>

      <div className="row g-0 flex-grow-1">
        <div className="col-lg-5 branding-pane h-100">
          <Branding />
        </div>
        
        <div className="col-lg-7 d-flex align-items-center justify-content-center p-3 p-md-5 bg-white">
          <div className="w-100 animate__animated animate__fadeIn" style={{ maxWidth: '520px' }}>
            
            {!success ? (
              <div className="p-2">
                <div className="text-center mb-5">
                    <h2 className="fw-black text-dark mb-1">Student Registry</h2>
                    <p className="text-muted small ls-1 text-uppercase fw-bold opacity-50">Identity Setup • Step {step}/4</p>
                </div>

                <StepTrack current={step} />

                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* 📸 STEP 1: IDENTITY */}
                    {step === 1 && (
                      <div className="animate__animated animate__fadeInRight">
                        <div className="text-center mb-5">
                          <label className="d-inline-block cursor-pointer position-relative">
                            <div className={`rounded-circle border border-4 p-1 transition ${photo ? 'border-success' : 'border-indigo shadow-lg'}`} 
                                 style={{ width: '120px', height: '120px', background: '#f1f5f9', overflow:'hidden' }}>
                              {photo ? <img src={photo} className="w-100 h-100 object-fit-cover rounded-circle animate__animated animate__pulse" alt="Face" /> : <div className="w-100 h-100 d-flex align-items-center justify-content-center fs-1 opacity-20">👤</div>}
                            </div>
                            <div className="position-absolute bottom-0 end-0 bg-indigo text-white rounded-circle shadow-lg d-flex align-items-center justify-content-center border border-white border-4" style={{ width:'38px', height:'38px' }}>
                              <svg fill="none" height="18" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" width="18"><path d="M12 4v16m8-8H4"></path></svg>
                            </div>
                            <input type="file" className="d-none" accept="image/*" onChange={handlePhoto} />
                          </label>
                          <div className="mt-3 fw-black text-dark text-uppercase ls-1 h6 mb-1">Capture Master Face ID</div>
                          <div className="text-muted small fw-bold opacity-50">IDENTITY VERIFICATION PHOTO</div>
                        </div>

                        <div className="row g-3 mb-4">
                          <div className="col-md-6 text-start">
                            <label className="form-label small fw-black text-muted ls-1">FIRST NAME</label>
                            <input {...reg('firstName')} className={`form-control-premium w-100 ${errors.firstName ? 'is-invalid' : ''}`} placeholder="Rahul" />
                            <div className="invalid-feedback">{errors.firstName?.message}</div>
                          </div>
                          <div className="col-md-6 text-start">
                            <label className="form-label small fw-black text-muted ls-1">LAST NAME</label>
                            <input {...reg('lastName')} className={`form-control-premium w-100 ${errors.lastName ? 'is-invalid' : ''}`} placeholder="Kumar" />
                            <div className="invalid-feedback">{errors.lastName?.message}</div>
                          </div>
                        </div>

                        <div className="mb-5 text-start">
                          <label className="form-label small fw-black text-muted ls-1">INSTITUTIONAL EMAIL</label>
                          <input {...reg('email')} className={`form-control-premium w-100 ${errors.email ? 'is-invalid' : ''}`} placeholder="rahul@college.edu" />
                          <div className="invalid-feedback">{errors.email?.message}</div>
                        </div>

                        <button type="button" className="btn enroll-btn w-100 fw-bold rounded-4 shadow-lg text-uppercase ls-1" onClick={()=>nextStep(['firstName', 'lastName', 'email'])}>
                          ENTER ACADEMIC ZONE 
                        </button>
                      </div>
                    )}

                    {/* 🎓 STEP 2: ACADEMIC */}
                    {step === 2 && (
                      <div className="animate__animated animate__fadeInRight">
                        <div className="mb-4 text-start">
                          <label className="form-label small fw-black text-muted ls-1 text-uppercase">INSTITUTION NAME</label>
                          <input {...reg('college')} className={`form-control-premium w-100 ${errors.college ? 'is-invalid' : ''}`} placeholder="University Name" />
                          <div className="invalid-feedback">{errors.college?.message}</div>
                        </div>
                        
                        <div className="mb-4 text-start">
                          <label className="form-label small fw-black text-muted ls-1 text-uppercase">DEPARTMENT</label>
                          <select {...reg('dept')} className={`form-select form-control-premium w-100 ${errors.dept ? 'is-invalid' : ''}`}>
                            <option value="">Choose Dept</option>
                            <option>Computer Science</option>
                            <option>Electronics</option>
                            <option>Information Technology</option>
                            <option>Mathematics</option>
                          </select>
                          <div className="invalid-feedback">{errors.dept?.message}</div>
                        </div>

                        <div className="row g-3 mb-5">
                          <div className="col-md-6 text-start">
                            <label className="form-label small fw-black text-muted ls-1 text-uppercase">ROLL NUMBER</label>
                            <input {...reg('rollNo')} className={`form-control-premium w-100 ${errors.rollNo ? 'is-invalid' : ''}`} placeholder="CS25-101" />
                            <div className="invalid-feedback">{errors.rollNo?.message}</div>
                          </div>
                          <div className="col-md-6 text-start">
                            <label className="form-label small fw-black text-muted ls-1 text-uppercase">STUDY YEAR</label>
                            <select {...reg('year')} className={`form-select form-control-premium w-100 ${errors.year ? 'is-invalid' : ''}`}>
                              <option value="">Select Year</option>
                              <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option>
                            </select>
                            <div className="invalid-feedback">{errors.year?.message}</div>
                          </div>
                        </div>

                        <div className="d-flex gap-3">
                          <button type="button" className="btn btn-light flex-grow-1 fw-bold rounded-4 border px-4" onClick={()=>setStep(1)}>BACK</button>
                          <button type="button" className="btn enroll-btn flex-grow-1 fw-bold rounded-4 text-uppercase ls-1" onClick={()=>nextStep(['college', 'dept', 'rollNo', 'year'])}>NEXT STEP</button>
                        </div>
                      </div>
                    )}

                    {/* 🛡️ STEP 3: SECURITY */}
                    {step === 3 && (
                      <div className="animate__animated animate__fadeInRight">
                        <div className="mb-4 text-start">
                          <label className="form-label small fw-black text-muted ls-1 text-uppercase">CHOOSE PASSWORD</label>
                          <input {...reg('password')} type="password" className={`form-control-premium w-100 ${errors.password ? 'is-invalid' : ''}`} placeholder="Min 8 characters" />
                          <div className="invalid-feedback">{errors.password?.message}</div>
                        </div>

                        <div className="mb-5 text-start">
                          <label className="form-label small fw-black text-muted ls-1 text-uppercase">CONFIRM PASSWORD</label>
                          <input {...reg('confirm')} type="password" className={`form-control-premium w-100 ${errors.confirm ? 'is-invalid' : ''}`} placeholder="Repeat password" />
                          <div className="invalid-feedback">{errors.confirm?.message}</div>
                        </div>

                        <div className="mb-5 p-4 rounded-4 bg-light border border-opacity-50 text-start shadow-sm position-relative">
                          <div className="form-check d-flex gap-2">
                            <input {...reg('agreed')} className="form-check-input" type="checkbox" style={{width:20, height:20, marginTop:0}} />
                            <label className="form-check-label ps-1 small text-dark fw-bold pe-4" style={{lineHeight:1.3}}>
                              I consent to AI-based Face Authentication and live proctoring for safe examination.
                            </label>
                          </div>
                          {errors.agreed && <div className="text-danger mt-2 fw-black extra-small text-uppercase ls-1">Consent is Mandatory!</div>}
                        </div>

                        <div className="d-flex gap-3">
                          <button type="button" className="btn btn-light flex-grow-1 fw-bold rounded-4 border px-4" onClick={()=>setStep(2)}>BACK</button>
                          <button type="button" className="btn enroll-btn flex-grow-1 fw-bold rounded-4 text-uppercase ls-1" onClick={()=>nextStep(['password', 'confirm', 'agreed'])}>REVIEW PROFILE</button>
                        </div>
                      </div>
                    )}

                    {/* ✨ STEP 4: CONFIRM */}
                    {step === 4 && (
                      <div className="animate__animated animate__fadeInRight text-center">
                        <div className="card bg-white border rounded-4 p-4 mb-5 shadow-sm text-start border-indigo border-opacity-10">
                          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                            <img src={photo || 'https://via.placeholder.com/150'} className="rounded-circle border border-white border-4 shadow-sm" width="60" height="60" style={{objectFit:'cover'}} />
                            <div>
                              <div className="fw-black h6 text-dark mb-0 text-uppercase ls-1">Biometric Registered</div>
                              <div className="text-success small fw-bold">ID PHOTO QUEUED</div>
                            </div>
                          </div>
                          <p className="extra-small text-muted mb-0 fw-bold opacity-75">All academic records and security keys have been set up. Confirm below to complete your institutional student enrollment.</p>
                        </div>

                        <div className="d-flex gap-3">
                          <button type="button" className="btn btn-light flex-grow-1 fw-bold rounded-4 border px-4" onClick={()=>setStep(3)}>BACK</button>
                          <button type="submit" className="btn enroll-btn flex-grow-1 fw-bold rounded-4 shadow-lg text-uppercase ls-1 py-1" disabled={submitting}>
                            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : 'CONFIRM ENROLLMENT ✨'}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>

                  <div className="mt-5 text-center px-4">
                    <p className="text-muted small fw-bold">Already part of our institution? <Link to="/student/login" className="text-indigo fw-black text-decoration-none">SIGN IN HERE</Link></p>
                  </div>
              </div>
            ) : (
              <div className="text-center card border-0 shadow-lg rounded-5 p-5 animate__animated animate__zoomIn">
                <div className="bg-success text-white d-inline-flex p-4 rounded-circle mb-4 mx-auto shadow-lg">
                  <svg fill="currentColor" height="72" viewBox="0 0 24 24" width="72"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                </div>
                <h2 className="fw-black text-dark mb-2">Enrollment Success!</h2>
                <p className="text-muted mb-5 ls-1 small fw-bold text-uppercase opacity-75">Your Profile & Biometric ID are now Live.</p>
                <Link to="/student/dashboard" className="btn enroll-btn btn-lg w-100 py-3 fw-black rounded-4 shadow-lg ls-1">ACCESS PORTAL →</Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
