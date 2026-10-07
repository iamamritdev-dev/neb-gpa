// /**
//  * marksheet.js — v2
//  * Tasks: validation, empty-field guard, scroll fix, marksheet redesign,
//  *        download-marksheet (print), remove PDF button, remove Total Credits.
//  * Zero changes to GPA formulas or grading logic.
//  */
// (function () {
//     'use strict';

//     /* ─────────────────────────────────────────────────────────
//        HELPERS
//     ───────────────────────────────────────────────────────── */
//     function escHtml(str) {
//         if (str === null || str === undefined) return '';
//         return String(str)
//             .replace(/&/g, '&amp;')
//             .replace(/</g, '&lt;')
//             .replace(/>/g, '&gt;')
//             .replace(/"/g, '&quot;');
//     }

//     function getOrCreateWarning(input) {
//         let el = input.parentElement.querySelector('.input-warning');
//         if (!el) {
//             el = document.createElement('div');
//             el.className = 'input-warning';
//             el.setAttribute('role', 'alert');
//             el.setAttribute('aria-live', 'polite');
//             input.parentElement.appendChild(el);
//         }
//         return el;
//     }

//     function warnInput(input, msgEl, msg) {
//         input.classList.add('input-error');
//         msgEl.textContent = msg;
//         msgEl.classList.add('show');
//     }

//     function clearInputWarn(input, msgEl) {
//         input.classList.remove('input-error');
//         msgEl.classList.remove('show');
//     }

//     /* ─────────────────────────────────────────────────────────
//        TASK 2 (carried over) — PER-INPUT RANGE VALIDATION
//     ───────────────────────────────────────────────────────── */
//     function validateInput(input) {
//         const msgEl = getOrCreateWarning(input);
//         const val = input.value.trim();
//         const max = parseFloat(input.getAttribute('max'));
//         const num = parseFloat(val);

//         if (val === '') { clearInputWarn(input, msgEl); return true; }
//         if (isNaN(num)) { warnInput(input, msgEl, 'Enter a valid number.'); return false; }
//         if (num < 0)    { warnInput(input, msgEl, 'Marks cannot be negative.'); return false; }
//         if (!isNaN(max) && num > max) {
//             warnInput(input, msgEl, `Maximum allowed is ${max}.`);
//             return false;
//         }
//         clearInputWarn(input, msgEl);
//         return true;
//     }

//     function attachValidation() {
//         const tbody = document.querySelector('[data-subjects]');
//         if (!tbody) return;
//         tbody.addEventListener('input', function (e) {
//             const inp = e.target;
//             if (inp.tagName !== 'INPUT' || inp.type !== 'number') return;
//             validateInput(inp);
//         }, { passive: true });
//     }

//     /* ─────────────────────────────────────────────────────────
//        TASK 3 — EMPTY MARKS VALIDATION BEFORE CALCULATION
//     ───────────────────────────────────────────────────────── */
//     function showGlobalWarning(msg) {
//         let el = document.getElementById('ms-global-warning');
//         if (!el) {
//             el = document.createElement('div');
//             el.id = 'ms-global-warning';
//             el.className = 'ms-global-warning';
//             el.setAttribute('role', 'alert');
//             el.setAttribute('aria-live', 'assertive');
//             // Insert before the calculator actions
//             const actions = document.querySelector('.calculator-actions');
//             if (actions) actions.parentElement.insertBefore(el, actions);
//         }
//         el.innerHTML = `
//             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
//                  fill="none" stroke="currentColor" stroke-width="2"
//                  stroke-linecap="round" stroke-linejoin="round">
//                 <circle cx="12" cy="12" r="10"/>
//                 <line x1="12" y1="8" x2="12" y2="12"/>
//                 <line x1="12" y1="16" x2="12.01" y2="16"/>
//             </svg>
//             <span>${escHtml(msg)}</span>`;
//         el.classList.add('show');
//         // Auto-hide after 4 s
//         clearTimeout(el._hideTimer);
//         el._hideTimer = setTimeout(function () {
//             el.classList.remove('show');
//         }, 4000);
//     }

//     function clearGlobalWarning() {
//         const el = document.getElementById('ms-global-warning');
//         if (el) el.classList.remove('show');
//     }

//     function allMarksEntered() {
//         const tbody = document.querySelector('[data-subjects]');
//         if (!tbody) return true; // not an advanced calculator
//         const rows = tbody.querySelectorAll('tr');
//         if (!rows.length) return true;

//         let missingCount = 0;
//         rows.forEach(function (tr) {
//             tr.querySelectorAll('input[data-type]').forEach(function (inp) {
//                 if (inp.value.trim() === '') missingCount++;
//             });
//         });
//         return missingCount === 0;
//     }

//     /* ──────────────────────────────────────────    function attachCalcButtonFeedback() {
//         const btn = document.querySelector('[data-calculate]');
//         if (!btn) return;

//         // Use capture phase (true) to intercept the click and validate before calculator.js runs.
//         btn.addEventListener('click', function (e) {
//             clearGlobalWarning();

//             // Name is compulsory
//             const nameInput = document.getElementById('ms-name');
//             if (nameInput) {
//                 const nameVal = nameInput.value.trim();
//                 if (nameVal === '') {
//                     nameInput.classList.add('input-error');
//                     nameInput.focus();
//                     showGlobalWarning('Please enter Student Name before calculating.');
//                     e.stopImmediatePropagation();
//                     e.preventDefault();
//                     return;
//                 } else {
//                     nameInput.classList.remove('input-error');
//                 }
//             }

//             // Task 3: block if marks missing
//             if (!allMarksEntered()) {
//                 showGlobalWarning('Please enter marks for all subjects before calculating.');
//                 e.stopImmediatePropagation();
//                 e.preventDefault();
//                 return;
//             }

//             // Visual micro-feedback
//             btn.classList.add('calculating');
//             setTimeout(function () { btn.classList.remove('calculating'); }, 320);

//             // Animate result cards
//             const resultEl = document.querySelector('.calculator-result');
//             if (resultEl) {
//                 resultEl.classList.remove('revealed');
//                 void resultEl.offsetWidth;
//                 resultEl.classList.add('revealed');
//             }

//             // Build marksheet then scroll to it
//             setTimeout(function () {
//                 buildMarksheet();
//                 setTimeout(scrollToMarksheet, 80);
//             }, 120);
//         }, true); // Use capture phase
//     }

//     /* ─────────────────────────────────────────────────────────
//        GRADE HELPERS (mirrors calculator.js — read-only)
//     ───────────────────────────────────────────────────────── */
//     function gradePoint(pct) {
//         if (isNaN(pct) || pct < 0 || pct > 100) return 0;
//         if (pct >= 90) return 4.0;
//         if (pct >= 80) return 3.6;
//         if (pct >= 70) return 3.2;
//         if (pct >= 60) return 2.8;
//         if (pct >= 50) return 2.4;
//         if (pct >= 40) return 2.0;
//         if (pct >= 35) return 1.6;
//         return 0.0;
//     }

//     function gpaToGrade(gpa) {
//         const v = parseFloat(Number(gpa).toFixed(2));
//         if (v >= 3.60) return 'A+';
//         if (v >= 3.20) return 'A';
//         if (v >= 2.80) return 'B+';
//         if (v >= 2.40) return 'B';
//         if (v >= 2.00) return 'C+';
//         if (v >= 1.60) return 'C';
//         if (v >= 1.00) return 'D';
//         return 'NG';
//     }

//     /* ─────────────────────────────────────────────────────────
//        COLLECT ROW DATA
//     ───────────────────────────────────────────────────────── */
//     function getStreamLabel() {
//         const calc = document.querySelector('[data-calculator]');
//         if (!calc) return 'NEB';
//         const map = { science: 'Science', management: 'Management', see: 'SEE (Class 10)' };
//         return map[calc.dataset.calculator] || 'NEB';
//     }

//     function getStudentInfo() {
//         return {
//             name:   (document.getElementById('ms-name')   || {}).value || '',
//             grade:  (document.getElementById('ms-grade')  || {}).value || '',
//             stream: (document.getElementById('ms-stream') || {}).value || getStreamLabel()
//         };
//     }

//     function collectRows() {
//         const rows  = [];
//         const tbody = document.querySelector('[data-subjects]');
//         if (!tbody) return rows;

//         tbody.querySelectorAll('tr').forEach(function (tr) {
//             const subjCol = tr.querySelector('.subject-col');
//             const thInput = tr.querySelector('input[data-type="th"]');
//             const prInput = tr.querySelector('input[data-type="pr"]');
//             if (!subjCol || !thInput || !prInput) return;

//             const subj  = subjCol.textContent.trim() || (subjCol.querySelector('input') || {}).value || '—';
//             const thVal = thInput.value.trim();
//             const prVal = prInput.value.trim();
//             const thMax = parseFloat(thInput.getAttribute('max')) || 75;
//             const prMax = parseFloat(prInput.getAttribute('max')) || 25;

//             const thNum = parseFloat(thVal);
//             const prNum = parseFloat(prVal);
//             let gradeText = '—', gpText = '—';

//             if (!isNaN(thNum) && !isNaN(prNum) && thNum >= 0 && prNum >= 0) {
//                 const thCredit = parseFloat(tr.dataset.thCredit) || 3;
//                 const prCredit = parseFloat(tr.dataset.prCredit) || 1;
//                 const thGp = gradePoint((thNum / thMax) * 100);
//                 const prGp = gradePoint((prNum / prMax) * 100);
//                 if (thGp === 0 || prGp === 0) {
//                     gradeText = 'NG'; gpText = '0.0';
//                 } else {
//                     const gp = ((thGp * thCredit) + (prGp * prCredit)) / (thCredit + prCredit);
//                     gpText = gp.toFixed(2);
//                     gradeText = gpaToGrade(gp);
//                 }
//             }

//             rows.push({ subject: subj, theory: thVal || '—', practical: prVal || '—',
//                         thMax, prMax, grade: gradeText, gp: gpText });
//         });
//         return rows;
//     }

//     /* ─────────────────────────────────────────────────────────
//        TASK 1 — PROFESSIONAL MARKSHEET BUILD
//     ───────────────────────────────────────────────────────── */
//     function buildMarksheet() {
//         const gpa   = (document.querySelector('[data-result-gpa]')   || {}).textContent || '—';
//         const grade = (document.querySelector('[data-result-grade]') || {}).textContent || '—';

//         if (gpa === '-' || gpa === '—') { hideMarksheet(); return; }

//         const info = getStudentInfo();
//         const rows = collectRows();
//         const msSection = document.querySelector('.marksheet-section');
//         if (!msSection) return;

//         const now = new Date();
//         const dateStr = now.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' });

//         // Build responsive table rows
//         const tableRows = rows.map(function (r) {
//             return `
//             <tr>
//                 <td class="marksheet-subject-col">${escHtml(r.subject)}</td>
//                 <td data-label="Theory">${escHtml(r.theory)}<em>/${r.thMax}</em></td>
//                 <td data-label="Practical">${escHtml(r.practical)}<em>/${r.prMax}</em></td>
//                 <td data-label="Grade"><span class="ms-grade-badge">${escHtml(r.grade)}</span></td>
//                 <td data-label="GP"><span class="marksheet-gp-value">${escHtml(r.gp)}</span></td>
//             </tr>`;
//         }).join('');

//         // Student meta (only show filled fields)
//         const metaItems = [];
//         if (info.name)   metaItems.push({ label: 'Student Name', value: info.name });
//         if (info.grade)  metaItems.push({ label: 'Class / Grade', value: info.grade });
//         if (info.stream) metaItems.push({ label: 'Stream', value: info.stream });

//         const studentMeta = metaItems.length
//             ? `<div class="marksheet-student-row">${metaItems.map(function(m){
//                 return `<div class="meta-item">
//                     <span class="meta-label">${escHtml(m.label)}</span>
//                     <span class="meta-value">${escHtml(m.value)}</span>
//                 </div>`;
//               }).join('')}</div>`
//             : '';

//         msSection.innerHTML = `
//         <div class="marksheet-card" id="marksheet-printable">

//             <!-- Header -->
//             <div class="marksheet-header">
//                 <h2 class="marksheet-title">Academic Grade Sheet</h2>
//                 <p class="marksheet-subtitle">Generated on ${escHtml(dateStr)}</p>
//             </div>

//             ${studentMeta}

//             <!-- Subject results -->
//             <div class="marksheet-table-wrap">
//                 <table class="marksheet-table">
//                     <thead>
//                         <tr>
//                             <th>Subject</th>
//                             <th>Theory</th>
//                             <th>Practical</th>
//                             <th>Grade</th>
//                             <th>GP</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         ${tableRows}
//                     </tbody>
//                 </table>
//             </div>

//             <!-- Summary -->
//             <div class="marksheet-summary">
//                 <div class="ms-summary-box">
//                     <div class="ms-summary-label">Final GPA</div>
//                     <div class="ms-summary-value">${escHtml(gpa)}</div>
//                 </div>
//                 <div class="ms-summary-box">
//                     <div class="ms-summary-label">Overall Grade</div>
//                     <div class="ms-summary-value" style="color: var(--accent-light);">${escHtml(grade)}</div>
//                 </div>
//                 <div class="ms-summary-box">
//                     <div class="ms-summary-label">Description</div>
//                     <div class="ms-summary-value" style="font-size: 16px; font-weight: 600; line-height: 1.8;">${gradeDescription(grade)}</div>
//                 </div>
//             </div>

//             <!-- Footer -->
//             <div class="marksheet-footer">
//                 <p>Generated via GPA Calculator</p>
//                 <p>For official results, refer to your institution or NEB.</p>
//             </div>
//         </div>

//         <div class="marksheet-actions">
//             <button class="btn-download" id="btn-download-ms" type="button">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
//                      fill="none" stroke="currentColor" stroke-width="2.2"
//                      stroke-linecap="round" stroke-linejoin="round">
//                     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//                     <polyline points="7 10 12 15 17 10"/>
//                     <line x1="12" y1="15" x2="12" y2="3"/>
//                 </svg>
//                 Download Marksheet
//             </button>
//         </div>`;

//         msSection.classList.add('visible');
//         document.getElementById('btn-download-ms').addEventListener('click', downloadMarksheet);
//     }

//     function gradeDescription(g) {
//         const map = {
//             'A+': 'Outstanding', 'A': 'Excellent', 'B+': 'Very Good',
//             'B': 'Good', 'C+': 'Satisfactory', 'C': 'Acceptable',
//             'D': 'Partially Acceptable', 'NG': 'Not Graded'
//         };
//         return map[g] || '';
//     }

//     function hideMarksheet() {
//         const msSection = document.querySelector('.marksheet-section');
//         if (!msSection) return;
//         msSection.classList.remove('visible');
//         setTimeout(function () { msSection.innerHTML = ''; }, 400);
//     }

//     /* ─────────────────────────────────────────────────────────
//        DOWNLOAD MARKSHEET (Dynamic html2canvas PNG Download)
//        Generates a highly-polished, crisp light-themed grade sheet
//     ───────────────────────────────────────────────────────── */
//     function downloadMarksheet() {
//         const printable = document.getElementById('marksheet-printable');
//         if (!printable) return;

//         const btn = document.getElementById('btn-download-ms');
//         if (!btn) return;
//         const originalText = btn.innerHTML;

//         // If html2canvas is not loaded, fetch it dynamically
//         if (typeof html2canvas === 'undefined') {
//             btn.disabled = true;
//             btn.innerHTML = `
//                 <svg class="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                     <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
//                 </svg>
//                 Preparing Engine...`;

//             const script = document.createElement('script');
//             script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
//             script.crossOrigin = 'anonymous';
//             script.onload = function () {
//                 btn.disabled = false;
//                 btn.innerHTML = originalText;
//                 triggerImageRender(printable, btn, originalText);
//             };
//             script.onerror = function () {
//                 btn.disabled = false;
//                 btn.innerHTML = originalText;
//                 alert('Could not start download engine. Please verify your connection.');
//             };
//             document.head.appendChild(script);
//         } else {
//             triggerImageRender(printable, btn, originalText);
//         }
//     }

//     function triggerImageRender(printable, btn, originalText) {
//         btn.disabled = true;
//         btn.innerHTML = `
//             <svg class="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
//                 <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
//             </svg>
//             Downloading...`;

//         // Style a wrapper off-screen to generate a clean, light-themed, high-resolution block
//         const container = document.createElement('div');
//         container.style.position = 'absolute';
//         container.style.left = '-9999px';
//         container.style.top = '0';
//         container.style.width = '760px'; // standard width for clean document layout

//         const clone = printable.cloneNode(true);
//         container.appendChild(clone);
//         document.body.appendChild(container);

//         // Inject light-themed print/pdf stylesheet directly to clone
//         const style = document.createElement('style');
//         style.textContent = `
//             .marksheet-card {
//                 background: #ffffff !important;
//                 color: #111111 !important;
//                 border: 1px solid #e5e7eb !important;
//                 border-radius: 12px !important;
//                 overflow: hidden !important;
//                 font-family: 'Inter', sans-serif !important;
//                 box-shadow: none !important;
//             }
//             .marksheet-header {
//                 background: #f5f3ff !important;
//                 border-bottom: 1px solid #e5e7eb !important;
//                 padding: 24px 32px !important;
//                 text-align: center !important;
//             }
//             .marksheet-title {
//                 font-size: 22px !important;
//                 font-weight: 800 !important;
//                 color: #111111 !important;
//                 margin: 0 0 6px 0 !important;
//                 font-family: 'Space Grotesk', sans-serif !important;
//                 letter-spacing: -0.5px !important;
//             }
//             .marksheet-subtitle {
//                 font-size: 12px !important;
//                 color: #6b7280 !important;
//                 margin: 0 !important;
//             }
//             .marksheet-student-row {
//                 display: flex !important;
//                 gap: 40px !important;
//                 padding: 16px 32px !important;
//                 background: #fafafa !important;
//                 border-bottom: 1px solid #e5e7eb !important;
//             }
//             .meta-item {
//                 display: flex !important;
//                 flex-direction: column !important;
//                 gap: 2px !important;
//             }
//             .meta-label {
//                 font-size: 10px !important;
//                 text-transform: uppercase !important;
//                 letter-spacing: 0.8px !important;
//                 color: #9ca3af !important;
//                 font-weight: 700 !important;
//             }
//             .meta-value {
//                 font-size: 14px !important;
//                 font-weight: 600 !important;
//                 color: #111111 !important;
//             }
//             .marksheet-table-wrap {
//                 width: 100% !important;
//             }
//             .marksheet-table {
//                 width: 100% !important;
//                 border-collapse: collapse !important;
//             }
//             .marksheet-table th {
//                 background: #f9fafb !important;
//                 color: #4f46e5 !important;
//                 font-size: 11px !important;
//                 text-transform: uppercase !important;
//                 letter-spacing: 0.9px !important;
//                 padding: 14px 32px !important;
//                 text-align: left !important;
//                 border-bottom: 2px solid #e5e7eb !important;
//                 font-weight: 700 !important;
//             }
//             .marksheet-table td {
//                 padding: 14px 32px !important;
//                 border-bottom: 1px solid #f3f4f6 !important;
//                 font-size: 13.5px !important;
//                 color: #111111 !important;
//                 text-align: left !important;
//             }
//             .marksheet-table td em {
//                 font-style: normal !important;
//                 color: #9ca3af !important;
//                 font-size: 10.5px !important;
//             }
//             .ms-grade-badge {
//                 display: inline-block !important;
//                 padding: 2px 10px !important;
//                 border-radius: 100px !important;
//                 font-weight: 700 !important;
//                 font-size: 12px !important;
//                 background: #ede9fe !important;
//                 color: #6d28d9 !important;
//                 border: 1px solid #ddd6fe !important;
//             }
//             .marksheet-gp-value {
//                 font-weight: 700 !important;
//                 color: #4f46e5 !important;
//             }
//             .marksheet-summary {
//                 display: grid !important;
//                 grid-template-columns: repeat(3, 1fr) !important;
//                 gap: 0 !important;
//                 border-top: 2px solid #e5e7eb !important;
//                 background: #f5f3ff !important;
//             }
//             .ms-summary-box {
//                 padding: 20px 12px !important;
//                 text-align: center !important;
//                 border-right: 1px solid #e5e7eb !important;
//             }
//             .ms-summary-box:last-child {
//                 border-right: none !important;
//             }
//             .ms-summary-label {
//                 font-size: 10px !important;
//                 text-transform: uppercase !important;
//                 letter-spacing: 0.8px !important;
//                 color: #6b7280 !important;
//                 font-weight: 700 !important;
//                 margin-bottom: 4px !important;
//             }
//             .ms-summary-value {
//                 font-size: 24px !important;
//                 font-weight: 900 !important;
//                 color: #111111 !important;
//                 line-height: 1 !important;
//             }
//             .ms-summary-box:last-child .ms-summary-value {
//                 font-size: 15px !important;
//                 font-weight: 700 !important;
//                 line-height: 1.6 !important;
//             }
//             .marksheet-footer {
//                 padding: 16px 32px !important;
//                 border-top: 1px solid #e5e7eb !important;
//                 display: flex !important;
//                 justify-content: space-between !important;
//                 font-size: 11px !important;
//                 color: #9ca3af !important;
//             }
//             .marksheet-footer p {
//                 margin: 0 !important;
//             }
//         `;
//         container.appendChild(style);

//         // Render clone using html2canvas
//         html2canvas(clone, {
//             scale: 2.5, // High resolution for crystal clear document representation
//             useCORS: true,
//             backgroundColor: '#ffffff',
//             logging: false
//         }).then(function (canvas) {
//             const dataUrl = canvas.toDataURL('image/png');
//             document.body.removeChild(container);

//             const nameInput = document.getElementById('ms-name');
//             const studentName = nameInput ? nameInput.value.trim().replace(/[^a-zA-Z0-9]/g, '_') : 'Student';
//             const filename = `${studentName}_Grade_Sheet.png`;

//             const link = document.createElement('a');
//             link.download = filename;
//             link.href = dataUrl;
//             link.click();

//             btn.disabled = false;
//             btn.innerHTML = originalText;
//         }).catch(function (error) {
//             console.error('Render error:', error);
//             document.body.removeChild(container);
//             btn.disabled = false;
//             btn.innerHTML = originalText;
//             alert('Failed to generate file download.');
//         });
//     }

//     /* ─────────────────────────────────────────────────────────
//        INIT
//     ───────────────────────────────────────────────────────── */
//     function init() {
//         if (!document.querySelector('[data-calculator]')) return;
//         attachValidation();
//         attachCalcButtonFeedback();
//     }

//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', init);
//     } else {
//         init();
//     }

// })();p: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; flex-wrap: wrap; gap: 4px; }
//             .marksheet-footer a { color: #6d28d9; text-decoration: none; font-weight: 600; }
//             .marksheet-actions { display: none !important; }
//         `;

//         const style = document.createElement('style');
//         style.id = '__ms-print-style';
//         style.media = 'print';
//         style.textContent = printCSS;
//         document.head.appendChild(style);

//         const overlay = document.createElement('div');
//         overlay.id = '__ms-print-overlay';
//         overlay.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:999999;display:none;';
//         overlay.appendChild(printable.cloneNode(true));
//         document.body.appendChild(overlay);

//         // Temporarily hide everything except our overlay during print
//         const hideStyle = document.createElement('style');
//         hideStyle.id = '__ms-hide-style';
//         hideStyle.media = 'print';
//         hideStyle.textContent = 'body > *:not(#__ms-print-overlay){display:none!important}#__ms-print-overlay{display:block!important}';
//         document.head.appendChild(hideStyle);

//         window.print();

//         setTimeout(function () {
//             const s1 = document.getElementById('__ms-print-style');
//             const s2 = document.getElementById('__ms-hide-style');
//             const ov = document.getElementById('__ms-print-overlay');
//             if (s1) document.head.removeChild(s1);
//             if (s2) document.head.removeChild(s2);
//             if (ov) document.body.removeChild(ov);
//         }, 1800);
//     }


//     /* ─────────────────────────────────────────────────────────
//        INIT
//     ───────────────────────────────────────────────────────── */
//     function init() {
//         if (!document.querySelector('[data-calculator]')) return;
//         attachValidation();
//         attachCalcButtonFeedback();
//     }

//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', init);
//     } else {
//         init();
//     }

// })();