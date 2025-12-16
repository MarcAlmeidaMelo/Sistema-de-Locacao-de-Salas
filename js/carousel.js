// =====================================================================
// CAROUSEL.JS - CAJUHUB
// =====================================================================

let slideIndex = 1;
let slideTimer = null;

// Inicializar o carrossel quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  showSlide(slideIndex);
  startAutoSlide();
});

/**
 * Muda para o próximo ou anterior slide
 * @param {number} n - Número de slides para avançar (positivo) ou retroceder (negativo)
 */
function changeSlide(n) {
  clearTimeout(slideTimer);
  showSlide(slideIndex += n);
  startAutoSlide();
}

/**
 * Vai para um slide específico
 * @param {number} n - Número do slide (1-indexed)
 */
function currentSlide(n) {
  clearTimeout(slideTimer);
  showSlide(slideIndex = n);
  startAutoSlide();
}

/**
 * Exibe o slide no índice especificado
 * @param {number} n - Número do slide
 */
function showSlide(n) {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');

  // Se o índice for maior que o número de slides, volta para o primeiro
  if (n > slides.length) {
    slideIndex = 1;
  }

  // Se o índice for menor que 1, vai para o último slide
  if (n < 1) {
    slideIndex = slides.length;
  }

  // Ocultar todos os slides
  slides.forEach(slide => {
    slide.classList.remove('fade');
    slide.style.display = 'none';
  });

  // Remover a classe 'active' de todos os indicadores
  indicators.forEach(indicator => {
    indicator.classList.remove('active');
  });

  // Mostrar o slide atual
  if (slides[slideIndex - 1]) {
    slides[slideIndex - 1].style.display = 'block';
    slides[slideIndex - 1].classList.add('fade');
  }

  // Marcar o indicador atual como ativo
  if (indicators[slideIndex - 1]) {
    indicators[slideIndex - 1].classList.add('active');
  }
}

/**
 * Inicia o auto-play do carrossel (muda de slide a cada 5 segundos)
 */
function startAutoSlide() {
  slideTimer = setTimeout(() => {
    slideIndex++;
    showSlide(slideIndex);
    startAutoSlide();
  }, 5000); // Muda de slide a cada 5 segundos
}

/**
 * Para o auto-play do carrossel
 */
function stopAutoSlide() {
  clearTimeout(slideTimer);
}

// Parar o auto-play quando o mouse estiver sobre o carrossel
const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
  carouselContainer.addEventListener('mouseenter', stopAutoSlide);
  carouselContainer.addEventListener('mouseleave', startAutoSlide);
}
