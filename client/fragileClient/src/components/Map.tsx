import React, { useState, useEffect, useRef, useCallback } from 'react';
import { YMaps, Map, FullscreenControl, ZoomControl, TypeSelector } from '@pbe/react-yandex-maps';
import FireZone from './Zone';
import type { FireData, MapCenter } from '../types';
import { testFires } from '../data/testData';

interface FireMapProps {
  selectedFire: FireData | null;
  onFireSelect: (fire: FireData | null) => void;
}

const FireMap: React.FC<FireMapProps> = ({ selectedFire, onFireSelect }) => {
  const [fires, setFires] = useState<FireData[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<ymaps.Map | null>(null);

  const moveToFire = useCallback((fire: FireData) => {
    if (mapRef.current) {
      mapRef.current.setCenter(fire.center, 10);
    }
  }, []);

  useEffect(() => {
    if (selectedFire) {
      moveToFire(selectedFire);
    }
  }, [selectedFire, moveToFire]);

  useEffect(() => {
    const loadFireData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFires(testFires);
    };

    loadFireData();
  }, []);

  const defaultMapState = {
    center: [55.76, 37.64] as [number, number],
    zoom: 5,
  };

  return (
    <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
      <YMaps query={{ apikey: '', lang: 'ru_RU' }}>
        <Map 
          defaultState={defaultMapState} 
          width="100%" 
          height="100%"
          onLoad={() => setMapReady(true)}
          instanceRef={ref => {
            if (ref) {
              mapRef.current = ref;
            }
          }}
          modules={['control.ZoomControl', 'control.FullscreenControl', 'control.TypeSelector']}
        >
          <FullscreenControl />
          <ZoomControl />
          <TypeSelector />
          
          {fires.map(fire => (
            <FireZone 
              key={fire.id} 
              fireData={fire} 
              isSelected={selectedFire?.id === fire.id}
              onContextMenu={() => onFireSelect(fire)}
            />
          ))}
        </Map>
      </YMaps>
      
      {!mapReady && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          Загрузка карты...
        </div>
      )}
    </div>
  );
};

export default FireMap;