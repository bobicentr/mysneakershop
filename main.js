// --- 1. НАСТРОЙКИ SUPABASE (Вставь свои данные!) ---
const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Глобальная переменная для хранения товаров
let productsDB = [];
// Корзина из памяти браузера
let cart = JSON.parse(localStorage.getItem('sneaker-cart')) || [];

// --- 2. ИНИЦИАЛИЗАЦИЯ САЙТА ---
async function initShop() {
    console.log("Загрузка товаров...");

    // БЫЛО: const { data, error } = await supabase.from('products')...
    
    // СТАЛО:
    const { data, error } = await sb
        .from('products')
        .select('*');

    // ... остальной код


    if (error) {
        console.error("Ошибка загрузки:", error);
        return;
    }

    // Сохраняем в переменную
    productsDB = data;
    
    // Рисуем товары и обновляем корзину
    renderProducts();
    updateCartUI();
}

// --- 3. ОТРИСОВКА ТОВАРОВ (RENDER) ---
function renderProducts() {
    const containerNew = document.getElementById('container-new');
    const containerMale = document.getElementById('container-male');
    const containerFemale = document.getElementById('container-female');

    // Очищаем контейнеры перед отрисовкой (чтобы не дублировалось при перезагрузке)
    if(containerNew) containerNew.innerHTML = '';
    if(containerMale) containerMale.innerHTML = '';
    if(containerFemale) containerFemale.innerHTML = '';

    // Шаблон карточки
    const createCard = (product) => `
        <article class="product_class" id="${product.html_id}">
            <div class="card-image">
                <img src="${product.img}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${product.name}</h3>
                <p>Цена: ${product.price}</p>
                <button class="add-to-cart" onclick="addToCart('${product.html_id}')">
                    В корзину
                </button>
            </div>
        </article>
    `;

    productsDB.forEach(product => {
        // 1. Проверка на новизну
        if (product.status === 'new' && containerNew) {
            containerNew.innerHTML += createCard(product);
        }
    
        // 2. Проверка на мужские (БЕЗ else!)
        // Добавим .toLowerCase(), чтобы работало и с 'Male', и с 'male'
        if (product.sex && product.sex.toLowerCase() === 'male' && containerMale) {
            containerMale.innerHTML += createCard(product);
        }
    
        // 3. Проверка на женские (БЕЗ else!)
        if (product.sex && product.sex.toLowerCase() === 'female' && containerFemale) {
            containerFemale.innerHTML += createCard(product);
        }
    });
}

// --- 4. ЛОГИКА КОРЗИНЫ ---

// Добавление товара
function addToCart(id) {
    // Ищем товар в скачанной базе по html_id
    const product = productsDB.find(p => p.html_id === id);
    if (!product) return;

    const itemInCart = cart.find(item => item.html_id === id);

    if (itemInCart) {
        itemInCart.count++;
    } else {
        // Добавляем, копируя поля
        cart.push({ ...product, count: 1 });
    }

    saveCart();
    updateCartUI();
}

// Удаление товара
function removeFromCart(id, event) {
    if (event) event.stopPropagation(); // Чтобы окно не закрывалось

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

// Сохранение в память
function saveCart() {
    localStorage.setItem('sneaker-cart', JSON.stringify(cart));
}

// Обновление интерфейса корзины
function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsContainer = document.querySelector('.cart-items');
    const totalEl = document.querySelector('.cart-total');

    let totalCount = 0;
    let totalPrice = 0;

    itemsContainer.innerHTML = '';

    cart.forEach(item => {
        totalCount += item.count;
        
        // Чистим цену от "р." и пробелов для математики
        const priceVal = parseInt(item.price.replace(/\D/g, '')) || 0;
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

    countEl.innerText = totalCount;
    totalEl.innerText = totalPrice.toLocaleString() + ' руб.';
}

// Открытие/Закрытие корзины
const cartBtn = document.getElementById('cart-btn');
const cartWindow = document.getElementById('cart-window');

cartBtn.addEventListener('click', () => cartWindow.classList.toggle('active'));

window.addEventListener('click', (e) => {
    if (!cartWindow.contains(e.target) && !cartBtn.contains(e.target)) {
        cartWindow.classList.remove('active');
    }
});


// --- 5. ПОИСК (Живой) ---
const searchInput = document.getElementById('site-search');
const resultsContainer = document.getElementById('search-results');

searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim();
    resultsContainer.innerHTML = '';

    if (query.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    // Фильтруем локальную копию базы
    const found = productsDB.filter(p => p.name.toLowerCase().includes(query));

    if (found.length > 0) {
        resultsContainer.style.display = 'block';
        found.forEach(product => {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.innerHTML = `
                <img src="${product.img}" alt="${product.name}">
                <div class="search-item-info">
                    <h4>${product.name}</h4>
                    <p>${product.price}</p>
                </div>
            `;
            
            // Клик по результату
            item.addEventListener('click', () => {
                const card = document.getElementById(product.html_id);
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    card.style.transform = "scale(1.05)";
                    setTimeout(() => card.style.transform = "none", 1000);
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

// ЗАПУСК
initShop();