document.addEventListener('DOMContentLoaded', function () {

    /* ============================================================
       1. MOBILE MENU (hamburger button is created automatically)
       ============================================================ */
    const nav = document.querySelector('nav');

    if (nav) {
        const toggle = document.createElement('button');
        toggle.className = 'nav-toggle';
        toggle.setAttribute('aria-label', 'Toggle menu');
        toggle.innerHTML = '&#9776; Menu';
        nav.prepend(toggle);

        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });

        // Close the menu after a link is tapped, so the section is visible
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
            });
        });
    }


    /* ============================================================
       2. TYPING EFFECT
       Use on any element:  <h2 data-typing="Text one|Text two|Text three">
       ============================================================ */
    const typingEl = document.querySelector('[data-typing]');

    if (typingEl) {
        // Uses data-typing if it has text, otherwise the text already inside the tag
        const source = (typingEl.dataset.typing || typingEl.textContent).trim();
        const words = source.split('|').filter(function (w) { return w.trim() !== ''; });

        if (words.length > 0) {
            let wordIndex = 0;
            let charIndex = 0;
            let deleting = false;

            function type() {
                const word = words[wordIndex];

                charIndex += deleting ? -1 : 1;
                typingEl.textContent = word.substring(0, charIndex);

                let delay = deleting ? 40 : 80;

                if (!deleting && charIndex >= word.length) {
                    delay = 1800;            // pause when a word is complete
                    deleting = true;
                } else if (deleting && charIndex <= 0) {
                    deleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                    delay = 400;
                }

                setTimeout(type, delay);
            }

            type();
        }
    }


    /* ============================================================
       3. SCROLL REVEAL (elements fade in as you scroll down)
       ============================================================ */
    const revealTargets = document.querySelectorAll(
        '.project-card, .skill-card, .about-content, .about-image, .contact-form'
    );

    revealTargets.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = (i % 3) * 0.1 + 's';   // small stagger
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('visible'); });
    }


    /* ============================================================
       4. BACK TO TOP BUTTON (created automatically)
       ============================================================ */
    const toTop = document.createElement('button');
    toTop.className = 'to-top';
    toTop.setAttribute('aria-label', 'Back to top');
    toTop.innerHTML = '&uarr;';
    document.body.appendChild(toTop);

    window.addEventListener('scroll', function () {
        toTop.classList.toggle('show', window.scrollY > 300);
    });

    toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    /* ============================================================
       5. CONTACT FORM (validation + real sending via Formspree)
       ============================================================ */
    const form = document.querySelector('.contact-form');

    if (form) {
        // Message box shown under the form
        const message = document.createElement('p');
        message.className = 'form-message';
        form.appendChild(message);

        const fields = form.querySelectorAll('input, textarea, select');

        // Remove the red border as soon as the person starts typing
        fields.forEach(function (field) {
            field.addEventListener('input', function () {
                field.classList.remove('error');
            });
        });

        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            let valid = true;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            fields.forEach(function (field) {
                if (field.type === 'submit' || field.type === 'button') return;

                const value = field.value.trim();
                let bad = value === '';

                if (field.type === 'email' && value !== '' && !emailPattern.test(value)) {
                    bad = true;
                }

                field.classList.toggle('error', bad);
                if (bad) valid = false;
            });

            if (!valid) {
                message.textContent = 'Please fill in every field correctly.';
                message.className = 'form-message fail';
                return;
            }

            const button = form.querySelector('button[type="submit"]');
            button.disabled = true;
            button.textContent = 'Sending...';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    message.textContent = 'Thank you! Your message has been sent.';
                    message.className = 'form-message success';
                    form.reset();
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                message.textContent = 'Sorry, something went wrong. Please try again.';
                message.className = 'form-message fail';
            }

            button.disabled = false;
            button.textContent = 'Send Message';
        });
    }

});