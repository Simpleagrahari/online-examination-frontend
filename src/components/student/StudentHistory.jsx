import React from 'react';
import StudentLayout from '../../layouts/StudentLayout';

const StudentHistory = () => {
  const exams = [
    { name: 'CS101 Unit 3', subject: 'Programming', date: '10 Mar 2026', score: '78/100', pct: '78%', proctor: 'Clean', proctorClass: 'b-clean', result: 'Pass · B+', resultClass: 'b-pass' },
    { name: 'PH101 Unit 1', subject: 'Physics', date: '8 Mar 2026', score: '82/100', pct: '82%', proctor: 'Clean', proctorClass: 'b-clean', result: 'Pass · A', resultClass: 'b-pass' },
    { name: 'MA201 Unit 1', subject: 'Calculus', date: '1 Mar 2026', score: '65/80', pct: '81%', proctor: '1 Warning', proctorClass: 'b-warn', result: 'Pass · A–', resultClass: 'b-pass' },
    { name: 'CS201 Mid', subject: 'OOP Java', date: '20 Feb 2026', score: '55/100', pct: '55%', proctor: 'Clean', proctorClass: 'b-clean', result: 'Pass · C', resultClass: 'b-pass' },
    { name: 'EN101 Final', subject: 'English', date: '10 Feb 2026', score: '30/50', pct: '60%', proctor: 'Clean', proctorClass: 'b-clean', result: 'Pass · B', resultClass: 'b-pass' },
  ];

  return (
    <StudentLayout>
      <div className="pg-intro">
        <h2>Exam History</h2>
        <p>All your attempted examinations</p>
      </div>

      <div className="card">
        <div className="cd-hd d-flex align-items-center justify-content-between">
          <span className="cd-t">Attempted Exams (12)</span>
        </div>
        <div className="tw">
          <table className="tbl">
            <thead>
              <tr>
                <th>Exam</th><th>Subject</th><th>Date</th><th>Score</th>
                <th>Percentage</th><th>Proctoring</th><th>Result</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e, i) => (
                <tr key={i}>
                  <td><strong>{e.name}</strong></td>
                  <td>{e.subject}</td>
                  <td>{e.date}</td>
                  <td>{e.score}</td>
                  <td>{e.pct}</td>
                  <td><span className={`badge ${e.proctorClass}`}>{e.proctor}</span></td>
                  <td><span className={`badge ${e.resultClass}`}>{e.result}</span></td>
                  <td><button className="btn btn-g btn-xs">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentHistory;
