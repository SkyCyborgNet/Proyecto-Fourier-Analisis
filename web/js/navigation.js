/**
 * ================================================================
 * NAVIGATION.JS - Navegación y UX
 * ================================================================
 * Controla la navegación entre secciones, el menú hamburguesa,
 * y las interacciones de scroll.
 */

// ================================================================
// NAVEGACIÓN CON SCROLL SUAVE
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar navegación
    initNavbarScroll();
    initActiveSection();
    initMenuToggle();
});

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

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});

// ================================================================
// EXPORTAR FUNCIONES
// ================================================================

window.scrollToSection = scrollToSection;
window.updatePageTitle = updatePageTitle;