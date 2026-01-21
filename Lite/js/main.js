const mode = document.getElementById("modetoggle");
const setTheme = (theme) => {
  document.documentElement.classList.remove("dark", "light");
  document.documentElement.classList.add(theme);
  localStorage.setItem("theme", theme);
  if (mode) {
    mode.src = theme === "dark" ? "images/brightness.png" : "images/night.png";
  }
};
document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);
  if (mode) {
    mode.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "light" : "dark");
    });
  }
});
function highlightActiveNav() {
  const links = document.querySelectorAll("nav a");
  links.forEach(link => {
    if (link.href === window.location.href) {
      link.style.color = "#e10600";
    }
  });
}
const logo = document.getElementById("brand");
if (logo) {
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => {
        window.location.href = "home.html";
    });
}