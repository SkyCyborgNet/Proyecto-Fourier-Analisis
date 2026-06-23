"""
================================================================================
MÓDULO 4: DOCUMENTACIÓN Y PREPARACIÓN PARA GITHUB
ANÁLISIS DE SEÑALES CON TRANSFORMADA DE FOURIER
================================================================================

Este módulo integra todos los análisis realizados y prepara la documentación
completa para el repositorio de GitHub. Incluye:

1. Generación de documentación automática
2. Creación de archivos README
3. Estructuración del repositorio
4. Análisis integrado final
5. Exportación de resultados

Autor: [Nombre del Estudiante]
Fecha: [Fecha]
Curso: Señales y Sistemas
================================================================================
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq, fftshift
import os
import json
from datetime import datetime

print("=" * 70)
print("MÓDULO 4: DOCUMENTACIÓN Y PREPARACIÓN PARA GITHUB")
print("=" * 70)
print(f"Fecha de generación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 70)

# ============================================================
# 1. CARGA DE DATOS DE MÓDULOS ANTERIORES
# ============================================================

def cargar_datos():
    """Carga los datos de los módulos anteriores si existen."""
    try:
        datos = np.load('señales_generadas.npz')
        t = datos['t']
        pulso_rect = datos['pulso_rect']
        escalon = datos['escalon']
        senoidal = datos['senoidal']
        pulso_variante = datos['pulso_variante']
        senoidal_amort = datos['senoidal_amort']
        print("✅ Datos cargados desde 'señales_generadas.npz'")
        return t, pulso_rect, escalon, senoidal, pulso_variante, senoidal_amort
    except FileNotFoundError:
        print("⚠️ Generando datos de respaldo...")
        FS = 1000
        T = 1.0
        N = int(FS * T)
        t = np.linspace(0, T, N, endpoint=False)
        dt = t[1] - t[0]
        
        pulso_rect = np.where((t >= 0.4) & (t <= 0.6), 1.0, 0.0)
        escalon = np.where(t >= 0.3, 1.0, 0.0)
        senoidal = np.sin(2 * np.pi * 5 * t)
        pulso_variante = np.where((t >= 0.625) & (t <= 0.775), 1.5, 0.0)
        senoidal_amort = np.exp(-2 * t) * np.sin(2 * np.pi * 8 * t)
        
        print("✅ Datos de respaldo generados")
        return t, pulso_rect, escalon, senoidal, pulso_variante, senoidal_amort

t, pulso_rect, escalon, senoidal, pulso_variante, senoidal_amort = cargar_datos()

# Parámetros
FS = 1000
N = len(t)
dt = t[1] - t[0]

# ============================================================
# 2. FUNCIÓN PARA GENERAR DOCUMENTACIÓN DE SEÑALES
# ============================================================

def generar_documentacion_señal(senal, nombre, t, descripcion=""):
    """
    Genera documentación detallada de una señal.
    """
    # Calcular estadísticas
    energia = np.sum(senal**2) * dt
    potencia = np.mean(senal**2)
    max_val = np.max(senal)
    min_val = np.min(senal)
    mean_val = np.mean(senal)
    std_val = np.std(senal)
    
    # Calcular FFT
    fft_result = fft(senal) / N
    freq = fftfreq(N, dt)
    mag = np.abs(fftshift(fft_result))
    fase = np.angle(fftshift(fft_result))
    
    # Encontrar frecuencia dominante
    freq_pos = freq[N//2:]
    mag_pos = mag[N//2:]
    freq_dominante = freq_pos[np.argmax(mag_pos[1:]) + 1] if len(mag_pos) > 1 else 0
    
    documentacion = {
        'nombre': nombre,
        'descripcion': descripcion,
        'estadisticas_tiempo': {
            'energia': float(energia),
            'potencia': float(potencia),
            'maximo': float(max_val),
            'minimo': float(min_val),
            'media': float(mean_val),
            'desviacion_estandar': float(std_val)
        },
        'estadisticas_frecuencia': {
            'frecuencia_dominante': float(freq_dominante),
            'amplitud_maxima': float(np.max(mag_pos)),
            'ancho_espectral': float(np.sum(mag > 0.01 * np.max(mag)) * FS / N)
        },
        'caracteristicas_espectrales': {
            'tipo_espectro': 'Continuo' if np.std(mag) < 0.1 else 'Discreto',
            'simetria': 'Par' if np.allclose(mag, np.flip(mag)) else 'No par'
        }
    }
    
    return documentacion

# ============================================================
# 3. GENERAR DOCUMENTACIÓN DE TODAS LAS SEÑALES
# ============================================================

print("\n" + "=" * 70)
print("DOCUMENTACIÓN DE SEÑALES")
print("=" * 70)

señales = {
    'Pulso_Rectangular': (pulso_rect, 'Pulso rectangular con ancho de 200ms y centro en 500ms'),
    'Escalón': (escalon, 'Función escalón unitario con salto en t=300ms'),
    'Senoidal': (senoidal, 'Señal senoidal de 5Hz con amplitud unitaria'),
    'Pulso_Variante': (pulso_variante, 'Pulso rectangular con amplitud 1.5 y ancho 150ms'),
    'Senoidal_Amortiguada': (senoidal_amort, 'Señal senoidal amortiguada exponencialmente')
}

documentacion_señales = {}

for nombre, (senal, desc) in señales.items():
    doc = generar_documentacion_señal(senal, nombre, t, desc)
    documentacion_señales[nombre] = doc
    
    print(f"\n📊 {nombre}:")
    print(f"  Descripción: {desc}")
    print(f"  Energía: {doc['estadisticas_tiempo']['energia']:.4f}")
    print(f"  Potencia: {doc['estadisticas_tiempo']['potencia']:.4f}")
    print(f"  Frecuencia dominante: {doc['estadisticas_frecuencia']['frecuencia_dominante']:.2f} Hz")
    print(f"  Tipo de espectro: {doc['caracteristicas_espectrales']['tipo_espectro']}")

# ============================================================
# 4. GENERAR VISUALIZACIÓN INTEGRADA FINAL
# ============================================================

def generar_visualizacion_integrada(t, señales_dict, titulo="Análisis Integrado de Señales"):
    """
    Genera una visualización integrada con todas las señales y sus espectros.
    """
    n_señales = len(señales_dict)
    fig, axes = plt.subplots(n_señales, 2, figsize=(16, 4*n_señales))
    fig.suptitle(titulo, fontsize=16, fontweight='bold')
    
    colores = ['blue', 'red', 'green', 'purple', 'orange', 'brown']
    
    for i, (nombre, (senal, desc)) in enumerate(señales_dict.items()):
        color = colores[i % len(colores)]
        
        # Calcular FFT
        fft_result = fft(senal) / N
        freq = fftfreq(N, dt)
        mag = np.abs(fftshift(fft_result))
        fase = np.angle(fftshift(fft_result))
        
        # Gráfica de tiempo
        ax1 = axes[i, 0]
        ax1.plot(t, senal, color=color, linewidth=1.5)
        ax1.set_title(f'{nombre} - Dominio del Tiempo', fontsize=11, fontweight='bold')
        ax1.set_xlabel('Tiempo (s)')
        ax1.set_ylabel('Amplitud')
        ax1.grid(True, alpha=0.3)
        ax1.set_xlim([0, t.max()])
        
        # Estadísticas en la gráfica
        stats_text = f'E = {np.sum(senal**2)*dt:.3f}\nP = {np.mean(senal**2):.3f}'
        ax1.text(0.02, 0.98, stats_text, transform=ax1.transAxes,
                fontsize=8, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
        
        # Gráfica de espectro
        ax2 = axes[i, 1]
        ax2.plot(fftshift(freq), mag, color=color, linewidth=1.5)
        ax2.set_title(f'{nombre} - Espectro de Magnitud', fontsize=11, fontweight='bold')
        ax2.set_xlabel('Frecuencia (Hz)')
        ax2.set_ylabel('|X(f)|')
        ax2.grid(True, alpha=0.3)
        ax2.set_xlim([-20, 20])
        
        # Marcar frecuencia dominante si existe
        freq_pos = freq[N//2:]
        mag_pos = mag[N//2:]
        if len(mag_pos) > 1:
            idx_max = np.argmax(mag_pos[1:]) + 1
            if idx_max < len(freq_pos):
                freq_dom = freq_pos[idx_max]
                ax2.axvline(x=freq_dom, color='k', linestyle='--', alpha=0.3)
                ax2.axvline(x=-freq_dom, color='k', linestyle='--', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('analisis_integrado_completo.png', dpi=300, bbox_inches='tight')
    plt.show()
    print("\n✅ Visualización integrada guardada como 'analisis_integrado_completo.png'")

# Generar visualización integrada
generar_visualizacion_integrada(t, señales, "Análisis Integrado de Señales y sus Espectros")

# ============================================================
# 5. GENERAR DOCUMENTACIÓN EN FORMATO JSON
# ============================================================

def exportar_documentacion_json(documentacion, archivo='documentacion_señales.json'):
    """Exporta la documentación a formato JSON."""
    with open(archivo, 'w', encoding='utf-8') as f:
        json.dump(documentacion, f, indent=4, ensure_ascii=False)
    print(f"✅ Documentación exportada a: {archivo}")

exportar_documentacion_json(documentacion_señales)

# ============================================================
# 6. GENERAR ARCHIVO README PARA GITHUB
# ============================================================

def generar_readme():
    """Genera el archivo README.md para el repositorio."""
    readme_content = f"""# Análisis de Señales con Transformada de Fourier

## 📋 Descripción del Proyecto

Este proyecto implementa un análisis completo de señales utilizando la Transformada de Fourier en Python. El objetivo es visualizar y analizar señales en los dominios del tiempo y frecuencia, verificando las propiedades fundamentales de la transformada.

**Fecha de creación:** {datetime.now().strftime('%Y-%m-%d')}

## 📂 Estructura del Proyecto
- `4_documentos.py`: Script principal de análisis.
- `señales_generadas.npz`: Archivo de datos de entrada.
- `analisis_integrado_completo.png`: Visualización de resultados.
- `documentacion_señales.json`: Metadatos del análisis.
"""
    with open('README.md', 'w', encoding='utf-8') as f:
        f.write(readme_content)
    print("✅ Archivo README.md generado correctamente.")

# Llamada a la función para que se ejecute
generar_readme()
