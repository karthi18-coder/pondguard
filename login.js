/* =====================================================
   PONDGUARDIAN LOGIN JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================================
       ELEMENTS
    ================================================ */

    const loginPanel =
        document.querySelector(".login-panel");

    const registerPanel =
        document.querySelector(".register-panel");

    const showRegister =
        document.getElementById("show-register");

    const showLogin =
        document.getElementById("show-login");

    const loginForm =
        document.getElementById("signin-form");

    const registerForm =
        document.getElementById("register-form");

    const forgotPassword =
        document.getElementById("forgot-password");


    /* ================================================
       SWITCH LOGIN / REGISTER
    ================================================ */

    function showRegisterPanel() {

        loginPanel.classList.remove("active");

        setTimeout(() => {
            registerPanel.classList.add("active");
        }, 80);
    }


    function showLoginPanel() {

        registerPanel.classList.remove("active");

        setTimeout(() => {
            loginPanel.classList.add("active");
        }, 80);
    }


    showRegister.addEventListener(
        "click",
        showRegisterPanel
    );


    showLogin.addEventListener(
        "click",
        showLoginPanel
    );


    /* ================================================
       PASSWORD VISIBILITY
    ================================================ */

    const passwordButtons =
        document.querySelectorAll(".password-toggle");


    passwordButtons.forEach(button => {

        button.addEventListener("click", () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            const icon =
                button.querySelector(
                    ".material-symbols-outlined"
                );


            if (input.type === "password") {

                input.type = "text";

                icon.textContent = "visibility_off";

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                input.type = "password";

                icon.textContent = "visibility";

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );
            }

        });

    });


    /* ================================================
       VALIDATION HELPERS
    ================================================ */

    function validEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    function validMobile(mobile) {

        return /^[6-9][0-9]{9}$/
            .test(mobile);

    }


    function showMessage(
        element,
        message,
        type
    ) {

        element.textContent = message;

        element.className =
            "message " + type;

    }


    function clearMessage(element) {

        element.textContent = "";

        element.className = "message";

    }


    /* ================================================
       LOADING BUTTON
    ================================================ */

    function setLoading(
        button,
        loading,
        originalText
    ) {

        if (loading) {

            button.disabled = true;

            button.classList.add("loading");

            button.innerHTML = `
                <span>Processing...</span>
                <span class="material-symbols-outlined">
                    progress_activity
                </span>
            `;

        } else {

            button.disabled = false;

            button.classList.remove("loading");

            button.innerHTML = `
                <span>${originalText}</span>
                <span class="material-symbols-outlined">
                    arrow_forward
                </span>
            `;

        }

    }


    /* ================================================
       LOGIN
    ================================================ */

    loginForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const email =
                document
                    .getElementById("signin-email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("signin-password")
                    .value;


            const message =
                document.getElementById(
                    "login-message"
                );

            const button =
                document.getElementById(
                    "login-button"
                );


            clearMessage(message);


            /* Empty fields */

            if (!email || !password) {

                showMessage(
                    message,
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            /* Email validation */

            if (!validEmail(email)) {

                showMessage(
                    message,
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            /* Password validation */

            if (password.length < 6) {

                showMessage(
                    message,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            /* Loading */

            setLoading(
                button,
                true,
                "Login"
            );


            /*
             * TEMPORARY CLIENT-SIDE LOGIN
             *
             * Your current project does not yet connect
             * this form to Supabase authentication.
             *
             * When Supabase Auth is connected, replace
             * this section with the real authentication call.
             */

            setTimeout(() => {

                showMessage(
                    message,
                    "Login successful. Opening your dashboard...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "user-dashboard.html";

                }, 700);

            }, 900);

        }
    );


    /* ================================================
       REGISTER
    ================================================ */

    registerForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                document
                    .getElementById("register-name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("register-email")
                    .value
                    .trim();

            const mobile =
                document
                    .getElementById("register-mobile")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("register-password")
                    .value;

            const confirm =
                document
                    .getElementById("register-confirm")
                    .value;


            const message =
                document.getElementById(
                    "register-message"
                );

            const button =
                document.getElementById(
                    "register-button"
                );


            clearMessage(message);


            /* Empty fields */

            if (
                !name ||
                !email ||
                !mobile ||
                !password ||
                !confirm
            ) {

                showMessage(
                    message,
                    "Please complete all fields.",
                    "error"
                );

                return;
            }


            /* Name validation */

            if (name.length < 2) {

                showMessage(
                    message,
                    "Please enter your full name.",
                    "error"
                );

                return;
            }


            /* Email */

            if (!validEmail(email)) {

                showMessage(
                    message,
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            /* Mobile */

            if (!validMobile(mobile)) {

                showMessage(
                    message,
                    "Enter a valid 10-digit Indian mobile number.",
                    "error"
                );

                return;
            }


            /* Password */

            if (password.length < 6) {

                showMessage(
                    message,
                    "Password must contain at least 6 characters.",
                    "error"
                );

                return;
            }


            /* Confirm */

            if (password !== confirm) {

                showMessage(
                    message,
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            /* Loading */

            setLoading(
                button,
                true,
                "Create Account"
            );


            /*
             * TEMPORARY CLIENT-SIDE REGISTER
             *
             * Supabase authentication should be connected
             * here later.
             */

            setTimeout(() => {

                showMessage(
                    message,
                    "Account details validated successfully.",
                    "success"
                );


                setTimeout(() => {

                    showLoginPanel();

                    registerForm.reset();

                    const loginEmail =
                        document.getElementById(
                            "signin-email"
                        );

                    loginEmail.value = email;

                    setLoading(
                        button,
                        false,
                        "Create Account"
                    );

                }, 900);

            }, 900);

        }
    );


    /* ================================================
       MOBILE NUMBER - ONLY NUMBERS
    ================================================ */

    const mobileInput =
        document.getElementById(
            "register-mobile"
        );


    mobileInput.addEventListener(
        "input",
        () => {

            mobileInput.value =
                mobileInput.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

        }
    );


    /* ================================================
       FORGOT PASSWORD
    ================================================ */

    forgotPassword.addEventListener(
        "click",
        () => {

            const email =
                document
                    .getElementById("signin-email")
                    .value
                    .trim();


            if (!email) {

                showMessage(
                    document.getElementById(
                        "login-message"
                    ),
                    "Enter your email address first, then use Forgot Password.",
                    "error"
                );

                document
                    .getElementById("signin-email")
                    .focus();

                return;
            }


            if (!validEmail(email)) {

                showMessage(
                    document.getElementById(
                        "login-message"
                    ),
                    "Please enter a valid email address.",
                    "error"
                );

                return;
            }


            showMessage(
                document.getElementById(
                    "login-message"
                ),
                "Password reset will be available when authentication is connected.",
                "success"
            );

        }
    );

});
