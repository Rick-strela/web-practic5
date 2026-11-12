const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const counter = document.getElementById("tasks-counter");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];      // сюди зберігаємо завдання з сервера
let filter = "all";  // all - всі, active - активні, done - виконані

// Отримати завдання з сервера
async function loadTasks() {
    const response = await fetch("/api/tasks");
    tasks = await response.json();
    showTasks();
}

// Показати завдання на сторінці (з урахуванням фільтра)
function showTasks() {
    list.innerHTML = "";
    counter.textContent = tasks.length;

    for (const task of tasks) {
        if (filter === "active" && task.done) continue;
        if (filter === "done" && !task.done) continue;

        const li = document.createElement("li");
        if (task.done) li.classList.add("completed");

        // клік по тексту - відмітити виконаним
        const span = document.createElement("span");
        span.textContent = task.title;
        span.addEventListener("click", () => toggleTask(task));

        const editButton = document.createElement("button");
        editButton.textContent = "Змінити";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editTask(task));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Видалити";
        deleteButton.addEventListener("click", () => deleteTask(task.id));

        li.append(span, editButton, deleteButton);
        list.append(li);
    }
}

// Додати нове завдання
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = input.value.trim();
    if (title === "") return;

    await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title })
    });

    input.value = "";
    loadTasks();
});

// Видалити завдання
async function deleteTask(id) {
    await fetch("/api/tasks/" + id, { method: "DELETE" });
    loadTasks();
}

// Відмітити виконаним / невиконаним
async function toggleTask(task) {
    await fetch("/api/tasks/" + task.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done })
    });
    loadTasks();
}

// Змінити текст завдання
async function editTask(task) {
    const newTitle = prompt("Змінити завдання:", task.title);
    if (newTitle === null || newTitle.trim() === "") return;

    await fetch("/api/tasks/" + task.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() })
    });
    loadTasks();
}

// Кнопки фільтрів
for (const button of filterButtons) {
    button.addEventListener("click", () => {
        filter = button.dataset.filter;

        for (const b of filterButtons) b.classList.remove("active");
        button.classList.add("active");

        showTasks();
    });
}

loadTasks();
