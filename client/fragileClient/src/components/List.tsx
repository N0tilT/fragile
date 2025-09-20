import React from 'react';
import type { FireData } from '../types';
import { getFireStyle } from '../data/testData';

interface FireListProps {
  fires: FireData[];
  onFireSelect: (fire: FireData) => void;
}

const FireList: React.FC<FireListProps> = ({ fires, onFireSelect }) => {
  return (
    <div className="fire-list">
      <h2>Активные пожары</h2>
      <div className="fires-container">
        {fires.map(fire => {
          const style = getFireStyle(fire.severity);
          
          return (
            <div 
              key={fire.id} 
              className="fire-item"
              onClick={() => onFireSelect(fire)}
            >
              <div 
                className="severity-indicator"
                style={{ backgroundColor: style.iconColor }}
              ></div>
              <div className="fire-info">
                <h3>{fire.name}</h3>
                <p><strong>Площадь:</strong> {fire.area}</p>
                <p><strong>Дата:</strong> {fire.date}</p>
                <p><strong>Координаты:</strong> {fire.center[0].toFixed(2)}, {fire.center[1].toFixed(2)}</p>
                <p className="fire-description">{fire.description.substring(0, 100)}...</p>
                <button 
                  className="view-on-map-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFireSelect(fire);
                  }}
                >
                  Показать на карте
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FireList;