import os
from PIL import Image

# 1. Coloca aquí el nombre exacto de tus 4 imágenes PNG
imagenes = [
    "LogIn_Cafe.png", 
    "LogIn_Barber.png", 
    "LogIn_Abogado.png", # Cambia estos nombres por los reales
    "LogIn_Doctor.png"  # Cambia estos nombres por los reales
]

TARGET_WIDTH = 1080
TARGET_HEIGHT = 1920
TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT

def procesar_imagen(filename):
    if not os.path.exists(filename):
        print(f"⚠️ No se encontró {filename}, saltando...")
        return

    print(f"⏳ Procesando {filename}...")
    # Abrimos la imagen manteniendo la transparencia si la tiene
    img = Image.open(filename).convert("RGBA")
    width, height = img.size
    current_ratio = width / height

    # 2. Calcular el recorte (Crop) exacto desde el centro
    if current_ratio > TARGET_RATIO:
        # La imagen es muy ancha, recortamos los lados
        new_width = int(height * TARGET_RATIO)
        left = (width - new_width) / 2
        right = (width + new_width) / 2
        top = 0
        bottom = height
    else:
        # La imagen es muy alta, recortamos arriba y abajo
        new_height = int(width / TARGET_RATIO)
        left = 0
        right = width
        top = (height - new_height) / 2
        bottom = (height + new_height) / 2

    img_cropped = img.crop((left, top, right, bottom))

    # 3. Redimensionar usando LANCZOS (algoritmo de alta calidad)
    img_resized = img_cropped.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)

    # 4. Guardar imagen optimizada con un prefijo "opt_"
    output_name = f"opt_{filename}"
    img_resized.save(output_name, format="PNG", optimize=True)
    print(f"✅ Lista: {output_name} ({TARGET_WIDTH}x{TARGET_HEIGHT})")

if __name__ == "__main__":
    print("🛠️ Iniciando optimización de imágenes para Circle...")
    for img_name in imagenes:
        procesar_imagen(img_name)
    print("🎉 Proceso terminado. Usa las imágenes que empiezan con 'opt_' en React Native.")