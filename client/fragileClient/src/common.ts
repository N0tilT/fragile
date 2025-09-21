import type {LngLat, LngLatBounds, Margin, YMapLocationRequest} from '@yandex/ymaps3-types';
import type {Feature} from '@yandex/ymaps3-clusterer';

export type ExpandedFeature = Feature & {id: string};

// Function for generating a pseudorandom number
const seed = (s: number) => () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
};

const rnd = seed(10000);

// Generating random coordinates of a point [lng, lat] in a given boundary
const getRandomPointCoordinates = (bounds: LngLatBounds): LngLat => [
    bounds[0][0] + (bounds[1][0] - bounds[0][0]) * rnd(),
    bounds[1][1] + (bounds[0][1] - bounds[1][1]) * rnd()
];

export const COMMON_LOCATION_PARAMS: Partial<YMapLocationRequest> = {easing: 'ease-in-out', duration: 2000};

export function getBounds(coordinates: number[][]): LngLatBounds {
    let minLat = Infinity,
        minLng = Infinity;
    let maxLat = -Infinity,
        maxLng = -Infinity;

    for (const coords of coordinates) {
        const lat = coords[1];
        const lng = coords[0];

        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    }

    return [
        [minLng, minLat],
        [maxLng, maxLat]
    ] as LngLatBounds;
}

// A function that creates an array with parameters for each clusterer random point
export const getRandomPoints = (bounds: LngLatBounds): ExpandedFeature[] => {
    return [{
        type: 'Feature',
        id: '0',
        geometry: {type: 'Point', coordinates: getRandomPointCoordinates(bounds)},
        properties: {
            name: 'marker',
            description: ''
        }
    }];
};

export const MARGIN: Margin = [100, 100, 100, 100];