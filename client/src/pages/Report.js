import React, { useState, useEffect, useRef } from 'react';
import { expenses as expensesApi } from '../api/api';
import { useAuth } from '../AuthContext';

function fmt(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function PieChart({ spent, remaining, overBudget }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const strokeWidth = 22;

  const total = spent + Math.max(remaining, 0);
  const spentFrac = total === 0 ? 0 : Math.min(spent / total, 1);
  const circumference = 2 * Math.PI * r;
  const spentDash = spentFrac * circumference;
  const remainDash = circumference - spentDash;

  const spentColor = overBudget ? '#c0392b' : '#1a1917';
  const remainColor = '#e4e2dd';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={remainColor} strokeWidth={strokeWidth} />
      {/* Spent arc */}
      {spentFrac > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={spentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${spentDash} ${remainDash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      )}
      {/* Center label */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="13" fontWeight="600" fill="#1a1917" fontFamily="DM Mono, monospace">
        {Math.round(spentFrac * 100)}%
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="#6b6860" fontFamily="DM Sans, sans-serif">
        spent
      </text>
    </svg>
  );
}

export default function Report() {
  const { user } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currency = user?.homeCurrency || 'USD';

  useEffect(() => {
    expensesApi.report()
      .then(setReport)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalBudget = report.reduce((s, r) => s + r.budget, 0);
  const totalSpent = report.reduce((s, r) => s + r.totalSpent, 0);
  const remaining = totalBudget - totalSpent;
  const overBudget = totalSpent > totalBudget;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Monthly Report</h2>
          <p className="subtitle">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading report…</div>
      ) : error ? (
        <div className="error-msg">{error}</div>
      ) : report.length === 0 ? (
        <div className="empty-state">
          <span>◎</span>
          <p>No categories found. Add categories in Settings.</p>
        </div>
      ) : (
        <>
          {/* Summary row: stats + pie */}
          <div className="report-summary">
            <div className="report-stats">
              <div className="stat-card">
                <span className="stat-label">Total Budget</span>
                <span className="stat-value">{fmt(totalBudget, currency)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value" style={{ color: overBudget ? '#c0392b' : 'inherit' }}>
                  {fmt(totalSpent, currency)}
                </span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Remaining</span>
                <span className="stat-value" style={{ color: remaining < 0 ? '#c0392b' : '#2d7a52' }}>
                  {fmt(remaining, currency)}
                </span>
              </div>
            </div>

            <div className="pie-wrapper">
              <PieChart spent={totalSpent} remaining={remaining} overBudget={overBudget} />
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: overBudget ? '#c0392b' : '#1a1917' }} />
                  <span>Spent</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#e4e2dd' }} />
                  <span>Remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Per-category breakdown */}
          <div className="report-list">
            {report.map(r => (
              <div key={r.categoryId} className={`report-card ${r.overBudget ? 'over' : r.warning ? 'warn' : ''}`}>
                <div className="report-card-header">
                  <span className="report-category">{r.category}</span>
                  <span className={`report-badge ${r.overBudget ? 'badge-over' : r.warning ? 'badge-warn' : 'badge-ok'}`}>
                    {r.overBudget ? 'Over Budget' : r.warning ? 'Near Limit' : 'On Track'}
                  </span>
                </div>
                <div className="report-bar-track">
                  <div
                    className="report-bar-fill"
                    style={{
                      width: `${Math.min(r.percentUsed, 100)}%`,
                      background: r.overBudget ? '#c0392b' : r.warning ? '#f7c74f' : '#4fc98e'
                    }}
                  />
                </div>
                <div className="report-amounts">
                  <span>{fmt(r.totalSpent, currency)} spent</span>
                  <span>{r.percentUsed}%</span>
                  <span>of {fmt(r.budget, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}