// ===== تنظیمات اولیه =====
let currentTheme = localStorage.getItem('theme') || 'light';

// ===== راه‌اندازی =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadTodayDate();
    setupEventListeners();
    setupExamples();
});

// ===== مقداردهی اولیه =====
function initializeApp() {
    setTheme(currentTheme);
    animateElements();
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

// ===== انیمیشن المان‌ها =====
function animateElements() {
    const elements = document.querySelectorAll('.animate-title, .animate-input, .animate-select, .convert-btn');
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.15}s`;
    });
}

// ===== رویدادها =====
function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    const convertBtn = document.getElementById('convert-btn');
    const swapBtn = document.getElementById('swap-btn');
    const inputNumber = document.getElementById('input-number');
    
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (convertBtn) convertBtn.addEventListener('click', convertDate);
    if (swapBtn) swapBtn.addEventListener('click', swapDates);
    
    if (inputNumber) {
        inputNumber.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.keyCode);
            if (!/[0-9-]/.test(char) && e.key !== 'Enter') {
                e.preventDefault();
            }
        });
        
        inputNumber.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                convertDate();
            }
        });
        
        inputNumber.addEventListener('input', function(e) {
            let value = e.target.value;
            value = value.replace(/[^\d-]/g, '');
            e.target.value = value;
        });
    }
}

// ===== تنظیم نمونه‌های سریع =====
function setupExamples() {
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const example = this.dataset.example;
            document.getElementById('input-number').value = example;
            convertDate();
            
            this.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });
}

// ===== تغییر تم =====
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
    
    const toggleBtn = document.getElementById('theme-toggle');
    toggleBtn.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => {
        toggleBtn.style.transform = '';
    }, 500);
}

// ===== سوآپ تاریخ مبدا و مقصد =====
function swapDates() {
    const fromSelect = document.getElementById('from-type');
    const toSelect = document.getElementById('to-type');
    
    const fromValue = fromSelect.value;
    const toValue = toSelect.value;
    
    fromSelect.value = toValue;
    toSelect.value = fromValue;
    
    const swapIcon = document.querySelector('#swap-btn i');
    swapIcon.style.transform = 'rotate(360deg) scale(1.3)';
    swapIcon.style.color = 'white';
    
    setTimeout(() => {
        swapIcon.style.transform = '';
        swapIcon.style.color = '';
    }, 600);
    
    if (document.getElementById('input-number').value) {
        convertDate();
    }
}

// ===== بارگذاری تاریخ امروز =====
function loadTodayDate() {
    const today = new Date();
    
    try {
        const jDate = jalaali.toJalaali(today);
        const shamsiToday = `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
        const miladiToday = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
        
        document.getElementById('today-shamsi').textContent = shamsiToday;
        document.getElementById('today-miladi').textContent = miladiToday;
    } catch (error) {
        console.error('خطا در دریافت تاریخ امروز:', error);
    }
}

// ===== تابع اصلی تبدیل تاریخ =====
function convertDate() {
    const inputNumber = document.getElementById('input-number').value.trim();
    const fromType = document.getElementById('from-type').value;
    const toType = document.getElementById('to-type').value;
    
    if (!inputNumber) {
        showResult('لطفاً یک تاریخ وارد کنید', true);
        shakeElement(document.getElementById('input-number'));
        return;
    }
    
    const convertBtn = document.getElementById('convert-btn');
    convertBtn.classList.add('loading');
    
    setTimeout(() => {
        try {
            const dateParts = parseInputDate(inputNumber);
            
            if (!dateParts) {
                showResult('❌ فرمت تاریخ نامعتبر است', true);
                convertBtn.classList.remove('loading');
                return;
            }
            
            const miladiDate = convertToMiladi(dateParts, fromType);
            
            if (!miladiDate || isNaN(miladiDate.getTime())) {
                showResult('❌ تاریخ وارد شده معتبر نیست', true);
                convertBtn.classList.remove('loading');
                return;
            }
            
            const result = convertFromMiladi(miladiDate, toType);
            
            if (result) {
                showResult(result, false);
                animateResult();
            } else {
                showResult('❌ خطا در تبدیل تاریخ', true);
            }
            
        } catch (error) {
            console.error('خطا:', error);
            showResult('❌ خطای غیرمنتظره رخ داد', true);
        } finally {
            convertBtn.classList.remove('loading');
        }
    }, 300);
}

// ===== پارس کردن تاریخ ورودی =====
function parseInputDate(input) {
    input = input.trim().replace(/[\\/_]/g, '-');
    
    let parts = input.split('-').map(part => part.trim());
    
    if (parts.length !== 3) {
        parts = input.split(' ').join('').split('-');
        if (parts.length !== 3) return null;
    }
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    
    return { year, month, day };
}

// ===== تبدیل به میلادی =====
function convertToMiladi(dateParts, fromType) {
    try {
        switch (fromType) {
            case 'shamsi':
                return convertShamsiToMiladi(dateParts);
            case 'miladi':
                return new Date(dateParts.year, dateParts.month - 1, dateParts.day);
            case 'ghamari':
                return convertGhamariToMiladi(dateParts);
            case 'julian':
                return convertJulianToMiladi(dateParts);
            default:
                return null;
        }
    } catch (error) {
        return null;
    }
}

// ===== تبدیل شمسی به میلادی =====
function convertShamsiToMiladi(dateParts) {
    try {
        if (dateParts.year < 1200 || dateParts.year > 1500) return null;
        if (dateParts.month < 1 || dateParts.month > 12) return null;
        if (dateParts.day < 1 || dateParts.day > 31) return null;
        
        const miladi = jalaali.toGregorian(dateParts.year, dateParts.month, dateParts.day);
        return new Date(miladi.gy, miladi.gm - 1, miladi.gd);
    } catch (error) {
        return null;
    }
}

// ===== تبدیل قمری به میلادی (تقریبی) =====
function convertGhamariToMiladi(dateParts) {
    try {
        if (dateParts.year < 1300 || dateParts.year > 1500) return null;
        
        const hijriYear = dateParts.year;
        const hijriMonth = dateParts.month - 1;
        const hijriDay = dateParts.day;
        
        const startDate = new Date(622, 6, 16);
        const daysSinceHijra = (hijriYear - 1) * 354.367 + 
                              (hijriMonth) * 29.530589 + 
                              hijriDay - 1;
        
        return new Date(startDate.getTime() + daysSinceHijra * 24 * 60 * 60 * 1000);
    } catch (error) {
        return null;
    }
}

// ===== تبدیل ژولین به میلادی =====
function convertJulianToMiladi(dateParts) {
    try {
        let year = dateParts.year;
        let month = dateParts.month;
        let day = dateParts.day;
        
        if (year < 1000 || year > 3000) return null;
        
        if (month < 3) {
            year -= 1;
            month += 12;
        }
        
        const a = Math.floor(year / 100);
        const b = Math.floor(a / 4);
        const c = 2 - a + b;
        
        const d = Math.floor(365.25 * (year + 4716));
        const e = Math.floor(30.6001 * (month + 1));
        
        const julianDay = d + e + day + c - 1524.5;
        const jd = julianDay + 0.5;
        const z = Math.floor(jd);
        const f = jd - z;
        
        let alpha = Math.floor((z - 1867216.25) / 36524.25);
        const a2 = z + 1 + alpha - Math.floor(alpha / 4);
        const b2 = a2 + 1524;
        const c2 = Math.floor((b2 - 122.1) / 365.25);
        const d2 = Math.floor(365.25 * c2);
        const e2 = Math.floor((b2 - d2) / 30.6001);
        
        const day2 = b2 - d2 - Math.floor(30.6001 * e2) + f;
        const month2 = e2 < 14 ? e2 - 1 : e2 - 13;
        const year2 = month2 > 2 ? c2 - 4716 : c2 - 4715;
        
        return new Date(year2, month2 - 1, Math.floor(day2));
    } catch (error) {
        return null;
    }
}

// ===== تبدیل از میلادی =====
function convertFromMiladi(miladiDate, toType) {
    try {
        switch (toType) {
            case 'shamsi':
                return convertMiladiToShamsi(miladiDate);
            case 'miladi':
                return convertMiladiToString(miladiDate);
            case 'ghamari':
                return convertMiladiToGhamari(miladiDate);
            case 'julian':
                return convertMiladiToJulian(miladiDate);
            default:
                return null;
        }
    } catch (error) {
        return null;
    }
}

// ===== تبدیل میلادی به شمسی =====
function convertMiladiToShamsi(miladiDate) {
    try {
        const jDate = jalaali.toJalaali(
            miladiDate.getFullYear(),
            miladiDate.getMonth() + 1,
            miladiDate.getDate()
        );
        
        return `${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`;
    } catch (error) {
        return null;
    }
}

// ===== تبدیل میلادی به استرینگ =====
function convertMiladiToString(miladiDate) {
    return `${miladiDate.getFullYear()}/${String(miladiDate.getMonth() + 1).padStart(2, '0')}/${String(miladiDate.getDate()).padStart(2, '0')}`;
}

// ===== تبدیل میلادی به قمری (تقریبی) =====
function convertMiladiToGhamari(miladiDate) {
    try {
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
        
        return `${hijriYear}/${String(hijriMonth).padStart(2, '0')}/${String(hijriDay).padStart(2, '0')}`;
    } catch (error) {
        return null;
    }
}

// ===== تبدیل میلادی به ژولین =====
function convertMiladiToJulian(miladiDate) {
    try {
        const year = miladiDate.getFullYear();
        const month = miladiDate.getMonth() + 1;
        const day = miladiDate.getDate();
        
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        
        let julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
                        Math.floor(y / 4) - Math.floor(y / 100) + 
                        Math.floor(y / 400) - 32045;
        
        const b = julianDay + 1524;
        const c = Math.floor((b - 122.1) / 365.25);
        const d = Math.floor(365.25 * c);
        const e = Math.floor((b - d) / 30.6001);
        
        const day2 = b - d - Math.floor(30.6001 * e);
        const month2 = e < 14 ? e - 1 : e - 13;
        const year2 = month2 > 2 ? c - 4716 : c - 4715;
        
        return `${year2}/${String(month2).padStart(2, '0')}/${String(day2).padStart(2, '0')}`;
    } catch (error) {
        return null;
    }
}

// ===== نمایش نتیجه =====
function showResult(text, isError = false) {
    const resultElement = document.getElementById('result-value');
    const resultCard = document.querySelector('.result-card');
    
    if (isError) {
        resultCard.style.background = 'linear-gradient(145deg, #f56565, #c53030)';
        resultElement.style.color = 'white';
    } else {
        resultCard.style.background = 'var(--primary-gradient)';
        resultElement.style.color = 'white';
    }
    
    resultElement.innerHTML = text;
}

// ===== انیمیشن نتیجه =====
function animateResult() {
    const resultSection = document.getElementById('result-section');
    resultSection.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
        resultSection.style.transform = 'scale(1)';
    }, 300);
}

// ===== لرزاندن المان =====
function shakeElement(element) {
    if (!element) return;
    
    element.classList.add('error-shake');
    setTimeout(() => {
        element.classList.remove('error-shake');
    }, 500);
}

// ===== نمایش پیام =====
function showMessage(message, type = 'info') {
    console.log(`${type}: ${message}`);
}

// ===== اعتبارسنجی تاریخ =====
function isValidDate(year, month, day) {
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (month === 2) {
        const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        return isLeap ? day <= 29 : day <= 28;
    }
    
    return day <= daysInMonth[month - 1];
}

// ===== ذخیره آخرین تبدیل =====
function saveLastConversion(from, to, input, result) {
    const lastConversion = {
        from,
        to,
        input,
        result,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('lastConversion', JSON.stringify(lastConversion));
}

// ===== بارگذاری آخرین تبدیل =====
function loadLastConversion() {
    try {
        const last = localStorage.getItem('lastConversion');
        if (last) {
            const data = JSON.parse(last);
            console.log('آخرین تبدیل:', data);
        }
    } catch (error) {
        console.error('خطا در بارگذاری آخرین تبدیل:', error);
    }
}
