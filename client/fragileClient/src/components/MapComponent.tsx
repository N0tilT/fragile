import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    LOCATION,
    getCircleGeoJSON,
    MAP_OBJECTS,
    getCircleStyle,
    type MapObject
} from '../variables';
import '../common.css';
import ReactDOM from 'react-dom';
import { MARGIN } from '../common';
import type { YMapLocationRequest } from '@yandex/ymaps3-types';

declare global {
    interface Window {
        ymaps3: any;
        React: any;
        ReactDOM: any;
    }
}

interface MapComponentProps {
    selectedObject: MapObject | null;
    location: YMapLocationRequest | null;
    onMapClick: () => void;
    onMarkerClick: (object: MapObject) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
    selectedObject,
    location,
    onMapClick,
    onMarkerClick
}) => {
    const [reactify, setReactify] = useState<any>(null);
    const [map, setMap] = useState<any>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ymaps3, setYmaps3] = useState<any>(null);
    const [objects, setObjects] = useState<MapObject[]>([]);
    const [circleGeometries, setCircleGeometries] = useState<Record<string, any>>({});
    const markerRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Установка местоположения карты при изменении location
    useEffect(() => {
        if (map && location) {
            map.setLocation(location);
        }
    }, [map, location]);

    // Загрузка ymaps3 и данных объектов
    useEffect(() => {
        const loadYmaps = async () => {
            if (!window.ymaps3) {
                console.error('ymaps3 not found');
                return;
            }

            try {
                await window.ymaps3.ready;
                setYmaps3(window.ymaps3);

                const ymaps3React = await window.ymaps3.import('@yandex/ymaps3-reactify');
                const reactifyInstance = ymaps3React.reactify.bindTo(React, ReactDOM);
                setReactify(reactifyInstance);

                // Загружаем геометрии для всех объектов
                const geometries: Record<string, any> = {};
                for (const obj of MAP_OBJECTS) {
                    geometries[obj.id] = await getCircleGeoJSON(obj.coordinates, obj.radius);
                }

                setCircleGeometries(geometries);
                setObjects(MAP_OBJECTS);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load ymaps3:', error);
            }
        };

        loadYmaps();
    }, []);

    const handleMarkerHover = useCallback((id: string | null) => {
        // Показываем подсказку только если нет выбранного объекта
        if (!selectedObject) {
            setHoveredId(id);
        }
    }, [selectedObject]);

    const handleMarkerClick = useCallback((object: MapObject, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем всплытие события
        onMarkerClick(object);
    }, [onMarkerClick]);

    if (isLoading) {
        return <div className="map-loading">Загрузка карты...</div>;
    }

    if (!reactify || !ymaps3) {
        return <div className="map-error">Ошибка загрузки карты</div>;
    }

    const {
        YMap,
        YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer,
        YMapFeature,
        YMapMarker
    } = reactify.module(ymaps3);

    return (
        <div className="map-container" onClick={onMapClick}>
            <button onClick={()=>console.log(map.zoom)}>TEST</button>
            <button onClick={()=>console.log(map.center)}>TEST2</button>
            <YMap
                location={LOCATION}
                margin={MARGIN}
                ref={setMap}
                showScaleInCopyrights={true}
            >
                <YMapDefaultSchemeLayer />
                <YMapDefaultFeaturesLayer />

                {/* Рендерим круги для всех объектов */}
                {objects.map(obj => (
                    <YMapFeature
                        key={obj.id}
                        geometry={circleGeometries[obj.id]}
                        style={getCircleStyle(obj.color)}
                    />
                ))}

                {/* Рендерим маркеры для всех объектов */}
                {objects.map(obj => (
                    <YMapMarker key={obj.id} coordinates={obj.coordinates}>
                        <div
                            ref={el => { markerRefs.current[obj.id] = el; }}
                            className={`marker-container ${selectedObject?.id === obj.id ? 'selected' : ''}`}
                            onMouseEnter={() => handleMarkerHover(obj.id)}
                            onMouseLeave={() => handleMarkerHover(null)}
                            onClick={(e) => handleMarkerClick(obj, e)}
                        >
                            <div className="marker">
                                <img alt="marker" className="image" src={obj.imageSrc} />
                            </div>
                            <div
                                className={`marker-text ${hoveredId === obj.id ? 'visible' : 'hidden'}`}
                            >
                                <span className="name">{obj.name}</span>
                                {obj.description && (
                                    <span className="description">{obj.description}</span>
                                )}
                            </div>
                        </div>
                    </YMapMarker>
                ))}
            </YMap>
        </div>
    );
};

export default MapComponent;