import sys
import os
import subprocess
import time
import atexit

# =============================================================================
# 🌟 MEJOR PRÁCTICA: Resolución Absoluta de Rutas
# Garantiza que Python encuentre los módulos sin importar desde dónde ejecutes el script
# =============================================================================
ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.datosprueba_BD import crear_base_datos, llenar_base_datos

# =============================================================================
# 🌟 MEJOR PRÁCTICA: Prevención de Procesos Zombis (Fugas de Memoria)
# =============================================================================
procesos_activos = []

def limpiar_procesos():
    """Hook que se ejecuta automáticamente al morir el script para liberar los puertos."""
    for p in procesos_activos:
        if p.poll() is None:  # Si el proceso sigue vivo
            p.terminate()
            p.wait() # Espera a que termine de morir de forma segura
    if procesos_activos:
        print("\n🧹 Puertos liberados y procesos finalizados correctamente.")

# Registramos el hook para que reaccione incluso si hay un error fatal
atexit.register(limpiar_procesos)

# =============================================================================
# LÓGICA DE EJECUCIÓN
# =============================================================================

def iniciar_solo_frontend():
    """Inicia únicamente el servidor de Expo."""
    print("\n📱 Iniciando SOLO Frontend (Expo Go)...")
    try:
        frontend_process = subprocess.Popen(
            ["npx", "expo", "start"],
            cwd=os.path.join(ROOT_DIR, "frontend"), # Ruta absoluta
            shell=True 
        )
        procesos_activos.append(frontend_process)
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Apagando el servidor Frontend...")

def iniciar_servidores():
    """Inicia FastAPI y React Native al mismo tiempo en segundo plano."""
    print("\n🚀 Iniciando el Ecosistema Circle (Backend + Frontend)...")
    try:
        print("⚙️  Iniciando Backend (FastAPI)...")
        # El comando 'backend.main:app' funciona perfecto gracias al patrón Application Factory que implementamos
        backend_process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
            cwd=ROOT_DIR,
            shell=False
        )
        procesos_activos.append(backend_process)
        
        time.sleep(3) # Pausa estratégica para dejar que la base de datos y FastAPI respiren

        print("📱 Iniciando Frontend (Expo)...")
        frontend_process = subprocess.Popen(
            ["npx", "expo", "start"],
            cwd=os.path.join(ROOT_DIR, "frontend"),
            shell=True 
        )
        procesos_activos.append(frontend_process)

        # Mantenemos el hilo principal vivo esperando a los subprocesos
        backend_process.wait()
        frontend_process.wait()

    except KeyboardInterrupt:
        print("\n🛑 Apagando servidores de Circle...")

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
            sys.exit(0) # Salida limpia del sistema operativo
        else:
            print("Opción no válida. Intenta nuevamente.")

if __name__ == "__main__":
    # Verificación de compatibilidad de plataforma para subprocesos
    if sys.platform == "win32":
        # Evita que el evento Ctrl+C mate al subproceso de Expo antes de que atexit lo limpie de forma segura
        os.environ["FORce_COLOR"] = "1" 
        
    menu()