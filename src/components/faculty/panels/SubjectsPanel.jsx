import React from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteSubject } from '../../../api';
import { toast } from 'react-toastify';

const getId = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field._id || '';
};

const SubjectsPanel = ({ activeCourseId, courses, subjects, exams, showPanel, openModal, onRefresh }) => {
    const navigate = useNavigate();
    const filteredSubjects = activeCourseId ? subjects.filter(s => getId(s.courseId) === activeCourseId) : subjects;
    const examsLinkedCount = exams.filter(e => filteredSubjects.some(s => s._id === getId(e.subjectId))).length;

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
        try {
            const token = sessionStorage.getItem('token');
            await deleteSubject(id, token);
            toast.success(`${name} deleted!`);
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err.message || 'Error deleting subject');
        }
    };

    return (
        <div className="panel-wrap active">
            <div className="nav-cta">
                <div className="nav-cta-txt">Showing subjects for: <strong>{activeCourseId ? courses.find(c => c._id === activeCourseId)?.name : 'All Courses'}</strong></div>
                <button className="btn-fac-nav btn btn-info text-light" onClick={() => showPanel('courses')}>← Back to Courses</button>
            </div>

            <div className="mini-stats">
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--cy1)' }}>📖</div>
                    <div>
                        <div className="ms-val">{filteredSubjects.length}</div>
                        <div className="ms-lbl">Total Subjects</div>
                    </div>
                </div>
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--gbg)' }}>🎯</div>
                    <div>
                        <div className="ms-val">{examsLinkedCount}</div>
                        <div className="ms-lbl">Exams linked</div>
                    </div>
                </div>
            </div>

            <div className="sec-hdr">
                <div className="sec-hdr-l">
                    <h3>Subjects</h3>
                    <p>Each subject belongs to a course and contains exams</p>
                </div>
                <button className="btn-prim" onClick={openModal}>+ Add Subject</button>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: '14px' }}>
                <div className="tbl-wrap">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Code</th>
                                <th>Course</th>
                                <th>Credits</th>
                                <th>Semester</th>
                                <th>Exams</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubjects.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No subjects found.</td></tr>
                            ) : (
                                filteredSubjects.map(s => {
                                    const course = courses.find(c => c._id === getId(s.courseId));
                                    const courseName = s.courseId?.name || course?.code || '—';
                                    const subExams = exams.filter(e => getId(e.subjectId) === s._id).length;
                                    return (
                                        <tr key={s._id}>
                                            <td><strong>{s.name}</strong></td>
                                            <td><span style={{ fontFamily: 'var(--fcode)', fontSize: '11px', color: 'var(--fac)' }}>{s.code}</span></td>
                                            <td>{courseName}</td>
                                            <td>{s.credits}</td>
                                            <td>{s.sem?.toString().startsWith('Sem') ? s.sem : `Sem ${s.sem}`}</td>
                                            <td><span className="badge b-sub">{subExams} exams</span></td>
                                            <td><span className="badge b-teal">Active</span></td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button className="btn btn-primary btn-xs px-2 rounded-pill shadow-sm" onClick={() => navigate(`/faculty/create-exam?subjectId=${s._id}`)}>+ Exam</button>
                                                    <button className="btn btn-danger btn-xs px-2 rounded-pill shadow-sm" onClick={() => handleDelete(s._id, s.name)}>Del</button>
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
        </div>
    );
};

export default SubjectsPanel;
