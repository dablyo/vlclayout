import UserList from './UserList';
import { useAuth } from '../../hooks/useAuth';

export default function AdminPanel() {
  const { logout } = useAuth();

  return (
    <div className="admin-panel">
      <h1>用户管理</h1>
      <UserList />
      <button className="btn btn-danger" onClick={logout} style={{ marginTop: 20 }}>
        退出登录
      </button>
    </div>
  );
}
