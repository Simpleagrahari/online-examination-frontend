import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getSubjects, createExam } from '../../api';
import { toast } from 'react-toastify';

const FacultyCreateExam = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        subjectId: '',
        date: '',
        time: '',
        duration: 180,
        totalMarks: 100,
        passMarks: 40,
        type: 'Mid-term Exam',
        status: 'scheduled'
    });

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const data = await getSubjects(token);
                setSubjects(data);
                if (data.length > 0) setForm(prev => ({ ...prev, subjectId: data[0]._id }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (status = 'scheduled') => {
        if (!form.title || !form.subjectId || !form.date || !form.time) {
            toast.warning('Please fill all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const token = sessionStorage.getItem('token');
            await createExam({ ...form, status }, token);
            toast.success(`Exam ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
            navigate('/faculty/dashboard');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <FacultyLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading environment...</div> </FacultyLayout>;

    return (
        <FacultyLayout pageTitle="Create Exam">
            <div className="pg-intro">
                <h2>Create Exam</h2>
                <p>Set up a new examination with AI proctoring</p>
            </div>
            
            <div className="row g-3 mb-3">
                <div className="col-lg-8">
                    <div className="card" style={{ marginBottom: '14px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between">
                            <span className="cd-t">Exam Details</span>
                        </div>
                        <div className="fg">
                            <label className="fl req">Exam Title</label>
                            <input className="fi" placeholder="Enter exam title..." name="title" value={form.title} onChange={handleChange} />
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6 fg">
                                <label className="fl req">Subject</label>
                                <select className="fi" name="subjectId" value={form.subjectId} onChange={handleChange}>
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 fg">
                                <label className="fl req">Exam Type</label>
                                <select className="fi" name="type" value={form.type} onChange={handleChange}>
                                    <option value="Mid-term Exam">Mid-term Exam</option>
                                    <option value="Final Exam">Final Exam</option>
                                    <option value="Unit Test">Unit Test</option>
                                    <option value="Quiz">Quiz</option>
                                    <option value="Practical">Practical</option>
                                </select>
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6 fg">
                                <label className="fl req">Exam Date</label>
                                <input className="fi" type="date" name="date" value={form.date} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 fg">
                                <label className="fl req">Start Time</label>
                                <input className="fi" type="time" name="time" value={form.time} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6 fg">
                                <label className="fl req">Duration (minutes)</label>
                                <input className="fi" type="number" name="duration" value={form.duration} onChange={handleChange} />
                            </div>
                            <div className="col-md-6 fg">
                                <label className="fl req">Total Marks</label>
                                <input className="fi" type="number" name="totalMarks" value={form.totalMarks} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6 fg">
                                <label className="fl req">Pass Marks</label>
                                <input className="fi" type="number" name="passMarks" value={form.passMarks} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: '14px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between">
                            <span className="cd-t">AI Proctoring Settings</span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {[
                                'Face Authentication (Pre-exam)', 
                                'Live Face Monitoring', 
                                'Tab Switch Detection', 
                                'Multiple Face Alert'
                            ].map(lbl => (
                                <div key={lbl} className="d-flex justify-content-between align-items-center" style={{ padding: '10px', background: 'var(--g50)', borderRadius: 'var(--r)' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--g900)' }}>{lbl}</span>
                                    <input defaultChecked style={{ accentColor: 'var(--in5)', width: '16px', height: '16px' }} type="checkbox" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="d-flex gap-2 mt-3">
                            <button className="btn btn-n" onClick={() => handleSave('draft')} disabled={submitting}>Save as Draft</button>
                            <button className="btn btn-c" onClick={() => handleSave('scheduled')} disabled={submitting}>
                                {submitting ? 'Publishing...' : 'Publish Exam'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card" style={{ height: 'fit-content' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between">
                            <span className="cd-t">Exam Summary</span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            <div style={{ background: 'var(--in1)', borderRadius: 'var(--r)', padding: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--s400)', marginBottom: '3px' }}>Total Marks</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 800, color: 'var(--in5)' }}>{form.totalMarks}</div>
                            </div>
                            <div style={{ background: 'var(--gbg)', borderRadius: 'var(--r)', padding: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--green)', marginBottom: '3px' }}>Duration</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>{Math.floor(form.duration / 60)}h {form.duration % 60}m</div>
                            </div>
                            <div style={{ background: 'var(--abg)', borderRadius: 'var(--r)', padding: '12px' }}>
                                <div style={{ fontSize: '10px', color: 'var(--amber)', marginBottom: '3px' }}>AI Proctoring</div>
                                <div style={{ fontFamily: 'var(--fd)', fontSize: '14px', fontWeight: 700, color: 'var(--amber)' }}>✓ Enabled</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FacultyLayout>
    );
};

export default FacultyCreateExam;
