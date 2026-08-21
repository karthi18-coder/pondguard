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
