class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 8;
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideIndicators = document.getElementById('slideIndicators');
        this.currentSlideSpan = document.getElementById('currentSlide');
        this.totalSlidesSpan = document.getElementById('totalSlides');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.animationTimers = [];
        this.charts = {};
        this.isTransitioning = false;
        this.currentTheme = 'light';
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando presentación...');
        this.createSlideIndicators();
        this.bindEvents();
        this.updateSlideCounter();
        this.updateNavigation();
        this.addProgressBar();
        this.initializeSlides();
        this.loadThemePreference();
        
        // Show first slide immediately
        setTimeout(() => {
            this.showSlide(1);
            document.body.style.opacity = '1';
            console.log('✅ Presentación lista');
        }, 100);
    }
    
    initializeSlides() {
        // Ensure all slides are properly hidden except the first one
        this.slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
                slide.style.opacity = '1';
                slide.style.transform = 'translateX(0) scale(1)';
                slide.style.zIndex = '10';
            } else {
                slide.classList.remove('active');
                slide.style.opacity = '0';
                slide.style.transform = 'translateX(100px) scale(0.95)';
                slide.style.zIndex = '1';
            }
        });
    }
    
    loadThemePreference() {
        // Try to get saved theme, default to light
        let savedTheme = 'light';
        try {
            savedTheme = localStorage.getItem('presentationTheme') || 'light';
        } catch (e) {
            console.log('LocalStorage no disponible, usando tema por defecto');
        }
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        console.log('🎨 Cambiando tema a:', theme);
        this.currentTheme = theme;
        document.body.setAttribute('data-color-scheme', theme);
        
        if (theme === 'dark') {
            this.themeIcon.className = 'fas fa-sun';
        } else {
            this.themeIcon.className = 'fas fa-moon';
        }
        
        try {
            localStorage.setItem('presentationTheme', theme);
        } catch (e) {
            console.log('No se pudo guardar preferencia de tema');
        }
        
        // Update charts if they exist
        setTimeout(() => {
            this.updateChartsForTheme();
        }, 100);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Add visual feedback
        if (this.themeToggle) {
            this.themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
            setTimeout(() => {
                this.themeToggle.style.transform = '';
            }, 200);
        }
    }
    
    createSlideIndicators() {
        if (!this.slideIndicators) return;
        
        this.slideIndicators.innerHTML = '';
        for (let i = 1; i <= this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'slide-indicator';
            indicator.dataset.slide = i;
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('tabindex', '0');
            indicator.setAttribute('aria-label', `Ir a diapositiva ${i}`);
            
            if (i === 1) {
                indicator.classList.add('active');
            }
            
            // Add click event with proper event handling
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const slideNum = parseInt(indicator.dataset.slide);
                console.log('📍 Indicador clickeado para diapositiva:', slideNum);
                this.goToSlide(slideNum);
            });
            
            // Add keyboard support for indicators
            indicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const slideNum = parseInt(indicator.dataset.slide);
                    this.goToSlide(slideNum);
                }
            });
            
            this.slideIndicators.appendChild(indicator);
        }
        console.log('✅ Indicadores de diapositiva creados');
    }
    
    bindEvents() {
        console.log('🔗 Configurando eventos...');
        
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎨 Theme toggle clickeado');
                this.toggleTheme();
            });
        }
        
        // Navigation buttons with proper event handling
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('⬅️ Botón anterior clickeado');
                this.addButtonFeedback(this.prevBtn);
                this.previousSlide();
            });
            
            // Add visual feedback on hover
            this.prevBtn.addEventListener('mousedown', () => {
                this.prevBtn.style.transform = 'scale(0.95)';
            });
            this.prevBtn.addEventListener('mouseup', () => {
                setTimeout(() => {
                    this.prevBtn.style.transform = '';
                }, 100);
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('➡️ Botón siguiente clickeado');
                this.addButtonFeedback(this.nextBtn);
                this.nextSlide();
            });
            
            // Add visual feedback on hover
            this.nextBtn.addEventListener('mousedown', () => {
                this.nextBtn.style.transform = 'scale(0.95)';
            });
            this.nextBtn.addEventListener('mouseup', () => {
                setTimeout(() => {
                    this.nextBtn.style.transform = '';
                }, 100);
            });
        }
        
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    console.log('⌨️ Navegación anterior (teclado)');
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    console.log('⌨️ Navegación siguiente (teclado)');
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    console.log('⌨️ Ir a primera diapositiva');
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    console.log('⌨️ Ir a última diapositiva');
                    this.goToSlide(this.totalSlides);
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showKeyboardShortcuts();
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
            }
        });
        
        // Touch/swipe support
        this.setupTouchNavigation();
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Prevent default scroll behavior on main container
        const presentationContainer = document.querySelector('.presentation-container');
        if (presentationContainer) {
            presentationContainer.addEventListener('wheel', (e) => {
                if (!e.target.closest('.slide-content')) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
        
        console.log('✅ Eventos configurados');
    }
    
    setupTouchNavigation() {
        let startX = null;
        let startY = null;
        let startTime = null;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY || !startTime || this.isTransitioning) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            const diffX = startX - endX;
            const diffY = startY - endY;
            const timeDiff = endTime - startTime;
            
            // Only process quick swipes
            if (timeDiff < 300 && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    console.log('👆 Swipe: siguiente diapositiva');
                    this.nextSlide();
                } else {
                    console.log('👆 Swipe: anterior diapositiva');
                    this.previousSlide();
                }
            }
            
            startX = null;
            startY = null;
            startTime = null;
        }, { passive: true });
    }
    
    addButtonFeedback(button) {
        if (!button) return;
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    goToSlide(slideNumber) {
        console.log(`🎯 Intentando ir a diapositiva ${slideNumber} (actual: ${this.currentSlide})`);
        
        if (slideNumber < 1 || slideNumber > this.totalSlides || slideNumber === this.currentSlide || this.isTransitioning) {
            console.log('❌ Navegación bloqueada:', { slideNumber, currentSlide: this.currentSlide, isTransitioning: this.isTransitioning });
            return;
        }
        
        this.isTransitioning = true;
        console.log('🔄 Iniciando transición...');
        
        // Clear existing animation timers
        this.animationTimers.forEach(timer => clearTimeout(timer));
        this.animationTimers = [];
        
        const currentSlideElement = this.slides[this.currentSlide - 1];
        const newSlideElement = this.slides[slideNumber - 1];
        
        // Hide current slide
        if (currentSlideElement) {
            currentSlideElement.style.opacity = '0';
            currentSlideElement.style.transform = 'translateX(-100px) scale(0.95)';
            currentSlideElement.style.zIndex = '1';
            
            setTimeout(() => {
                currentSlideElement.classList.remove('active');
            }, 300);
        }
        
        // Show new slide
        if (newSlideElement) {
            // Prepare new slide
            newSlideElement.style.opacity = '0';
            newSlideElement.style.transform = 'translateX(100px) scale(0.95)';
            newSlideElement.style.zIndex = '10';
            newSlideElement.classList.add('active');
            
            // Animate in new slide
            setTimeout(() => {
                newSlideElement.style.opacity = '1';
                newSlideElement.style.transform = 'translateX(0) scale(1)';
            }, 100);
        }
        
        // Update current slide
        const previousSlide = this.currentSlide;
        this.currentSlide = slideNumber;
        
        console.log(`✅ Diapositiva cambiada de ${previousSlide} a ${this.currentSlide}`);
        
        // Update UI
        this.updateSlideIndicators();
        this.updateSlideCounter();
        this.updateNavigation();
        this.updateProgressBar();
        
        // Trigger slide animations after transition
        setTimeout(() => {
            this.isTransitioning = false;
            this.triggerSlideAnimations();
            console.log('🎬 Animaciones de diapositiva iniciadas');
        }, 500);
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            console.log(`➡️ Siguiente diapositiva: ${this.currentSlide + 1}`);
            this.goToSlide(this.currentSlide + 1);
        } else {
            console.log('📝 Ya estás en la última diapositiva');
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            console.log(`⬅️ Diapositiva anterior: ${this.currentSlide - 1}`);
            this.goToSlide(this.currentSlide - 1);
        } else {
            console.log('📝 Ya estás en la primera diapositiva');
        }
    }
    
    showSlide(slideNumber) {
        this.goToSlide(slideNumber);
    }
    
    updateSlideIndicators() {
        const indicators = this.slideIndicators?.querySelectorAll('.slide-indicator');
        if (!indicators) return;
        
        indicators.forEach((indicator, index) => {
            const slideNum = index + 1;
            if (slideNum === this.currentSlide) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.removeAttribute('aria-current');
            }
        });
        console.log('🔄 Indicadores actualizados');
    }
    
    updateSlideCounter() {
        if (this.currentSlideSpan) {
            this.currentSlideSpan.textContent = this.currentSlide;
        }
        if (this.totalSlidesSpan) {
            this.totalSlidesSpan.textContent = this.totalSlides;
        }
        console.log(`📊 Contador actualizado: ${this.currentSlide}/${this.totalSlides}`);
    }
    
    updateNavigation() {
        if (this.prevBtn) {
            const isDisabled = this.currentSlide === 1;
            this.prevBtn.disabled = isDisabled;
            this.prevBtn.style.opacity = isDisabled ? '0.4' : '1';
            this.prevBtn.setAttribute('aria-disabled', isDisabled.toString());
        }
        if (this.nextBtn) {
            const isDisabled = this.currentSlide === this.totalSlides;
            this.nextBtn.disabled = isDisabled;
            this.nextBtn.style.opacity = isDisabled ? '0.4' : '1';
            this.nextBtn.setAttribute('aria-disabled', isDisabled.toString());
        }
    }
    
    addProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        document.body.appendChild(progressBar);
        this.updateProgressBar();
    }
    
    updateProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = (this.currentSlide / this.totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    triggerSlideAnimations() {
        const currentSlideElement = this.slides[this.currentSlide - 1];
        if (!currentSlideElement) return;
        
        console.log(`🎬 Activando animaciones para diapositiva ${this.currentSlide}`);
        
        // Reset all animations
        const animatedElements = currentSlideElement.querySelectorAll('[data-animation]');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = this.getInitialTransform(element.dataset.animation);
        });
        
        // Trigger animations based on slide type
        switch (this.currentSlide) {
            case 1:
                this.animatePortada();
                break;
            case 2:
                this.animateStages();
                break;
            case 3:
                this.animateAutomationSlide();
                break;
            case 4:
                this.animateCharacteristics();
                break;
            case 5:
                this.animateModels();
                break;
            case 6:
                this.animateFrameworks();
                break;
            case 7:
                this.animateConclusions();
                break;
            case 8:
                this.animateReferences();
                break;
        }
    }
    
    getInitialTransform(animation) {
        switch (animation) {
            case 'fadeInUp':
                return 'translateY(50px)';
            case 'slideInLeft':
                return 'translateX(-50px)';
            case 'slideInRight':
                return 'translateX(50px)';
            case 'slideInUp':
                return 'translateY(50px)';
            case 'zoomIn':
                return 'scale(0.9)';
            case 'fadeIn':
                return 'none';
            default:
                return 'none';
        }
    }
    
    animateElement(element, delay = 0) {
        if (!element) return;
        
        const timer = setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            element.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }, delay);
        
        this.animationTimers.push(timer);
    }
    
    animatePortada() {
        console.log('🎭 Animando portada');
        // Portada has CSS animations, just ensure they're visible
        const iconContainer = document.querySelector('.quality-icon-container');
        if (iconContainer) {
            setTimeout(() => {
                iconContainer.style.opacity = '1';
            }, 200);
        }
    }
    
    animateStages() {
        console.log('🔄 Animando etapas SDLC');
        const stages = document.querySelectorAll('.stage-card');
        stages.forEach((stage, index) => {
            this.animateElement(stage, index * 100);
        });
    }
    
    animateAutomationSlide() {
        console.log('🤖 Animando diapositiva de automatización');
        // Animate statistics circles with counting effect
        const statCircles = document.querySelectorAll('.stat-circle');
        statCircles.forEach((circle, index) => {
            const timer = setTimeout(() => {
                const percent = parseInt(circle.dataset.percent);
                const numberElement = circle.querySelector('.stat-number');
                
                if (numberElement) {
                    if (percent > 100) {
                        // For ROI, show as percentage
                        this.animateCounter(numberElement, 0, percent, 2000, '%');
                    } else {
                        this.animateCounter(numberElement, 0, percent, 1500, '%');
                    }
                }
                this.animateCircle(circle, Math.min(percent, 100));
            }, 300 + index * 150);
            
            this.animationTimers.push(timer);
        });
    }
    
    animateCharacteristics() {
        console.log('⭐ Animando características de calidad');
        const characteristics = document.querySelectorAll('.characteristic-card');
        characteristics.forEach((card, index) => {
            this.animateElement(card, index * 80);
            
            // Animate progress bars
            const timer = setTimeout(() => {
                const progressBar = card.querySelector('.progress-bar');
                if (progressBar) {
                    const width = progressBar.dataset.width;
                    progressBar.style.width = `${width}%`;
                }
            }, 600 + index * 80);
            
            this.animationTimers.push(timer);
        });
    }
    
    animateModels() {
        console.log('📊 Animando modelos de calidad');
        const models = document.querySelectorAll('.model-card');
        models.forEach((model, index) => {
            this.animateElement(model, index * 150);
        });
    }
    
    animateFrameworks() {
        console.log('🏛️ Animando marcos normativos');
        const frameworks = document.querySelectorAll('.framework-item');
        frameworks.forEach((framework, index) => {
            this.animateElement(framework, index * 120);
        });
    }
    
    animateConclusions() {
        console.log('🎯 Animando conclusiones');
        const conclusions = document.querySelectorAll('.conclusion-item');
        conclusions.forEach((conclusion, index) => {
            this.animateElement(conclusion, index * 150);
        });
        
        const finalReflection = document.querySelector('.final-reflection');
        if (finalReflection) {
            this.animateElement(finalReflection, conclusions.length * 150 + 300);
        }
    }
    
    animateReferences() {
        console.log('📚 Animando referencias');
        const references = document.querySelectorAll('.reference-item');
        references.forEach((reference, index) => {
            this.animateElement(reference, index * 60);
        });
    }
    
    animateCounter(element, start, end, duration, suffix = '') {
        if (!element) return;
        
        const startTime = performance.now();
        const range = end - start;
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth counting
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (range * easedProgress));
            
            element.textContent = current + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
    
    animateCircle(circle, percent) {
        if (!circle) return;
        
        const startTime = performance.now();
        const duration = 2000;
        
        const updateCircle = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentPercent = percent * easedProgress;
            const degrees = (currentPercent / 100) * 360;
            
            circle.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--color-secondary) ${degrees}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(updateCircle);
            }
        };
        
        requestAnimationFrame(updateCircle);
    }
    
    updateChartsForTheme() {
        // Update chart colors based on theme (placeholder for future chart implementation)
        console.log('🎨 Actualizando gráficos para tema:', this.currentTheme);
    }
    
    handleResize() {
        // Handle resize events
        console.log('📏 Manejando redimensionado');
        
        // Update any size-dependent animations
        if (this.currentSlide === 3) {
            const statCircles = document.querySelectorAll('.stat-circle');
            statCircles.forEach(circle => {
                const percent = parseInt(circle.dataset.percent);
                if (percent) {
                    const degrees = (Math.min(percent, 100) / 100) * 360;
                    circle.style.background = `conic-gradient(var(--color-primary) ${degrees}deg, var(--color-secondary) ${degrees}deg)`;
                }
            });
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error habilitando pantalla completa:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    showKeyboardShortcuts() {
        const shortcuts = `
🎮  ATAJOS DE TECLADO

← ↑ PageUp      : Diapositiva anterior
→ ↓ PageDown ␣  : Siguiente diapositiva  
Home            : Primera diapositiva
End             : Última diapositiva
T               : Cambiar tema claro/oscuro
F               : Pantalla completa
H               : Mostrar estos atajos

💡 CONTROLES ADICIONALES
• Clic en indicadores para navegación directa
• Deslizar en pantallas táctiles
• Scroll en contenido cuando sea necesario

🎨 TEMAS DISPONIBLES
• Modo claro (por defecto)
• Modo oscuro (presiona T)
        `;
        
        // Create notification with enhanced styling
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(var(--color-slate-900-rgb), 0.95);
            color: var(--color-white);
            padding: var(--space-32);
            border-radius: var(--radius-lg);
            white-space: pre-line;
            z-index: 20000;
            backdrop-filter: blur(20px);
            font-family: var(--font-family-mono);
            font-size: var(--font-size-sm);
            line-height: 1.8;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: left;
            animation: fadeIn 0.3s ease-out;
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
        `;
        notification.textContent = shortcuts;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 15px;
            right: 20px;
            background: none;
            border: none;
            color: var(--color-white);
            font-size: 24px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
            z-index: 1;
        `;
        closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
        closeBtn.onmouseout = () => closeBtn.style.opacity = '0.7';
        closeBtn.onclick = () => notification.remove();
        
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
        
        // Click outside to close
        const clickOutsideHandler = (e) => {
            if (!notification.contains(e.target)) {
                notification.remove();
                document.removeEventListener('click', clickOutsideHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 100);
        
        // ESC to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                notification.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
}

// Enhanced utility functions
function addHoverEffects() {
    const cards = document.querySelectorAll('.stage-card, .characteristic-card, .model-card, .framework-item, .conclusion-item, .type-card, .reference-item');
    
    cards.forEach(card => {
        // Enhanced hover effect with subtle scaling
        card.addEventListener('mouseenter', function() {
            if (this.style.opacity !== '0' && !this.classList.contains('hovering')) {
                this.classList.add('hovering');
                const currentTransform = this.style.transform || '';
                const translateY = currentTransform.includes('translateY') ? 
                    currentTransform.replace(/translateY\([^)]*\)/, 'translateY(-5px)') : 
                    currentTransform + ' translateY(-5px)';
                this.style.transform = translateY;
                this.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (this.classList.contains('hovering')) {
                this.classList.remove('hovering');
                const currentTransform = this.style.transform || '';
                const translateY = currentTransform.replace(/translateY\([^)]*\)/, 'translateY(0)');
                this.style.transform = translateY;
            }
        });
        
        // Add click ripple effect
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(var(--color-primary-rgb, 33, 128, 141), 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 1000;
            `;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.remove();
                }
            }, 600);
        });
    });
}

// Add ripple animation to CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(rippleStyle);

// Loading screen
function showLoadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'loading-screen';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 50000;
        transition: opacity 0.8s ease-out;
    `;
    
    loader.innerHTML = `
        <div style="position: relative; margin-bottom: 2rem;">
            <i class="fas fa-code" style="font-size: 4rem; color: var(--color-primary); animation: iconFloat 2s ease-in-out infinite;"></i>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; border: 3px solid var(--color-secondary); border-top: 3px solid var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <h2 style="color: var(--color-text); margin-bottom: 1rem; font-size: 1.5rem;">Cargando Presentación</h2>
        <p style="color: var(--color-text-secondary); text-align: center; max-width: 400px; line-height: 1.5;">Preparando contenido sobre Calidad de Software...</p>
        <div style="width: 200px; height: 4px; background: var(--color-secondary); border-radius: 2px; margin-top: 2rem; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-teal-300) 100%); transform: translateX(-100%); animation: loadingBar 2s ease-out forwards;"></div>
        </div>
    `;
    
    document.body.appendChild(loader);
    return loader;
}

// Add loading animations to CSS
const loadingStyle = document.createElement('style');
loadingStyle.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes loadingBar {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(0%); }
    }
`;
document.head.appendChild(loadingStyle);

// Global presentation instance
let presentationInstance = null;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando presentación profesional mejorada...');
    
    // Show loading screen
    const loader = showLoadingScreen();
    
    // Set initial opacity for smooth entrance
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.8s ease-in-out';
    
    // Wait for assets to load and initialize
    setTimeout(() => {
        // Remove loading screen
        loader.style.opacity = '0';
        setTimeout(() => {
            if (loader.parentNode) {
                loader.remove();
            }
        }, 800);
        
        // Initialize presentation
        presentationInstance = new PresentationApp();
        addHoverEffects();
        
        // Show body
        document.body.style.opacity = '1';
        
        console.log('✅ Presentación inicializada exitosamente');
        console.log('💡 Presiona H para ver atajos de teclado');
        console.log('🎨 Presiona T para cambiar el tema');
    }, 1200);
});

// Handle window events
window.addEventListener('resize', () => {
    if (presentationInstance) {
        presentationInstance.handleResize();
    }
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.animationName !== 'none') {
                el.style.animationPlayState = 'paused';
            }
        });
    } else {
        // Resume animations when page becomes visible
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Add performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
            console.log(`📊 Tiempo de carga: ${Math.round(entry.loadEventEnd - entry.loadEventStart)}ms`);
        }
    }
});

try {
    performanceObserver.observe({ entryTypes: ['navigation'] });
} catch (e) {
    console.log('Performance Observer no soportado');
}

// Export for global access
window.PresentationApp = PresentationApp;