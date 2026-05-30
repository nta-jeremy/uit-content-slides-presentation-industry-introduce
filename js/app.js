/* ==========================================================================
   UIT SLIDE PRESENTATION - CONTROLLER ENGINE (Vanilla JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    let currentSlide = 1;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    // UI Elements
    const progressBarFill = document.getElementById('progressBarFill');
    const hudCounterCurrent = document.getElementById('hudCounterCurrent');
    const hudCounterTotal = document.getElementById('hudCounterTotal');
    const gridViewOverlay = document.getElementById('gridViewOverlay');
    const gridViewCards = document.getElementById('gridViewCards');
    
    // Initializing HUD
    if (hudCounterTotal) hudCounterTotal.textContent = totalSlides;

    // Load slide index from localStorage if exists
    const savedSlide = localStorage.getItem('uit_active_slide');
    if (savedSlide) {
        const slideNum = parseInt(savedSlide, 10);
        if (slideNum >= 1 && slideNum <= totalSlides) {
            currentSlide = slideNum;
        }
    }

    // ==========================================================================
    // Core Trình Chiếu (Show Slide Logic)
    // ==========================================================================
    function showSlide(index) {
        if (index < 1) index = 1;
        if (index > totalSlides) index = totalSlides;
        
        currentSlide = index;
        localStorage.setItem('uit_active_slide', currentSlide);
        
        // Toggle active classes
        slides.forEach((slide, i) => {
            if (i === currentSlide - 1) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        
        // Update progress bar
        if (progressBarFill) {
            const percent = ((currentSlide) / totalSlides) * 100;
            progressBarFill.style.width = `${percent}%`;
        }
        
        // Update HUD
        if (hudCounterCurrent) {
            hudCounterCurrent.textContent = currentSlide;
        }
        
        // Update Grid Card Highlights
        const gridCards = document.querySelectorAll('.grid-card');
        gridCards.forEach((card, i) => {
            if (i === currentSlide - 1) {
                card.classList.add('active');
                // Scroll grid view to keep active slide visible if open
                if (gridViewOverlay.classList.contains('active')) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                card.classList.remove('active');
            }
        });
    }

    // Navigation triggers
    window.nextSlide = function() {
        if (currentSlide < totalSlides) {
            showSlide(currentSlide + 1);
        }
    };

    window.prevSlide = function() {
        if (currentSlide > 1) {
            showSlide(currentSlide - 1);
        }
    };

    window.goToSlide = function(index) {
        showSlide(index);
        closeGridView();
    };

    // ==========================================================================
    // Keyboard Event Listener
    // ==========================================================================
    document.addEventListener('keydown', (e) => {
        // If grid view is open, Escape should close it
        if (gridViewOverlay.classList.contains('active') && e.key === 'Escape') {
            closeGridView();
            return;
        }

        switch (e.key) {
            case 'ArrowRight':
            case ' ': // Space bar
            case 'PageDown':
                e.preventDefault();
                nextSlide();
                break;
                
            case 'ArrowLeft':
            case 'Backspace':
            case 'PageUp':
                e.preventDefault();
                prevSlide();
                break;
                
            case 'Home':
                e.preventDefault();
                showSlide(1);
                break;
                
            case 'End':
                e.preventDefault();
                showSlide(totalSlides);
                break;
                
            case 'g':
            case 'G':
                e.preventDefault();
                toggleGridView();
                break;
                
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
        }
    });

    // ==========================================================================
    // Swipe Control on Mobile (Vuốt chạm màn hình)
    // ==========================================================================
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        // Avoid conflict with grid view overlay
        if (gridViewOverlay.classList.contains('active')) return;
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', (e) => {
        if (gridViewOverlay.classList.contains('active')) return;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const threshold = 50; // swipe offset threshold
        if (touchStartX - touchEndX > threshold) {
            nextSlide(); // Swiped left -> Next slide
        } else if (touchEndX - touchStartX > threshold) {
            prevSlide(); // Swiped right -> Previous slide
        }
    }

    // ==========================================================================
    // Grid View Indexer Generator (Chế độ xem lưới 25 slides)
    // ==========================================================================
    function buildGridView() {
        if (!gridViewCards) return;
        gridViewCards.innerHTML = ''; // clear
        
        slides.forEach((slide, i) => {
            // Get Category and Title
            const categoryElement = slide.querySelector('.slide-category');
            const titleElement = slide.querySelector('.slide-title');
            
            const category = categoryElement ? categoryElement.textContent : `CHƯƠNG ${i + 1}`;
            const title = titleElement ? titleElement.textContent : slide.dataset.name || `Slide ${i + 1}`;
            
            // Extract custom neon glow variables to match card accents
            const slideStyles = window.getComputedStyle(slide);
            const neonColor = slideStyles.getPropertyValue('--neon-color') || '#00f2fe';
            
            const card = document.createElement('div');
            card.className = 'grid-card';
            card.style.setProperty('--card-glow', neonColor);
            card.onclick = () => goToSlide(i + 1);
            
            if (i === currentSlide - 1) {
                card.classList.add('active');
            }
            
            card.innerHTML = `
                <span class="grid-card-num">SLIDE ${i + 1}</span>
                <span class="grid-card-title">${title}</span>
            `;
            gridViewCards.appendChild(card);
        });
    }

    window.toggleGridView = function() {
        if (gridViewOverlay.classList.contains('active')) {
            closeGridView();
        } else {
            buildGridView();
            gridViewOverlay.classList.add('active');
            // Scroll to the active slide card in Grid
            setTimeout(() => {
                const activeCard = gridViewCards.querySelector('.grid-card.active');
                if (activeCard) {
                    activeCard.scrollIntoView({ behavior: 'auto', block: 'center' });
                }
            }, 100);
        }
    };

    window.closeGridView = function() {
        if (gridViewOverlay) {
            gridViewOverlay.classList.remove('active');
        }
    };

    // ==========================================================================
    // Fullscreen Guard API
    // ==========================================================================
    window.toggleFullscreen = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    // Keep active class sync on fullscreen changes
    document.addEventListener('fullscreenchange', () => {
        const fsBtn = document.getElementById('fsBtn');
        if (fsBtn) {
            if (document.fullscreenElement) {
                fsBtn.classList.add('active');
            } else {
                fsBtn.classList.remove('active');
            }
        }
    });

    // Render active slide
    showSlide(currentSlide);
});
