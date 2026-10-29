
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoryTabs = document.getElementById("categoryTabs");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const resultCount = document.getElementById("resultCount");
const cartCount = document.getElementById("cartCount");
const cartList = document.getElementById("cartList");
const themeBtn = document.getElementById("themeBtn");

let products = [];
let selectedCategory = "all";
let searchTerm = "";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

let cart = readStorage("productExplorerCart", []);
if (!Array.isArray(cart)) cart = [];

const savedTheme = readStorage("productExplorerTheme", "light");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

function saveCart() {
  try {
    localStorage.setItem("productExplorerCart", JSON.stringify(cart));
  } catch {
    showError("Could not save the cart in this browser.");
  }
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = !message;
}

function renderCategories() {
  const categories = [
    "all",
    ...new Set(products.map(product => product.category))
  ];

  categoryTabs.replaceChildren();

  categories.forEach(category => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent =
      category === "all" ? "All Products" : category;

    button.classList.toggle(
      "active",
      category === selectedCategory
    );

    button.addEventListener("click", () => {
      selectedCategory = category;
      renderCategories();
      renderProducts();
    });

    categoryTabs.appendChild(button);
  });
}

function getVisibleProducts() {
  let visible = products.filter(product => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  switch (sortSelect.value) {
    case "low":
      visible.sort((a, b) => a.price - b.price);
      break;
    case "high":
      visible.sort((a, b) => b.price - a.price);
      break;
    case "name":
      visible.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      break;
  }

  return visible;
}

function renderProducts() {
  const visible = getVisibleProducts();
  productGrid.replaceChildren();

  resultCount.textContent =
    `${visible.length} product(s) found`;

  if (visible.length === 0) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = "No products match your search.";
    productGrid.appendChild(message);
    return;
  }

  visible.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";

    const title = document.createElement("h3");
    title.textContent = product.title;

    const category = document.createElement("p");
    category.className = "category";
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = `$${product.price.toFixed(2)}`;

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add to Cart";
    addButton.addEventListener("click", () => {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price
      });
      saveCart();
      renderCart();
    });

    card.append(image, title, category, price, addButton);
    productGrid.appendChild(card);
  });
}

function renderCart() {
  cartCount.textContent = cart.length;
  cartList.replaceChildren();

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent =
      `${item.title} — $${Number(item.price).toFixed(2)}`;
    cartList.appendChild(li);
  });

  if (cart.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Your cart is empty.";
    cartList.appendChild(li);
  }
}

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim();
  renderProducts();
});

sortSelect.addEventListener("change", renderProducts);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const theme = document.body.classList.contains("dark")
    ? "dark"
    : "light";

  try {
    localStorage.setItem(
      "productExplorerTheme",
      JSON.stringify(theme)
    );
  } catch {
    showError("Theme preference could not be saved.");
  }
});

document.getElementById("clearCart").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

async function initializeApp() {
  loading.hidden = false;
  showError("");

  try {
    products = await fetchProducts();
    renderCategories();
    renderProducts();
  } catch (error) {
    showError(
      `${error.message} Check your internet connection and reload the page.`
    );
  } finally {
    loading.hidden = true;
  }

  renderCart();
}

initializeApp();
