import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import logo from './logo.svg';

// Import or define your components
import PromptPage from './pages/PromptPage';
import InvestmentAnalysis from './pages/InvestmentAnalysis';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <Switch>
          {/* Default route */}
          <Route exact path="/" render={() => <Redirect to="/prompt" />} />
          <Route path="/prompt" component={PromptPage} />
          <Route path="/investment-analysis" component={InvestmentAnalysis} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
