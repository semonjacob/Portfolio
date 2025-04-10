// Hamburger Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');
    const cursor = document.querySelector('.custom-cursor');
    const scrollTopBtn = document.querySelector('.scroll-top');
    const treasureBox = document.querySelector('.treasure-box');
    const boxSound = document.getElementById('boxSound');
    const popupText = document.querySelector('.popup-text');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('active');
        });
    });

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

    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            formMessage.textContent = ""; // Clear previous messages
            formMessage.className = "form-message";

            const formData = new FormData(contactForm);

            try {
                const response = await fetch("contact.php", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    formMessage.textContent = "Your message has been sent successfully!";
                    formMessage.classList.add("success");
                    contactForm.reset();
                } else {
                    formMessage.textContent = result.error || "An error occurred. Please try again.";
                    formMessage.classList.add("error");
                }
            } catch (error) {
                formMessage.textContent = "Failed to send the message. Please try again later.";
                formMessage.classList.add("error");
            }
        });
    }

    document.getElementById('readAbout')?.addEventListener('click', () => {
        responsiveVoice.speak(document.querySelector('.about-text').textContent, "UK English Male");
    });

    treasureBox?.addEventListener('mouseenter', () => {
        boxSound?.play();
        popupText.style.opacity = '1';
        popupText.style.transform = 'translateX(-50%) translateY(-30px)';
    });

    treasureBox?.addEventListener('mouseleave', () => {
        popupText.style.opacity = '0';
        popupText.style.transform = 'translateX(-50%) translateY(0)';
    });
});
