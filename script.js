// Hamburger Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Intersection Observer for Fade-in Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

    // Custom Cursor
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', e => {
        cursor.style.transform = `translate(${e.pageX}px, ${e.pageY}px)`;
    });

    document.addEventListener('mouseover', () => {
        cursor.classList.add('hover');
    });

    document.addEventListener('mouseout', () => {
        cursor.classList.remove('hover');
    });

    // Scroll to Top Button
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.style.display = (window.scrollY > 20) ? "block" : "none";
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // tsParticles Configuration
    tsParticles.load("tsparticles", {
        fpsLimit: 60,
        background: {
            color: "#ffffff", // Light background
        },
        particles: {
            number: {
                value: 100, // Number of particles
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: ["#00bcd4", "#ff5722", "#8bc34a", "#ffc107"], // Modern color scheme
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: 0.8,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.3,
                    sync: false,
                },
            },
            size: {
                value: 5,
                random: true,
                anim: {
                    enable: true,
                    speed: 5,
                    size_min: 0.5,
                    sync: false,
                },
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "bounce",
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200,
                },
            },
            line_linked: {
                enable: false,
            },
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "repulse", // Repulse effect on hover
                },
                onclick: {
                    enable: true,
                    mode: "push", // Add particles on click
                },
                resize: true,
            },
            modes: {
                repulse: {
                    distance: 100,
                    duration: 0.4,
                },
                push: {
                    particles_nb: 4,
                },
            },
        },
        retina_detect: true,
    });
});
