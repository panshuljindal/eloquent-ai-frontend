import React from 'react';
import ChatApp from './ChatApp';
import AuthPage from './pages/AuthPage';
import { useAuth } from './hooks/useAuth';

function App(): React.ReactElement {
  const { userId, guest } = useAuth();
  return userId || guest ? <ChatApp /> : <AuthPage />;
}

export default App;
