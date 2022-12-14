const resizer = (
	inputContainer = g.input, // where the file is
	outputContainer = g.output, // where to draw/show imgs
	arrayOfRatios = g.arrayOfOutputRatios, // output ratios
	maxOutputPxs = g.maxOutput, // max side length in pxs
	qualityPercent = g.quality, // 0 to 1
	cropCenter = g.cropCenter
) => {
	if (!inputContainer?.files[0]) return alert("Please select a File");
	if (!arrayOfRatios || arrayOfRatios.length === 0)
		return alert("DebugLog: Specify expected output ratios for the function");
	if (g.download) g.download.style.display = "none";
	// Start loading animation
	g.loader.style.opacity = 100;

	g.input.onchange = () => {
		if (!g.currentStep) {
			g.currentStep = null;
		}
		if (g.currentStep) g.currentStep -= 1;
		resizer();
	};

	// Since this is a sketch of the function, we delete the output contents before rendering new ones just in case we re-run the function multiple times
	outputContainer.innerHTML = "";
	document.getElementById("download-container").innerHTML = "";
	const file = inputContainer.files[0];
	// We get the file name to rebuild the output file
	const name = file.name.match(/(.+)\./)[1];
	g.fileName = name;

	// We get the file type to rebuild the output file
	const type = file.type.match(/.+\/(.+)/)[1];
	g.fileType = type;
	if (type !== "png") {
		g.quality = 0.98;
		g.qualityContainer.style.display = "flex";
	}
	if (!g.alert && type === "png") {
		g.alert = true;
		g.qualityContainer.style.display = "none";

		if (confirm("Use experimental PNG compression? File Size < Time")) {
			g.quality = 0.01;
			g.qualityRange.value = g.quality * 100;
			CanvasPngCompression.replaceToDataURL({
				windowBits: 8,
				chunkSize: 256,
				strategy: 2,
			});
		}
	}
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
		g.results = results;
		image.onload = ({ target }) => {
			if (g.isCrop.checked) {
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
						g.canvas = canvas;
						const context = canvas.getContext("2d");
						const unit =
							ratio.w > ratio.h
								? maxOutputPxs / ratio.w
								: maxOutputPxs / ratio.h;
						canvas.width = unit * ratio.w;
						canvas.height = unit * ratio.h;

						g.rechooseContainer.style.display = "flex";
						g.rechooseRatio.innerText = ` ${ratio.w}x${ratio.h}`;

						if (!g.currentStep || g.currentStep + 1 < arrayOfRatios.length) {
							if (!g.currentStep && g.currentStep !== 0 && i === 0) {
								return handleCropping({
									image: preproImg,
									canvas,
									ratio,
									i,
									arrayOfRatios,
									cropCenter,
								});
							}
							if (g.currentStep + 1 === i) {
								return handleCropping({
									image: preproImg,
									canvas,
									ratio,
									i,
									arrayOfRatios,
									cropCenter,
								});
							}
							if (g.currentStep + 1 !== i) {
								continue;
							}
						}

						if (Number.isNaN(g.outputValues[i].leftOffset))
							g.outputValues[i].leftOffset = 0;
						if (Number.isNaN(g.outputValues[i].topOffset))
							g.outputValues[i].topOffset = 0;
						if (Number.isNaN(g.outputValues[i].width))
							g.outputValues[i].width = 0;
						if (Number.isNaN(g.outputValues[i].height))
							g.outputValues[i].height = 0;
						if (g.outputValues[i].compensator.ratio) {
							g.outputValues[i].leftOffset /=
								g.outputValues[i].compensator.ratio;
							g.outputValues[i].topOffset /=
								g.outputValues[i].compensator.ratio;
							g.outputValues[i].width /= g.outputValues[i].compensator.ratio;
							g.outputValues[i].height /= g.outputValues[i].compensator.ratio;
						}
						context.drawImage(
							g.outputValues[i].img,
							g.outputValues[i].leftOffset, // new X coordinate to start crop on original
							g.outputValues[i].topOffset, // new Y coordinate to start crop on original
							g.outputValues[i].width, // cropWidth
							g.outputValues[i].height, // cropHeight
							0,
							0,
							canvas.width, // newWidth
							canvas.height // newHeight
						);
						console.log(
							`Writing: image/${g.outputValues[i].type} at ${g.outputValues[i].quality} quality`
						);
						const newImgUrl = context.canvas.toDataURL(
							`image/${g.outputValues[i].type}`,
							`${g.outputValues[i].quality}` //${g.outputValues[i].quality}
						);
						const newImg = document.createElement("img");
						newImg.src = newImgUrl; // end result for VLS implementation

						// We now have a new image with the specific aspect ratio in newImg, we could now push it to the server and end the function. In this specific case, we will append to show a preview and generate a downloadable ZIP file.
						results.push({
							ratio: `${ratio.w}x${ratio.h}`,
							url: newImgUrl,
							type: g.outputValues[i].type,
							name: g.outputValues[i].name,
						});
						const container = document.createElement("div");
						container.classList.add("imgContainer");
						container.classList.add("finished");
						container.appendChild(newImg);
						const header = document.createElement("h2");
						header.textContent = `${ratio.w}x${ratio.h}`;
						container.appendChild(header);
						g.output.style.flexDirection = "row";
						g.output.style.alignItems = "flex-end";
						g.output.appendChild(container);
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
					results.forEach((result) => {
						zip.file(
							`${result.name}-${result.ratio}.${result.type}`,
							urlToPromise(result.url),
							{
								binary: true,
							}
						);
					});
					zip.generateAsync({ type: "blob" }).then(function callback(zip) {
						if (g.observer) {
							g.observer.disconnect();
							g.observer = "";
						}
						console.log(`Compressed at ${g.quality * 100}%`);
						if (!g.download) {
							g.download = document.createElement("button");
							g.download.textContent = "Download";
							g.download.classList.add("download");
							document.querySelector(".buttons").appendChild(g.download);
						} else {
							g.download.style.display = "block";
						}
						g.rechooseContainer.style.display = "none";
						g.rechooseRatio.innerText = ``;
						g.currentStep = null;
						g.qualityContainer.style.display = "flex";
						g.maxOutputContainer.style.display = "flex";
						// g.input.style.display = "flex";
						g.isCropContainer.style.display = "flex";
						g.centerContainer.style.display = "none";
						g.outputValues = [];
						g.download.onclick = () => {
							saveAs(zip, `${name}.zip`);
						};
						g.loader.style.opacity = "";
						g.alert = false;
						CanvasPngCompression.revertToDataURL();
					});
				};
				return;
				// --------------------------------------------------------------------
			}

			// From now on we will run a loop, since we want to recreate the image X amount of times (the length of the arrayOfOutputSizes, once per output)

			for (let i = 0; i < arrayOfRatios.length; i++) {
				const ratio = arrayOfRatios[i];
				const canvas = document.createElement("canvas");
				g.canvas = canvas;
				const context = canvas.getContext("2d");
				const unit =
					ratio.w > ratio.h ? maxOutputPxs / ratio.w : maxOutputPxs / ratio.h;
				canvas.width = unit * ratio.w;
				canvas.height = unit * ratio.h;

				context.drawImage(image, 0, 0, canvas.width, canvas.height);

				const newImgUrl = context.canvas.toDataURL(`image/${type}`, g.quality);
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
				g.output.style.flexDirection = "row";
				g.output.style.alignItems = "flex-end";
				g.output.appendChild(container);
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
				if (g.observer) {
					g.observer.disconnect();
					g.observer = "";
				}
				console.log(`Compressed at ${g.quality * 100}%`);
				if (!g.download) {
					g.download = document.createElement("button");
					g.download.textContent = "Download";
					g.download.classList.add("download");
					document.querySelector(".buttons").appendChild(g.download);
				} else {
					g.download.style.display = "block";
				}
				g.currentStep = null;
				g.rechooseContainer.style.display = "none";
				g.rechooseRatio.innerText = ``;
				g.qualityContainer.style.display = "flex";
				g.maxOutputContainer.style.display = "flex";
				g.input.style.display = "flex";
				g.isCropContainer.style.display = "flex";
				g.outputValues = [];
				g.download.onclick = () => {
					saveAs(zip, `${name}.zip`);
				};
				g.loader.style.opacity = "";
				g.alert = false;
				CanvasPngCompression.revertToDataURL();
			});
		};
	};
};
