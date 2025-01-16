// Cart open close
let cartIcon = document.querySelector('#cart-icon');
let cart = document.querySelector('.cart');
let closeCart = document.querySelector('#close-cart');

cartIcon.onclick = () => {
    cart.classList.add('active');
}

closeCart.onclick = () => {
    cart.classList.remove('active');
}

// Add to Cart
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    // Remove items from cart
    let removeCartButtons = document.getElementsByClassName('cart-remove');
    for (let i = 0; i < removeCartButtons.length; i++) {
        let button = removeCartButtons[i];
        button.addEventListener('click', removeCartItem);
    }

    // Quantity Changes
    let quantityInputs = document.getElementsByClassName('cart-quantity');
    for (let i = 0; i < quantityInputs.length; i++) {
        let input = quantityInputs[i];
        input.addEventListener('change', quantityChanged);
    }

    // Add to Cart
    let addCart = document.getElementsByClassName('add-cart');
    for (let i = 0; i < addCart.length; i++) {
        let button = addCart[i];
        button.addEventListener('click', addCartItem);
    }

    loadCartItems();
    updateCartIcon();
}

// Remove Cart Item
function removeCartItem(event) {
    let buttonClicked = event.target;
    buttonClicked.parentElement.remove();
    updateTotal();
    saveCartItems();
    updateCartIcon(); 
}

// Quantity Changes
function quantityChanged(event) {
    let input = event.target;
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1;
    }
    updateTotal();
    saveCartItems();
    updateCartIcon(); 
}

// Add to Cart
function addCartItem(event) {
    let button = event.target;
    let shopProducts = button.parentElement;
    let title = shopProducts.getElementsByClassName('product-title')[0].innerText;
    let price = shopProducts.getElementsByClassName('price')[0].innerText;
    let productImg = shopProducts.getElementsByClassName('product-img')[0].src;
    addToCart(title, price, productImg);

    updateTotal();
    saveCartItems();
    updateCartIcon(); 
}

function addToCart(title, price, productImg) {
    let cartShopBox = document.createElement('div');
    cartShopBox.classList.add('cart-box');
    let cartItems = document.getElementsByClassName('cart-content')[0];

    let cartBoxContent = `
        <img src="${productImg}" class="cart-img">
        <div class="detail-box">
            <div class="cart-product-title">${title}</div>
            <div class="cart-price">${price}</div>
            <input type="number" value="1" class="cart-quantity">
        </div>
        <i class='bx bx-trash-alt cart-remove'></i>
    `;

    cartShopBox.innerHTML = cartBoxContent;
    cartItems.append(cartShopBox);

    cartShopBox.getElementsByClassName('cart-remove')[0].addEventListener('click', removeCartItem);
    cartShopBox.getElementsByClassName('cart-quantity')[0].addEventListener('change', quantityChanged);

    updateTotal();
    saveCartItems();
    updateCartIcon(); // Atualiza o ícone do carrinho
}

// Update Total
function updateTotal() {
    let cartContent = document.getElementsByClassName('cart-content')[0];
    let cartBoxes = cartContent.getElementsByClassName('cart-box');
    let total = 0;

    for (let i = 0; i < cartBoxes.length; i++) {
        let cartBox = cartBoxes[i];

        let priceElement = cartBox.querySelector('.cart-price');  
        let quantityElement = cartBox.querySelector('.cart-quantity'); 

        if (!priceElement || !quantityElement) {
            continue; // Se algum elemento não for encontrado, saltar para o próximo
        }

        let price = parseFloat(priceElement.innerText.replace('R$', '').replace(',', '.').trim());
        let quantity = quantityElement.value;

        if (isNaN(price) || isNaN(quantity)) {
            continue; // Se houver erro ao converter, saltar para o próximo
        }

        total += price * quantity;
    }

    total = Math.round(total * 100) / 100;
    document.getElementsByClassName('total--price')[0].innerText = 'R$' + total.toFixed(2).replace('.', ',');

    // Salvar o total no localStorage
    localStorage.setItem('cartTotal', total);
}

// Keep Item in Cart when Refresh
function saveCartItems() {
    let cartContent = document.getElementsByClassName('cart-content')[0];
    let cartBoxes = cartContent.getElementsByClassName('cart-box');
    let cartItems = [];

    for (let i = 0; i < cartBoxes.length; i++) {
        let cartBox = cartBoxes[i];
        let titleElement = cartBox.getElementsByClassName('cart-product-title')[0];
        let priceElement = cartBox.querySelector('.cart-price');
        let quantityElement = cartBox.querySelector('.cart-quantity');
        let productImgElement = cartBox.getElementsByClassName('cart-img')[0]; // Agora verificamos a imagem

        if (!titleElement || !priceElement || !quantityElement || !productImgElement) {
            continue; 
        }

        let item = {
            title: titleElement.innerText,
            price: priceElement.innerText.replace('R$', '').replace(',', '.').trim(),
            quantity: quantityElement.value,
            productImg: productImgElement.src 
        };

        cartItems.push(item);
    }

    if (cartItems.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
        localStorage.removeItem('cartItems');
    }
}

// Load Cart Items
function loadCartItems() {
    let cartItems = localStorage.getItem('cartItems');
    if (cartItems) {
        cartItems = JSON.parse(cartItems);
        for (let i = 0; i < cartItems.length; i++) {
            let item = cartItems[i];
            addToCart(item.title, item.price, item.productImg);

            let cartBoxes = document.getElementsByClassName('cart-box');
            let cartBox = cartBoxes[cartBoxes.length - 1];
            let quantityElement = cartBox.querySelector('.cart-quantity');
            quantityElement.value = item.quantity; 
        }
    }

    updateTotal();  
    updateCartIcon(); 

    let cartTotal = localStorage.getItem('cartTotal');
    if (cartTotal) {
        document.getElementsByClassName('total--price')[0].innerText = 'R$' + cartTotal;
    }
}

//quantity in Cart Icon
function updateCartIcon() {
    var cartBoxes = document.getElementsByClassName('cart-box');
    var quantity = 0;

    for (let i = 0; i < cartBoxes.length; i++) {
        var cartBox = cartBoxes[i];
        var quantityElement = cartBox.querySelector('.cart-quantity'); 

        if (quantityElement) {
            quantity += parseInt(quantityElement.value) || 0;  
        }
    }

    var cartIcon = document.querySelector('#cart-icon');
    if (cartIcon) {
        cartIcon.setAttribute('data-quantity', quantity);
    }
}

//Clear cart after success order
function clearCart() {
    var cartContent = document.getElementsByClassName('cart-content')[0];
    cartContent.innerHTML = '';
    updateTotal();
    localStorage.removeItem('cartItems');

}