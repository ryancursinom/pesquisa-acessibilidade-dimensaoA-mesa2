/**
 * MIDAS - Sistema de Leilões
 * Lógica Vanilla JS para animações e acessibilidade
 * (Dados mockados removidos conforme solicitação)
 */

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initAccessibility();
    initButtonAnimations();
});

/**
 * Inicializa a lógica do carrossel (Animação de tela)
 */
function initCarousel() {
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const grid = document.getElementById('grid-breve');

    if (prevBtn && nextBtn && grid) {
        nextBtn.addEventListener('click', () => {
            grid.scrollBy({ left: 300, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            grid.scrollBy({ left: -300, behavior: 'smooth' });
        });
    }
}

/**
 * Melhorias de acessibilidade e navegação por teclado
 */
function initAccessibility() {
    // Smooth scroll para âncoras internas
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });
}

/**
 * Animações de interação nos botões
 */
function initButtonAnimations() {
    const bidButtons = document.querySelectorAll('.btn-bid');
    
    bidButtons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
            // Placeholder para futura conexão com back-end
            console.log('Botão de lance clicado. Aguardando integração.');
        });
    });
}

/**
 * Animações de entrada (Reveal) para a página Sobre Nós
 */
function initScrollReveal() {
    const sections = document.querySelectorAll('.about-section, .creative-section, .advantage-item, .testimonial-card');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            
            if (sectionTop < triggerBottom) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };

    // Estilos iniciais para animação
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Executa uma vez no carregamento
}

// Inicializa revelação no scroll se estiver na página Sobre Nós
if (document.body.classList.contains('about-page')) {
    window.addEventListener('load', initScrollReveal);
}
