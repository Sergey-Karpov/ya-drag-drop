import productList from "./products.js";

const shelf = document.querySelector(".product-shelf");
const cartBody = document.querySelector(".cart__body");
const cart = document.querySelector(".product-cart");
const cartLink = document.querySelector(".cart__link");
const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
let dragElId = null;
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
    if (isTouchScreen) {
      const dragCopy = new DragCopy(this.el);

      this.el.addEventListener("touchstart", (event) => {
        dragElId = this.id;

        if (checkEventRect(event.touches[0], shelf)) {
          dragDirection = "from shelf to cart";
        } else if (checkEventRect(event.touches[0], cartBody)) {
          dragDirection = "from cart to shelf";
        }

        dragCopy.createCopy(event);
        this.el.classList.toggle("product-item--hidden");
      });

      this.el.addEventListener("touchmove", (event) => {
        dragCopy.updatePosition(event);
      });

      this.el.addEventListener("touchend", (event) => {
        if (checkEventRect(event.changedTouches[0], cartBody)) {
          moveProduct(dragDirection);
        } else if (checkEventRect(event.changedTouches[0], shelf)) {
          moveProduct(dragDirection);
        }

        dragCopy.removeCopy();
        this.el.classList.toggle("product-item--hidden");
        dragElId = null;
      });
    } else {
      this.el.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", this.id);
        this.el.classList.toggle("product-item--hidden");
        dragElId = this.id;
      });

      this.el.addEventListener("dragend", () => {
        this.el.classList.toggle("product-item--hidden");
        dragElId = null;
      });
    }
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

const initShelfCartLEventListeners = () => {
  if (isTouchScreen) {
  } else {
    cartBody.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    shelf.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    cartBody.addEventListener("dragleave", (event) => {});

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
  const dragElement = document.querySelector(`[data-id="${dragElId}"]`);
  listEl.append(dragElement);
};

const removeElementFromList = (listEl) => {
  const dragElement = document.querySelector(`[data-id="${dragElId}"]`);
  listEl.append(dragElement);
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
    removeElementFromList(shelf);
    addElementToList(cart);
  } else if (direction === "from cart to shelf") {
    removeElementFromList(cart);
    addElementToList(shelf);
  }

  changeCartLinkState();
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
  initShelfCartLEventListeners();
});
