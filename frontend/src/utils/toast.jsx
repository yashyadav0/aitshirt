import toast from "react-hot-toast";

/* =========================
   SUCCESS TOASTS
========================= */

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    style: {
      background: "#18181b",
      color: "#fff",
      border: "1px solid #27272a",
    },
  });
};

/* =========================
   ERROR TOASTS
========================= */

export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    style: {
      background: "#18181b",
      color: "#fff",
      border: "1px solid #27272a",
    },
  });
};

/* =========================
   LOADING TOAST
========================= */

export const showLoading = (message) => {
  return toast.loading(message, {
    style: {
      background: "#18181b",
      color: "#fff",
      border: "1px solid #27272a",
    },
  });
};

/* =========================
   DISMISS TOAST
========================= */

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/* =========================
   CUSTOM PROMISE TOAST
========================= */

export const showPromise = (promise, messages) => {
  toast.promise(promise, {
    loading: messages.loading || "Loading...",
    success: messages.success || "Success!",
    error: messages.error || "Something went wrong!",
  });
};