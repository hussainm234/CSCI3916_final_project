import React, { useState, useEffect } from 'react';
import { categories as categoriesApi, auth as authApi } from '../api/api';
import { useAuth } from '../AuthContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN'];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [currency, setCurrency] = useState(user?.homeCurrency || 'USD');
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [currencyMsg, setCurrencyMsg] = useState('');

  useEffect(() => {
    categoriesApi.list()
      .then(setCats)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName || !newBudget) return;
    setAdding(true);
    try {
      const cat = await categoriesApi.create(newName, parseFloat(newBudget));
      setCats(prev => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName(''); setNewBudget('');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditBudget(String(cat.monthlyBudget));
  };

  const handleEdit = async (id) => {
    try {
      const updated = await categoriesApi.update(id, editName, parseFloat(editBudget));
      setCats(prev => prev.map(c => c._id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)));
      setEditId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Related expenses will lose their category.')) return;
    try {
      await categoriesApi.delete(id);
      setCats(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCurrencyUpdate = async () => {
    setSavingCurrency(true);
    try {
      const updated = await authApi.updateCurrency(currency);
      updateUser({ homeCurrency: updated.homeCurrency });
      setCurrencyMsg('Saved!');
      setTimeout(() => setCurrencyMsg(''), 2000);
    } catch (err) {
      setCurrencyMsg(err.message);
    } finally {
      setSavingCurrency(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="subtitle">Manage categories and preferences</p>
        </div>
      </div>

      {/* Home Currency */}
      <section className="settings-section">
        <h3>Home Currency</h3>
        <div className="currency-row">
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="btn-primary" onClick={handleCurrencyUpdate} disabled={savingCurrency}>
            {savingCurrency ? 'Saving…' : 'Update'}
          </button>
          {currencyMsg && <span className="currency-msg">{currencyMsg}</span>}
        </div>
      </section>

      {/* Categories */}
      <section className="settings-section">
        <h3>Categories & Budgets</h3>
        <form onSubmit={handleAdd} className="add-cat-form">
          <input
            placeholder="Category name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Monthly budget"
            value={newBudget}
            onChange={e => setNewBudget(e.target.value)}
            min="0"
            step="0.01"
            required
          />
          <button type="submit" className="btn-primary" disabled={adding}>
            {adding ? 'Adding…' : '+ Add'}
          </button>
        </form>

        {loading ? (
          <div className="loading">Loading…</div>
        ) : cats.length === 0 ? (
          <p className="empty-inline">No categories yet.</p>
        ) : (
          <div className="cat-list">
            {cats.map(cat => (
              <div key={cat._id} className="cat-row">
                {editId === cat._id ? (
                  <>
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="cat-edit-input" />
                    <input type="number" value={editBudget} onChange={e => setEditBudget(e.target.value)} className="cat-edit-budget" min="0" step="0.01" />
                    <button className="btn-small btn-save" onClick={() => handleEdit(cat._id)}>Save</button>
                    <button className="btn-small" onClick={() => setEditId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-budget">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.homeCurrency || 'USD' }).format(cat.monthlyBudget)}/mo
                    </span>
                    <button className="btn-small" onClick={() => startEdit(cat)}>Edit</button>
                    <button className="btn-small btn-danger" onClick={() => handleDelete(cat._id)}>Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
