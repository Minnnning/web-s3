import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  // 아이템 목록 가져오기
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchItems();
  }, []);

  // 폼 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 아이템 생성
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to create item');
      
      setFormData({ name: '', description: '' });
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // 아이템 수정
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/items/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update item');
      
      setFormData({ name: '', description: '' });
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // 아이템 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    setError(null);
    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // 수정 모드 시작
  const startEdit = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description || '' });
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Item Manager</h1>
        <p>FastAPI + React + AWS</p>
      </header>

      <main className="container">
        {error && (
          <div className="error-message">
            ⚠️ Error: {error}
          </div>
        )}

        {/* 폼 섹션 */}
        <section className="form-section">
          <h2>{editingId ? '✏️ Edit Item' : '➕ Add New Item'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter item name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter item description"
                rows="3"
              />
            </div>
            
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* 아이템 목록 섹션 */}
        <section className="items-section">
          <div className="section-header">
            <h2>📋 Items List</h2>
            <button onClick={fetchItems} className="btn btn-refresh" disabled={loading}>
              {loading ? '⏳ Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <div className="loading">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>No items yet. Create your first item above! 👆</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="item-id">#{item.id}</span>
                  </div>
                  
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  
                  <div className="item-footer">
                    <span className="item-date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <div className="item-actions">
                      <button 
                        onClick={() => startEdit(item)} 
                        className="btn btn-sm btn-edit"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className="btn btn-sm btn-delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="App-footer">
        <p>Powered by FastAPI, React, and AWS 🌟</p>
      </footer>
    </div>
  );
}

export default App;