// Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Tools search filtering: filters .tool-card elements inside #tools
            (function() {
                const toolsSearch = document.getElementById('tools-search');
                const noResults = document.getElementById('tools-no-results');
                if (!toolsSearch) return;
                const toolsGrid = document.querySelector('#tools .tools-grid');
                toolsSearch.addEventListener('input', () => {
                    const q = toolsSearch.value.trim().toLowerCase();
                    if (!toolsGrid) return;
                    const cards = toolsGrid.querySelectorAll('.tool-card');
                    let any = false;
                    cards.forEach(card => {
                        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
                        const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
                        const subjects = Array.from(card.querySelectorAll('.subject-chip')).map(el => el.textContent.toLowerCase()).join(' ');
                        const action = (card.querySelector('.tool-action')?.textContent || card.querySelector('.tool-action-btn')?.textContent || '').toLowerCase();
                        if (q === '' || title.includes(q) || desc.includes(q) || subjects.includes(q) || action.includes(q)) {
                            card.style.display = '';
                            any = true;
                        } else {
                            card.style.display = 'none';
                        }
                    });
                    if (noResults) noResults.style.display = any ? 'none' : 'block';
                });
            })();
        });

        // Mobile menu toggle with icon swap
        function toggleMobileMenu() {
            const mobileNav = document.getElementById('mobileNav');
            const btn = document.querySelector('.mobile-menu-btn');
            mobileNav.classList.toggle('active');

            // swap hamburger to X
            if (btn) {
                const isOpen = mobileNav.classList.contains('active');
                if (isOpen) {
                    btn.setAttribute('aria-expanded', 'true');
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>';
                } else {
                    btn.setAttribute('aria-expanded', 'false');
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
                }
            }
        }

        // FAQ Accordion
        function toggleFaq(button) {
            const item = button.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });
            if (!isActive) {
                item.classList.add('active');
            }
        }

        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        document.querySelectorAll('.fade-up').forEach(el => {
            observer.observe(el);
        });

        // Counter animation for stats
        function animateCounter(el) {
            const target = parseInt(el.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();

            el.classList.add('counting');

            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeOut * target);

                if (target >= 1000000) {
                    el.textContent = (current / 1000000).toFixed(1) + 'M+';
                } else if (target >= 1000) {
                    el.textContent = (current / 1000).toFixed(0) + 'K+';
                } else {
                    el.textContent = current + (target === 100 ? '%' : '+');
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.classList.remove('counting');
                    if (target >= 1000000) el.textContent = '1.2M+';
                    else if (target >= 1000) el.textContent = '50K+';
                    else if (target === 100) el.textContent = '100%';
                    else el.textContent = target + '+';
                }
            }

            requestAnimationFrame(update);
        }

        // Observe stats bar for counter animation
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.stat-value').forEach((el, i) => {
                        setTimeout(() => animateCounter(el), i * 200);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const statsBar = document.querySelector('.stats-bar');
        if (statsBar) statsObserver.observe(statsBar);

        // Contact form handling
        function handleContactForm(event) {
            event.preventDefault();
            
            const form = document.getElementById('contact-form');
            const submitBtn = document.getElementById('form-submit-btn');
            const messageEl = document.getElementById('form-message');
            const submitText = document.getElementById('form-submit-text');
            
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const message = form.message.value.trim();
            
            // Validation
            if (!name || name.length < 2) {
                showFormMessage('Please enter a valid name.', 'error');
                return;
            }
            
            if (!email || !email.includes('@')) {
                showFormMessage('Please enter a valid email address.', 'error');
                return;
            }
            
            if (!message || message.length < 10) {
                showFormMessage('Please write a message with at least 10 characters.', 'error');
                return;
            }
            
            // Simulate sending (in production, this would call an API)
            submitBtn.disabled = true;
            submitText.textContent = 'Sending...';
            
            // Simulate a 1.5s request
            setTimeout(() => {
                    const data = {
                        name: name,
                        email: email,
                        message: message,
                        timestamp: new Date().toISOString()
                    };
                
                // In production: fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
                console.log('Form submission:', data);
                
                showFormMessage('✓ Message sent! We\'ll get back to you within 24 hours.', 'success');
                form.reset();
                submitBtn.disabled = false;
                submitText.textContent = 'Send Message';
            }, 1500);
        }
        
        function showFormMessage(text, type) {
            const messageEl = document.getElementById('form-message');
            messageEl.textContent = text;
            messageEl.className = 'form-message ' + type;
            messageEl.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 5000);
            }

            

        // Floating feedback button: inject and show after user spends time or on scroll
        (function() {
            const btn = document.createElement('button');
            btn.className = 'feedback-btn';
            btn.setAttribute('aria-label', 'Send feedback');
            btn.innerHTML = '<div class="dot"></div><span>Feedback</span>';
            btn.addEventListener('click', () => {
                window.location.href = 'mailto:iamamrit.dev@gmail.com?subject=Feedback%20for%20NEB%20GPA%20Calculator';
            });
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(btn);
                let shown = false;
                const show = () => { if (!shown) { btn.classList.add('show'); shown = true; } };
                // show after 8 seconds
                setTimeout(show, 8000);
                // or on scroll >= 400px
                window.addEventListener('scroll', () => {
                    if (window.scrollY >= 400) show();
                }, { passive: true });
            });
        })();
        }

