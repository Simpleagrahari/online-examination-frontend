import React from 'react';
import { deleteCourse } from '../../../api';
import { toast } from 'react-toastify';

const getId = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field._id || '';
};

const CoursesPanel = ({ courses, filteredCourses, subjects, exams, drillCourse, openModal, onRefresh }) => {
    const COLORS = ['c0', 'c1', 'c2', 'c3'];

    const activeCount = courses.filter(c => {
        const cExams = exams.filter(e => {
            const sub = subjects.find(s => s._id === getId(e.subjectId));
            return sub && getId(sub.courseId) === c._id;
        });
        return cExams.some(e => e.status === 'live');
    }).length;

    const handleDelete = async (e, id, name) => {
        e.stopPropagation(); // Don't trigger course drill
        if (!window.confirm(`Are you sure you want to delete ${name}? All linked subjects and exams will be orphaned.`)) return;
        try {
            const token = localStorage.getItem('token');
            await deleteCourse(id, token);
            toast.success(`${name} deleted!`);
            if (onRefresh) onRefresh();
        } catch (err) {
            toast.error(err.message || 'Error deleting course');
        }
    };

    return (
        <div className="panel-wrap active">
            <div className="mini-stats">
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--cy1)' }}>🎓</div>
                    <div>
                        <div className="ms-val">{courses.length}</div>
                        <div className="ms-lbl">Total Courses</div>
                    </div>
                </div>
                <div className="ms-pill">
                    <div className="ms-icon" style={{ background: 'var(--gbg)' }}>⚡</div>
                    <div>
                        <div className="ms-val">{activeCount}</div>
                        <div className="ms-lbl">Active Now</div>
                    </div>
                </div>
            </div>

            <div className="sec-hdr">
                <div className="sec-hdr-l">
                    <h3>My Courses</h3>
                    <p>Click a course to view its subjects, or create a new course below</p>
                </div>
                <button className="btn-prim" onClick={openModal}>+ Create Course</button>
            </div>

            <div className="course-grid">
                {filteredCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1', color: 'var(--g400)' }}>No courses found.</div>
                ) : (
                    filteredCourses.map((c, i) => {
                        const cSubjects = subjects.filter(s => getId(s.courseId) === c._id);
                        const cExams = exams.filter(e => cSubjects.some(s => s._id === getId(e.subjectId)));

                        return (
                            <div key={c._id} className="course-card" onClick={() => drillCourse(c._id)}>
                                <div className={`cc-icon ${COLORS[i % 4]}`}>{c.icon || '📘'}</div>
                                <div className="cc-info">
                                    <div className="cc-name">{c.name}</div>
                                    <div className="cc-code">{c.code}</div>
                                    <div className="cc-stats">
                                        <span>📖 {cSubjects.length} subjects</span>
                                        <span>🎯 {cExams.length} exams</span>
                                        <span>🕒 {c.duration}</span>
                                    </div>
                                </div>
                                <button className="btn btn-outline-danger btn-xs border-0 position-absolute" 
                                        style={{ top: '15px', right: '15px', padding: '4px 8px', borderRadius: '8px' }}
                                        onClick={(e) => handleDelete(e, c._id, c.name)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CoursesPanel;
