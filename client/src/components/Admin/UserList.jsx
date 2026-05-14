import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../hooks/useToast';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      const data = await apiFetch('/api/admin/users');
      setUsers(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (username) => {
    if (!confirm(`确定删除用户 ${username}？`)) return;
    try {
      await apiFetch(`/api/admin/users?username=${username}`, { method: 'DELETE' });
      showToast(`已删除用户 ${username}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <table className="user-table">
      <thead>
        <tr>
          <th>用户名</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.username}>
            <td>{u.username}</td>
            <td>{new Date(u.createdAt).toLocaleString()}</td>
            <td>
              {u.username !== 'admin' && (
                <button className="btn btn-danger btn-small" onClick={() => handleDelete(u.username)}>
                  删除
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
