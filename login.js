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

const signinForm = document.getElementById("signin-form");
const registerForm = document.getElementById("register-form");

const signinEmail = document.getElementById("signin-email");
const signinPassword = document.getElementById("signin-password");

const registerName = document.getElementById("register-name");
const registerEmail = document.getElementById("register-email");
const registerMobile = document.getElementById("register-mobile");
const registerPassword = document.getElementById("register-password");
const registerConfirm = document.getElementById("register-confirm");

const createAccountBtn =
    document.getElementById("createAccountBtn");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

const showLoginBtn =
    document.getElementById("show-login");

const loginPanel =
    document.querySelector(".login-panel");

const registerPanel =
    document.querySelector(".register-panel");

const loginMessage =
    document.getElementById("login-message");

const registerMessage =
    document.getElementById("register-message");


// ==========================================
// MESSAGE HELPER
// ==========================================

function showMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;
    element.className = "message " + type;

}


// ==========================================
// CREATE ACCOUNT → SHOW REGISTER FORM
// ==========================================

if (createAccountBtn) {

    createAccountBtn.addEventListener("click", function (event) {

        event.preventDefault();

        if (loginPanel) {
            loginPanel.classList.remove("active");
        }

        if (registerPanel) {
            registerPanel.classList.add("active");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


// ==========================================
// SHOW LOGIN
// ==========================================

if (showLoginBtn) {

    showLoginBtn.addEventListener("click", function () {

        if (registerPanel) {
            registerPanel.classList.remove("active");
        }

        if (loginPanel) {
            loginPanel.classList.add("active");
        }

    });

}


// ==========================================
// LOGIN
// ==========================================

if (signinForm) {

    signinForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = signinEmail.value.trim();
        const password = signinPassword.value;

        if (!email || !password) {

            showMessage(
                loginMessage,
                "Please enter your email and password."
            );

            return;
        }

        try {

            showMessage(
                loginMessage,
                "Signing in...",
                "success"
            );

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

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

                showMessage(
                    loginMessage,
                    "Incorrect email or password."
                );

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                showMessage(
                    loginMessage,
                    "Please enter a valid email address."
                );

            } else {

                showMessage(
                    loginMessage,
                    "Login failed. Please try again."
                );
            }

        }

    });

}


// ==========================================
// CREATE ACCOUNT
// ==========================================

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            registerName.value.trim();

        const email =
            registerEmail.value.trim();

        const mobile =
            registerMobile.value.trim();

        const password =
            registerPassword.value;

        const confirmPassword =
            registerConfirm.value;


        // Name validation

        if (!name) {

            showMessage(
                registerMessage,
                "Please enter your full name."
            );

            return;
        }


        // Email validation

        if (!email) {

            showMessage(
                registerMessage,
                "Please enter your email address."
            );

            return;
        }


        // Mobile validation

        if (!/^[0-9]{10}$/.test(mobile)) {

            showMessage(
                registerMessage,
                "Mobile number must be exactly 10 digits."
            );

            registerMobile.focus();

            return;
        }


        // Password validation

        if (password.length < 6) {

            showMessage(
                registerMessage,
                "Password must contain at least 6 characters."
            );

            return;
        }


        // Confirm password

        if (password !== confirmPassword) {

            showMessage(
                registerMessage,
                "Passwords do not match."
            );

            return;
        }


        try {

            showMessage(
                registerMessage,
                "Creating your account...",
                "success"
            );


            // Firebase Authentication

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                userCredential.user;


            // Firestore user profile

            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: name,
                    email: email,
                    mobile: mobile,
                    createdAt: serverTimestamp()
                }
            );


            showMessage(
                registerMessage,
                "Account created successfully!",
                "success"
            );


            // Redirect after signup

            setTimeout(() => {

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

            }, 1000);


        } catch (error) {

            console.error(
                "Signup error:",
                error
            );


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                showMessage(
                    registerMessage,
                    "This email already has an account. Please login."
                );

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                showMessage(
                    registerMessage,
                    "Please enter a valid email address."
                );

            } else if (
                error.code ===
                "auth/weak-password"
            ) {

                showMessage(
                    registerMessage,
                    "Password must contain at least 6 characters."
                );

            } else {

                showMessage(
                    registerMessage,
                    "Account creation failed. Please try again."
                );
            }

        }

    });

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener("click", async function (event) {

        event.preventDefault();

        const email =
            signinEmail.value.trim();


        if (!email) {

            showMessage(
                loginMessage,
                "Enter your email address first, then click Forgot password."
            );

            signinEmail.focus();

            return;
        }


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );

            showMessage(
                loginMessage,
                "Password reset email sent. Check your inbox.",
                "success"
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

                showMessage(
                    loginMessage,
                    "Please enter a valid email address."
                );

            } else if (
                error.code ===
                "auth/user-not-found"
            ) {

                showMessage(
                    loginMessage,
                    "No account was found with this email."
                );

            } else {

                showMessage(
                    loginMessage,
                    "Unable to send the reset email."
                );
            }

        }

    });

}


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", function () {

            const targetId =
                button.getAttribute("data-target");

            const input =
                document.getElementById(targetId);

            const icon =
                button.querySelector(
                    ".material-symbols-outlined"
                );

            if (!input) return;


            if (input.type === "password") {

                input.type = "text";

                if (icon) {
                    icon.textContent =
                        "visibility_off";
                }

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                if (icon) {
                    icon.textContent =
                        "visibility";
                }

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });

    });


// ==========================================
// FIREBASE AUTH STATE
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Logged in:",
            user.email
        );

    } else {

        console.log(
            "No user logged in."
        );

    }

});
