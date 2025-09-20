import React from 'react';
import type { Incident } from './types';


interface IncidentListProps {
  incidents: Incident[];
  onIncidentSelect: (incident: Incident) => void;
  onResolveIncident: (incidentId: number) => void;
}

export const IncidentMap: React.FC<IncidentListProps> = () => {
  return (
    
      <h2>Активные инциденты</h2>
      
  );
};