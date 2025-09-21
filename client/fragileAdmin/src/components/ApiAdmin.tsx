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

  // Функция для получения устройств
  const fetchDevices = async () => {
    try {
      const response = await fetch(`${BASE_ADDR}/devices`);
      const devicesData = await response.json();
      setDevices(devicesData);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  // Функция для получения данных
  const fetchData = async () => {
    try {
      const response = await fetch(`${BASE_ADDR}/data`);
      const data: ApiData[] = await response.json();
      
      data.forEach(item => {
        const device = devices.find(d => d.id === item.device_id);
        if (device) {
          processDataItem(item, device);
        }
      });
      
      lastRequestTime.current = new Date();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Функция обработки элемента данных
  const processDataItem = (item: ApiData, device: Device) => {
    const valueNum = parseFloat(item.value);
    let level: "DANGER" | "UNSTABLE" | "CALM" = "CALM";
    let radius = 20;

    if (valueNum > 100) {
      level = "DANGER";
      radius = 50;
    } else if (valueNum > 50) {
      level = "UNSTABLE";
      radius = 35;
    }

    const sensorData: SensorData = {
      value: item.value,
      datetime: item.datetime,
      radius,
      coordinates: device.coordinates,
      type: device.type,
      level
    };

    addObject(sensorData);
  };

  // Функция добавления объекта на карту
  const addObject = (data: SensorData) => {
    setObjects(prevObjects => {
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

  // Загрузка устройств при монтировании
  useEffect(() => {
    fetchDevices();
  }, []);

  // Настройка интервала для запросов данных
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Каждую минуту

    return () => clearInterval(interval);
  }, [devices]);

  return (
    <div style={{ padding: '20px' }}>
      <p>Последнее обновление: {lastRequestTime.current.toLocaleTimeString()}</p>
    </div>
  );
};

export default ApiAdmin;