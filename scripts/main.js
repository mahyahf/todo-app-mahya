const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// Charger les tâches depuis le localStorage
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task";

    li.innerHTML = `
      <span>${task}</span>
      <button class="delete-btn" data-index="${index}">✕</button>
    `;

    taskList.appendChild(li);
  });
}

// Ajouter une tâche
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (text === "") return;

  tasks.push(text);
  saveTasks();
  renderTasks();
  input.value = "";
});

// Supprimer une tâche
taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const index = event.target.getAttribute("data-index");
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
});

// Afficher les tâches au chargement
renderTasks();
