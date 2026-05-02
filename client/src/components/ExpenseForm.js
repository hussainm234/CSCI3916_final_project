import React, { useState, useEffect } from 'react';
import { expenses as expensesApi, categories as categoriesApi } from '../api/api';
import { useAuth } from '../AuthContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN'];

export default function ExpenseForm({ onClose, onSaved }) {
  const { user } = useAuth();
  const [cats, setCats] = useState([]);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(user?.homeCurrency || 'USD');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.list().then(data => {
      setCats(data);
      if (data.length > 0) setCategoryId(data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!amount || !currency || currency === user?.homeCurrency) {
      setPreview(null);
      return;
    }
    const t = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const data = await expensesApi.convert(amount, currency);
        setPreview(data);
      } catch {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [amount, currency, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) return setError('Please select a category');
    setError('');
    setSubmitting(true);
    try {
      const expense = await expensesApi.create({ amount: parseFloat(amount), currency, categoryId, note, date });
      onSaved(expense);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add Expense</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="expense-form">
          <div className="form-row">
            <div className="field">
              <label>Amount</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="field">
              <label>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {previewLoading && <p className="convert-preview">Converting…</p>}
          {preview && !previewLoading && (
            <p className="convert-preview">
              ≈ <strong>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: preview.to }).format(preview.converted)}
              </strong> {preview.to} <span className="rate-hint">(1 {preview.from} = {preview.rate} {preview.to})</span>
            </p>
          )}

          <div className="field">
            <label>Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              {cats.length === 0 && <option value="">No categories — add one in Settings</option>}
              {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>

          <div className="field">
            <label>Note <span className="optional">(optional)</span></label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Lunch with team"
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
