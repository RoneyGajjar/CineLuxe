// --- Mock Movie Database ---
const mockMovies = [
    {
        id: 1022789,
        title: "Dune: Part Two",
        overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
        poster_path: "https://image.tmdb.org/t/p/w500/1jwo11yYvLMQJjA15rWe9QWPnPY.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        genres: [{ name: 'Sci-Fi' }, { name: 'Adventure' }],
        runtime: 166,
        vote_average: 8.3,
        release_date: "2024-02-27",
        price: { silver: 250, gold: 350, platinum: 450 } // NEW Price Object
    },
    {
        id: 1011985,
        title: "Kung Fu Panda 4",
        overview: "Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.",
        poster_path: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/w500/1XDDXPXGiI8id7MrUxK36ke7gkX.jpg",
        genres: [{ name: 'Animation' }, { name: 'Action' }, { name: 'Comedy' }],
        runtime: 94,
        vote_average: 7.0,
        release_date: "2024-03-02",
        price: { silver: 200, gold: 280, platinum: 350 } // NEW Price Object
    },
    {
        id: 653346,
        title: "Kingdom of the Planet of the Apes",
        overview: "Several generations in the future following Caesar's reign, apes are the dominant species and live harmoniously while humans have been reduced to living in the shadows.",
        poster_path: "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
        backdrop_path: "https://image.tmdb.org/t/p/w500/fqv8v6AycXKsivp1T5yKtLbIceh.jpg",
        genres: [{ name: 'Sci-Fi' }, { name: 'Adventure' }, { name: 'Action' }],
        runtime: 145,
        vote_average: 7.2,
        release_date: "2024-05-08",
        price: { silver: 220, gold: 320, platinum: 400 } // NEW Price Object
    }
];

let allMovies = [...mockMovies]; // This is our live "database"

const allShowtimes = {
    'Cineplex Royale': ['1:00 PM', '4:30 PM', '8:00 PM'],
    'Grand Moviedome': ['2:00 PM', '5:30 PM', '9:00 PM'],
    'StarLight Drive-In': ['7:30 PM', '10:30 PM']
};

// --- NEW: Theater Layout with Tiers ---
// s = silver (front), g = gold (middle), p = platinum (back), _ = aisle
const theaterLayout = [
    "__ssssss__", // Row A (Silver)
    "_ssssssss_", // Row B (Silver)
    "ssssssssss", // Row C (Silver)
    "gggggggggg", // Row D (Gold)
    "gggg__gggg", // Row E (Gold)
    "gggg__gggg", // Row F (Gold)
    "pppp__pppp", // Row G (Platinum)
    "pppp__pppp", // Row H (Platinum)
    "ppp____ppp"  // Row I (Platinum)
];

// --- NEW: Food & Drinks Menu ---
const foodMenu = [
    { id: 'popcorn', name: 'Large Popcorn', price: 220 },
    { id: 'soda', name: 'Large Soda', price: 150 },
    { id: 'combo', name: 'Popcorn + Soda Combo', price: 350 }
];

// --- GLOBAL STATE ---
let currentPage = 'page-list';
let currentMovie = null;
let currentDate = '';
let currentShow = { theater: '', time: '' };
let selectedSeats = []; // NEW: Will store objects { id, tier, price }
let selectedFood = []; // NEW: Will store objects { id, name, price }
let movieToEditId = null;
let occupiedSeats = {};

// --- AUTH STATE ---
let isLoggedIn = false;
let isAdmin = false;
let username = 'User';
let isLoginView = true;
let bookingHistory = [];
let bookingToCancel = null;

// --- DOM Elements ---
const movieCarousel = document.getElementById('movie-carousel');
const bookTicketBtn = document.getElementById('book-ticket-btn');
const heroButton = document.getElementById('hero-button');
const selectedSeatsList = document.getElementById('selected-seats-list');
const datePicker = document.getElementById('date-picker');
const theatersList = document.getElementById('theaters-list');
const bookingsList = document.getElementById('bookings-list');
const foodOptionsList = document.getElementById('food-options-list'); // NEW

// Auth DOM Elements
const authButton = document.getElementById('auth-button');
const userGreeting = document.getElementById('user-greeting');
const myBookingsButton = document.getElementById('my-bookings-button');
const adminButton = document.getElementById('admin-button');
const loginModal = document.getElementById('page-login');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authError = document.getElementById('auth-error');
const authSubmitButton = document.getElementById('auth-submit-button');
const authToggleText = document.getElementById('auth-toggle-text');
const authToggleButton = document.getElementById('auth-toggle-button');
const usernameField = document.getElementById('username-field');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Cancel Modal DOM Elements
const cancelModal = document.getElementById('page-cancel-confirm');
const cancelModalMovie = document.getElementById('cancel-modal-movie');
const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
const cancelNevermindBtn = document.getElementById('cancel-nevermind-btn');
const cancelCloseBtn = document.getElementById('cancel-close-btn');

// QR Modal DOM Elements
const qrModal = document.getElementById('page-qr-modal');
const qrCanvas = document.getElementById('qr-code-canvas');
const qrCloseBtn = document.getElementById('qr-close-btn');
const qrCloseBtnBottom = document.getElementById('qr-close-btn-bottom');

// Admin Form DOM Elements
let addMovieForm; // Defined in window.onload
const adminFormTitle = document.getElementById('admin-form-title');
const adminSubmitBtn = document.getElementById('admin-submit-btn');
const adminCancelBtn = document.getElementById('admin-cancel-btn');


// --- PAGE NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        if (!page.classList.contains('modal-overlay')) {
            page.style.display = 'none';
        }
    });

    if (pageId === 'page-bookings') {
        renderBookingsPage();
    }
    if (pageId === 'page-list') {
        loadHomepage();
    }
    if (pageId === 'page-admin' && !movieToEditId) {
        resetAdminForm();
    }

    const targetPage = document.getElementById(pageId);
    if (targetPage && !targetPage.classList.contains('modal-overlay')) {
        targetPage.style.display = 'block';
        currentPage = pageId;
    }

    if (pageId !== 'page-login') showLoginModal(false);
    if (pageId !== 'page-cancel-confirm') hideCancelModal();
    if (pageId !== 'page-qr-modal') hideQrModal();

    window.scrollTo(0, 0);
}

function showLoginModal(show = true) {
    loginModal.style.display = show ? 'flex' : 'none';
    if (!show) authError.classList.add('hidden');
}

// --- Cancel Modal Functions ---
function showCancelModal(bookingId) {
    const booking = bookingHistory.find(b => b.id === bookingId);
    if (!booking) return;

    bookingToCancel = bookingId;
    cancelModalMovie.textContent = booking.movieTitle;
    cancelModal.style.display = 'flex';
}

function hideCancelModal() {
    bookingToCancel = null;
    cancelModal.style.display = 'none';
}

function confirmCancellation() {
    if (bookingToCancel) {
        const bookingIndex = bookingHistory.findIndex(b => b.id === bookingToCancel);
        if (bookingIndex > -1) {
            const booking = bookingHistory[bookingIndex];

            const showtimeId = `${booking.movieId}_${booking.date}_${booking.theater}_${booking.time}`;
            if (occupiedSeats[showtimeId]) {
                // NEW: Seat IDs are inside objects now
                const bookedSeatIds = booking.seats.map(s => s.id);
                occupiedSeats[showtimeId] = occupiedSeats[showtimeId].filter(seatId => !bookedSeatIds.includes(seatId));
            }

            bookingHistory.splice(bookingIndex, 1);
            renderBookingsPage();
        }
    }
    hideCancelModal();
}

// --- QR Modal Functions ---
function showQrModal(bookingId) {
    const booking = bookingHistory.find(b => b.id === bookingId);
    if (!booking) return;

    const bookingData = JSON.stringify({
        bookingId: booking.id,
        movie: booking.movieTitle,
        theater: booking.theater,
        date: booking.date,
        time: booking.time,
        seats: booking.seats.map(s => s.id).join(', '), // NEW: Get IDs from objects
        food: booking.food.map(f => f.name).join(', '), // NEW
        total: `₹${booking.totalPrice.toFixed(2)}` // NEW
    });

    new QRious({
        element: qrCanvas,
        value: bookingData,
        size: 256,
        padding: 16,
        background: 'white',
        foreground: 'black'
    });

    qrModal.style.display = 'flex';
}

function hideQrModal() {
    qrModal.style.display = 'none';
    const context = qrCanvas.getContext('2d');
    context.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
}

// --- AUTH FUNCTIONS ---
function updateAuthState() {
    heroButton.disabled = !isLoggedIn;
    const heroTooltip = document.querySelector('#hero-button-container .disabled-tooltip');
    const confirmTooltip = document.querySelector('#confirm-button-container .disabled-tooltip');

    if (isLoggedIn) {
        authButton.textContent = 'Sign Out';
        userGreeting.textContent = `Welcome, ${username}!`;
        userGreeting.classList.remove('hidden');
        myBookingsButton.classList.remove('hidden');

        if (isAdmin) {
            adminButton.classList.remove('hidden');
        } else {
            adminButton.classList.add('hidden');
        }

        if (heroTooltip) heroTooltip.style.display = 'none';
        if (confirmTooltip) confirmTooltip.style.display = 'none';
        updateTotal();
    } else {
        authButton.textContent = 'Sign In';
        userGreeting.classList.add('hidden');
        myBookingsButton.classList.add('hidden');
        adminButton.classList.add('hidden');
        isAdmin = false;

        if (heroTooltip) heroTooltip.style.display = '';
        if (confirmTooltip) confirmTooltip.style.display = '';
        bookTicketBtn.disabled = true;
    }

    // BUG FIX: This call was moved to window.onload and handleAuthSubmit
}

function handleAuthClick() {
    if (isLoggedIn) {
        // Sign Out
        isLoggedIn = false;
        isAdmin = false;
        username = 'User';
        bookingHistory = [];
        updateAuthState();

        if (['page-seats', 'page-confirm', 'page-bookings', 'page-admin', 'page-list'].includes(currentPage)) {
            goHome();
        }
    } else {
        // Sign In
        isLoginView = true;
        toggleAuthView();
        showLoginModal(true);
    }
}

function toggleAuthView() {
    isLoginView = !isLoginView;
    authError.classList.add('hidden');
    authTitle.textContent = isLoginView ? 'Sign In' : 'Sign Up';
    usernameField.classList.toggle('hidden', isLoginView);
    authSubmitButton.textContent = isLoginView ? 'Sign In' : 'Create Account';
    authToggleText.textContent = isLoginView ? "Don't have an account?" : 'Already have an account?';
    authToggleButton.textContent = isLoginView ? 'Sign Up' : 'Sign In';
}

function handleAuthSubmit(event) {
    event.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const user = document.getElementById('username').value;

    if (!email || !password || (!isLoginView && !user)) {
        authError.textContent = 'Please fill in all fields.';
        authError.classList.remove('hidden');
        return;
    }

    isLoggedIn = true;
    username = isLoginView ? (email.split('@')[0] || 'User') : user;

    if (email === 'rg@cineluxe.com') {
        isAdmin = true;
        username = 'Admin';
    } else {
        isAdmin = false;
    }

    updateAuthState();
    showLoginModal(false);
    authForm.reset();
    authError.classList.add('hidden');

    if (currentPage === 'page-list') {
        loadHomepage();
    }
}

// --- PAGE 1: HOMEPAGE ---
function loadHomepage() {
    if (allMovies.length === 0) {
        movieCarousel.innerHTML = `<p class="text-gray-400">No movies are currently showing. An admin needs to add some!</p>`;
        document.getElementById('hero-title').textContent = 'Welcome to CineLuxe';
        document.getElementById('hero-genre').textContent = 'No movies available right now.';
        document.getElementById('hero-bg').style.backgroundImage = `url('https://placehold.co/1200x600/111827/4b5563?text=No+Movies+Available&font=inter')`;
        heroButton.disabled = true;
        return;
    }

    const heroMovie = allMovies[0];
    document.getElementById('hero-bg').style.backgroundImage = `url('${heroMovie.backdrop_path}')`;
    document.getElementById('hero-title').textContent = heroMovie.title;
    document.getElementById('hero-genre').textContent = heroMovie.genres.map(g => g.name).join(', ');
    heroButton.onclick = () => selectMovie(heroMovie.id);

    movieCarousel.innerHTML = ''; // Clear existing
    allMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'flex-shrink-0 w-48 transition-all duration-300 transform hover:scale-105 cursor-pointer group relative';

        let adminControls = '';
        if (isAdmin) {
            adminControls = `
                        <button class="admin-edit-btn absolute top-2 right-2 z-10 bg-yellow-500 text-black px-3 py-1 rounded-lg text-xs font-bold hover:bg-yellow-600 transition"
                                data-movie-id="${movie.id}">
                            Edit
                        </button>
                    `;
        }

        movieCard.innerHTML = `
                    ${adminControls}
                    <div class="movie-card-content relative rounded-lg overflow-hidden shadow-lg border-2 border-gray-800 group-hover:border-cyan-500 group-hover:shadow-cyan-500/30">
                        <img src="${movie.poster_path}" alt="${movie.title}" class="w-full h-72 object-cover" onerror="this.src='https://placehold.co/200x300/1f2937/ffffff?text=Image+Failed'; this.onerror=null;">
                    </div>
                    <h3 class="text-lg font-semibold text-white mt-3 truncate">${movie.title}</h3>
                    <p class="text-sm text-gray-400">Rating: ${movie.vote_average.toFixed(1)} &star;</p>
                `;

        movieCard.querySelector('.movie-card-content').addEventListener('click', () => {
            selectMovie(movie.id);
        });

        movieCarousel.appendChild(movieCard);
    });

    if (isAdmin) {
        document.querySelectorAll('.admin-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                startEditMovie(parseInt(e.target.dataset.movieId));
            });
        });
    }
}

// --- PAGE 2: MOVIE DETAILS ---
function selectMovie(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) {
        console.error("Movie not found!");
        goHome();
        return;
    }

    currentMovie = movie;

    document.getElementById('detail-backdrop').style.backgroundImage = `url('${movie.backdrop_path}')`;
    document.getElementById('detail-img').src = movie.poster_path;
    document.getElementById('detail-title').textContent = movie.title;
    document.getElementById('detail-genre').textContent = movie.genres.map(g => g.name).join(', ');
    document.getElementById('detail-duration').textContent = `${movie.runtime} minutes`;
    document.getElementById('detail-desc').textContent = movie.overview;

    renderDateTabs();
    selectDate(datePicker.querySelector('button').dataset.date);

    showPage('page-details');
}

function getDates() {
    const dates = [];
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toLocaleDateString('en-US', options);
        dates.push({
            display: i === 0 ? 'Today' : dateString.split(', ')[0],
            fullDate: dateString,
            simpleDate: date.toISOString().split('T')[0]
        });
    }
    return dates;
}

function renderDateTabs() {
    datePicker.innerHTML = '';
    getDates().forEach(date => {
        const btn = document.createElement('button');
        btn.className = 'date-picker-btn flex-shrink-0 bg-gray-800 text-gray-300 px-5 py-3 rounded-lg font-semibold hover:bg-cyan-600 hover:text-white transition duration-200';
        btn.innerHTML = `
                    <span class="block text-sm">${date.display}</span>
                    <span class="block text-xs">${date.fullDate.split(', ')[1]}</span>
                `;
        btn.dataset.date = date.simpleDate;
        btn.onclick = () => selectDate(date.simpleDate);
        datePicker.appendChild(btn);
    });
}

function selectDate(simpleDate) {
    currentDate = simpleDate;
    document.querySelectorAll('.date-picker-btn').forEach(btn => {
        btn.classList.toggle('bg-cyan-600', btn.dataset.date === simpleDate);
        btn.classList.toggle('text-white', btn.dataset.date === simpleDate);
        btn.classList.toggle('bg-gray-800', btn.dataset.date !== simpleDate);
        btn.classList.toggle('text-gray-300', btn.dataset.date !== simpleDate);
    });
    renderShowtimes();
}

function renderShowtimes() {
    theatersList.innerHTML = '';
    Object.keys(allShowtimes).forEach(theater => {
        const theaterDiv = document.createElement('div');
        theaterDiv.innerHTML = `<h4 class="text-2xl font-semibold text-gray-100 mb-4">${theater}</h4>`;
        const showtimesContainer = document.createElement('div');
        showtimesContainer.className = 'flex flex-wrap gap-3';
        allShowtimes[theater].forEach(time => {
            const btn = createShowtimeButton(theater, time);
            showtimesContainer.appendChild(btn);
        });
        theaterDiv.appendChild(showtimesContainer);
        theatersList.appendChild(theaterDiv);
    });
}

function createShowtimeButton(theater, time) {
    const btn = document.createElement('button');
    btn.className = 'bg-gray-700 text-gray-200 px-6 py-2 rounded-lg font-medium hover:bg-cyan-500 hover:text-white transition duration-200 border border-gray-600 hover:border-cyan-500';
    btn.textContent = time;
    btn.addEventListener('click', () => selectShowtime(theater, time));
    return btn;
}

// --- PAGE 3: SEAT SELECTION ---
function selectShowtime(theater, time) {
    currentShow = { theater, time };
    document.getElementById('booking-movie-title').textContent = currentMovie.title;
    document.getElementById('booking-show-info').textContent = `${currentDate} at ${time} | ${theater}`;

    renderFoodOptions(); // NEW
    generateSeatMap();

    selectedSeats = [];
    selectedFood = [];
    updateTotal();
    showPage('page-seats');
}

// --- NEW: Render Food Options ---
function renderFoodOptions() {
    foodOptionsList.innerHTML = '';
    foodMenu.forEach(item => {
        const foodItemDiv = document.createElement('div');
        foodItemDiv.className = 'flex items-center justify-between';
        foodItemDiv.innerHTML = `
                    <label for="food-${item.id}" class="text-gray-200">${item.name} (₹${item.price.toFixed(2)})</label>
                    <input type="checkbox" id="food-${item.id}" name="food" 
                           data-id="${item.id}" data-name="${item.name}" data-price="${item.price}"
                           class="food-item-checkbox h-5 w-5 bg-gray-700 border-gray-600 rounded text-cyan-500 focus:ring-cyan-600">
                `;
        foodOptionsList.appendChild(foodItemDiv);
    });

    // Add change listeners to all checkboxes
    document.querySelectorAll('.food-item-checkbox').forEach(box => {
        box.addEventListener('change', updateTotal);
    });
}

// --- NEW: Updated Seat Map Generation with Tiers ---
function generateSeatMap() {
    const seatMap = document.getElementById('seat-map');
    seatMap.innerHTML = '';

    const showtimeId = `${currentMovie.id}_${currentDate}_${currentShow.theater}_${currentShow.time}`;
    const bookedSeats = occupiedSeats[showtimeId] || [];

    theaterLayout.forEach((rowString, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'flex flex-row justify-center';

        const rowChar = String.fromCharCode(65 + rowIndex); // 'A', 'B', 'C'...
        let seatCounter = 1; // Counter for seat number in the row

        rowString.split('').forEach((seatChar) => {
            if (seatChar === '_') {
                // Aisle
                const spacer = document.createElement('div');
                spacer.className = 'seat-spacer';
                rowDiv.appendChild(spacer);
            } else {
                // Seat
                const seatId = `${rowChar}${seatCounter}`;
                const seat = document.createElement('div');
                seat.className = 'seat';
                seat.dataset.seatId = seatId;

                let tier = '';
                let price = 0;

                // Assign tier and price based on layout
                // USER REQUEST: Silver (front), Gold (middle), Platinum (back)
                if (seatChar === 's') {
                    tier = 'Silver';
                    price = currentMovie.price.silver;
                    seat.classList.add('seat-silver');
                } else if (seatChar === 'g') {
                    tier = 'Gold';
                    price = currentMovie.price.gold;
                    seat.classList.add('seat-gold');
                } else if (seatChar === 'p') {
                    tier = 'Platinum';
                    price = currentMovie.price.platinum;
                    seat.classList.add('seat-platinum');
                }

                seat.dataset.seatTier = tier;
                seat.dataset.seatPrice = price;

                if (bookedSeats.includes(seatId)) {
                    seat.classList.add('occupied');
                }

                if (!seat.classList.contains('occupied')) {
                    seat.addEventListener('click', () => toggleSeat(seatId, tier, price));
                }
                rowDiv.appendChild(seat);
                seatCounter++;
            }
        });
        seatMap.appendChild(rowDiv);
    });
}

// --- NEW: Updated toggleSeat to store objects ---
function toggleSeat(seatId, tier, price) {
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    const index = selectedSeats.findIndex(s => s.id === seatId);

    if (index > -1) {
        // Seat is already selected, deselect it
        selectedSeats.splice(index, 1);
        seatElement.classList.remove('selected');
    } else {
        // Seat is not selected, select it
        selectedSeats.push({ id: seatId, tier: tier, price: price });
        seatElement.classList.add('selected');
    }
    selectedSeats.sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID
    updateTotal();
}

// --- NEW: Updated updateTotal for Tiers and Food ---
function updateTotal() {
    // Calculate Seat Total
    let seatsTotal = 0;
    selectedSeats.forEach(seat => {
        seatsTotal += seat.price;
    });

    // Calculate Food Total
    selectedFood = [];
    let foodTotal = 0;
    document.querySelectorAll('.food-item-checkbox:checked').forEach(box => {
        const itemPrice = parseFloat(box.dataset.price);
        foodTotal += itemPrice;
        selectedFood.push({
            id: box.dataset.id,
            name: box.dataset.name,
            price: itemPrice
        });
    });

    // Calculate Grand Total
    const total = seatsTotal + foodTotal;

    // Update UI
    document.getElementById('seat-count').textContent = selectedSeats.length;
    document.getElementById('seats-total-price').textContent = `₹${seatsTotal.toFixed(2)}`;
    document.getElementById('food-total-price').textContent = `₹${foodTotal.toFixed(2)}`;
    document.getElementById('total-price').textContent = `₹${total.toFixed(2)}`;

    // Enable or disable booking button
    bookTicketBtn.disabled = selectedSeats.length === 0 || !isLoggedIn;

    // Update selected seats list
    if (selectedSeats.length > 0) {
        selectedSeatsList.innerHTML = selectedSeats.map(seat =>
            `<div class="flex justify-between">
                        <span>${seat.id} (${seat.tier})</span>
                        <span>₹${seat.price.toFixed(2)}</span>
                     </div>`
        ).join('');
    } else {
        selectedSeatsList.innerHTML = `<span class="text-gray-400 text-base">No seats selected</span>`;
    }
}

// --- PAGE 4: CONFIRMATION (Updated) ---
function showConfirmation() {
    if (!isLoggedIn || selectedSeats.length === 0) return;

    // Recalculate totals to be sure
    let seatsTotal = 0;
    selectedSeats.forEach(seat => { seatsTotal += seat.price; });

    let foodTotal = 0;
    selectedFood.forEach(item => { foodTotal += item.price; });

    const totalPrice = seatsTotal + foodTotal;

    const newBooking = {
        id: Date.now(),
        movieId: currentMovie.id,
        movieTitle: currentMovie.title,
        theater: currentShow.theater,
        date: currentDate,
        time: currentShow.time,
        seats: [...selectedSeats], // Array of {id, tier, price}
        food: [...selectedFood], // Array of {id, name, price}
        seatsTotal: seatsTotal,
        foodTotal: foodTotal,
        totalPrice: totalPrice
    };
    bookingHistory.push(newBooking);

    // NEW: Add seats to the occupied list (only IDs)
    const showtimeId = `${newBooking.movieId}_${newBooking.date}_${newBooking.theater}_${newBooking.time}`;
    if (!occupiedSeats[showtimeId]) {
        occupiedSeats[showtimeId] = [];
    }
    occupiedSeats[showtimeId].push(...newBooking.seats.map(s => s.id));

    // Populate confirmation page
    document.getElementById('confirm-movie').textContent = newBooking.movieTitle;
    document.getElementById('confirm-theater').textContent = newBooking.theater;
    document.getElementById('confirm-date').textContent = newBooking.date;
    document.getElementById('confirm-time').textContent = newBooking.time;
    document.getElementById('confirm-seats').textContent = newBooking.seats.map(s => `${s.id} (${s.tier})`).join(', ');

    // Populate food
    const confirmFoodSection = document.getElementById('confirm-food-section');
    const confirmFoodTotalSection = document.getElementById('confirm-food-total-section');
    if (newBooking.food.length > 0) {
        document.getElementById('confirm-food').textContent = newBooking.food.map(f => f.name).join(', ');
        document.getElementById('confirm-food-total').textContent = `₹${newBooking.foodTotal.toFixed(2)}`;
        confirmFoodSection.classList.remove('hidden');
        confirmFoodTotalSection.classList.remove('hidden');
    } else {
        confirmFoodSection.classList.add('hidden');
        confirmFoodTotalSection.classList.add('hidden');
    }

    // Populate totals
    document.getElementById('confirm-seats-total').textContent = `₹${newBooking.seatsTotal.toFixed(2)}`;
    document.getElementById('confirm-total').textContent = `₹${newBooking.totalPrice.toFixed(2)}`;

    showPage('page-confirm');
    selectedSeats = [];
    selectedFood = [];
    updateTotal();
}

// --- PAGE 5: MY BOOKINGS (Updated) ---
function renderBookingsPage() {
    bookingsList.innerHTML = '';

    if (bookingHistory.length === 0) {
        bookingsList.innerHTML = `
                    <div id="no-bookings" class="text-center py-20 bg-gray-900 rounded-lg shadow-inner">
                        <svg class="w-16 h-16 text-cyan-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
                        <h3 class="text-2xl font-semibold text-gray-400 mt-4">You have no bookings.</h3>
                        <p class="text-gray-500">Tickets you book will appear here.</p>
                    </div>`;
        return;
    }

    const sortedBookings = [...bookingHistory].reverse();
    sortedBookings.forEach(booking => {
        const bookingStub = document.createElement('div');
        bookingStub.className = 'ticket-stub';

        // NEW: Logic to display food, if it exists
        let foodHtml = '';
        if (booking.food.length > 0) {
            foodHtml = `
                        <div class="mt-4 pt-4 border-t border-gray-700">
                            <p class="text-sm text-cyan-300">Food & Drinks</p>
                            <p class="font-semibold text-base break-words">${booking.food.map(f => f.name).join(', ')}</p>
                        </div>
                    `;
        }

        bookingStub.innerHTML = `
                    <div class="p-6">
                        <p class="text-sm text-cyan-300">Movie</p>
                        <h4 class="font-bold text-2xl text-white mb-4 truncate">${booking.movieTitle}</h4>
                        <div class="flex flex-col sm:flex-row justify-between gap-4">
                            <div><p class="text-sm text-cyan-300">Theater</p><p class="font-semibold text-lg">${booking.theater}</p></div>
                            <div><p class="text-sm text-cyan-300">Date</p><p class="font-semibold text-lg">${booking.date}</p></div>
                            <div><p class="text-sm text-cyan-300">Time</p><p class="font-semibold text-lg">${booking.time}</p></div>
                        </div>
                        <div class="mt-4 pt-4 border-t border-gray-700">
                            <p class="text-sm text-cyan-300">Seats</p>
                            <p class="font-semibold text-lg break-words">${booking.seats.map(s => `${s.id} (${s.tier})`).join(', ')}</p>
                        </div>
                        ${foodHtml}
                    </div>
                    <div class="bg-gray-800 p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <p class="text-sm text-cyan-300">Total Paid</p>
                            <p class="font-bold text-3xl text-white">₹${booking.totalPrice.toFixed(2)}</p>
                            <p class="text-xs text-gray-500 mt-1">Booking ID: ${booking.id}</p>
                        </div>
                        <div class="flex-shrink-0 flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                            <button class="qr-btn text-sm font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-900/50 hover:bg-cyan-900/80 px-4 py-2 rounded-lg transition w-full" data-booking-id="${booking.id}">
                                View QR Code
                            </button>
                            <button class="cancel-btn text-sm font-medium text-red-400 hover:text-red-300 bg-red-900/50 hover:bg-red-900/80 px-4 py-2 rounded-lg transition w-full" data-booking-id="${booking.id}">
                                &times; Cancel Booking
                            </button>
                        </div>
                    </div>
                `;
        bookingsList.appendChild(bookingStub);
    });

    attachBookingListeners();
}

function attachBookingListeners() {
    document.querySelectorAll('#bookings-list .cancel-btn').forEach(button => {
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector(`[data-booking-id="${button.dataset.bookingId}"].cancel-btn`);
        newButton.addEventListener('click', () => {
            showCancelModal(parseInt(newButton.dataset.bookingId));
        });
    });

    document.querySelectorAll('#bookings-list .qr-btn').forEach(button => {
        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector(`[data-booking-id="${button.dataset.bookingId}"].qr-btn`);
        newButton.addEventListener('click', () => {
            showQrModal(parseInt(newButton.dataset.bookingId));
        });
    });
}

// --- NEW: Admin Panel Functions (Updated) ---
function startEditMovie(movieId) {
    const movie = allMovies.find(m => m.id === movieId);
    if (!movie) return;

    movieToEditId = movieId;

    // Pre-fill form
    document.getElementById('admin-title').value = movie.title;
    document.getElementById('admin-desc').value = movie.overview;
    document.getElementById('admin-poster').value = movie.poster_path;
    document.getElementById('admin-backdrop').value = movie.backdrop_path;
    document.getElementById('admin-genres').value = movie.genres.map(g => g.name).join(', ');
    document.getElementById('admin-runtime').value = movie.runtime;
    // NEW: Pre-fill tiered prices
    document.getElementById('admin-price-silver').value = movie.price.silver;
    document.getElementById('admin-price-gold').value = movie.price.gold;
    document.getElementById('admin-price-platinum').value = movie.price.platinum;

    // Update UI
    adminFormTitle.textContent = `Editing: ${movie.title}`;
    adminSubmitBtn.textContent = 'Update Movie';
    adminCancelBtn.classList.remove('hidden');

    showPage('page-admin');
}

function resetAdminForm() {
    movieToEditId = null;
    if (addMovieForm) {
        addMovieForm.reset();
    }
    adminFormTitle.textContent = 'Add New Movie';
    adminSubmitBtn.textContent = 'Add Movie to Database';
    adminCancelBtn.classList.add('hidden');
}

function handleMovieFormSubmit(event) {
    event.preventDefault();

    // Get values from form
    const title = document.getElementById('admin-title').value;
    const overview = document.getElementById('admin-desc').value;
    const poster_path = document.getElementById('admin-poster').value;
    const backdrop_path = document.getElementById('admin-backdrop').value;
    const genresString = document.getElementById('admin-genres').value;
    const runtime = parseInt(document.getElementById('admin-runtime').value) || 0;
    const genres = genresString.split(',').map(g => ({ name: g.trim() }));

    // NEW: Get tiered prices
    const priceSilver = parseInt(document.getElementById('admin-price-silver').value) || 0;
    const priceGold = parseInt(document.getElementById('admin-price-gold').value) || 0;
    const pricePlatinum = parseInt(document.getElementById('admin-price-platinum').value) || 0;

    const price = { silver: priceSilver, gold: priceGold, platinum: pricePlatinum };

    if (movieToEditId) {
        // --- UPDATE existing movie ---
        const movieIndex = allMovies.findIndex(m => m.id === movieToEditId);
        if (movieIndex > -1) {
            const originalMovie = allMovies[movieIndex];
            allMovies[movieIndex] = {
                ...originalMovie,
                title,
                overview,
                poster_path,
                backdrop_path,
                genres,
                runtime,
                price // NEW: Save price object
            };
        }
    } else {
        // --- ADD new movie ---
        const newMovie = {
            id: Date.now(),
            title,
            overview,
            poster_path,
            backdrop_path,
            genres,
            runtime,
            price, // NEW: Save price object
            vote_average: parseFloat((Math.random() * 3 + 6).toFixed(1)),
            release_date: new Date().toISOString().split('T')[0]
        };
        allMovies.unshift(newMovie);
    }

    resetAdminForm();
    goHome();
}


// --- GENERAL ---
function goHome() {
    currentMovie = null;
    currentDate = '';
    currentShow = { theater: '', time: '' };
    selectedSeats = [];
    selectedFood = [];
    showPage('page-list');
    updateAuthState();
}

// --- INITIALIZATION ---
window.onload = () => {
    // Define form element here
    addMovieForm = document.getElementById('add-movie-form');

    loadHomepage();
    updateAuthState();

    // Auth Event Listeners
    authButton.addEventListener('click', handleAuthClick);
    authToggleButton.addEventListener('click', toggleAuthView);
    authForm.addEventListener('submit', handleAuthSubmit);

    // Cancel Modal Event Listeners
    cancelConfirmBtn.addEventListener('click', confirmCancellation);
    cancelNevermindBtn.addEventListener('click', hideCancelModal);
    cancelCloseBtn.addEventListener('click', hideCancelModal);

    // QR Modal Event Listeners
    qrCloseBtn.addEventListener('click', hideQrModal);
    qrCloseBtnBottom.addEventListener('click', hideQrModal);

    // Admin Form Event Listeners
    if (addMovieForm) {
        addMovieForm.addEventListener('submit', handleMovieFormSubmit);
    }
    if (adminCancelBtn) {
        adminCancelBtn.addEventListener('click', () => {
            resetAdminForm();
            goHome();
        });
    }
};

