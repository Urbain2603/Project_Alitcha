document.addEventListener("DOMContentLoaded", function () {
    // Récupérer les éléments du DOM
    const taskForm = document.getElementById("add-task-form"); // Utilisez "add-task-form" pour le formulaire
    const taskText = document.getElementById("task-text");
    const taskDate = document.getElementById("task-date");
    const taskTime = document.getElementById("task-time");
    const taskList = document.getElementById("tasks");

    // Variables globales pour gérer le glisser-déposer
let draggedItem = null;

// Fonction pour activer le glisser-déposer
function enableDragAndDrop() {
    const taskItems = document.querySelectorAll("li");

    taskItems.forEach((taskItem) => {
        taskItem.draggable = true;

        taskItem.addEventListener("dragstart", function (e) {
            draggedItem = taskItem;
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", null);
        });

        taskItem.addEventListener("dragover", function (e) {
            e.preventDefault();
        });

        taskItem.addEventListener("dragenter", function (e) {
            e.preventDefault();
            taskItem.classList.add("dragging");
        });

        taskItem.addEventListener("dragleave", function () {
            taskItem.classList.remove("dragging");
        });

        taskItem.addEventListener("drop", function () {
            if (draggedItem && draggedItem !== taskItem) {
                const tasks = Array.from(document.querySelectorAll("li"));
                const indexDragged = tasks.indexOf(draggedItem);
                const indexTarget = tasks.indexOf(taskItem);

                if (indexDragged !== -1 && indexTarget !== -1) {
                    tasks.splice(indexDragged, 1);
                    tasks.splice(indexTarget, 0, draggedItem);
                    taskList.innerHTML = "";
                    tasks.forEach((task) => {
                        taskList.appendChild(task);
                    });
                }
            }

            taskItem.classList.remove("dragging");
            saveTasksToLocalStorage();
        });
    });
}

// Appelez cette fonction au chargement de la page pour activer le glisser-déposer
enableDragAndDrop();

    

    // Charger les tâches depuis le localStorage
    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach((task) => {
            const taskItem = createTaskElement(task.text,  task.date, task.time,task.completed); // Ajouter date et heure
            taskList.appendChild(taskItem);
        });
    }

    loadTasksFromLocalStorage();

    // Sauvegarder les tâches dans le localStorage
    function saveTasksToLocalStorage() {
        const tasks = Array.from(taskList.children).map((taskItem) => ({
            text: taskItem.querySelector("span").textContent,
            date: taskItem.querySelector(".edit-date").value, // Récupérer la date
            time: taskItem.querySelector(".edit-time").value, // Récupérer l'heure
            completed: taskItem.classList.contains("complete"),

        }));
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Créer un élément de tâche avec les boutons (terminé, modifier, supprimer)
    function createTaskElement(text, date, time, completed) { // Ajouter date et heure
        const taskItem = document.createElement("li");
        taskItem.innerHTML = `
            <span>${text}</span>
            <span>${date}</span>
            <span>${time}</span>


            <div>
                <button class="complete-button">Terminé</button>
                <button class="edit-button">Modifier</button>
                <button class="delete-button">Supprimer</button>
            </div>
            <input type="date" class="edit-date" style="display: none" value="${date || ''}"> <!-- Afficher la date -->
            <input type="time" class="edit-time" style="display: none" value="${time || ''}"> <!-- Afficher l'heure -->
        `;

        if (completed) {
            taskItem.classList.add("complete");
        }

        taskItem.addEventListener("dragstart", function () {
            draggedItem = taskItem;
            setTimeout(() => {
                taskItem.style.display = "none";
            }, 0);
        });

        taskItem.addEventListener("dragend", function () {
            setTimeout(() => {
                taskItem.style.display = "block";
                draggedItem = null;
            }, 0);
        });

        return taskItem;
    }

    // Fonction pour attacher les écouteurs d'événements à une tâche
    function attachTaskEventListeners(taskItem) {
        taskItem.addEventListener("dragstart", function () {
            draggedItem = taskItem;
            setTimeout(() => {
                taskItem.style.display = "none";
            }, 0);
        });

        taskItem.addEventListener("dragend", function () {
            setTimeout(() => {
                taskItem.style.display = "block";
                draggedItem = null;
            }, 0);
        });

    }

    // Écouter la soumission du formulaire
    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const text = taskText.value.trim();
        const date = taskDate.value;
        const time = taskTime.value;

        const taskItem = createTaskElement(text, date, time,true); // Ajouter date et heure
        taskList.appendChild(taskItem);

        attachTaskEventListeners(taskItem);
        taskText.value = "";
        taskDate.value = "";
        taskTime.value = "";

        saveTasksToLocalStorage();
    });

    // Écouter les actions sur la tâche (terminé, modifier, supprimer)
    taskList.addEventListener("click", function (e) {
        const taskItem = e.target.closest("li");
        if (!taskItem) return;

        if (e.target.classList.contains("complete-button")) {
            taskItem.classList.toggle("complete");
            saveTasksToLocalStorage();
        } else if (e.target.classList.contains("edit-button")) {
            const editText = taskItem.querySelector("span").textContent;
            const editDate = taskItem.querySelector(".edit-date").value; // Modifier pour récupérer la date
            const editTime = taskItem.querySelector(".edit-time").value; // Modifier pour récupérer l'heure

            taskText.value = editText;
            taskDate.value = editDate;
            taskTime.value = editTime;
        } else if (e.target.classList.contains("delete-button")) {
            taskItem.remove();
            saveTasksToLocalStorage();
        }
    });

    // Écouter le double clic sur une tâche pour activer la modification
    taskList.addEventListener("dblclick", function (e) {
        const taskItem = e.target.closest("li");
        if (!taskItem) return;

        const textSpan = taskItem.querySelector("span");
        const taskDateElement = taskItem.querySelector(".edit-date");
        const taskTimeElement = taskItem.querySelector(".edit-time");

        // Créez des champs d'édition pour le texte, la date et l'heure
        const editText = document.createElement("input");
        editText.type = "text";
        editText.value = textSpan.textContent;
        editText.classList.add("edit-text");

        const editDate = document.createElement("input");
        editDate.type = "date";
        editDate.value = taskDateElement.value;
        editDate.classList.add("edit-date");

        const editTime = document.createElement("input");
        editTime.type = "time";
        editTime.value = taskTimeElement.value;
        editTime.classList.add("edit-time");

        // Remplacez le texte, la date et l'heure par les champs d'édition
        textSpan.style.display = "none";
        taskDateElement.style.display = "none";
        taskTimeElement.style.display = "none";

        taskItem.appendChild(editText);
        taskItem.appendChild(editDate);
        taskItem.appendChild(editTime);

        // Écouter l'événement de validation (perte de focus) des champs d'édition
        editText.addEventListener("blur", function () {
            textSpan.textContent = editText.value;
            editText.style.display = "none";
            taskDateElement.value = editDate.value;
            taskDateElement.style.display = "none";
            taskTimeElement.value = editTime.value;
            taskTimeElement.style.display = "none";

            textSpan.style.display = "inline";
            taskDateElement.style.display = "inline";
            taskTimeElement.style.display = "inline";

            saveTasksToLocalStorage();
        });

        // Focus sur le champ de texte d'édition
        editText.focus();
    });

    // Écouter le déplacement des tâches
    taskList.addEventListener("dragover", function (e) {
        e.preventDefault();
    });

    taskList.addEventListener("drop", function (e) {
        e.preventDefault();
        const dropTarget = e.target.closest("li");
        if (!dropTarget) return;
        if (draggedItem && draggedItem !== dropTarget) {
            taskList.insertBefore(draggedItem, dropTarget);
            saveTasksToLocalStorage();
        }
    });
});

