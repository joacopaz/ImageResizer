// Main function
const handleCropping = ({
	image,
	canvas,
	ratio,
	i,
	arrayOfRatios,
	cropCenter,
}) => {
	if (g.currentStep || g.currentStep === 0) g.currentStep += 1;
	if (!g.currentStep) {
		g.qualityContainer.style.display = "none";
		g.maxOutputContainer.style.display = "none";
		g.isCropContainer.style.display = "none";
		g.currentStep = 0;
		g.centerContainer.style.display = "flex";
		g.cropSizeContainer.style.display = "flex";
		g.input.style.display = "none";
	}
	g.run.textContent = "Select";
	g.img = image;
	if (image.width > 500 || image.height > 500) {
		g.compensator = {
			originalW: image.width,
			originalH: image.height,
			ratio: image.width > 500 ? 500 / image.width : 500 / image.height,
		};
		image.width = g.compensator.originalW * g.compensator.ratio;
		console.log(`newW: ${image.width}`);
		image.height = g.compensator.originalH * g.compensator.ratio;
		canvas.width *= g.compensator.ratio;
		canvas.height *= g.compensator.ratio;
	}
	if (!g.observer) {
		g.observer = new IntersectionObserver(
			(entry) => {
				if (!entry[0].isIntersecting) {
					g.run.style.position = "fixed";
					g.run.style.top = "0.2vh";
					g.run.style.left = "40vmax";
					g.centerContainer.style.position = "fixed";
					g.centerContainer.style.top = "0.2vh";
					g.centerContainer.style.fontSize = "1vmax";
					g.centerContainer.style.padding = "1rem";
					g.centerContainer.style.border = "white 1px solid";

					g.cropSizeContainer.style.position = "fixed";
					g.cropSizeContainer.style.top = "0.2vh";
					g.cropSizeContainer.style.right = "32vmax";
					g.cropSizeContainer.style.fontSize = "1vmax";
					g.cropSizeContainer.style.padding = "1rem";
					g.cropSizeContainer.style.border = "white 1px solid";
				} else if (entry[0].isIntersecting) {
					if (g.run.style.position === "fixed") {
						g.run.style.position = "";
						g.run.style.top = "";
						g.run.style.left = "";
						g.centerContainer.style.position = "";
						g.centerContainer.style.top = "";
						g.centerContainer.style.fontSize = "";
						g.centerContainer.style.padding = "";
						g.centerContainer.style.border = "";
						g.cropSizeContainer.style.position = "";
						g.cropSizeContainer.style.top = "";
						g.cropSizeContainer.style.right = "";
						g.cropSizeContainer.style.fontSize = "";
						g.cropSizeContainer.style.padding = "";
						g.cropSizeContainer.style.border = "";
					}
				}
			},
			{ rootMargin: "0px", threshold: 1.0 }
		);
		g.observer.observe(document.querySelector("fieldset"));
	}
	g.selectorContainer = document.createElement("div");
	g.selectorContainer.classList.add("imgContainer");
	g.selectorContainer.classList.add("prev");
	g.selectorContainer.appendChild(image);
	g.selector = document.createElement("div");
	g.selector.classList.add("selector");
	g.selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
	g.selector.style.height =
		canvas.height * (g.cropSizeRange.value / 100) + "px";

	const inset = document.createElement("div");
	inset.classList.add("inset");

	const resizeDrag = document.createElement("div");
	resizeDrag.classList.add("resizeDrag");

	fixOverflow((selector = g.selector), (image = g.img), (canvas = g.canvas));

	if (!g.outputValues[g.currentStep])
		g.outputValues[g.currentStep] = {
			leftOffset: 0,
			topOffset: 0,
			width: 0,
			height: 0,
			quality: g.quality,
		};

	g.outputValues[g.currentStep].width = parseInt(g.selector.style.width);
	g.outputValues[g.currentStep].height = parseInt(g.selector.style.height);

	g.cropSizeRange.onchange = handleCropSizeChange;

	document.querySelector("#cropSelect").onchange = (e) => {
		if (!e.target.checked) return;
		g.outputValues[g.currentStep].leftOffset = Math.floor(
			(g.selectorContainer.offsetWidth - g.selector.offsetWidth) / 2
		);
		g.outputValues[g.currentStep].topOffset = Math.abs(
			Math.floor(
				(g.selectorContainer.offsetHeight - g.selector.offsetHeight) / 2
			)
		);
		g.selector.style.left = g.outputValues[g.currentStep].leftOffset + "px";
		g.selector.style.top = g.outputValues[g.currentStep].topOffset + "px";
		g.cropCenter = document.querySelector("#cropSelect").checked;
	};
	if (cropCenter) {
		const config = { childList: true };
		const callback = (mutationList) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					g.outputValues[g.currentStep].leftOffset = Math.floor(
						(g.selectorContainer.offsetWidth -
							mutation.addedNodes[0].offsetWidth) /
							2
					);
					g.outputValues[g.currentStep].topOffset = Math.abs(
						Math.floor(
							(g.selectorContainer.offsetHeight -
								mutation.addedNodes[0].offsetHeight) /
								2
						)
					);
					g.selector.style.left =
						g.outputValues[g.currentStep].leftOffset + "px";
					g.selector.style.top = g.outputValues[g.currentStep].topOffset + "px";
					// console.log(
					// 	`L ${g.croppedVals[g.currentStep].leftOffset} T ${g.croppedVals[g.currentStep].topOffset}`
					// );
				}
			}
		};
		const observer = new MutationObserver(callback);
		observer.observe(g.selectorContainer, config);
	}

	g.selectorContainer.appendChild(g.selector);
	g.selector.appendChild(inset);
	inset.appendChild(resizeDrag);
	const header = document.createElement("h3");
	header.textContent = `Preview ${ratio.w}x${ratio.h} ${i + 1}/${
		arrayOfRatios.length
	}`;
	output.appendChild(g.selectorContainer);
	output.appendChild(header);
	output.style.flexDirection = "column";
	g.loader.style.opacity = 0;

	resizeDrag.onmousedown = (e) => {
		e = e || window.event;
		e.preventDefault();
		let initialX = e.clientX;
		let initialY = e.clientY;
		g.selector.onmousedown = null;
		document.onmousemove = (e) => {
			e = e || window.event;
			e.preventDefault();
			const xOffset = e.clientX - initialX;
			const yOffset = e.clientY - initialY;
			const totalDiff = (xOffset + yOffset) / 9;
			g.cropSizeRange.valueAsNumber += totalDiff;
			handleCropSizeChange({ target: g.cropSizeRange });
			initialX = e.clientX;
			initialY = e.clientY;
		};
		document.onmouseup = (e) => {
			dragElement(g.selector);
			document.onmousemove = null;
		};
	};

	dragElement(g.selector);
	g.selector.scrollIntoView({
		behavior: "smooth",
		block: "start",
		inline: "start",
	});
	handleCropSizeChange({ target: g.cropSizeRange });
	return g.selector;
};

// Helper functions:

// Center selector from left and top
const centerSelector = () => {
	if (!g.outputValues[g.currentStep]) return;
	g.outputValues[g.currentStep].leftOffset = Math.floor(
		(g.selectorContainer.offsetWidth - g.selector.offsetWidth) / 2
	);
	g.outputValues[g.currentStep].topOffset = Math.abs(
		Math.floor((g.selectorContainer.offsetHeight - g.selector.offsetHeight) / 2)
	);
	g.selector.style.left = g.outputValues[g.currentStep].leftOffset + "px";
	g.selector.style.top = g.outputValues[g.currentStep].topOffset + "px";
};

// Handle change in crop size range input
const handleCropSizeChange = ({ target }) => {
	g.cropSizeLabel.innerText = target.value + "%";
	const index = g.cropSizeRange.value / 100;
	g.selector.style.width = g.canvas.width * index + "px";
	g.selector.style.height = g.canvas.height * index + "px";
	fixOverflow(g.selector, g.image, g.canvas);
	if (g.outputValues[g.currentStep])
		g.outputValues[g.currentStep].width = parseInt(g.selector.style.width);
	if (g.outputValues[g.currentStep])
		g.outputValues[g.currentStep].height = parseInt(g.selector.style.height);
};

// Enable dragging by adding listeners onmousedown listener
const dragElement = (ele) => {
	let pos1 = 0,
		pos2 = 0,
		pos3 = 0,
		pos4 = 0;

	ele.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX; // mouseX
		pos4 = e.clientY; // mouseY
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
		fixOverflow();
		if (document.getElementById("cropSelect").checked)
			document.getElementById("cropSelect").checked = false;
	}
};

// Fix overflowing borders into the container to prevent overcrop
const fixOverflow = (
	selector = g.selector,
	image = g.img,
	canvas = g.canvas
) => {
	if (!g.outputValues[g.currentStep]) return;
	if (!selector.style.left) selector.style.left = 0;
	if (
		parseInt(selector.style.left) + parseInt(selector.style.width) >
		image.width
	) {
		console.log("Overflow Width! Adjusting");
		const overflow =
			parseInt(selector.style.left) +
			parseInt(selector.style.width) -
			image.width;
		const ratio = 1 - overflow / parseInt(selector.style.width);
		g.cropSizeRange.value = g.cropSizeRange.value * ratio;
		selector.style.height =
			canvas.height * (g.cropSizeRange.value / 100) + "px";
		selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
		g.cropSizeLabel.textContent = g.cropSizeRange.value + "%";
		g.outputValues[g.currentStep].leftOffset =
			g.selectorContainer.offsetWidth - g.selector.offsetWidth - overflow >= 0
				? g.selectorContainer.offsetWidth - g.selector.offsetWidth - overflow
				: g.selectorContainer.offsetWidth - g.selector.offsetWidth;
		g.selector.style.left = g.outputValues[g.currentStep].leftOffset + "px";
	}
	if (!selector.style.top) selector.style.top = 0;
	if (
		parseInt(selector.style.top) + parseInt(selector.style.height) >
		image.height
	) {
		console.log("Overflow Height! Adjusting");
		const overflow =
			parseInt(selector.style.top) +
			parseInt(selector.style.height) -
			image.height;
		const ratio = 1 - overflow / parseInt(selector.style.height);
		g.cropSizeRange.value = g.cropSizeRange.value * ratio;
		selector.style.height =
			canvas.height * (g.cropSizeRange.value / 100) + "px";
		selector.style.width = canvas.width * (g.cropSizeRange.value / 100) + "px";
		g.cropSizeLabel.textContent = g.cropSizeRange.value + "%";
		g.outputValues[g.currentStep].topOffset =
			g.selectorContainer.offsetTop - g.selector.offsetHeight - overflow >= 0
				? g.selectorContainer.offsetHeight - g.selector.offsetHeight - overflow
				: g.selectorContainer.offsetHeight - g.selector.offsetHeight;
		g.selector.style.left = g.outputValues[g.currentStep].leftOffset + "px";
	}
};
