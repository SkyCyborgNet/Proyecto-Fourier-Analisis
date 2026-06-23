import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# CONFIGURACIÓN DE PARÁMETROS GENERALES (CORREGIDO)
# ============================================================

# Parámetros de muestreo
FS = 1000  # Frecuencia de muestreo (Hz)
T = 1.0    # Duración total de la señal (segundos)
N = int(FS * T)  # Número de muestras (CONVERTIDO A ENTERO)
t = np.linspace(0, T, N, endpoint=False)  # Vector de tiempo
dt = t[1] - t[0]  # Intervalo de muestreo

print("=" * 60)
print("MÓDULO 1: GENERACIÓN DE SEÑALES")
print("=" * 60)
print(f"Frecuencia de muestreo: {FS} Hz")
print(f"Duración total: {T} segundos")
print(f"Número de muestras: {N}")
print(f"Intervalo de muestreo: {dt*1000:.3f} ms")
print("=" * 60)

# ============================================================
# 1. SEÑAL: PULSO RECTANGULAR
# ============================================================

def generar_pulso_rectangular(t, ancho=0.2, retraso=0.5):
    """
    Genera un pulso rectangular.
    
    Parámetros:
    -----------
    t : array
        Vector de tiempo
    ancho : float
        Ancho del pulso en segundos
    retraso : float
        Posición central del pulso en segundos
    
    Retorna:
    --------
    array : Señal del pulso rectangular
    """
    # Pulso rectangular con numpy.where
    inicio = retraso - ancho/2
    fin = retraso + ancho/2
    
    pulso = np.where((t >= inicio) & (t <= fin), 1.0, 0.0)
    
    # Información de la señal
    print(f"\n📊 PULSO RECTANGULAR:")
    print(f"  Ancho: {ancho} segundos")
    print(f"  Posición central: {retraso} segundos")
    print(f"  Rango de valores: [{pulso.min():.0f}, {pulso.max():.0f}]")
    print(f"  Energía (aprox): {np.sum(pulso**2)*dt:.3f}")
    
    return pulso

# ============================================================
# 2. SEÑAL: FUNCIÓN ESCALÓN
# ============================================================

def generar_escalon(t, instante=0.3, amplitud=1.0):
    """
    Genera una función escalón (Heaviside).
    
    Parámetros:
    -----------
    t : array
        Vector de tiempo
    instante : float
        Instante donde ocurre el salto
    amplitud : float
        Amplitud del escalón
    
    Retorna:
    --------
    array : Señal del escalón
    """
    # Función escalón con numpy.where
    escalon = np.where(t >= instante, amplitud, 0.0)
    
    # Información de la señal
    print(f"\n📊 FUNCIÓN ESCALÓN:")
    print(f"  Instante de salto: {instante} segundos")
    print(f"  Amplitud: {amplitud}")
    print(f"  Rango de valores: [{escalon.min():.0f}, {escalon.max():.0f}]")
    print(f"  Energía (aprox): {np.sum(escalon**2)*dt:.3f}")
    
    return escalon

# ============================================================
# 3. SEÑAL: FUNCIÓN SENOIDAL
# ============================================================

def generar_senoidal(t, frecuencia=5, amplitud=1.0, fase=0):
    """
    Genera una señal senoidal.
    
    Parámetros:
    -----------
    t : array
        Vector de tiempo
    frecuencia : float
        Frecuencia en Hz
    amplitud : float
        Amplitud de la señal
    fase : float
        Fase en radianes
    
    Retorna:
    --------
    array : Señal senoidal
    """
    # Generación de la señal senoidal
    senoidal = amplitud * np.sin(2 * np.pi * frecuencia * t + fase)
    
    # Información de la señal
    print(f"\n📊 SEÑAL SENOIDAL:")
    print(f"  Frecuencia: {frecuencia} Hz")
    print(f"  Amplitud: {amplitud}")
    print(f"  Fase: {fase:.2f} rad")
    print(f"  Rango de valores: [{senoidal.min():.3f}, {senoidal.max():.3f}]")
    print(f"  Energía (aprox): {np.sum(senoidal**2)*dt:.3f}")
    
    return senoidal

# ============================================================
# 4. SEÑAL: PULSO RECTANGULAR VARIANTE (parámetros configurables)
# ============================================================

def generar_pulso_rectangular_variante(t, ancho=0.3, retraso=0.6, amplitud=2.0):
    """
    Genera pulso rectangular con amplitud variable.
    Versión alternativa para demostrar flexibilidad.
    """
    inicio = retraso - ancho/2
    fin = retraso + ancho/2
    
    pulso = np.where((t >= inicio) & (t <= fin), amplitud, 0.0)
    
    print(f"\n📊 PULSO RECTANGULAR (Variante):")
    print(f"  Ancho: {ancho} s, Amplitud: {amplitud}")
    print(f"  Posición: {retraso} s")
    print(f"  Energía (aprox): {np.sum(pulso**2)*dt:.3f}")
    
    return pulso

# ============================================================
# 5. SEÑAL: SENOIDAL AMORTIGUADA (opcional - para análisis adicional)
# ============================================================

def generar_senoidal_amortiguada(t, frecuencia=5, amplitud=1.0, atenuacion=1.0):
    """
    Genera una señal senoidal amortiguada exponencialmente.
    Útil para demostrar propiedades adicionales de Fourier.
    """
    senoidal = amplitud * np.exp(-atenuacion * t) * np.sin(2 * np.pi * frecuencia * t)
    
    print(f"\n📊 SEÑAL SENOIDAL AMORTIGUADA:")
    print(f"  Frecuencia: {frecuencia} Hz, Atenuación: {atenuacion}")
    print(f"  Rango: [{senoidal.min():.3f}, {senoidal.max():.3f}]")
    print(f"  Energía (aprox): {np.sum(senoidal**2)*dt:.3f}")
    
    return senoidal

# ============================================================
# FUNCIÓN PARA VISUALIZAR SEÑALES GENERADAS
# ============================================================

def visualizar_señales(t, señales, titulos=None, colores=None, save_fig=False):
    """
    Visualiza múltiples señales en subplots.
    
    Parámetros:
    -----------
    t : array
        Vector de tiempo
    señales : list
        Lista de señales a visualizar
    titulos : list
        Títulos para cada subplot
    colores : list
        Colores para cada gráfica
    save_fig : bool
        Guardar figura en archivo
    """
    n_señales = len(señales)
    
    # Configuración de colores por defecto
    if colores is None:
        colores = ['blue', 'red', 'green', 'purple', 'orange', 'brown']
    
    # Configuración de títulos por defecto
    if titulos is None:
        titulos = [f'Señal {i+1}' for i in range(n_señales)]
    
    # Crear figura
    fig, axes = plt.subplots(n_señales, 1, figsize=(12, 4*n_señales))
    fig.suptitle('SEÑALES GENERADAS EN EL DOMINIO DEL TIEMPO', 
                 fontsize=7, fontweight='bold')
    
    # Si es una sola señal, convertir a lista
    if n_señales == 1:
        axes = [axes]
    
    # Graficar cada señal
    for i, (senal, titulo, color) in enumerate(zip(señales, titulos, colores)):
        ax = axes[i]
        ax.plot(t, senal, color=color, linewidth=1.2)
        ax.set_title(titulo, fontsize=6, fontweight='bold')
        ax.set_xlabel('Tiempo (s)', fontsize=5)
        ax.set_ylabel('Amplitud', fontsize=5)
        ax.grid(True, alpha=0.3)
        ax.set_xlim([t.min(), t.max()])
        
        # Añadir margen para mejor visualización
        y_margin = (senal.max() - senal.min()) * 0.1
        if y_margin == 0:
            y_margin = 0.1
        ax.set_ylim([senal.min() - y_margin, senal.max() + y_margin])
        
        # Mostrar estadísticas en la gráfica
        stats_text = f'Max: {senal.max():.3f}\nMin: {senal.min():.3f}\nEnergía: {np.sum(senal**2)*dt:.3f}'
        ax.text(0.02, 0.98, stats_text, transform=ax.transAxes, 
                fontsize=9, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    
    if save_fig:
        plt.savefig('señales_generadas.png', dpi=300, bbox_inches='tight')
        print("\n💾 Figura guardada como: señales_generadas.png")
    
    plt.show()
    
    return fig

# ============================================================
# GENERACIÓN DE LAS SEÑALES PRINCIPALES
# ============================================================

# 1. Pulso rectangular
pulso_rect = generar_pulso_rectangular(t, ancho=0.2, retraso=0.5)

# 2. Función escalón
escalon = generar_escalon(t, instante=0.3, amplitud=1.0)

# 3. Señal senoidal
senoidal = generar_senoidal(t, frecuencia=5, amplitud=1.0, fase=0)

# 4. Pulso rectangular variante (para comparación)
pulso_variante = generar_pulso_rectangular_variante(t, ancho=0.15, retraso=0.7, amplitud=1.5)

# 5. Señal senoidal amortiguada (opcional)
senoidal_amort = generar_senoidal_amortiguada(t, frecuencia=8, amplitud=1.0, atenuacion=2.0)

# ============================================================
# VISUALIZACIÓN DE LAS SEÑALES GENERADAS
# ============================================================

# Crear listas para visualización
señales = [pulso_rect, escalon, senoidal, pulso_variante, senoidal_amort]
titulos = [
    'Pulso Rectangular (ancho=0.2s, centro=0.5s)',
    'Función Escalón (salto en t=0.3s)',
    'Señal Senoidal (f=5Hz, A=1)',
    'Pulso Rectangular Variante (ancho=0.15s, A=1.5)',
    'Señal Senoidal Amortiguada (f=8Hz, α=2)'
]
colores = ['blue', 'red', 'green', 'purple', 'orange']

# Visualizar
fig = visualizar_señales(t, señales, titulos, colores, save_fig=True)

# ============================================================
# INFORMACIÓN RESUMEN DE LAS SEÑALES
# ============================================================

print("\n" + "=" * 60)
print("RESUMEN DE SEÑALES GENERADAS")
print("=" * 60)
print(f"\n{'Señal':<30} | {'Energía':<10} | {'Dominio':<15}")
print("-" * 60)
print(f"{'Pulso Rectangular':<30} | {np.sum(pulso_rect**2)*dt:<10.3f} | [0, 1]")
print(f"{'Escalón':<30} | {np.sum(escalon**2)*dt:<10.3f} | [0, 1]")
print(f"{'Senoidal':<30} | {np.sum(senoidal**2)*dt:<10.3f} | [-1, 1]")
print(f"{'Pulso Variante':<30} | {np.sum(pulso_variante**2)*dt:<10.3f} | [0, 1.5]")
print(f"{'Senoidal Amortiguada':<30} | {np.sum(senoidal_amort**2)*dt:<10.3f} | [-1, 1]")
print("=" * 60)

# ============================================================
# FUNCIÓN DE EXPORTACIÓN (para uso en otros módulos)
# ============================================================

def exportar_datos(t, señales, nombres, archivo='señales_generadas.npz'):
    """
    Exporta las señales generadas a un archivo .npz.
    Útil para compartir datos entre módulos.
    """
    datos = {'t': t}
    for nombre, senal in zip(nombres, señales):
        datos[nombre] = senal
    
    np.savez(archivo, **datos)
    print(f"\n💾 Datos exportados a: {archivo}")
    
    return archivo

# Exportar datos generados
nombres_señales = ['pulso_rect', 'escalon', 'senoidal', 'pulso_variante', 'senoidal_amort']
exportar_datos(t, señales, nombres_señales)

print("\n✅ MÓDULO 1 COMPLETADO - Señales generadas exitosamente")
print(f"📂 Total de señales generadas: {len(señales)}")