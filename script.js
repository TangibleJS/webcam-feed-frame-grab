function getWebcams() {

  return new Promise((resolve, reject) => {

    // Check for MediaDevices support
    if (!navigator.mediaDevices) {
      reject(new Error("The MediaDevices API is not supported."));
      return;
    }

    // Filter found devices to only keep "videoinput" devices
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {

        let filtered = devices.filter((device) => {
          return device.kind === "videoinput"
        });

        resolve(filtered);

      })
      .catch(err => {
        console.log(err);
        //alert(err.name);
      })

  });

}

function populateDropDownMenu(webcams) {

  let dropdown = document.getElementById("dropdown");

  webcams.forEach((cam) => {
    let option = document.createElement("option");
    option.text = cam.label;
    option.value = cam.deviceId;
    dropdown.options.add(option);
  });

  dropdown.addEventListener("change", onWebcamSelected)

}

function onWebcamSelected() {

  // Fetch our video element
  let videoElement = document.getElementById("webcam");

  // Retrieve the webcam's device id and use it in the constraints object
  let dropdown = document.getElementById("dropdown");
  let id = dropdown.options[dropdown.selectedIndex].value;

  // Build the constraint object
  let constraints = {
    video: {
      deviceId: { exact: id}
    }
  };

  // Attach the webcam feed to a video element so we can view it
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => videoElement.srcObject = stream)
    .catch(err => alert(err))

}

function disconnectVideoStream() {

  // Fetch video element. If it does not have a stream, we are done.
  let videoElement = document.getElementById("webcam");
  if (!videoElement.srcObject) return;

  // Pause the video, stop all tracks and make sure no reference remain.
  videoElement.srcObject.getTracks().forEach( track => track.stop() );
  videoElement.srcObject = undefined;
  videoElement.src = "";

}

function captureToCanvas() {

  // Retrieve source, canvas and 2D context
  let source = document.getElementById("webcam");
  let canvas = document.getElementById("capture");
  let context = canvas.getContext("2d");

  // Here we take into account the fact that the webcam might not have the same aspect ratio as the
  // target canvas.
  let ratio = canvas.width / canvas.height;
  let height = source.videoWidth / ratio;
  let yOffset = (source.videoHeight - height) / 2;

  // Flip the image to match the webcam (mirrored)
  context.save();
  context.translate(canvas.width, 0);
  context.scale(-1, 1);

  // Draw the snapshot/image onto the canvas.
  context.drawImage(
    document.getElementById("webcam"),
    0,
    yOffset,
    source.videoWidth,
    height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Remove the translate and scale transformations
  context.restore();

}

getWebcams()
  .then(populateDropDownMenu)
  .then(onWebcamSelected);

document.getElementById("webcam").addEventListener("click", () => {
  captureToCanvas();
});
