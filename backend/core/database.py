from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import urllib.parse # <-- IMPORTA ESTA LIBRERÍA

# 1. Coloca tu contraseña cruda aquí
contrasena_cruda = "JRCYIOfer2?"

# 2. Python la convertirá a un formato seguro para la URL
contrasena_segura = urllib.parse.quote_plus(contrasena_cruda)

# 3. Arma la URL con la contraseña segura
SQLALCHEMY_DATABASE_URL = f"postgresql://postgres:{contrasena_segura}@localhost/circle_db"

# Configuramos el motor que se conectará a PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()