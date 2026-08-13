import { auth, db } from "./firebase-config.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ======================================================
// ELEMENTS
// ======================================================

const reportForm = document.getElementById("reportForm");
const submitReportBtn = document.getElementById("submitReportBtn");

const evidenceInput =
    document.getElementById("evidenceInput");

const previewSection =
    document.getElementById("previewSection");

const previewContainer =
    document.getElementById("previewContainer");


// ======================================================
// GET AREA FIELD
// ======================================================

function getAreaValue() {

    const labels =
        Array.from(
            document.querySelectorAll("#reportForm label")
        );

    const areaLabel =
        labels.find(
            label =>
                label.textContent.trim().toLowerCase() === "area"
        );

    if (!areaLabel) {
        return "";
    }

    const parent =
        areaLabel.parentElement;

    const input =
        parent?.querySelector("input");

    return input?.value.trim() || "";
}


// ======================================================
// REPORT SUBMISSION
// ======================================================

if (reportForm) {

    reportForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        // ----------------------------------------------
        // CHECK LOGIN
        // ----------------------------------------------

        const user = auth.currentUser;

        if (!user) {

            alert(
                "🔐 Please login first to submit a report."
            );

            return;
        }


        // ----------------------------------------------
        // GET FORM VALUES
        // ----------------------------------------------

        const mobile =
            document.getElementById("mobile")
                ?.value
                .trim() || "";

        const district =
            document.getElementById("district")
                ?.value
                .trim() || "";

        const taluk =
            document.getElementById("taluk")
                ?.value
                .trim() || "";

        const area =
    document.getElementById("area")?.value.trim() || "";

        const issueDescription =
            document.getElementById("issueDescription")
                ?.value
                .trim() || "";

        const selectedWaterType =
            document.querySelector(
                'input[name="waterType"]:checked'
            );

        const waterBodyType =
            selectedWaterType?.value || "";

        // Community / Volunteer Details
const participationType =
    document.querySelector(
        'input[name="participationType"]:checked'
    )?.value || "None";

const institutionName =
    document.getElementById("institutionName")?.value.trim() || "";

const department =
    document.getElementById("department")?.value.trim() || "";

const studyYear =
    document.getElementById("studyYear")?.value || "";

const organizationUnit =
    document.getElementById("organizationUnit")?.value.trim() || "";

const reportingAs =
    document.querySelector(
        'input[name="reportingAs"]:checked'
    )?.value || "Individual";

const volunteerCount =
    document.getElementById("volunteerCount")?.value || "";

const volunteerActivity =
    document.getElementById("volunteerActivity")?.value || "";


        // ----------------------------------------------
        // GET SELECTED EVIDENCE FILES
        // ----------------------------------------------

        const files =
            evidenceInput
                ? Array.from(evidenceInput.files)
                : [];


        // ----------------------------------------------
        // VALIDATION
        // ----------------------------------------------

        if (!mobile) {

            alert("⚠️ Please enter your mobile number.");
            return;
        }

        if (!district) {

            alert("⚠️ Please select a district.");
            return;
        }

        if (!taluk) {

            alert("⚠️ Please enter the taluk.");
            return;
        }

        if (!area) {

            alert("⚠️ Please enter the area.");
            return;
        }

        if (!waterBodyType) {

            alert("⚠️ Please select the water body type.");
            return;
        }

        if (!issueDescription) {

            alert("⚠️ Please describe the issue.");
            return;
        }

        if (files.length === 0) {

            alert(
                "📷 Please select at least one photo or video."
            );

            return;
        }


        // ----------------------------------------------
        // CREATE EVIDENCE INFORMATION
        // ----------------------------------------------
        // Actual files are NOT uploaded because Firebase
        // Storage is not enabled on the current plan.
        // We only save their basic information in Firestore.

        const evidenceInfo =
            files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size
            }));


        // ----------------------------------------------
        // GENERATE REPORT ID
        // ----------------------------------------------

        const reportId =
            "PG-" +
            String(Date.now()).slice(-6);


        // ----------------------------------------------
        // START SUBMISSION
        // ----------------------------------------------

        try {

            submitReportBtn.disabled = true;

            submitReportBtn.textContent =
                "Submitting...";


            // ------------------------------------------
            // SAVE REPORT TO FIRESTORE
            // ------------------------------------------

            const reportData = {

                reportId: reportId,

                userId: user.uid,

                email:
                    user.email || "",

                mobile:
                    mobile,

                district:
                    district,

                taluk:
                    taluk,

                area:
                    area,

                waterBodyType:
                    waterBodyType,

                issueDescription:
                    issueDescription,

                evidence:
                    evidenceInfo,

                evidenceCount:
                    files.length,
                // Community / Volunteer Details
participationType:
    document.querySelector(
        'input[name="participationType"]:checked'
    )?.value || "None",

institutionName:
    document.getElementById("institutionName")?.value.trim() || "",

department:
    document.getElementById("department")?.value.trim() || "",

studyYear:
    document.getElementById("studyYear")?.value || "",

organizationUnit:
    document.getElementById("organizationUnit")?.value.trim() || "",

reportingAs:
    document.querySelector(
        'input[name="reportingAs"]:checked'
    )?.value || "Individual",

volunteerCount:
    document.getElementById("volunteerCount")?.value || "",

volunteerActivity:
    document.getElementById("volunteerActivity")?.value || "",

                status:
                    "Pending",

                createdAt:
                    serverTimestamp()
            };


            await addDoc(
                collection(db, "reports"),
                reportData
            );


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            alert(
                "✅ Report submitted successfully!\n\n" +
                "Report ID: " + reportId
            );


            // ------------------------------------------
            // RESET FORM
            // ------------------------------------------

            reportForm.reset();


            if (previewContainer) {

                previewContainer.innerHTML = "";
            }


            if (previewSection) {

                previewSection.style.display =
                    "none";
            }


        } catch (error) {

            console.error(
                "Report submission error:",
                error
            );


            alert(
                "❌ Report could not be submitted.\n\n" +
                error.message
            );

        } finally {

            submitReportBtn.disabled = false;

            submitReportBtn.textContent =
                "Submit Report";
        }

    });
}


// ======================================================
// CAMERA
// ======================================================

let stream;

let mediaRecorder;

let videoChunks = [];


// ------------------------------------------------------
// START CAMERA
// ------------------------------------------------------

async function startCamera() {

    try {

        stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

        const camera =
            document.getElementById("camera");

        if (camera) {

            camera.srcObject =
                stream;
        }

    } catch (error) {

        alert(
            "Camera permission denied or camera not available."
        );

        console.error(error);
    }
}


// ------------------------------------------------------
// TAKE PHOTO
// ------------------------------------------------------

function takePhoto() {

    const camera =
        document.getElementById("camera");

    const canvas =
        document.getElementById("photoCanvas");

    const preview =
        document.getElementById("photoPreview");


    if (!camera || !canvas || !preview) {

        console.error(
            "Camera elements not found."
        );

        return;
    }


    canvas.width =
        camera.videoWidth;

    canvas.height =
        camera.videoHeight;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        camera,
        0,
        0
    );


    preview.src =
        canvas.toDataURL("image/png");
}


// ------------------------------------------------------
// START VIDEO RECORDING
// ------------------------------------------------------

function startRecording() {

    if (!stream) {

        alert(
            "Please start the camera first."
        );

        return;
    }


    videoChunks = [];


    try {

        mediaRecorder =
            new MediaRecorder(stream);

    } catch (error) {

        alert(
            "Video recording is not supported on this device."
        );

        console.error(error);

        return;
    }


    mediaRecorder.ondataavailable =
        function (event) {

            if (event.data.size > 0) {

                videoChunks.push(
                    event.data
                );
            }
        };


    mediaRecorder.onstop =
        function () {

            const videoBlob =
                new Blob(
                    videoChunks,
                    {
                        type: "video/webm"
                    }
                );


            const videoURL =
                URL.createObjectURL(
                    videoBlob
                );


            const videoPreview =
                document.getElementById(
                    "videoPreview"
                );


            if (videoPreview) {

                videoPreview.src =
                    videoURL;
            }
        };


    mediaRecorder.start();


    alert(
        "Video recording started!"
    );
}


// ------------------------------------------------------
// STOP VIDEO RECORDING
// ------------------------------------------------------

function stopRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state === "recording"
    ) {

        mediaRecorder.stop();

        alert(
            "Video recording stopped!"
        );
    }
}


// ======================================================
// MAKE CAMERA FUNCTIONS AVAILABLE TO HTML
// ======================================================

window.startCamera =
    startCamera;

window.takePhoto =
    takePhoto;

window.startRecording =
    startRecording;

window.stopRecording =
    stopRecording;


// ======================================================
// EVIDENCE PREVIEW
// ======================================================

if (evidenceInput) {

    evidenceInput.addEventListener(
        "change",
        function () {

            if (!previewContainer ||
                !previewSection) {

                return;
            }


            previewContainer.innerHTML = "";


            const files =
                Array.from(
                    evidenceInput.files
                );


            if (files.length === 0) {

                previewSection.style.display =
                    "none";

                return;
            }


            previewSection.style.display =
                "block";


            files.forEach(function (file) {

                const box =
                    document.createElement("div");


                box.className =
                    "relative flex-shrink-0 w-32 h-32 rounded-[12px] overflow-hidden border border-outline-variant shadow-sm bg-surface";


                const url =
                    URL.createObjectURL(file);


                // --------------------------------------
                // IMAGE
                // --------------------------------------

                if (
                    file.type.startsWith(
                        "image/"
                    )
                ) {

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
                }


                // --------------------------------------
                // VIDEO
                // --------------------------------------

                else if (
                    file.type.startsWith(
                        "video/"
                    )
                ) {

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


                previewContainer.appendChild(
                    box
                );


                // --------------------------------------
                // DELETE PREVIEW
                // --------------------------------------

                const deleteButton =
                    box.querySelector(
                        ".delete-preview"
                    );


                if (deleteButton) {

                    deleteButton.addEventListener(
                        "click",
                        function () {

                            box.remove();


                            if (
                                previewContainer
                                    .children
                                    .length === 0
                            ) {

                                previewSection.style.display =
                                    "none";

                                evidenceInput.value =
                                    "";
                            }

                        }
                    );
                }

            });

        }
    );
}
