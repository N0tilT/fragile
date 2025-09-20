import React, { useState } from 'react';
import FireMap from './components/Map';
import FireList from './components/List';
import type { FireData } from './types';
import { testFires } from './data/testData';
import './App.css';

function App() {
  const [selectedFire, setSelectedFire] = useState<FireData | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const handleFireSelect = (fire: FireData | null) => {
    setSelectedFire(fire);
    if (fire) {
      setActiveTab('map');
    }
  };

  const handleFireSelectFromList = (fire: FireData) => {
    setSelectedFire(fire);
    setActiveTab('map');
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>Интерактивная карта зон</p>
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
          Список пожаров
        </button>
      </div>
      
      <main className="main-content">
        {activeTab === 'map' ? (
          <FireMap 
            selectedFire={selectedFire} 
            onFireSelect={handleFireSelect} 
          />
        ) : (
          <FireList 
            fires={testFires} 
            onFireSelect={handleFireSelectFromList} 
          />
        )}
      </main>
      
      {selectedFire && (
        <div className="sidebar">
          <button 
            className="close-sidebar"
            onClick={() => setSelectedFire(null)}
          >
            ×
          </button>
          <h2>{selectedFire.name}</h2>
          <p><strong>Площадь:</strong> {selectedFire.area}</p>
          <p><strong>Дата:</strong> {selectedFire.date}</p>
          <p><strong>Координаты центра:</strong> {selectedFire.center[0].toFixed(4)}, {selectedFire.center[1].toFixed(4)}</p>
          <p><strong>Статус:</strong> {
            selectedFire.severity === 'high' ? 'Высокая опасность' : 
            selectedFire.severity === 'medium' ? 'Средняя опасность' : 'Низкая опасность'
          }</p>
          <p>{selectedFire.description}</p>
          <button 
            className="view-on-map-btn"
            onClick={() => setActiveTab('map')}
          >
            Показать на карте
          </button>
        </div>
      )}
    </div>
  );
}

export default App;