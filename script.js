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
    } else if (calendarType === 'miladi' || calendarType === 'julian') {
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
        if (month <= 6) {
            daysInMonth = 31;
        } else if (month <= 11) {
            daysInMonth = 30;
        } else {
            daysInMonth = jalaali.isLeapJalaaliYear(year) ? 30 : 29;
        }
    } else if (calendarType === 'miladi' || calendarType === 'julian') {
        daysInMonth = new Date(year, month, 0).getDate();
    } else if (calendarType === 'ghamari') {
        const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
        daysInMonth = monthLengths[month - 1] || 30;
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
    warningEl.style.display = 'flex';
    warningEl.querySelector('span').textContent = message;
}

function hideYearWarning() {
    document.getElementById('year-warning').style.display = 'none';
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
}

// ===== سوآپ تاریخ =====
function swapDates() {
    const fromSelect = document.getElementById('from-type');
    const toSelect = document.getElementById('to-type');
    
    [fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
    
    const swapIcon = document.querySelector('#swap-btn i');
    swapIcon.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => { swapIcon.style.transform = ''; }, 500);
    
    initializeMonthSelector(fromSelect.value);
    updateDays();
    validateAndWarnYear();
    
    if (document.getElementById('year-input').value) {
        convertDate();
    }
}

// ===== گرفتن تاریخ از ورودی‌ها =====
function getSelectedDate() {
    const year = document.getElementById('year-input').value;
    const month = document.getElementById('month-select').value;
    const day = document.getElementById('day-select').value;
    
    if (!year || !month || !day) {
        return null;
    }
    
    return { 
        year: parseInt(year), 
        month: parseInt(month), 
        day: parseInt(day) 
    };
}

// ===== تبدیل تاریخ =====
function convertDate() {
    // اعتبارسنجی سال
    if (!validateAndWarnYear()) {
        document.getElementById('result-value-fa').innerHTML = '❌ سال معتبر وارد کنید';
        document.getElementById('result-value-en').innerHTML = '❌ Invalid year';
        document.getElementById('result-value-num').innerHTML = '--/--/----';
        return;
    }
    
    const date = getSelectedDate();
    const fromType = document.getElementById('from-type').value;
    const toType = document.getElementById('to-type').value;
    
    if (!date) {
        document.getElementById('result-value-fa').innerHTML = '❌ لطفاً تاریخ را کامل کنید';
        document.getElementById('result-value-en').innerHTML = '❌ Please complete the date';
        document.getElementById('result-value-num').innerHTML = '--/--/----';
        return;
    }
    
    try {
        let miladiDate;
        
        // تبدیل به میلادی
        if (fromType === 'miladi') {
            miladiDate = new Date(date.year, date.month - 1, date.day);
        } else if (fromType === 'shamsi') {
            const g = jalaali.toGregorian(date.year, date.month, date.day);
            miladiDate = new Date(g.gy, g.gm - 1, g.gd);
        } else if (fromType === 'ghamari') {
            // تبدیل تقریبی قمری به میلادی
            const startDate = new Date(622, 6, 16);
            const daysSinceHijra = (date.year - 1) * 354.367 + (date.month - 1) * 29.530589 + date.day - 1;
            miladiDate = new Date(startDate.getTime() + daysSinceHijra * 24 * 60 * 60 * 1000);
        } else if (fromType === 'julian') {
            miladiDate = new Date(date.year, date.month - 1, date.day);
        } else {
            document.getElementById('result-value-fa').innerHTML = '🔧 به زودی...';
            document.getElementById('result-value-en').innerHTML = '🔧 Coming soon...';
            document.getElementById('result-value-num').innerHTML = '--/--/----';
            return;
        }
        
        // ===== نمایش نتیجه سه خطی =====
        const resultFa = document.getElementById('result-value-fa');
        const resultEn = document.getElementById('result-value-en');
        const resultNum = document.getElementById('result-value-num');
        
        // تبدیل به خروجی
        if (toType === 'miladi') {
            const year = miladiDate.getFullYear();
            const month = miladiDate.getMonth() + 1;
            const day = miladiDate.getDate();
            
            // فارسی کامل
            resultFa.innerHTML = `${day} ${MONTHS.miladi[month-1]} ${year}`;
            // انگلیسی
            resultEn.innerHTML = `${englishMonths[month-1]} ${day}, ${year}`;
            // عددی
            resultNum.innerHTML = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
            
        } else if (toType === 'shamsi') {
            const j = jalaali.toJalaali(miladiDate);
            
            // فارسی کامل
            resultFa.innerHTML = `${j.jd} ${MONTHS.shamsi[j.jm-1]} ${j.jy}`;
            // انگلیسی
            resultEn.innerHTML = `${englishMonths[j.jm-1]} ${j.jd}, ${j.jy}`;
            // عددی
            resultNum.innerHTML = `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
            
        } else if (toType === 'ghamari') {
            // تبدیل تقریبی میلادی به قمری
            const startDate = new Date(622, 6, 16);
            const daysDiff = Math.floor((miladiDate - startDate) / (24 * 60 * 60 * 1000));
            let hijriYear = Math.floor(daysDiff / 354.367) + 1;
            let remainingDays = daysDiff % 354.367;
            let hijriDay = Math.floor(remainingDays) + 1;
            let hijriMonth = 1;
            
            const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
            for (let i = 0; i < monthLengths.length; i++) {
                if (hijriDay <= monthLengths[i]) {
                    hijriMonth = i + 1;
                    break;
                }
                hijriDay -= monthLengths[i];
            }
            
            // فارسی کامل
            resultFa.innerHTML = `${hijriDay} ${MONTHS.ghamari[hijriMonth-1]} ${hijriYear}`;
            // انگلیسی
            resultEn.innerHTML = `${englishMonths[hijriMonth-1]} ${hijriDay}, ${hijriYear}`;
            // عددی
            resultNum.innerHTML = `${hijriYear}/${String(hijriMonth).padStart(2, '0')}/${String(hijriDay).padStart(2, '0')}`;
            
        } else if (toType === 'julian') {
            const year = miladiDate.getFullYear();
            const month = miladiDate.getMonth() + 1;
            const day = miladiDate.getDate();
            
            // فارسی کامل
            resultFa.innerHTML = `${day} ${MONTHS.julian[month-1]} ${year}`;
            // انگلیسی
            resultEn.innerHTML = `${englishMonths[month-1]} ${day}, ${year}`;
            // عددی
            resultNum.innerHTML = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        }
        
    } catch (error) {
        document.getElementById('result-value-fa').innerHTML = '❌ خطا در تبدیل';
        document.getElementById('result-value-en').innerHTML = '❌ Conversion error';
        document.getElementById('result-value-num').innerHTML = '--/--/----';
        console.error(error);
    }
}
