import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import './InvestmentAnalysis.css';

function InvestmentAnalysis() {
  const location = useLocation();
  const state = location.state || {};
  const analysisData = state.analysis || {};
  let analysis = {};
  let textAnalysis = "No analysis available";

  useEffect(() => {
    console.log("Location state:", state);
    console.log("Analysis data:", analysisData);
  }, [state, analysisData]);

  if (analysisData.choices && analysisData.choices.length > 0 && analysisData.choices[0]?.message?.content) {
    try {
      const content = JSON.parse(analysisData.choices[0].message.content);
      console.log("Parsed content:", content); // Debug log
      if (content.analysis) {
        analysis = content.analysis;
        textAnalysis = content.textAnalysis || "No analysis available";
      } else {
        console.error("No analysis found in the content");
      }
    } catch (error) {
      console.error("Error parsing JSON content:", error);
    }
  } else {
    console.error("Choices are not properly defined or message content is missing");
  }

  return (
    <div className="investment-analysis-page">
      <div className="left-section">
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
                value={analysis.annualIncome || 0}
                readOnly
                className="info-input"
              />
            </div>
            <div className="info-box">
              <span>Your Savings:</span>
              <input
                type="number"
                value={analysis.savings || 0}
                readOnly
                className="info-input"
              />
            </div>
            <div className="info-box">
              <span>Your Debt:</span>
              <input
                type="number"
                value={analysis.debt || 0}
                readOnly
                className="info-input"
              />
            </div>
          </div>
        </div>
        <div className="info-tiles">
          <div className="info-tile">
            <h3>Loan Recommendation</h3>
            <p>{analysis.loanRecommendation}</p>
          </div>
          <div className="info-tile">
            <h3>Interest Rate</h3>
            <p>{analysis.potentialInterestRate}</p>
          </div>
          <div className="info-tile">
            <h3>Financial Health</h3>
            <p>{analysis.overallFinancialHealth}</p>
          </div>
          <div className="info-tile">
            <h3>Risk Assessment</h3>
            <p>{analysis.riskAssessment}</p>
          </div>
        </div>
      </div>
      <div className="right-section">
        <div className="text-analysis">
          <p>{textAnalysis}</p>
        </div>
      </div>
    </div>
  );
}

export default InvestmentAnalysis;
