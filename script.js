const formConfig = {
  action: "https://docs.google.com/forms/d/e/1FAIpQLScjbZvXmiT4dh-atHVWQtiNalWJG3wkpTJNRn7NocE6XRuikg/formResponse",
  fields: {
    name: "entry.2005620554",
    email: "entry.1045781291",
  },
};

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    }
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const form = document.getElementById("signup-form");
const message = document.getElementById("form-message");

if (form && message) {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");

  if (formConfig.action) {
    form.action = formConfig.action;
    form.method = "POST";
    form.target = "_blank";
    nameInput.name = formConfig.fields.name;
    emailInput.name = formConfig.fields.email;
    message.textContent = "Form is ready. Submissions open in a new tab.";
    message.classList.add("is-ready");
  } else {
    message.textContent = "Add your Google Form action URL and field IDs in script.js.";
    message.classList.add("is-pending");
  }

  form.addEventListener("submit", (event) => {
    if (!formConfig.action) {
      event.preventDefault();
      message.textContent = "Google Form not connected yet. Paste the real link in script.js.";
      message.classList.add("is-pending");
      return;
    }

    message.textContent = "Opening Google Form submission...";
    message.classList.remove("is-pending");
    message.classList.add("is-ready");
  });
}
