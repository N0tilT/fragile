import { useState } from "react";
import type { Incident } from "./types";
import {IncidentList} from "./List";
import {IncidentMap} from "./Map";
import { testIncidents } from "./data/testData";
function App() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const handleIncidentSelect = (incident: Incident | null) => {
    setSelectedIncident(incident);
    if (incident) {
      setActiveTab('map');
    }
  };

  const handleIncidentSelectFromList = (incident: Incident) => {
    setSelectedIncident(incident);
    setActiveTab('map');
  };

  const handleResolveIncident = (incidentId: number) => {
    // Логика для решения инцидента
    console.log(`Инцидент ${incidentId} отмечен как решенный`);
    // Здесь можно добавить обновление состояния или API вызов
    if (selectedIncident?.id === incidentId) {
      setSelectedIncident(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Система управления инцидентами</p>
      </header>
      
      <div className="tabs">
        <button 
          className={activeTab === 'map' ? 'active' : ''}
          onClick={() => setActiveTab('map')}
        >
          Карта
        </button>
        <button 
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          Список инцидентов
        </button>
      </div>
      
      <main className="main-content">
        {activeTab === 'map' ? (
          <IncidentMap incidents={[]} onIncidentSelect={function (incident: Incident): void {
            throw new Error("Function not implemented.");
          } } onResolveIncident={function (incidentId: number): void {
            throw new Error("Function not implemented.");
          } }          />
        ) : (
          <IncidentList 
            incidents={testIncidents} 
            onIncidentSelect={handleIncidentSelectFromList}
            onResolveIncident={handleResolveIncident}
          />
        )}
      </main>
      
      {selectedIncident && (
        <div className="sidebar">
          <button 
            className="close-sidebar"
            onClick={() => setSelectedIncident(null)}
          >
          
          </button>
          <h2>{selectedIncident.name}</h2>
          <p><strong>Точная дата:</strong> {new Date(selectedIncident.date).toLocaleString()}</p>
          <p><strong>Координаты центра:</strong> {selectedIncident.center[0].toFixed(4)}, {selectedIncident.center[1].toFixed(4)}</p>
          <p><strong>Статус:</strong> {
            selectedIncident.severity === 'high' ? 'Высокая важность' : 
            selectedIncident.severity === 'medium' ? 'Средняя важность' : 'Низкая важность'
          }</p>
          <p>{selectedIncident.description}</p>
          <div className="sidebar-actions">
            <button 
              className="view-on-map-btn"
              onClick={() => setActiveTab('map')}
            >
              Показать на карте
            </button>
            <button 
              className="resolve-btn"
              onClick={() => handleResolveIncident(selectedIncident.id)}
            >
              Решить инцидент
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;