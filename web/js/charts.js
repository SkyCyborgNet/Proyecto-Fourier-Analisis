/**
 * ================================================================
 * CHARTS.JS - Gestión de Gráficas Interactivas
 * ================================================================
 * Utiliza Plotly.js para crear gráficas interactivas de señales
 * y espectros en los dominios del tiempo y frecuencia.
 */

// ================================================================
// CONFIGURACIÓN DE GRÁFICAS
// ================================================================

const CHART_COLORS = {
    primary: '#2962ff',
    secondary: '#ff6d00',
    success: '#00c853',
    danger: '#d50000',
    purple: '#7c4dff',
    teal: '#00bcd4',
    pink: '#ff4081',
    gray: '#9e9e9e'
};

const CHART_LAYOUT = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', size: 12 },
    margin: { l: 50, r: 20, t: 20, b: 50 },
    showlegend: true,
    legend: {
        orientation: 'h',
        y: 1.05,
        x: 0.5,
        xanchor: 'center'
    }
};

// ================================================================
// INICIALIZACIÓN DE GRÁFICAS DE SEÑALES
// ================================================================

function initCharts() {
    // Inicializar gráficas de señales en tiempo
    const signalIds = ['pulso', 'escalon', 'senoidal', 'pulso-var', 'amort'];
    signalIds.forEach(id => {
        renderSignalChart(id);
    });
    
    // Inicializar gráficas de Fourier
    renderFourierCharts('pulso');
}

// ================================================================
// GRÁFICAS DE SEÑALES EN TIEMPO
// ================================================================

function renderSignalChart(signalId) {
    const chartDiv = document.getElementById(`chart-${signalId}-tiempo`);
    if (!chartDiv) return;
    
    const signal = appData?.señales?.[signalId];
    if (!signal) {
        chartDiv.innerHTML = '<p class="text-muted">Datos no disponibles</p>';
        return;
    }
    
    const data = [{
        x: signal.tiempo.x,
        y: signal.tiempo.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.primary, width: 2.5 },
        name: signal.nombre,
        hovertemplate: 't: %{x:.3f}s<br>Amplitud: %{y:.3f}<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 350,
        xaxis: {
            title: 'Tiempo (s)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Amplitud',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            rangemode: 'tozero'
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false });
}

// ================================================================
// GRÁFICAS DE FOURIER (TIEMPO + ESPECTROS)
// ================================================================

function renderFourierCharts(signalId) {
    const signal = appData?.señales?.[signalId];
    if (!signal) return;
    
    // 1. Señal en tiempo
    renderFourierTimeChart(signalId, signal);
    
    // 2. Espectro de magnitud
    renderFourierMagnitudeChart(signalId, signal);
    
    // 3. Espectro de fase
    renderFourierPhaseChart(signalId, signal);
}

function renderFourierTimeChart(signalId, signal) {
    const chartDiv = document.getElementById('chart-fourier-tiempo');
    if (!chartDiv) return;
    
    const data = [{
        x: signal.tiempo.x,
        y: signal.tiempo.y,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.primary, width: 2.5 },
        name: signal.nombre,
        hovertemplate: 't: %{x:.3f}s<br>Amplitud: %{y:.3f}<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 250,
        xaxis: {
            title: 'Tiempo (s)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        },
        yaxis: {
            title: 'Amplitud',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false });
}

function renderFourierMagnitudeChart(signalId, signal) {
    const chartDiv = document.getElementById('chart-fourier-magnitud');
    if (!chartDiv) return;
    
    // Calcular FFT simulada para demostración
    const { freq, magnitud } = calculateFFT(signal.tiempo.y, 1000);
    
    const data = [{
        x: freq,
        y: magnitud,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.secondary, width: 2 },
        name: '|X(f)|',
        hovertemplate: 'f: %{x:.2f} Hz<br>|X|: %{y:.3f}<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 250,
        xaxis: {
            title: 'Frecuencia (Hz)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            range: [-20, 20]
        },
        yaxis: {
            title: '|X(f)|',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)'
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false });
}

function renderFourierPhaseChart(signalId, signal) {
    const chartDiv = document.getElementById('chart-fourier-fase');
    if (!chartDiv) return;
    
    // Calcular FFT simulada para demostración
    const { freq, fase } = calculateFFTPhase(signal.tiempo.y, 1000);
    
    const data = [{
        x: freq,
        y: fase,
        type: 'scatter',
        mode: 'lines',
        line: { color: CHART_COLORS.purple, width: 2 },
        name: '∠X(f)',
        hovertemplate: 'f: %{x:.2f} Hz<br>Fase: %{y:.3f} rad<extra></extra>'
    }];
    
    const layout = {
        ...CHART_LAYOUT,
        height: 250,
        xaxis: {
            title: 'Frecuencia (Hz)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            range: [-20, 20]
        },
        yaxis: {
            title: 'Fase (rad)',
            gridcolor: 'rgba(0,0,0,0.05)',
            zerolinecolor: 'rgba(0,0,0,0.1)',
            range: [-Math.PI, Math.PI]
        }
    };
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false });
}

// ================================================================
// CÁLCULO DE FFT SIMULADA
// ================================================================

function calculateFFT(signal, fs) {
    const n = signal.length;
    const freq = Array.from({length: n}, (_, i) => (i - n/2) * fs / n);
    
    // Simulación de FFT (para demostración)
    // En una implementación real, usaríamos la FFT de SciPy
    const magnitud = signal.map((_, i) => {
        const f = freq[i];
        // Simular espectro basado en la señal
        if (Math.abs(f) < 0.5) return 0.1;
        // Para señales senoidales, pico en la frecuencia
        const freqPeak = 5; // Hz
        if (Math.abs(Math.abs(f) - freqPeak) < 0.5) return 0.25;
        return 0.02 / (1 + Math.abs(f) * 0.5);
    });
    
    return { freq, magnitud };
}

function calculateFFTPhase(signal, fs) {
    const n = signal.length;
    const freq = Array.from({length: n}, (_, i) => (i - n/2) * fs / n);
    
    // Simulación de fase
    const fase = freq.map(f => {
        if (Math.abs(f) < 0.5) return 0;
        return Math.atan2(1, f * 0.5);
    });
    
    return { freq, fase };
}

// ================================================================
// GRÁFICAS DE PROPIEDADES
// ================================================================

function renderPropertyChart(property) {
    const chartDiv = document.getElementById('propertyChart');
    if (!chartDiv) return;
    
    let data = [];
    let layout = { ...CHART_LAYOUT, height: 400 };
    
    switch(property) {
        case 'linealidad':
            data = renderLinealidadChart();
            break;
        case 'desplazamiento':
            data = renderDesplazamientoChart();
            break;
        case 'escalamiento':
            data = renderEscalamientoChart();
            break;
        case 'modulacion':
            data = renderModulacionChart();
            break;
        case 'dualidad':
            data = renderDualidadChart();
            break;
        case 'resolucion':
            data = renderResolucionChart();
            break;
        default:
            data = [{
                x: [0, 1],
                y: [0, 0],
                type: 'scatter',
                mode: 'lines',
                name: 'No hay datos'
            }];
    }
    
    Plotly.newPlot(chartDiv, data, layout, { responsive: true, displayModeBar: false });
}

// ================================================================
// GRÁFICAS DE PROPIEDADES ESPECÍFICAS
// ================================================================

function renderLinealidadChart() {
    // Demostración de linealidad: suma de señales
    const t = Array.from({length: 200}, (_, i) => i / 1000);
    const sen1 = t.map(ti => Math.sin(2 * Math.PI * 3 * ti));
    const sen2 = t.map(ti => 0.5 * Math.sin(2 * Math.PI * 7 * ti));
    const suma = sen1.map((v, i) => v + sen2[i]);
    
    return [
        {
            x: t,
            y: sen1,
            type: 'scatter',
            mode: 'lines',
            name: 'Señal 1: sen(2π·3t)',
            line: { color: CHART_COLORS.primary }
        },
        {
            x: t,
            y: sen2,
            type: 'scatter',
            mode: 'lines',
            name: 'Señal 2: 0.5·sen(2π·7t)',
            line: { color: CHART_COLORS.secondary }
        },
        {
            x: t,
            y: suma,
            type: 'scatter',
            mode: 'lines',
            name: 'Suma: señal1 + señal2',
            line: { color: CHART_COLORS.success, width: 2.5 }
        }
    ];
}

function renderDesplazamientoChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const pulse = t.map(ti => (ti >= 0.3 && ti <= 0.5) ? 1 : 0);
    const pulseShift = t.map(ti => (ti >= 0.5 && ti <= 0.7) ? 1 : 0);
    
    return [
        {
            x: t,
            y: pulse,
            type: 'scatter',
            mode: 'lines',
            name: 'Pulso original',
            line: { color: CHART_COLORS.primary, width: 2 }
        },
        {
            x: t,
            y: pulseShift,
            type: 'scatter',
            mode: 'lines',
            name: 'Pulso desplazado (Δt=0.2s)',
            line: { color: CHART_COLORS.secondary, width: 2, dash: 'dash' }
        }
    ];
}

function renderEscalamientoChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const pulseNarrow = t.map(ti => (ti >= 0.45 && ti <= 0.55) ? 1 : 0);
    const pulseWide = t.map(ti => (ti >= 0.3 && ti <= 0.7) ? 1 : 0);
    
    return [
        {
            x: t,
            y: pulseNarrow,
            type: 'scatter',
            mode: 'lines',
            name: 'Pulso estrecho (Δt=0.1s)',
            line: { color: CHART_COLORS.primary, width: 2 }
        },
        {
            x: t,
            y: pulseWide,
            type: 'scatter',
            mode: 'lines',
            name: 'Pulso ancho (Δt=0.4s)',
            line: { color: CHART_COLORS.secondary, width: 2 }
        }
    ];
}

function renderModulacionChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const pulse = t.map(ti => (ti >= 0.4 && ti <= 0.6) ? 1 : 0);
    const modulated = t.map((ti, i) => pulse[i] * Math.cos(2 * Math.PI * 20 * ti));
    
    return [
        {
            x: t,
            y: pulse,
            type: 'scatter',
            mode: 'lines',
            name: 'Pulso original',
            line: { color: CHART_COLORS.primary, width: 2 }
        },
        {
            x: t,
            y: modulated,
            type: 'scatter',
            mode: 'lines',
            name: 'Pulso modulado (fc=20Hz)',
            line: { color: CHART_COLORS.secondary, width: 2 }
        }
    ];
}

function renderDualidadChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const signal = t.map(ti => Math.exp(-2 * ti) * Math.sin(2 * Math.PI * 8 * ti));
    const reconstructed = signal.map(v => v + (Math.random() - 0.5) * 0.01); // Simulación
    
    return [
        {
            x: t,
            y: signal,
            type: 'scatter',
            mode: 'lines',
            name: 'Señal original',
            line: { color: CHART_COLORS.primary, width: 2 }
        },
        {
            x: t,
            y: reconstructed,
            type: 'scatter',
            mode: 'lines',
            name: 'Señal reconstruida (IFFT)',
            line: { color: CHART_COLORS.success, width: 2, dash: 'dash' }
        }
    ];
}

function renderResolucionChart() {
    const t = Array.from({length: 500}, (_, i) => i / 1000);
    const f1 = 10, f2 = 12;
    const signal = t.map(ti => Math.sin(2 * Math.PI * f1 * ti) + Math.sin(2 * Math.PI * f2 * ti));
    
    // Ventanas
    const hamming = t.map((_, i) => 0.54 - 0.46 * Math.cos(2 * Math.PI * i / t.length));
    const windowed = signal.map((v, i) => v * hamming[i]);
    
    return [
        {
            x: t,
            y: signal,
            type: 'scatter',
            mode: 'lines',
            name: 'Señal original (10Hz + 12Hz)',
            line: { color: CHART_COLORS.primary, width: 2 }
        },
        {
            x: t,
            y: windowed,
            type: 'scatter',
            mode: 'lines',
            name: 'Con ventana Hamming',
            line: { color: CHART_COLORS.secondary, width: 2 }
        }
    ];
}

// ================================================================
// EXPORTAR FUNCIONES
// ================================================================

window.initCharts = initCharts;
window.renderSignalChart = renderSignalChart;
window.renderFourierCharts = renderFourierCharts;
window.renderPropertyChart = renderPropertyChart;