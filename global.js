const g = {
	// isCrop checkbox
	isCrop: document.getElementById("crop"),
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
	// Crop % value from 0 to 1
	cropValue: null,
	// Image to crop
	img: null,
	// Current selector
	selector: null,
	// Intersection observer for hovering buttons
	observer: null,
	// Current step
	currentStep: null,
	// Final values for image
	outputValues: [],
	// Input container
	input: document.getElementById("input"),
	// Quality Range
	qualityRange: document.querySelector("#qualityRange"),
	// Max Output in pxs
	maxOutput: document.querySelector("#maxOutput").value,
	// Output Container
	output: document.getElementById("output"),
	// Desired ratios to output
	arrayOfOutputRatios: [
		{ w: 16, h: 9 },
		{ w: 4, h: 3 },
		{ w: 3, h: 4 },
		{ w: 2, h: 3 },
	],
	cropCenter: document.querySelector("#cropSelect").checked,
	qualityTag: document.querySelector("#quality"),
	quality: 0.98,
	download: null,
};

// Onload events
g.quality = g.qualityRange.valueAsNumber / 100;
g.cropSizeLabel.innerText = g.cropSizeRange.value + "%";
g.isCrop.checked
	? (g.cropSizeContainer.style.display = "flex")
	: (g.cropSizeContainer.style.display = "none");
g.isCrop.checked
	? (g.cropSizeContainer.style.opacity = 100)
	: (g.cropSizeContainer.style.opacity = 0);
g.cropValue = g.isCrop.checked;
g.qualityTag.textContent = `${g.quality * 100}%`;

// Listeners
// Listeners and functions
g.input.onchange = () => {
	g.currentStep = null;
	g.outputValues = [];
	resizer();
};
g.qualityRange.onchange = ({ target }) => {
	g.quality = target.value / 100;
	g.qualityTag.textContent = `${g.quality * 100}%`;
};
document
	.querySelector("#maxOutput")
	.addEventListener(
		"input",
		({ target }) => (g.maxOutput = target.valueAsNumber)
	);

g.run.onclick = (e) => {
	resizer();
};
g.isCrop.onchange = ({ target }) => {
	g.cropSizeContainer.style.display = target.checked ? "flex" : "none";
	g.cropSizeContainer.style.opacity = target.checked ? 100 : 0;
	g.centerContainer.style.display = target.checked ? "flex" : "none";
};
g.cropSizeRange.onchange = ({ target }) => {
	g.cropSizeLabel.innerText = target.value + "%";
};
