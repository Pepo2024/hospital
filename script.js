// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, set, onValue, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAxWPB9nJCHjyOK4AO1BNsALlyG18Vr3Hs",
    authDomain: "hospital-5d143.firebaseapp.com",
    databaseURL: "https://hospital-5d143-default-rtdb.firebaseio.com",
    projectId: "hospital-5d143",
    storageBucket: "hospital-5d143.firebasestorage.app",
    messagingSenderId: "813685480472",
    appId: "1:813685480472:web:60fe6b3b2f5ed34c4ef76d"
};

// Initialize Firebase (استخدم localStorage كبديل إذا لم يكن Firebase متاحاً)
let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    window.db = db;
} catch (e) {
    console.log('Firebase not configured, using localStorage');
    window.db = null;
}

// Doctors data with time slots
const doctorsData = {
    internal: [
        { 
            id: 'abanob_internal',
            name: "د. أبانوب عياد", 
            specialization: "استشاري أمراض الباطنة والجهاز الهضمي",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'catherine_internal',
            name: "د. كاترين مينا", 
            specialization: "استشاري أمراض القلب",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'kyrilos_internal',
            name: "د. كيرلس صليب", 
            specialization: "استشاري أمراض الصدر",
            timeRange: "من 9 إلى 12"
        }
    ],
    eyes: [
        { 
            id: 'abanob_eyes',
            name: "د. أبانوب عياد", 
            specialization: "استشاري طب وجراحة العيون",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'catherine_eyes',
            name: "د. كاترين مينا", 
            specialization: "استشاري شبكية العين",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'kyrilos_eyes',
            name: "د. كيرلس صليب", 
            specialization: "استشاري جراحة القرنية",
            timeRange: "من 9 إلى 12"
        }
    ],
    ent: [
        { 
            id: 'abanob_ent',
            name: "د. أبانوب عياد", 
            specialization: "استشاري أنف وأذن وحنجرة",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'catherine_ent',
            name: "د. كاترين مينا", 
            specialization: "استشاري جراحة الأنف والجيوب الأنفية",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'kyrilos_ent',
            name: "د. كيرلس صليب", 
            specialization: "استشاري جراحة الأذن",
            timeRange: "من 9 إلى 12"
        }
    ],
    orthopedics: [
        { 
            id: 'abanob_orthopedics',
            name: "د. أبانوب عياد", 
            specialization: "استشاري جراحة العظام والمفاصل",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'catherine_orthopedics',
            name: "د. كاترين مينا", 
            specialization: "استشاري جراحة اليد والكتف",
            timeRange: "من 9 إلى 12"
        },
        { 
            id: 'kyrilos_orthopedics',
            name: "د. كيرلس صليب", 
            specialization: "استشاري جراحة العمود الفقري",
            timeRange: "من 9 إلى 12"
        }
    ]
};

// Save booking to Firebase or localStorage
async function saveBooking(bookingData) {
    if (window.db) {
        // Use Firebase
        const bookingsRef = ref(window.db, 'bookings');
        const newBookingRef = push(bookingsRef);
        await set(newBookingRef, {
            ...bookingData,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        return newBookingRef.key;
    } else {
        // Use localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const newBooking = {
            id: Date.now().toString(),
            ...bookingData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        bookings.push(newBooking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return newBooking.id;
    }
}

// Get all bookings
function getBookings(callback) {
    if (window.db) {
        const bookingsRef = ref(window.db, 'bookings');
        onValue(bookingsRef, (snapshot) => {
            const data = snapshot.val();
            const bookings = data ? Object.entries(data).map(([id, booking]) => ({ id, ...booking })) : [];
            callback(bookings);
        });
    } else {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        callback(bookings);
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    if (window.db) {
        const bookingRef = ref(window.db, `bookings/${bookingId}`);
        await update(bookingRef, { status });
    } else {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = status;
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
    }
}

// Function to show doctors page
function showDoctorsPage(department) {
    const doctors = doctorsData[department];
    if (!doctors) return;

    const departmentNames = {
        internal: "قسم الباطنة",
        eyes: "قسم العيون",
        ent: "قسم الأنف والأذن",
        orthopedics: "قسم العظام"
    };

    const doctorsHTML = `
        <div class="doctors-page">
            <button class="back-btn" onclick="goBack()">← العودة للصفحة الرئيسية</button>
            <h2>${departmentNames[department]}</h2>
            <div class="doctors-list">
                ${doctors.map(doctor => `
                    <div class="doctor-card">
                        <h3>${doctor.name}</h3>
                        <p class="time-range">${doctor.timeRange}</p>
                        <p>${doctor.specialization}</p>
                        <button class="btn-book" onclick="showBookingForm('${department}', '${doctor.id}')">احجز موعد</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.querySelector('.main-content .container').innerHTML = doctorsHTML;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show booking form
function showBookingForm(department, doctorId) {
    const doctor = doctorsData[department].find(d => d.id === doctorId);
    if (!doctor) return;

    const departmentNames = {
        internal: "قسم الباطنة",
        eyes: "قسم العيون",
        ent: "قسم الأنف والأذن",
        orthopedics: "قسم العظام"
    };

    const formHTML = `
        <div class="booking-page">
            <button class="back-btn" onclick="showDoctorsPage('${department}')">← العودة</button>
            <h2>حجز موعد - ${doctor.name}</h2>
            <p class="doctor-spec">${doctor.specialization}</p>
            <p class="doctor-time">الميعاد: ${doctor.timeRange}</p>
            <p class="dept-name">${departmentNames[department]}</p>
            
            <form class="booking-form" onsubmit="handleBooking(event, '${department}', '${doctorId}')">
                <div class="form-group">
                    <label>اسم المريض:</label>
                    <input type="text" name="patientName" required>
                </div>
                
                <div class="form-group">
                    <label>رقم التليفون:</label>
                    <input type="tel" name="phone" required>
                </div>
                
                <button type="submit" class="btn-submit">تأكيد الحجز</button>
            </form>
        </div>
    `;

    document.querySelector('.main-content .container').innerHTML = formHTML;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle booking submission
async function handleBooking(event, department, doctorId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const doctor = doctorsData[department].find(d => d.id === doctorId);
    const departmentNames = {
        internal: "قسم الباطنة",
        eyes: "قسم العيون",
        ent: "قسم الأنف والأذن",
        orthopedics: "قسم العظام"
    };

    const now = new Date();
    const bookingData = {
        patientName: formData.get('patientName'),
        phone: formData.get('phone'),
        time: doctor.timeRange,
        doctorName: doctor.name,
        doctorId: doctorId,
        department: departmentNames[department],
        bookingDate: now.toLocaleDateString('ar-EG'),
        bookingTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    try {
        await saveBooking(bookingData);
        alert('تم الحجز بنجاح! سيتم التواصل معك قريباً.');
        showDoctorsPage(department);
    } catch (error) {
        alert('حدث خطأ أثناء الحجز. حاول مرة أخرى.');
        console.error(error);
    }
}

// Function to go back to main page
function goBack() {
    location.reload();
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const departmentCards = document.querySelectorAll('.department-card');
    const viewButtons = document.querySelectorAll('.btn-view');

    departmentCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('btn-view')) {
                const department = this.getAttribute('data-department');
                showDoctorsPage(department);
            }
        });
    });

    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.department-card');
            const department = card.getAttribute('data-department');
            showDoctorsPage(department);
        });
    });
});

// Make functions available globally
window.showDoctorsPage = showDoctorsPage;
window.showBookingForm = showBookingForm;
window.handleBooking = handleBooking;
window.getBookings = getBookings;
window.updateBookingStatus = updateBookingStatus;
window.goBack = goBack;
