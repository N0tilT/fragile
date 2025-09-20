import React from 'react';
import { Polygon, Placemark } from '@pbe/react-yandex-maps';
import type { FireData } from '../types';
import { getFireStyle } from '../data/testData';

interface FireZoneProps {
  fireData: FireData;
  isSelected: boolean;
  onContextMenu: () => void;
}

const FireZone: React.FC<FireZoneProps> = ({ fireData, isSelected, onContextMenu }) => {
  const style = getFireStyle(fireData.severity);

  // Обработчик правого клика
  const handleContextMenu = (e: any) => {
    e.preventDefault();
    onContextMenu();
  };

  return (
    <>
      <Polygon
        geometry={[fireData.coordinates]}
        options={{
          fillColor: style.fillColor,
          strokeColor: style.strokeColor,
          strokeOpacity: 0.8,
          strokeWidth: isSelected ? 4 : 2,
          fillOpacity: isSelected ? 0.6 : 0.4
        }}
        properties={{
          hintContent: fireData.name,
          balloonContentHeader: fireData.name,
          balloonContent: `
            <div>
              <p><strong>Площадь:</strong> ${fireData.area}</p>
              <p><strong>Дата обнаружения:</strong> ${fireData.date}</p>
              <p>${fireData.description}</p>
            </div>
          `
        }}
      />
      
      <Placemark
        geometry={fireData.center}
        options={{
          iconColor: style.iconColor,
          preset: isSelected ? 'islands#redStarIcon' : 'islands#circleIcon',
          iconCaptionMaxWidth: '150px'
        }}
        properties={{
          iconCaption: fireData.name,
          hintContent: `Центр: ${fireData.name}`,
          balloonContent: `
            <div>
              <h3>${fireData.name}</h3>
              <p><strong>Площадь:</strong> ${fireData.area}</p>
              <p><strong>Дата:</strong> ${fireData.date}</p>
              <p><strong>Статус:</strong> ${
                fireData.severity === 'high' ? 'Высокая опасность' : 
                fireData.severity === 'medium' ? 'Средняя опасность' : 'Низкая опасность'
              }</p>
              <p>${fireData.description}</p>
            </div>
          `
        }}
        onContextMenu={handleContextMenu}
      />
    </>
  );
};

export default FireZone;