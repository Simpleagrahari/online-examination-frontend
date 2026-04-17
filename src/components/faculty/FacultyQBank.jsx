import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import { getQuestions, getExams, getSubjects } from '../../api';

const FacultyQBank = () => {
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterSubject, setFilterSubject] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const [qData, exData, subData] = await Promise.all([
                    getQuestions(token).catch(() => []),
                    getExams(token),
                    getSubjects(token)
                ]);
                setQuestions(qData);
                setExams(exData);
                setSubjects(subData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Helper to extract ID from populated or string field
    const getId = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return field._id || '';
    };

    // Filter questions by subject
    const filteredQuestions = filterSubject
        ? questions.filter(q => {
            // Check direct subjectId
            if (getId(q.subjectId) === filterSubject) return true;
            // Check via examId's subjectId
            const examIdStr = getId(q.examId);
            const exam = exams.find(e => e._id === examIdStr);
            return exam && getId(exam.subjectId) === filterSubject;
        })
        : questions;

    const typeBadge = {
        MCQ: { class: 'b-scheduled', label: 'MCQ' },
        TF: { class: 'b-warn', label: 'T/F' },
        SA: { class: 'b-pass', label: 'Short' },
        LA: { class: 'b-completed', label: 'Long' },
        FILL: { class: 'b-draft', label: 'Fill' }
    };

    const diffBadge = {
        Easy: { class: 'b-pass', label: 'Easy' },
        Medium: { class: 'b-warn', label: 'Medium' },
        Hard: { class: 'b-fail', label: 'Hard' }
    };

    if (loading) return <FacultyLayout><div style={{ textAlign: 'center', padding: '50px' }}>Loading Question Bank...</div></FacultyLayout>;
    if (error) return <FacultyLayout><div style={{ color: 'red', textAlign: 'center', padding: '50px' }}>Error: {error}</div></FacultyLayout>;

    return (
        <FacultyLayout>
            <div className="pg-intro">
                <h2>Question Bank</h2>
                <p>Manage questions across all subjects and exams ({questions.length} total)</p>
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Upload / Add Question</span>
                    <button className="btn btn-n btn-sm">Bulk Import CSV</button>
                </div>
                <div className="row g-3">
                    <div className="fg">
                        <label className="fl req">Question Type</label>
                        <select className="fi">
                            <option>MCQ (Multiple Choice)</option>
                            <option>True / False</option>
                            <option>Short Answer</option>
                        </select>
                    </div>
                    <div className="fg">
                        <label className="fl req">Difficulty</label>
                        <select className="fi">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                </div>
                <div className="fg">
                    <label className="fl req">Question Text</label>
                    <textarea className="fi" rows="3" placeholder="Enter question text..." />
                </div>
                <div className="fg">
                    <label className="fl req">Options (MCQ)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input className="fi" placeholder="Option A" />
                        <input className="fi" placeholder="Option B" />
                        <input className="fi" placeholder="Option C (Correct)" />
                        <input className="fi" placeholder="Option D" />
                    </div>
                </div>
                <div className="row g-3">
                    <div className="fg">
                        <label className="fl req">Correct Answer</label>
                        <select className="fi">
                            <option>Option A</option>
                            <option>Option B</option>
                            <option>Option C</option>
                            <option>Option D</option>
                        </select>
                    </div>
                    <div className="fg">
                        <label className="fl req">Marks</label>
                        <input className="fi" type="number" defaultValue="2" />
                    </div>
                </div>
                <button className="btn btn-n">Add to Bank</button>
            </div>

            <div className="card" style={{ marginBottom: '14px' }}>
                <div className="d-flex gap-2 align-items-center">
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--g500)' }}>Filter:</span>
                    <select className="fi" style={{ width: '180px' }} value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
            </div>

            <div className="card">
                <div className="cd-hd d-flex align-items-center justify-content-between">
                    <span className="cd-t">Questions ({filteredQuestions.length})</span>
                </div>
                <div className="tw">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Type</th><th>Question</th><th>Difficulty</th><th>Marks</th><th>Exam</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No questions found.</td></tr>
                            ) : (
                                filteredQuestions.map((q, i) => {
                                    const tb = typeBadge[q.type] || { class: 'b-draft', label: q.type };
                                    const db = diffBadge[q.diff] || { class: 'b-draft', label: q.diff };
                                    const examName = q.examId?.name || '';
                                    return (
                                        <tr key={q._id || i}>
                                            <td><span className={`badge ${tb.class}`}>{tb.label}</span></td>
                                            <td>{q.text?.length > 60 ? q.text.slice(0, 60) + '...' : q.text}</td>
                                            <td><span className={`badge ${db.class}`}>{db.label}</span></td>
                                            <td>{q.marks}</td>
                                            <td style={{ fontSize: '11px', color: 'var(--g400)' }}>{examName || 'Unlinked'}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-g btn-xs">Edit</button>
                                                    <button className="btn btn-danger btn-xs">Del</button>
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
        </FacultyLayout>
    );
};

export default FacultyQBank;
