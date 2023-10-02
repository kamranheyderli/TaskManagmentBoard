// DOM elementləri
const createColumn = document.getElementById("create");
const progressColumn = document.getElementById("progress");
const doneColumn = document.getElementById("done");
const newTaskInput = document.getElementById("newTask");
const addTaskButton = document.getElementById("addTask");

const Url = "http://localhost:3000/tasks";

function DragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

// Yeni kartlar
function updateBoard() {
    fetch(Url)
        .then((response) => response.json())
        .then((data) => {
            createColumn.querySelector(".cards").innerHTML = "";
            progressColumn.querySelector(".cards").innerHTML = "";
            doneColumn.querySelector(".cards").innerHTML = "";

            data.forEach((task) => {
                const card = document.createElement("div");
                card.className = "card";
                card.id = task.id;
                card.draggable = true;
                card.innerHTML = `
                <span>${task.title}</span>
                <i class="fa-solid fa-trash delete-icon"></i>
                `;

                card.addEventListener("dragstart", DragStart);

                const deleteIcon = card.querySelector(".delete-icon");
                deleteIcon.addEventListener("click", () => {
                    deleteCard(task.id);
                });

                if (task.status === "create") {
                    createColumn.querySelector(".cards").appendChild(card);
                } else if (task.status === "progress") {
                    progressColumn.querySelector(".cards").appendChild(card);
                } else if (task.status === "done") {
                    doneColumn.querySelector(".cards").appendChild(card);
                }
            });
        });
}

// Yeni tapşırıq əlavə etmək üçün addEvent
addTaskButton.addEventListener("click", () => {
    const taskTitle = newTaskInput.value;

    if (taskTitle) {
        fetch(Url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: taskTitle,
                status: "create",
            }),
        })
            .then(() => {
                newTaskInput.value = "";
                updateBoard();
            })
            .catch((error) => console.error("Tapşırıq əlavə edilərkən xəta:", error));
    }
});

// Kartı silmək üçün funksiya
function deleteCard(cardId) {
    fetch(`${Url}/${cardId}`, {
        method: "DELETE",
    })
        .then(() => {
            updateBoard();
        })
        .catch((error) => console.error("Kartı silmə zamanı xəta:", error));
}

// Kartı buraxma əməliyyatını funksiyasi
function onDrop(event) {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    const card = document.getElementById(cardId);
    const targetColumn = event.target.closest(".column");

    if (targetColumn) {
        targetColumn.querySelector(".cards").appendChild(card);
        const status = targetColumn.id;
        updateCardStatus(cardId, status);
    }
}

const cards = document.querySelectorAll(".card");
cards.forEach((card) => {
    card.addEventListener("dragstart", DragStart);
});

const columns = document.querySelectorAll(".column");
columns.forEach((column) => {
    column.addEventListener("drop", onDrop);
    column.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
});

function updateCardStatus(cardId, status) {
    fetch(`${Url}/${cardId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: status,
        }),
    })
        .then(() => {
            updateBoard();
        })
        .catch((error) => console.error("Kartın vəziyyətini yeniləmə zamanı xəta:", error));
}


updateBoard();
