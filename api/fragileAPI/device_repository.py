from device import Device
from database import DatabaseConnection

class DeviceRepository:
    def __init__(self, connection: DatabaseConnection):
        self.connection = connection

    def create_device(self, device: Device):
        conn = self.connection.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO devices (name, type, coordinates)
            VALUES (%s, %s, %s) RETURNING id
        ''', (device.name, device.type, device.coordinates))
        
        device.id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        return device
    
    def get_all(self):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices ORDER BY id")
        rows = cursor.fetchall()

        devices = []
        for row in rows:
            devices.append(Device(
                row[0],
                row[1],
                row[2],
                row[3]
            ))
              
        cursor.close()
        return devices
        
    def get_by_id(self, device_id: int):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM devices WHERE id = %s", (device_id,))
        row = cursor.fetchone()
        cursor.close()

        if row:
            return Device(
                row[0],
                row[1],
                row[2],
                row[3]
            )
        return None
    
    def update_device(self, device: Device):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE devices
            SET name = %s, type = %s, coordinates = %s
            WHERE id = %s
        ''', (device.name, device.type, device.coordinates, device.id))
        
        conn.commit()
        cursor.close()
        return device
    
    def delete_device(self, device_id: int):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM devices WHERE id = %s', (device_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted