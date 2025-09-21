import './App.css'
import MapComponent from './components/MapComponent'
import EventFeed from './components/EventFeed'
import { useState, useCallback, useRef } from 'react'
import type { MapObject } from './variables'
import type { YMapLocationRequest } from '@yandex/ymaps3-types'
import { MAP_OBJECTS } from './variables'

function App() {
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null)
  const [mapLocation, setMapLocation] = useState<YMapLocationRequest | null>(null)
  const [objects, setObjects] = useState<MapObject[]>(MAP_OBJECTS)
  const objectsRef = useRef<MapObject[]>(MAP_OBJECTS)

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
    
    objectsRef.current = [...objectsRef.current, newObject]
    setObjects(objectsRef.current)
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
      <EventFeed 
        selectedObject={selectedObject}
        onEventClick={handleEventClick}
        objects={objects} // Передаем объекты в EventFeed
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