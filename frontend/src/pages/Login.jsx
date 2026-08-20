import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from "firebase/auth";

import API from "../api";

import {
  useAuth
} from "../auth/AuthContext";

import {
  auth,
  logFirebaseClientDiagnostics
} from "../firebase";

import {
  showError,
  showSuccess
} from "../utils/toast";

const OTP_TTL_SECONDS =
  300;

function normalizePhone(value) {

  const trimmed =
    value.trim();

  if (trimmed.startsWith("+")) {
    return trimmed.replace(
      /\s/g,
      ""
    );
  }

  const digits =
    trimmed.replace(
      /\D/g,
      ""
    );

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return digits
    ? `+${digits}`
    : "";
}

function logFirebaseError(label, error) {

  console.error(
    label,
    {
      code: error.code,
      message: error.message,
      customData: error.customData,
      serverResponse: error.serverResponse,
      name: error.name
    }
  );
}

function firebaseErrorMessage(error) {

  const messages = {
    "auth/billing-not-enabled":
      "Firebase SMS billing is not enabled. Enable billing on the Firebase/Google Cloud project to send real OTP messages.",
    "auth/invalid-app-credential":
      "Firebase rejected the app credential. Check Authorized Domains, authDomain, and reCAPTCHA settings.",
    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Refresh and try again.",
    "auth/invalid-phone-number":
      "Enter a valid phone number with country code.",
    "auth/missing-phone-number":
      "Enter your phone number.",
    "auth/quota-exceeded":
      "SMS quota exceeded. Try again later or check Firebase billing/quota.",
    "auth/too-many-requests":
      "Too many OTP attempts. Please wait before trying again.",
    "auth/code-expired":
      "OTP expired. Request a new code.",
    "auth/invalid-verification-code":
      "Invalid OTP. Check the code and try again."
  };

  return messages[error.code] ||
    error.message ||
    "Firebase phone verification failed.";
}

export default function Login() {

  const navigate =
    useNavigate();

  // Capture unhandled "next is not a function" to trace its origin
  useEffect(() => {
    const handler = (e) => {
      const msg = e.reason?.message || e.message || "";
      if (typeof msg === 'string' && msg.includes("next is not a function")) {
        console.error("🔴 UNHANDLED 'next is not a function':", e.reason || e);
        console.trace("Stack:");
      }
    };
    window.addEventListener("unhandledrejection", handler);
    window.addEventListener("error", handler);
    return () => {
      window.removeEventListener("unhandledrejection", handler);
      window.removeEventListener("error", handler);
    };
  }, []);

  const location =
    useLocation();

  const {
    saveSession
  } =
    useAuth();

  const recaptchaRef =
    useRef(null);

  const [step,
    setStep] =
    useState("phone");

  const [phone,
    setPhone] =
    useState("");

  const [verifiedPhone,
    setVerifiedPhone] =
    useState("");

  const [firebaseIdToken,
    setFirebaseIdToken] =
    useState("");

  const [otp,
    setOtp] =
    useState("");

  const [confirmation,
    setConfirmation] =
    useState(null);

  const [otpExpiresAt,
    setOtpExpiresAt] =
    useState(null);

  const [secondsLeft,
    setSecondsLeft] =
    useState(0);

  const [name,
    setName] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const redirectTo =
    location.state?.from?.pathname ||
    "/workspace";

  useEffect(() => {

    logFirebaseClientDiagnostics();

    return () => {

      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };

  }, []);

  useEffect(() => {

    if (!otpExpiresAt) {
      setSecondsLeft(0);
      return undefined;
    }

    const updateTimer =
      () => {
        setSecondsLeft(
          Math.max(
            0,
            Math.ceil(
              (otpExpiresAt - Date.now()) / 1000
            )
          )
        );
      };

    updateTimer();

    const timer =
      window.setInterval(
        updateTimer,
        1000
      );

    return () =>
      window.clearInterval(
        timer
      );

  }, [otpExpiresAt]);

  function resetToPhone() {

    setStep("phone");
    setOtp("");
    setVerifiedPhone("");
    setFirebaseIdToken("");
    setConfirmation(null);
    setOtpExpiresAt(null);
    setName("");
    // Clear stale verifier on number change
    if (recaptchaRef.current) {
      try { recaptchaRef.current.clear(); } catch (e) {}
      recaptchaRef.current = null;
    }
  }

  function getRecaptchaVerifier() {
    const container = document.getElementById("recaptcha-container");

    if (!container) {
      throw new Error("reCAPTCHA container is missing from the login page.");
    }

    // Use VISIBLE reCAPTCHA — invisible mode has a known Firebase 12.x bug
    // where internal promise chains throw "next is not a function"
    const verifier = new RecaptchaVerifier(
      auth,
      container,
      {
        size: "normal",
        theme: "dark",
        callback: (token) => {
          console.info("Firebase reCAPTCHA solved", token ? "token received" : "no token");
        },
        "expired-callback": () => {
          console.warn("Firebase reCAPTCHA expired");
        }
      }
    );

    recaptchaRef.current = verifier;
    return verifier;
  }

  function finishAuth(res) {

    saveSession(
      res.data.token,
      res.data.user
    );

    showSuccess(
      "Welcome to AIWear"
    );

    navigate(
      redirectTo,
      {
        replace: true
      }
    );
  }

  async function sendOtp(event) {

    event?.preventDefault();

    try {

      const normalizedPhone =
        normalizePhone(
          phone
        );

      if (normalizedPhone.length < 11) {
        return showError(
          "Enter a valid phone number"
        );
      }

      setLoading(true);
      setOtp("");
      setFirebaseIdToken("");

      // Clear any prior verifier so a fresh one is created for this attempt.
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.clear();
        } catch (e) {
          // ignore cleanup errors
        }
        recaptchaRef.current = null;
      }

      let verifier = getRecaptchaVerifier();

      // Ensure the container is in DOM and visible enough for reCAPTCHA
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        throw new Error("reCAPTCHA container not found in DOM");
      }

      // Render with retry on "next is not a function" bug
      try {
        await verifier.render();
      } catch (err) {
        if (err.message && err.message.includes("next is not a function")) {
          console.error("🔴 verifier.render() failed with 'next is not a function', creating fresh verifier:", err);
          if (recaptchaRef.current) {
            try { recaptchaRef.current.clear(); } catch (e) {}
            recaptchaRef.current = null;
          }
          verifier = getRecaptchaVerifier();
          await verifier.render();
        } else {
          throw err;
        }
      }

      const result =
        await signInWithPhoneNumber(
          auth,
          normalizedPhone,
          verifier
        );

      setConfirmation(
        result
      );

      setVerifiedPhone(
        normalizedPhone
      );

      setOtpExpiresAt(
        Date.now() +
        OTP_TTL_SECONDS * 1000
      );

      setStep("otp");

      showSuccess(
        "OTP sent"
      );

    } catch (error) {

      logFirebaseError(
        "Firebase OTP send failed",
        error
      );

      showError(
        firebaseErrorMessage(
          error
        )
      );

      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }

    } finally {

      setLoading(false);
    }
  }

  async function resendOtp() {

    if (secondsLeft > 240) {
      return showError(
        "Please wait before requesting another OTP"
      );
    }

    await sendOtp();
  }

  async function verifyOtp(event) {

    event.preventDefault();

    try {

      if (!confirmation) {
        return showError(
          "Request OTP again"
        );
      }

      if (!otpExpiresAt || Date.now() > otpExpiresAt) {
        setConfirmation(null);
        return showError(
          "OTP expired. Request a new code."
        );
      }

      setLoading(true);

      let credential = null;
      let idToken = null;

      try {
        // Primary: Try Firebase's confirm with defensive error handling
        credential = await confirmation.confirm(otp.trim());
        idToken = await credential.user.getIdToken();
      } catch (confirmError) {
        // Handle the "next is not a function" TypeError and other Firebase internal errors
        logFirebaseError("Firebase confirm() crashed, attempting fallback", confirmError);

        const isNextFunctionError = confirmError instanceof TypeError &&
          confirmError.message.includes('next is not a function');
        const isInternalError = confirmError.code && confirmError.code.includes('internal-error');
        const isCaptchaError = confirmError.code && confirmError.code.includes('captcha');

        if (isNextFunctionError || isInternalError || isCaptchaError) {
          // Fallback 1: Try re-creating the confirmation with a fresh visible reCAPTCHA verifier
          try {
            console.info("Attempting fallback: re-create RecaptchaVerifier and re-send OTP");

            // Clear the old verifier to force a fresh one
            if (recaptchaRef.current) {
              try { recaptchaRef.current.clear(); } catch (e) {}
              recaptchaRef.current = null;
            }

            // Create a new visible verifier
            const container = document.getElementById("recaptcha-container");
            if (container) {
              const newVerifier = new RecaptchaVerifier(auth, container, {
                size: "normal",  // Use visible reCAPTCHA instead of invisible
                theme: "dark",
                callback: () => console.info("Firebase reCAPTCHA solved (fallback)"),
                "expired-callback": () => {
                  console.warn("Firebase reCAPTCHA expired (fallback)");
                }
              });
              recaptchaRef.current = newVerifier;
              await newVerifier.render();

              // Re-send OTP with new verifier
              const result = await signInWithPhoneNumber(auth, verifiedPhone, newVerifier);
              setConfirmation(result);
              setOtpExpiresAt(Date.now() + OTP_TTL_SECONDS * 1000);

              // Try confirm again with fresh confirmation
              credential = await result.confirm(otp.trim());
              idToken = await credential.user.getIdToken();

              showSuccess("OTP re-sent and verified");
            } else {
              throw new Error("reCAPTCHA container not found for fallback");
            }
          } catch (fallbackError) {
            logFirebaseError("Fallback reCAPTCHA verification also failed", fallbackError);

            // Fallback 2: Skip Firebase entirely and use backend-only verification
            try {
              console.info("Attempting backend-only OTP verification fallback");
              const backendRes = await API.post("/auth/verify-otp-backend", {
                phone: verifiedPhone,
                otp: otp.trim()
              });

              if (backendRes.data.success && backendRes.data.token) {
                // Backend verified the OTP and returned a session token
                setFirebaseIdToken(backendRes.data.firebaseIdToken || "backend-verified");
                idToken = backendRes.data.firebaseIdToken || "backend-verified";
                credential = { user: { getIdToken: () => Promise.resolve(idToken) } };
              } else {
                throw new Error(backendRes.data.error || "Backend OTP verification failed");
              }
            } catch (backendError) {
              logFirebaseError("Backend OTP verification fallback failed", backendError);
              throw backendError;
            }
          }
        } else {
          // Some other error - re-throw to be caught by outer catch
          throw confirmError;
        }
      }

      if (!credential || !idToken) {
        return showError("Unable to verify OTP. Please try again or contact support.");
      }

      setFirebaseIdToken(idToken);

      // Sign out after getting the token to avoid auth state conflicts
      await signOut(auth).catch(() => {
        // Ignore signOut errors - token already obtained
      });

      const status =
        await API.post(
          "/auth/check-phone",
          {
            phone: verifiedPhone
          }
        );

      if (status.data.exists) {
        const res =
          await API.post(
            "/auth/otp-login",
            {
              phone: verifiedPhone,
              firebaseIdToken: idToken
            }
          );

        finishAuth(
          res
        );

        return;
      }

      setStep("account");

      showSuccess(
        "Phone verified"
      );

    } catch (error) {

      logFirebaseError(
        "Firebase OTP verification failed",
        error
      );

      showError(
        error.response?.data?.error ||
        firebaseErrorMessage(
          error
        )
      );

    } finally {

      setLoading(false);
    }
  }

  async function submitAccount(event) {

    event.preventDefault();

    try {

      if (!name.trim()) {
        return showError(
          "Enter your name"
        );
      }

      if (!firebaseIdToken) {
        return showError(
          "Phone verification expired. Request OTP again."
        );
      }

      setLoading(true);

      const res =
        await API.post(
          "/auth/register",
          {
            phone: verifiedPhone,
            name: name.trim(),
            firebaseIdToken
          }
        );

      finishAuth(
        res
      );

    } catch (error) {

      console.error(
        "OTP registration failed",
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        }
      );

      showError(
        error.response?.data?.error ||
        error.message ||
        "Registration failed"
      );

    } finally {

      setLoading(false);
    }
  }

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 py-10 text-white">

      <section className="w-full max-w-md rounded-[28px] border border-[#2f2f2f] bg-[#171717]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur md:p-7">

        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-medium text-cyan-300">
            AI creative studio
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            AIWear
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Login with phone OTP. New users add their name after verification.
          </p>
        </div>

        {
          step === "phone" && (
            <form
              onSubmit={sendOtp}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Phone Number
                </span>

                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
                  className="min-h-12 w-full rounded-2xl border border-[#333] bg-[#0f0f0f] px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/70"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="min-h-12 w-full rounded-2xl bg-cyan-400 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )
        }

        {
          step === "otp" && (
            <form
              onSubmit={verifyOtp}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Enter OTP
                </span>

                <input
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                    )
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="6-digit code"
                  className="min-h-12 w-full rounded-2xl border border-[#333] bg-[#0f0f0f] px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/70"
                />
              </label>

              <p className="text-xs text-zinc-500">
                {
                  secondsLeft > 0
                    ? `OTP expires in ${secondsLeft}s`
                    : "OTP expired"
                }
              </p>

              <button
                type="submit"
                disabled={loading || secondsLeft === 0}
                className="min-h-12 w-full rounded-2xl bg-cyan-400 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={resendOtp}
                disabled={loading || secondsLeft > 240}
                className="min-h-12 w-full rounded-2xl border border-[#333] text-sm text-zinc-300 transition hover:bg-[#202020] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend OTP
              </button>

              <button
                type="button"
                onClick={resetToPhone}
                className="min-h-12 w-full rounded-2xl border border-[#333] text-sm text-zinc-300 transition hover:bg-[#202020] hover:text-white"
              >
                Change Number
              </button>
            </form>
          )
        }

        {
          step === "account" && (
            <form
              onSubmit={submitAccount}
              className="space-y-4"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-300">
                  Name
                </span>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  autoComplete="name"
                  placeholder="Your name"
                  className="min-h-12 w-full rounded-2xl border border-[#333] bg-[#0f0f0f] px-4 text-sm outline-none transition placeholder:text-zinc-600 focus:border-cyan-500/70"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="min-h-12 w-full rounded-2xl bg-cyan-400 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Save Name & Continue"}
              </button>
            </form>
          )
        }

        <div id="recaptcha-container" />

      </section>

    </main>
  );
}
