import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminInit() {
  const { adminInit } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (password !== confirm) {
      setError('两次密码不一致');
      return;
    }

    try {
      await adminInit(password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>管理员初始化</h2>
        <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
          首次使用，请设置管理员密码
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary">初始化</button>
        </form>
      </div>
    </div>
  );
}
