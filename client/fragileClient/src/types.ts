export interface FireData {
  id: number;
  name: string;
  coordinates: [number, number][];
  center: [number, number];
  severity: 'high' | 'medium' | 'low';
  area: string;
  date: string;
  description: string;
}

export interface FireStyle {
  fillColor: string;
  strokeColor: string;
  iconColor: string;
}

export interface MapCenter {
  center: [number, number];
  zoom: number;
}