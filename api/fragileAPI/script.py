from database import DatabaseConfig,DatabaseConnection

# Функция для копирования БД
# config_source - конфигурация БД, которая копируется
# config_target - конфигурация БД, куда копируется БД database_source,
#дублируются данные incident, data
def replicate_database(config_source, config_target):
    db_connection_target = DatabaseConnection(config_target)
    db_connection_source = DatabaseConnection(config_source)
    db_connection_target.get_connection()
    db_connection_source.get_connection()

    cursor_target = db_connection_target.get_connection().cursor()
    cursor_source = db_connection_source.get_connection().cursor()


    target_datetime = cursor_target.execute("SELECT datetime FROM incidents ORDER BY id DESC LIMIT 1").fetchone()[0]
    

    cursor_source.execute("SELECT * FROM incidents WHERE datetime > %s", (target_datetime,))
    if cursor_source.rowcount != 0:
        for row in cursor_source.fetchall():
            cursor_target.execute("INSERT INTO incidents (name, description, status, price, device_id, datetime) VALUES (%s, %s, %s, %s, %s, %s)", row)
    
    cursor_source.execute("SELECT * FROM data WHERE datetime > %s", (target_datetime,))
    if cursor_source.rowcount != 0:
        for row in cursor_source.fetchall():
            cursor_target.execute("INSERT INTO data (device_id, value, datetime) VALUES (%s, %s, %s)", row)

    cursor_target.close()
    db_connection_target.close_connection()
    db_connection_source.close_connection()
    print("Database {} copied to {}".format(database_source, database_target))
    