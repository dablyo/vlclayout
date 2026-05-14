import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('密码至少6位', 'error');
      return;
    }
    if (newPassword !== confirm) {
      showToast('两次密码不一致', 'error');
      return;
    }
    try {
      await changePassword(newPassword);
      showToast('密码修改成功', 'success');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <div className="form-group">
        <label>新密码</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <div className="form-group">
        <label>确认新密码</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-small">修改密码</button>
    </form>
  );
}
