import React from 'react';
import './LocationSelector.css';

function LocationSelector({ selectedDistrict, onDistrictSelect, districts }) {
  return (
    <div className="location-selector">
      <h2>어디에서 달릴까요?</h2>
      <p className="subtitle">부산의 러닝 명소를 선택하세요</p>

      <div className="district-grid">
        {districts.map(district => (
          <button
            key={district.id}
            className={`district-card ${selectedDistrict === district.id ? 'selected' : ''}`}
            onClick={() => onDistrictSelect(district.id)}
          >
            <div className="district-icon">{district.icon || '📍'}</div>
            <div className="district-label">{district.label}</div>
            <div className="district-desc">{district.description}</div>
            {district.features && (
              <div className="district-features">
                {district.features.slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="feature-tag">{feature}</span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LocationSelector;
