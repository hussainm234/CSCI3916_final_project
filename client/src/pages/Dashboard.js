import React, { useState, useEffect, useCallback } from 'react';
import { expenses as expensesApi } from '../api/api';
import { useAuth } from '../AuthContext';
import ExpenseForm from '../components/ExpenseForm';

function fmt(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function groupByMonth(expenseList) {
  const groups = {};
  expenseList.forEach(e => {
    const key = new Date(e.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return groups;
}

function categoryColor(name) {
  if (!name) return '#aaa';
  const colors = ['#4f8ef7', '#f7784f', '#4fc98e', '#c94fb2', '#f7c74f', '#4ff0f7', '#f74f6b'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [expenseList, setExpenseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await expensesApi.list();
      setExpenseList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setDeletingId(id);
    try {
      await expensesApi.delete(id);
      setExpenseList(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalThisMonth = () => {
    const now = new Date();
    return expenseList
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.convertedAmount, 0);
  };

  const grouped = groupByMonth(expenseList);
  const currency = user?.homeCurrency || 'USD';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Expenses</h2>
          <p className="subtitle">All transactions in {currency}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Expense</button>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-label">This Month</span>
          <span className="stat-value">{fmt(totalThisMonth(), currency)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Entries</span>
          <span className="stat-value">{expenseList.length}</span>
        </div>
      </div>

      {showForm && (
        <ExpenseForm
          onClose={() => setShowForm(false)}
          onSaved={(e) => { setExpenseList(prev => [e, ...prev]); setShowForm(false); }}
        />
      )}

      {loading ? (
        <div className="loading">Loading expenses…</div>
      ) : expenseList.length === 0 ? (
        <div className="empty-state">
          <span>◎</span>
          <p>No expenses yet. Add your first one!</p>
        </div>
      ) : (
        Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="expense-group">
            <h3 className="group-label">{month}</h3>
            <div className="expense-list">
              {items.map(e => (
                <div key={e._id} className="expense-row">
                  <div className="expense-category-dot" style={{ background: categoryColor(e.category?.name) }} />
                  <div className="expense-info">
                    <span className="expense-category">{e.category?.name || 'Uncategorized'}</span>
                    {e.note && <span className="expense-note">{e.note}</span>}
                  </div>
                  <div className="expense-amounts">
                    <span className="expense-converted">{fmt(e.convertedAmount, currency)}</span>
                    {e.originalCurrency !== currency && (
                      <span className="expense-original">
                        {fmt(e.amount, e.originalCurrency)}
                      </span>
                    )}
                  </div>
                  <span className="expense-date">
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(e._id)}
                    disabled={deletingId === e._id}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
