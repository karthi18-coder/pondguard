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

const loginForm = document.getElementById("signin-form");
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
    element.className = `message ${type}`;

}


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    loginPanel?.classList.add("active");
    registerPanel?.classList.remove("active");

}


// ==========================================
// SHOW REGISTER
// ==========================================

function showRegister() {

    loginPanel?.classList.remove("active");
    registerPanel?.classList.add("active");

}


// ==========================================
// CREATE ACCOUNT BUTTON
// ==========================================

if (createAccountBtn) {

    createAccountBtn.addEventListener("click", (event) => {

        event.preventDefault();

        showRegister();

    });

}


// ==========================================
// BACK TO LOGIN
// ==========================================

if (showLoginBtn) {

    showLoginBtn.addEventListener("click", () => {

        showLogin();

    });

}


// ==========================================
// PASSWORD VISIBILITY
// ==========================================

document.querySelectorAll(".password-toggle").forEach(button => {

    button.addEventListener("click", () => {

        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);

        if (!input) return;

        const icon =
            button.querySelector(".material-symbols-outlined");

        if (input.type === "password") {

            input.type = "text";

            if (icon) {
                icon.textContent = "visibility_off";
            }

            button.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            input.type = "password";

            if (icon) {
                icon.textContent = "visibility";
            }

            button.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

});


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

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

            showMessage(
                loginMessage,
                "Login successful!",
                "success"
            );

            // Redirect
            const params =
                new URLSearchParams(
                    window.location.search
                );

            setTimeout(() => {

                if (params.get("redirect") === "report") {

                    window.location.href = "report.html";

                } else {

                    window.location.href = "index.html";

                }

            }, 500);

        } catch (error) {

            console.error("Login error:", error);

            if (error.code === "auth/invalid-credential") {

                showMessage(
                    loginMessage,
                    "Incorrect email or password."
                );

            } else if (error.code === "auth/invalid-email") {

                showMessage(
                    loginMessage,
                    "Please enter a valid email address."
                );

            } else if (error.code === "auth/user-not-found") {

                showMessage(
                    loginMessage,
                    "No account found with this email."
                );

            } else {

                showMessage(
                    loginMessage,
                    error.message || "Login failed."
                );

            }

        }

    });

}


// ==========================================
// CREATE ACCOUNT
// ==========================================

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

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


        // -------------------------------
        // VALIDATION
        // -------------------------------

        if (!name) {

            showMessage(
                registerMessage,
                "Please enter your full name."
            );

            registerName.focus();

            return;
        }


        if (!email) {

            showMessage(
                registerMessage,
                "Please enter your email address."
            );

            registerEmail.focus();

            return;
        }


        // 10 digit mobile number
        if (!/^[0-9]{10}$/.test(mobile)) {

            showMessage(
                registerMessage,
                "Mobile number must contain exactly 10 digits."
            );

            registerMobile.focus();

            return;
        }


        if (password.length < 6) {

            showMessage(
                registerMessage,
                "Password must contain at least 6 characters."
            );

            registerPassword.focus();

            return;
        }


        if (password !== confirmPassword) {

            showMessage(
                registerMessage,
                "Passwords do not match."
            );

            registerConfirm.focus();

            return;
        }


        // -------------------------------
        // FIREBASE ACCOUNT CREATION
        // -------------------------------

        try {

            showMessage(
                registerMessage,
                "Creating your account...",
                "success"
            );


            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            // -------------------------------
            // SAVE USER DATA TO FIRESTORE
            // -------------------------------

            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    name: name,
                    email: user.email,
                    mobile: mobile,
                    createdAt: serverTimestamp()
                }
            );


            console.log(
                "Account created:",
                user.email
            );


            showMessage(
                registerMessage,
                "Account created successfully!",
                "success"
            );


            // -------------------------------
            // REDIRECT
            // -------------------------------

            const params =
                new URLSearchParams(
                    window.location.search
                );


            setTimeout(() => {

                if (params.get("redirect") === "report") {

                    window.location.href = "report.html";

                } else {

                    window.location.href = "index.html";

                }

            }, 1000);


        } catch (error) {

            console.error(
                "Account creation error:",
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

            } else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                showMessage(
                    registerMessage,
                    "Email/Password login is not enabled in Firebase."
                );

            } else {

                showMessage(
                    registerMessage,
                    error.message ||
                    "Unable to create account."
                );

            }

        }

    });

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener(
        "click",
        async (event) => {

            event.preventDefault();


            // IMPORTANT:
            // Use signinEmail, not old emailInput

            const email =
                signinEmail.value.trim();


            if (!email) {

                showMessage(
                    loginMessage,
                    "Please enter your email address first."
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
                    "Password reset email sent! Check your inbox.",
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
                        "No account found with this email."
                    );

                } else {

                    showMessage(
                        loginMessage,
                        error.message ||
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
