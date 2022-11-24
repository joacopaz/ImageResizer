// Crop checkbox

const cropCheck = document.getElementById("crop");
const cropVals = document.getElementById("cropVals");
const cropSizeRange = document.getElementById("cropHeight");
document.querySelector("#cropHeightVal").innerText = cropSizeRange.value + "%";

cropCheck.checked
	? (cropVals.style.display = "flex")
	: (cropVals.style.display = "none");
cropCheck.checked
	? (cropVals.style.opacity = 100)
	: (cropVals.style.opacity = 0);

cropCheck.onchange = ({ target }) => {
	cropVals.style.display = target.checked ? "flex" : "none";
	cropVals.style.opacity = target.checked ? 100 : 0;
};
cropSizeRange.onchange = ({ target }) =>
	(document.querySelector("#cropHeightVal").innerText = target.value + "%");

const tracker = document.createElement("div");
tracker.classList.add("selector");
let globalImg;
let currentSelector;

const handleFirstStep = ({ image, canvas, ratio, loader }) => {
	currentStep = 0;
	const container = document.createElement("div");
	container.classList.add("imgContainer");
	container.classList.add("preview");
	container.appendChild(image);
	globalImg = container;
	const selector = document.createElement("div");
	currentSelector = selector;
	selector.classList.add("selector");
	selector.style.width = canvas.width * (cropSizeRange.value / 100) + "px";
	selector.style.height = canvas.height * (cropSizeRange.value / 100) + "px";

	cropSizeRange.onchange = ({ target }) => {
		document.querySelector("#cropHeightVal").innerText = target.value + "%";
		const index = cropSizeRange.value / 100;
		selector.style.width = canvas.width * index + "px";
		selector.style.height = canvas.height * index + "px";
	};

	container.appendChild(selector);
	const header = document.createElement("h3");
	header.textContent = `Preview ${ratio.w}x${ratio.h}`;
	output.appendChild(container);
	output.appendChild(header);
	output.style.flexDirection = "column";
	loader.style.opacity = 0;
	selector.draggable = true;
	dragElement(selector);
	cropHeightVal.onchange = ({ target }) => {
		selector.style.width = selector.style.width * (target.value / 100);
		selector.style.height = selector.style.height * (target.value / 100);
	};
	return selector;
};
const dragElement = (ele) => {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;
	if (document.getElementById(ele.id + "header")) {
		// if present, the header is where you move the DIV from:
		document.getElementById(ele.id + "header").onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		ele.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		const top = ele.offsetTop - pos2;
		const left = ele.offsetLeft - pos1;
		const selectorHeight = parseInt(currentSelector.style.height);
		const selectorWidth = parseInt(currentSelector.style.width);

		// set the element's new position:
		if (top >= 0 && selectorHeight + top <= globalImg.clientHeight)
			ele.style.top = top + "px";
		if (left >= 0 && selectorWidth + left <= globalImg.clientWidth)
			ele.style.left = left + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
};
