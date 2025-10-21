window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

window.revelar = ScrollReveal({ reset: false });

revelar.reveal(".efeito", {
  duration: 1000,
  distance: "70px",
});