import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getExamById, submitExam, getExamQuestions } from '../../api';
import { toast } from 'react-toastify';

const StudentExam = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const examId = searchParams.get('id');
    const videoRef = useRef(null);

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({}); 
    const [timeLeft, setTimeLeft] = useState(600); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isRulesAccepted, setIsRulesAccepted] = useState(false); 

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!examId) throw new Error('Exam Session Not Found');
                
                const [data, qData] = await Promise.all([
                    getExamById(examId, token),
                    getExamQuestions(examId, token)
                ]);
                
                setExam(data);

                // USER REQUIREMENT: 10 Standard Questions Baseline
                if (!qData || qData.length === 0) {
                    const baselineQs = [
                        { _id: 'd1', text: 'Which storage device has the fastest data access speed?', options: ['Solid State Drive (SSD)', 'Hard Disk Drive (HDD)', 'Optical Disk', 'Memory Card'], marks: 2, type: 'MCQ' },
                        { _id: 'd2', text: 'In web development, what does the "C" in CSS stand for?', options: ['Creative', 'Cascading', 'Central', 'Complex'], marks: 2, type: 'MCQ' },
                        { _id: 'd3', text: 'What is the binary representation of decimal number 10?', options: ['1001', '1011', '1010', '1100'], marks: 2, type: 'MCQ' },
                        { _id: 'd4', text: 'Which protocol is used for secure communication over a network?', options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'], marks: 2, type: 'MCQ' },
                        { _id: 'd5', text: 'What is the default port number for HTTP?', options: ['443', '21', '25', '80'], marks: 2, type: 'MCQ' },
                        { _id: 'd6', text: 'Which language is known as the "Mother of all languages"?', options: ['Java', 'C Language', 'Python', 'Fortran'], marks: 2, type: 'MCQ' },
                        { _id: 'd7', text: 'What does RAM stand for in a computer system?', options: ['Random Access Memory', 'Ready Active Module', 'Rapid Access Memory', 'Read Only Memory'], marks: 2, type: 'MCQ' },
                        { _id: 'd8', text: 'Which symbol is used for comments in Python?', options: ['//', '/* */', '#', '<!-- -->'], marks: 2, type: 'MCQ' },
                        { _id: 'd9', text: 'What is the primary function of an Operating System?', options: ['Running Games', 'Resource Management', 'Internet Browsing', 'Word Processing'], marks: 2, type: 'MCQ' },
                        { _id: 'd10', text: 'Which logic gate output is 1 only when all inputs are 1?', options: ['OR Gate', 'AND Gate', 'NOT Gate', 'NAND Gate'], marks: 2, type: 'MCQ' }
                    ];
                    setQuestions(baselineQs);
                } else {
                    setQuestions(qData);
                }
                
                setTimeLeft((data.duration || 10) * 60); 
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchExamData();
    }, [examId]);

    useEffect(() => {
        if (loading || timeLeft <= 0 || !isRulesAccepted) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitProcess(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, timeLeft, isRulesAccepted]);

    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) { console.error('Enforcement Error: Cam Blocked'); }
        };
        if (!loading && isRulesAccepted) startCamera();
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
    }, [loading, isRulesAccepted]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (qId, optIdx) => {
        setAnswers(prev => ({ ...prev, [qId]: optIdx }));
    };

    const submitProcess = async (isAuto = false) => {
        if (!isAuto && !window.confirm('Are you sure you want to finalize submission?')) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const submissionData = questions.map(q => ({
                questionId: q._id,
                selectedOption: answers[q._id] !== undefined ? answers[q._id] : null
            }));
            await submitExam(examId, submissionData, token);
            navigate('/student/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#0a0e1b', color: '#fff' }}>Entering Secured Assessment Zone...</div>;
    if (error) return <div style={{ display: 'grid', placeItems: 'center', height: '100vh', background: '#0a0e1b', color: '#fff' }}>Access Denied: {error} <Link to="/student/dashboard" style={{ color: 'var(--cy3)' }}>Back</Link></div>;

    if (!isRulesAccepted) {
        return (
            <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div className="card shadow-lg border-0" style={{ maxWidth: '650px', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ padding: '40px', background: 'linear-gradient(135deg, var(--s900), #1e293b)', color: '#fff' }}>
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center', fontSize: '30px' }}>📘</div>
                            <div>
                                <h3 className="mb-1" style={{ fontWeight: '800', fontFamily: 'var(--fd)' }}>{exam?.name || 'Examination Session'}</h3>
                                <p className="mb-0" style={{ opacity: 0.7, fontSize: '14px' }}>Secured Institutional Assessment Profile</p>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-4">
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Duration</div>
                                    <div style={{ fontWeight: '700' }}>{exam?.duration || 10} Mins</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Total Questions</div>
                                    <div style={{ fontWeight: '700' }}>{questions.length}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.6 }}>Total Marks</div>
                                    <div style={{ fontWeight: '700' }}>{exam?.totalMarks || 20}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '40px', background: '#fff' }}>
                        <h5 className="mb-3" style={{ fontWeight: '700', color: 'var(--g900)' }}>📜 Institutional Rules & Guidelines</h5>
                        <ul className="list-unstyled d-flex flex-column gap-3 mb-5" style={{ fontSize: '14px', color: 'var(--g600)' }}>
                            <li className="d-flex gap-3"><span style={{ color: 'var(--std)', fontWeight: '700' }}>01.</span><div>Continuous **Live Proctoring** via Webcam is active.</div></li>
                            <li className="d-flex gap-3"><span style={{ color: 'var(--std)', fontWeight: '700' }}>02.</span><div>The portal will **Auto-Submit** exactly when the timer expires.</div></li>
                            <li className="d-flex gap-3"><span style={{ color: 'var(--std)', fontWeight: '700' }}>03.</span><div>Ensure your environment is well-lit for biometric monitoring.</div></li>
                        </ul>
                        <div className="d-grid">
                            <button className="btn btn-indigo btn-lg py-3 shadow-none" 
                                    style={{ background: 'var(--s900)', color: '#fff', borderRadius: '16px', fontWeight: '800' }}
                                    onClick={() => setIsRulesAccepted(true)}>
                                Proceed to Final Exam →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQIndex];

    return (
        <div style={{ background: '#f0f3f9', minHeight: '100vh', position: 'fixed', inset: 0, zIndex: 1000, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <style>
                {`
                .exam-top-bar { background: var(--s900); color: #fff; padding: 12px 20px; display: grid; grid-template-columns: 1fr auto; align-items: center; border-bottom: 1px solid rgba(255,255,255,.08); }
                .exam-wrap2 { display: grid; grid-template-columns: 1fr 280px; flex: 1; overflow: hidden; }
                .exam-q-area { flex: 1; overflow-y: auto; padding: 18px 22px; }
                .exam-sidebar-area { width: 280px; flex-shrink: 0; background: #fff; border-left: 1px solid var(--g200); overflow-y: auto; }
                .esb-block { padding: 14px 16px; border-bottom: 1px solid var(--g100); }
                .esb-title { font-family: var(--fd); font-size: 12px; font-weight: 700; color: var(--g900); letter-spacing: .02em; margin-bottom: 10px; }
                .mini-cam { background: var(--s900); border-radius: var(--r); overflow: hidden; }
                .mc-feed { height: 160px; background: #000; position: relative; }
                .mc-scanline { position: absolute; left: 0; right: 0; height: 1.5px; background: linear-gradient(90deg, transparent, var(--cy3), transparent); animation: scan 2.5s ease-in-out infinite; opacity: .5; z-index: 5; }
                @keyframes scan { 0% { top: 20%; } 50% { top: 80%; } 100% { top: 20%; } }
                .mc-status { position: absolute; bottom: 4px; left: 6px; font-size: 9px; font-weight: 700; color: var(--cy3); z-index: 5; }
                .qn-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; }
                .qn-b { height: 28px; border-radius: 5px; border: 1.5px solid var(--g200); background: #fff; font-size: 10px; font-weight: 700; color: var(--g500); cursor: pointer; display: grid; place-items: center; }
                .qn-b.answered { background: var(--in5) !important; color: #fff !important; border-color: var(--in5) !important; }
                .qn-b.current { border: 2.5px solid var(--in5); color: var(--in5); font-weight: 800; transform: scale(1.1); box-shadow: 0 0 10px rgba(79, 70, 229, 0.2); }
                .q-opt { padding: 12px 15px; border: 1.5px solid var(--g200); border-radius: 10px; background: #fff; cursor: pointer; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; transition: all 0.2s ease; }
                .q-opt.selected { border-color: var(--in5) !important; background: var(--in1) !important; }
                .q-opt:hover { border-color: var(--in3); background: var(--g50); }
                .q-number { font-size: 13px; font-weight: 700; color: var(--in5); }
                `}
            </style>

            <div className="exam-top-bar">
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex flex-column">
                        <div style={{ fontFamily: 'var(--fd)', fontSize: '14px', fontWeight: '700' }}>{exam?.name || 'Examination Session'}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)' }}>{questions.length} Questions · {exam?.totalMarks || 20} Marks</div>
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ textAlign: 'right', marginRight: '10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)' }}>Time Remaining</div>
                        <div style={{ fontSize: '28px', lineHeight: 1, fontFamily: 'var(--fm)' }}>{formatTime(timeLeft)}</div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => submitProcess(false)} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                    <Link className="btn btn-secondary btn-sm" to="/student/dashboard">← Exit</Link>
                </div>
            </div>

            <div className="exam-wrap2">
                <div className="exam-q-area">
                    <div className="card shadow-sm border-0 p-4" style={{ borderRadius: '15px' }}>
                        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                            <span className="q-number">Question {currentQIndex + 1} of {questions.length} · {currentQ?.type || 'MCQ'}</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-outline-secondary btn-xs">🚩 Flag</button>
                                <span className="badge bg-light text-dark">{currentQ?.marks} Marks</span>
                            </div>
                        </div>
                        <div className="q-text mb-4" style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', lineHeight: '1.6' }}>{currentQ?.text}</div>
                        <div className="q-options d-flex flex-column">
                            {currentQ?.options?.map((opt, i) => {
                                const isSelected = answers[currentQ._id] === i;
                                return (
                                    <div key={i} className={`q-opt ${isSelected ? 'selected' : ''}`} 
                                        onClick={() => handleOptionSelect(currentQ._id, i)}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: isSelected ? 'var(--in5)' : 'var(--g100)', color: isSelected ? '#fff' : 'var(--g500)', display: 'grid', placeItems: 'center', fontWeight: '700', fontSize: '12px' }}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <div style={{ fontSize: '14px', color: isSelected ? 'var(--in5)' : 'var(--g700)', fontWeight: isSelected ? '600' : '400' }}>{opt}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button className="btn btn-secondary px-4 fw-bold shadow-none" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex(prev => prev - 1)}>← Previous</button>
                        <span style={{ fontSize: '13px', color: 'var(--g400)', fontWeight: '600' }}>{currentQIndex + 1} of {questions.length}</span>
                        <button className="btn btn-primary px-4 fw-bold shadow-none" style={{ background: 'var(--in5)' }} disabled={currentQIndex === questions.length - 1} onClick={() => setCurrentQIndex(prev => prev + 1)}>Next Question →</button>
                    </div>
                </div>

                <aside className="exam-sidebar-area">
                    <div className="esb-block">
                        <div className="esb-title">📷 Live Proctoring</div>
                        <div className="mini-cam">
                            <div className="mc-feed">
                                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="mc-scanline"></div>
                                <div className="mc-status">✓ Identity Active</div>
                            </div>
                        </div>
                    </div>

                    <div className="esb-block">
                        <div className="esb-title">⏱ Time Status</div>
                        <div style={{ background: 'linear-gradient(135deg, var(--s800), var(--s600))', borderRadius: 'var(--r)', padding: '14px', textAlign: 'center', color: '#fff' }}>
                            <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--fm)' }}>{formatTime(timeLeft)}</div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)', marginTop: '2px' }}>Remaining of {formatTime(exam?.duration * 60 || 600)}</div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', marginTop: '10px' }}>
                                <div style={{ width: `${(timeLeft / (exam?.duration * 60 || 600)) * 100}%`, height: '100%', background: 'var(--cy3)', borderRadius: '99px', transition: 'width 1s linear' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="esb-block">
                        <div className="esb-title">Question Navigator</div>
                        <div className="qn-grid">
                            {questions.map((q, i) => (
                                <div key={q._id} className={`qn-b ${answers[q._id] !== undefined ? 'answered' : ''} ${currentQIndex === i ? 'current' : ''}`} onClick={() => setCurrentQIndex(i)}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default StudentExam;
