import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      setError('用户名需为3-20位字母数字');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (password !== confirm) {
      setError('两次密码不一致');
      return;
    }

    try {
      await register(username, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-card">
      <h2>注册</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>用户名</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>密码</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>确认密码</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button type="submit" className="btn btn-primary">注册</button>
      </form>
      <div className="auth-switch">
        已有账号？<a onClick={onSwitchToLogin}>登录</a>
      </div>
    </div>
  );
}
