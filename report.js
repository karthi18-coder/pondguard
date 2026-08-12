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
// ===============================
// Evidence Photo Upload & Preview
// ===============================

const evidenceInput = document.getElementById("evidenceInput");
const previewContainer = document.getElementById("previewContainer");
const previewSection = document.getElementById("previewSection");

let selectedFiles = [];

if (evidenceInput) {

    evidenceInput.addEventListener("change", function () {

        const files = Array.from(this.files);

        files.forEach(file => {

            // Allow images only
            if (!file.type.startsWith("image/")) {
                alert("Please upload image files only.");
                return;
            }

            // Maximum 10MB
            if (file.size > 10 * 1024 * 1024) {
                alert(file.name + " is larger than 10MB.");
                return;
            }

            selectedFiles.push(file);
        });

        updatePreview();

        // Allow selecting the same image again
        this.value = "";
    });
}


function updatePreview() {

    previewContainer.innerHTML = "";

    if (selectedFiles.length === 0) {
        previewSection.style.display = "none";
        return;
    }

    previewSection.style.display = "block";

    selectedFiles.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = function (event) {

            const previewBox = document.createElement("div");

            previewBox.className =
                "relative flex-shrink-0 w-32 h-32 rounded-[12px] overflow-hidden group border border-outline-variant shadow-sm";

            previewBox.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Uploaded evidence"
                    class="w-full h-full object-cover"
                >

                <button
                    type="button"
                    class="delete-evidence absolute top-2 right-2 w-7 h-7
                    bg-white/90 text-red-600 rounded-full
                    flex items-center justify-center
                    shadow-sm hover:bg-white hover:scale-110 transition-all"
                    data-index="${index}"
                >
                    <span class="material-symbols-outlined text-sm font-bold">
                        close
                    </span>
                </button>

                <div class="absolute bottom-1 left-1 right-1
                    bg-green-500/90 text-white text-[10px]
                    font-bold px-2 py-1 rounded
                    backdrop-blur-sm flex items-center gap-1">

                    <span class="material-symbols-outlined text-[12px]">
                        check_circle
                    </span>

                    Uploaded
                </div>
            `;

            previewContainer.appendChild(previewBox);
        };

        reader.readAsDataURL(file);
    });
}


// Delete uploaded photo
document.addEventListener("click", function (event) {

    const deleteButton = event.target.closest(".delete-evidence");

    if (!deleteButton) return;

    const index = Number(deleteButton.dataset.index);

    selectedFiles.splice(index, 1);

    updatePreview();
});


  
