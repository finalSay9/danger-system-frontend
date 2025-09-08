// 'use client';

// import { useChat } from './hooks/useChat';
// import { LoginForm } from './components/LoginForm';
// import { ChatWindow } from './components/ChatWindow';

// export default function HomePage() {
//   const chatState = useChat();

//   if (!chatState.currentUser) {
//     return <LoginForm onLogin={chatState.login} />;
//   }

//   return (
//     <ChatWindow
//       chatState={chatState}
//       onSendMessage={chatState.sendMessage}
//       onLogout={chatState.logout}
//     />
//   );
// }