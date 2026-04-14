import React, { useState, useEffect } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import CoursesPanel from './panels/CoursesPanel';
import SubjectsPanel from './panels/SubjectsPanel';
import ExamsPanel from './panels/ExamsPanel';
import QBankPanel from './panels/QBankPanel';
import { useSearchParams } from 'react-router-dom';
import { getCourses, getSubjects, getExams, getQuestions, createCourse, createSubject, createQuestion } from '../../api';
import { toast } from 'react-toastify';

// Reusable Bootstrap Modal Component
const BootstrapModal = ({ id, title, show, onHide, children, onSubmit, submitLabel = "Save Changes" }) => {
    return (
        <>
            <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent', zIndex: 1055 }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                        <div className="modal-header border-0 pb-0 pt-4 px-4 text-dark">
                            <h5 className="modal-title font-weight-bold" style={{ fontSize: '1.25rem' }}>{title}</h5>
                            <button type="button" className="btn-close shadow-none" onClick={onHide}></button>
                        </div>
                        <div className="modal-body px-4 pt-3 pb-4">
                            {children}
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={onHide}>Cancel</button>
                            <button type="button" className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={onSubmit}>{submitLabel}</button>
                        </div>
                    </div>
                </div>
            </div>
            {show && <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>}
        </>
    );
};

const FacultyDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activePanel, setActivePanel] = useState('courses');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data states
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);

    // Form states
    const [courseForm, setCourseForm] = useState({ name: '', code: '', dept: 'Computer Science & Engg', duration: '4 Years' });
    const [subjectForm, setSubjectForm] = useState({ name: '', code: '', sem: '1', credits: 4 });
    const [questionForm, setQuestionForm] = useState({ text: '', type: 'MCQ', diff: 'Medium', marks: 2, options: ['', '', '', ''], correctOption: 0, subjectId: '', examId: '' });

    // Modals state
    const [modals, setModals] = useState({
        course: false,
        subject: false,
        exam: false,
        question: false
    });

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [coursesData, subjectsData, examsData, questionsData] = await Promise.all([
                getCourses(token),
                getSubjects(token),
                getExams(token),
                getQuestions(token).catch(() => [])
            ]);
            setCourses(coursesData);
            setSubjects(subjectsData);
            setExams(examsData);
            setQuestions(questionsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    useEffect(() => {
        const p = searchParams.get('p');
        if (p) setActivePanel(p);
        else setActivePanel('courses');
    }, [searchParams]);

    const showPanel = (p) => setSearchParams({ p });
    const drillCourse = (id) => { setActiveCourseId(id); showPanel('subjects'); };
    const toggleModal = (key) => setModals(prev => ({ ...prev, [key]: !prev[key] }));

    const handleCreateCourse = async () => {
        if (!courseForm.name || !courseForm.code) return toast.error('Name & Code required');
        let sems = courseForm.duration.includes('4') ? 8 : (courseForm.duration.includes('3') ? 6 : 4);
        try {
            const token = localStorage.getItem('token');
            await createCourse({ ...courseForm, sems, icon: '📘' }, token);
            toast.success('Course created!');
            toggleModal('course');
            fetchAllData();
            setCourseForm({ name: '', code: '', dept: 'Computer Science & Engg', duration: '4 Years' });
        } catch (err) { toast.error(err.message); }
    };

    const handleCreateSubject = async () => {
        if (!subjectForm.name || !subjectForm.code) return toast.error('Name & Code required');
        try {
            const token = localStorage.getItem('token');
            const data = { ...subjectForm, courseId: activeCourseId || (courses[0]?._id) };
            await createSubject(data, token);
            toast.success('Subject added!');
            toggleModal('subject');
            fetchAllData();
            setSubjectForm({ name: '', code: '', sem: '1', credits: 4 });
        } catch (err) { toast.error(err.message); }
    };

    const handleCreateQuestion = async () => {
        if (!questionForm.text || !questionForm.examId) return toast.error('Required fields missing');
        try {
            const token = localStorage.getItem('token');
            await createQuestion(questionForm, token);
            toast.success('Question added!');
            toggleModal('question');
            fetchAllData();
            setQuestionForm({ text: '', type: 'MCQ', diff: 'Medium', marks: 2, options: ['', '', '', ''], correctOption: 0, subjectId: '', examId: '' });
        } catch (err) { toast.error(err.message); }
    };

    const updateOption = (idx, val) => {
        const newOpts = [...questionForm.options];
        newOpts[idx] = val;
        setQuestionForm({ ...questionForm, options: newOpts });
    };

    const meta = {
        courses: { hdr: 'Manage Courses', title: 'Course Management' },
        subjects: { hdr: 'Manage Subjects', title: 'Subject Management' },
        exams: { hdr: 'Manage Exams', title: 'Exam Management' },
        qbank: { hdr: 'Manage Bank', title: 'Question Bank' }
    }[activePanel] || { hdr: 'Manage Courses', title: 'Course Management' };

    if (loading) return <FacultyLayout pageTitle="Loading..."> <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div> </FacultyLayout>;

    return (
        <FacultyLayout pageTitle={meta.hdr}>
            <div className="pg-intro"><h2>{meta.title}</h2></div>

            <div className="flow-breadcrumb">
                <button className={`fb-step ${activePanel === 'courses' ? 'active' : 'done'}`} onClick={() => showPanel('courses')}>1 Courses</button>
                <button className={`fb-step ${activePanel === 'subjects' ? 'active' : 'done'}`} onClick={() => showPanel('subjects')}>2 Subjects</button>
                <button className={`fb-step ${activePanel === 'exams' ? 'active' : 'done'}`} onClick={() => showPanel('exams')}>3 Exams</button>
                <button className={`fb-step ${activePanel === 'qbank' ? 'active' : ''}`} onClick={() => showPanel('qbank')}>4 Bank</button>
            </div>

            {activePanel === 'courses' && <CoursesPanel courses={courses} filteredCourses={courses} subjects={subjects} exams={exams} drillCourse={drillCourse} openModal={() => toggleModal('course')} onRefresh={fetchAllData} />}
            {activePanel === 'subjects' && <SubjectsPanel activeCourseId={activeCourseId} courses={courses} subjects={subjects} exams={exams} showPanel={showPanel} openModal={() => toggleModal('subject')} onRefresh={fetchAllData} />}
            {activePanel === 'exams' && <ExamsPanel exams={exams} subjects={subjects} courses={courses} showPanel={showPanel} onRefresh={fetchAllData} />}
            {activePanel === 'qbank' && <QBankPanel questions={questions} subjects={subjects} exams={exams} onRefresh={fetchAllData} openModal={() => toggleModal('question')} />}

            {/* Modal: Add Question */}
            <BootstrapModal id="questionModal" title="❓ Add Question" show={modals.question} onHide={() => toggleModal('question')} onSubmit={handleCreateQuestion} submitLabel="Add Question">
                <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>Link to Exam <span className="text-danger">*</span></label>
                    <select className="form-select rounded-pill shadow-none border" value={questionForm.examId} onChange={(e) => setQuestionForm({...questionForm, examId: e.target.value})}>
                        <option value="">Select Exam</option>
                        {exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '13px' }}>Question Text <span className="text-danger">*</span></label>
                    <textarea className="form-control shadow-none border" rows="2" style={{ borderRadius: '14px' }} placeholder="Enter question..." value={questionForm.text} onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})} />
                </div>
                {questionForm.type === 'MCQ' && (
                    <div className="row g-2 mb-3">
                        {questionForm.options.map((opt, i) => (
                            <div key={i} className="col-md-6">
                                <label className="form-label mb-1" style={{ fontSize: '11px' }}>Option {i+1} {questionForm.correctOption === i && '✅'}</label>
                                <div className="input-group">
                                    <div className="input-group-text bg-white border-end-0" style={{ borderRadius: '18px 0 0 18px' }}>
                                        <input type="radio" checked={questionForm.correctOption === i} onChange={() => setQuestionForm({...questionForm, correctOption: i})} />
                                    </div>
                                    <input className="form-control shadow-none border border-start-0" style={{ borderRadius: '0 18px 18px 0' }} value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Choice ${i+1}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="row g-3">
                   <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '12px' }}>Type</label>
                        <select className="form-select rounded-pill shadow-none border" value={questionForm.type} onChange={(e) => setQuestionForm({...questionForm, type: e.target.value})}>
                            <option value="MCQ">MCQ</option>
                            <option value="TF">True / False</option>
                            <option value="SA">Short Answer</option>
                        </select>
                   </div>
                   <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '12px' }}>Marks</label>
                        <input className="form-control rounded-pill shadow-none border" type="number" value={questionForm.marks} onChange={(e) => setQuestionForm({...questionForm, marks: e.target.value})} />
                   </div>
                   <div className="col-md-4">
                        <label className="form-label" style={{ fontSize: '12px' }}>Difficulty</label>
                        <select className="form-select rounded-pill shadow-none border" value={questionForm.diff} onChange={(e) => setQuestionForm({...questionForm, diff: e.target.value})}>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                   </div>
                </div>
            </BootstrapModal>

            {/* Other Modals (Course/Subject) */}
            <BootstrapModal id="courseModal" title="📚 Add Course" show={modals.course} onHide={() => toggleModal('course')} onSubmit={handleCreateCourse} submitLabel="Create">
                <input className="form-control rounded-pill mb-3 shadow-none border" placeholder="Course Name" value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} />
                <input className="form-control rounded-pill mb-3 shadow-none border" placeholder="Course Code" value={courseForm.code} onChange={(e) => setCourseForm({...courseForm, code: e.target.value})} />
                <select className="form-select rounded-pill shadow-none border" value={courseForm.duration} onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}>
                    <option>2 Years</option><option>3 Years</option><option>4 Years</option>
                </select>
            </BootstrapModal>

            <BootstrapModal id="subjectModal" title="📖 Add Subject" show={modals.subject} onHide={() => toggleModal('subject')} onSubmit={handleCreateSubject} submitLabel="Add">
                <input className="form-control rounded-pill mb-3 shadow-none border" placeholder="Subject Name" value={subjectForm.name} onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})} />
                <input className="form-control rounded-pill mb-3 shadow-none border" placeholder="Subject Code" value={subjectForm.code} onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})} />
                <input className="form-control rounded-pill mb-3 shadow-none border" type="number" placeholder="Sem" value={subjectForm.sem} onChange={(e) => setSubjectForm({...subjectForm, sem: e.target.value})} />
            </BootstrapModal>

        </FacultyLayout>
    );
};

export default FacultyDashboard;
