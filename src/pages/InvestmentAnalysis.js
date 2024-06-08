import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './InvestmentAnalysis.css';

function InvestmentAnalysis() {
  const location = useLocation();
  const state = useMemo(() => location.state || {}, [location.state]);
  const analysisData = state.analysis || {};
  const initialData = state.initialData || {};

  const [prompt, setPrompt] = useState(initialData.prompt);
  const [income, setIncome] = useState(initialData.income);
  const [savings, setSavings] = useState(initialData.savings);
  const [debt, setDebt] = useState(initialData.debt);
  const [locationInput, setLocationInput] = useState(initialData.location);
  const [priceRange, setPriceRange] = useState(initialData.priceRange);
  const [analysis, setAnalysis] = useState({});
  const [textAnalysis, setTextAnalysis] = useState("No analysis available");
  const [councilRegulations, setCouncilRegulations] = useState("No regulations information available");
  const [error, setError] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("Location state:", state);
    console.log("Analysis data:", analysisData);
    if (analysisData.choices && analysisData.choices.length > 0 && analysisData.choices[0]?.message?.content) {
      try {
        const content = JSON.parse(analysisData.choices[0].message.content);
        console.log("Parsed content:", content); // Debug log
        if (content.analysis) {
          setAnalysis(content.analysis);
          setTextAnalysis(content.textAnalysis || "No analysis available");
          setCouncilRegulations(content.councilRegulations.replace(/\n/g, '<br>') || "No regulations information available");
        } else {
          console.error("No analysis found in the content");
        }
      } catch (error) {
        console.error("Error parsing JSON content:", error);
      }
    } else {
      console.error("Choices are not properly defined or message content is missing");
    }
  }, [state, analysisData]);

  const handleRegenerate = async () => {
    try {
      setError(''); // Clear previous errors
      const response = await axios.post('http://localhost:8000/analyze', {
        prompt,
        income,
        savings,
        debt,
        suburb: locationInput,
      });

      console.log(response.data);  // Handle the response as needed
      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0]?.message?.content) {
        try {
          const content = JSON.parse(response.data.choices[0].message.content);
          console.log("Parsed content:", content); // Debug log
          if (content.analysis) {
            setAnalysis(content.analysis);
            setTextAnalysis(content.textAnalysis || "No analysis available");
            setCouncilRegulations(content.councilRegulations.replace(/\n/g, '<br>') || "No regulations information available");
          } else {
            console.error("No analysis found in the content");
          }
        } catch (error) {
          console.error("Error parsing JSON content:", error);
          setError('Error parsing the response from the server.');
        }
      } else {
        console.error("Choices are not properly defined or message content is missing");
        setError('The server response was not properly defined.');
      }
    } catch (error) {
      console.error('Error sending prompt to the server:', error);
      setError('Error sending the request to the server.');
    }
  };

  const handleShowFloorPlan = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  useEffect(() => {
    if (isPopupVisible) {
      const floorPlanData = createFloorPlanData(prompt);
      drawFloorPlan(floorPlanData);
    }
  }, [isPopupVisible, prompt]);

  const createFloorPlanData = (prompt) => {
    const rooms = [
      {
        type: "livingRoom",
        label: "Living Room",
        position: { x: 7, y: 0 },
        size: { width: 6, height: 5 }
      },
      {
        type: "diningArea",
        label: "Dining Area",
        position: { x: 7, y: 5 },
        size: { width: 4, height: 3 }
      },
      {
        type: "kitchen",
        label: "Kitchen",
        position: { x: 11, y: 5 },
        size: { width: 3, height: 3 }
      },
      {
        type: "bedroom",
        label: "Bedroom 1",
        position: { x: 0, y: 0 },
        size: { width: 7, height: 5 }
      },
      {
        type: "bedroom",
        label: "Bedroom 2",
        position: { x: 13, y: 0 },
        size: { width: 7, height: 5 }
      },
      {
        type: "bathroom",
        label: "Bathroom 1",
        position: { x: 0, y: 5 },
        size: { width: 4, height: 2 }
      },
      {
        type: "bathroom",
        label: "Bathroom 2",
        position: { x: 14, y: 5 },
        size: { width: 3, height: 2 }
      }
    ];
    const doors = [
      { from: "Living Room", to: "Dining Area", position: { x: 9, y: 5 }, direction: "horizontal" },
      { from: "Living Room", to: "Bedroom 1", position: { x: 7, y: 2.5 }, direction: "vertical" },
      { from: "Living Room", to: "Bedroom 2", position: { x: 13, y: 2.5 }, direction: "vertical" },
      { from: "Dining Area", to: "Kitchen", position: { x: 11, y: 6 }, direction: "horizontal" },
      { from: "Bedroom 1", to: "Bathroom 1", position: { x: 2, y: 5 }, direction: "horizontal" },
      { from: "Bedroom 2", to: "Bathroom 2", position: { x: 15, y: 5 }, direction: "horizontal" }
    ];
    return {
      floorPlan: {
        dimensions: {
          width: 20,
          height: 10
        },
        rooms: rooms,
        doors: doors
      }
    };
  };

  const drawFloorPlan = (jsonData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = 25;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - jsonData.floorPlan.dimensions.width * scale) / 2;
    const offsetY = (canvas.height - jsonData.floorPlan.dimensions.height * scale) / 2;

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let x = 0; x <= jsonData.floorPlan.dimensions.width; x++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + x * scale, offsetY);
      ctx.lineTo(offsetX + x * scale, offsetY + jsonData.floorPlan.dimensions.height * scale);
      ctx.stroke();
    }
    for (let y = 0; y <= jsonData.floorPlan.dimensions.height; y++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + y * scale);
      ctx.lineTo(offsetX + jsonData.floorPlan.dimensions.width * scale, offsetY + y * scale);
      ctx.stroke();
    }

    jsonData.floorPlan.rooms.forEach(room => {
      const { x, y } = room.position;
      const { width, height } = room.size;
      ctx.fillStyle = '#ddd';
      ctx.fillRect(offsetX + x * scale, offsetY + y * scale, width * scale, height * scale);

      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX + x * scale, offsetY + y * scale, width * scale, height * scale);

      ctx.fillStyle = '#000';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(room.label, offsetX + (x + width / 2) * scale, offsetY + (y + height / 2) * scale);
    });

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    jsonData.floorPlan.doors.forEach(door => {
      const { x, y } = door.position;
      const radius = 5;
      ctx.beginPath();
      if (door.direction === "horizontal") {
        ctx.arc(offsetX + x * scale, offsetY + y * scale, radius, Math.PI, 0, false);
      } else {
        ctx.arc(offsetX + x * scale, offsetY + y * scale, radius, 3 * Math.PI / 2, Math.PI / 2, false);
      }
      ctx.stroke();
    });
  };

  return (
    <div className="investment-analysis-page">
      <div className="header">
      </div>
      <div className="content">
        <div className="left-section">
          <div className="prompt-section">
            <div className="prompt-container">
              <input
                type="text"
                className="prompt-input"
                placeholder="describe your dream home here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button className="prompt-button" onClick={handleRegenerate}>
                <FontAwesomeIcon icon={faHammer} />
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="info-container">
              <div className="info-box">
                <span>Your Income:</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="info-input"
                />
              </div>
              <div className="info-box">
                <span>Your Savings:</span>
                <input
                  type="number"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  className="info-input"
                />
              </div>
              <div className="info-box">
                <span>Your Debt:</span>
                <input
                  type="number"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  className="info-input"
                />
              </div>
              <div className="info-box">
                <span>Suburb:</span>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="info-input"
                />
              </div>
            </div>
            <div className="info-tiles">
              <div className="info-tile">
                <h3>Loan Amount</h3>
                <p>${analysis.loanAmount ? analysis.loanAmount.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="info-tile">
                <h3>Total Project Cost</h3>
                <p>${analysis.totalProjectCost ? analysis.totalProjectCost.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="info-tile">
                <h3>Annual Interest Rate</h3>
                <p>{analysis.annualInterestRate ? parseFloat(analysis.annualInterestRate).toFixed(2) : 'N/A'}%</p>
              </div>
              <div className="info-tile">
                <h3>Monthly Repayments</h3>
                <p>${analysis.monthlyRepayment ? analysis.monthlyRepayment.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="info-tile">
                <h3>Cost Variation</h3>
                <p>${analysis.costVariation ? analysis.costVariation.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="right-section">
          <button className="floor-plan-button" onClick={handleShowFloorPlan}>
            Show 2D Floor Plan
          </button>
          <div className="text-analysis">
            <p>{textAnalysis}</p>
          </div>
          <div className="council-analysis">
            <h3>Council Regulations</h3>
            <p dangerouslySetInnerHTML={{ __html: councilRegulations }} />
          </div>
        </div>
      </div>
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleClosePopup}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="floor-plan">
              <canvas ref={canvasRef} id="floorPlanCanvas" width="700" height="400"></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentAnalysis;
