// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJdW4i4Ed7WKcj8IFFMi_oXazjjQw4uu8",
    authDomain: "curser-396bc.firebaseapp.com",
    databaseURL: "https://curser-396bc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "curser-396bc",
    storageBucket: "curser-396bc.appspot.com",
    messagingSenderId: "374369933325",
    appId: "1:374369933325:web:ece51b218f87313d4b9d44",
    measurementId: "G-50PE1PLTQ7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
const database = firebase.database();

// Reference to the products in the database
const productsRef = database.ref('products');

// Keep track of selected products
let selectedProducts = new Set();

// Function to create a product block with quantity controls
function createProductBlock(product, id, isAdmin = false) {
    const productBlock = document.createElement('div');
    productBlock.className = 'product-block';
    productBlock.dataset.id = id;

    productBlock.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        <div class="product-details">
            <div class="product-name">${product.name}</div>
            <div class="product-type">${product.type}</div>
            <div class="product-price">₹${product.price.toFixed(2)}</div>
            <div class="quantity-control">
                <button class="quantity-btn minus" ${isAdmin ? 'disabled' : ''}>-</button>
                <span class="quantity">0</span>
                <button class="quantity-btn plus" ${isAdmin ? 'disabled' : ''}>+</button>
            </div>
        </div>
    `;

    const quantityDisplay = productBlock.querySelector('.quantity');
    const minusBtn = productBlock.querySelector('.minus');
    const plusBtn = productBlock.querySelector('.plus');

    let quantity = 0;

    function updateQuantityDisplay() {
        quantityDisplay.textContent = quantity;
        minusBtn.disabled = quantity === 0;
    }

    function updateProductSelection() {
        if (quantity > 0) {
            productBlock.classList.add('selected');
            selectedProducts.add(id);
        } else {
            productBlock.classList.remove('selected');
            selectedProducts.delete(id);
        }
        updateCartCount();
        localStorage.setItem('selectedProducts', JSON.stringify(Array.from(selectedProducts)));
    }

    minusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (quantity > 0) {
            quantity--;
            updateQuantityDisplay();
            updateProductSelection();
        }
    });

    plusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        quantity++;
        updateQuantityDisplay();
        updateProductSelection();
    });

    if (isAdmin) {
        productBlock.addEventListener('click', () => toggleAdminSelection(id));
    } else {
        productBlock.addEventListener('click', (e) => {
            // Check if the click is not on the quantity control buttons
            if (!e.target.closest('.quantity-control')) {
                if (quantity === 0) {
                    quantity = 1;
                } else {
                    quantity = 0;
                }
                updateQuantityDisplay();
                updateProductSelection();
            }
        });
    }

    return productBlock;
}

// Function to update the cart
function updateCart(product, quantity) {
    if (quantity === 0) {
        selectedProducts.delete(product.id);
    } else {
        selectedProducts.add(product.id);
    }
    updateCartCount();
    localStorage.setItem('selectedProducts', JSON.stringify(Array.from(selectedProducts)));
}

// Function to toggle selection for admin
function toggleAdminSelection(id) {
    const productBlock = document.querySelector(`.product-block[data-id="${id}"]`);
    productBlock.classList.toggle('selected');

    if (selectedProducts.has(id)) {
        selectedProducts.delete(id);
    } else {
        selectedProducts.add(id);
    }

    updateDeleteSelectedButton();
}

// Function to update the "Delete Selected" button
function updateDeleteSelectedButton() {
    const deleteSelectedBtn = document.getElementById('delete-selected');
    if (deleteSelectedBtn) {
        if (selectedProducts.size > 0) {
            deleteSelectedBtn.style.display = 'block';
            deleteSelectedBtn.textContent = `Delete Selected (${selectedProducts.size})`;
        } else {
            deleteSelectedBtn.style.display = 'none';
        }
    }
}

// Function to toggle selection for main page
function toggleSelection(id) {
    const productBlock = document.querySelector(`.product-block[data-id="${id}"]`);
    productBlock.classList.toggle('selected');

    if (selectedProducts.has(id)) {
        selectedProducts.delete(id);
    } else {
        selectedProducts.add(id);
    }

    updateCartCount();
    
    // Save the updated selection to localStorage
    localStorage.setItem('selectedProducts', JSON.stringify(Array.from(selectedProducts)));
}

// Function to update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        let totalQuantity = 0;
        selectedProducts.forEach(id => {
            const quantityElement = document.querySelector(`.product-block[data-id="${id}"] .quantity`);
            totalQuantity += parseInt(quantityElement.textContent);
        });
        cartCount.textContent = totalQuantity;
    }
}

// Function to update the product display
function updateProductDisplay(products, isAdmin = false) {
    const container = document.getElementById('product-container');
    if (container) {
        container.innerHTML = '';

        for (const [id, product] of Object.entries(products)) {
            const productBlock = createProductBlock(product, id, isAdmin);
            container.appendChild(productBlock);
        }
    }
}

// Listen for changes in the products data
productsRef.on('value', (snapshot) => {
    const products = snapshot.val();
    const isAdminPage = window.location.pathname.includes('admin.html');
    updateProductDisplay(products, isAdminPage);
});

// Function to add a product (used by the admin panel)
function addProduct(event) {
    event.preventDefault(); // Prevent default form submission
    
    const name = document.getElementById('productName').value;
    const type = document.getElementById('productType').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const imageUrl = document.getElementById('productImage').value;

    if (name && type && !isNaN(price) && imageUrl) {
        productsRef.push({
            name: name,
            type: type,
            price: price,
            imageUrl: imageUrl
        }).then(() => {
            alert('Product added successfully!');
            // Clear the form
            document.getElementById('add-product-form').reset();
        }).catch((error) => {
            alert('Error adding product: ' + error.message);
        });
    } else {
        alert('Please fill all fields correctly.');
    }
}

// Add product form submission (for admin page)
document.addEventListener('DOMContentLoaded', function() {
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        // Remove any existing event listeners
        addProductForm.removeEventListener('submit', addProduct);
        // Add the event listener
        addProductForm.addEventListener('submit', addProduct);
    }
});

// Function to delete selected products
function deleteSelectedProducts() {
    if (confirm(`Are you sure you want to delete ${selectedProducts.size} selected product(s)?`)) {
        const deletePromises = Array.from(selectedProducts).map(id => 
            productsRef.child(id).remove()
        );

        Promise.all(deletePromises)
            .then(() => {
                alert('Selected products deleted successfully!');
                selectedProducts.clear();
                updateDeleteSelectedButton();
            })
            .catch((error) => {
                alert('Error deleting products: ' + error.message);
            });
    }
}

// Function to open cart page
function openCartPage() {
    // Save selected products to localStorage
    localStorage.setItem('selectedProducts', JSON.stringify(Array.from(selectedProducts)));
    // Load cart content on the same page
    loadCartContent();
}

// Function to load cart content
function loadCartContent() {
    const mainContent = document.getElementById('main-content');
    const cartContent = document.getElementById('cart-content');

    if (mainContent && cartContent) {
        mainContent.style.display = 'none';
        cartContent.style.display = 'block';
        displayCartItems();
    }
}

// Function to go back to main content
function goBackToMain() {
    const mainContent = document.getElementById('main-content');
    const cartContent = document.getElementById('cart-content');

    if (mainContent && cartContent) {
        cartContent.style.display = 'none';
        mainContent.style.display = 'block';
    }
}

// Function to display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    let totalPrice = 0;

    // Get selected products from localStorage
    const selectedProductIds = JSON.parse(localStorage.getItem('selectedProducts')) || [];

    productsRef.once('value', (snapshot) => {
        const products = snapshot.val();
        cartItemsContainer.innerHTML = '';

        selectedProductIds.forEach(productId => {
            const product = products[productId];
            if (product) {
                const quantityElement = document.querySelector(`.product-block[data-id="${productId}"] .quantity`);
                const quantity = parseInt(quantityElement.textContent);
                
                if (quantity > 0) {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${product.name}</div>
                            <div class="cart-item-type">${product.type}</div>
                            <div class="cart-item-price">₹${product.price.toFixed(2)}</div>
                            <div class="cart-item-quantity">Quantity: ${quantity}</div>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                    totalPrice += product.price * quantity;
                }
            }
        });

        totalPriceElement.textContent = totalPrice.toFixed(2);
    });
}

// Add click event to cart icon
const cartIcon = document.getElementById('cart-icon');
if (cartIcon) {
    cartIcon.addEventListener('click', openCartPage);
}

// Add click event to go back button
const goBackButton = document.getElementById('go-back-button');
if (goBackButton) {
    goBackButton.addEventListener('click', goBackToMain);
}

// Add click event to delete selected button
const deleteSelectedBtn = document.getElementById('delete-selected');
if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', deleteSelectedProducts);
}

// Initialize the delete selected button
updateDeleteSelectedButton();

// Load selected products from localStorage on page load
window.addEventListener('load', () => {
    const storedProducts = JSON.parse(localStorage.getItem('selectedProducts'));
    if (storedProducts) {
        selectedProducts = new Set(storedProducts);
        updateCartCount();
    }
});

// ... (keep all the existing code up to the start of the event listeners)

// Function to check if it's a fresh session
function isFreshSession() {
    return !localStorage.getItem('sessionStarted');
}

// Function to mark the session as started
function markSessionStarted() {
    localStorage.setItem('sessionStarted', 'true');
}

// Function to reset the cart
function resetCart() {
    selectedProducts.clear();
    localStorage.removeItem('selectedProducts');
    updateCartCount();
}

// Load selected products from localStorage on page load
window.addEventListener('load', () => {
    if (isFreshSession()) {
        resetCart();
        markSessionStarted();
    } else {
        const storedProducts = JSON.parse(localStorage.getItem('selectedProducts'));
        if (storedProducts) {
            selectedProducts = new Set(storedProducts);
            updateCartCount();
        }
    }
});

// Reset session when the window is closed
window.addEventListener('beforeunload', () => {
    localStorage.removeItem('sessionStarted');
});

// ... (keep all the existing event listeners and function calls)

// Fetch products from Firebase
function fetchProducts() {
    const dbRef = firebase.database().ref('products');
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        productContainer.innerHTML = '';
        for (let id in data) {
            const product = data[id];
            product.id = id;
            const card = createProductCard(product);
            productContainer.appendChild(card);
        }
    });
}

// Create product card with quantity controls
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p>$${product.price.toFixed(2)}</p>
        <div class="quantity-control">
            <button class="quantity-btn minus">-</button>
            <span class="quantity">1</span>
            <button class="quantity-btn plus">+</button>
        </div>
        <button class="add-to-cart">Add to Cart</button>
    `;

    const quantityDisplay = card.querySelector('.quantity');
    const minusBtn = card.querySelector('.minus');
    const plusBtn = card.querySelector('.plus');
    const addToCartBtn = card.querySelector('.add-to-cart');

    let quantity = 1;

    minusBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
        }
    });

    plusBtn.addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
    });

    addToCartBtn.addEventListener('click', () => {
        addToCart(product, quantity);
        quantity = 1;
        quantityDisplay.textContent = quantity;
    });

    return card;
}

// Add to cart function
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }
    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    renderCartItems();
    calculateTotal();
}

// Initialize the app
fetchProducts();

// ... rest of your existing event listeners and functionality ...

const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
};