// 1. НАША БАЗА ДАННЫХ (Руками вписываем то, что есть на сайте)
// Важно: ID должны совпадать с id в HTML!
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