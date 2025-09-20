from database import DatabaseConnection
from data import Data

class DataRepository:
    def __init__(self, connection: DatabaseConnection):
        self.connection = connection

    def create_data(self, data: Data):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO data (device_id, value, datetime)
            VALUES (%s, %s, %s) RETURNING id
        ''', (data.device_id, data.value, data.datetime))
        
        data.id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        return data

    def get_all(self):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM data ORDER BY id")
        rows = cursor.fetchall()

        data_list = []
        for row in rows:
            data_list.append(Data(
                row[0], row[1], float(row[2]), row[3]
            ))
        
        cursor.close()
        return data_list

    def get_by_device_id(self, device_id: int):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM data WHERE device_id = %s ORDER BY datetime", (device_id,))
        rows = cursor.fetchall()
        
        data_list = []
        for row in rows:
            data_list.append(Data(
                row[0], row[1], float(row[2]), row[3]
            ))
        
        cursor.close()
        return data_list

    def delete_data(self, data_id: int):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM data WHERE id = %s', (data_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted