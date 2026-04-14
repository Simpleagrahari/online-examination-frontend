import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';

const AdminAnalytics = () => {
  return (
    <AdminLayout>
      <div className="pg-intro"><h2>Performance Analytics</h2></div>

      <div className="row row-cols-2 row-cols-lg-4 g-3 mb-3 ex-stat-row">
        <div className="col"><div className="sc cg">
          <div className="sc-lbl">Avg Pass Rate</div>
          <div className="sc-val">74.8%</div>
          <div className="sc-trend d-flex align-items-center gap-1 tup">▲ This semester</div>
        </div></div>
        <div className="col"><div className="sc cn">
          <div className="sc-lbl">Cheat Attempts</div>
          <div className="sc-val">28</div>
          <div className="sc-trend d-flex align-items-center gap-1 tdn">▼ Flagged</div>
        </div></div>
        <div className="col"><div className="sc cc">
          <div className="sc-lbl">Face Auth Rate</div>
          <div className="sc-val">99.2%</div>
          <div className="sc-trend d-flex align-items-center gap-1 tup">▲ Accuracy</div>
        </div></div>
        <div className="col"><div className="sc ca">
          <div className="sc-lbl">Avg Exam Score</div>
          <div className="sc-val">68.4</div>
          <div className="sc-trend d-flex align-items-center gap-1 tup">▲ /100</div>
        </div></div>
      </div>

      <div className="row g-3 mb-3">
        <div className="card">
          <div className="cd-hd d-flex align-items-center justify-content-between">
            <span className="cd-t">Dept-wise Performance</span>
          </div>
          <div className="pb-row d-flex align-items-center gap-2">
            <span className="pb-lbl">Computer Sci</span>
            <div className="pb-track"><div className="pb-fill" style={{ width: '78%', background: 'var(--in4)' }}></div></div>
            <span className="pb-val">78%</span>
          </div>
          <div className="pb-row d-flex align-items-center gap-2">
            <span className="pb-lbl">Mathematics</span>
            <div className="pb-track"><div className="pb-fill" style={{ width: '71%', background: 'var(--cy4)' }}></div></div>
            <span className="pb-val">71%</span>
          </div>
          <div className="pb-row d-flex align-items-center gap-2">
            <span className="pb-lbl">Physics</span>
            <div className="pb-track"><div className="pb-fill" style={{ width: '68%', background: 'var(--amber)' }}></div></div>
            <span className="pb-val">68%</span>
          </div>
          <div className="pb-row d-flex align-items-center gap-2">
            <span className="pb-lbl">Electronics</span>
            <div className="pb-track"><div className="pb-fill" style={{ width: '82%', background: 'var(--green)' }}></div></div>
            <span className="pb-val">82%</span>
          </div>
        </div>

        <div className="card">
          <div className="cd-hd d-flex align-items-center justify-content-between">
            <span className="cd-t">Generate Reports</span>
          </div>
          <div className="d-flex flex-column gap-2">
            <button className="btn btn-n">📊 Exam-wise Performance</button>
            <button className="btn btn-g">👤 Student-wise Summary</button>
            <button className="btn btn-g">📚 Subject-wise Analysis</button>
            <button className="btn btn-g">🔍 AI Proctoring Report</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
