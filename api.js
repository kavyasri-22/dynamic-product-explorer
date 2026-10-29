
const API_URL = "https://fakestoreapi.com/products";

async function fetchProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to load products. Please try again.");
  }

  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error("The API returned an unexpected response.");
  }

  return products;
}
