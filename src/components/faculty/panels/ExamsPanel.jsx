import React from 'react';
import { Link } from 'react-router-dom';
import { deleteExam } from '../../../api';
import { toast } from 'react-toastify';

const getId = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field._id || '';
};

const ExamsPanel = ({ exams, subjects, courses, showPanel, onRefresh }) => {
    const statusBadge = {
        live: <span className="badge b-live">● Live</span>,
        scheduled: <span className="badge b-scheduled">Scheduled</span>,
        completed: <span className="badge b-completed">Completed</span>,
        draft: <span className="badge b-draft">Draft</span>
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? Associated questions will also be removed.`)) return;
        try {
            const token = localStorage.getItem('token');
            await deleteExam(id, token);
            toast.success(`${name} deleted!`);
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err.message || 'Error deleting exam');
        }
    };

    const liveExams = exams.filter(e => e.status === 'live').length;
    const scheduledExams = exams.filter(e => e.status === 'scheduled').length;
    const completedExams = exams.filter(e => e.status === 'completed').length;

    return (
        <div className="panel-wrap active">
            <div className="nav-cta">
                <div className="nav-cta-txt">Create exams and link them to <strong>Subjects → Courses</strong></div>
                <button className="btn-fac-nav btn btn-info text-light" onClick={() => showPanel('subjects')}>← Back to Subjects</button>
            </div>

            <div className="mini-stats">
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--in1)' }}>📝</div>
                    <div>
                        <div className="ms-val">{exams.length}</div>
                        <div className="ms-lbl">Total Exams</div>
                    </div>
                </div>
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--gbg)' }}>🟢</div>
                    <div>
                        <div className="ms-val">{liveExams}</div>
                        <div className="ms-lbl">Live Now</div>
                    </div>
                </div>
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--abg)' }}>📅</div>
                    <div>
                        <div className="ms-val">{scheduledExams}</div>
                        <div className="ms-lbl">Scheduled</div>
                    </div>
                </div>
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--g100)' }}>✔</div>
                    <div>
                        <div className="ms-val">{completedExams}</div>
                        <div className="ms-lbl">Completed</div>
                    </div>
                </div>
            </div>

            <div className="sec-hdr">
                <div className="sec-hdr-l">
                    <h3>Exam List</h3>
                    <p>Manage all exams. Each exam is linked to a subject and course.</p>
                </div>
                <Link className="btn-prim" to="/faculty/create-exam" style={{ textDecoration: 'none' }}>
                    <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" className="me-1">
                        <line x1="12" x2="12" y1="5" y2="19" />
                        <line x1="5" x2="19" y1="12" y2="12" />
                    </svg>
                    + Create Exam
                </Link>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: '14px' }}>
                <div className="tbl-wrap">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Course</th>
                                <th>Date & Time</th>
                                <th>Duration</th>
                                <th>Marks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No exams found.</td></tr>
                            ) : (
                                exams.map(e => {
                                    const examName = e.title || e.name;
                                    const subId = getId(e.subjectId);
                                    const sub = subjects.find(s => s._id === subId);
                                    const courseId = sub ? getId(sub.courseId) : '';
                                    const course = courseId ? courses.find(c => c._id === courseId) : null;
                                    const courseName = sub?.courseId?.code || course?.code || '—';
                                    const subjectCode = e.subjectId?.code || sub?.code || '-';

                                    return (
                                        <tr key={e._id}>
                                            <td>
                                                <strong>{examName}</strong><br />
                                                <span style={{ fontSize: '10.5px', color: 'var(--g300)' }}>{e.type}</span>
                                            </td>
                                            <td>
                                                <span style={{ fontFamily: 'var(--fcode)', fontSize: '11px', color: 'var(--cy4)' }}>{subjectCode}</span>
                                            </td>
                                            <td>{courseName}</td>
                                            <td>
                                                <div style={{ fontSize: '12px' }}>
                                                    {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}<br/>
                                                    <span style={{ color: 'var(--g400)' }}>{e.time}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {Math.floor(e.duration / 60) ? Math.floor(e.duration / 60) + 'hr ' : ''}
                                                {e.duration % 60 ? e.duration % 60 + 'min' : ''}
                                                {!e.duration ? '—' : ''}
                                            </td>
                                            <td><strong>{e.totalMarks || e.marks}</strong></td>
                                            <td>{statusBadge[e.status] || statusBadge.draft}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-primary btn-xs px-2 rounded-pill shadow-sm" onClick={() => showPanel('qbank')}>+ Q</button>
                                                    <button className="btn btn-danger btn-xs px-2 rounded-pill shadow-sm" onClick={() => handleDelete(e._id, examName)}>Del</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-fac-nav btn btn-outline-info" onClick={() => showPanel('qbank')}>Continue to Question Bank →</button>
            </div>
        </div>
    );
};

export default ExamsPanel;
