import psycopg2

class DatabaseConfig:
    '''Класс конфигурации БД'''
    def __init__(self,
                 database: str = "", 
                 host: str="", 
                 user:str = "", 
                 password:str = "",
                 port:int="5432"):
        self.host=host,
        self.database=database,
        self.user=user,
        self.password=password,
        self.port=port

    def get_connection_params(self):
        return{
            'host':self.host[0],
            'database':self.database[0],
            'user':self.user[0],
            'password':self.password[0],
            'port':self.port
        }
    
class DatabaseConnection:
    '''Класс подключения к БД'''

    def __init__(self, config:DatabaseConfig):
        self.config = config
        self._connection = None
    
    def get_connection(self):
        if self._connection is None or self._connection.closed:
            print(self.config.get_connection_params())
            self._connection = psycopg2.connect(**self.config.get_connection_params())
        return self._connection

    def close_connection(self):
        if self._connection and not self._connection.closed:
            self._connection.close()