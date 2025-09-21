from database import DatabaseConfig,DatabaseConnection
class MigrationManager:

    def __init__(self, config:DatabaseConfig):
        self.config = config
        self.connection = DatabaseConnection(self.config)

    def create_tables(self):
        #Initialize
        conn = self.connection.get_connection()
        cursor = conn.cursor()
        
        #Execution
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices(
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        type VARCHAR(100) NOT NULL,
                        coordinates VARCHAR(100) NOT NULL
                        )
            ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS incidents(
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(256) NOT NULL,
                        description VARCHAR(256) NOT NULL,
                        status VARCHAR(32) NOT NULL,
                        coordinates VARCHAR(128) NOT NULL,
                        device_id SERIAL references devices(id),
                        datetime TIMESTAMP WITH TIME ZONE NOT NULL
                        )
            ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data(
                        id SERIAL PRIMARY KEY,
                        device_id SERIAL references devices(id),
                        value DECIMAL(10,2) NOT NULL,
                        datetime TIMESTAMP WITH TIME ZONE NOT NULL
                        )
            ''')
        conn.commit()

        #Deinitialize
        cursor.close()
        conn.close()

    def prefill_devices(self):
        #Initialize
        conn = self.connection.get_connection()
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO devices (name, type, coordinates)
            VALUES (%s, %s, %s) RETURNING id
        ''', ("Radio-device", "radio", "[37.623082, 55.75254]"))

        cursor.execute('''
            INSERT INTO devices (name, type, coordinates)
            VALUES (%s, %s, %s) RETURNING id
        ''', ("Radio-device2", "radio", "[40.623082, 60.75254]"))

        cursor.execute('''
            INSERT INTO devices (name, type, coordinates)
            VALUES (%s, %s, %s) RETURNING id
        ''', ("Sound-device", "sound", "[38.623082, 56.75254]"))

        cursor.execute('''
            INSERT INTO devices (name, type, coordinates)
            VALUES (%s, %s, %s) RETURNING id
        ''', ("Laser-device", "laser", "[36.623082, 55.75254]"))
        
        conn.commit()
        #Deinitialize
        cursor.close()
        conn.close()