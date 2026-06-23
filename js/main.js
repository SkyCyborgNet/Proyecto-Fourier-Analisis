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
    senales: {},
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

async function cargarDatos() {
    try {
        const response = await fetch(CONFIG.jsonUrl);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos cargados desde JSON');
            
            const datosTransformados = transformarDatos(data);
            if (datosTransformados && datosTransformados.senales) {
                console.log('✅ Datos transformados correctamente');
                return datosTransformados;
            } else {
                console.warn('⚠️ La transformación no produjo datos válidos');
            }
        } else {
            console.warn(`⚠️ No se pudo cargar JSON (status: ${response.status})`);
        }
    } catch (e) {
        console.error('❌ Error al cargar JSON:', e);
    }
    
    console.log('📊 Usando datos de respaldo (sintéticos)');
    return getDatosRespaldo();
}

function transformarDatos(data) {
    // ✅ CORREGIDO: Buscar "senales" o "señales"
    if (data.senales && data.senales.pulso && data.senales.pulso.tiempo) {
        console.log('📊 Los datos ya tienen el formato esperado');
        return data;
    }
    
    // Si tiene "señales" (con acento), lo convertimos a "senales"
    if (data.señales && !data.senales) {
        data.senales = data.señales;
        console.log('🔄 Convertido "señales" → "senales"');
    }
    
    console.log('🔄 Transformando datos al formato esperado...');
    
    if (!data.senales) {
        console.error('❌ No se encontró "senales" en el JSON');
        return null;
    }
    
    const datosTransformados = { senales: {} };
    const primeraSenal = data.senales[Object.keys(data.senales)[0]];
    if (!primeraSenal) {
        console.error('❌ No se encontraron señales en el JSON');
        return null;
    }
    
    const x = primeraSenal.x || [];
    if (x.length === 0) {
        console.error('❌ El vector de tiempo está vacío');
        return null;
    }
    
    // ============================================================
    // 1. SEÑAL SENOIDAL
    // ============================================================
    if (data.senales.senoidal) {
        const s = data.senales.senoidal;
        datosTransformados.senales.senoidal = {
            nombre: s.nombre || 'Señal Senoidal',
            tipo: s.tipo || 'senoidal',
            descripcion: 'Señal senoidal de 1Hz con amplitud unitaria',
            tiempo: { x: s.x || x, y: s.y || [] },
            estadisticas: {
                energia: 0.5,
                potencia: 0.5,
                maximo: Math.max(...(s.y || [0])),
                minimo: Math.min(...(s.y || [0]))
            }
        };
    }
    
    // ============================================================
    // 2. PULSO RECTANGULAR
    // ============================================================
    datosTransformados.senales.pulso = {
        nombre: 'Pulso Rectangular',
        tipo: 'pulso',
        descripcion: 'Pulso rectangular con ancho de 200ms y centro en 500ms',
        tiempo: { x: x, y: x.map(ti => (ti >= 0.4 && ti <= 0.6) ? 1 : 0) },
        estadisticas: { energia: 0.2, potencia: 0.2, maximo: 1.0, minimo: 0.0 }
    };
    
    // ============================================================
    // 3. ESCALÓN
    // ============================================================
    datosTransformados.senales.escalon = {
        nombre: 'Escalón',
        tipo: 'escalon',
        descripcion: 'Función escalón unitario con salto en t=300ms',
        tiempo: { x: x, y: x.map(ti => ti >= 0.3 ? 1 : 0) },
        estadisticas: { energia: 0.7, potencia: 0.7, maximo: 1.0, minimo: 0.0 }
    };
    
    // ============================================================
    // 4. PULSO VARIANTE
    // ============================================================
    datosTransformados.senales['pulso-var'] = {
        nombre: 'Pulso Variante',
        tipo: 'pulso-var',
        descripcion: 'Pulso rectangular con amplitud 1.5 y ancho 150ms',
        tiempo: { x: x, y: x.map(ti => (ti >= 0.625 && ti <= 0.775) ? 1.5 : 0) },
        estadisticas: { energia: 0.337, potencia: 0.337, maximo: 1.5, minimo: 0.0 }
    };
    
    // ============================================================
    // 5. SENOIDAL AMORTIGUADA
    // ============================================================
    datosTransformados.senales.amort = {
        nombre: 'Senoidal Amortiguada',
        tipo: 'amort',
        descripcion: 'Señal senoidal amortiguada exponencialmente',
        tiempo: { x: x, y: x.map(ti => Math.exp(-2 * ti) * Math.sin(2 * Math.PI * 8 * ti)) },
        estadisticas: { energia: 0.125, potencia: 0.125, maximo: 0.79, minimo: -0.79 }
    };
    
    // ============================================================
    // 6. SEÑAL CUADRADA
    // ============================================================
    if (data.senales.cuadrada) {
        const s = data.senales.cuadrada;
        datosTransformados.senales.cuadrada = {
            nombre: s.nombre || 'Señal Cuadrada',
            tipo: s.tipo || 'cuadrada',
            descripcion: 'Señal cuadrada de 1Hz con amplitud ±1',
            tiempo: { x: s.x || x, y: s.y || [] },
            estadisticas: {
                energia: 1.0,
                potencia: 1.0,
                maximo: Math.max(...(s.y || [0])),
                minimo: Math.min(...(s.y || [0]))
            }
        };
    }
    
    // ============================================================
    // 7. DIENTE DE SIERRA
    // ============================================================
    if (data.senales.diente_sierra) {
        const s = data.senales.diente_sierra;
        datosTransformados.senales.diente_sierra = {
            nombre: s.nombre || 'Señal Diente de Sierra',
            tipo: s.tipo || 'diente_sierra',
            descripcion: 'Señal diente de sierra de 1Hz',
            tiempo: { x: s.x || x, y: s.y || [] },
            estadisticas: {
                energia: 0.5,
                potencia: 0.5,
                maximo: Math.max(...(s.y || [0])),
                minimo: Math.min(...(s.y || [0]))
            }
        };
    }
    
    console.log('✅ Datos transformados correctamente');
    console.log('📊 Señales disponibles:', Object.keys(datosTransformados.senales));
    return datosTransformados;
}

function getDatosRespaldo() {
    console.log('📊 Usando datos de respaldo (sintéticos)');
    const fs = 1000;
    const t = Array.from({length: 1000}, (_, i) => i / fs);
    
    return {
        senales: {
            pulso: {
                nombre: 'Pulso Rectangular',
                descripcion: 'Pulso rectangular con ancho de 200ms y centro en 500ms',
                tiempo: { x: t, y: t.map(ti => (ti >= 0.4 && ti <= 0.6) ? 1 : 0) },
                estadisticas: { energia: 0.2, potencia: 0.2, maximo: 1.0, minimo: 0.0 }
            },
            escalon: {
                nombre: 'Escalón',
                descripcion: 'Función escalón unitario con salto en t=300ms',
                tiempo: { x: t, y: t.map(ti => ti >= 0.3 ? 1 : 0) },
                estadisticas: { energia: 0.7, potencia: 0.7, maximo: 1.0, minimo: 0.0 }
            },
            senoidal: {
                nombre: 'Senoidal',
                descripcion: 'Señal senoidal de 5Hz con amplitud unitaria',
                tiempo: { x: t, y: t.map(ti => Math.sin(2 * Math.PI * 5 * ti)) },
                estadisticas: { energia: 0.5, potencia: 0.5, maximo: 1.0, minimo: -1.0 }
            },
            'pulso-var': {
                nombre: 'Pulso Variante',
                descripcion: 'Pulso rectangular con amplitud 1.5 y ancho 150ms',
                tiempo: { x: t, y: t.map(ti => (ti >= 0.625 && ti <= 0.775) ? 1.5 : 0) },
                estadisticas: { energia: 0.337, potencia: 0.337, maximo: 1.5, minimo: 0.0 }
            },
            amort: {
                nombre: 'Senoidal Amortiguada',
                descripcion: 'Señal senoidal amortiguada exponencialmente',
                tiempo: { x: t, y: t.map(ti => Math.exp(-2 * ti) * Math.sin(2 * Math.PI * 8 * ti)) },
                estadisticas: { energia: 0.125, potencia: 0.125, maximo: 0.79, minimo: -0.79 }
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
    appData = await cargarDatos();
    console.log('📊 Datos cargados:', appData);
    
    // ✅ Pequeña pausa para asegurar que appData esté lista
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (typeof initCharts === 'function') {
        initCharts();
    } else {
        console.warn('⚠️ initCharts no está definida');
    }
    
    if (typeof initNavigation === 'function') {
        initNavigation();
    } else {
        console.warn('⚠️ initNavigation no está definida');
    }
    
    setupEventListeners();
    animateStats();
    console.log('✅ Aplicación inicializada correctamente');
}

// ================================================================
// EVENT LISTENERS
// ================================================================

function setupEventListeners() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    document.querySelectorAll('.señales-tabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const signalId = this.getAttribute('data-bs-target').replace('#tab-', '');
            updateSignalInfo(signalId);
        });
    });
    
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
    
    document.querySelectorAll('.property-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const property = this.dataset.property;
            showPropertyModal(property);
        });
    });
    
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
    const signal = appData?.senales?.[signalId];
    if (!signal) return;
    
    const stats = signal.estadisticas;
    document.getElementById(`${signalId}-energia`).textContent = stats.energia.toFixed(3);
    document.getElementById(`${signalId}-potencia`).textContent = stats.potencia.toFixed(3);
    document.getElementById(`${signalId}-max`).textContent = stats.maximo.toFixed(3);
    document.getElementById(`${signalId}-min`).textContent = stats.minimo.toFixed(3);
}

function updateFourierCharts(signalId) {
    const signal = appData?.senales?.[signalId];
    if (!signal) return;
    
    const metrics = getFourierMetrics(signalId);
    document.getElementById('freq-dominante').textContent = metrics.freqDominante;
    document.getElementById('amp-maxima').textContent = metrics.ampMaxima;
    document.getElementById('ancho-espectral').textContent = metrics.anchoEspectral;
    document.getElementById('tipo-espectro').textContent = metrics.tipoEspectro;
    
    if (typeof renderFourierCharts === 'function') {
        renderFourierCharts(signalId);
    }
}

function getFourierMetrics(signalId) {
    const metrics = {
        pulso: { freqDominante: '0.00 Hz', ampMaxima: '0.200', anchoEspectral: '10.00 Hz', tipoEspectro: 'Continuo' },
        escalon: { freqDominante: '0.00 Hz', ampMaxima: '0.500', anchoEspectral: '15.00 Hz', tipoEspectro: 'Continuo' },
        senoidal: { freqDominante: '5.00 Hz', ampMaxima: '0.500', anchoEspectral: '0.00 Hz', tipoEspectro: 'Discreto' },
        'pulso-var': { freqDominante: '0.00 Hz', ampMaxima: '0.225', anchoEspectral: '13.33 Hz', tipoEspectro: 'Continuo' },
        amort: { freqDominante: '8.00 Hz', ampMaxima: '0.100', anchoEspectral: '8.00 Hz', tipoEspectro: 'Continuo' },
        cuadrada: { freqDominante: '1.00 Hz', ampMaxima: '0.500', anchoEspectral: '10.00 Hz', tipoEspectro: 'Continuo' },
        diente_sierra: { freqDominante: '1.00 Hz', ampMaxima: '0.300', anchoEspectral: '8.00 Hz', tipoEspectro: 'Continuo' }
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
    
    if (typeof renderPropertyChart === 'function') {
        renderPropertyChart(property);
    }
    
    modal.show();
}

// ================================================================
// INICIALIZACIÓN
// ================================================================

document.addEventListener('DOMContentLoaded', initApp);

window.initApp = initApp;
window.updateSignalInfo = updateSignalInfo;
window.updateFourierCharts = updateFourierCharts;
window.showPropertyModal = showPropertyModal;