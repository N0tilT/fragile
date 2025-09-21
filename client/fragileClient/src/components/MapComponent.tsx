import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
    LOCATION,
    getCircleGeoJSON,
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
    objects: MapObject[];
}

const MapComponent: React.FC<MapComponentProps> = ({
    selectedObject,
    location,
    onMapClick,
    onMarkerClick,
    objects
}) => {
    const [reactify, setReactify] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ymaps3, setYmaps3] = useState<any>(null);
    const [circleGeometries, setCircleGeometries] = useState<Record<string, any>>({});
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const markerRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const mapRef = useRef<any>(null);
    const currentLocation = useRef<YMapLocationRequest>(LOCATION);
    const isMapInteracting = useRef(false);

    // Установка местоположения карты при изменении location
    useEffect(() => {
        if (location && !isMapInteracting.current) {
            currentLocation.current = location;
            if (mapRef.current) {
                mapRef.current.setLocation(location);
            }
        }
    }, [location]);

    // Загрузка ymaps3
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
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to load ymaps3:', error);
            }
        };

        loadYmaps();
    }, []);

    // Загрузка геометрий для объектов
    useEffect(() => {
        const loadGeometries = async () => {
            const geometries: Record<string, any> = {};
            for (const obj of objects) {
                if (!circleGeometries[obj.id]) {
                    geometries[obj.id] = await getCircleGeoJSON(obj.coordinates, obj.radius);
                }
            }
            setCircleGeometries(prev => ({ ...prev, ...geometries }));
        };

        if (objects.length > 0) {
            loadGeometries();
        }
    }, [objects]);

    const handleMarkerHover = useCallback((id: string | null) => {
        // Показываем подсказку всегда, независимо от выделенного объекта
        setHoveredId(id);
    }, []);

    const handleMarkerClick = useCallback((object: MapObject, e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkerClick(object);
    }, [onMarkerClick]);

    const handleMapInteraction = useCallback(() => {
        isMapInteracting.current = true;
        // Сбрасываем выделение при взаимодействии с картой
        onMapClick();
    }, [onMapClick]);

    const handleMapUpdate = useCallback((event: any) => {
        if (event.location) {
            currentLocation.current = event.location;
            isMapInteracting.current = false;
        }
    }, []);

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
        YMapMarker,
        YMapListener
    } = reactify.module(ymaps3);

    return (
        <div className="map-container">
            <YMap
                location={currentLocation.current}
                margin={MARGIN}
                onUpdate={handleMapUpdate}
                ref={mapRef}
                showScaleInCopyrights={true}
            >
                <YMapDefaultSchemeLayer />
                <YMapDefaultFeaturesLayer />
                
                {/* Слушатель событий карты */}
                <YMapListener
                    onUpdate={handleMapUpdate}
                    onClick={handleMapInteraction}
                    onWheel={handleMapInteraction}
                    onDrag={handleMapInteraction}
                />

                {/* Рендерим круги для всех объектов */}
                {objects.map(obj => (
                    circleGeometries[obj.id] && (
                        <YMapFeature
                            key={obj.id}
                            geometry={circleGeometries[obj.id]}
                            style={getCircleStyle(obj.color)}
                        />
                    )
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