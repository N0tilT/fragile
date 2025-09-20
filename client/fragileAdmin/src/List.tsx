import React from 'react';
import type { Incident } from './types';


interface IncidentListProps {
  incidents: Incident[];
  onIncidentSelect: (incident: Incident) => void;
  onResolveIncident: (incidentId: number) => void;
}

const getIncidentStyle = (severity: Incident['severity']) => {
  const styles = {
    high: {
      fillColor: '#FF4136',
      strokeColor: '#B22222',
      iconColor: '#FF4136'
    },
    medium: {
      fillColor: '#FF851B',
      strokeColor: '#CC5500',
      iconColor: '#FF851B'
    },
    low: {
      fillColor: '#FFDC00',
      strokeColor: '#DAA520',
      iconColor: '#FFDC00'
    }
  };
  
  return styles[severity];
};

export const IncidentList: React.FC<IncidentListProps> = ({ incidents, onIncidentSelect, onResolveIncident }) => {
  return (
    <div className="incident-list">
      <h2>Активные инциденты</h2>
      <div className="incidents-container">
        {incidents.map(incident => {
          const style = getIncidentStyle(incident.severity);
          
          return (
            <div 
              key={incident.id} 
              className="incident-item"
              onClick={() => onIncidentSelect(incident)}
            >
              <div 
                className="severity-indicator"
                style={{ backgroundColor: style.iconColor }}
              ></div>
              <div className="incident-info">
                <h3>{incident.name}</h3>
                <p><strong>Точная дата:</strong> {new Date(incident.date).toLocaleString()}</p>
                <p><strong>Координаты:</strong> {incident.center[0].toFixed(2)}, {incident.center[1].toFixed(2)}</p>
                <p className="incident-description">{incident.description.substring(0, 100)}...</p>
                <div className="incident-actions">
                  <button 
                    className="view-on-map-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIncidentSelect(incident);
                    }}
                  >
                    Показать на карте
                  </button>
                  <button 
                    className="resolve-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveIncident(incident.id);
                    }}
                  >
                    Решить
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};