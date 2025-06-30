
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "/View/login.html";
}


document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        } else {
            navbar.style.background = 'transparent';
        }
    });

    // Animate elements on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.card, .step, .benefit-card');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial styles for animation
    document.querySelectorAll('.card, .step, .benefit-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease';
    });

    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on page load
}); 