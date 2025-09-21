import React from 'react'
import { type MapObject, MAP_OBJECTS } from '../variables'
import '../EventFeed.css'

interface EventFeedProps {
  selectedObject: MapObject | null
  onEventClick: (object: MapObject) => void
}

const EventFeed: React.FC<EventFeedProps> = ({ selectedObject, onEventClick }) => {
  return (
    <div className="event-feed">
      <h2 className="event-feed-title">Экстренные ситуации</h2>
      <div className="events-list">
        {MAP_OBJECTS.map(obj => (
          <div
            key={obj.id}
            className={`event-card ${selectedObject?.id === obj.id ? 'selected' : ''}`}
            onClick={() => onEventClick(obj)}
          >
            <div className="event-header">
              <div 
                className="event-color-indicator" 
                style={{ backgroundColor: obj.color }}
              />
              <h3 className="event-name">{obj.name}</h3>
            </div>
            {obj.description && (
              <p className="event-description">{obj.description}</p>
            )}
            <div className="event-metadata">
              <span className="event-location">
                {obj.coordinates[1].toFixed(4)}, {obj.coordinates[0].toFixed(4)}
              </span>
              <span className="event-radius">Радиус: {obj.radius} м</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventFeed