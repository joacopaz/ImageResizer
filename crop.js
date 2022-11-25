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
		const selectorHeight = parseInt(g.selector.style.height);
		const selectorWidth = parseInt(g.selector.style.width);

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
		g.outputValues[g.currentStep].leftOffset = parseInt(selector.style.left);
		g.outputValues[g.currentStep].topOffset = parseInt(selector.style.top);
		g.outputValues[g.currentStep].width = parseInt(selector.style.width);
		g.outputValues[g.currentStep].height = parseInt(selector.style.height);
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
		g.cropSizeLabel.textContent = g.cropSizeRange.value + "%";
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
		g.cropSizeLabel.textContent = g.cropSizeRange.value + "%";
		// console.log(
		// 	`AFTER: \nSelector W: ${selector.style.width} H: ${selector.style.height}`
		// );
	}
};

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
	if (g.currentStep || g.currentStep === 0) g.currentStep += 1;
	if (!g.currentStep) g.currentStep = 0;
	g.run.textContent = "Select";

	if (!g.observer) {
		g.observer = new IntersectionObserver(
			(entry) => {
				if (!entry[0].isIntersecting) {
					g.run.style.position = "fixed";
					g.run.style.top = "0.2vh";
					g.centerContainer.style.position = "fixed";
					g.centerContainer.style.top = "8vh";
					g.centerContainer.style.fontSize = "1vmax";
					g.centerContainer.style.padding = "0.4rem";
					g.centerContainer.style.border = "white 1px solid";
				} else if (entry[0].isIntersecting) {
					if (g.run.style.position === "fixed") {
						g.run.style.position = "";
						g.run.style.top = "";
						g.centerContainer.style.position = "";
						g.centerContainer.style.top = "";
						g.centerContainer.style.fontSize = "";
						g.centerContainer.style.padding = "";
						g.centerContainer.style.border = "";
					}
				}
			},
			{ rootMargin: "0px", threshold: 1.0 }
		);
		g.observer.observe(document.querySelector(".buttons"));
	}
	const container = document.createElement("div");
	container.classList.add("imgContainer");
	container.classList.add("prev");
	// container.classList.add("preview");
	container.appendChild(image);
	g.img = image;
	const selector = document.createElement("div");
	// test
	const inset = document.createElement("div");
	inset.classList.add("inset");
	//
	g.selector = selector;
	selector.classList.add("selector");
	selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
	selector.style.height = canvas.height * (g.cropSizeRange.value / 100) + "px";

	fixOverflow(selector, image, canvas);

	if (!g.outputValues[g.currentStep])
		g.outputValues[g.currentStep] = {
			leftOffset: 0,
			topOffset: 0,
			width: 0,
			height: 0,
			quality: g.quality,
		};

	g.outputValues[g.currentStep].width = parseInt(selector.style.width);
	g.outputValues[g.currentStep].height = parseInt(selector.style.height);

	g.cropSizeRange.onchange = ({ target }) => {
		g.cropSizeLabel.innerText = target.value + "%";
		const index = g.cropSizeRange.value / 100;
		if (!cropCenter) selector.style.left = 0;
		if (!cropCenter) selector.style.top = 0;
		selector.style.width = canvas.width * index + "px";
		selector.style.height = canvas.height * index + "px";
		if (g.outputValues[g.currentStep])
			g.outputValues[g.currentStep].width = parseInt(selector.style.width);
		if (g.outputValues[g.currentStep])
			g.outputValues[g.currentStep].height = parseInt(selector.style.height);
		fixOverflow(selector, image, canvas);
	};
	document.querySelector("#cropSelect").onchange = (e) => {
		if (!e.target.checked) return;
		g.outputValues[g.currentStep].leftOffset = Math.floor(
			(container.offsetWidth - selector.offsetWidth) / 2
		);
		g.outputValues[g.currentStep].topOffset = Math.abs(
			Math.floor((container.offsetHeight - selector.offsetHeight) / 2)
		);
		selector.style.left = g.outputValues[g.currentStep].leftOffset + "px";
		selector.style.top = g.outputValues[g.currentStep].topOffset + "px";
		g.cropCenter = document.querySelector("#cropSelect").checked;
	};
	if (cropCenter) {
		const config = { childList: true };
		const callback = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					g.outputValues[g.currentStep].leftOffset = Math.floor(
						(container.offsetWidth - mutation.addedNodes[0].offsetWidth) / 2
					);
					g.outputValues[g.currentStep].topOffset = Math.abs(
						Math.floor(
							(container.offsetHeight - mutation.addedNodes[0].offsetHeight) / 2
						)
					);
					selector.style.left = g.outputValues[g.currentStep].leftOffset + "px";
					selector.style.top = g.outputValues[g.currentStep].topOffset + "px";
					// console.log(
					// 	`L ${g.croppedVals[g.currentStep].leftOffset} T ${g.croppedVals[g.currentStep].topOffset}`
					// );
				}
			}
		};
		const observer = new MutationObserver(callback);
		observer.observe(container, config);
	}

	container.appendChild(selector);
	selector.appendChild(inset);

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
