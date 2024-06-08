import React from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import './InvestmentAnalysis.css';

function InvestmentAnalysis() {
  const location = useLocation();
  const { analysis, text_analysis } = location.state || {};

  return (
    <div className="investment-analysis-page">
      <div className="prompt-section">
        <div className="prompt-container">
          <input
            type="text"
            className="prompt-input"
            placeholder="describe your dream home here..."
          />
          <button className="prompt-button">
            <FontAwesomeIcon icon={faHammer} />
          </button>
        </div>
        <div className="info-container">
          <div className="info-box">
            <span>Your Income:</span>
            <input
              type="number"
              value={analysis?.annual_income || 0}
              readOnly
              className="info-input"
            />
          </div>
          <div className="info-box">
            <span>Your Savings:</span>
            <input
              type="number"
              value={analysis?.savings || 0}
              readOnly
              className="info-input"
            />
          </div>
          <div className="info-box">
            <span>Your Debt:</span>
            <input
              type="number"
              value={analysis?.debt || 0}
              readOnly
              className="info-input"
            />
          </div>
        </div>
      </div>
      <div className="analysis-section">
        <div className="text-analysis">
          <p>{text_analysis || "No analysis available"}</p>
        </div>
        <div className="info-tiles">
          <div className="info-tile">
            <h3>Annual Income</h3>
            <p>${analysis?.annual_income || 0}</p>
          </div>
          <div className="info-tile">
            <h3>Savings</h3>
            <p>${analysis?.savings || 0}</p>
          </div>
          <div className="info-tile">
            <h3>Debt</h3>
            <p>${analysis?.debt || 0}</p>
          </div>
          <div className="info-tile">
            <h3>Loan Recommendation</h3>
            <p>{analysis?.loan_recommendation ? "Yes" : "No"}</p>
          </div>
          <div className="info-tile">
            <h3>Interest Rate</h3>
            <p>{analysis?.potential_interest_rate || 0}%</p>
          </div>
          <div className="info-tile">
            <h3>Financial Health</h3>
            <p>{analysis?.overall_financial_health || "Unknown"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestmentAnalysis;
