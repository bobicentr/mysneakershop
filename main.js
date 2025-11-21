const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Глобальные переменные
let productsDB = []; 
let cart = JSON.parse(localStorage.getItem('sneaker-cart')) || [];

// --- 2. ИНИЦИАЛИЗАЦИЯ (ЗАГРУЗКА БАЗЫ) ---
async function initShop() {
    console.log("Загрузка товаров...");

    const { data, error } = await sb
        .from('products')
        .select('*');

    if (error) {
        console.error("Ошибка Supabase:", error);
        return;
    }

    productsDB = data;
    
    // Рисуем каталог (если мы на главной)
    renderProducts();
}

// --- 3. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ЦЕНЫ ---
function getPrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return parseInt(price.replace(/\D/g, '')) || 0;
    return 0;
}

// --- 4. ОТРИСОВКА КАТАЛОГА (ГЛАВНАЯ) ---
function renderProducts() {
    const containerNew = document.getElementById('container-new');
    const containerMale = document.getElementById('container-male');
    const containerFemale = document.getElementById('container-female');

    // Если контейнеров нет (значит мы на странице оформления), выходим
    if (!containerNew && !containerMale && !containerFemale) return;

    // Очистка
    if(containerNew) containerNew.innerHTML = '';
    if(containerMale) containerMale.innerHTML = '';
    if(containerFemale) containerFemale.innerHTML = '';

    const createCard = (product) => {
        const displayPrice = getPrice(product.price).toLocaleString() + ' ₽';
        return `
        <article class="product_class" id="${product.html_id}">
            <div class="card-image">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${product.name}</h3>
                <p>${displayPrice}</p>
                <button class="add-to-cart" onclick="addToCart('${product.html_id}')">
                    В КОРЗИНУ
                </button>
            </div>
        </article>
        `;
    };

    productsDB.forEach(product => {
        if (product.status === 'new' && containerNew) containerNew.innerHTML += createCard(product);
        if (product.sex === 'male' && containerMale) containerMale.innerHTML += createCard(product);
        if (product.sex === 'female' && containerFemale) containerFemale.innerHTML += createCard(product);
    });
}

// --- 5. ЛОГИКА КОРЗИНЫ ---
function addToCart(id) {
    const product = productsDB.find(p => p.html_id === id);
    if (!product) return;

    const itemInCart = cart.find(item => item.html_id === id);
    if (itemInCart) {
        itemInCart.count++;
    } else {
        cart.push({ ...product, count: 1 });
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(id, event) {
    if (event) event.stopPropagation();
    const item = cart.find(p => p.html_id === id);
    if (!item) return;

    if (item.count > 1) {
        item.count--;
    } else {
        cart = cart.filter(p => p.html_id !== id);
    }
    saveCart();
    updateCartUI();     // Обновляем выпадающую корзину
    renderCheckoutPage(); // Обновляем страницу оформления (если мы там)
}

function saveCart() {
    localStorage.setItem('sneaker-cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Эта функция обновляет МАЛЕНЬКУЮ корзину в хэдере
    const countEl = document.getElementById('cart-count');
    const itemsContainer = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.cart-total');

    // Если элементов нет (например, мы на странице checkout.html без хэдера с корзиной), выходим
    if (!itemsContainer) return;

    let totalCount = 0;
    let totalPrice = 0;

    itemsContainer.innerHTML = '';

    cart.forEach(item => {
        totalCount += item.count;
        const priceVal = getPrice(item.price);
        totalPrice += priceVal * item.count;

        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.count} шт.</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.html_id}', event)">&times;</button>
        `;
        itemsContainer.appendChild(div);
    });

    if (countEl) countEl.innerText = totalCount;
    if (totalEl) totalEl.innerText = totalPrice.toLocaleString() + ' ₽';
}

// --- 6. ЛОГИКА СТРАНИЦЫ ОФОРМЛЕНИЯ (CHECKOUT) ---
function renderCheckoutPage() {
    // Ищем контейнер списка товаров на странице оформления
    const checkoutContainer = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total-price');

    // Если мы НЕ на странице оформления (элемент не найден), останавливаемся
    if (!checkoutContainer) {
        console.log("Мы не на странице оформления заказа");
        return;
    }

    console.log("Отрисовка страницы оформления...");
    checkoutContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        checkoutContainer.innerHTML = '<p>Ваша корзина пуста</p>';
    }

    cart.forEach(item => {
        const priceVal = getPrice(item.price);
        const itemSum = priceVal * item.count;
        total += itemSum;

        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <div style="display:flex; gap:15px; align-items:center;">
                <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                <div>
                    <strong>${item.name}</strong> <br>
                    <span style="color:#888; font-size:0.9rem">${item.count} шт. x ${priceVal} ₽</span>
                </div>
            </div>
            <div style="font-weight:bold;">${itemSum.toLocaleString()} ₽</div>
        `;
        checkoutContainer.appendChild(div);
    });

    if (totalEl) {
        totalEl.innerText = total.toLocaleString() + ' ₽';
    }
}

// --- 7. УПРАВЛЕНИЕ ОКНАМИ И ЗАПУСК ---

// Хэндлеры для корзины в хэдере
const cartBtn = document.getElementById('cart-btn');
const cartWindow = document.getElementById('cart-window');
if (cartBtn && cartWindow) {
    cartBtn.addEventListener('click', () => cartWindow.classList.toggle('active'));
    window.addEventListener('click', (e) => {
        if (!cartWindow.contains(e.target) && !cartBtn.contains(e.target)) {
            cartWindow.classList.remove('active');
        }
    });
}

// Поиск
const searchInput = document.getElementById('site-search');
const resultsContainer = document.getElementById('search-results');
if (searchInput && resultsContainer) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';
        if (query.length === 0) { resultsContainer.style.display = 'none'; return; }
        
        const found = productsDB.filter(p => p.name.toLowerCase().includes(query));
        if (found.length > 0) {
            resultsContainer.style.display = 'block';
            found.forEach(product => {
                const item = document.createElement('div');
                item.className = 'search-item';
                item.innerHTML = `<img src="${product.img}"><div><h4>${product.name}</h4></div>`;
                item.addEventListener('click', () => {
                    const card = document.getElementById(product.html_id);
                    if(card) card.scrollIntoView({behavior:'smooth', block:'center'});
                    resultsContainer.style.display = 'none';
                });
                resultsContainer.appendChild(item);
            });
        } else {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = '<div class="search-item">Ничего не найдено</div>';
        }
    });
}

// Ждем загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Инициализация карты
    // setView([широта, долгота], масштаб) - ставим центр на Москву
    const map = L.map('map').setView([55.7558, 37.6173], 10);

    // 2. Добавляем слой "плиток" (сама картинка карты)
    // Используем бесплатный сервер OSM
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors' // Это требование лицензии (копирайт)
    }).addTo(map);

    let marker = null; // Переменная для хранения маркера

    // 3. Обработка клика по карте
    map.on('click', async function(e) {
        const { lat, lng } = e.latlng; // Получаем координаты клика

        // Если маркер уже есть - двигаем его, если нет - создаем
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            
            // Если перетащили маркер - тоже ищем адрес
            marker.on('dragend', function(event) {
                const position = marker.getLatLng();
                getAddress(position.lat, position.lng);
            });
        }

        // Вызываем функцию получения адреса
        await getAddress(lat, lng);
    });

    // 4. Функция обратного геокодирования (Координаты -> Адрес)
    async function getAddress(lat, lng) {
        const input = document.getElementById('address-input');
        input.value = "Поиск адреса...";

        try {
            // Делаем запрос к бесплатному API Nominatim
            // accept-language=ru делает ответ на русском
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`);
            
            if (!response.ok) throw new Error('Ошибка сети');
            
            const data = await response.json();
            
            // Формируем красивую строку. Nominatim возвращает много полей (road, house_number, city...)
            // display_name - это полная строка адреса
            const address = data.display_name;

            // Записываем в инпут
            input.value = address;
            
        } catch (error) {
            console.error(error);
            input.value = "Не удалось определить адрес";
        }
    }
});

// === ГЛАВНЫЙ ЗАПУСК ===
// 1. Сразу пытаемся отрисовать страницу оформления (данные берем из localStorage, ждать базу не нужно)
renderCheckoutPage();

// 2. Сразу обновляем маленькую корзину в хэдере
updateCartUI();

// 3. Загружаем базу товаров (для главной страницы)
initShop();