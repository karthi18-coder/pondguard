import { auth, db } from "../firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// GET LOGIN FORM
// ===============================

const loginForm = document.querySelector("form");

const identifierInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");


// ===============================
// LOGIN
// ===============================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = identifierInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            console.log("Logged in:", user.uid);

            // Check where the user came from
            const params = new URLSearchParams(
                window.location.search
            );

            const redirect = params.get("redirect");

            if (redirect === "report") {

                window.location.href = "report.html";

            } else {

                window.location.href = "index.html";

            }

        } catch (error) {

            console.error(error);

            let message = "Login failed.";

            if (error.code === "auth/invalid-credential") {
                message = "Incorrect email or password.";
            }

            else if (error.code === "auth/user-not-found") {
                message = "No account found with this email.";
            }

            else if (error.code === "auth/wrong-password") {
                message = "Incorrect password.";
            }

            else if (error.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            }

            alert(message);
        }

    });

}


// ===============================
// CREATE ACCOUNT
// ===============================

const createAccountLink =
    document.querySelector("a[href='#']");

if (createAccountLink) {

    createAccountLink.addEventListener("click", async (event) => {

        event.preventDefault();

        const email = prompt("Enter your email:");

        if (!email) return;

        const password = prompt(
            "Create a password (minimum 6 characters):"
        );

        if (!password) return;

        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");
            return;

        }

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;


            // Create user profile in Firestore

            await setDoc(
                doc(db, "users", user.uid),
                {
                    email: user.email,
                    createdAt: serverTimestamp()
                }
            );


            alert("Account created successfully!");


            // Go to report page

            const params = new URLSearchParams(
                window.location.search
            );

            if (params.get("redirect") === "report") {

                window.location.href = "report.html";

            } else {

                window.location.href = "index.html";

            }

        } catch (error) {

            console.error(error);

            let message = "Unable to create account.";

            if (error.code === "auth/email-already-in-use") {
                message = "This email already has an account.";
            }

            else if (error.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            }

            else if (error.code === "auth/weak-password") {
                message = "Password must contain at least 6 characters.";
            }

            alert(message);
        }

    });

}


// ===============================
// FORGOT PASSWORD
// ===============================

const forgotPasswordLink =
    document.querySelector("a[href='#']");


// Because there are two # links,
// find the one containing "Forgot password"

const links = document.querySelectorAll("a");

links.forEach((link) => {

    if (
        link.textContent
            .trim()
            .toLowerCase()
            .includes("forgot password")
    ) {

        link.addEventListener("click", async (event) => {

            event.preventDefault();

            const email = identifierInput.value.trim();

            if (!email) {

                alert(
                    "Enter your email in the Email or Phone field first."
                );

                return;
            }

            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );

                alert(
                    "Password reset email sent. Check your inbox."
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to send password reset email."
                );
            }

        });

    }

});


// ===============================
// CHECK CURRENT LOGIN
// ===============================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Firebase user already logged in:",
            user.email
        );

    }

});
