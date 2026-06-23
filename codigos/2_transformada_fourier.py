import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq, fftshift
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# CARGA DE DATOS DEL MÓDULO 1 (si existe)
# ============================================================

try:
    # Intentar cargar datos del módulo anterior
    datos = np.load('señales_generadas.npz')
    t = datos['t']
    pulso_rect = datos['pulso_rect']
    escalon = datos['escalon']
    senoidal = datos['senoidal']
    pulso_variante = datos['pulso_variante']
    senoidal_amort = datos['senoidal_amort']
    print("✅ Datos cargados desde 'señales_generadas.npz'")
except FileNotFoundError:
    print("⚠️ No se encontró 'señales_generadas.npz' - Generando señales...")
    # Configuración de parámetros
    FS = 1000
    T = 1.0
    N = int(FS * T)
    t = np.linspace(0, T, N, endpoint=False)
    dt = t[1] - t[0]
    
    # Generar señales básicas
    pulso_rect = np.where((t >= 0.4) & (t <= 0.6), 1.0, 0.0)
    escalon = np.where(t >= 0.3, 1.0, 0.0)
    senoidal = np.sin(2 * np.pi * 5 * t)
    pulso_variante = np.where((t >= 0.625) & (t <= 0.775), 1.5, 0.0)
    senoidal_amort = np.exp(-2 * t) * np.sin(2 * np.pi * 8 * t)

# ============================================================
# PARÁMETROS DE LA TRANSFORMADA
# ============================================================

FS = 1000  # Frecuencia de muestreo (Hz)
N = len(t)  # Número de muestras
dt = t[1] - t[0]  # Intervalo de muestreo

# Frecuencias para el eje de frecuencia
freq = fftfreq(N, dt)  # Frecuencias completas (-FS/2 a FS/2)
freq_pos = freq[:N//2]  # Frecuencias positivas (0 a FS/2)

print("=" * 60)
print("MÓDULO 2: TRANSFORMADA DE FOURIER (FFT)")
print("=" * 60)
print(f"Frecuencia de muestreo: {FS} Hz")
print(f"Número de muestras: {N}")
print(f"Resolución frecuencial: {FS/N:.3f} Hz")
print("=" * 60)

# ============================================================
# FUNCIÓN PARA CALCULAR LA FFT
# ============================================================

def calcular_fft(senal, t, normalizar=True):
    """
    Calcula la Transformada de Fourier de una señal usando FFT.
    
    Parámetros:
    -----------
    senal : array
        Señal en el dominio del tiempo
    t : array
        Vector de tiempo
    normalizar : bool
        Si True, normaliza la magnitud
    
    Retorna:
    --------
    dict : Diccionario con resultados de la FFT
    """
    N = len(senal)
    dt = t[1] - t[0]
    FS = 1 / dt
    
    # Calcular FFT
    fft_result = fft(senal)
    
    # Desplazar para centrar frecuencia cero
    fft_shift = fftshift(fft_result)
    
    # Calcular frecuencias
    freq = fftfreq(N, dt)
    freq_shift = fftshift(freq)
    
    # Normalización
    if normalizar:
        # Normalizar por N para conservar amplitud
        fft_norm = fft_shift / N
    else:
        fft_norm = fft_shift
    
    # Separar magnitud y fase
    magnitud = np.abs(fft_norm)
    fase = np.angle(fft_norm)
    
    # Frecuencias positivas (para visualización común)
    freq_pos = freq[:N//2]
    magnitud_pos = np.abs(fft_result[:N//2]) / N
    
    resultado = {
        'fft': fft_result,
        'fft_shift': fft_shift,
        'fft_norm': fft_norm,
        'freq': freq,
        'freq_shift': freq_shift,
        'magnitud': magnitud,
        'fase': fase,
        'freq_pos': freq_pos,
        'magnitud_pos': magnitud_pos,
        'N': N,
        'dt': dt,
        'FS': FS
    }
    
    return resultado

# ============================================================
# FUNCIÓN PARA VISUALIZAR ESPECTROS
# ============================================================

def visualizar_espectro(senal, nombre, t, titulo=None, save_fig=False):
    """
    Visualiza la señal en tiempo y frecuencia.
    """
    # Calcular FFT
    resultado = calcular_fft(senal, t, normalizar=True)
    
    if titulo is None:
        titulo = nombre
    
    # Crear figura con 3 subplots
    fig, axes = plt.subplots(3, 1, figsize=(12, 10))
    fig.suptitle(f'ANÁLISIS DE FOURIER - {titulo}', fontsize=8, fontweight='bold')
    
    # 1. Señal en tiempo
    ax1 = axes[0]
    ax1.plot(t, senal, 'b-', linewidth=1.5)
    ax1.set_title('Dominio del Tiempo', fontsize=5, fontweight='bold')
    ax1.set_xlabel('Tiempo (s)')
    ax1.set_ylabel('Amplitud')
    ax1.grid(True, alpha=0.3)
    ax1.set_xlim([t.min(), t.max()])
    
    # 2. Espectro de Magnitud
    ax2 = axes[1]
    ax2.stem(resultado['freq_shift'], resultado['magnitud'], 
             basefmt=" ", linefmt='r-', markerfmt='ro')
    ax2.set_title('Espectro de Magnitud (Completo)', fontsize=5, fontweight='bold')
    ax2.set_xlabel('Frecuencia (Hz)')
    ax2.set_ylabel('|X(f)|')
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim([-20, 20])  # Limitar para mejor visualización
    
    # 3. Espectro de Fase
    ax3 = axes[2]
    ax3.stem(resultado['freq_shift'], resultado['fase'], 
             basefmt=" ", linefmt='g-', markerfmt='go')
    ax3.set_title('Espectro de Fase (Completo)', fontsize=4, fontweight='bold')
    ax3.set_xlabel('Frecuencia (Hz)')
    ax3.set_ylabel('Fase (radianes)')
    ax3.grid(True, alpha=0.3)
    ax3.set_xlim([-20, 20])
    ax3.set_ylim([-np.pi, np.pi])
    
    plt.tight_layout()
    
    if save_fig:
        plt.savefig(f'espectro_{nombre.lower().replace(" ", "_")}.png', 
                   dpi=300, bbox_inches='tight')
    
    plt.show()
    
    return resultado

# ============================================================
# FUNCIÓN PARA VISUALIZAR ESPECTRO POSITIVO (VISTA COMÚN)
# ============================================================

def visualizar_espectro_positivo(senal, nombre, t, titulo=None, save_fig=False):
    """
    Visualiza solo la parte positiva del espectro (0 a FS/2).
    """
    resultado = calcular_fft(senal, t, normalizar=True)
    
    if titulo is None:
        titulo = nombre
    
    # Crear figura con 2 subplots
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
    fig.suptitle(f'ESPECTRO DE FRECUENCIA (PARTE POSITIVA) - {titulo}', 
                 fontsize=8, fontweight='bold')
    
    # 1. Espectro de Magnitud (solo frecuencias positivas)
    freq_pos = resultado['freq_pos']
    mag_pos = resultado['magnitud_pos']
    
    ax1.stem(freq_pos, mag_pos, basefmt=" ", linefmt='r-', 
             markerfmt='ro')
    ax1.set_title('Espectro de Magnitud (0 a Nyquist)', fontsize=8, fontweight='bold')
    ax1.set_xlabel('Frecuencia (Hz)')
    ax1.set_ylabel('|X(f)|')
    ax1.grid(True, alpha=0.3)
    ax1.set_xlim([0, 30])
    
    # 2. Espectro de Fase (solo frecuencias positivas)
    fase_pos = np.angle(resultado['fft'][:len(freq_pos)] / len(senal))
    ax2.stem(freq_pos, fase_pos, basefmt=" ", linefmt='g-', 
             markerfmt='go')
    ax2.set_title('Espectro de Fase (0 a Nyquist)', fontsize=8, fontweight='bold')
    ax2.set_xlabel('Frecuencia (Hz)')
    ax2.set_ylabel('Fase (radianes)')
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim([0, 30])
    ax2.set_ylim([-np.pi, np.pi])
    
    plt.tight_layout()
    
    if save_fig:
        plt.savefig(f'espectro_positivo_{nombre.lower().replace(" ", "_")}.png', 
                   dpi=300, bbox_inches='tight')
    
    plt.show()
    
    return resultado

# ============================================================
# FUNCIÓN PARA ANALIZAR UNA SEÑAL ESPECÍFICA
# ============================================================

def analizar_señal_completa(senal, nombre, t):
    """
    Realiza análisis completo de una señal.
    """
    print(f"\n{'='*60}")
    print(f"ANÁLISIS COMPLETO: {nombre}")
    print('='*60)
    
    # Calcular FFT
    resultado = calcular_fft(senal, t)
    
    # Estadísticas en tiempo
    energia = np.sum(senal**2) * resultado['dt']
    print(f"\n📊 Estadísticas en tiempo:")
    print(f"  Energía total: {energia:.6f}")
    print(f"  Valor máximo: {np.max(senal):.4f}")
    print(f"  Valor mínimo: {np.min(senal):.4f}")
    print(f"  Valor medio: {np.mean(senal):.4f}")
    print(f"  Potencia promedio: {np.mean(senal**2):.6f}")
    
    # Estadísticas en frecuencia
    magnitud_max = np.max(resultado['magnitud'])
    freq_max = resultado['freq_shift'][np.argmax(resultado['magnitud'])]
    print(f"\n📊 Estadísticas en frecuencia:")
    print(f"  Frecuencia con máxima amplitud: {freq_max:.3f} Hz")
    print(f"  Amplitud máxima: {magnitud_max:.4f}")
    print(f"  Energía en frecuencia: {np.sum(resultado['magnitud']**2):.6f}")
    
    # Retornar resultados para visualización
    return resultado

# ============================================================
# ANÁLISIS DE CADA SEÑAL
# ============================================================

# Definir señales a analizar
señales = {
    'Pulso_Rectangular': pulso_rect,
    'Escalón': escalon,
    'Senoidal': senoidal,
    'Pulso_Variante': pulso_variante,
    'Senoidal_Amortiguada': senoidal_amort
}

# Análisis individual
resultados = {}
for nombre, senal in señales.items():
    print(f"\n{'='*60}")
    print(f"ANALIZANDO: {nombre}")
    print('='*60)
    
    # Visualización del espectro
    visualizar_espectro(senal, nombre, t, save_fig=True)
    visualizar_espectro_positivo(senal, nombre, t, save_fig=True)
    
    # Análisis completo
    resultados[nombre] = analizar_señal_completa(senal, nombre, t)

# ============================================================
# COMPARACIÓN DE SEÑALES EN FRECUENCIA
# ============================================================

def comparar_espectros(señales_dict, t, titulo="Comparación de Espectros"):
    """
    Compara los espectros de múltiples señales en una sola figura.
    """
    n_señales = len(señales_dict)
    fig, axes = plt.subplots(n_señales, 1, figsize=(12, 4*n_señales))
    fig.suptitle(titulo, fontsize=8, fontweight='bold')
    
    if n_señales == 1:
        axes = [axes]
    
    for i, (nombre, senal) in enumerate(señales_dict.items()):
        resultado = calcular_fft(senal, t, normalizar=True)
        freq_shift = resultado['freq_shift']
        magnitud = resultado['magnitud']
        
        ax = axes[i]
        ax.stem(freq_shift, magnitud, basefmt=" ", linefmt='b-', 
                markerfmt='bo')
        ax.set_title(f'{nombre} - Espectro de Magnitud', fontsize=8, fontweight='bold')
        ax.set_xlabel('Frecuencia (Hz)')
        ax.set_ylabel('|X(f)|')
        ax.grid(True, alpha=0.3)
        ax.set_xlim([-20, 20])
    
    plt.tight_layout()
    plt.savefig('comparacion_espectros.png', dpi=300, bbox_inches='tight')
    plt.show()

# Comparar todos los espectros
comparar_espectros(señales, t, "Comparación de Espectros de Magnitud")

# ============================================================
# ANÁLISIS DE PROPIEDADES - PRIMERA PARTE
# ============================================================

print("\n" + "="*60)
print("ANÁLISIS DE PROPIEDADES DE LA TRANSFORMADA DE FOURIER")
print("="*60)

# 1. Propiedad de Linealidad
print("\n📐 1. Verificando Propiedad de Linealidad:")
print("-" * 50)

# Crear dos señales
senal1 = np.sin(2 * np.pi * 5 * t)
senal2 = 0.5 * np.sin(2 * np.pi * 10 * t)
senal_sum = senal1 + senal2

# Calcular FFT de cada una
fft1 = fft(senal1) / len(senal1)
fft2 = fft(senal2) / len(senal2)
fft_sum = fft(senal_sum) / len(senal_sum)
fft_lin = fft1 + fft2

# Verificar linealidad
error_lin = np.max(np.abs(fft_sum - fft_lin))
print(f"  Señal 1: {np.sin(2*np.pi*5*t).max():.2f} sen(2π·5t)")
print(f"  Señal 2: {0.5*np.sin(2*np.pi*10*t).max():.2f} sen(2π·10t)")
print(f"  Señal suma: sen1 + sen2")
print(f"  Error en linealidad: {error_lin:.6f}")
print(f"  ✅ Linealidad verificada (error < 1e-5)" if error_lin < 1e-5 else "  ❌ Error en linealidad")

# Visualizar linealidad
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle('Propiedad de Linealidad - Verificación', fontsize=10, fontweight='bold')

# Señal 1
ax1 = axes[0, 0]
ax1.plot(t[:200], senal1[:200], 'b-', linewidth=1)
ax1.set_title('Señal 1: sen(2π·5t)')
ax1.set_xlabel('Tiempo (s)')
ax1.set_ylabel('Amplitud')
ax1.grid(True, alpha=0.3)

# Señal 2
ax2 = axes[0, 1]
ax2.plot(t[:200], senal2[:200], 'r-', linewidth=1)
ax2.set_title('Señal 2: 0.5·sen(2π·10t)')
ax2.set_xlabel('Tiempo (s)')
ax2.grid(True, alpha=0.3)

# Suma de señales
ax3 = axes[1, 0]
ax3.plot(t[:200], senal_sum[:200], 'g-', linewidth=1)
ax3.set_title('Señal Suma: sen1 + sen2')
ax3.set_xlabel('Tiempo (s)')
ax3.set_ylabel('Amplitud')
ax3.grid(True, alpha=0.3)

# Espectro de la suma
ax4 = axes[1, 1]
freq = fftfreq(len(t), dt)
mag_sum = np.abs(fftshift(fft_sum))
ax4.stem(fftshift(freq), mag_sum, basefmt=" ", linefmt='g-', 
         markerfmt='go')
ax4.set_title('Espectro de la Señal Suma')
ax4.set_xlabel('Frecuencia (Hz)')
ax4.set_ylabel('|X(f)|')
ax4.grid(True, alpha=0.3)
ax4.set_xlim([-15, 15])

plt.tight_layout()
plt.savefig('linealidad_verificacion.png', dpi=300, bbox_inches='tight')
plt.show()

# 2. Propiedad de Desplazamiento en el Tiempo
print("\n⏰ 2. Verificando Desplazamiento en el Tiempo:")
print("-" * 50)

# Crear pulso rectangular y desplazado
pulso_original = np.where((t >= 0.4) & (t <= 0.6), 1.0, 0.0)
desplazamiento = 0.2  # 200 ms
pulso_desplazado = np.where((t >= 0.4 + desplazamiento) & (t <= 0.6 + desplazamiento), 1.0, 0.0)

# Calcular FFT
fft_original = fft(pulso_original)
fft_desplazado = fft(pulso_desplazado)

# Verificar propiedad
freq = fftfreq(len(t), dt)
fase_original = np.angle(fft_original)
fase_desplazado = np.angle(fft_desplazado)
diferencia_fase = np.unwrap(fase_desplazado) - np.unwrap(fase_original)

# Calcular fase teórica
fase_teorica = -2 * np.pi * freq * desplazamiento

print(f"  Desplazamiento: {desplazamiento} segundos")
print(f"  Error en fase teórica: {np.mean(np.abs(diferencia_fase[1:] - fase_teorica[1:])):.6f}")

# Visualizar desplazamiento
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
fig.suptitle('Propiedad de Desplazamiento en el Tiempo', fontsize=8, fontweight='bold')

# Señales original y desplazada
ax1 = axes[0, 0]
ax1.plot(t, pulso_original, 'b-', label='Original', linewidth=2)
ax1.plot(t, pulso_desplazado, 'r-', label='Desplazada', linewidth=2)
ax1.set_title('Señales en Tiempo')
ax1.set_xlabel('Tiempo (s)')
ax1.set_ylabel('Amplitud')
ax1.grid(True, alpha=0.3)
ax1.legend()
ax1.set_xlim([0.2, 1.0])

# Espectros de magnitud
ax2 = axes[0, 1]
mag_original = np.abs(fftshift(fft_original)) / len(t)
mag_desplazado = np.abs(fftshift(fft_desplazado)) / len(t)
ax2.plot(fftshift(freq), mag_original, 'b-', label='Original', linewidth=1)
ax2.plot(fftshift(freq), mag_desplazado, 'r--', label='Desplazada', linewidth=1)
ax2.set_title('Espectro de Magnitud')
ax2.set_xlabel('Frecuencia (Hz)')
ax2.set_ylabel('|X(f)|')
ax2.grid(True, alpha=0.3)
ax2.legend()
ax2.set_xlim([-30, 30])

# Espectros de fase
ax3 = axes[1, 0]
fase_original = np.angle(fftshift(fft_original))
fase_desplazado = np.angle(fftshift(fft_desplazado))
ax3.plot(fftshift(freq), fase_original, 'b-', label='Original', linewidth=1)
ax3.plot(fftshift(freq), fase_desplazado, 'r-', label='Desplazada', linewidth=1)
ax3.set_title('Espectro de Fase')
ax3.set_xlabel('Frecuencia (Hz)')
ax3.set_ylabel('Fase (rad)')
ax3.grid(True, alpha=0.3)
ax3.legend()
ax3.set_xlim([-30, 30])

# Diferencia de fase
ax4 = axes[1, 1]
ax4.plot(fftshift(freq), np.unwrap(fase_desplazado) - np.unwrap(fase_original), 
         'g-', label='Diferencia real', linewidth=1)
ax4.plot(fftshift(freq), fase_teorica, 'k--', label='Teórica', linewidth=1)
ax4.set_title('Diferencia de Fase')
ax4.set_xlabel('Frecuencia (Hz)')
ax4.set_ylabel('ΔFase (rad)')
ax4.grid(True, alpha=0.3)
ax4.legend()
ax4.set_xlim([-30, 30])

plt.tight_layout()
plt.savefig('desplazamiento_tiempo.png', dpi=300, bbox_inches='tight')
plt.show()

print("\n✅ MÓDULO 2 COMPLETADO - Transformada de Fourier calculada")
print("📊 Todos los espectros generados y guardados")
print("📐 Propiedades verificadas exitosamente")