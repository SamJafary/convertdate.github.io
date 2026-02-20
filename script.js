// ===== تنظیمات اولیه =====
let currentTheme = localStorage.getItem('theme') || 'light';

// ===== دیتابیس ماه‌ها =====
const MONTHS = {
    shamsi: [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ],
    miladi: [
        'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
        'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
    ],
    ghamari: [
        'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'
    ],
    julian: [
        'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
        'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
    ]
};

// ===== اعتبارسنجی سال =====
const YEAR_VALIDATION = {
    shamsi: { min: 1200, max: 1500, message: 'سال شمسی باید بین ۱۲۰۰ تا ۱۵۰۰ باشد' },
    miladi: { min: 1800, max: 2100, message: 'سال میلادی باید بین ۱۸۰۰ تا ۲۱۰۰ باشد' },
    ghamari: { min: 1300, max: 1500, message: 'سال قمری باید بین ۱۳۰۰ تا ۱۵۰۰ باشد' },
    julian: { min: 1800, max: 2100, message: 'سال ژولین باید بین ۱۸۰۰ تا ۲۱۰۰ باشد' }
};

// ===== ماه‌های انگلیسی برای نمایش =====
const englishMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// ===== راه‌اندازی =====
document.addEventListener('DOMContentLoaded', function() {
    setTheme(currentTheme);
    initializeMonthSelector('shamsi');
    loadTodayDate();
    setupEventListeners();
    updateDays();
    setupCopyListeners();
    
    // فعال کردن آیکون‌ها
    const icons = document.querySelectorAll('.icon-circle');
    icons.forEach((icon, index) => {
        icon.style.transition = 'all 0.3s ease';
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'translateY(-3px) scale(1.05)';
        });
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// ===== مقداردهی اولیه سلکتور ماه =====
function initializeMonthSelector(calendarType) {
    const monthSelect = document.getElementById('month-select');
    monthSelect.innerHTML = '<option value="">انتخاب ماه</option>';
    
    const months = MONTHS[calendarType] || MONTHS.shamsi;
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    const today = new Date();
    if (calendarType === 'shamsi') {
        const jDate = jalaali.toJalaali(today);
        monthSelect.value = jDate.jm;
    } else {
        monthSelect.value = today.getMonth() + 1;
    }
}

// ===== بروزرسانی روزها =====
function updateDays() {
    const calendarType = document.getElementById('from-type').value;
    const year = parseInt(document.getElementById('year-input').value) || 1402;
    const month = parseInt(document.getElementById('month-select').value) || 1;
    const daySelect = document.getElementById('day-select');
    const currentDay = daySelect.value;
    
    let daysInMonth = 31;
    
    if (calendarType === 'shamsi') {
        if (month <= 6) daysInMonth = 31;
        else if (month <= 11) daysInMonth = 30;
        else daysInMonth = jalaali.isLeapJalaaliYear(year) ? 30 : 29;
    } else {
        daysInMonth = new Date(year, month, 0).getDate();
    }
    
    daySelect.innerHTML = '<option value="">انتخاب روز</option>';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }
    
    if (currentDay && parseInt(currentDay) <= daysInMonth) {
        daySelect.value = currentDay;
    }
}

// ===== اعتبارسنجی سال =====
function validateYear(year, calendarType) {
    const validation = YEAR_VALIDATION[calendarType];
    if (!validation) return true;
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return false;
    return yearNum >= validation.min && yearNum <= validation.max;
}

// ===== نمایش هشدار سال =====
function showYearWarning(message) {
    const warningEl = document.getElementById('year-warning');
    if (warningEl) {
        warningEl.style.display = 'flex';
        warningEl.querySelector('span').textContent = message;
    }
}

function hideYearWarning() {
    const warningEl = document.getElementById('year-warning');
    if (warningEl) {
        warningEl.style.display = 'none';
    }
}

function validateAndWarnYear() {
    const year = document.getElementById('year-input').value;
    const calendarType = document.getElementById('from-type').value;
    
    if (!year) {
        showYearWarning('لطفاً سال را وارد کنید');
        return false;
    }
    
    if (!validateYear(year, calendarType)) {
        const validation = YEAR_VALIDATION[calendarType];
        showYearWarning(validation.message);
        return false;
    }
    
    hideYearWarning();
    return true;
}

// ===== تنظیم تم =====
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
}

// ===== تاریخ امروز =====
function loadTodayDate() {
    const today = new Date();
    try {
        const jDate = jalaali.toJalaali(today);
        document.getElementById('today-shamsi').textContent = 
            `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
        document.getElementById('today-miladi').textContent = 
            `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
    } catch (e) {
        console.log(e);
    }
}

// ===== رویدادها =====
function setupEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('convert-btn').addEventListener('click', convertDate);
    document.getElementById('swap-btn').addEventListener('click', swapDates);
    
    document.getElementById('from-type').addEventListener('change', function() {
        initializeMonthSelector(this.value);
        updateDays();
        validateAndWarnYear();
    });
    
    document.getElementById('year-input').addEventListener('input', function() {
        updateDays();
        validateAndWarnYear();
    });
    
    document.getElementById('month-select').addEventListener('change', updateDays);
    document.getElementById('year-input').addEventListener('blur', validateAndWarnYear);
    
    // اینتر در فیلد سال
    document.getElementById('year-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') convertDate();
    });
}

// ===== رویدادهای کپی =====
function setupCopyListeners() {
    const copyNumeric = document.getElementById('copy-numeric');
    const copyText = document.getElementById('copy-text');
    
    if (copyNumeric) {
        copyNumeric.addEventListener('click', function() {
            const text = document.getElementById('numeric-value').innerText;
            if (!text.includes('----')) {
                navigator.clipboard.writeText(text).then(() => {
                    const hint = this.querySelector('.copy-hint');
                    const originalText = hint.innerHTML;
                    hint.innerHTML = '<i class="fas fa-check"></i> کپی شد!';
                    setTimeout(() => {
                        hint.innerHTML = originalText;
                    }, 1500);
                });
            }
        });
    }
    
    if (copyText) {
        copyText.addEventListener('click', function() {
            const textFa = document.getElementById('text-value-fa').innerText;
            const textEn = document.getElementById('text-value-en').innerText;
            if (!textFa.includes('---') && !textEn.includes('---') && !textFa.includes('❌')) {
                const fullText = `${textFa}\n${textEn}`;
                navigator.clipboard.writeText(fullText).then(() => {
                    const hint = this.querySelector('.copy-hint');
                    const originalText = hint.innerHTML;
                    hint.innerHTML = '<i class="fas fa-check"></i> کپی شد!';
                    setTimeout(() => {
                        hint.innerHTML = originalText;
                    }, 1500);
                });
            }
        });
    }
}

// ===== سوآپ تاریخ =====
function swapDates() {
    const fromSelect = document.getElementById('from-type');
    const toSelect = document.getElementById('to-type');
    [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
    
    const swapIcon = document.querySelector('#swap-btn i');
    swapIcon.style.transform = 'rotate(180deg)';
    setTimeout(() => swapIcon.style.transform = '', 200);
    
    initializeMonthSelector(fromSelect.value);
    updateDays();
    if (document.getElementById('year-input').value) convertDate();
}

// ===== گرفتن تاریخ از ورودی‌ها =====
function getSelectedDate() {
    const year = document.getElementById('year-input').value;
    const month = document.getElementById('month-select').value;
    const day = document.getElementById('day-select').value;
    return (!year || !month || !day) ? null : { 
        year: parseInt(year), month: parseInt(month), day: parseInt(day) 
    };
}

// ===== تبدیل تاریخ جدید =====
function convertDate() {
    const date = getSelectedDate();
    if (!date) {
        document.getElementById('numeric-value').innerHTML = '----/--/--';
        document.getElementById('text-value-fa').innerHTML = '--- --- ----';
        document.getElementById('text-value-en').innerHTML = '--- --- ----';
        return;
    }
    
    try {
        const fromType = document.getElementById('from-type').value;
        const toType = document.getElementById('to-type').value;
        
        let miladiDate;
        
        if (fromType === 'miladi') {
            miladiDate = new Date(date.year, date.month - 1, date.day);
        } else if (fromType === 'shamsi') {
            const g = jalaali.toGregorian(date.year, date.month, date.day);
            miladiDate = new Date(g.gy, g.gm - 1, g.gd);
        } else {
            miladiDate = new Date(date.year, date.month - 1, date.day);
        }
        
        const numericValue = document.getElementById('numeric-value');
        const textFa = document.getElementById('text-value-fa');
        const textEn = document.getElementById('text-value-en');
        
        if (toType === 'miladi') {
            const y = miladiDate.getFullYear();
            const m = miladiDate.getMonth() + 1;
            const d = miladiDate.getDate();
            
            numericValue.innerHTML = `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`;
            textFa.innerHTML = `${d} ${MONTHS.miladi[m-1] || ''} ${y}`;
            textEn.innerHTML = `${englishMonths[m-1] || ''} ${d}, ${y}`;
            
        } else if (toType === 'shamsi') {
            const j = jalaali.toJalaali(miladiDate);
            
            numericValue.innerHTML = `${j.jy}/${String(j.jm).padStart(2,'0')}/${String(j.jd).padStart(2,'0')}`;
            textFa.innerHTML = `${j.jd} ${MONTHS.shamsi[j.jm-1] || ''} ${j.jy}`;
            textEn.innerHTML = `${englishMonths[j.jm-1] || ''} ${j.jd}, ${j.jy}`;
            
        } else {
            numericValue.innerHTML = '----/--/--';
            textFa.innerHTML = '🚧 به زودی';
            textEn.innerHTML = '🚧 Coming soon';
        }
        
    } catch (error) {
        console.error(error);
        document.getElementById('numeric-value').innerHTML = '----/--/--';
        document.getElementById('text-value-fa').innerHTML = '❌ خطا';
        document.getElementById('text-value-en').innerHTML = '❌ Error';
    }
}
