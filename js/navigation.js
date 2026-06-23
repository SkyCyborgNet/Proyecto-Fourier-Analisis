/**
 * ================================================================
 * NAVIGATION.JS - Navegación y UX
 * ================================================================
 * Controla la navegación entre secciones, el menú hamburguesa,
 * y las interacciones de scroll.
 */

// ================================================================
// INICIALIZACIÓN PRINCIPAL (NUEVA FUNCIÓN)
// ================================================================

/**
 * Función principal que inicializa toda la navegación
 * Esta es la función que main.js espera
 */
function initNavigation() {
    console.log('🧭 Inicializando navegación...');
    initNavbarScroll();
    initActiveSection();
    initMenuToggle();
    initSmoothScroll();
    initScrollAnimations();
}

// ================================================================
// NAVEGACIÓN CON SCROLL SUAVE
// ================================================================

/**
 * Cambia el estilo del navbar al hacer scroll
 */
function initNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;
    
    // Estado inicial
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    }
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

/**
 * Marca el enlace de navegación activo según la sección visible
 */
function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#mainNav .nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    window.addEventListener('scroll', function() {
        let current = '';
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Cierra el menú al hacer click en un enlace (mobile)
 */
function initMenuToggle() {
    const navLinks = document.querySelectorAll('#mainNav .nav-link');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            }
        });
    });
}

/**
 * Scroll suave para todos los enlaces internos
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ================================================================
// FUNCIONES DE UTILIDAD PARA NAVEGACIÓN
// ================================================================

/**
 * Scroll suave a una sección específica
 * @param {string} sectionId - ID de la sección destino
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
    });
}

/**
 * Actualiza el título de la página según la sección visible
 * @param {string} sectionId - ID de la sección actual
 */
function updatePageTitle(sectionId) {
    const titles = {
        inicio: 'Inicio - Señales y Fourier',
        senales: 'Señales Generadas - Señales y Fourier',
        fourier: 'Transformada de Fourier - Señales y Fourier',
        propiedades: 'Propiedades - Señales y Fourier',
        documentacion: 'Documentación - Señales y Fourier'
    };
    
    const newTitle = titles[sectionId] || 'Señales y Fourier';
    if (document.title !== newTitle) {
        document.title = newTitle;
    }
}

// ================================================================
// OBSERVADOR DE SECCIONES (para animaciones)
// ================================================================

/**
 * Inicializa un IntersectionObserver para animar elementos al hacer scroll
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.section-padding, .property-card, .doc-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => observer.observe(el));
}

// ================================================================
// INICIALIZACIÓN AUTOMÁTICA (cuando el DOM está listo)
// ================================================================

// Esta es la inicialización que ya tenías
document.addEventListener('DOMContentLoaded', function() {
    // Ya no llamamos a initNavigation() aquí porque main.js lo hará
    // Solo inicializamos las animaciones de scroll
    initScrollAnimations();
    // También podemos inicializar el navbar scroll desde aquí
    initNavbarScroll();
    initActiveSection();
    initMenuToggle();
});

// ================================================================
// EXPORTAR FUNCIONES (para usar en main.js)
// ================================================================

// ¡ESTA ES LA LÍNEA QUE FALTABA!
window.initNavigation = initNavigation;
window.scrollToSection = scrollToSection;
window.updatePageTitle = updatePageTitle;

console.log('🧭 navigation.js cargado correctamente');