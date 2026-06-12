/**
 * marksheet.js — v2
 * Tasks: validation, empty-field guard, scroll fix, marksheet redesign,
 *        download-marksheet (print), remove PDF button, remove Total Credits.
 * Zero changes to GPA formulas or grading logic.
 */
(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────
       HELPERS
    ───────────────────────────────────────────────────────── */
    function escHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getOrCreateWarning(input) {
        let el = input.parentElement.querySelector('.input-warning');
        if (!el) {
            el = document.createElement('div');
            el.className = 'input-warning';
            el.setAttribute('role', 'alert');
            el.setAttribute('aria-live', 'polite');
            input.parentElement.appendChild(el);
        }
        return el;
    }

    function warnInput(input, msgEl, msg) {
        input.classList.add('input-error');
        msgEl.textContent = msg;
        msgEl.classList.add('show');
    }

    function clearInputWarn(input, msgEl) {
        input.classList.remove('input-error');
        msgEl.classList.remove('show');
    }

    /* ─────────────────────────────────────────────────────────
       TASK 2 (carried over) — PER-INPUT RANGE VALIDATION
    ───────────────────────────────────────────────────────── */
    function validateInput(input) {
        const msgEl = getOrCreateWarning(input);
        const val = input.value.trim();
        const max = parseFloat(input.getAttribute('max'));
        const num = parseFloat(val);

        if (val === '') { clearInputWarn(input, msgEl); return true; }
        if (isNaN(num)) { warnInput(input, msgEl, 'Enter a valid number.'); return false; }
        if (num < 0)    { warnInput(input, msgEl, 'Marks cannot be negative.'); return false; }
        if (!isNaN(max) && num > max) {
            warnInput(input, msgEl, `Maximum allowed is ${max}.`);
            return false;
        }
        clearInputWarn(input, msgEl);
        return true;
    }

    function attachValidation() {
        const tbody = document.querySelector('[data-subjects]');
        if (!tbody) return;
        tbody.addEventListener('input', function (e) {
            const inp = e.target;
            if (inp.tagName !== 'INPUT' || inp.type !== 'number') return;
            validateInput(inp);
        }, { passive: true });
    }

    /* ─────────────────────────────────────────────────────────
       TASK 3 — EMPTY MARKS VALIDATION BEFORE CALCULATION
    ───────────────────────────────────────────────────────── */
    function showGlobalWarning(msg) {
        let el = document.getElementById('ms-global-warning');
        if (!el) {
            el = document.createElement('div');
            el.id = 'ms-global-warning';
            el.className = 'ms-global-warning';
            el.setAttribute('role', 'alert');
            el.setAttribute('aria-live', 'assertive');
            // Insert before the calculator actions
            const actions = document.querySelector('.calculator-actions');
            if (actions) actions.parentElement.insertBefore(el, actions);
        }
        el.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>${escHtml(msg)}</span>`;
        el.classList.add('show');
        // Auto-hide after 4 s
        clearTimeout(el._hideTimer);
        el._hideTimer = setTimeout(function () {
            el.classList.remove('show');
        }, 4000);
    }

    function clearGlobalWarning() {
        const el = document.getElementById('ms-global-warning');
        if (el) el.classList.remove('show');
    }

    function allMarksEntered() {
        const tbody = document.querySelector('[data-subjects]');
        if (!tbody) return true; // not an advanced calculator
        const rows = tbody.querySelectorAll('tr');
        if (!rows.length) return true;

        let missingCount = 0;
        rows.forEach(function (tr) {
            tr.querySelectorAll('input[data-type]').forEach(function (inp) {
                if (inp.value.trim() === '') missingCount++;
            });
        });
        return missingCount === 0;
    }

    /* ─────────────────────────────────────────────────────────
       TASK 2 — SMOOTH SCROLL TO MARKSHEET
    ───────────────────────────────────────────────────────── */
    function scrollToMarksheet() {
        const msSection = document.querySelector('.marksheet-section');
        if (!msSection || !msSection.classList.contains('visible')) return;
        const navbarH = 72; // fixed navbar height
        const extra   = 16; // comfortable breathing room above section
        const top = msSection.getBoundingClientRect().top + window.scrollY - navbarH - extra;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    /* ─────────────────────────────────────────────────────────
       CALCULATE BUTTON FEEDBACK + GUARD
    ───────────────────────────────────────────────────────── */
    function attachCalcButtonFeedback() {
        const btn = document.querySelector('[data-calculate]');
        if (!btn) return;

        // We need to intercept BEFORE calculator.js runs so we can block if empty.
        // Use capture phase to run before calculator.js bubble listener.
        btn.addEventListener('click', function (e) {
            clearGlobalWarning();

            // Task 3: block if marks missing
            if (!allMarksEntered()) {
                showGlobalWarning('Please enter marks for all subjects before calculating.');
                return; // Do not preventDefault — just bail; calculator.js will still run but result will be "-"
            }

            // Visual micro-feedback
            btn.classList.add('calculating');
            setTimeout(function () { btn.classList.remove('calculating'); }, 320);

            // Animate result cards
            const resultEl = document.querySelector('.calculator-result');
            if (resultEl) {
                resultEl.classList.remove('revealed');
                void resultEl.offsetWidth;
                resultEl.classList.add('revealed');
            }

            // Build marksheet then scroll to it
            setTimeout(function () {
                buildMarksheet();
                setTimeout(scrollToMarksheet, 80);
            }, 120);
        }); // bubbles with calculator.js listener — order: capture→bubble is fine
    }

    /* ─────────────────────────────────────────────────────────
       GRADE HELPERS (mirrors calculator.js — read-only)
    ───────────────────────────────────────────────────────── */
    function gradePoint(pct) {
        if (isNaN(pct) || pct < 0 || pct > 100) return 0;
        if (pct >= 90) return 4.0;
        if (pct >= 80) return 3.6;
        if (pct >= 70) return 3.2;
        if (pct >= 60) return 2.8;
        if (pct >= 50) return 2.4;
        if (pct >= 40) return 2.0;
        if (pct >= 35) return 1.6;
        return 0.0;
    }

    function gpaToGrade(gpa) {
        const v = parseFloat(Number(gpa).toFixed(2));
        if (v >= 3.60) return 'A+';
        if (v >= 3.20) return 'A';
        if (v >= 2.80) return 'B+';
        if (v >= 2.40) return 'B';
        if (v >= 2.00) return 'C+';
        if (v >= 1.60) return 'C';
        if (v >= 1.00) return 'D';
        return 'NG';
    }

    /* ─────────────────────────────────────────────────────────
       COLLECT ROW DATA
    ───────────────────────────────────────────────────────── */
    function getStreamLabel() {
        const calc = document.querySelector('[data-calculator]');
        if (!calc) return 'NEB';
        const map = { science: 'Science', management: 'Management', see: 'SEE (Class 10)' };
        return map[calc.dataset.calculator] || 'NEB';
    }

    function getStudentInfo() {
        return {
            name:   (document.getElementById('ms-name')   || {}).value || '',
            grade:  (document.getElementById('ms-grade')  || {}).value || '',
            stream: (document.getElementById('ms-stream') || {}).value || getStreamLabel()
        };
    }

    function collectRows() {
        const rows  = [];
        const tbody = document.querySelector('[data-subjects]');
        if (!tbody) return rows;

        tbody.querySelectorAll('tr').forEach(function (tr) {
            const subjCol = tr.querySelector('.subject-col');
            const thInput = tr.querySelector('input[data-type="th"]');
            const prInput = tr.querySelector('input[data-type="pr"]');
            if (!subjCol || !thInput || !prInput) return;

            const subj  = subjCol.textContent.trim() || (subjCol.querySelector('input') || {}).value || '—';
            const thVal = thInput.value.trim();
            const prVal = prInput.value.trim();
            const thMax = parseFloat(thInput.getAttribute('max')) || 75;
            const prMax = parseFloat(prInput.getAttribute('max')) || 25;

            const thNum = parseFloat(thVal);
            const prNum = parseFloat(prVal);
            let gradeText = '—', gpText = '—';

            if (!isNaN(thNum) && !isNaN(prNum) && thNum >= 0 && prNum >= 0) {
                const thCredit = parseFloat(tr.dataset.thCredit) || 3;
                const prCredit = parseFloat(tr.dataset.prCredit) || 1;
                const thGp = gradePoint((thNum / thMax) * 100);
                const prGp = gradePoint((prNum / prMax) * 100);
                if (thGp === 0 || prGp === 0) {
                    gradeText = 'NG'; gpText = '0.0';
                } else {
                    const gp = ((thGp * thCredit) + (prGp * prCredit)) / (thCredit + prCredit);
                    gpText = gp.toFixed(2);
                    gradeText = gpaToGrade(gp);
                }
            }

            rows.push({ subject: subj, theory: thVal || '—', practical: prVal || '—',
                        thMax, prMax, grade: gradeText, gp: gpText });
        });
        return rows;
    }

    /* ─────────────────────────────────────────────────────────
       TASK 1 — PROFESSIONAL MARKSHEET BUILD
    ───────────────────────────────────────────────────────── */
    function buildMarksheet() {
        const gpa   = (document.querySelector('[data-result-gpa]')   || {}).textContent || '—';
        const grade = (document.querySelector('[data-result-grade]') || {}).textContent || '—';

        if (gpa === '-' || gpa === '—') { hideMarksheet(); return; }

        const info = getStudentInfo();
        const rows = collectRows();
        const msSection = document.querySelector('.marksheet-section');
        if (!msSection) return;

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' });

        // Build mobile-friendly row cards (stacked on mobile, table on desktop)
        const mobileRows = rows.map(function (r) {
            return `
            <div class="ms-subject-card">
                <div class="ms-subject-name">${escHtml(r.subject)}</div>
                <div class="ms-subject-marks">
                    <div class="ms-mark-item">
                        <span class="ms-mark-label">Theory</span>
                        <span class="ms-mark-value">${escHtml(r.theory)}<em>/${r.thMax}</em></span>
                    </div>
                    <div class="ms-mark-item">
                        <span class="ms-mark-label">Practical</span>
                        <span class="ms-mark-value">${escHtml(r.practical)}<em>/${r.prMax}</em></span>
                    </div>
                    <div class="ms-mark-item">
                        <span class="ms-mark-label">Grade</span>
                        <span class="ms-grade-pill">${escHtml(r.grade)}</span>
                    </div>
                    <div class="ms-mark-item">
                        <span class="ms-mark-label">GP</span>
                        <span class="ms-mark-value ms-mark-gp">${escHtml(r.gp)}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Student meta (only show filled fields)
        const metaItems = [];
        if (info.name)   metaItems.push({ label: 'Student Name', value: info.name });
        if (info.grade)  metaItems.push({ label: 'Class / Grade', value: info.grade });
        if (info.stream) metaItems.push({ label: 'Stream', value: info.stream });

        const studentMeta = metaItems.length
            ? `<div class="ms-student-meta">${metaItems.map(function(m){
                return `<div class="ms-meta-item">
                    <span class="ms-meta-label">${escHtml(m.label)}</span>
                    <span class="ms-meta-value">${escHtml(m.value)}</span>
                </div>`;
              }).join('')}</div>`
            : '';

        msSection.innerHTML = `
        <div class="ms-card" id="marksheet-printable">

            <!-- Header -->
            <div class="ms-header">
                <div class="ms-brand">
                    <img src="../assets/images/neb-gpa-favicon.png" alt="NEB GPA" width="32" height="32" loading="lazy">
                    <div>
                        <div class="ms-brand-name">NEB GPA Calculator</div>
                        <div class="ms-brand-url">neb.amritkc.com.np</div>
                    </div>
                </div>
                <div class="ms-header-divider"></div>
                <div class="ms-title-block">
                    <h2 class="ms-title">Academic Result Sheet</h2>
                    <p class="ms-date">Generated on ${escHtml(dateStr)}</p>
                </div>
            </div>

            ${studentMeta}

            <!-- Subject results -->
            <div class="ms-subjects-wrap">
                <div class="ms-section-label">Subject Results</div>
                <div class="ms-subjects-list">${mobileRows}</div>
            </div>

            <!-- Summary -->
            <div class="ms-summary">
                <div class="ms-summary-item ms-summary-gpa">
                    <div class="ms-summary-label">Final GPA</div>
                    <div class="ms-summary-value">${escHtml(gpa)}</div>
                    <div class="ms-summary-sub">out of 4.00</div>
                </div>
                <div class="ms-summary-divider"></div>
                <div class="ms-summary-item ms-summary-grade">
                    <div class="ms-summary-label">Overall Grade</div>
                    <div class="ms-summary-value ms-summary-grade-val">${escHtml(grade)}</div>
                    <div class="ms-summary-sub">${gradeDescription(grade)}</div>
                </div>
            </div>

            <!-- Footer -->
            <div class="ms-footer">
                <p>Generated using <a href="https://neb.amritkc.com.np" target="_blank" rel="noopener">neb.amritkc.com.np</a></p>
                <p class="ms-footer-note">For official results, refer to your institution or NEB.</p>
            </div>
        </div>

        <!-- Task 4: Single Download Marksheet button only -->
        <div class="ms-actions">
            <button class="btn-download-ms" id="btn-download-ms" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Marksheet
            </button>
        </div>`;

        msSection.classList.add('visible');
        document.getElementById('btn-download-ms').addEventListener('click', downloadMarksheet);
    }

    function gradeDescription(g) {
        const map = {
            'A+': 'Outstanding', 'A': 'Excellent', 'B+': 'Very Good',
            'B': 'Good', 'C+': 'Satisfactory', 'C': 'Acceptable',
            'D': 'Partially Acceptable', 'NG': 'Not Graded'
        };
        return map[g] || '';
    }

    function hideMarksheet() {
        const msSection = document.querySelector('.marksheet-section');
        if (!msSection) return;
        msSection.classList.remove('visible');
        setTimeout(function () { msSection.innerHTML = ''; }, 400);
    }

    /* ─────────────────────────────────────────────────────────
       TASK 4 — DOWNLOAD MARKSHEET (print dialog, clean white)
    ───────────────────────────────────────────────────────── */
    function downloadMarksheet() {
        const printable = document.getElementById('marksheet-printable');
        if (!printable) return;

        const printCSS = `
            @page { margin: 16mm; size: A4 portrait; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: #111; background: #fff; }
            .ms-card { background: #fff !important; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
            .ms-header { background: #f5f3ff !important; border-bottom: 1px solid #e5e7eb; padding: 20px 24px; display: flex; align-items: center; gap: 16px; }
            .ms-brand { display: flex; align-items: center; gap: 10px; }
            .ms-brand img { width: 28px; height: 28px; border-radius: 6px; }
            .ms-brand-name { font-weight: 700; font-size: 14px; color: #111; }
            .ms-brand-url { font-size: 11px; color: #6b7280; }
            .ms-header-divider { width: 1px; height: 36px; background: #e5e7eb; margin: 0 8px; }
            .ms-title { font-size: 18px; font-weight: 800; color: #111; margin: 0 0 2px; }
            .ms-date { font-size: 11px; color: #6b7280; margin: 0; }
            .ms-student-meta { display: flex; gap: 24px; padding: 14px 24px; background: #fafafa; border-bottom: 1px solid #e5e7eb; flex-wrap: wrap; }
            .ms-meta-item { display: flex; flex-direction: column; gap: 1px; }
            .ms-meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.6px; color: #9ca3af; font-weight: 600; }
            .ms-meta-value { font-size: 13px; font-weight: 600; color: #111; }
            .ms-section-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; font-weight: 700; padding: 14px 24px 8px; }
            .ms-subjects-list { padding: 0 16px 8px; }
            .ms-subject-card { padding: 12px; border: 1px solid #f3f4f6; border-radius: 8px; margin-bottom: 8px; page-break-inside: avoid; }
            .ms-subject-name { font-weight: 700; font-size: 13px; color: #111; margin-bottom: 8px; }
            .ms-subject-marks { display: flex; gap: 16px; flex-wrap: wrap; }
            .ms-mark-item { display: flex; flex-direction: column; gap: 2px; min-width: 60px; }
            .ms-mark-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; font-weight: 600; }
            .ms-mark-value { font-size: 13px; font-weight: 600; color: #111; }
            .ms-mark-value em { font-style: normal; color: #9ca3af; font-size: 10px; }
            .ms-grade-pill { display: inline-block; padding: 2px 10px; border-radius: 100px; font-weight: 700; font-size: 12px; background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
            .ms-mark-gp { color: #4f46e5 !important; font-size: 14px; font-weight: 800; }
            .ms-summary { display: flex; align-items: center; gap: 0; border-top: 2px solid #e5e7eb; background: #f5f3ff !important; page-break-inside: avoid; }
            .ms-summary-item { flex: 1; padding: 20px 24px; text-align: center; }
            .ms-summary-divider { width: 1px; height: 64px; background: #e5e7eb; }
            .ms-summary-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
            .ms-summary-value { font-size: 32px; font-weight: 900; color: #111; line-height: 1; }
            .ms-summary-sub { font-size: 11px; color: #9ca3af; margin-top: 4px; }
            .ms-summary-grade-val { color: #4f46e5 !important; }
            .ms-footer { padding: 12px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; flex-wrap: wrap; gap: 4px; }
            .ms-footer a { color: #6d28d9; text-decoration: none; font-weight: 600; }
            .ms-actions { display: none !important; }
        `;

        const style = document.createElement('style');
        style.id = '__ms-print-style';
        style.media = 'print';
        style.textContent = printCSS;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = '__ms-print-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:999999;display:none;';
        overlay.appendChild(printable.cloneNode(true));
        document.body.appendChild(overlay);

        // Temporarily hide everything except our overlay during print
        const hideStyle = document.createElement('style');
        hideStyle.id = '__ms-hide-style';
        hideStyle.media = 'print';
        hideStyle.textContent = 'body > *:not(#__ms-print-overlay){display:none!important}#__ms-print-overlay{display:block!important}';
        document.head.appendChild(hideStyle);

        window.print();

        setTimeout(function () {
            const s1 = document.getElementById('__ms-print-style');
            const s2 = document.getElementById('__ms-hide-style');
            const ov = document.getElementById('__ms-print-overlay');
            if (s1) document.head.removeChild(s1);
            if (s2) document.head.removeChild(s2);
            if (ov) document.body.removeChild(ov);
        }, 1800);
    }

    /* ─────────────────────────────────────────────────────────
       INIT
    ───────────────────────────────────────────────────────── */
    function init() {
        if (!document.querySelector('[data-calculator]')) return;
        attachValidation();
        attachCalcButtonFeedback();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();