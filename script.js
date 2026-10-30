document.addEventListener('DOMContentLoaded', function () {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const navigation = document.querySelector('nav');

    if (navigation) {
        let toggle = navigation.querySelector('.nav-toggle');

        if (!toggle) {
            toggle = document.createElement('button');
            toggle.className = 'nav-toggle';
            toggle.type = 'button';
            toggle.setAttribute('aria-label', 'Open navigation menu');
            toggle.innerHTML = '<span></span><span></span>';
            navigation.prepend(toggle);
        }

        toggle.addEventListener('click', function () {
            const isOpen = navigation.classList.toggle('is-open');
            navigation.classList.toggle('open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        });

        navigation.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navigation.classList.remove('is-open', 'open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open navigation menu');
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
                navigation.classList.remove('is-open', 'open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open navigation menu');
                toggle.focus();
            }
        });
    }

    const year = document.getElementById('current-year') || document.getElementById('year');
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }

    const preloader = document.getElementById('preloader');
    if (preloader && !reducedMotion) {
        const progress = document.getElementById('load-progress');
        const count = document.getElementById('load-count');
        let finished = false;

        function finishLoading() {
            if (finished) return;
            finished = true;

            function revealSite() {
                preloader.hidden = true;
                preloader.setAttribute('aria-hidden', 'true');
                animatePage();
            }

            if (window.gsap) {
                window.gsap.to(preloader, {
                    autoAlpha: 0,
                    duration: 0.45,
                    ease: 'power1.out',
                    onComplete: revealSite
                });
            } else {
                preloader.classList.add('preloader-finished');
                window.setTimeout(revealSite, 250);
            }
        }

        function animatePage() {
            if (!window.gsap) return;

            const heroItems = document.querySelectorAll('.hero-copy > *, .hero-visual');
            window.gsap.fromTo(heroItems, { autoAlpha: 0, y: 18 }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power2.out'
            });
        }

        preloader.hidden = false;
        preloader.setAttribute('aria-hidden', 'false');

        if (window.gsap && window.gsap.registerPlugin && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);
        }

        if (window.gsap) {
            const counter = { value: 0 };
            window.gsap.to(progress, { width: '100%', duration: 1.1, ease: 'power2.inOut' });
            window.gsap.to(counter, {
                value: 100,
                duration: 1.1,
                ease: 'power2.inOut',
                onUpdate: function () {
                    if (count) count.textContent = String(Math.round(counter.value)).padStart(2, '0');
                },
                onComplete: finishLoading
            });
        } else {
            if (progress) progress.style.width = '100%';
            if (count) count.textContent = '100';
            window.setTimeout(finishLoading, 250);
        }

        window.setTimeout(finishLoading, 1800);
    } else if (preloader) {
        preloader.hidden = true;
    }

    const revealTargets = document.querySelectorAll('[data-reveal]');
    if (!reducedMotion && revealTargets.length && window.gsap && window.ScrollTrigger) {
        revealTargets.forEach(function (element) {
            window.gsap.fromTo(element, { autoAlpha: 0, y: 22 }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.75,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: element,
                    start: 'top 88%',
                    once: true
                }
            });
        });
    } else if (!reducedMotion && revealTargets.length && 'IntersectionObserver' in window) {
        document.body.classList.add('reveal-enabled');
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        revealTargets.forEach(function (element) {
            observer.observe(element);
        });
    } else {
        revealTargets.forEach(function (element) {
            element.classList.add('is-visible');
        });
    }

    const form = document.querySelector('.contact-form');
    if (form) {
        let message = form.querySelector('.form-message');
        if (!message) {
            message = document.createElement('p');
            message.className = 'form-message';
            message.setAttribute('role', 'status');
            message.setAttribute('aria-live', 'polite');
            form.appendChild(message);
        }

        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(function (field) {
            field.addEventListener('input', function () {
                field.classList.remove('error');
                field.removeAttribute('aria-invalid');
            });
            field.addEventListener('change', function () {
                field.classList.remove('error');
                field.removeAttribute('aria-invalid');
            });
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (!submitButton) {
                message.textContent = 'The form could not be submitted. Please contact me by email instead.';
                message.className = 'form-message fail';
                return;
            }

            const originalLabel = submitButton.tagName === 'INPUT' ? submitButton.value : submitButton.textContent;
            submitButton.disabled = true;
            if (submitButton.tagName === 'INPUT') {
                submitButton.value = 'Sending...';
            } else {
                submitButton.textContent = 'Sending...';
            }
            message.textContent = '';
            message.className = 'form-message';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) {
                    throw new Error('Contact form request failed with status ' + response.status);
                }

                message.textContent = 'Thank you. Your message has been sent.';
                message.className = 'form-message success';
                form.reset();
            } catch (error) {
                console.error('Contact form submission failed:', error);
                message.textContent = 'Your message could not be sent. Please try again or email me directly.';
                message.className = 'form-message fail';
            } finally {
                submitButton.disabled = false;
                if (submitButton.tagName === 'INPUT') {
                    submitButton.value = originalLabel;
                } else {
                    submitButton.textContent = originalLabel;
                }
            }
        });
    }
});
