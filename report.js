 document.querySelector(".submit-btn").addEventListener("click", function(e){

    e.preventDefault();

    alert("✅ Report Submitted Successfully!");

});
let stream;
let mediaRecorder;
let videoChunks = [];

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        document.getElementById("camera").srcObject = stream;

    } catch (error) {
        alert("Camera permission denied or camera not available.");
        console.error(error);
    }
}

function takePhoto() {
    const camera = document.getElementById("camera");
    const canvas = document.getElementById("photoCanvas");
    const preview = document.getElementById("photoPreview");

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(camera, 0, 0);

    preview.src = canvas.toDataURL("image/png");
}

function startRecording() {
    videoChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            videoChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const videoBlob = new Blob(videoChunks, {
            type: "video/webm"
        });

        const videoURL = URL.createObjectURL(videoBlob);

        document.getElementById("videoPreview").src = videoURL;
    };

    mediaRecorder.start();

    alert("Video recording started!");
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        alert("Video recording stopped!");
    }
}


// Evidence upload preview
const evidenceInput = document.getElementById("evidenceInput");
const previewSection = document.getElementById("previewSection");
const previewContainer = document.getElementById("previewContainer");

if (evidenceInput) {
    evidenceInput.addEventListener("change", function () {

        previewContainer.innerHTML = "";

        const files = Array.from(this.files);

        if (files.length === 0) {
            previewSection.style.display = "none";
            return;
        }

        previewSection.style.display = "block";

        files.forEach((file) => {

            const previewBox = document.createElement("div");

            previewBox.className =
                "relative flex-shrink-0 w-32 h-32 rounded-[12px] overflow-hidden border border-outline-variant shadow-sm bg-surface";

            const mediaURL = URL.createObjectURL(file);

            if (file.type.startsWith("image/")) {

                previewBox.innerHTML = `
                    <img
                        src="${mediaURL}"
                        class="w-full h-full object-cover"
                        alt="Uploaded image"
                    >

                    <button
                        type="button"
                        class="delete-preview absolute top-2 right-2 w-7 h-7 bg-white/90 text-red-600 rounded-full flex items-center justify-center shadow-sm"
                    >
                        ×
                    </button>
                `;

            } else if (file.type.startsWith("video/")) {

                previewBox.innerHTML = `
                    <video
                        src="${mediaURL}"
                        class="w-full h-full object-cover"
                        controls
                    ></video>

                    <button
                        type="button"
                        class="delete-preview absolute top-2 right-2 w-7 h-7 bg-white/90 text-red-600 rounded-full flex items-center justify-center shadow-sm"
                    >
                        ×
                    </button>
                `;

            }

            previewContainer.appendChild(previewBox);

            const deleteButton =
                previewBox.querySelector(".delete-preview");

            deleteButton.addEventListener("click", function () {
                previewBox.remove();

                if (previewContainer.children.length === 0) {
                    previewSection.style.display = "none";
                    evidenceInput.value = "";
                }
            });
        });
    });
}
