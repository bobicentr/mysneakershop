// --- 1. НАСТРОЙКИ SUPABASE ---
// Вставь свои ключи сюда!
const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';

// Используем имя sb, чтобы не было конфликтов с библиотекой
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Глобальные переменные
let productsDB = []; 
let cart = JSON.parse(localStorage.getItem('sneaker-cart')) || [];

// --- 2. ИНИЦИАЛИЗАЦИЯ (ЗАГРУЗКА) ---
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
    console.log("Товары получены:", productsDB);
    
    renderProducts();
    updateCartUI();
}

// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ЦЕНЫ ---
// Она решает твою проблему с ошибкой
function getPrice(price) {
    // Если цена уже число (например, 23000) — просто возвращаем его
    if (typeof price === 'number') {
        return price;
    }
    // Если цена строка (например, "23 000р.") — чистим от букв и пробелов
    if (typeof price === 'string') {
        return parseInt(price.replace(/\D/g, '')) || 0;
    }
    return 0;
}

// --- 3. ОТРИСОВКА ТОВАРОВ (RENDER) ---
function renderProducts() {
    const containerNew = document.getElementById('container-new');
    const containerMale = document.getElementById('container-male');
    const containerFemale = document.getElementById('container-female');

    // Очистка
    if(containerNew) containerNew.innerHTML = '';
    if(containerMale) containerMale.innerHTML = '';
    if(containerFemale) containerFemale.innerHTML = '';

    const createCard = (product) => {
        // Форматируем цену для красоты (добавляем пробелы, например 23 000)
        const displayPrice = getPrice(product.price).toLocaleString() + ' ₽';

        return `
        <article class="product_class" id="${product.html_id}">
            <div class="card-image">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${product.name}</h3>
                <p>Цена: ${displayPrice}</p>
                <button class="add-to-cart" onclick="addToCart('${product.html_id}')">
                    В КОРЗИНУ
                </button>
            </div>
        </article>
        `;
    };

    productsDB.forEach(product => {
        // Проверяем статус (Новинки)
        if (product.status === 'new' && containerNew) {
            containerNew.innerHTML += createCard(product);
        }

        // Проверяем пол (Мужские) - приводим к нижнему регистру на всякий случай
        if (product.sex && product.sex.toLowerCase() === 'male' && containerMale) {
            containerMale.innerHTML += createCard(product);
        }

        // Проверяем пол (Женские)
        if (product.sex && product.sex.toLowerCase() === 'female' && containerFemale) {
            containerFemale.innerHTML += createCard(product);
        }
    });
}

// --- 4. ЛОГИКА КОРЗИНЫ ---
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
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('sneaker-cart', JSON.stringify(cart));
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsContainer = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.cart-total');

    let totalCount = 0;
    let totalPrice = 0;

    itemsContainer.innerHTML = '';

    cart.forEach(item => {
        totalCount += item.count;
        
        // ИСПОЛЬЗУЕМ БЕЗОПАСНУЮ ФУНКЦИЮ ПОЛУЧЕНИЯ ЦЕНЫ
        const priceVal = getPrice(item.price);
        totalPrice += priceVal * item.count;

        // Красивая цена для отображения
        const displayPrice = priceVal.toLocaleString() + ' ₽';

        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.count} шт. x ${displayPrice}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.html_id}', event)">&times;</button>
        `;
        itemsContainer.appendChild(div);
    });

    // Обновляем общие цифры
    if (countEl) countEl.innerText = totalCount;
    if (totalEl) totalEl.innerText = totalPrice.toLocaleString() + ' ₽';
    
    // Если пусто
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">Корзина пуста</div>';
    }
}

// Управление окном корзины
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


// --- 5. ПОИСК (Живой) ---
const searchInput = document.getElementById('site-search');
const resultsContainer = document.getElementById('search-results');

if (searchInput && resultsContainer) {
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';

        if (query.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        const found = productsDB.filter(p => p.name.toLowerCase().includes(query));

        if (found.length > 0) {
            resultsContainer.style.display = 'block';
            found.forEach(product => {
                const priceVal = getPrice(product.price).toLocaleString() + ' ₽';
                
                const item = document.createElement('div');
                item.className = 'search-item';
                item.innerHTML = `
                    <img src="${product.img}" alt="${product.name}">
                    <div class="search-item-info">
                        <h4>${product.name}</h4>
                        <p>${priceVal}</p>
                    </div>
                `;
                
                item.addEventListener('click', () => {
                    const card = document.getElementById(product.html_id);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        card.style.transition = "0.3s";
                        card.style.transform = "scale(1.05)";
                        card.style.boxShadow = "0 0 20px rgba(79, 70, 229, 0.4)";
                        setTimeout(() => {
                            card.style.transform = "none";
                            card.style.boxShadow = "none";
                        }, 1500);
                    }
                    resultsContainer.style.display = 'none';
                    searchInput.value = '';
                });
                
                resultsContainer.appendChild(item);
            });
        } else {
            resultsContainer.style.display = 'block';
            resultsContainer.innerHTML = '<div class="search-item">Ничего не найдено</div>';
        }
    });
}

// ЗАПУСК
initShop();