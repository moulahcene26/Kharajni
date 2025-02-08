const toggle = document.getElementById("toggleSwitch");
const toggleText = document.getElementById("toggleText");
const section1 = document.getElementById("section1");
const section2 = document.getElementById("section2");

toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");

    if (toggle.classList.contains("active")) {
        toggleText.textContent = "Reviews";
        section1.style.display = "block"; 
        section2.style.display = "none";  
    } else {
        toggleText.textContent = "Blogs";
        section1.style.display = "none";  
        section2.style.display = "block"; 
    }
});


window.addEventListener("DOMContentLoaded", () => {
    section1.style.display = "none"; 
    section2.style.display = "block";  
});
