import numpy as np
import json

# Generar datos de ejemplo
t = np.linspace(0, 2, 100)

datos = {
    "senales": {
        "senoidal": {
            "nombre": "Señal Senoidal",
            "tipo": "senoidal",
            "frecuencia": 1,
            "amplitud": 1,
            "x": t.tolist(),
            "y": np.sin(2 * np.pi * t).tolist()
        },
        "cuadrada": {
            "nombre": "Señal Cuadrada",
            "tipo": "cuadrada",
            "frecuencia": 1,
            "amplitud": 1,
            "x": t.tolist(),
            "y": np.sign(np.sin(2 * np.pi * t)).tolist()
        },
        "diente_sierra": {
            "nombre": "Señal Diente de Sierra",
            "tipo": "diente_sierra",
            "frecuencia": 1,
            "amplitud": 1,
            "x": t.tolist(),
            "y": (2 * (t * 1 % 1) - 1).tolist()
        }
    }
}

# Guardar como JSON
with open('datos_señales.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, indent=2, ensure_ascii=False)

print("Archivo datos_señales.json generado exitosamente.")