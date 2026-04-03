import sys
import subprocess
import time

# Agregamos el directorio actual al path para que Python encuentre la carpeta 'backend'
sys.path.append(".")

# Importamos las funciones que acabamos de crear en main.py
from backend.main import crear_base_datos, llenar_base_datos

def iniciar_solo_frontend():
    """Inicia únicamente el servidor de Expo."""
    print("\n📱 Iniciando SOLO Frontend (Expo Go)...")
    try:
        frontend_process = subprocess.Popen(
            ["npx", "expo", "start"],
            cwd="frontend",
            shell=True 
        )
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Apagando el servidor Frontend...")
        frontend_process.terminate()

def iniciar_servidores():
    """Inicia FastAPI y React Native al mismo tiempo en segundo plano."""
    print("\n🚀 Iniciando el Ecosistema Circle (Backend + Frontend)...")
    try:
        print("⚙️  Iniciando Backend (FastAPI)...")
        backend_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "--host", "0.0.0.0", "backend.main:app", "--port", "8000", "--reload"],
            shell=False
        )
        time.sleep(2) # Pausa para dejar que el backend respire

        print("📱 Iniciando Frontend (Expo)...")
        frontend_process = subprocess.Popen(
            ["npx", "expo", "start"],
            cwd="frontend",
            shell=True 
        )

        # Esperamos a que el usuario presione Ctrl+C
        backend_process.wait()
        frontend_process.wait()

    except KeyboardInterrupt:
        print("\n🛑 Apagando servidores de Circle...")
        backend_process.terminate()
        frontend_process.terminate()

def menu():
    while True:
        print("\n" + "="*50)
        print("🤖 MENÚ DE CONTROL: ECOSISTEMA CIRCLE")
        print("="*50)
        print("1. Crear (o resetear) base de datos en PostgreSQL")
        print("2. Llenar base de datos (Usuarios de prueba)")
        print("3. Ejecutar servidores (Backend + Frontend)")
        print("4. Ejecutar SOLO Frontend (Expo Go)")
        print("5. Salir")
        print("="*50)
        
        opcion = input("Elige una opción (1-5): ")
        
        if opcion == "1":
            seguro = input("⚠️ ATENCIÓN: Esto borrará todos los datos actuales. ¿Estás seguro? (s/n): ")
            if seguro.lower() == 's':
                crear_base_datos()
            else:
                print("Operación cancelada.")
                
        elif opcion == "2":
            llenar_base_datos()
            
        elif opcion == "3":
            iniciar_servidores()
            
        elif opcion == "4":
            iniciar_solo_frontend()
            
        elif opcion == "5":
            print("¡Hasta pronto! Cuidando tu ecosistema.")
            sys.exit()
        else:
            print("Opción no válida.")

if __name__ == "__main__":
    menu()