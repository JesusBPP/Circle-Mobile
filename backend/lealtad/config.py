"""
===============================================================================
MÓDULO: LEALTAD — CONFIGURACIÓN
===============================================================================
Propósito:
    Centraliza las constantes de configuración exclusivas del dominio de Lealtad.
    Lee valores desde variables de entorno con fallback a valores por defecto
    para desarrollo.

Qué DEBE ir aquí:
    - Secretos específicos del dominio (QR_SECRET_KEY)
    - Constantes de tiempo de vida de tokens (QR_EXPIRATION_MINUTES)
    - Algoritmos de firma (ALGORITHM)

Qué NO debe ir aquí:
    - Configuración global de JWT (va en core/config.py)
    - Configuración de BD (va en core/database.py)
    - Lógica de negocio (va en service.py)

Dependencias de otros archivos del dominio:
    - service.py importa QR_SECRET_KEY, ALGORITHM, QR_EXPIRATION_MINUTES
===============================================================================
"""

import os

QR_SECRET_KEY = os.getenv("QR_SECRET_KEY", "circle_qr_token_secure_key_enterprise_grade_2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
QR_EXPIRATION_MINUTES = int(os.getenv("QR_EXPIRATION_MINUTES", "3"))
