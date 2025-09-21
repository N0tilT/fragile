import React, { useState, useEffect, useRef } from 'react';

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
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Error'>('Connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname;
      const wsPort = '8081';
      ws.current = new WebSocket(`${protocol}//${wsHost}:${wsPort}/ws`);
      
      ws.current.onopen = () => {
        setConnectionStatus('Connected');
        setErrorMessage('');
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        try {
          const newData: SensorData = JSON.parse(event.data);
          //TODO: add to local DB
          //TODO: send to other clients
          setData(newData);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          setErrorMessage('Ошибка обработки данных с сервера');
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
        setErrorMessage('Ошибка соединения с сервером.');
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setConnectionStatus('Disconnected');
        
        if (reconnectTimeout.current) {
          window.clearTimeout(reconnectTimeout.current);
        }
        reconnectTimeout.current = window.setTimeout(() => {
          setConnectionStatus('Connecting');
          connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('Error');
      setErrorMessage('Не удалось установить соединение');
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeout.current) {
        window.clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleReconnect = () => {
    if (reconnectTimeout.current) {
      window.clearTimeout(reconnectTimeout.current);
    }
    setConnectionStatus('Connecting');
    connectWebSocket();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Sensor Data Monitor</h1>
      <p>Status: 
        <span style={{
          color: connectionStatus === 'Connected' ? 'green' : 
                 connectionStatus === 'Connecting' ? 'orange' : 'red',
          fontWeight: 'bold',
          marginLeft: '10px'
        }}>
          {connectionStatus}
        </span>
      </p>
      
      {errorMessage && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          {errorMessage}
        </div>
      )}
      
      {connectionStatus === 'Disconnected' && (
        <button onClick={handleReconnect} style={{ margin: '10px 0' }}>
          Переподключиться
        </button>
      )}
      
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