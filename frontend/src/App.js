import React from 'react';
import JoinQueueForm from './components/JoinQueueForm';
import QueueList from './components/QueueList';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Office Hours Queue</h1>
      <JoinQueueForm />
      <QueueList />
      <hr />
      <AdminPanel />  {/* Add this line */}
    </div>
  );
}

export default App;