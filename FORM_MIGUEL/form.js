const selectBox = document.getElementById("select-box");
const customSelect = document.getElementById("custom-select");
const options = document.getElementById("options");
const selectedContainer = document.getElementById("selected-hobbies");
const checkboxes = options.querySelectorAll("input[type='checkbox']");

let selectedHobbies = [];

selectBox.addEventListener("click", () => {
  customSelect.classList.toggle("open");
  selectBox.classList.toggle("active");
});

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const hobby = checkbox.value;

    if (checkbox.checked) {
      if (selectedHobbies.length >= 7) {
        alert("Você pode selecionar no máximo 7 hobbies!");
        checkbox.checked = false;
        return;
      }
      selectedHobbies.push(hobby);
    } else {
      selectedHobbies = selectedHobbies.filter((h) => h !== hobby);
    }

    updateSelected();
  });
});

function updateSelected() {
  selectedContainer.innerHTML = "";
  if (selectedHobbies.length === 0) {
    selectBox.textContent = "Selecione...";
  } else {
    selectBox.textContent = `${selectedHobbies.length} selecionado(s)`;
  }

  selectedHobbies.forEach((hobby) => {
    const tag = document.createElement("div");
    tag.classList.add("hobby-tag");
    tag.innerHTML = `${hobby} <button onclick="removeHobby('${hobby}')">×</button>`;
    selectedContainer.appendChild(tag);
  });
}

function removeHobby(hobby) {
  selectedHobbies = selectedHobbies.filter((h) => h !== hobby);
  const checkbox = [...checkboxes].find((c) => c.value === hobby);
  if (checkbox) checkbox.checked = false;
  updateSelected();
}

document.addEventListener("click", (e) => {
  if (!customSelect.contains(e.target)) {
    customSelect.classList.remove("open");
    selectBox.classList.remove("active");
  }
});
