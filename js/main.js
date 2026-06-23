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
    fs: 1000,
    t: [],
    senales: {},
    currentSignal: 'pulso',
    currentProperty: 'linealidad',
    dataUrl: 'datos/señales_generadas.npz',
    jsonUrl: 'docs/documentacion_señales.json'
};

// ================================================================
// CARGA DE DATOS (VERSIÓN CORREGIDA)
// ================================================================

async function cargarDatos() {
    try {
        const response = await fetch(CONFIG.jsonUrl);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Datos cargados desde JSON');
            console.log('📋 Estructura del JSON:', Object.keys(data));
            
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
    console.log('🔄 Transformando datos al formato esperado...');
    
    // ============================================================
    // 1. DETECTAR LA ESTRUCTURA DEL JSON
    // ============================================================
    
    // Si ya tiene la estructura esperada (senales.pulso.tiempo)
    if (data.senales && data.senales.pulso && data.senales.pulso.tiempo) {
        console.log('📊 Los datos ya tienen el formato esperado');
        return data;
    }
    
    // Si tiene "señales" (con acento), lo renombramos a "senales"
    if (data.señales) {
        console.log('🔄 Renombrando "señales" → "senales"');
        data.senales = data.señales;
        delete data.señales;
    }
    
    // Si tiene "senales" pero con estructura diferente (x, y directos)
    if (data.senales) {
        const primeraClave = Object.keys(data.senales)[0];
        if (primeraClave) {
            const primeraSenal = data.senales[primeraClave];
            // Si tiene x e y directamente (sin tiempo)
            if (primeraSenal && primeraSenal.x !== undefined && primeraSenal.y !== undefined && !primeraSenal.tiempo) {
                console.log('🔄 Convirtiendo estructura {x, y} → {tiempo: {x, y}}');
                const nuevasSenales = {};
                for (const [key, value] of Object.entries(data.senales)) {
                    nuevasSenales[key] = {
                        ...value,
                        tiempo: {
                            x: value.x || [],
                            y: value.y || []
                        }
                    };
                    // Mantener las propiedades originales
                    if (value.nombre) nuevasSenales[key].nombre = value.nombre;
                    if (value.tipo) nuevasSenales[key].tipo = value.tipo;
                    if (value.descripcion) nuevasSenales[key].descripcion = value.descripcion;
                }
                data.senales = nuevasSenales;
                return data;
            }
        }
    }
    
    // Si no hay "senales" en el JSON, intentar construir desde cero
    if (!data.senales) {
        console.warn('⚠️ No se encontró "senales" en el JSON');
        
        // Intentar construir desde los datos disponibles
        const posiblesClaves = Object.keys(data).filter(key => 
            typeof data[key] === 'object' && data[key] !== null
        );
        
        if (posiblesClaves.length > 0) {
            console.log(`🔍 Posibles claves encontradas: ${posiblesClaves.join(', ')}`);
            
            // Usar la primera clave que parezca contener señales
            for (const clave of posiblesClaves) {
                const candidato = data[clave];
                if (candidato && typeof candidato === 'object') {
                    const subClaves = Object.keys(candidato);
                    if (subClaves.length > 0) {
                        const primeraSubClave = subClaves[0];
                        const muestra = candidato[primeraSubClave];
                        if (muestra && (muestra.x !== undefined || muestra.y !== undefined)) {
                            console.log(`✅ Usando "${clave}" como contenedor de señales`);
                            data.senales = candidato;
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // Si aún no hay senales, crear datos sintéticos
    if (!data.senales) {
        console.warn('⚠️ No se encontraron señales en el JSON, creando datos de respaldo');
        return null;
    }
    
    // ============================================================
    // 2. CONSTRUIR SEÑALES CON LA ESTRUCTURA CORRECTA
    // ============================================================
    
    const datosTransformados = { senales: {} };
    
    // Obtener el vector de tiempo de la primera señal disponible
    const keys = Object.keys(data.senales);
    if (keys.length === 0) {
        console.error('❌ No hay señales en el JSON');
        return null;
    }
    
    const primeraSenal = data.senales[keys[0]];
    let x = [];
    
    // Extraer vector de tiempo de diferentes estructuras posibles
    if (primeraSenal.tiempo && primeraSenal.tiempo.x) {
        x = primeraSenal.tiempo.x;
    } else if (primeraSenal.x) {
        x = primeraSenal.x;
    } else if (primeraSenal.tiempo && primeraSenal.tiempo.x) {
        x = primeraSenal.tiempo.x;
    }
    
    if (x.length === 0) {
        // Si no hay vector de tiempo, crear uno sintético
        console.warn('⚠️ No se encontró vector de tiempo, creando uno sintético');
        x = Array.from({length: 100}, (_, i) => i / 100);
    }
    
    console.log(`📊 Vector de tiempo: ${x.length} muestras`);
    
    // ============================================================
    // 3. PROCESAR CADA SEÑAL
    // ============================================================
    
    for (const [key, senal] of Object.entries(data.senales)) {
        let y = [];
        
        // Extraer datos de diferentes estructuras
        if (senal.tiempo && senal.tiempo.y) {
            y = senal.tiempo.y;
        } else if (senal.y) {
            y = senal.y;
        }
        
        // Si la señal no tiene datos, crear algunos sintéticos
        if (y.length === 0) {
            console.warn(`⚠️ Señal "${key}" sin datos, creando datos sintéticos`);
            y = x.map(ti => Math.sin(2 * Math.PI * 1 * ti));
        }
        
        datosTransformados.senales[key] = {
            nombre: senal.nombre || key,
            tipo: senal.tipo || key,
            descripcion: senal.descripcion || `Señal ${key}`,
            tiempo: { x: x, y: y },
            estadisticas: {
                energia: senal.estadisticas?.energia || 0.5,
                potencia: senal.estadisticas?.potencia || 0.5,
                maximo: Math.max(...y),
                minimo: Math.min(...y)
            }
        };
    }
    
    // ============================================================
    // 4. ASEGURAR QUE EXISTAN LAS SEÑALES PRINCIPALES
    // ============================================================
    
    const señalesRequeridas = ['pulso', 'escalon', 'senoidal', 'pulso-var', 'amort'];
    for (const req of señalesRequeridas) {
        if (!datosTransformados.senales[req]) {
            console.log(`➕ Creando señal "${req}" sintética`);
            let y;
            switch (req) {
                case 'pulso':
                    y = x.map(ti => (ti >= 0.4 && ti <= 0.6) ? 1 : 0);
                    break;
                case 'escalon':
                    y = x.map(ti => ti >= 0.3 ? 1 : 0);
                    break;
                case 'senoidal':
                    y = x.map(ti => Math.sin(2 * Math.PI * 1 * ti));
                    break;
                case 'pulso-var':
                    y = x.map(ti => (ti >= 0.625 && ti <= 0.775) ? 1.5 : 0);
                    break;
                case 'amort':
                    y = x.map(ti => Math.exp(-2 * ti) * Math.sin(2 * Math.PI * 8 * ti));
                    break;
                default:
                    y = x.map(() => 0);
            }
            datosTransformados.senales[req] = {
                nombre: req.charAt(0).toUpperCase() + req.slice(1),
                tipo: req,
                descripcion: `Señal ${req}`,
                tiempo: { x: x, y: y },
                estadisticas: {
                    energia: 0.5,
                    potencia: 0.5,
                    maximo: Math.max(...y),
                    minimo: Math.min(...y)
                }
            };
        }
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