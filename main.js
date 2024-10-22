const isTouchDevice = () =>
  "ontouchstart" in window || navigator.maxTouchPoints > 0;

const shelf = document.querySelector(".product-list");
const cart = document.querySelector(".cart__body");
const cartList = document.querySelector(".cart-list");
const cartLink = document.querySelector(".cart__link");
const productsList = [];
const cartArray = [];

// get products fc
const fetchProducts = async () => {
  try {
    const response = await fetch("./products.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Ошибка загрузки JSON:", error);
  }
};

class Product {
  constructor(id, name, image) {
    this.id = id;
    this.name = name;
    this.image = image;
  }

  render() {
    const productEl = document.createElement("li");
    productEl.draggable = true;
    productEl.setAttribute("data-id", `${this.id}`);
    productEl.classList.add("product-item");
    const productImage = document.createElement("img");
    productImage.setAttribute("src", `${this.image}`);
    productImage.setAttribute("alt", `${this.name}`);
    productEl.appendChild(productImage);

    if (isTouchDevice()) {
      productEl.addEventListener("touchstart", (ev) => {
        handleTouchStart(ev, this.id);
      });
    } else {
      productEl.addEventListener("dragstart", (ev) => {
        const id = ev.currentTarget.getAttribute("data-id");
        ev.dataTransfer.setData("id", id);
      });
    }

    return productEl;
  }

  static isProductElement(element) {
    return (
      element.classList.contains("product-item") &&
      element.hasAttribute("data-id")
    );
  }
}

// PC VERSION
// first shelf render
const fillShelf = async (productList, shelfEl) => {
  productList.forEach((product) => {
    const newProductItem = new Product(product.id, product.name, product.image);
    productsList.push(newProductItem);
    const productEl = newProductItem.render();
    shelfEl.appendChild(productEl);
  });
};

// main logic fcs
const addToCart = (id) => {
  const currentProduct = productsList.find((item) => item.id === id);
  const currentIndex = cartArray.findIndex((item) => item.id === id);
  if (currentProduct && currentIndex === -1) {
    cartArray.push(currentProduct);
    shelf
      .querySelector(`[data-id="${id}"]`)
      .classList.add("product-item--hidden");
  } else {
    return;
  }
};

const removeFromCart = (id) => {
  const currentIndex = cartArray.findIndex((item) => item.id === id);
  if (currentIndex !== -1) {
    cartArray.splice(currentIndex, 1);
    shelf
      .querySelector(`[data-id="${id}"]`)
      .classList.remove("product-item--hidden");
  }
};

const renderCart = (cartArray, cartListEl) => {
  cartListEl.textContent = "";

  if (cartArray.length > 0) {
    cartArray.forEach((product) => {
      const existingProduct = productsList.find(
        (item) => item.id === product.id
      );
      if (existingProduct) {
        const productEl = existingProduct.render();
        cartListEl.appendChild(productEl);
      }
    });
  }

  if (cartArray.length >= 3) {
    cartLink.classList.add("cart__link--active");
  } else {
    cartLink.classList.remove("cart__link--active");
  }

  cartLink.classList.add("cart__link--animated");
  setTimeout(() => {
    cartLink.classList.remove("cart__link--animated");
  }, 400);
};

// drop fcs
const allowDrop = (ev) => {
  ev.preventDefault();
};

const drag = (ev) => {
  ev.dataTransfer.setData("text", ev.target.id);
};

const drop = (ev) => {
  ev.preventDefault();
  const productId = ev.dataTransfer.getData("id");

  if (ev.currentTarget === cart) {
    addToCart(productId);
    renderCart(cartArray, cartList);
  } else if (
    ev.currentTarget === shelf ||
    Product.isProductElement(ev.currentTarget)
  ) {
    removeFromCart(productId);
    renderCart(cartArray, cartList);
  } else {
    shelf
      .querySelector(`[data-id="${productId}"]`)
      .classList.remove("product-item--hidden");
    return;
  }
};

// add listeners
document.addEventListener("DOMContentLoaded", async () => {
  const products = await fetchProducts();

  await fillShelf(products, shelf);

  shelf.addEventListener("dragover", (e) => {
    allowDrop(e);
  });
  shelf.addEventListener("drop", (e) => {
    drop(e, shelf, cartList);
  });

  cart.addEventListener("dragover", (e) => {
    allowDrop(e);
  });
  cart.addEventListener("drop", (e) => {
    drop(e, shelf, cartList);
  });
});

// MOBILE VERSION
// grab imitation create copy fc
const createTouchCopy = (el) => {
  const copy = el.cloneNode(true);
  copy.style.position = "absolute";
  copy.style.pointerEvents = "none";
  copy.style.opacity = "0.7";
  copy.style.listStyle = "none";
  copy.style.zIndex = 1000;
  copy.style.transform = "translate(-50%, -50%)";
  document.body.appendChild(copy);

  return copy;
};

// move copy fc
const moveTouchCopy = (e, copy) => {
  const touch = e.touches[0];
  const offsetX = touch.clientX;
  const offsetY = touch.clientY;

  copy.style.left = `${offsetX}px`;
  copy.style.top = `${offsetY}px`;
};

// main touch fc
const handleTouchStart = (e, id) => {
  const copy = createTouchCopy(e.currentTarget);

  const moveHandler = (moveEvent) => {
    moveTouchCopy(moveEvent, copy);
  };

  const endHandler = (endEvent) => {
    const touch = endEvent.changedTouches[0];
    const targetElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    if (cart.contains(targetElement)) {
      addToCart(id);
      renderCart(cartArray, cartList);
    } else if (shelf.contains(targetElement)) {
      removeFromCart(id);
      renderCart(cartArray, cartList);
    }

    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", endHandler);
    copy.remove();
  };

  document.addEventListener("touchmove", moveHandler);
  document.addEventListener("touchend", endHandler);
};
