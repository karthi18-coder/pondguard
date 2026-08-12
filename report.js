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
const evidenceInput = document.getElementById("evidenceInput");
const previewContainer = document.getElementById("previewContainer");
const previewSection = document.getElementById("previewSection");

let selectedFiles = [];

if (evidenceInput) {

    evidenceInput.addEventListener("change", function () {

        const files = Array.from(this.files);

        files.forEach(function(file) {

            if (!file.type.startsWith("image/")) {
                alert("Please select an image.");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert("Image must be below 10MB.");
                return;
            }

            selectedFiles.push(file);
        });

        showPreviews();

        this.value = "";
    });
}


function showPreviews() {

    previewContainer.innerHTML = "";

    if (selectedFiles.length === 0) {
        previewSection.style.display = "none";
        return;
    }

    previewSection.style.display = "block";

    selectedFiles.forEach(function(file, index) {

        const reader = new FileReader();

        reader.onload = function(event) {

            const box = document.createElement("div");

            box.className =
                "relative flex-shrink-0 w-32 h-32 rounded-[12px] overflow-hidden border border-outline-variant shadow-sm";

            box.innerHTML = `
                <img
                    src="${event.target.result}"
                    class="w-full h-full object-cover"
                    alt="Uploaded photo"
                >

                <button
                    type="button"
                    class="delete-photo absolute top-2 right-2 w-7 h-7 bg-white rounded-full text-red-600 flex items-center justify-center shadow"
                    data-index="${index}">
                    ×
                </button>
            `;

            previewContainer.appendChild(box);
        };

        reader.readAsDataURL(file);
    });
}


document.addEventListener("click", function(e) {

    if (e.target.classList.contains("delete-photo")) {

        const index = Number(e.target.dataset.index);

        selectedFiles.splice(index, 1);

        showPreviews();
    }

});
