import { auth, db, storage } from "./firebase-config.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const submitReportBtn = document.getElementById("submitReportBtn");

if (submitReportBtn) {

    submitReportBtn.addEventListener("click", async function(e) {

        e.preventDefault();

        const user = auth.currentUser;

        // Check login
        if (!user) {
            alert("🔐 Please login first to submit a report.");
            return;
        }

        // Get form values
        const mobile =
            document.getElementById("mobile")?.value.trim();

        const district =
            document.getElementById("district")?.value;

        const taluk =
            document.getElementById("taluk")?.value.trim();

        const areaInput =
            document.querySelector("#reportForm input:not(#mobile):not(#taluk):not(#waterBodyName)");

        const area =
            areaInput?.value.trim() || "";

        const issueDescription =
            document.getElementById("issueDescription")?.value.trim();

        const selectedWaterType =
            document.querySelector(
                'input[name="waterType"]:checked'
            );

        const waterBodyType =
            selectedWaterType?.value || "";

        // Validate
        if (
            !mobile ||
            !district ||
            !taluk ||
            !area ||
            !issueDescription ||
            !waterBodyType
        ) {
            alert("⚠️ Please fill all required fields.");
            return;
        }

        // Check evidence
        const files =
            evidenceInput
                ? Array.from(evidenceInput.files)
                : [];

        if (files.length === 0) {
            alert("📷 Please upload at least one photo or video.");
            return;
        }

        try {

            submitReportBtn.disabled = true;
            submitReportBtn.textContent = "Uploading...";

            const evidenceURLs = [];

            // Upload every photo/video
            for (const file of files) {

                const fileName =
                    `${Date.now()}_${file.name}`;

                const storageRef =
                    ref(
                        storage,
                        `reports/${user.uid}/${fileName}`
                    );

                await uploadBytes(storageRef, file);

                const downloadURL =
                    await getDownloadURL(storageRef);

                evidenceURLs.push({
                    name: file.name,
                    type: file.type,
                    url: downloadURL
                });
            }

            submitReportBtn.textContent =
                "Saving Report...";

            // Save report to Firestore
            await addDoc(
                collection(db, "reports"),
                {
                    userId: user.uid,
                    email: user.email || "",

                    mobile: mobile,
                    district: district,
                    taluk: taluk,
                    area: area,

                    waterBodyType:
                        waterBodyType,

                    issueDescription:
                        issueDescription,

                    evidence:
                        evidenceURLs,

                    status: "Pending",

                    createdAt:
                        serverTimestamp()
                }
            );

            alert(
                "✅ Report submitted successfully!"
            );

            // Reset form
            document
                .getElementById("reportForm")
                ?.reset();

            if (previewContainer) {
                previewContainer.innerHTML = "";
            }

            if (previewSection) {
                previewSection.style.display = "none";
            }

            submitReportBtn.disabled = false;
            submitReportBtn.textContent =
                "Submit Report";

        } catch (error) {

            console.error(
                "Report submission error:",
                error
            );

            alert(
                "❌ Report could not be submitted.\n\n" +
                error.message
            );

            submitReportBtn.disabled = false;
            submitReportBtn.textContent =
                "Submit Report";
        }

    });
}
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


// Evidence image/video preview
const evidenceInput = document.getElementById("evidenceInput");
const previewSection = document.getElementById("previewSection");
const previewContainer = document.getElementById("previewContainer");

if (evidenceInput) {

    evidenceInput.addEventListener("change", function () {

        previewContainer.innerHTML = "";

        const files = Array.from(evidenceInput.files);

        if (files.length === 0) {
            previewSection.style.display = "none";
            return;
        }

        previewSection.style.display = "block";

        files.forEach(function(file) {

            const box = document.createElement("div");

            box.className =
                "relative flex-shrink-0 w-32 h-32 rounded-[12px] overflow-hidden border border-outline-variant shadow-sm bg-surface";

            const url = URL.createObjectURL(file);

            if (file.type.startsWith("image/")) {

                box.innerHTML = `
                    <img
                        src="${url}"
                        class="w-full h-full object-cover"
                        alt="Selected image"
                    >

                    <button
                        type="button"
                        class="delete-preview absolute top-2 right-2 w-7 h-7 bg-white rounded-full text-red-600 shadow">
                        ×
                    </button>
                `;

            } else if (file.type.startsWith("video/")) {

                box.innerHTML = `
                    <video
                        src="${url}"
                        class="w-full h-full object-cover"
                        controls>
                    </video>

                    <button
                        type="button"
                        class="delete-preview absolute top-2 right-2 w-7 h-7 bg-white rounded-full text-red-600 shadow">
                        ×
                    </button>
                `;
            }

            previewContainer.appendChild(box);

            box.querySelector(".delete-preview").addEventListener("click", function() {
                box.remove();

                if (previewContainer.children.length === 0) {
                    previewSection.style.display = "none";
                    evidenceInput.value = "";
                }
            });

        });
    });
}
