const gradeScale = [
    { min: 90, grade: 'A+', point: 4.0 },
    { min: 80, grade: 'A', point: 3.6 },
    { min: 70, grade: 'B+', point: 3.2 },
    { min: 60, grade: 'B', point: 2.8 },
    { min: 50, grade: 'C+', point: 2.4 },
    { min: 40, grade: 'C', point: 2.0 },
    { min: 35, grade: 'D', point: 1.6 },
    { min: 0, grade: 'NG', point: 0.0 }
];

const scienceSubjects = {
    biology: [
        { name: 'English', thCredit: 3, prCredit: 1 },
        { name: 'Nepali', thCredit: 2.25, prCredit: 0.75 },
        { name: 'Physics', thCredit: 3.75, prCredit: 1.25 },
        { name: 'Chemistry', thCredit: 3.75, prCredit: 1.25 },
        { name: 'Mathematics', thCredit: 3.75, prCredit: 1.25 },
        { name: 'Biology', thCredit: 3.75, prCredit: 1.25 }
    ],
    computer: [
        { name: 'English', thCredit: 3, prCredit: 1 },
        { name: 'Nepali', thCredit: 2.25, prCredit: 0.75 },
        { name: 'Physics', thCredit: 3.75, prCredit: 1.25 },
        { name: 'Chemistry', thCredit: 3.75, prCredit: 1.25 },
        { name: 'Mathematics', thCredit: 3.75, prCredit: 1.25 },
        { name: 'Computer Science', thCredit: 2.5, prCredit: 2.5 }
    ]
};

const managementBase = [
    { name: 'English', thCredit: 3, prCredit: 1 },
    { name: 'Nepali', thCredit: 2.25, prCredit: 0.75 },
    { name: 'Social Studies', thCredit: 2.25, prCredit: 0.75 }
];

const managementSubjects = {
    business: [
        ...managementBase,
        { name: 'Business Studies', thCredit: 3.75, prCredit: 1.25 }
    ],
    computer: [
        ...managementBase,
        { name: 'Computer Science', thCredit: 2.5, prCredit: 2.5 }
    ],
    hotel: [
        ...managementBase,
        { name: 'Hotel Management', thCredit: 2.5, prCredit: 2.5 }
    ],
    travel: [
        ...managementBase,
        { name: 'Travel & Tourism', thCredit: 2.5, prCredit: 2.5 }
    ],
    accounting: [
        ...managementBase,
        { name: 'Students Principles of Accounting', thCredit: 3.75, prCredit: 1.25 }
    ],
    business_math: [
        ...managementBase,
        { name: 'Business Mathematics', thCredit: 3.75, prCredit: 1.25 }
    ],
    finance_marketing: [
        ...managementBase,
        { name: 'Finance & Marketing', thCredit: 3.75, prCredit: 1.25 }
    ],
    basic_math: [
        ...managementBase,
        { name: 'Basic Mathematics', thCredit: 3.75, prCredit: 1.25 }
    ],
    economics: [
        ...managementBase,
        { name: 'Economics', thCredit: 3.75, prCredit: 1.25 }
    ],
};

const seeBase = [
    { name: 'English', thCredit: 3, prCredit: 1 },
    { name: 'Nepali', thCredit: 3, prCredit: 1 },
    { name: 'Mathematics', thCredit: 3, prCredit: 1 },
    { name: 'Science', thCredit: 3, prCredit: 1 },
    { name: 'Social Studies', thCredit: 3, prCredit: 1 }
];

const seeOptionalMap = {
    optional_math: { name: 'Optional Math', thCredit: 3, prCredit: 1 },
    accountancy:   { name: 'Accountancy', thCredit: 3, prCredit: 1 },
    computer:      { name: 'Computer Science', thCredit: 2, prCredit: 2 },
    agriculture:   { name: 'Agriculture', thCredit: 2, prCredit: 2 }
};

const streamSubjects = {};

const streamNames = {
    science: 'Science',
    management: 'Management',
    see: 'SEE'
};

const tableBody = document.querySelector('[data-subjects]');
const resultGpa = document.querySelector('[data-result-gpa]');
const resultGrade = document.querySelector('[data-result-grade]');
const resultCredits = document.querySelector('[data-result-credits]');
const calculator = document.querySelector('[data-calculator]');

function getGrade(mark) {
    if (Number.isNaN(mark) || mark < 0 || mark > 100) {
        return { grade: '-', point: 0 };
    }

    return gradeScale.find(item => mark >= item.min);
}

function getGpaGrade(gpa) {
    if (Number.isNaN(gpa) || gpa < 0) return '-';
    const val = Number.parseFloat(Number(gpa).toFixed(2));
    if (val >= 3.60) return 'A+';
    if (val >= 3.20) return 'A';
    if (val >= 2.80) return 'B+';
    if (val >= 2.40) return 'B';
    if (val >= 2.00) return 'C+';
    if (val >= 1.60) return 'C';
    if (val >= 1.00) return 'D';
    return 'NG';
}

function createRow(subject = '', credit = 4, mark = '') {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td class="subject-col"><input type="text" value="${subject}" aria-label="Subject name"></td>
        <td class="number-col"><input type="number" min="0" step="0.5" value="${credit}" aria-label="Credit hours"></td>
        <td class="number-col"><input type="number" min="0" max="100" step="1" value="${mark}" aria-label="Marks"></td>
        <td class="grade-col" data-grade>-</td>
        <td><button type="button" class="remove-row" data-remove>Remove</button></td>
    `;
    return row;
}

function renderSubjects() {
    const stream = calculator.dataset.calculator;
    tableBody.innerHTML = '';

    if (stream === 'science') {
        const optionalSelect = document.getElementById('optional-subject');
        const selectedOptional = optionalSelect && optionalSelect.value ? optionalSelect.value : 'biology';
        const subjects = scienceSubjects[selectedOptional];
        
        subjects.forEach(subj => {
            const row = document.createElement('tr');
            const thMax = (subj.thCredit / (subj.thCredit + subj.prCredit)) * 100;
            const prMax = (subj.prCredit / (subj.thCredit + subj.prCredit)) * 100;
            row.innerHTML = `
                <td class="subject-col">${subj.name}</td>
                <td class="number-col" data-label="Theory">
                    <input type="number" min="0" max="${thMax}" step="1" placeholder="Max: ${thMax}" data-type="th" aria-label="Theory Marks">
                </td>
                <td class="number-col" data-label="Practical">
                    <input type="number" min="0" max="${prMax}" step="1" placeholder="Max: ${prMax}" data-type="pr" aria-label="Practical Marks">
                </td>
            `;
            row.dataset.thCredit = subj.thCredit;
            row.dataset.prCredit = subj.prCredit;
            row.dataset.thMax = thMax;
            row.dataset.prMax = prMax;
            tableBody.appendChild(row);
        });
    } else if (stream === 'see') {
        // SEE: 5 compulsory + up to 2 optional subjects
        const subjects = [...seeBase];
        const sel1 = document.getElementById('see-optional-1');
        const sel2 = document.getElementById('see-optional-2');
        const val1 = sel1 ? sel1.value : '';
        const val2 = sel2 ? sel2.value : '';
        if (val1 && seeOptionalMap[val1]) subjects.push(seeOptionalMap[val1]);
        if (val2 && seeOptionalMap[val2]) subjects.push(seeOptionalMap[val2]);
        
        subjects.forEach(subj => {
            const row = document.createElement('tr');
            const thMax = (subj.thCredit / (subj.thCredit + subj.prCredit)) * 100;
            const prMax = (subj.prCredit / (subj.thCredit + subj.prCredit)) * 100;
            row.innerHTML = `
                <td class="subject-col">${subj.name}</td>
                <td class="number-col" data-label="Theory">
                    <input type="number" min="0" max="${thMax}" step="1" placeholder="Max: ${thMax}" data-type="th" aria-label="Theory Marks">
                </td>
                <td class="number-col" data-label="Practical">
                    <input type="number" min="0" max="${prMax}" step="1" placeholder="Max: ${prMax}" data-type="pr" aria-label="Practical Marks">
                </td>
            `;
            row.dataset.thCredit = subj.thCredit;
            row.dataset.prCredit = subj.prCredit;
            row.dataset.thMax = thMax;
            row.dataset.prMax = prMax;
            
            tableBody.appendChild(row);
        });
    } else if (stream === 'management') {
        // compulsory subjects (English, Nepali, Social Studies)
        const subjects = [...managementBase];
        // optional subjects via checkboxes (max 4 enforced by UI)
        const optionalChecks = document.querySelectorAll('.optional-subject-checkbox:checked');
        const optionalMap = {
            accounting: { name: 'Accountancy', thCredit: 3.75, prCredit: 1.25 },
            economics:  { name: 'Economics', thCredit: 3.75, prCredit: 1.25 },
            business:   { name: 'Business Studies', thCredit: 3.75, prCredit: 1.25 },
            computer:   { name: 'Computer Science', thCredit: 2.5, prCredit: 2.5 },
            hotel:      { name: 'Hotel Management', thCredit: 2.5, prCredit: 2.5 },
            travel:     { name: 'Travel & Tourism', thCredit: 2.5, prCredit: 2.5 }
        };
        optionalChecks.forEach(chk => {
            const cfg = optionalMap[chk.value];
            if (cfg) subjects.push(cfg);
        });
        
        subjects.forEach(subj => {
            const row = document.createElement('tr');
            const thMax = (subj.thCredit / (subj.thCredit + subj.prCredit)) * 100;
            const prMax = (subj.prCredit / (subj.thCredit + subj.prCredit)) * 100;
            row.innerHTML = `
                <td class="subject-col">${subj.name}</td>
                <td class="number-col" data-label="Theory">
                    <input type="number" min="0" max="${thMax}" step="1" placeholder="Max: ${thMax}" data-type="th" aria-label="Theory Marks">
                </td>
                <td class="number-col" data-label="Practical">
                    <input type="number" min="0" max="${prMax}" step="1" placeholder="Max: ${prMax}" data-type="pr" aria-label="Practical Marks">
                </td>
            `;
            row.dataset.thCredit = subj.thCredit;
            row.dataset.prCredit = subj.prCredit;
            row.dataset.thMax = thMax;
            row.dataset.prMax = prMax;
            
            tableBody.appendChild(row);
        });
    } else {
        const subjects = streamSubjects[stream] || streamSubjects.see;
        subjects.forEach(([subject, credit]) => {
            tableBody.appendChild(createRow(subject, credit));
        });
    }

    calculateGpa();
}

function calculateAdvancedGpa() {
    let totalCredits = 0;
    let totalWeightedPoints = 0;
    let lowestGradePoint = 4;

    tableBody.querySelectorAll('tr').forEach(row => {
        const thInput = row.querySelector('input[data-type="th"]');
        const prInput = row.querySelector('input[data-type="pr"]');
        
        const thMark = Number.parseFloat(thInput.value);
        const prMark = Number.parseFloat(prInput.value);
        
        const thCredit = Number.parseFloat(row.dataset.thCredit);
        const prCredit = Number.parseFloat(row.dataset.prCredit);
        const thMax = Number.parseFloat(row.dataset.thMax);
        const prMax = Number.parseFloat(row.dataset.prMax);
        const totalSubjectCredit = thCredit + prCredit;
        
        let validSubject = false;
        let subjectGp = 0;
        let subjectGrade = '-';
        
        if (!Number.isNaN(thMark) && thMark >= 0 && thMark <= thMax && 
            !Number.isNaN(prMark) && prMark >= 0 && prMark <= prMax) {
            
            const thPercent = (thMark / thMax) * 100;
            const prPercent = (prMark / prMax) * 100;
            
            const thGrade = getGrade(thPercent);
            const prGrade = getGrade(prPercent);
            
            subjectGp = ((thGrade.point * thCredit) + (prGrade.point * prCredit)) / totalSubjectCredit;
            
            const overallSubjectGrade = getGpaGrade(subjectGp);
            
            if (thGrade.grade === 'NG' || prGrade.grade === 'NG') {
                subjectGp = 0; 
                subjectGrade = 'NG';
            } else {
                subjectGrade = overallSubjectGrade;
            }
            
            validSubject = true;
        }
        
        if (validSubject) {
            totalCredits += totalSubjectCredit;
            totalWeightedPoints += subjectGp * totalSubjectCredit;
            lowestGradePoint = Math.min(lowestGradePoint, subjectGp);
        }
    });

    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    const overallGrade = totalCredits > 0 ? getGpaGrade(gpa) : '-';

    resultGpa.textContent = totalCredits > 0 ? gpa.toFixed(2) : '-';
    resultGrade.textContent = lowestGradePoint === 0 ? 'NG' : overallGrade;
    resultCredits.textContent = totalCredits > 0 ? totalCredits.toString() : '-';
}

function calculateGpa() {
    const stream = calculator.dataset.calculator;
    if (stream === 'science' || stream === 'management' || stream === 'see') {
        calculateAdvancedGpa();
        return;
    }

    let totalCredits = 0;
    let totalWeightedPoints = 0;
    let lowestGradePoint = 4;

    tableBody.querySelectorAll('tr').forEach(row => {
        const inputs = row.querySelectorAll('input');
        const credit = Number.parseFloat(inputs[1].value);
        const mark = Number.parseFloat(inputs[2].value);
        const grade = getGrade(mark);

        row.querySelector('[data-grade]').textContent = `${grade.grade} (${grade.point.toFixed(1)})`;

        if (!Number.isNaN(credit) && credit > 0 && !Number.isNaN(mark) && mark >= 0 && mark <= 100) {
            totalCredits += credit;
            totalWeightedPoints += grade.point * credit;
            lowestGradePoint = Math.min(lowestGradePoint, grade.point);
        }
    });

    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    const overallGrade = totalCredits > 0 ? getGpaGrade(gpa) : '-';

    resultGpa.textContent = totalCredits > 0 ? gpa.toFixed(2) : '-';
    resultGrade.textContent = lowestGradePoint === 0 ? 'NG' : overallGrade;
    resultCredits.textContent = totalCredits > 0 ? totalCredits.toString() : '-';
}

function resetMarks() {
    tableBody.querySelectorAll('tr').forEach(row => {
        const stream = calculator.dataset.calculator;
        if (stream === 'science' || stream === 'management' || stream === 'see') {
            row.querySelectorAll('input').forEach(input => input.value = '');
        } else {
            const inputs = row.querySelectorAll('input');
            if(inputs.length > 2) inputs[2].value = '';
        }
    });
    calculateGpa();
}

document.querySelector('[data-stream-name]').textContent = streamNames[calculator.dataset.calculator] || 'NEB';
const addRowBtn = document.querySelector('[data-add-row]');
if (addRowBtn) {
    addRowBtn.addEventListener('click', () => {
        tableBody.appendChild(createRow('New Subject', 4));
    });
}
document.querySelector('[data-reset]').addEventListener('click', resetMarks);
const calcBtn = document.querySelector('[data-calculate]');
if (calcBtn) {
    calcBtn.addEventListener('click', () => {
        calculateGpa();

        // On calculator pages (science/management/see and other calculator pages),
        // scroll the result into view so users on small screens see the GPA.
        const resultEl = document.querySelector('.calculator-result');
        if (resultEl) {
            const offset = 130; // pixels to offset from top to prevent overlap from fixed header
            const target = resultEl.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: target, behavior: 'smooth' });
        }
    });
}

tableBody.addEventListener('input', () => {
    if (calculator.dataset.calculator !== 'science' && calculator.dataset.calculator !== 'management' && calculator.dataset.calculator !== 'see') {
        calculateGpa();
    }
});
tableBody.addEventListener('click', event => {
    if (event.target.matches('[data-remove]')) {
        event.target.closest('tr').remove();
        calculateGpa();
    }
});

// Compact subject search/filter for pages that include #subject-search
const subjectSearch = document.getElementById('subject-search');
if (subjectSearch) {
    subjectSearch.addEventListener('input', () => {
        const q = subjectSearch.value.trim().toLowerCase();
        tableBody.querySelectorAll('tr').forEach(row => {
            const subjCol = row.querySelector('.subject-col');
            let text = '';
            if (!subjCol) return;
            const input = subjCol.querySelector('input');
            text = (input ? input.value : subjCol.textContent || '').trim().toLowerCase();
            if (q === '' || text.includes(q)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


// Management: limit to max 4 optional subjects and re-render
if (calculator.dataset.calculator === 'management') {
    const optBoxes = document.querySelectorAll('.optional-subject-checkbox');
    optBoxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('.optional-subject-checkbox:checked');
            if (checked.length > 4) {
                cb.checked = false;
                return;
            }
            renderSubjects();
        });
    });
} else if (calculator.dataset.calculator === 'see') {
    // SEE has two optional subject dropdowns
    const seeOpt1 = document.getElementById('see-optional-1');
    const seeOpt2 = document.getElementById('see-optional-2');
    if (seeOpt1) seeOpt1.addEventListener('change', renderSubjects);
    if (seeOpt2) seeOpt2.addEventListener('change', renderSubjects);
} else {
    const optionalSelect = document.getElementById('optional-subject');
    if (optionalSelect) {
        optionalSelect.addEventListener('change', renderSubjects);
    }
}

renderSubjects();

