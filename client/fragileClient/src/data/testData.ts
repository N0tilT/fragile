import type { FireData } from '../types';

export const testFires: FireData[] = [
  {
    id: 1,
    name: "Крупный лесной пожар в Сибири",
    coordinates: [
      [55.0, 83.0],
      [54.5, 84.5],
      [53.8, 83.8],
      [54.1, 82.9],
      [55.0, 83.0]
    ],
    center: [54.35, 83.55],
    severity: "high",
    area: "1200 га",
    date: "2025-09-15",
    description: "Крупный лесной пожар в Сибирском регионе с площадью возгорания около 1200 га. Привлекаются дополнительные силы МЧС. Очаг возгорания локализован на 60%, ведутся работы по полному тушению."
  },
  {
    id: 2,
    name: "Локальный пожар в Подмосковье",
    coordinates: [
      [55.7, 37.4],
      [55.6, 37.6],
      [55.5, 37.5],
      [55.6, 37.3],
      [55.7, 37.4]
    ],
    center: [55.6, 37.45],
    severity: "medium",
    area: "50 га",
    date: "2025-09-18",
    description: "Локальный лесной пожар в Подмосковье. Площадь возгорания около 50 га. Ситуация под контролем. Эвакуация населения не требуется."
  },
  {
    id: 3,
    name: "Торфяной пожар в Тверской области",
    coordinates: [
      [57.0, 35.9],
      [56.8, 36.1],
      [56.7, 35.8],
      [56.9, 35.7],
      [57.0, 35.9]
    ],
    center: [56.85, 35.875],
    severity: "low",
    area: "5 га",
    date: "2025-09-19",
    description: "Торфяной пожар на заброшенных полях. Площадь возгорания около 5 га. Задымление в близлежащих населенных пунктах. Рекомендовано ограничить пребывание на открытом воздухе."
  }
];

export const getFireStyle = (severity: FireData['severity']) => {
  const styles = {
    high: {
      fillColor: '#FF4136',
      strokeColor: '#B22222',
      iconColor: '#FF4136'
    },
    medium: {
      fillColor: '#FF851B',
      strokeColor: '#CC5500',
      iconColor: '#FF851B'
    },
    low: {
      fillColor: '#FFDC00',
      strokeColor: '#DAA520',
      iconColor: '#FFDC00'
    }
  };
  
  return styles[severity];
};