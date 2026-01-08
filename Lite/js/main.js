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
//copied lol
const coords = { x: 0, y: 0 };
const circles = document.querySelectorAll(".cir");

const colors = [
  "#841391",
  "#841391",
  "#841391",
  "#AC0EA0",
  "#C90AAB",
  "#E008B3",
  "#F705BB",
  "#F705E3",
  "#F705CB",
  "#F705BB",
  "#F705BB",
  "#F9228C",
  "#FA366C",
  "#FA3466",
  "#FB3260",
  "#FB2F56",
  "#FB2C4C",
  "#FC2841",
  "#FC2537",
  "#FC222E",
  "#FD1D1D"
];

circles.forEach(function (circle, index) {
  circle.x = 0;
  circle.y = 0;
  circle.style.backgroundColor = colors[colors.length - index % colors.length];
});

window.addEventListener("mousemove", function(e){
  coords.x = e.clientX;
  coords.y = e.clientY;
  
});

function animateCircles() {
  
  let x = coords.x;
  let y = coords.y;
  
  circles.forEach(function (circle, index) {
    circle.style.left = x - 12 + "px";
    circle.style.top = y - 12 + "px";
    
    circle.style.scale = (circles.length - index) / circles.length;
    
    circle.x = x;
    circle.y = y;

    const nextCircle = circles[index + 1] || circles[0];
    x += (nextCircle.x - x) * 0.3;
    y += (nextCircle.y - y) * 0.3;
  });
 
  requestAnimationFrame(animateCircles);
}

animateCircles();
