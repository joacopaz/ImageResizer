const g = {
	// Quality Label
	qualityTag: document.querySelector("#quality"),
	// Quality value
	quality: 0.98,
	// Quality container
	qualityContainer: document.querySelector(".qualityContainer"),
	// isCrop checkbox
	isCrop: document.getElementById("crop"),
	// isCrop checkbox status
	cropCenter: document.querySelector("#cropSelect").checked,
	// isCrop container
	isCropContainer: document.querySelector(".checkCrop"),
	// Crop Size Container
	cropSizeContainer: document.getElementById("cropVals"),
	// Crop Size Range
	cropSizeRange: document.getElementById("cropHeight"),
	// Crop Size Lbl
	cropSizeLabel: document.querySelector("#cropHeightVal"),
	// Run button
	run: document.querySelector(".run"),
	// Center container
	centerContainer: document.querySelector(".centerContainer"),
	// Image to crop
	img: null,
	// Current selector
	selector: null,
	// Selector container
	selectorContainer: null,
	// Intersection observer for hovering buttons
	observer: null,
	// Current step
	currentStep: null,
	// Final values for image
	outputValues: [],
	// Input container for files
	input: document.getElementById("input"),
	// Quality Range
	qualityRange: document.querySelector("#qualityRange"),
	// MaxOutput in pxs
	maxOutput: document.querySelector("#maxOutput").value,
	// MaxOutput field
	maxOutputField: document.querySelector("#maxOutput"),
	maxOutputContainer: document.querySelector(".maxSizeContainer"),
	// Output Container
	output: document.getElementById("output"),
	// Desired ratios to output
	arrayOfOutputRatios: [
		{ w: 16, h: 9 },
		{ w: 4, h: 3 },
		{ w: 3, h: 4 },
		{ w: 2, h: 3 },
	],
	// Download btn
	download: null,
	// Loader ref
	loader: document.querySelector("#loading"),
	// canvas ref
	canvas: null,
	compensator: {
		originalW: null,
		originalH: null,
		ratio: null,
	},
};

// Onload events
g.quality = g.qualityRange.valueAsNumber / 100;
g.cropSizeLabel.innerText = g.cropSizeRange.value + "%";
g.isCrop.checked
	? (g.cropSizeContainer.style.opacity = 100)
	: (g.cropSizeContainer.style.opacity = 0);
g.qualityTag.textContent = `${g.quality * 100}%`;

// Listeners
// Listeners and functions
g.maxOutputField.onkeydown = (e) => {
	if (
		isNaN(e.key) &&
		e.key !== "Backspace" &&
		e.key !== "Delete" &&
		e.key !== "Shift" &&
		e.key !== "Control" &&
		e.key.substring(0, 5) !== "Arrow"
	)
		e.preventDefault();
};
g.maxOutputField.oninput = ({ target }) => (g.maxOutput = target.valueAsNumber);

g.input.onchange = () => {
	g.currentStep = null;
	g.outputValues = [];
	resizer();
};
g.qualityRange.onchange = ({ target }) => {
	g.quality = target.value / 100;
	g.qualityTag.textContent = `${g.quality * 100}%`;
};

g.run.onclick = (e) => {
	resizer();
};
g.isCrop.onchange = ({ target }) => {
	if (g.currentStep !== null) {
		g.cropSizeContainer.style.display = target.checked ? "flex" : "none";
		g.cropSizeContainer.style.opacity = target.checked ? 100 : 0;
		g.centerContainer.style.display = target.checked ? "flex" : "none";
	}
};
g.cropSizeRange.onchange = ({ target }) => {
	g.cropSizeLabel.innerText = target.value + "%";
};
