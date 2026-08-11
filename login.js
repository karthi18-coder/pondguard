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

const loginCard =
    document.getElementById("loginCard");

const signupCard =
    document.getElementById("signupCard");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const showSignupBtn =
    document.getElementById("showSignupBtn");

const backToLoginBtn =
    document.getElementById("backToLoginBtn");

const backToLoginBottom =
    document.getElementById("backToLoginBottom");

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
// MESSAGE
// ==========================================

function showMessage(element, text, type) {

    element.textContent = text;

    element.className = "message";

    if (type) {
        element.classList.add(type);
    }
}


// ==========================================
// SHOW SIGNUP
// ==========================================

showSignupBtn.addEventListener("click", () => {

    loginCard.classList.add("hidden");

    signupCard.classList.remove("hidden");

    clearMessages();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ==========================================
// BACK TO LOGIN
// ==========================================

function showLogin() {

    signupCard.classList.add("hidden");

    loginCard.classList.remove("hidden");

    clearMessages();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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
// CLEAR MESSAGES
// ==========================================

function clearMessages() {

    loginMessage.textContent = "";

    signupMessage.textContent = "";

    loginMessage.className = "message";

    signupMessage.className = "message";
}


// ==========================================
// MOBILE NUMBER
// ==========================================

signupMobile.addEventListener(
    "input",
    () => {

        signupMobile.value =
            signupMobile.value
                .replace(/\D/g, "")
                .slice(0, 10);

    }
);


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

document
    .querySelectorAll(".password-toggle")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    document.getElementById(
                        button.dataset.target
                    );

                const icon =
                    button.querySelector(
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

            }
        );

    });


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

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
                "Login successful. Redirecting...",
                "success"
            );


            const params =
                new URLSearchParams(
                    window.location.search
                );

            const redirect =
                params.get("redirect");


            setTimeout(() => {

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
                "Login error:",
                error
            );


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                showMessage(
                    loginMessage,
                    "Incorrect email or password.",
                    "error"
                );

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                showMessage(
                    loginMessage,
                    "Please enter a valid email address.",
                    "error"
                );

            } else {

                showMessage(
                    loginMessage,
                    "Login failed. Please try again.",
                    "error"
                );
            }

        }

    }
);


// ==========================================
// SIGNUP
// ==========================================

signupForm.addEventListener(
    "submit",
    async (event) => {

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


        // Name

        if (name.length < 2) {

            showMessage(
                signupMessage,
                "Please enter your full name.",
                "error"
            );

            signupName.focus();

            return;
        }


        // Email

        if (!email) {

            showMessage(
                signupMessage,
                "Please enter your email address.",
                "error"
            );

            signupEmail.focus();

            return;
        }


        // Mobile

        if (!/^[0-9]{10}$/.test(mobile)) {

            showMessage(
                signupMessage,
                "Mobile number must contain exactly 10 digits.",
                "error"
            );

            signupMobile.focus();

            return;
        }


        // Password

        if (password.length < 6) {

            showMessage(
                signupMessage,
                "Password must contain at least 6 characters.",
                "error"
            );

            signupPassword.focus();

            return;
        }


        // Confirm password

        if (password !== confirmPassword) {

            showMessage(
                signupMessage,
                "Passwords do not match.",
                "error"
            );

            signupConfirmPassword.focus();

            return;
        }


        try {

            signupButton.disabled = true;

            signupButton.textContent =
                "Creating Account...";


            // Create Firebase account

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                credential.user;


            // Save user profile

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


            const params =
                new URLSearchParams(
                    window.location.search
                );

            const redirect =
                params.get("redirect");


            setTimeout(() => {

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
                "Signup error:",
                error
            );


            if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                showMessage(
                    signupMessage,
                    "This email is already registered. Please login.",
                    "error"
                );

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                showMessage(
                    signupMessage,
                    "Please enter a valid email address.",
                    "error"
                );

            } else if (
                error.code ===
                "auth/weak-password"
            ) {

                showMessage(
                    signupMessage,
                    "Password must contain at least 6 characters.",
                    "error"
                );

            } else {

                showMessage(
                    signupMessage,
                    "Account creation failed. Please try again.",
                    "error"
                );

            }


            signupButton.disabled = false;

            signupButton.textContent =
                "Create Account";

        }

    }
);


// ==========================================
// FORGOT PASSWORD
// ==========================================

forgotPasswordBtn.addEventListener(
    "click",
    async () => {

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
                "Password reset error:",
                error
            );


            if (
                error.code ===
                "auth/invalid-email"
            ) {

                showMessage(
                    loginMessage,
                    "Please enter a valid email address.",
                    "error"
                );

            } else if (
                error.code ===
                "auth/user-not-found"
            ) {

                showMessage(
                    loginMessage,
                    "No account found with this email.",
                    "error"
                );

            } else {

                showMessage(
                    loginMessage,
                    "Unable to send password reset email.",
                    "error"
                );
            }

        }

    }
);


console.log(
    "PondGuardian Firebase login system loaded successfully."
);
