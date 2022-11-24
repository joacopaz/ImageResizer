//#region Global declares
const g = {
	cropCheck: document.getElementById("crop"),
	cropVals: document.getElementById("cropVals"),
	cropSizeRange: document.getElementById("cropHeight"), // checked up to here
	cropLabel: document.querySelector("#cropHeightVal"),
	run: document.querySelector(".run"),
	center: document.querySelector(".centerContainer"),
	crop: null,
	img: null,
	currentSelector: null,
	interObserver: null,
};

// Listeners and functions
g.run.onclick = (e) => {
	resizer();
};
g.cropCheck.onchange = ({ target }) => {
	g.cropVals.style.display = target.checked ? "flex" : "none";
	g.cropVals.style.opacity = target.checked ? 100 : 0;
	document.querySelector(".centerContainer").style.display = target.checked
		? "flex"
		: "none";
};
g.cropSizeRange.onchange = ({ target }) => {
	g.cropLabel.innerText = target.value + "%";
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
		const top = parseInt(ele.offsetTop - pos2);
		const left = parseInt(ele.offsetLeft - pos1);
		const selectorHeight = parseInt(currentSelector.style.height);
		const selectorWidth = parseInt(currentSelector.style.width);

		// set the element's new position:
		if (top >= 0 && selectorHeight + top <= g.img.height)
			ele.style.top = top + "px";
		if (left >= 0 && selectorWidth + left <= g.img.width)
			ele.style.left = left + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;

		const selector = document.querySelector(".selector");
		croppedVals[currentStep].leftOffset = parseInt(selector.style.left);
		croppedVals[currentStep].topOffset = parseInt(selector.style.top);
		croppedVals[currentStep].width = parseInt(selector.style.width);
		croppedVals[currentStep].height = parseInt(selector.style.height);
		if (document.getElementById("cropSelect").checked)
			document.getElementById("cropSelect").checked = false;
	}
};
const fixOverflow = (selector, image, canvas) => {
	if (parseInt(selector.style.width) > image.width) {
		console.log("Overflow Width! Adjusting");
		// console.log(
		// 	`BEFORE: \nImage W: ${image.width} H: ${image.height}\nSelector W: ${selector.style.width} H: ${selector.style.height}`
		// );
		const overflow = parseInt(selector.style.width) - image.width;
		const ratio = 1 - overflow / parseInt(selector.style.width);
		g.cropSizeRange.value = g.cropSizeRange.value * ratio;
		selector.style.height =
			canvas.height * (g.cropSizeRange.value / 100) + "px";
		selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
		g.cropLabel.textContent = g.cropSizeRange.value + "%";
		// console.log(
		// 	`AFTER: \nSelector W: ${selector.style.width} H: ${selector.style.height}`
		// );
	}

	if (parseInt(selector.style.height) > image.height) {
		console.log("Overflow Height! Adjusting");
		// console.log(
		// 	`BEFORE: \nImage W: ${image.width} H: ${image.height}\nSelector W: ${selector.style.width} H: ${selector.style.height}`
		// );
		const overflow = parseInt(selector.style.height) - image.height;
		const ratio = 1 - overflow / parseInt(selector.style.height);
		g.cropSizeRange.value = g.cropSizeRange.value * ratio;
		selector.style.height =
			canvas.height * (g.cropSizeRange.value / 100) + "px";
		selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
		g.cropLabel.textContent = g.cropSizeRange.value + "%";
		// console.log(
		// 	`AFTER: \nSelector W: ${selector.style.width} H: ${selector.style.height}`
		// );
	}
};

// Onload events
g.cropLabel.innerText = g.cropSizeRange.value + "%";
g.cropCheck.checked
	? (g.cropVals.style.display = "flex")
	: (g.cropVals.style.display = "none");
g.cropCheck.checked
	? (g.cropVals.style.opacity = 100)
	: (g.cropVals.style.opacity = 0);
g.crop = g.cropCheck.checked;

//#endregion

// Main function
const handleCropping = ({
	image,
	canvas,
	ratio,
	loader,
	i,
	arrayOfRatios,
	cropCenter,
}) => {
	if (currentStep || currentStep === 0) currentStep += 1;
	if (!currentStep) currentStep = 0;
	g.run.textContent = "Select";

	if (!interObserver) {
		interObserver = new IntersectionObserver(
			(entry) => {
				if (!entry[0].isIntersecting) {
					g.run.style.position = "fixed";
					g.run.style.top = "0.2vh";
					g.center.style.position = "fixed";
					g.center.style.top = "8vh";
					g.center.style.fontSize = "1vmax";
					g.center.style.padding = "0.4rem";
					g.center.style.border = "white 1px solid";
				} else if (entry[0].isIntersecting) {
					if (g.run.style.position === "fixed") {
						g.run.style.position = "";
						g.run.style.top = "";
						g.center.style.position = "";
						g.center.style.top = "";
						g.center.style.fontSize = "";
						g.center.style.padding = "";
						g.center.style.border = "";
					}
				}
			},
			{ rootMargin: "0px", threshold: 1.0 }
		);
		interObserver.observe(document.querySelector(".buttons"));
	}
	const container = document.createElement("div");
	container.classList.add("imgContainer");
	container.classList.add("prev");
	// container.classList.add("preview");
	container.appendChild(image);
	g.img = image;
	const selector = document.createElement("div");
	currentSelector = selector;
	selector.classList.add("selector");

	selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
	selector.style.height = canvas.height * (g.cropSizeRange.value / 100) + "px";

	fixOverflow(selector, image, canvas);

	if (!croppedVals[currentStep])
		croppedVals[currentStep] = {
			leftOffset: 0,
			topOffset: 0,
			width: 0,
			height: 0,
			quality: quality,
		};

	croppedVals[currentStep].width = parseInt(selector.style.width);
	croppedVals[currentStep].height = parseInt(selector.style.height);

	g.cropSizeRange.onchange = ({ target }) => {
		g.cropLabel.innerText = target.value + "%";
		const index = g.cropSizeRange.value / 100;
		if (!cropCenter) selector.style.left = 0;
		if (!cropCenter) selector.style.top = 0;
		selector.style.width = canvas.width * index + "px";
		selector.style.height = canvas.height * index + "px";
		if (croppedVals[currentStep])
			croppedVals[currentStep].width = parseInt(selector.style.width);
		if (croppedVals[currentStep])
			croppedVals[currentStep].height = parseInt(selector.style.height);
		fixOverflow(selector, image, canvas);
	};
	document.querySelector("#cropSelect").onchange = (e) => {
		if (!e.target.checked) return;
		croppedVals[currentStep].leftOffset = Math.floor(
			(container.offsetWidth - selector.offsetWidth) / 2
		);
		croppedVals[currentStep].topOffset = Math.abs(
			Math.floor((container.offsetHeight - selector.offsetHeight) / 2)
		);
		selector.style.left = croppedVals[currentStep].leftOffset + "px";
		selector.style.top = croppedVals[currentStep].topOffset + "px";
		autocrop = document.querySelector("#cropSelect").checked;
	};
	if (cropCenter) {
		const config = { childList: true };
		const callback = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					croppedVals[currentStep].leftOffset = Math.floor(
						(container.offsetWidth - mutation.addedNodes[0].offsetWidth) / 2
					);
					croppedVals[currentStep].topOffset = Math.abs(
						Math.floor(
							(container.offsetHeight - mutation.addedNodes[0].offsetHeight) / 2
						)
					);
					selector.style.left = croppedVals[currentStep].leftOffset + "px";
					selector.style.top = croppedVals[currentStep].topOffset + "px";
					// console.log(
					// 	`L ${croppedVals[currentStep].leftOffset} T ${croppedVals[currentStep].topOffset}`
					// );
				}
			}
		};
		const observer = new MutationObserver(callback);
		observer.observe(container, config);
	}

	container.appendChild(selector);

	const header = document.createElement("h3");
	header.textContent = `Preview ${ratio.w}x${ratio.h} ${i + 1}/${
		arrayOfRatios.length
	}`;
	output.appendChild(container);
	output.appendChild(header);
	output.style.flexDirection = "column";
	loader.style.opacity = 0;
	selector.draggable = true;

	dragElement(selector);
	return selector;
};
