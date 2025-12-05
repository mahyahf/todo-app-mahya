const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskCategorySelect = document.getElementById("taskCategory");
const filterCategorySelect = document.getElementById("filterCategory");
const taskList = document.getElementById("taskList");

const totalCountSpan = document.getElementById("totalCount");
const doneCountSpan = document.getElementById("doneCount");
const remainingCountSpan = document.getElementById("remainingCount");

const clearAllBtn = document.getElementById("clearAllBtn");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

const STORAGE_KEY_TASKS = "todo_tasks_v2";
const STORAGE_KEY_THEME = "todo_theme";

let tasks = [];

/* ---------- THEME (DARK / LIGHT) ---------- */
function applyTheme(theme) {
  if (theme === "dark") {
    body.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    body.classList.remove("dark");
    themeToggle.textContent = "🌙";
  }
}

const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "light";
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const newTheme = body.classList.contains("dark") ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY_THEME, newTheme);
  applyTheme(newTheme);
});

/* ---------- TASK MODEL & STORAGE ---------- */
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY_TASKS);
  if (!raw) {
    tasks = [];
    return;
  }
  try {
    tasks = JSON.parse(raw);
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
}

/* ---------- RENDER ---------- */
function updateStats(filteredTasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const remaining = total - done;

  totalCountSpan.textContent = `Total : ${total}`;
  doneCountSpan.textContent = `Terminées : ${done}`;
  remainingCountSpan.textContent = `Restantes : ${remaining}`;

  // On pourrait aussi afficher le nombre de tâches visibles si besoin
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  li.innerHTML = `
    <div class="task-left">
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} />
      <div class="task-main">
        <span class="task-text ${task.completed ? "completed" : ""}">${task.text}</span>
        <span class="task-category">${task.category}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn edit-btn" title="Modifier">✎</button>
      <button class="icon-btn delete-btn" title="Supprimer">✕</button>
    </div>
  `;

  return li;
}

function renderTasks() {
  const filterCategory = filterCategorySelect.value;
  taskList.innerHTML = "";

  const filtered = tasks.filter((task) => {
    if (filterCategory === "Tous") return true;
    return task.category === filterCategory;
  });

  filtered.forEach((task) => {
    const el = createTaskElement(task);
    taskList.appendChild(el);
  });

  updateStats(filtered);
}

/* ---------- ACTIONS ---------- */
function addTask() {
  const text = input.value.trim();
  if (!text) return;

  const category = taskCategorySelect.value;

  const newTask = {
    id: Date.now().toString(),
    text,
    category,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  input.value = "";
}

function toggleTaskCompletion(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  // Inline edit : transformer le span en input
  const li = taskList.querySelector(`li[data-id="${id}"]`);
  if (!li) return;

  const textSpan = li.querySelector(".task-text");
  if (!textSpan) return;

  const currentText = task.text;
  const inputEdit = document.createElement("input");
  inputEdit.type = "text";
  inputEdit.value = currentText;
  inputEdit.className = "task-edit-input";
  inputEdit.style.width = "100%";

  textSpan.replaceWith(inputEdit);
  inputEdit.focus();
  inputEdit.select();

  function validateEdit() {
    const newText = inputEdit.value.trim();
    if (newText) {
      task.text = newText;
      saveTasks();
    }
    renderTasks();
  }

  inputEdit.addEventListener("blur", validateEdit);
  inputEdit.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      validateEdit();
    } else if (e.key === "Escape") {
      renderTasks();
    }
  });
}

function clearAllTasks() {
  if (tasks.length === 0) return;
  const confirmClear = window.confirm("Supprimer toutes les tâches ?");
  if (!confirmClear) return;
  tasks = [];
  saveTasks();
  renderTasks();
}

/* ---------- EVENT LISTENERS ---------- */
addBtn.addEventListener("click", addTask);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filterCategorySelect.addEventListener("change", renderTasks);

clearAllBtn.addEventListener("click", clearAllTasks);

taskList.addEventListener("click", (e) => {
  const li = e.target.closest(".task-item");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.classList.contains("task-checkbox")) {
    toggleTaskCompletion(id);
  } else if (e.target.classList.contains("delete-btn")) {
    deleteTask(id);
  } else if (e.target.classList.contains("edit-btn")) {
    editTask(id);
  }
});

/* ---------- INIT ---------- */
loadTasks();
renderTasks();

