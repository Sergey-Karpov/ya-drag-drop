const productList = [
  {
    id: "1",
    name: "vine",
    image: "./assets/images/products/product-1.png",
  },
  {
    id: "2",
    name: "milk",
    image: "./assets/images/products/product-2.png",
  },
  {
    id: "3",
    name: "jam",
    image: "./assets/images/products/product-3.png",
  },
  {
    id: "4",
    name: "cheese",
    image: "./assets/images/products/product-4.png",
  },
  {
    id: "5",
    name: "bacon",
    image: "./assets/images/products/product-5.png",
  },
  {
    id: "6",
    name: "chicken",
    image: "./assets/images/products/product-6.png",
  },
  {
    id: "7",
    name: "chips",
    image: "./assets/images/products/product-7.png",
  },
  {
    id: "8",
    name: "pineapple",
    image: "./assets/images/products/product-8.png",
  },
  {
    id: "9",
    name: "bananas",
    image: "./assets/images/products/product-9.png",
  },
  {
    id: "10",
    name: "apple",
    image: "./assets/images/products/product-10.png",
  },
  {
    id: "11",
    name: "salad",
    image: "./assets/images/products/product-11.png",
  },
];

const shelf = document.querySelector(".product-shelf");
const cartBody = document.querySelector(".cart__body");
const cartDisplay = document.querySelector(".cart");
const cart = document.querySelector(".product-cart");
const cartLink = document.querySelector(".cart__link");
const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
let currentDraggedId = null;
let dragDirection = "";

class Product {
  constructor(id, name, image) {
    this.id = id;
    this.name = name;
    this.image = image;
    this.el = Product.createEl(this.image, this.id);
    this.addEventListeners();
  }

  static createEl(image, id) {
    const el = document.createElement("div");
    el.classList.add("product-item");
    el.setAttribute("data-id", `${id}`);
    el.draggable = true;
    const imageEl = document.createElement("img");
    imageEl.src = image;
    el.append(imageEl);

    return el;
  }

  addEventListeners() {
    let draggedElementCopy = null;

    const startHandler = (event) => {
      currentDraggedId = this.id;

      if (isTouchScreen) {
        draggedElementCopy = new DragCopy(this.el);

        if (checkEventRect(event.touches[0], shelf)) {
          dragDirection = "from shelf to cart";
        } else if (checkEventRect(event.touches[0], cartBody)) {
          dragDirection = "from cart to shelf";
        }

        draggedElementCopy.createCopy(event);
      } else {
        event.dataTransfer.setData("text/plain", this.id);
      }
      this.el.classList.toggle("product-item--hidden");
    };

    const moveHandler = (event) => {
      if (isTouchScreen && draggedElementCopy) {
        draggedElementCopy.updatePosition(event);
      }
    };

    const endHandler = () => {
      if (isTouchScreen) {
        if (checkEventRect(event.changedTouches[0], cartBody)) {
          moveProduct(dragDirection);
        } else if (checkEventRect(event.changedTouches[0], shelf)) {
          moveProduct(dragDirection);
        }

        draggedElementCopy.removeCopy();
      }

      this.el.classList.toggle("product-item--hidden");
      currentDraggedId = null;
    };

    this.el.addEventListener(
      isTouchScreen ? "touchstart" : "dragstart",
      startHandler
    );
    if (isTouchScreen) {
      this.el.addEventListener("touchmove", moveHandler);
    }
    this.el.addEventListener(
      isTouchScreen ? "touchend" : "dragend",
      endHandler
    );
  }
}

class DragCopy {
  constructor(element) {
    this.element = element;
    this.copy = null;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  createCopy(touchEvent) {
    this.copy = this.element.cloneNode(true);
    const touch = touchEvent.touches[0];
    this.offsetX = touch.clientX;
    this.offsetY = touch.clientY;
    this.copy.style.pointerEvents = "none";
    this.copy.style.position = "absolute";
    this.copy.style.transform = "translate(-50%, -50%)";
    this.copy.style.left = `${this.offsetX}px`;
    this.copy.style.top = `${this.offsetY}px`;
    this.copy.style.opacity = "0.6";
    document.body.append(this.copy);
  }

  updatePosition(touchEvent) {
    if (this.copy) {
      const touch = touchEvent.touches[0];
      this.copy.style.left = `${touch.clientX}px`;
      this.copy.style.top = `${touch.clientY}px`;
    }
  }

  removeCopy() {
    if (this.copy) {
      document.body.removeChild(this.copy);
      this.copy = null;
    }
  }
}

const fillShelf = (shelfEl, prodList) => {
  prodList.forEach((element) => {
    const prodEl = new Product(element.id, element.name, element.image).el;
    shelfEl.append(prodEl);
  });
};

const initializeEventListenersForShelfAndCart = () => {
  if (isTouchScreen) {
  } else {
    cartBody.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    shelf.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    cartBody.addEventListener("drop", (event) => {
      event.preventDefault();
      addElementToList(cart);
      changeCartLinkState();
    });

    shelf.addEventListener("drop", (event) => {
      event.preventDefault();
      addElementToList(shelf);
      changeCartLinkState();
    });
  }
};

const addElementToList = (listEl) => {
  const dragElement = document.querySelector(`[data-id="${currentDraggedId}"]`);
  listEl.append(dragElement);

  if (listEl === cart) {
    animateCart();
  }
};

const checkEventRect = (event, element) => {
  const rect = element.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
};

const moveProduct = (direction) => {
  if (direction === "from shelf to cart") {
    addElementToList(cart);
  } else if (direction === "from cart to shelf") {
    addElementToList(shelf);
  }

  changeCartLinkState();
};

const animateCart = () => {
  cartDisplay.classList.add("cart--animated");

  if (cartDisplay.classList.contains("cart--animated")) {
    setTimeout(() => {
      cartDisplay.classList.remove("cart--animated");
    }, 300);
  }
};

const changeCartLinkState = () => {
  if (cart.querySelectorAll(".product-item").length >= 3) {
    cartLink.classList.add("cart__link--active");
  } else {
    cartLink.classList.remove("cart__link--active");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fillShelf(shelf, productList);
  initializeEventListenersForShelfAndCart();
});
