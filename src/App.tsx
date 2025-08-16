import React from 'react';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from './hooks/useAuth';

function App(): React.ReactElement {
  const { userId, guest } = useAuth();
  return userId || guest ? <ChatPage /> : <AuthPage />;
}

export default App;
