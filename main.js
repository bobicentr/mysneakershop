const productsDB = [
    { id: 'ye-new', name: 'Yeezy Boosts', price: '23 000р.', img: 'img/yeezy.jpeg', category: 'Новинки' },
    { id: 'am-new', name: 'Nike Air Max 90', price: '13 990р.', img: 'img/airmax.jpeg', category: 'Новинки' },
    { id: 'aj-new', name: 'Nike Air Jordan 3', price: '11 100р.', img: 'img/jordan.jpeg', category: 'Мужские' },
    { id: 'ye-male', name: 'Yeezy Boosts', price: '23 000р.', img: 'img/yeezy.jpeg', category: 'Новинки' },
    { id: 'am-male', name: 'Nike Air Max 90', price: '13 990р.', img: 'img/airmax.jpeg', category: 'Новинки' },
    { id: 'aj-male', name: 'Nike Air Jordan 3', price: '11 100р.', img: 'img/jordan.jpeg', category: 'Мужские' },
    { id: 'ye-female', name: 'Yeezy Boosts', price: '23 000р.', img: 'img/yeezy.jpeg', category: 'Новинки' },
    { id: 'am-female', name: 'Nike Air Max 90', price: '13 990р.', img: 'img/airmax.jpeg', category: 'Новинки' },
    { id: 'aj-female', name: 'Nike Air Jordan 3', price: '11 100р.', img: 'img/jordan.jpeg', category: 'Мужские' },
    // Добавь сюда остальные кроссовки, если есть
];
// 1. КОРЗИНА (Загружаем из памяти или создаем пустую)
let cart = JSON.parse(localStorage.getItem('sneaker-cart')) || [];

const cartBtn = document.getElementById('cart-btn');
const cartWindow = document.getElementById('cart-window');

cartBtn.addEventListener('click', () => {
    cartWindow.classList.toggle('active');
});

// Закрыть, если клик мимо
window.addEventListener('click', (e) => {
    if (!cartWindow.contains(e.target) && !cartBtn.contains(e.target)) {
        cartWindow.classList.remove('active');
    }
});

// --- 4. ДОБАВЛЕНИЕ ТОВАРА ---
function addToCart(id) {
    const product = productsDB.find(p => p.id === id);
    if (!product) return;

    const itemInCart = cart.find(item => item.id === id);

    if (itemInCart) {
        itemInCart.count++;
    } else {
        cart.push({ ...product, count: 1 });
    }

    saveCart();
    updateCartUI(); // <--- ВОТ ЭТО САМОЕ ГЛАВНОЕ, ВЫЗЫВАЕМ ОБНОВЛЕНИЕ
}

// --- 5. УДАЛЕНИЕ ТОВАРА ---
function removeFromCart(id, event) {
    // 1. Останавливаем закрытие окна (как делали в прошлом шаге)
    if (event) {
        event.stopPropagation();
    }

    // 2. Находим этот товар в корзине
    const item = cart.find(product => product.id === id);

    // Защита: если вдруг товара нет, выходим
    if (!item) return;

    // 3. ГЛАВНАЯ ЛОГИКА
    if (item.count > 1) {
        // Если товаров больше одного — просто уменьшаем цифру
        item.count--;
    } else {
        // Если остался последний (или меньше) — удаляем его из массива насовсем
        cart = cart.filter(product => product.id !== id);
    }

    // 4. Сохраняем и перерисовываем
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('sneaker-cart', JSON.stringify(cart));
}

// --- 6. ОБНОВЛЕНИЕ ИНТЕРФЕЙСА (ЦИФРА + СПИСОК) ---
function updateCartUI() {
    const countElement = document.getElementById('cart-count');
    const itemsContainer = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.cart-total');

    // А. Считаем общую сумму и количество
    let totalCount = 0;
    let totalPrice = 0;

    // Б. Очищаем старый список в HTML
    itemsContainer.innerHTML = '';

    cart.forEach(item => {
        totalCount += item.count;
        
        // Превращаем "23 000р." в число 23000
        const priceNum = parseInt(item.price.replace(/\D/g, ''));
        totalPrice += priceNum * item.count;

        // В. Рисуем товар в списке
        const div = document.createElement('div');
        div.className = 'cart-item-row';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.count} шт. x ${item.price}</p>
            </div>
            <!-- БЫЛО: onclick="removeFromCart('${item.id}')" -->
            <!-- СТАЛО (добавили event): -->
            <button class="remove-btn" onclick="removeFromCart('${item.id}', event)">&times;</button>
        `;
        itemsContainer.appendChild(div);
    });

    // Г. Если пусто, пишем сообщение
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">Корзина пуста</p>';
    }

    // Д. Обновляем красную цифру и итоговую сумму
    countElement.innerText = totalCount;
    totalElement.innerText = totalPrice.toLocaleString() + ' руб.';
}

// Запускаем один раз при старте, чтобы показать сохраненные данные
updateCartUI();

// 1. НАША БАЗА ДАННЫХ (Руками вписываем то, что есть на сайте)
// Важно: ID должны совпадать с id в HTML!


const searchInput = document.getElementById('site-search');
const resultsContainer = document.getElementById('search-results');

// 2. СЛУШАЕМ ВВОД ТЕКСТА
searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim(); // Что ввел пользователь (маленькими буквами)
    
    // Очищаем старые результаты
    resultsContainer.innerHTML = '';

    // Если пусто — скрываем блок и уходим
    if (query.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    // 3. ФИЛЬТРАЦИЯ
    // Ищем товары, в названии которых есть введенный текст
    const foundProducts = productsDB.filter(product => 
        product.name.toLowerCase().includes(query)
    );

    // 4. ОТРИСОВКА РЕЗУЛЬТАТОВ
    if (foundProducts.length > 0) {
        resultsContainer.style.display = 'block'; // Показываем блок

        foundProducts.forEach(product => {
            // Создаем элемент списка
            const item = document.createElement('div');
            item.className = 'search-item';
            
            // Вставляем HTML внутрь (Картинка + Текст)
            item.innerHTML = `
                <img src="${product.img}" alt="${product.name}">
                <div class="search-item-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} • ${product.price}</p>
                </div>
            `;

            // 5. КЛИК ПО РЕЗУЛЬТАТУ
            item.addEventListener('click', () => {
                // Находим карточку на странице
                const targetCard = document.getElementById(product.id);
                
                if (targetCard) {
                    // Плавный скролл к товару
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // (Опционально) Подсветим товар на секунду
                    targetCard.style.boxShadow = "0 0 20px rgba(255, 165, 0, 0.7)";
                    setTimeout(() => targetCard.style.boxShadow = "none", 2000);
                }

                // Очищаем поиск
                searchInput.value = '';
                resultsContainer.style.display = 'none';
            });

            resultsContainer.appendChild(item);
        });
    } else {
        // Если ничего не нашли
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<div class="search-item" style="cursor: default;">Ничего не найдено</div>';
    }
});

// 6. ЗАКРЫТЬ ПОИСК, ЕСЛИ КЛИКНУЛИ МИМО
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.style.display = 'none';
    }
});