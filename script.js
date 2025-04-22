const sidebarElements = document.querySelectorAll(".element");
const playground = document.getElementById("playground");
const propertiesContent = document.getElementById("propertiesContent");

let currentId = 0;
let selectedElement = null;
let isDragging = false; // To track if dragging is in progress

sidebarElements.forEach((el) => {
  el.addEventListener("dragstart", (e) => {
    isDragging = true; // Mark dragging started
    e.dataTransfer.setData("type", e.target.dataset.type);
    e.dataTransfer.setDragImage(new Image(), 0, 0); // Prevent default ghost image
  });

  el.addEventListener("dragend", () => {
    isDragging = false; // Mark dragging ended
  });
});

playground.addEventListener("dragover", (e) => {
  e.preventDefault();
});

playground.addEventListener("drop", (e) => {
  e.preventDefault();

  // Prevent creating a new box if not in dragging mode
  if (!isDragging) return;

  const type = e.dataTransfer.getData("type");
  const el = createElement(type, e.offsetX, e.offsetY);
  playground.appendChild(el);
});

function createElement(type, x, y) {
  const el = document.createElement("div");
  el.className = "draggable";
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.dataset.type = type;
  el.dataset.id = "el" + ++currentId;
  el.setAttribute("draggable", "true");

  if (type === "text") {
    el.textContent = "Double-click to edit text";
    el.setAttribute("contenteditable", "false");

    // Allow editing on double-click
    el.addEventListener("dblclick", () => {
      el.setAttribute("contenteditable", "true");
      el.focus();
      // Clear the default text when editing begins
      el.textContent = "";
    });

    // Disable editing on blur
    el.addEventListener("blur", () => {
      if (el.textContent.trim() === "") {
        el.textContent = "Double-click to edit text"; // Restore default text if empty
      }
      el.setAttribute("contenteditable", "false");
    });
  } else if (type === "image") {
    const img = document.createElement("img");
    img.src = "https://images.unsplash.com/photo-1743538441678-e06e4de4ad71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1fHx8ZW58MHx8fHx8";
    img.width = 100;
    el.appendChild(img);
  } else if (type === "shape") {
    el.innerHTML =
      '<svg width="50" height="50"><circle cx="25" cy="25" r="20" fill="blue" /></svg>';
  }

  el.addEventListener("click", (e) => {
    if (selectedElement === el) return;

    selectedElement = el;
    showProperties(el);
  });

  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("id", el.dataset.id);
  });

  el.addEventListener("dragend", (e) => {
    el.style.left = e.pageX - playground.offsetLeft + "px";
    el.style.top = e.pageY - playground.offsetTop + "px";
  });

  return el;
}

function showProperties(el) {
  const type = el.dataset.type;
  let html = "";

  if (type === "text") {
    const currentStyles = window.getComputedStyle(el);
    html += `
      <label>Font Family:
        <select onchange="updateStyle('fontFamily', this.value)">
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
      </label>
      <label>Font Size: 
        <input type="number" value="${parseInt(
          currentStyles.fontSize
        )}" onchange="updateStyle('fontSize', this.value + 'px')">
      </label>
      <label>
        <input type="checkbox" onchange="toggleStyle('fontWeight', 'bold')" 
          ${
            currentStyles.fontWeight === "700" ||
            currentStyles.fontWeight === "bold"
              ? "checked"
              : ""
          }> Bold
      </label>
      <label>
        <input type="checkbox" onchange="toggleStyle('fontStyle', 'italic')"
          ${currentStyles.fontStyle === "italic" ? "checked" : ""}> Italic
      </label>
      <label>
        <input type="checkbox" onchange="toggleStyle('textDecoration', 'underline')"
          ${
            currentStyles.textDecoration.includes("underline") ? "checked" : ""
          }> Underline
      </label>
    `;
  } else if (type === "image") {
    html += `
          <label>Image URL: <input type="text" onchange="updateImageSrc(this.value)" value="https://via.placeholder.com/100"></label>
        `;
  } else if (type === "shape") {
    html += `
          <label>SVG Color: <input type="text" value="blue" onchange="updateShapeColor(this.value)"></label>
        `;
  }

  html += `
        <label>Width: <input type="number" value="${el.offsetWidth}" onchange="updateStyle('width', this.value + 'px')"></label>
        <label>Height: <input type="number" value="${el.offsetHeight}" onchange="updateStyle('height', this.value + 'px')"></label>
      `;

  propertiesContent.innerHTML = html;
}

function updateStyle(property, value) {
  if (!selectedElement) return;

  if (selectedElement.dataset.type === "image") {
    const img = selectedElement.querySelector("img");
    if (img) img.style[property] = value;
  } else if (selectedElement.dataset.type === "shape") {
    const svg = selectedElement.querySelector("svg");
    const circle = svg.querySelector("circle");

    if (property === "width" || property === "height") {
      svg.setAttribute(property, parseInt(value));
      const radius =
        Math.min(svg.getAttribute("width"), svg.getAttribute("height")) / 2 - 5;
      circle.setAttribute("r", radius);
      circle.setAttribute("cx", svg.getAttribute("width") / 2);
      circle.setAttribute("cy", svg.getAttribute("height") / 2);
    }
  } else {
    selectedElement.style[property] = value;
  }
}

function toggleStyle(property, value) {
  if (!selectedElement) return;
  const current = selectedElement.style[property];
  selectedElement.style[property] = current === value ? "" : value;
}

function updateImageSrc(src) {
  if (!selectedElement) return;
  const img = selectedElement.querySelector("img");
  if (img) img.src = src;
}

function updateShapeColor(color) {
  if (!selectedElement) return;
  const svg = selectedElement.querySelector("svg circle");
  if (svg) svg.setAttribute("fill", color);
}
