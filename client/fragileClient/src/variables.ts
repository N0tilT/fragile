import type {DrawingStyle, LngLat, PolygonGeometry, YMapLocationRequest} from '@yandex/ymaps3-types';
import * as turf from '@turf/turf';

export const LOCATION: YMapLocationRequest = {
    center: [37.623082, 55.75254],
    zoom: 12
};

export const CIRCLE_CENTER: LngLat = [37.618536, 55.760257];
export const CIRCLE_RADIUS = 1500;
export const CIRCLE_STYLE: DrawingStyle = {
    simplificationRate: 0,
    stroke: [{color: '#006efc', width: 2}],
    fill: 'rgba(56, 56, 219, 0.2)'
};

export const getCircleGeoJSON = async (center: LngLat, radiusMeters: number): Promise<PolygonGeometry> => {
    const {geometry} = turf.circle(center, radiusMeters, {units: 'meters'});
    return geometry as PolygonGeometry;
};

export const BOUNDS: [LngLat, LngLat] = [
    [37.5, 55.7],
    [37.8, 55.8]
];

export const NAMES: Record<string, string> = {
    '0': 'Мой объект'
};

export const getImageSrc = (id: string): string => {
    return id === '0' ? './Objects.svg' : './Group7.svg';
};

// Добавим интерфейс для объектов карты
export interface MapObject {
    id: string;
    coordinates: LngLat;
    radius: number;
    color: string; // hex-цвет для круга
    name: string;
    description?: string;
    imageSrc: string;
}

// Список тестовых объектов
export const MAP_OBJECTS: MapObject[] = [
    {
        id: '1',
        coordinates: [37.618536, 55.760257],
        radius: 1500,
        color: '#00ff00', // зеленый
        name: 'Зеленый объект',
        description: 'Краткое описание объекта – он находится в центре города.',
        imageSrc: './Objects.svg'
    },
    {
        id: '2',
        coordinates: [37.63, 55.75],
        radius: 1000,
        color: '#ffff00', // желтый
        name: 'Желтый объект',
        imageSrc: './Group7.svg'
    },
    {
        id: '3',
        coordinates: [37.65, 55.74],
        radius: 2000,
        color: '#ff0000', // красный
        name: 'Красный объект',
        imageSrc: './Objects.svg'
    }
];

// Функция для получения стиля круга по цвету
export const getCircleStyle = (color: string): DrawingStyle => ({
    simplificationRate: 0,
    stroke: [{ color, width: 2 }],
    fill: `${color}33` // добавляем прозрачность 20%
});