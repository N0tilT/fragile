import './App.css'
import MapComponent from './components/MapComponent'
import EventFeed from './components/EventFeed'
import { useState, useCallback } from 'react'
import type { MapObject } from './variables'
import type { YMapLocationRequest } from '@yandex/ymaps3-types'

function App() {
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null)
  const [mapLocation, setMapLocation] = useState<YMapLocationRequest | null>(null)

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
      />
      <MapComponent 
        selectedObject={selectedObject}
        location={mapLocation}
        onMapClick={handleMapClick}
        onMarkerClick={handleEventClick}
      />
    </div>
  )
}

export default App