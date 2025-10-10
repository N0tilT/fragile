import React, { useState, useEffect, useRef } from 'react';
import { BaseImages, Colors, type MapObject } from '../variables';

const BASE_ADDR = "http://172.31.0.39:8080"

interface SensorData {
  value: string;
  datetime: string;
  radius: number;
  coordinates: string;
  type: string;
  level: "DANGER" | "UNSTABLE" | "CALM";
}

interface Device {
  id: number;
  coordinates: string;
  type: string;
}

interface ApiData {
  id: number;
  device_id: number;
  value: string;
  datetime: string;
}

interface WebSockerClientProps {
  objects: MapObject[];
  setObjects: React.Dispatch<React.SetStateAction<MapObject[]>>
}

const ApiAdmin: React.FC<WebSockerClientProps> = ({ objects, setObjects }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const lastRequestTime = useRef<Date>(new Date());


  // Функция для получения данных
  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_ADDR}/incidents`);
      const data: any[] = await response.json();
   
      data.forEach(item => {
          processDataItem(item);
      });
      
      lastRequestTime.current = new Date();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Функция обработки элемента данных
  const processDataItem = (item: any) => {

    const valueNum = parseFloat(item.value);
    console.log(item);
    
    const sensorData: SensorData = {
      value: item.value,
      datetime: item.datetime,
      radius: 1000,
      coordinates: item.coordinates,
      type: "radio",
      level: item.status
    };

    addObject(sensorData);
  };

  // Функция добавления объекта на карту
  const addObject = (data: SensorData) => {
    setObjects(prevObjects => {
      console.log(data);
      
      const coordinates = JSON.parse(data.coordinates) as [number, number];
      const color = `#${Colors[data.level] || 'ffffff'}`;
      const image = BaseImages[data.level];

      const newObject: MapObject = {
        id: `sensor-${data.datetime}-${coordinates[0]}-${coordinates[1]}`,
        coordinates,
        radius: data.radius,
        color,
        name: `${data.type} - ${data.value}`,
        description: `Зарегистрировано: ${new Date(data.datetime).toLocaleString()}`,
        imageSrc: image
      };

      const existingObjectIndex = prevObjects.findIndex(obj =>
        obj.coordinates[0] === coordinates[0] &&
        obj.coordinates[1] === coordinates[1]
      );

      if (existingObjectIndex !== -1) {
        const updatedObjects = [...prevObjects];
        updatedObjects[existingObjectIndex] = newObject;
        return updatedObjects;
      } else {
        return [...prevObjects, newObject];
      }
    });
  };

  // Настройка интервала для запросов данных
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <p>Последнее обновление: {lastRequestTime.current.toLocaleTimeString()}</p>
    </div>
  );
};

export default ApiAdmin;