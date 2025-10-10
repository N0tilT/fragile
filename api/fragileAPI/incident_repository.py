from database import DatabaseConnection
from incident import Incident

class IncidentRepository:
    def __init__(self, connection: DatabaseConnection):
        self.connection = connection

    def create_incident(self, incident: Incident):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO incidents (name, description, status, coordinates, device_id, datetime, value)
            VALUES (%s, %s, %s, %s, %s, %s,%s) RETURNING id
        ''', (incident.name, incident.description, incident.status, 
              incident.coordinates, incident.device_id, incident.datetime,incident.value))
        conn.commit()
        cursor.close()
        return

    def get_all(self):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents ORDER BY id")
        rows = cursor.fetchall()

        incidents = []
        for row in rows:
            incidents.append(Incident(
                row[0], row[1], row[2], row[3], 
                row[4], row[5], row[6], float(row[7])
            ))
        
        cursor.close()
        return incidents

    def get_by_id(self, incident_id: int):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents WHERE id = %s", (incident_id,))
        row = cursor.fetchone()
        cursor.close()

        if row:
            return Incident(
                row[0], row[1], row[2], row[3],
                float(row[4]), row[5], row[6], float(row[7])
            )
        return None

    def update_incident(self, incident: Incident):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE incidents 
            SET name = %s, description = %s, status = %s, 
                coordinates = %s, device_id = %s, datetime = %s, value = %s
            WHERE id = %s
        ''', (incident.name, incident.description, incident.status,
              incident.coordinates, incident.device_id, incident.datetime,incident.value, incident.id))
        
        conn.commit()
        cursor.close()
        return incident

    def delete_incident(self, incident_id: int):
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM incidents WHERE id = %s', (incident_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        cursor.close()
        return deleted