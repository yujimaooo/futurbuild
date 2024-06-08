import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import logo from './logo.svg';
import PromptPage from './pages/PromptPage';
import InvestmentAnalysis from './pages/InvestmentAnalysis';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/prompt" />} />
          <Route path="/prompt" element={<PromptPage />} />
          <Route path="/investment-analysis" element={<InvestmentAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
