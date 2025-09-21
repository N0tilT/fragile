from database import DatabaseConfig, DatabaseConnection

# Функция для копирования БД
# config_source - конфигурация БД, которая копируется
# config_target - конфигурация БД, куда копируется БД database_source,
#дублируются данные incident, data
def replicate_database(config_source, config_target):
    db_connection_target = DatabaseConnection(config_target)
    db_connection_source = DatabaseConnection(config_source)
    conn_target = db_connection_target.get_connection()
    conn_source = db_connection_source.get_connection()
    
    cursor_target = conn_target.cursor()
    cursor_source = conn_source.cursor()

    cursor_target.execute("SELECT datetime FROM incidents ORDER BY id DESC LIMIT 1")
    result = cursor_target.fetchone()
    target_datetime = result[0] if result else None

    if target_datetime is None:
        cursor_source.execute("SELECT name, description, status, price, device_id, datetime FROM incidents")
        incidents = cursor_source.fetchall()
        for row in incidents:
            cursor_target.execute(
                "INSERT INTO incidents (name, description, status, price, device_id, datetime) VALUES (%s, %s, %s, %s, %s, %s)",
                row
            )
        
        cursor_source.execute("SELECT device_id, value, datetime FROM data")
        data_rows = cursor_source.fetchall()
        for row in data_rows:
            cursor_target.execute(
                "INSERT INTO data (device_id, value, datetime) VALUES (%s, %s, %s)",
                row
            )
    else:
        cursor_source.execute("SELECT name, description, status, price, device_id, datetime FROM incidents WHERE datetime > %s", (target_datetime,))
        incidents = cursor_source.fetchall()
        for row in incidents:
            cursor_target.execute(
                "INSERT INTO incidents (name, description, status, price, device_id, datetime) VALUES (%s, %s, %s, %s, %s, %s)",
                row
            )
    
        cursor_source.execute("SELECT device_id, value, datetime FROM data WHERE datetime > %s", (target_datetime,))
        data_rows = cursor_source.fetchall()
        for row in data_rows:
            cursor_target.execute(
                "INSERT INTO data (device_id, value, datetime) VALUES (%s, %s, %s)",
                row
            )

    conn_target.commit()
    cursor_target.close()
    cursor_source.close()
    db_connection_target.close_connection()
    db_connection_source.close_connection()
    print(f"Database {config_source.database} copied to {config_target.database}")