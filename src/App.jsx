import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Home
import Home from './components/Home';

// Login Pages
import { AdminLogin, FacultyLogin, StudentLogin } from './components/LoginPages';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminFacultyMgmt from './components/admin/AdminFacultyMgmt';
import AdminExams from './components/admin/AdminExams';
import AdminResults from './components/admin/AdminResults';
import AdminProctor from './components/admin/AdminProctor';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminQBank from './components/admin/AdminQBank';
import AdminSubjects from './components/admin/AdminSubjects';

// Faculty
import FacultyDashboard from './components/faculty/FacultyDashboard';
import FacultyCreateExam from './components/faculty/FacultyCreateExam';
import FacultyQBank from './components/faculty/FacultyQBank';
import FacultyMonitor from './components/faculty/FacultyMonitor';
import FacultyResults from './components/faculty/FacultyResults';

// Student
import StudentDashboard from './components/student/StudentDashboard';
import StudentFaceAuth from './components/student/StudentFaceAuth';
import StudentExam from './components/student/StudentExam';
import StudentHistory from './components/student/StudentHistory';
import StudentNotifications from './components/student/StudentNotifications';
import StudentResults from './components/student/StudentResults';
import StudentRegister from './components/student/StudentRegister';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
      {/* ── Home ── */}
      <Route path="/" element={<Home />} />

      {/* ── Login Routes ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/faculty/login" element={<FacultyLogin />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />

      {/* ── Admin Routes ── */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/faculty" element={<AdminFacultyMgmt />} />
      <Route path="/admin/exams" element={<AdminExams />} />
      <Route path="/admin/results" element={<AdminResults />} />
      <Route path="/admin/proctor" element={<AdminProctor />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/qbank" element={<AdminQBank />} />
      <Route path="/admin/subjects" element={<AdminSubjects />} />

      {/* ── Faculty Routes ── */}
      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      <Route path="/faculty/create-exam" element={<FacultyCreateExam />} />
      <Route path="/faculty/qbank" element={<FacultyQBank />} />
      <Route path="/faculty/monitor" element={<FacultyMonitor />} />
      <Route path="/faculty/results" element={<FacultyResults />} />

      {/* ── Student Routes ── */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/faceauth" element={<StudentFaceAuth />} />
      <Route path="/student/exam" element={<StudentExam />} />
      <Route path="/student/history" element={<StudentHistory />} />
      <Route path="/student/notifications" element={<StudentNotifications />} />
      <Route path="/student/results" element={<StudentResults />} />
      </Routes>
    </>
  );
}

export default App;
