// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, update, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

// Initialize Firebase
let db = null;
try {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    window.db = db;
} catch (e) {
    console.log('Firebase not configured, using localStorage');
    window.db = null;
}

// Update booking status
async function confirmBooking(bookingId) {
    if (window.db) {
        const bookingRef = ref(window.db, `bookings/${bookingId}`);
        await update(bookingRef, { status: 'confirmed' });
    } else {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            bookings[index].status = 'confirmed';
            localStorage.setItem('bookings', JSON.stringify(bookings));
            loadBookings();
        }
    }
}

// Delete booking
async function deleteBooking(bookingId) {
    if (window.db) {
        const bookingRef = ref(window.db, `bookings/${bookingId}`);
        await remove(bookingRef);
    } else {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const filteredBookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(filteredBookings));
        loadBookings();
    }
}

// Load and display bookings
function loadBookings() {
    const pendingContainer = document.getElementById('pendingBookings');
    const confirmedContainer = document.getElementById('confirmedBookings');
    
    pendingContainer.innerHTML = '';
    confirmedContainer.innerHTML = '';

    if (window.db) {
        // Use Firebase
        const bookingsRef = ref(window.db, 'bookings');
        onValue(bookingsRef, (snapshot) => {
            const data = snapshot.val();
            const bookings = data ? Object.entries(data).map(([id, booking]) => ({ id, ...booking })) : [];
            displayBookings(bookings, pendingContainer, confirmedContainer);
        });
    } else {
        // Use localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        displayBookings(bookings, pendingContainer, confirmedContainer);
    }
}

// Display bookings
function displayBookings(bookings, pendingContainer, confirmedContainer) {
    const pending = bookings.filter(b => b.status === 'pending');
    const confirmed = bookings.filter(b => b.status === 'confirmed');

    if (pending.length === 0) {
        pendingContainer.innerHTML = '<p class="no-bookings">لا توجد حجوزات معلقة</p>';
    } else {
        pendingContainer.innerHTML = pending.map(booking => `
            <div class="booking-card">
                <div class="booking-info">
                    <p><strong>اسم المريض:</strong> ${booking.patientName}</p>
                    <p><strong>رقم التليفون:</strong> ${booking.phone}</p>
                    <p><strong>الدكتور:</strong> ${booking.doctorName}</p>
                    <p><strong>القسم:</strong> ${booking.department}</p>
                    <p><strong>الميعاد:</strong> ${booking.time}</p>
                    <p><strong>تاريخ الحجز:</strong> ${booking.bookingDate || (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ar-EG') : '-')}</p>
                    <p><strong>وقت الحجز:</strong> ${booking.bookingTime || (booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-')}</p>
                </div>
                <div class="booking-actions">
                    <button class="btn-confirm" onclick="confirmBooking('${booking.id}')">تأكيد الحجز</button>
                    <button class="btn-delete" onclick="deleteBooking('${booking.id}')">حذف</button>
                </div>
            </div>
        `).join('');
    }

    if (confirmed.length === 0) {
        confirmedContainer.innerHTML = '<p class="no-bookings">لا توجد حجوزات مؤكدة</p>';
    } else {
        confirmedContainer.innerHTML = confirmed.map(booking => `
            <div class="booking-card confirmed">
                <div class="booking-info">
                    <p><strong>اسم المريض:</strong> ${booking.patientName}</p>
                    <p><strong>رقم التليفون:</strong> ${booking.phone}</p>
                    <p><strong>الدكتور:</strong> ${booking.doctorName}</p>
                    <p><strong>القسم:</strong> ${booking.department}</p>
                    <p><strong>الميعاد:</strong> ${booking.time}</p>
                    <p><strong>تاريخ الحجز:</strong> ${booking.bookingDate || (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ar-EG') : '-')}</p>
                    <p><strong>وقت الحجز:</strong> ${booking.bookingTime || (booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-')}</p>
                </div>
                <div class="booking-actions">
                    <span class="status-badge">مؤكد</span>
                    <button class="btn-delete" onclick="deleteBooking('${booking.id}')">حذف</button>
                </div>
            </div>
        `).join('');
    }
}

// Make functions available globally
window.confirmBooking = confirmBooking;
window.deleteBooking = deleteBooking;

// Load bookings on page load
document.addEventListener('DOMContentLoaded', loadBookings);
