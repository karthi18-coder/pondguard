import { auth, db } from "./firebase-config.js";

import {
    collection,
    getDocs,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

async function testAdminAndReports(user) {

    console.log("=================================");
    console.log("PONDGUARDIAN FIREBASE DEBUG");
    console.log("=================================");

    console.log("Firebase user:", user);
    console.log("UID:", user.uid);
    console.log("Email:", user.email);

    // -----------------------------------------
    // TEST 1: ADMIN DOCUMENT
    // -----------------------------------------

    try {

        const adminRef = doc(
            db,
            "admins",
            user.uid
        );

        const adminSnap =
            await getDoc(adminRef);

        console.log(
            "Admin document exists:",
            adminSnap.exists()
        );

        if (!adminSnap.exists()) {

            throw new Error(
                "ADMIN DOCUMENT NOT FOUND: admins/" +
                user.uid
            );
        }

        console.log(
            "✅ ADMIN AUTHORIZATION PASSED"
        );

    } catch (error) {

        console.error(
            "❌ ADMIN CHECK FAILED:",
            error
        );

        showFirebaseError(
            "Admin authorization failed",
            error
        );

        return;
    }


    // -----------------------------------------
    // TEST 2: READ REPORTS
    // -----------------------------------------

    try {

        const reportsRef =
            collection(db, "reports");

        const snapshot =
            await getDocs(reportsRef);

        console.log(
            "✅ REPORT READ SUCCESS"
        );

        console.log(
            "Reports found:",
            snapshot.size
        );

        allReports =
            snapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            }));

        allReports.sort((a, b) => {

            const dateA =
                getDate(a.data)?.getTime() || 0;

            const dateB =
                getDate(b.data)?.getTime() || 0;

            return dateB - dateA;

        });

        updateDashboard();

    } catch (error) {

        console.error(
            "❌ REPORT READ FAILED:",
            error
        );

        showFirebaseError(
            "Reports read permission failed",
            error
        );
    }
}


function showFirebaseError(title, error) {

    console.error(
        title,
        error.code,
        error.message
    );

    if (els.table) {

        els.table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading-cell error-cell"
                >
                    <strong>${escapeHTML(title)}</strong>
                    <br><br>
                    <small>
                        Code:
                        ${escapeHTML(error.code || "unknown")}
                    </small>
                    <br>
                    <small>
                        ${escapeHTML(
                            error.message ||
                            "Unknown Firebase error"
                        )}
                    </small>
                </td>
            </tr>
        `;
    }

    showToast(title);
}


function setupAuthState() {

    auth.onAuthStateChanged(async user => {

        if (!user) {

            console.error(
                "❌ NO FIREBASE USER LOGGED IN"
            );

            if (els.table) {

                els.table.innerHTML = `
                    <tr>
                        <td
                            colspan="7"
                            class="loading-cell error-cell"
                        >
                            Please login first.
                        </td>
                    </tr>
                `;
            }

            return;
        }

        const adminEmail =
            $("adminEmail");

        if (adminEmail) {
            adminEmail.textContent =
                user.email;
        }

        console.log(
            "✅ Firebase authenticated"
        );

        console.log(
            "UID:",
            user.uid
        );

        await testAdminAndReports(user);

    });
}
/* =========================================================
   PONDGUARDIAN - SIMULATED IoT SENSOR MONITORING
   ========================================================= */

function setupIoTSimulation() {

    const phElement = document.getElementById("iotPh");
    const temperatureElement =
        document.getElementById("iotTemperature");
    const turbidityElement =
        document.getElementById("iotTurbidity");
    const waterLevelElement =
        document.getElementById("iotWaterLevel");

    const phStatusElement =
        document.getElementById("iotPhStatus");
    const tempStatusElement =
        document.getElementById("iotTempStatus");
    const turbidityStatusElement =
        document.getElementById("iotTurbidityStatus");
    const waterStatusElement =
        document.getElementById("iotWaterStatus");

    const pondHealthElement =
        document.getElementById("pondHealthStatus");

    const lastUpdatedElement =
        document.getElementById("iotLastUpdated");

    const alertElement =
        document.getElementById("iotAlert");

    const pondSelect =
        document.getElementById("iotPondSelect");


    // Safety check
    if (
        !phElement ||
        !temperatureElement ||
        !turbidityElement ||
        !waterLevelElement
    ) {
        console.warn("IoT dashboard elements not found.");
        return;
    }


    /* ---------------------------------------------------------
       Initial simulated sensor values
       --------------------------------------------------------- */

    let sensorData = {
        ph: 7.2,
        temperature: 28.4,
        turbidity: 18,
        waterLevel: 72
    };


    /* ---------------------------------------------------------
       Random sensor fluctuation
       --------------------------------------------------------- */

    function fluctuate(value, amount) {

        const change =
            (Math.random() * amount * 2) - amount;

        return value + change;
    }


    /* ---------------------------------------------------------
       Keep values inside realistic demo limits
       --------------------------------------------------------- */

    function clamp(value, min, max) {

        return Math.min(
            Math.max(value, min),
            max
        );
    }


    /* ---------------------------------------------------------
       Generate simulated sensor readings
       --------------------------------------------------------- */

    function generateSensorData() {

        sensorData.ph = clamp(
            fluctuate(sensorData.ph, 0.05),
            6.0,
            8.8
        );

        sensorData.temperature = clamp(
            fluctuate(sensorData.temperature, 0.3),
            22,
            36
        );

        sensorData.turbidity = clamp(
            fluctuate(sensorData.turbidity, 2),
            5,
            70
        );

        sensorData.waterLevel = clamp(
            fluctuate(sensorData.waterLevel, 2),
            20,
            95
        );
    }


    /* ---------------------------------------------------------
       Update sensor cards
       --------------------------------------------------------- */

    function updateIoTDashboard() {

        generateSensorData();

        phElement.textContent =
            sensorData.ph.toFixed(1);

        temperatureElement.textContent =
            sensorData.temperature.toFixed(1);

        turbidityElement.textContent =
            Math.round(sensorData.turbidity);

        waterLevelElement.textContent =
            Math.round(sensorData.waterLevel);


        updatePHStatus();
        updateTemperatureStatus();
        updateTurbidityStatus();
        updateWaterLevelStatus();

        updatePondHealth();
        updateLastUpdated();
    }


    /* ---------------------------------------------------------
       pH
       --------------------------------------------------------- */

    function updatePHStatus() {

        phStatusElement.className = "sensor-status";

        if (
            sensorData.ph >= 6.5 &&
            sensorData.ph <= 8.5
        ) {

            phStatusElement.textContent =
                "● Normal";

            phStatusElement.classList.add("good");

        } else {

            phStatusElement.textContent =
                "● Abnormal";

            phStatusElement.classList.add("danger");
        }
    }


    /* ---------------------------------------------------------
       Temperature
       --------------------------------------------------------- */

    function updateTemperatureStatus() {

        tempStatusElement.className =
            "sensor-status";

        if (
            sensorData.temperature >= 20 &&
            sensorData.temperature <= 32
        ) {

            tempStatusElement.textContent =
                "● Normal";

            tempStatusElement.classList.add("good");

        } else if (
            sensorData.temperature <= 35
        ) {

            tempStatusElement.textContent =
                "● High";

            tempStatusElement.classList.add("warning");

        } else {

            tempStatusElement.textContent =
                "● Critical";

            tempStatusElement.classList.add("danger");
        }
    }


    /* ---------------------------------------------------------
       Turbidity
       --------------------------------------------------------- */

    function updateTurbidityStatus() {

        turbidityStatusElement.className =
            "sensor-status";

        if (sensorData.turbidity <= 25) {

            turbidityStatusElement.textContent =
                "● Clear";

            turbidityStatusElement.classList.add("good");

        } else if (
            sensorData.turbidity <= 50
        ) {

            turbidityStatusElement.textContent =
                "● Slightly Turbid";

            turbidityStatusElement.classList.add("warning");

        } else {

            turbidityStatusElement.textContent =
                "● High Turbidity";

            turbidityStatusElement.classList.add("danger");
        }
    }


    /* ---------------------------------------------------------
       Water Level
       --------------------------------------------------------- */

    function updateWaterLevelStatus() {

        waterStatusElement.className =
            "sensor-status";

        if (sensorData.waterLevel >= 50) {

            waterStatusElement.textContent =
                "● Normal";

            waterStatusElement.classList.add("good");

        } else if (
            sensorData.waterLevel >= 30
        ) {

            waterStatusElement.textContent =
                "● Low";

            waterStatusElement.classList.add("warning");

        } else {

            waterStatusElement.textContent =
                "● Critical";

            waterStatusElement.classList.add("danger");
        }
    }


    /* ---------------------------------------------------------
       Overall Pond Health
       --------------------------------------------------------- */

    function updatePondHealth() {

        const phGood =
            sensorData.ph >= 6.5 &&
            sensorData.ph <= 8.5;

        const temperatureGood =
            sensorData.temperature >= 20 &&
            sensorData.temperature <= 32;

        const turbidityGood =
            sensorData.turbidity <= 25;

        const waterLevelGood =
            sensorData.waterLevel >= 50;


        const problems = [
            !phGood,
            !temperatureGood,
            !turbidityGood,
            !waterLevelGood
        ].filter(Boolean).length;


        if (problems === 0) {

            pondHealthElement.textContent =
                "GOOD";

            pondHealthElement.style.color =
                "#15803d";

            showIoTAlert(
                "normal"
            );

        } else if (problems <= 2) {

            pondHealthElement.textContent =
                "MODERATE";

            pondHealthElement.style.color =
                "#d97706";

            showIoTAlert(
                "warning"
            );

        } else {

            pondHealthElement.textContent =
                "CRITICAL";

            pondHealthElement.style.color =
                "#dc2626";

            showIoTAlert(
                "critical"
            );
        }
    }


    /* ---------------------------------------------------------
       IoT Alert
       --------------------------------------------------------- */

    function showIoTAlert(type) {

        if (type === "normal") {

            alertElement.innerHTML = `
                <span>✓</span>
                <div>
                    <strong>
                        Water quality is within normal range
                    </strong>
                    <p>
                        All monitored parameters are currently stable.
                    </p>
                </div>
            `;

        } else if (type === "warning") {

            alertElement.innerHTML = `
                <span>!</span>
                <div>
                    <strong>
                        Water quality requires attention
                    </strong>
                    <p>
                        One or more sensor parameters
                        are outside the preferred range.
                    </p>
                </div>
            `;

        } else {

            alertElement.innerHTML = `
                <span>!</span>
                <div>
                    <strong>
                        Critical water quality alert
                    </strong>
                    <p>
                        Immediate inspection of the pond is recommended.
                    </p>
                </div>
            `;
        }
    }


    /* ---------------------------------------------------------
       Last updated time
       --------------------------------------------------------- */

    function updateLastUpdated() {

        const now = new Date();

        const time =
            now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

        lastUpdatedElement.textContent =
            time;
    }


    /* ---------------------------------------------------------
       Pond Selection
       --------------------------------------------------------- */

    if (pondSelect) {

        pondSelect.addEventListener(
            "change",
            () => {

                const selectedPond =
                    pondSelect.value;

                if (
                    selectedPond ===
                    "Kelavarapalli"
                ) {

                    sensorData = {
                        ph: 7.2,
                        temperature: 28.4,
                        turbidity: 18,
                        waterLevel: 72
                    };

                } else if (
                    selectedPond === "Ponnaiyar"
                ) {

                    sensorData = {
                        ph: 7.5,
                        temperature: 29.1,
                        turbidity: 22,
                        waterLevel: 68
                    };

                } else if (
                    selectedPond === "Bagalur"
                ) {

                    sensorData = {
                        ph: 6.9,
                        temperature: 27.8,
                        turbidity: 16,
                        waterLevel: 81
                    };
                }

                updateIoTDashboard();
            }
        );
    }


    /* ---------------------------------------------------------
       Initial IoT reading
       --------------------------------------------------------- */

    updateIoTDashboard();


    /* ---------------------------------------------------------
       LIVE SIMULATION
       Every 3 seconds
       --------------------------------------------------------- */

    setInterval(
        updateIoTDashboard,
        3000
    );

}


/* =========================================================
   START IoT SIMULATION
   ========================================================= */

setupIoTSimulation();
