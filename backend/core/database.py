import os
import urllib.parse
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# 🌟 1. Cargamos las variables ocultas desde el archivo .env
load_dotenv()

Base = declarative_base()

# ==========================================
# 🌟 PATRÓN SINGLETON PARA LA BASE DE DATOS
# ==========================================
class DatabaseSingleton:
    _instancia = None # Aquí guardaremos la única instancia que existirá

    # El método __new__ se ejecuta ANTES de crear un objeto. 
    # Aquí es donde ocurre la "magia" del Singleton.
    def __new__(cls):
        if cls._instancia is None:
            # Si no existe, creamos la instancia
            cls._instancia = super(DatabaseSingleton, cls).__new__(cls)
            # Y la inicializamos por única vez
            cls._instancia._inicializar_conexion()
        
        # Si ya existía, simplemente devolvemos la misma de siempre
        return cls._instancia

    def _inicializar_conexion(self):
        """
        Esta función solo se ejecutará UNA VEZ en toda la vida útil de la app.
        """
        # 2. Leemos la contraseña desde el archivo .env de forma segura
        # Si no encuentra el archivo .env, usa "admin" por defecto para que no crashee
        contrasena_cruda = os.getenv("DB_PASSWORD", "admin") 
        
        contrasena_segura = urllib.parse.quote_plus(contrasena_cruda)
        
        # 3. Arma la URL con la contraseña segura
        self.database_url = f"postgresql://postgres:{contrasena_segura}@localhost/circle_db"

        # 4. Configuramos el motor (Engine) UNA SOLA VEZ
        self.engine = create_engine(self.database_url)

        # 5. Creamos la fábrica de sesiones UNA SOLA VEZ
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        
        print("⚙️ Motor de Base de Datos Inicializado (Patrón Singleton Activo)")

    def obtener_sesion(self):
        """Devuelve una sesión de base de datos nueva desde nuestra fábrica única"""
        return self.SessionLocal()


# ==========================================
# 🌟 INSTANCIACIÓN Y DEPENDENCIA PARA FASTAPI
# ==========================================

# Creamos el objeto Singleton (Si alguien más lo llama en otro archivo, le dará este mismo)
db_manager = DatabaseSingleton()

# Exportamos el motor y la Base por si los modelos (models.py) lo necesitan
engine = db_manager.engine

def get_db():
    """
    Función generadora para FastAPI.
    Abre una sesión para la petición HTTP y la cierra al terminar.
    """
    db = db_manager.obtener_sesion()
    try:
        yield db
    finally:
        db.close()