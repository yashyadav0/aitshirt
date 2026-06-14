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
  }

  function getRecaptchaVerifier() {

    if (recaptchaRef.current) {
      return recaptchaRef.current;
    }

    const container =
      document.getElementById(
        "recaptcha-container"
      );

    if (!container) {
      throw new Error(
        "reCAPTCHA container is missing from the login page."
      );
    }

    recaptchaRef.current =
      new RecaptchaVerifier(
        auth,
        container,
        {
          size: "invisible",
          callback: () => {
            console.info(
              "Firebase reCAPTCHA solved"
            );
          },
          "expired-callback": () => {
            console.warn(
              "Firebase reCAPTCHA expired"
            );

            if (recaptchaRef.current) {
              recaptchaRef.current.clear();
              recaptchaRef.current = null;
            }
          }
        }
      );

    return recaptchaRef.current;
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

      const verifier =
        getRecaptchaVerifier();

      await verifier.render();

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

      const credential =
        await confirmation.confirm(
          otp.trim()
        );

      const idToken =
        await credential.user.getIdToken();

      setFirebaseIdToken(
        idToken
      );

      await signOut(
        auth
      );

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
