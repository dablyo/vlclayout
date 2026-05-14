import { useState } from 'react';
import LayoutList from './LayoutList';
import ActionPanel from './ActionPanel';
import PropertyPanel from './PropertyPanel';
import ChangePassword from '../Auth/ChangePassword';
import { useAuth } from '../../hooks/useAuth';

function CollapsibleSection({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible-section">
      <div className="collapsible-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="collapsible-arrow">{open ? '▾' : '▸'}</span>
      </div>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <LayoutList />
      <ActionPanel />
      <PropertyPanel />
      <CollapsibleSection title="操作帮助" defaultOpen>
        <div className="help-content">
          <div className="help-item"><b>选中模组</b>：点击模组顶部绿色球，不支持多选</div>
          <div className="help-item"><b>取消选中</b>：点击地图空白区域</div>
          <div className="help-item"><b>移动模组</b>：选中后，Ctrl + 方向键</div>
          <div className="help-item"><b>移动地图</b>：方向键/鼠标右键拖拽</div>
          <div className="help-item"><b>旋转视角</b>：鼠标左键拖拽</div>
          <div className="help-item"><b>缩放视角</b>：鼠标滚轮</div>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title={`用户: ${user?.username}`} defaultOpen={false}>
        <ChangePassword />
        <button className="btn btn-small" onClick={logout} style={{ marginTop: 8 }}>
          退出登录
        </button>
      </CollapsibleSection>
    </div>
  );
}
