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
];

let cart = JSON.parse(localStorage.getItem('sneaker-cart')) || [];

const cartBtn = document.getElementById('cart-btn');
const cartWindow = document.getElementById('cart-window');

cartBtn.addEventListener('click', () => {
    cartWindow.classList.toggle('active');
});


window.addEventListener('click', (e) => {
    if (!cartWindow.contains(e.target) && !cartBtn.contains(e.target)) {
        cartWindow.classList.remove('active');
    }
});

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
    updateCartUI();
}

function removeFromCart(id, event) {
    if (event) {
        event.stopPropagation();
    }
    const item = cart.find(product => product.id === id);
    if (!item) return;
    if (item.count > 1) {
        item.count--;
    } else {
        cart = cart.filter(product => product.id !== id);
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('sneaker-cart', JSON.stringify(cart));
}
function updateCartUI() {
    const countElement = document.getElementById('cart-count');
    const itemsContainer = document.querySelector('.cart-items');
    const totalElement = document.querySelector('.cart-total');
    let totalCount = 0;
    let totalPrice = 0;
    itemsContainer.innerHTML = '';

    cart.forEach(item => {
        totalCount += item.count;
        const priceNum = parseInt(item.price.replace(/\D/g, ''));
        totalPrice += priceNum * item.count;
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
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#777;">Корзина пуста</p>';
    }
    countElement.innerText = totalCount;
    totalElement.innerText = totalPrice.toLocaleString() + ' руб.';
}
updateCartUI();
const searchInput = document.getElementById('site-search');
const resultsContainer = document.getElementById('search-results');

searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase().trim(); 
    resultsContainer.innerHTML = '';
    if (query.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }
    const foundProducts = productsDB.filter(product => 
        product.name.toLowerCase().includes(query)
    );
    if (foundProducts.length > 0) {
        resultsContainer.style.display = 'block';

        foundProducts.forEach(product => {
            const item = document.createElement('div');
            item.className = 'search-item';
            item.innerHTML = `
                <img src="${product.img}" alt="${product.name}">
                <div class="search-item-info">
                    <h4>${product.name}</h4>
                    <p>${product.category} • ${product.price}</p>
                </div>
            `;
            item.addEventListener('click', () => {
                const targetCard = document.getElementById(product.id);
                
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.style.boxShadow = "0 0 20px rgba(255, 165, 0, 0.7)";
                    setTimeout(() => targetCard.style.boxShadow = "none", 2000);
                }
                searchInput.value = '';
                resultsContainer.style.display = 'none';
            });

            resultsContainer.appendChild(item);
        });
    } else {
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<div class="search-item" style="cursor: default;">Ничего не найдено</div>';
    }
});
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
        resultsContainer.style.display = 'none';
    }
});
