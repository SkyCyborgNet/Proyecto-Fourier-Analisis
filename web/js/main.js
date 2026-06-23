/**
 * ================================================================
 * MAIN.JS - Lógica Principal de la Aplicación
 * ================================================================
 * Controla la interacción entre las diferentes secciones,
 * maneja los eventos y coordina la actualización de gráficas.
 */

// ================================================================
// CONFIGURACIÓN GLOBAL
// ================================================================

const CONFIG = {
    // Parámetros de las señales
    fs: 1000,
    t: [],
    señales: {},
    // Estado actual
    currentSignal: 'pulso',
    currentProperty: 'linealidad',
    // URLs
    dataUrl: 'datos/señales_generadas.npz',
    jsonUrl: 'docs/documentacion_señales.json'
};

// ================================================================
// CARGA DE DATOS
// ================================================================

/**
 * Carga los datos de las señales desde el archivo JSON
 */
async function cargarDatos() {
    try {
        // Primero intentamos cargar el JSON generado por Python
        const response = await fetch(CONFIG.jsonUrl);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos cargados desde JSON');
            return data;
        }
    } catch (e) {
        console.warn('⚠️ No se pudo cargar JSON, usando datos de respaldo');
    }
    
    // Datos de respaldo (en caso de que no exista el JSON)
    return getDatosRespaldo();
}

/**
 * Datos de respaldo en caso de no tener el JSON
 */
function getDatosRespaldo() {
    // Generamos datos sintéticos para demostración
    const fs = 1000;
    const t = Array.from({length: 1000}, (_, i) => i / fs);
    
    return {
        señales: {
            pulso: {
                nombre: 'Pulso Rectangular',
                descripcion: 'Pulso rectangular con ancho de 200ms y centro en 500ms',
                tiempo: { x: t, y: t.map(ti => (ti >= 0.4 && ti <= 0.6) ? 1 : 0) },
                estadisticas: {
                    energia: 0.2,
                    potencia: 0.2,
                    maximo: 1.0,
                    minimo: 0.0
                }
            },
            escalon: {
                nombre: 'Escalón',
                descripcion: 'Función escalón unitario con salto en t=300ms',
                tiempo: { x: t, y: t.map(ti => ti >= 0.3 ? 1 : 0) },
                estadisticas: {
                    energia: 0.7,
                    potencia: 0.7,
                    maximo: 1.0,
                    minimo: 0.0
                }
            },
            senoidal: {
                nombre: 'Senoidal',
                descripcion: 'Señal senoidal de 5Hz con amplitud unitaria',
                tiempo: { x: t, y: t.map(ti => Math.sin(2 * Math.PI * 5 * ti)) },
                estadisticas: {
                    energia: 0.5,
                    potencia: 0.5,
                    maximo: 1.0,
                    minimo: -1.0
                }
            },
            'pulso-var': {
                nombre: 'Pulso Variante',
                descripcion: 'Pulso rectangular con amplitud 1.5 y ancho 150ms',
                tiempo: { x: t, y: t.map(ti => (ti >= 0.625 && ti <= 0.775) ? 1.5 : 0) },
                estadisticas: {
                    energia: 0.337,
                    potencia: 0.337,
                    maximo: 1.5,
                    minimo: 0.0
                }
            },
            amort: {
                nombre: 'Senoidal Amortiguada',
                descripcion: 'Señal senoidal amortiguada exponencialmente',
                tiempo: { x: t, y: t.map(ti => Math.exp(-2 * ti) * Math.sin(2 * Math.PI * 8 * ti)) },
                estadisticas: {
                    energia: 0.125,
                    potencia: 0.125,
                    maximo: 0.79,
                    minimo: -0.79
                }
            }
        }
    };
}

// ================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ================================================================

let appData = null;

async function initApp() {
    console.log('🚀 Iniciando aplicación...');
    
    // Cargar datos
    appData = await cargarDatos();
    console.log('📊 Datos cargados:', appData);
    
    // Inicializar gráficas
    initCharts();
    
    // Inicializar navegación
    initNavigation();
    
    // Configurar eventos
    setupEventListeners();
    
    // Animar estadísticas
    animateStats();
    
    console.log('✅ Aplicación inicializada correctamente');
}

// ================================================================
// EVENT LISTENERS
// ================================================================

function setupEventListeners() {
    // Navegación suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Tabs de señales
    document.querySelectorAll('.señales-tabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const signalId = this.getAttribute('data-bs-target').replace('#tab-', '');
            updateSignalInfo(signalId);
        });
    });
    
    // Selector de Fourier
    document.querySelectorAll('#fourierSignalList .list-group-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('#fourierSignalList .list-group-item').forEach(el => {
                el.classList.remove('active');
            });
            this.classList.add('active');
            const signalId = this.dataset.signal;
            updateFourierCharts(signalId);
        });
    });
    
    // Botones de propiedades
    document.querySelectorAll('.property-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const property = this.dataset.property;
            showPropertyModal(property);
        });
    });
    
    // Scroll para navbar
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('mainNav');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(26, 35, 126, 0.98)';
        } else {
            navbar.style.background = 'rgba(26, 35, 126, 0.95)';
        }
    });
}

// ================================================================
// ACTUALIZACIÓN DE INTERFAZ
// ================================================================

function updateSignalInfo(signalId) {
    const signal = appData.señales[signalId];
    if (!signal) return;
    
    // Actualizar estadísticas
    const stats = signal.estadisticas;
    document.getElementById(`${signalId}-energia`).textContent = stats.energia.toFixed(3);
    document.getElementById(`${signalId}-potencia`).textContent = stats.potencia.toFixed(3);
    document.getElementById(`${signalId}-max`).textContent = stats.maximo.toFixed(3);
    document.getElementById(`${signalId}-min`).textContent = stats.minimo.toFixed(3);
}

function updateFourierCharts(signalId) {
    const signal = appData.señales[signalId];
    if (!signal) return;
    
    // Actualizar métricas
    // Nota: Estos valores se calcularían con FFT en la práctica
    const metrics = getFourierMetrics(signalId);
    document.getElementById('freq-dominante').textContent = metrics.freqDominante;
    document.getElementById('amp-maxima').textContent = metrics.ampMaxima;
    document.getElementById('ancho-espectral').textContent = metrics.anchoEspectral;
    document.getElementById('tipo-espectro').textContent = metrics.tipoEspectro;
    
    // Renderizar gráficas de Fourier
    renderFourierCharts(signalId);
}

function getFourierMetrics(signalId) {
    const metrics = {
        pulso: { freqDominante: '0.00 Hz', ampMaxima: '0.200', anchoEspectral: '10.00 Hz', tipoEspectro: 'Continuo' },
        escalon: { freqDominante: '0.00 Hz', ampMaxima: '0.500', anchoEspectral: '15.00 Hz', tipoEspectro: 'Continuo' },
        senoidal: { freqDominante: '5.00 Hz', ampMaxima: '0.500', anchoEspectral: '0.00 Hz', tipoEspectro: 'Discreto' },
        'pulso-var': { freqDominante: '0.00 Hz', ampMaxima: '0.225', anchoEspectral: '13.33 Hz', tipoEspectro: 'Continuo' },
        amort: { freqDominante: '8.00 Hz', ampMaxima: '0.100', anchoEspectral: '8.00 Hz', tipoEspectro: 'Continuo' }
    };
    return metrics[signalId] || metrics.pulso;
}

// ================================================================
// ANIMACIONES
// ================================================================

function animateStats() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.round(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        // Solo animar si está visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(counter);
    });
}

// ================================================================
// MODAL DE PROPIEDADES
// ================================================================

function showPropertyModal(property) {
    const modal = new bootstrap.Modal(document.getElementById('propertyModal'));
    
    // Configurar contenido del modal
    const titles = {
        linealidad: 'Propiedad de Linealidad',
        desplazamiento: 'Propiedad de Desplazamiento Temporal',
        escalamiento: 'Propiedad de Escalamiento en Frecuencia',
        modulacion: 'Propiedad de Modulación',
        dualidad: 'Propiedad de Dualidad',
        resolucion: 'Resolución Espectral'
    };
    
    const descs = {
        linealidad: 'La Transformada de Fourier es lineal: la transformada de una combinación lineal de señales es la combinación lineal de sus transformadas.',
        desplazamiento: 'Un desplazamiento en el tiempo corresponde a un cambio de fase lineal en el dominio de la frecuencia.',
        escalamiento: 'El escalamiento en el tiempo produce un escalamiento inverso en la frecuencia, manteniendo el área bajo la señal.',
        modulacion: 'La modulación desplaza el espectro de la señal a la frecuencia de la portadora.',
        dualidad: 'La transformada inversa de Fourier permite recuperar la señal original desde su espectro.',
        resolucion: 'El uso de ventanas permite controlar la resolución espectral y el efecto de lóbulos laterales.'
    };
    
    const formulas = {
        linealidad: 'F[a·x(t) + b·y(t)] = a·X(f) + b·Y(f)',
        desplazamiento: 'x(t-t₀) ⟷ X(f)·e^(-j2πft₀)',
        escalamiento: 'x(at) ⟷ (1/|a|)·X(f/a)',
        modulacion: 'x(t)·cos(2πf₀t) ⟷ ½[X(f-f₀)+X(f+f₀)]',
        dualidad: 'x(t) ⟷ X(f) ⟷ x(-t)',
        resolucion: 'Δf ≈ 1/(N·Δt) [Resolución espectral]'
    };
    
    document.getElementById('propertyModalTitle').innerHTML = 
        `<i class="fas fa-cogs me-2"></i>${titles[property] || property}`;
    document.getElementById('propertyDesc').textContent = descs[property] || '';
    document.getElementById('propertyFormula').textContent = formulas[property] || '';
    
    // Renderizar gráfica de la propiedad
    renderPropertyChart(property);
    
    modal.show();
}

// ================================================================
// INICIALIZACIÓN
// ================================================================

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);

// Exportar funciones para uso en otros archivos
window.initApp = initApp;
window.updateSignalInfo = updateSignalInfo;
window.updateFourierCharts = updateFourierCharts;
window.showPropertyModal = showPropertyModal;