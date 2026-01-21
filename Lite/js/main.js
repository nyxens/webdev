document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();
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