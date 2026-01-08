const password = document.getElementById("password");
const toggle = document.getElementById("toggle");
const login = document.getElementById("login");
toggle.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";
    toggle.src = "images/hide.png";
    toggle.alt = "Hide password";
  } else {
    password.type = "password";
    toggle.src = "images/show.png";
    toggle.alt = "Show password";
  }
});
login.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    console.log(email,pass);
});
