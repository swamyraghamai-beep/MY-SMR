(() => {
  "use strict";

  const ACCOUNTS_KEY = "my-smr-demo-accounts";
  const PROFILE_KEY = "my-smr-v1";
  const SESSION_KEY = "my-smr-demo-session";
  const currentPage = document.body.dataset.authPage;
  const successDialog = document.querySelector("#auth-success");
  const continueButton = document.querySelector("#success-continue");
  let continueUrl = "index.html";

  function readAccounts() {
    const serialized = localStorage.getItem(ACCOUNTS_KEY);
    if (!serialized) return [];
    const accounts = JSON.parse(serialized);
    if (!Array.isArray(accounts)) throw new Error("Saved demo accounts have an invalid format.");
    return accounts.filter((account) =>
      account && typeof account.email === "string" && typeof account.name === "string"
    );
  }

  function writeProfileName(name) {
    const serialized = localStorage.getItem(PROFILE_KEY);
    const data = serialized ? JSON.parse(serialized) : { records: [] };
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Saved health profile has an invalid format.");
    }
    if (data.records === undefined) data.records = [];
    if (!Array.isArray(data.records)) throw new Error("Saved health records have an invalid format.");
    const existingProfile = data.profile && typeof data.profile === "object" ? data.profile : {};
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
      ...data,
      profile: { ...existingProfile, name }
    }));
  }

  function showError(message) {
    const target = document.querySelector(currentPage === "register" ? "#register-error" : "#login-error");
    target.textContent = message;
  }

  function showSuccess(title, message, nextUrl, autoContinue = false) {
    document.querySelector("#success-title").textContent = title;
    document.querySelector("#success-message").textContent = message;
    continueUrl = nextUrl;
    successDialog.showModal();
    if (autoContinue) {
      window.setTimeout(() => window.location.assign(continueUrl), 1500);
    }
  }

  document.querySelector("#register-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#register-name").value.trim();
    const email = document.querySelector("#register-email").value.trim().toLowerCase();
    const password = document.querySelector("#register-password").value;
    const confirmPassword = document.querySelector("#register-confirm").value;
    const consent = document.querySelector("#register-consent").checked;

    document.querySelector("#register-error").textContent = "";
    if (!event.currentTarget.reportValidity()) return;
    if (password !== confirmPassword) {
      showError("The passwords do not match.");
      return;
    }
    if (!consent) {
      showError("Please confirm that you understand this demo's limitations.");
      return;
    }

    try {
      const accounts = readAccounts();
      if (accounts.some((account) => account.email === email)) {
        showError("An account with this email already exists on this device. Please sign in instead.");
        return;
      }
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, { name, email }]));
      writeProfileName(name);
      showSuccess(
        "Registration successful!",
        "Your demo profile has been created on this device. Your password was not saved. You can now sign in.",
        `login.html?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error("Unable to create local demo profile.", error);
      showError("Could not save your demo profile in this browser. Check available storage and try again.");
    }
  });

  document.querySelector("#login-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#login-email").value.trim().toLowerCase();
    const password = document.querySelector("#login-password").value;
    document.querySelector("#login-error").textContent = "";
    if (!event.currentTarget.reportValidity()) return;

    try {
      const account = readAccounts().find((item) => item.email === email);
      if (!account) {
        showError("No demo profile was found for this email on this device. Create an account first.");
        return;
      }
      writeProfileName(account.name);
      sessionStorage.setItem(SESSION_KEY, "1");
      showSuccess(
        "Login successful!",
        "Welcome back. This is a demo sign-in only; your password was not checked by a server.",
        "index.html",
        true
      );
    } catch (error) {
      console.error("Unable to sign in to local demo profile.", error);
      showError("Could not read your demo profile in this browser. Please try again.");
    }
  });

  continueButton.addEventListener("click", () => {
    window.location.assign(continueUrl);
  });

  const emailFromUrl = new URLSearchParams(window.location.search).get("email");
  const loginEmail = document.querySelector("#login-email");
  if (loginEmail && emailFromUrl) loginEmail.value = emailFromUrl;
})();
