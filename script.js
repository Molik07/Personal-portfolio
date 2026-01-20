// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return prefersDarkScheme.matches ? 'dark' : 'light';
}

// Apply theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initialize theme
setTheme(getThemePreference());

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// ===== Particle Snow Effect with Interactivity =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let animationId;
let mouse = {
    x: null,
    y: null,
    radius: 150
};

// Track mouse position
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

// Touch support for mobile
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});

window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
});

// Resize canvas to full window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Particle class with interactive physics
class Particle {
    constructor() {
        this.reset();
        this.baseSpeedY = this.speedY;
        this.baseSpeedX = this.speedX;
        this.vx = 0;
        this.vy = 0;
        this.friction = 0.98;
        this.returnSpeed = 0.02;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height - canvas.height;
        this.size = Math.random() * 2.5 + 1;
        this.speedY = Math.random() * 0.3 + 0.1;
        this.speedX = Math.random() * 0.1 - 0.05;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.swing = Math.random() * 2 * Math.PI;
        this.swingSpeed = Math.random() * 0.005 + 0.002;
        this.swingAmplitude = Math.random() * 0.5 + 0.2;
        this.baseSpeedY = this.speedY;
        this.baseSpeedX = this.speedX;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        // Check distance from mouse
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouse.radius) {
                // Calculate repulsion force (stronger when closer)
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                
                // Apply force away from mouse
                this.vx += Math.cos(angle) * force * 2;
                this.vy += Math.sin(angle) * force * 2;
                
                // Increase opacity when interacting
                this.opacity = Math.min(0.9, this.opacity + 0.02);
            }
        }
        
        // Apply friction to velocity
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Gradually return to base falling speed
        this.vy += (this.baseSpeedY - this.vy) * this.returnSpeed;
        
        // Update swing motion
        this.swing += this.swingSpeed;
        
        // Apply movement
        this.x += this.vx + this.baseSpeedX + Math.sin(this.swing) * this.swingAmplitude * 0.1;
        this.y += this.vy;
        
        // Gradually return opacity to normal
        this.opacity += (0.4 - this.opacity) * 0.01;

        // Reset particle when it goes below screen
        if (this.y > canvas.height + 10) {
            this.reset();
            this.y = -10;
        }

        // Wrap around horizontally
        if (this.x > canvas.width + 10) {
            this.x = -10;
        } else if (this.x < -10) {
            this.x = canvas.width + 10;
        }
    }

    draw() {
        const theme = document.documentElement.getAttribute('data-theme');
        const color = theme === 'dark' ? '255, 255, 255' : '0, 0, 0';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.fill();
    }
}

// Initialize particles
function initParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 6000);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
        // Distribute initial particles across the screen
        particles[i].y = Math.random() * canvas.height;
    }
}

// Draw connections between nearby particles when mouse is close
function drawConnections() {
    if (mouse.x === null || mouse.y === null) return;
    
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'dark' ? '255, 255, 255' : '0, 0, 0';
    
    for (let i = 0; i < particles.length; i++) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius * 1.5) {
            // Draw line from particle to mouse with fading opacity
            const opacity = (1 - distance / (mouse.radius * 1.5)) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            
            // Connect nearby particles to each other
            for (let j = i + 1; j < particles.length; j++) {
                const dx2 = particles[i].x - particles[j].x;
                const dy2 = particles[i].y - particles[j].y;
                const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                
                if (distance2 < 80) {
                    const opacity2 = (1 - distance2 / 80) * 0.1;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${color}, ${opacity2})`;
                    ctx.lineWidth = 0.3;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connection lines first (behind particles)
    drawConnections();
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    animationId = requestAnimationFrame(animate);
}

// Initialize and start animation
resizeCanvas();
initParticles();
animate();

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas();
        initParticles();
    }, 200);
});

// ===== Smooth Scroll for Navigation Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Navbar Background on Scroll =====
const navbar = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScrollY = currentScrollY;
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe sections and cards
document.querySelectorAll('section, .project-card, .skill-item').forEach(el => {
    observer.observe(el);
});

// ===== Contact Form Handling =====
const contactForm = document.getElementById('contactForm');

// Custom validation
function validateForm() {
    let isValid = true;
    const formGroups = contactForm.querySelectorAll('.form-group');
    
    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        if (input) {
            if (!input.value.trim()) {
                group.classList.add('error');
                isValid = false;
            } else if (input.type === 'email' && !isValidEmail(input.value)) {
                group.classList.add('error');
                isValid = false;
            } else {
                group.classList.remove('error');
            }
        }
    });
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Clear error on input
contactForm.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
        input.closest('.form-group').classList.remove('error');
    });
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Success - turn black with quick animation
            submitBtn.textContent = 'Message Sent!';
            submitBtn.classList.add('btn-success');
            contactForm.reset();
            
            // After 2 seconds, slowly animate back to original
            setTimeout(() => {
                submitBtn.classList.remove('btn-success');
                submitBtn.classList.add('btn-resetting');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Remove resetting class after animation completes
                setTimeout(() => {
                    submitBtn.classList.remove('btn-resetting');
                }, 1500);
            }, 2000);
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        submitBtn.textContent = 'Error - Try Again';
        submitBtn.style.opacity = '0.7';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '';
            submitBtn.disabled = false;
        }, 3000);
    }
});

// ===== Add CSS for Animation =====
const style = document.createElement('style');
style.textContent = `
    section, .project-card, .skill-item {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    section.animate-in, .project-card.animate-in, .skill-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .hero {
        opacity: 1;
        transform: none;
    }
`;
document.head.appendChild(style);

// ===== Active Navigation Link Highlight =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = 'var(--text-primary)';
        }
    });
});

// ===== Parallax Effect for Hero (Bettina Sosa Style) =====
const heroContent = document.querySelector('.hero-content');
const heroSection = document.querySelector('.hero');
const scrollIndicator = document.querySelector('.scroll-indicator');

function updateHeroScroll() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Calculate scroll progress (0 to 1) based on how far user has scrolled through the viewport
    const scrollProgress = Math.min(scrolled / (windowHeight * 0.7), 1);
    
    // Apply transformations to hero content
    if (heroContent) {
        // Scale down from 1 to 0.85
        const scale = 1 - (scrollProgress * 0.15);
        // Move up as user scrolls
        const translateY = scrollProgress * -80;
        // Fade out
        const opacity = 1 - (scrollProgress * 1.2);
        
        heroContent.style.transform = `translateY(${translateY}px) scale(${scale})`;
        heroContent.style.opacity = Math.max(0, opacity);
    }
    
    // Fade out scroll indicator faster
    if (scrollIndicator) {
        const indicatorOpacity = 1 - (scrollProgress * 3);
        scrollIndicator.style.opacity = Math.max(0, indicatorOpacity);
    }
    
    // Slightly blur and darken hero section as content scrolls over
    if (heroSection) {
        const blur = scrollProgress * 5;
        heroSection.style.filter = `blur(${blur}px)`;
    }
}

// Throttle scroll handler for performance
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            updateHeroScroll();
            ticking = false;
        });
        ticking = true;
    }
});

// Initial call
updateHeroScroll();

// ===== Console Easter Egg =====
console.log('%cHello, curious developer!', 'font-size: 24px; font-weight: bold;');
console.log('%cInterested in collaborating? Reach out!', 'font-size: 14px; color: #86868b;');
