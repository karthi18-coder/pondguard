import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const loginForm = document.querySelector("form");

const emailInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");

const createAccountBtn =
    document.getElementById("createAccountBtn");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");


// ==========================================
// PASSWORD VISIBILITY
// ==========================================

const passwordVisibilityButton =
    passwordInput?.parentElement?.querySelector(
        'button[type="button"]'
    );

if (passwordVisibilityButton && passwordInput) {

    passwordVisibilityButton.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            const icon =
                passwordVisibilityButton.querySelector(
                    ".material-symbols-outlined"
                );

            if (icon) {
                icon.textContent = "visibility_off";
            }

        } else {

            passwordInput.type = "password";

            const icon =
                passwordVisibilityButton.querySelector(
                    ".material-symbols-outlined"
                );

            if (icon) {
                icon.textContent = "visibility";
            }
        }

    });
}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = emailInput.value.trim();
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

            console.log(
                "Login successful:",
                userCredential.user.email
            );

            // Check whether user came from Report button

            const params =
                new URLSearchParams(
                    window.location.search
                );

            if (params.get("redirect") === "report") {

                window.location.href = "report.html";

            } else {

                window.location.href = "index.html";

            }

        } catch (error) {

            console.error("Login error:", error);

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                alert(
                    "Incorrect email or password."
                );

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                alert(
                    "Please enter a valid email address."
                );

            } else {

                alert(
                    "Login failed. Please try again."
                );
            }

        }

    });

}


// ==========================================
// CREATE ACCOUNT
// ==========================================

if (createAccountBtn) {

    createAccountBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            const email =
                prompt("Enter your email address:");

            if (!email) {
                return;
            }

            const mobile =
                prompt(
                    "Enter your 10-digit mobile number:"
                );

            if (!mobile) {
                return;
            }

            // Remove spaces
            const cleanMobile =
                mobile.replace(/\s/g, "");

            if (!/^[0-9]{10}$/.test(cleanMobile)) {

                alert(
                    "Mobile number must contain exactly 10 digits."
                );

                return;
            }

            const password =
                prompt(
                    "Create a password (minimum 6 characters):"
                );

            if (!password) {
                return;
            }

            if (password.length < 6) {

                alert(
                    "Password must contain at least 6 characters."
                );

                return;
            }


            try {

                // Create Firebase account

                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user =
                    userCredential.user;


                // Save user details in Firestore

                await setDoc(
                    doc(db, "users", user.uid),
                    {
                        email: user.email,
                        mobile: cleanMobile,
                        createdAt: serverTimestamp()
                    }
                );


                alert(
                    "Account created successfully!"
                );


                // Redirect

                const params =
                    new URLSearchParams(
                        window.location.search
                    );

                if (
                    params.get("redirect") ===
                    "report"
                ) {

                    window.location.href =
                        "report.html";

                } else {

                    window.location.href =
                        "index.html";
                }


            } catch (error) {

                console.error(
                    "Account creation error:",
                    error
                );


                if (
                    error.code ===
                    "auth/email-already-in-use"
                ) {

                    alert(
                        "This email already has an account. Please login."
                    );

                } else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    alert(
                        "Please enter a valid email address."
                    );

                } else if (
                    error.code ===
                    "auth/weak-password"
                ) {

                    alert(
                        "Password must contain at least 6 characters."
                    );

                } else {

                    alert(
                        "Unable to create account. Please try again."
                    );
                }

            }

        }
    );

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            if (!email) {

                alert(
                    "Please enter your email address in the email field first."
                );

                emailInput.focus();

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );

                alert(
                    "Password reset email sent. Please check your inbox."
                );

            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );

                if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    alert(
                        "Please enter a valid email address."
                    );

                } else {

                    alert(
                        "Unable to send password reset email."
                    );
                }

            }

        }
    );

}


// ==========================================
// FIREBASE AUTH STATE
// ==========================================

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "Currently logged in:",
                user.email
            );

        } else {

            console.log(
                "No Firebase user logged in."
            );
        }

    }
);
