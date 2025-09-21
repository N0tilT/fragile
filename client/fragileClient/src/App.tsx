import './App.css'
import MapComponent from './components/MapComponent'
import EventFeed from './components/EventFeed'
import { useState, useCallback, useRef, useEffect } from 'react'
import type { MapObject } from './variables'
import type { YMapLocationRequest } from '@yandex/ymaps3-types'
import { MAP_OBJECTS } from './variables'
import WebSocketClient from './components/WebSockerClient'

function App() {
  // Загрузка начального состояния из localStorage
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null)
  const [mapLocation, setMapLocation] = useState<YMapLocationRequest | null>(null)
  const [objects, setObjects] = useState<MapObject[]>(() => {
    const stored = localStorage.getItem('mapObjects');
    return stored ? JSON.parse(stored) : MAP_OBJECTS;
  });
  const objectsRef = useRef<MapObject[]>(objects)

  // Сохранение объектов в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('mapObjects', JSON.stringify(objects));
    objectsRef.current = objects;
  }, [objects]);

  // Функция для добавления нового объекта
  const addNewObject = useCallback(() => {
    const newId = String(objectsRef.current.length + 1)
    const newObject: MapObject = {
      id: newId,
      coordinates: [37.618536 + (Math.random() - 0.5) * 0.1, 55.760257 + (Math.random() - 0.5) * 0.05],
      radius: 1000 + Math.random() * 1000,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      name: `Новый объект ${newId}`,
      description: 'Автоматически добавленный объект',
      imageSrc: './Objects.svg'
    }
    
    setObjects(prev => [...prev, newObject])
  }, [])

  const handleEventClick = useCallback((object: MapObject) => {
    setSelectedObject(object)
    setMapLocation({
      center: object.coordinates,
      zoom: 12,
      duration: 1000
    })
  }, [])

  const handleMapClick = useCallback(() => {
    setSelectedObject(null)
  }, [])

  return (
    <div className="app-container">
      <WebSocketClient objects={objects} setObjects={setObjects}/>
      <EventFeed 
        selectedObject={selectedObject}
        onEventClick={handleEventClick}
        objects={objects}
      />
      <button 
        className="add-object-btn"
        onClick={addNewObject}
        style={{position: 'absolute', top: '10px', right: '10px', zIndex: 1000, padding: '10px'}}
      >
        Добавить объект
      </button>
      <MapComponent 
        selectedObject={selectedObject}
        location={mapLocation}
        onMapClick={handleMapClick}
        onMarkerClick={handleEventClick}
        objects={objects}
      />
    </div>
  )
}

export default App