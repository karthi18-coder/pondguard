import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// ELEMENTS
// ==========================================

const loginCard = document.getElementById("loginCard");
const signupCard = document.getElementById("signupCard");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showSignupBtn = document.getElementById("showSignupBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");
const backToLoginBottom = document.getElementById("backToLoginBottom");

const forgotPasswordBtn =
    document.getElementById("forgotPasswordBtn");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const rememberMe =
    document.getElementById("rememberMe");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupMobile =
    document.getElementById("signupMobile");

const signupPassword =
    document.getElementById("signupPassword");

const signupConfirmPassword =
    document.getElementById("signupConfirmPassword");

const loginMessage =
    document.getElementById("loginMessage");

const signupMessage =
    document.getElementById("signupMessage");

const signupButton =
    document.getElementById("signupButton");


// ==========================================
// MESSAGE FUNCTION
// ==========================================

function showMessage(element, message, type = "") {

    element.textContent = message;

    element.className = "message";

    if (type) {
        element.classList.add(type);
    }
}


// ==========================================
// CLEAR MESSAGES
// ==========================================

function clearMessages() {

    loginMessage.textContent = "";
    signupMessage.textContent = "";

    loginMessage.className = "message";
    signupMessage.className = "message";
}


// ==========================================
// SHOW SIGNUP
// ==========================================

showSignupBtn.addEventListener("click", function () {

    loginCard.classList.add("hidden");
    signupCard.classList.remove("hidden");

    clearMessages();

});


// ==========================================
// BACK TO LOGIN
// ==========================================

function showLogin() {

    signupCard.classList.add("hidden");
    loginCard.classList.remove("hidden");

    clearMessages();
}

backToLoginBtn.addEventListener(
    "click",
    showLogin
);

backToLoginBottom.addEventListener(
    "click",
    showLogin
);


// ==========================================
// MOBILE NUMBER - ONLY 10 DIGITS
// ==========================================

signupMobile.addEventListener("input", function () {

    this.value = this.value
        .replace(/\D/g, "")
        .slice(0, 10);

});


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener("click", function () {

            const target =
                document.getElementById(
                    this.dataset.target
                );

            const icon =
                this.querySelector(
                    ".material-symbols-outlined"
                );

            if (target.type === "password") {

                target.type = "text";

                icon.textContent =
                    "visibility_off";

            } else {

                target.type = "password";

                icon.textContent =
                    "visibility";
            }

        });

    });


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearMessages();

    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    if (!email || !password) {

        showMessage(
            loginMessage,
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    try {

        const persistence =
            rememberMe.checked
                ? browserLocalPersistence
                : browserSessionPersistence;

        await setPersistence(
            auth,
            persistence
        );


        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        showMessage(
            loginMessage,
            "Login successful!",
            "success"
        );


        const params =
            new URLSearchParams(
                window.location.search
            );

        const redirect =
            params.get("redirect");


        setTimeout(function () {

            if (redirect === "report") {

                window.location.href =
                    "report.html";

            } else {

                window.location.href =
                    "index.html";
            }

        }, 700);


    } catch (error) {

        console.error(
            "LOGIN FIREBASE ERROR:",
            error
        );

        showMessage(
            loginMessage,
            error.code ||
            error.message ||
            "Login failed.",
            "error"
        );

    }

});


// ==========================================
// CREATE ACCOUNT
// ==========================================

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearMessages();


    const name =
        signupName.value.trim();

    const email =
        signupEmail.value.trim();

    const mobile =
        signupMobile.value.trim();

    const password =
        signupPassword.value;

    const confirmPassword =
        signupConfirmPassword.value;


    // NAME

    if (name.length < 2) {

        showMessage(
            signupMessage,
            "Please enter your full name.",
            "error"
        );

        return;
    }


    // EMAIL

    if (!email) {

        showMessage(
            signupMessage,
            "Please enter your email address.",
            "error"
        );

        return;
    }


    // MOBILE

    if (!/^[0-9]{10}$/.test(mobile)) {

        showMessage(
            signupMessage,
            "Mobile number must be exactly 10 digits.",
            "error"
        );

        return;
    }


    // PASSWORD

    if (password.length < 6) {

        showMessage(
            signupMessage,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    // CONFIRM PASSWORD

    if (password !== confirmPassword) {

        showMessage(
            signupMessage,
            "Passwords do not match.",
            "error"
        );

        return;
    }


    try {

        signupButton.disabled = true;

        signupButton.textContent =
            "Creating Account...";


        // CREATE FIREBASE AUTH ACCOUNT

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // SAVE USER DETAILS TO FIRESTORE

        await setDoc(
            doc(
                db,
                "users",
                user.uid
            ),
            {
                uid: user.uid,
                name: name,
                email: email,
                mobile: mobile,
                createdAt: serverTimestamp()
            }
        );


        showMessage(
            signupMessage,
            "Account created successfully!",
            "success"
        );


        // REDIRECT

        const params =
            new URLSearchParams(
                window.location.search
            );

        const redirect =
            params.get("redirect");


        setTimeout(function () {

            if (redirect === "report") {

                window.location.href =
                    "report.html";

            } else {

                window.location.href =
                    "index.html";
            }

        }, 1000);


    } catch (error) {

        console.error(
            "🔥 SIGNUP FIREBASE ERROR",
            error
        );

        console.error(
            "Error code:",
            error.code
        );

        console.error(
            "Error message:",
            error.message
        );


        let message =
            error.code ||
            error.message ||
            "Account creation failed.";


        if (
            error.code ===
            "auth/email-already-in-use"
        ) {

            message =
                "This email is already registered.";

        } else if (
            error.code ===
            "auth/invalid-email"
        ) {

            message =
                "Please enter a valid email address.";

        } else if (
            error.code ===
            "auth/weak-password"
        ) {

            message =
                "Password must contain at least 6 characters.";

        } else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            message =
                "Email/Password authentication is not enabled in Firebase.";

        } else if (
            error.code ===
            "auth/unauthorized-domain"
        ) {

            message =
                "This website domain is not authorized in Firebase.";

        } else if (
            error.code ===
            "permission-denied"
        ) {

            message =
                "Firestore permission denied.";

        }


        showMessage(
            signupMessage,
            message,
            "error"
        );


        signupButton.disabled = false;

        signupButton.textContent =
            "Create Account";

    }

});


// ==========================================
// FORGOT PASSWORD
// ==========================================

forgotPasswordBtn.addEventListener(
    "click",
    async function () {

        clearMessages();


        const email =
            loginEmail.value.trim();


        if (!email) {

            showMessage(
                loginMessage,
                "Enter your email address first.",
                "error"
            );

            loginEmail.focus();

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
                "PASSWORD RESET ERROR:",
                error
            );


            let message =
                error.code ||
                error.message ||
                "Unable to send password reset email.";


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            } else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "No account exists with this email.";

            } else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                message =
                    "Email/Password authentication is not enabled.";

            }


            showMessage(
                loginMessage,
                message,
                "error"
            );

        }

    }
);


console.log(
    "PondGuardian Firebase system loaded."
);
