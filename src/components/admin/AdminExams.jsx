import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { getExams, deleteExam, createExam, getSubjects } from '../../api';

const examSchema = yup.object().shape({
    name: yup.string().required('Exam title is required'),
    subjectId: yup.string().required('Subject is required'),
    type: yup.string().required('Exam type is required'),
    date: yup.string().required('Date is required'),
    time: yup.string().required('Time is required'),
    duration: yup.number().typeError('Must be a number').required('Duration is required').min(1, 'Min 1 min'),
    totalMarks: yup.number().typeError('Must be a number').required('Total marks required'),
    passMarks: yup.number().typeError('Must be a number').required('Pass marks required'),
    proctoring: yup.object().shape({
        faceAuth: yup.boolean(),
        liveMonitoring: yup.boolean(),
        tabSwitch: yup.boolean()
    })
});

const AdminExams = () => {
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(examSchema),
        defaultValues: {
            type: 'Final Exam',
            proctoring: { faceAuth: true, liveMonitoring: true, tabSwitch: true }
        }
    });

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await getExams(token);
            setExams(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = await getSubjects(token);
            setSubjects(data);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        }
    };

    useEffect(() => {
        fetchExams();
        fetchSubjects();
    }, []);

    const onScheduleSubmit = async (data) => {
        setFormLoading(true);
        try {
            const token = localStorage.getItem('token');
            await createExam(data, token);
            alert('Exam Scheduled Successfully! ✅\nChecking the list below...');
            setShowModal(false);
            reset();
            // Clear filters to show the new exam
            setSearchTerm('');
            setFilter('All');
            fetchExams();
        } catch (err) {
            alert(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm('Warning: Deleting this exam will also delete all its questions. Continue?')) return;
        try {
            const token = localStorage.getItem('token');
            await deleteExam(id, token);
            fetchExams();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredExams = exams.filter(e => {
        const matchesSearch = (e.name || e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (e.subjectId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filter === 'All' || 
                             (e.status || '').toLowerCase() === filter.toLowerCase();
        
        return matchesSearch && matchesFilter;
    });

    console.log('Total Exams:', exams.length);
    console.log('Filtered Exams:', filteredExams.length);

    if (loading) return <AdminLayout> <div style={{ textAlign: 'center', padding: '50px' }}>Loading Exams...</div> </AdminLayout>;
    if (error) return <AdminLayout> <div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div> </AdminLayout>;

    return (
        <AdminLayout>
            <div className="pg-intro">
                <h2>Global Exam Scheduling</h2>
                <p>Monitor and manage all exams across departments</p>
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <div className="hs" style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--g50)', padding: '0 12px', border: '1.5px solid var(--g200)', borderRadius: '10px' }}>
                        <svg fill="none" height="14" stroke="var(--g300)" strokeWidth="2" viewBox="0 0 24 24" width="14">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
                        </svg>
                        <input 
                            placeholder="Search by title, subject..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', height: '38px', fontSize: '13px' }} 
                        />
                    </div>
                    <select 
                        className="fi" 
                        style={{ width: '150px' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Live">Live</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button className="btn btn-n btn-sm" onClick={() => setShowModal(true)}>+ Schedule Exam</button>
                </div>
            </div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Scheduled Examinations ({filteredExams.length})</span>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Exam Title</th>
                                <th>Subject</th>
                                <th>Date & Time</th>
                                <th>Duration</th>
                                <th>Marks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExams.length === 0 ? (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No exams found matching your criteria.</td></tr>
                            ) : (
                                filteredExams.map(e => (
                                    <tr key={e._id}>
                                        <td>
                                            <div style={{ fontWeight: '700', color: 'var(--g900)' }}>{e.name || e.title || 'Untitled Exam'}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--g400)' }}>ID: {e._id ? e._id.substring(0, 8).toUpperCase() : 'N/A'}</div>
                                        </td>
                                        <td>{e.subjectId?.name || 'General Subject'}</td>
                                        <td>
                                            <div>{e.date ? new Date(e.date).toLocaleDateString() : 'No Date'}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--g500)' }}>{e.time || '10:00 AM'}</div>
                                        </td>
                                        <td>{e.duration || 0} mins</td>
                                        <td>{e.totalMarks || 0} M</td>
                                        <td>
                                            <span className={`badge ${(e.status || 'scheduled').toLowerCase() === 'live' ? 'b-live' : (e.status || 'scheduled').toLowerCase() === 'completed' ? 'b-completed' : 'b-scheduled'}`}>
                                                {(e.status || 'SCHEDULED').toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-1" style={{ alignItems: 'center' }}>
                                                {e.status === 'live' ? (
                                                    <Link className="btn btn-c btn-xs" to="/admin/proctor" title="Live Monitor">
                                                        <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                        </svg>
                                                    </Link>
                                                ) : e.status === 'completed' ? (
                                                    <Link className="btn btn-g btn-xs" to={`/admin/results?examId=${e._id}`} title="View Results">
                                                        <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                                                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                                        </svg>
                                                    </Link>
                                                ) : (
                                                    <button className="btn btn-g btn-xs" title="Edit Exam">
                                                        <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                                <button 
                                                    className="btn btn-danger btn-xs" 
                                                    style={{ background: 'rgba(220,38,38,.1)', color: 'var(--red)', border: 'none' }}
                                                    title="Delete Exam"
                                                    onClick={() => handleDeleteExam(e._id)}
                                                >
                                                    <svg fill="none" height="12" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="12">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Schedule Exam Modal */}
            {showModal && (
                <div className="modal-custom-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="card shadow-lg border-0" style={{ width: '100%', maxWidth: '600px', padding: '0', borderRadius: '15px' }}>
                        <div className="cd-hd d-flex align-items-center justify-content-between p-4" style={{ borderBottom: '1px solid #eee' }}>
                            <h5 className="mb-0 fw-bold">Schedule New Examination</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSubmit(onScheduleSubmit)} className="p-4">
                            <div className="row g-3 mb-3 text-start">
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Exam Title</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} placeholder="e.g. DSA Final Term 2026" {...register('name')} />
                                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Subject</label>
                                    <select className={`form-select ${errors.subjectId ? 'is-invalid' : ''}`} {...register('subjectId')}>
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                    </select>
                                    {errors.subjectId && <div className="invalid-feedback">{errors.subjectId.message}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Exam Type</label>
                                    <select className="form-select" {...register('type')}>
                                        <option>Mid-term Exam</option>
                                        <option>Final Exam</option>
                                        <option>Quiz</option>
                                        <option>Practical</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Date</label>
                                    <input type="date" className={`form-control ${errors.date ? 'is-invalid' : ''}`} {...register('date')} />
                                    {errors.date && <div className="invalid-feedback">{errors.date.message}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Start Time</label>
                                    <input type="time" className={`form-control ${errors.time ? 'is-invalid' : ''}`} {...register('time')} />
                                    {errors.time && <div className="invalid-feedback">{errors.time.message}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Duration (Mins)</label>
                                    <input type="number" className={`form-control ${errors.duration ? 'is-invalid' : ''}`} placeholder="90" {...register('duration')} />
                                    {errors.duration && <div className="invalid-feedback">{errors.duration.message}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Total Marks</label>
                                    <input type="number" className={`form-control ${errors.totalMarks ? 'is-invalid' : ''}`} placeholder="100" {...register('totalMarks')} />
                                    {errors.totalMarks && <div className="invalid-feedback">{errors.totalMarks.message}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted text-uppercase mb-2">Pass Marks</label>
                                    <input type="number" className={`form-control ${errors.passMarks ? 'is-invalid' : ''}`} placeholder="33" {...register('passMarks')} />
                                    {errors.passMarks && <div className="invalid-feedback">{errors.passMarks.message}</div>}
                                </div>
                            </div>

                            <div className="mb-4 text-start">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-3">AI Proctoring Controls</label>
                                <div className="d-flex flex-wrap gap-4 p-3 bg-light rounded-3">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" {...register('proctoring.faceAuth')} />
                                        <label className="form-check-label small fw-bold">Face Auth</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" {...register('proctoring.liveMonitoring')} />
                                        <label className="form-check-label small fw-bold">Live Monitor</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" {...register('proctoring.tabSwitch')} />
                                        <label className="form-check-label small fw-bold">Anti-Tab Switch</label>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 justify-content-end pt-3 border-top">
                                <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={formLoading} style={{ background: 'var(--in5)', border: 'none' }}>
                                    {formLoading ? 'Scheduling...' : 'Schedule Exam Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminExams;
