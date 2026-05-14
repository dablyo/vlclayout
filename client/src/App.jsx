import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useModuleControls } from './hooks/useModuleControls';
import { SceneProvider } from './hooks/useScene';
import { LayoutProvider } from './hooks/useLayouts';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminInit from './components/Auth/AdminInit';
import AdminPanel from './components/Admin/AdminPanel';
import Sidebar from './components/Layout/Sidebar';
import Scene from './components/Canvas/Scene';

function LayoutEditor() {
  useModuleControls();
  return (
    <div className="app">
      <Sidebar />
      <div className="canvas-area">
        <Scene />
      </div>
    </div>
  );
}

function AuthScreen() {
  const { adminInitialized } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (adminInitialized === null) return null; // loading

  if (!adminInitialized) return <AdminInit />;

  return (
    <div className="auth-screen">
      {showRegister ? (
        <Register onSwitchToLogin={() => setShowRegister(false)} />
      ) : (
        <Login onSwitchToRegister={() => setShowRegister(true)} />
      )}
    </div>
  );
}

export default function App() {
  const { token, user } = useAuth();

  if (!token) return <AuthScreen />;

  if (user?.isAdmin) return <AdminPanel />;

  return (
    <SceneProvider>
      <LayoutProvider>
        <LayoutEditor />
      </LayoutProvider>
    </SceneProvider>
  );
}
