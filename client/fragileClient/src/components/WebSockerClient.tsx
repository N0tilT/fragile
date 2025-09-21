import React, { useState, useEffect } from 'react';

interface SensorData {
  value: string;
  datetime: string;
  radius: number;
  coordinates: string;
  type: string;
  level: "DANGER" | "UNSTABLE" | "CALM";
}

const WebSocketClient: React.FC = () => {
  const [data, setData] = useState<SensorData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected'>('Connecting');

  useEffect(() => {
    const ws = new WebSocket('ws://fragile-emulator1:8080/ws');

    ws.onopen = () => {
      setConnectionStatus('Connected');
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const newData: SensorData = JSON.parse(event.data);
        setData(newData);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setConnectionStatus('Disconnected');
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Sensor Data Monitor</h1>
      <p>Status: {connectionStatus}</p>
      
      {data && (
        <div>
          <h2>Last Received Data:</h2>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '5px',
            color: data.level === 'DANGER' ? '#d32f2f' : 
                   data.level === 'UNSTABLE' ? '#ffa000' : '#388e3c'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WebSocketClient;