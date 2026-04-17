import React from 'react';
import { deleteQuestion } from '../../../api';
import { toast } from 'react-toastify';

const getId = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field._id || '';
};

const QBankPanel = ({ questions, subjects, exams, openModal, onRefresh, showPanel }) => {
    const typeIcon = { MCQ: '🔵', TF: '🔀', SA: '✏️', LA: '📄', FILL: '⬜' };
    const diffBadge = {
        Easy: <span className="badge" style={{ background: '#f0fdf4', color: '#16a34a' }}>Easy</span>,
        Medium: <span className="badge" style={{ background: '#fffbeb', color: '#d97706' }}>Medium</span>,
        Hard: <span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}>Hard</span>
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        try {
            const token = sessionStorage.getItem('token');
            await deleteQuestion(id, token);
            toast.success('Question removed!');
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err.message || 'Error deleting question');
        }
    };

    return (
        <div className="panel-wrap active">
            <div className="nav-cta">
                <div className="nav-cta-txt">Add questions to the bank and <strong>link them to Exams</strong></div>
                <button className="btn-fac-nav btn btn-info text-light" onClick={() => showPanel && showPanel('exams')}>← Back to Exams</button>
            </div>

            <div className="mini-stats">
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--in1)' }}>❓</div>
                    <div>
                        <div className="ms-val">{questions.length}</div>
                        <div className="ms-lbl">Total Questions</div>
                    </div>
                </div>
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--gbg)' }}>⚡</div>
                    <div>
                        <div className="ms-val">{questions.filter(q => q.type === 'MCQ').length}</div>
                        <div className="ms-lbl">MCQs</div>
                    </div>
                </div>
            </div>

            <div className="sec-hdr">
                <div className="sec-hdr-l">
                    <h3>Question Bank</h3>
                    <p>Add and organise questions by subject and exam</p>
                </div>
                <div className="d-flex gap-2">
                    <select className="form-select border shadow-none" style={{ width: '160px', height: '36px', fontSize: '12px', borderRadius: '18px' }}>
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.code}</option>)}
                    </select>
                    <button className="btn-prim px-3" onClick={openModal}>
                        <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" className="me-1">
                            <line x1="12" x2="12" y1="5" y2="19" />
                            <line x1="5" x2="19" y1="12" y2="12" />
                        </svg>
                        + Add Question
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: '14px' }}>
                <div className="tbl-wrap">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Exam</th>
                                <th>Marks</th>
                                <th>Diff</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No questions found.</td></tr>
                            ) : (
                                questions.map((q, i) => {
                                    const examName = q.examId?.name || '';
                                    const exam = exams.find(e => e._id === getId(q.examId));
                                    const subjectName = q.subjectId?.code || subjects.find(s => s._id === getId(exam?.subjectId))?.code || '—';

                                    return (
                                        <tr key={q._id}>
                                            <td><span style={{ fontSize: '11px', color: 'var(--g400)' }}>{i + 1}</span></td>
                                            <td>
                                                <strong>{q.text}</strong><br />
                                                {q.tag ? <><span style={{ fontSize: '10px', color: 'var(--g300)' }}>#{q.tag}</span></> : ''}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '15px' }} title={q.type}>{typeIcon[q.type] || '❓'}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--g400)', marginLeft: '6px' }}>{q.type}</span>
                                            </td>
                                            <td><span style={{ fontFamily: 'var(--fcode)', fontSize: '11px', color: 'var(--cy4)' }}>{subjectName}</span></td>
                                            <td>{examName || exam?.name || '—'}</td>
                                            <td><strong>{q.marks}</strong></td>
                                            <td>{diffBadge[q.diff] || q.diff}</td>
                                            <td>
                                                <button className="btn btn-outline-danger btn-xs border-0" onClick={() => handleDelete(q._id)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--g300)' }}>Use the "Manage Question Bank" page for advanced filtering and bulk management.</p>
            </div>
        </div>
    );
};

export default QBankPanel;
