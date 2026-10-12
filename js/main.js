let category_nav_list = document.querySelector(".category_nav_list");

function Open_Categ_list() {
    category_nav_list.classList.toggle("active")

}

let nav_links = document.querySelector(".nav_links")

function open_Menu() {
    nav_links.classList.toggle("active")
}


var cart = document.querySelector('.cart');

function open_close_cart() {
    cart.classList.toggle("active")
}

// Delegation also handles cards rendered after the product request completes.
let catalogPromise;
document.addEventListener('click', async event => {
    const button = event.target.closest('.btn_add_cart');
    if (!button) return;
    event.preventDefault();
    // Related cards on the detail page have their own handler.
    if (document.getElementById('btn_add_detail')) return;
    if (button.classList.contains('active') || button.dataset.loading) return;
    button.dataset.loading = 'true';
    try {
        catalogPromise ||= fetch('products.json').then(response => {
            if (!response.ok) throw new Error('Could not load products');
            return response.json();
        });
        const data = await catalogPromise;
        const product = data.find(item => String(item.id) === button.dataset.id);
        if (product) addToCart(product);
    } catch (error) {
        catalogPromise = null;
        console.error(error);
    } finally {
        delete button.dataset.loading;
    }
});

function addToCart(product) {

    let cart = JSON.parse(localStorage.getItem('cart')) || []

    if (!product) return;
    if (!cart.some(item => item.id === product.id)) {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart))


    updateCart()
}



function updateCart() {
    const cartItemsContainer = document.getElementById("cart_items")

    const cart = JSON.parse(localStorage.getItem('cart')) || []


    var total_Price = 0
    var total_count = 0

    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";
    cart.forEach((item, index) => {

        let total_Price_item = item.price * item.quantity;

        total_Price += total_Price_item
        total_count += item.quantity


        cartItemsContainer.innerHTML += `
        
            <div class="item_cart">
                <img src="${item.img}" alt="">
                <div class="content">
                    <h4>${item.name}</h4>
                    <p class="price_cart">$${total_Price_item}</p>
                    <div class="quantity_control">
                        <button class="decrease_quantity" data-index=${index}>-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="Increase_quantity" data-index=${index}>+</button>
                    </div>
                </div>

                <button class="delete_item" data-inex="${index}" ><i class="fa-solid fa-trash-can"></i></button>
            </div>


        `
    })


    const price_cart_total = document.querySelector('.price_cart_toral')

    const count_item_cart = document.querySelector('.Count_item_cart')

    const count_item_header = document.querySelector('.count_item_header')

    price_cart_total.innerHTML = `$ ${total_Price}`

    count_item_cart.innerHTML = total_count

    count_item_header.innerHTML = total_count


    document.querySelectorAll('.btn_add_cart').forEach(button => {
        const inCart = cart.some(item => String(item.id) === button.dataset.id);
        button.classList.toggle('active', inCart);
        button.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> ' + (inCart ? 'Item in cart' : 'add to cart');
    });
    const detailButton = document.getElementById('btn_add_detail');
    if (detailButton) {
        const id = new URLSearchParams(location.search).get('id') || '0';
        const inCart = cart.some(item => String(item.id) === id);
        detailButton.classList.toggle('in_cart', inCart);
        detailButton.innerHTML = '<i class="fa-solid fa-cart-shopping"></i> ' + (inCart ? 'Already in Basket' : 'Add to Basket');
    }
    displayCheckoutSummary();

    const increaseButtons = document.querySelectorAll(".Increase_quantity")
    const decreaseButtons = document.querySelectorAll(".decrease_quantity")

    increaseButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const itemIndex = event.target.getAttribute("data-index")
            increaseQuantity(itemIndex)
        })
    })


    decreaseButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            const itemIndex = event.target.getAttribute("data-index")
            decreaseQuantity(itemIndex)
        })
    })



    const delteButtons = document.querySelectorAll('.delete_item')

    delteButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const itemIndex = event.target.closest('button').getAttribute('data-inex')
            removeFromCart(itemIndex)
        })
    })

}


function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []
    cart[index].quantity += 1
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
}

function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []

    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
}





function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || []

    const removeProduct = cart.splice(index, 1)[0]
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCart()
    updateButoonsState(removeProduct.id)
}


function updateButoonsState(productId) {
    const allMatchingButtons = document.querySelectorAll(`.btn_add_cart[data-id="${productId}"]`)
    allMatchingButtons.forEach(button => {
        button.classList.remove('active');
        button.innerHTML = `      <i class="fa-solid fa-cart-shopping"></i> add to cart`
    })
}

updateCart()



function handleNewsletterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();

    if (!email) return;

    // Create toast
    let toast = document.querySelector('.newsletter_success_toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'newsletter_success_toast';
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> Demo only: email delivery is not connected yet.`;
        document.body.appendChild(toast);
    }

    // Reset and show
    input.value = '';
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}



function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('summaryItems');
    const subtotalElement = document.getElementById('subtotalText');
    const totalElement = document.getElementById('totalText');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = 0;
    const shipping = cart.length ? 20 : 0;
    const shippingElement = document.getElementById("shippingText");
    if (shippingElement) shippingElement.innerText = `$${shipping.toFixed(2)}`;

    if (!summaryContainer || !subtotalElement || !totalElement) return;
    summaryContainer.innerHTML = "";

    if (cart.length === 0) {
        summaryContainer.innerHTML = "<p style='padding:20px; text-align:center;'>Your cart is empty!</p>";
    } else {
        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;

            summaryContainer.innerHTML += `
                <div class="item_cart">
                    <div class="image_name">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="content">
                            <h4>${item.name}</h4>
                            <p class="price_cart">$${item.price}</p>
                            <div class="quantity_control">
                                <button type="button" onclick="updateQty(${index}, -1)">-</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button type="button" onclick="updateQty(${index}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="delete_item" onclick="removeItem(${index})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        });
    }

    subtotalElement.innerText = `$${subtotal.toFixed(2)}`;
    totalElement.innerText = `$${(subtotal + shipping).toFixed(2)}`;
}

window.updateQty = function (index, change) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    if (cart[index].quantity + change > 0) {
        cart[index].quantity += change;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }
}

window.removeItem = function (index) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

document.addEventListener('DOMContentLoaded', displayCheckoutSummary);

function toggleModal(type = 'login') {
    const modal = document.getElementById('authModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
        switchForm(type);
    }
}

function switchForm(type) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (type === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

window.onclick = function (event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}



// This project has no configured order endpoint yet.
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) checkoutForm.addEventListener('submit', event => {
    event.preventDefault();
    const items = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('orderStatus').textContent = items.length
        ? 'Order submission is not connected yet. No order or payment has been sent.'
        : 'Your cart is empty. Add a product before placing an order.';
});
