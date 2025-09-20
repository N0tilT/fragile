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
                        price DECIMAL(10,2) NOT NULL,
                        device_id SERIAL references devices(id),
                        datetime TIME WITH TIME ZONE NOT NULL
                        )
            ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data(
                        id SERIAL PRIMARY KEY,
                        device_id SERIAL references devices(id),
                        value DECIMAL(10,2) NOT NULL,
                        datetime TIME WITH TIME ZONE NOT NULL
                        )
            ''')
        conn.commit()

        #Deinitialize
        cursor.close()
        conn.close()
