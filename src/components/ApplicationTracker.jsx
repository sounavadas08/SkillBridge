import React from 'react';
import { applicationPipeline } from '../data/applications';
import './ApplicationTracker.css';

export default function ApplicationTracker() {
  return (
    <section className="tracker-section" id="pipeline-view">
      <div className="container">
        <div className="tracker-header">
          <span className="section-tag">PIPELINE VIEW</span>
          <h2 className="section-title">Application Tracking Module</h2>
          <p className="section-subtitle">Real-time lifecycle pipeline for candidates and placement offices</p>
        </div>

        {/* Table Container */}
        <div className="table-responsive-card">
          <table className="pipeline-table">
            <thead>
              <tr>
                <th className="th-role">ROLE</th>
                <th className="th-company">COMPANY</th>
                <th className="th-date">DATE SUBMITTED</th>
                <th className="th-match">MATCH CONFIDENCE</th>
                <th className="th-status">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {applicationPipeline.map((item) => (
                <tr key={item.id} className="pipeline-row">
                  <td className="td-role">{item.role}</td>
                  <td className="td-company">{item.company}</td>
                  <td className="td-date">{item.dateSubmitted}</td>
                  <td className="td-match">
                    <div className="confidence-wrapper">
                      <div className="confidence-bar-track">
                        <div
                          className="confidence-bar-fill"
                          style={{ width: `${item.matchConfidence}%` }}
                        ></div>
                      </div>
                      <span className="confidence-percent">{item.matchConfidence}%</span>
                    </div>
                  </td>
                  <td className="td-status">
                    <span className={`status-pill status-${item.statusType}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
