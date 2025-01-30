import React from 'react';
import JoinQueueForm from './components/JoinQueueForm';
import QueueList from './components/QueueList';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Office Hours Queue</h1>
      <JoinQueueForm />
      <QueueList />
    </div>
  );
}

export default App;