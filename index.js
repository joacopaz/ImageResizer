let currentStep;
let croppedVals = [];

// File input container
const input = document.getElementById("input");

// Output container
const output = document.getElementById("output");

// Array of image ratios (Width, Height)
const arrayOfOutputRatios = [
	{ w: 16, h: 9 },
	{ w: 4, h: 3 },
	{ w: 3, h: 4 },
	{ w: 2, h: 3 },
];
// Max output (side in pxs), function will prioritize larger side
let maxOutput = document.querySelector("#maxOutput").value;
document
	.querySelector("#maxOutput")
	.addEventListener(
		"input",
		({ target }) => (maxOutput = target.valueAsNumber)
	);

// Automatically Crop Center
let autocrop = document.querySelector("#cropSelect").checked;
document
	.querySelector("#cropSelect")
	.addEventListener(
		"change",
		({ target }) => (autocrop = document.querySelector("#cropSelect").checked)
	);

// Quality compression (from 0 to 1)
const qualityRange = document.querySelector("#qualityRange");
const qualityTag = document.querySelector("#quality");
let quality = qualityRange.value / 100; // can range from 0.1 for 10% and 1 for 100%
qualityTag.textContent = `${quality * 100}%`;
qualityRange.onchange = ({ target }) => {
	quality = target.value / 100;
	qualityTag.textContent = `${quality * 100}%`;
};

// Resizing function to run
const resizer = (
	inputContainer = input, // where the file is
	outputContainer = output, // where to draw/show imgs
	arrayOfRatios = arrayOfOutputRatios, // output ratios
	maxOutputPxs = maxOutput, // max side length in pxs
	qualityPercent = quality, // 0 to 1
	cropCenter = autocrop
) => {
	if (!inputContainer?.files[0]) return alert("Please select a File");
	if (!arrayOfRatios || arrayOfRatios.length === 0)
		return alert("DebugLog: Specify expected output ratios for the function");
	if (document.querySelector(".download"))
		document.querySelector(".download").style.display = "none";
	// Start loading animation
	const loader = document.querySelector("#loading");
	loader.style.opacity = 100;

	// Since this is a sketch of the function, we delete the output contents before rendering new ones just in case we re-run the function multiple times
	outputContainer.innerHTML = "";
	document.getElementById("download-container").innerHTML = "";
	const file = inputContainer.files[0];

	// We get the file name to rebuild the output file
	const name = file.name.match(/(.+)\./)[1];

	// We get the file type to rebuild the output file
	const type = file.type.match(/.+\/(.+)/)[1];

	const reader = new FileReader();
	reader.readAsDataURL(file);

	// Once read, we start deconstructing
	reader.onload = ({ target }) => {
		const imgURL = target.result;
		const image = document.createElement("img");

		// We get the original image in the DOM
		image.src = imgURL;

		// results is created for this example to download a zip file, delete if no download is intended
		const results = [];
		image.onload = ({ target }) => {
			if (g.crop) {
				// EXPERIMENTING -----------------------------------------------------
				// preprocessing image to get scaled down preview image for cropping
				outputContainer.style.alignItems = "center";
				outputContainer.style.justifyContent = "center";
				const canvasPrepro = document.createElement("canvas");
				const contextPrepro = canvasPrepro.getContext("2d");
				const unitPrepro =
					image.width > image.height
						? maxOutputPxs / image.width
						: maxOutputPxs / image.height;
				canvasPrepro.width = unitPrepro * image.width;
				canvasPrepro.height = unitPrepro * image.height;
				contextPrepro.drawImage(
					image,
					0,
					0,
					canvasPrepro.width,
					canvasPrepro.height
				);
				const preproImgURL = contextPrepro.canvas.toDataURL(
					`image/${type}`,
					qualityPercent
				);
				const preproImg = document.createElement("img");
				preproImg.src = preproImgURL;

				preproImg.onload = () => {
					for (let i = 0; i < arrayOfRatios.length; i++) {
						const ratio = arrayOfRatios[i];
						const canvas = document.createElement("canvas");
						const context = canvas.getContext("2d");
						const unit =
							ratio.w > ratio.h
								? maxOutputPxs / ratio.w
								: maxOutputPxs / ratio.h;
						canvas.width = unit * ratio.w;
						canvas.height = unit * ratio.h;
						if (!currentStep || currentStep + 1 < arrayOfRatios.length) {
							if (!currentStep && currentStep !== 0 && i === 0) {
								return handleCropping({
									image: preproImg,
									canvas,
									ratio,
									loader,
									i,
									arrayOfRatios,
									cropCenter,
								});
							}
							if (currentStep + 1 === i) {
								return handleCropping({
									image: preproImg,
									canvas,
									ratio,
									loader,
									i,
									arrayOfRatios,
									cropCenter,
								});
							}
							if (currentStep + 1 !== i) {
								continue;
							}
						} else {
							if (i + 1 === arrayOfRatios.length) {
								let string;
								croppedVals.forEach(
									(e) =>
										(string += `L: ${e.leftOffset} T: ${e.topOffset} W: ${e.width} H: ${e.height}`)
								);
							}
						}

						if (Number.isNaN(croppedVals[i].leftOffset))
							croppedVals[i].leftOffset = 0;
						if (Number.isNaN(croppedVals[i].topOffset))
							croppedVals[i].topOffset = 0;
						if (Number.isNaN(croppedVals[i].width)) croppedVals[i].width = 0;
						if (Number.isNaN(croppedVals[i].height)) croppedVals[i].height = 0;

						context.drawImage(
							preproImg,
							croppedVals[i].leftOffset, // new X coordinate to start crop on original
							croppedVals[i].topOffset, // new Y coordinate to start crop on original
							croppedVals[i].width, // cropWidth
							croppedVals[i].height, // cropHeight
							0,
							0,
							canvas.width, // newWidth
							canvas.height // newHeight
						);

						const newImgUrl = context.canvas.toDataURL(
							`image/${type}`,
							qualityPercent
						);
						const newImg = document.createElement("img");
						newImg.src = newImgUrl; // end result for VLS implementation

						// We now have a new image with the specific aspect ratio in newImg, we could now push it to the server and end the function. In this specific case, we will append to show a preview and generate a downloadable ZIP file.
						results.push({ ratio: `${ratio.w}x${ratio.h}`, url: newImgUrl });
						const container = document.createElement("div");
						container.classList.add("imgContainer");
						container.classList.add("finished");
						container.appendChild(newImg);
						const header = document.createElement("h2");
						header.textContent = `${ratio.w}x${ratio.h}`;
						container.appendChild(header);
						output.style.flexDirection = "row";
						output.style.alignItems = "flex-end";
						output.appendChild(container);
					}

					// Adapting imageUrl to promise for zip
					function urlToPromise(url) {
						return new Promise(function (resolve, reject) {
							JSZipUtils.getBinaryContent(url, function (err, data) {
								if (err) {
									reject(err);
								} else {
									resolve(data);
								}
							});
						});
					}
					// Creating Zip file for Listing Service use
					const zip = new JSZip();
					results.forEach((result) =>
						zip.file(
							`${name}-${result.ratio}.${type}`,
							urlToPromise(result.url),
							{
								binary: true,
							}
						)
					);
					zip.generateAsync({ type: "blob" }).then(function callback(zip) {
						let btn;
						g.run.textContent = "Run";
						interObserver.disconnect();
						interObserver = "";
						console.log(`Compressed at ${quality * 100}%`);
						if (!document.querySelector(".download")) {
							btn = document.createElement("button");
						} else {
							btn = document.querySelector(".download");
							btn.style.display = "block";
						}
						btn.textContent = "Download";
						btn.classList.add("download");
						document.querySelector(".buttons").appendChild(btn);
						currentStep = null;
						croppedVals = [];
						btn.onclick = () => {
							saveAs(zip, `${name}.zip`);
						};
						loader.style.opacity = "";
					});
				};
				return;
				// --------------------------------------------------------------------
			}

			// From now on we will run a loop, since we want to recreate the image X amount of times (the length of the arrayOfOutputSizes, once per output)

			for (let i = 0; i < arrayOfRatios.length; i++) {
				const ratio = arrayOfRatios[i];
				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d");
				const unit =
					ratio.w > ratio.h ? maxOutputPxs / ratio.w : maxOutputPxs / ratio.h;
				const unitX = maxOutputPxs / ratio.w;
				const unitY = maxOutputPxs / ratio.h;
				canvas.width = unit * ratio.w;
				canvas.height = unit * ratio.h;

				context.drawImage(image, 0, 0, canvas.width, canvas.height);
				const newImgUrl = context.canvas.toDataURL(
					`image/${type}`,
					qualityPercent
				);
				const newImg = document.createElement("img");
				newImg.src = newImgUrl; // end result for VLS implementation

				// We now have a new image with the specific aspect ratio in newImg, we could now push it to the server and end the function. In this specific case, we will append to show a preview and generate a downloadable ZIP file.

				results.push({ ratio: `${ratio.w}x${ratio.h}`, url: newImgUrl });
				const container = document.createElement("div");
				container.classList.add("imgContainer");
				container.classList.add("finished");
				container.appendChild(newImg);
				const header = document.createElement("h2");
				header.textContent = `${ratio.w}x${ratio.h}`;
				container.appendChild(header);
				output.style.flexDirection = "row";
				output.style.alignItems = "flex-end";
				output.appendChild(container);
			}

			// Adapting imageUrl to promise for zip
			function urlToPromise(url) {
				return new Promise(function (resolve, reject) {
					JSZipUtils.getBinaryContent(url, function (err, data) {
						if (err) {
							reject(err);
						} else {
							resolve(data);
						}
					});
				});
			}
			// Creating Zip file for Listing Service use
			const zip = new JSZip();
			results.forEach((result) =>
				zip.file(`${name}-${result.ratio}.${type}`, urlToPromise(result.url), {
					binary: true,
				})
			);
			zip.generateAsync({ type: "blob" }).then(function callback(zip) {
				let btn;
				if (interObserver) {
					interObserver.disconnect();
					interObserver = "";
				}
				console.log(`Compressed at ${quality * 100}%`);
				if (!document.querySelector(".download")) {
					btn = document.createElement("button");
				} else {
					btn = document.querySelector(".download");
				}
				btn.textContent = "Download";
				btn.classList.add("download");
				document.querySelector(".buttons").appendChild(btn);
				currentStep = null;
				croppedVals = [];
				btn.onclick = () => {
					saveAs(zip, `${name}.zip`);
				};
				loader.style.opacity = "";
			});
		};
	};
};

// Function will run when input file changes
input.onchange = () => {
	currentStep = null;
	croppedVals = [];
	resizer();
};
