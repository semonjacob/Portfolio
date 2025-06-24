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
    document.querySelectorAll('.fade-in').forEach(element => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(element);
    });

    // Custom Cursor
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.transform = `translate(${e.pageX}px, ${e.pageY}px)`;
        });

        document.addEventListener('mouseover', () => {
            cursor.classList.add('hover');
        });

        document.addEventListener('mouseout', () => {
            cursor.classList.remove('hover');
        });
    }

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

    // Contact form logic
    const form = document.querySelector("form");
    const nameInput = document.querySelector("input[name='name']");
    const emailInput = document.querySelector("input[name='email']");
    const messageInput = document.querySelector("textarea[name='message']");
    const submitButton = document.querySelector("button[type='submit']");
    const statusText = document.createElement("p");

    if (form && nameInput && emailInput && messageInput && submitButton) {
        statusText.style.marginTop = "10px";
        statusText.style.fontWeight = "bold";
        submitButton.parentNode.appendChild(statusText);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            submitButton.disabled = true;
            submitButton.innerText = "Sending...";

            try {
                const response = await fetch("contact.php", {
                    method: "POST",
                    body: new FormData(form)
                });

                let result;
                try {
                    result = await response.json();
                } catch (err) {
                    throw new Error("Invalid JSON response from server");
                }

                if (result.success) {
                    statusText.innerText = "✅ Message sent successfully!";
                    statusText.style.color = "green";
                    nameInput.value = "";
                    emailInput.value = "";
                    messageInput.value = "";
                } else {
                    statusText.innerText = `❌ ${result.error || "Failed to send message."}`;
                    statusText.style.color = "red";
                }
            } catch (error) {
                statusText.innerText = `❌ Something went wrong.`;
                statusText.style.color = "red";
                console.error("Send Error:", error);
            } finally {
                submitButton.disabled = false;
                submitButton.innerText = "Send Message";
            }
        });
    }

    document.getElementById('readAbout')?.addEventListener('click', () => {
        const aboutText = document.querySelector('.about-text');
        if (aboutText) {
            responsiveVoice.speak(aboutText.textContent, "UK English Male");
        }
    });

    // Add null checks for popupText
    treasureBox?.addEventListener('mouseenter', () => {
        boxSound?.play();
        if (popupText) {
            popupText.style.opacity = '1';
            popupText.style.transform = 'translateX(-50%) translateY(-30px)';
        }
    });

    treasureBox?.addEventListener('mouseleave', () => {
        if (popupText) {
            popupText.style.opacity = '0';
            popupText.style.transform = 'translateX(-50%) translateY(0)';
        }
    });

    // Keyboard Navigation for Modal
    const modal = document.getElementById('projectModal');
    document.addEventListener('keydown', (e) => {
        if (modal && e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });

    // Lazy load images
    const lazyImages = document.querySelectorAll("img[loading='lazy']");
    lazyImages.forEach(img => {
        img.addEventListener("error", () => {
            img.src = "https://via.placeholder.com/200";
        });
    });

    const viewResumeBtn = document.getElementById("viewResume");
    const resumeModal = document.getElementById("resumeModal");
    const closeResumeBtn = resumeModal ? resumeModal.querySelector(".close") : null;

    if (viewResumeBtn && resumeModal && closeResumeBtn) {
        viewResumeBtn.addEventListener("click", () => {
            resumeModal.style.display = "flex";
        });

        closeResumeBtn.addEventListener("click", () => {
            resumeModal.style.display = "none";
        });

        window.addEventListener("click", (event) => {
            if (event.target === resumeModal) {
                resumeModal.style.display = "none";
            }
        });
    }
});

// Debounce scroll event for performance
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// If you have scroll logic, add it here. Otherwise, you can remove this listener.
window.addEventListener("scroll", debounce(() => {
    // Scroll-related logic here
}, 100));

