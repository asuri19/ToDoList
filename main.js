const form = document.querySelector('.todo__form');
const textareaForm = document.querySelector('.todo__form__input');
const buttonSendForm = document.querySelector('.todo__form__send-btn');
const buttonCancel = document.querySelector('.todo__form__cancel-btn');
const output = document.querySelector('.todo__output');
const buttonClear = document.querySelector('.todo__clear-btn');
let editId = null;
let isEditTask = false;

// body
updateListTasks()
form.addEventListener('submit', addTask)
output.addEventListener('click', event => {
    const taskElementRight = event.target.closest('.task__btns')
    const taskElementLeft = event.target.closest('.task__title')
    if (!taskElementRight && !taskElementLeft) return

    if (event.target.closest('.task__done')) {
        doneTask(event)
    } else if (event.target.closest('.task__pinned')) {
        pinTask(event)
    } else if (event.target.closest('.task__edit')) {
        editTask(event)
    } else if (event.target.closest('.task__del')) {
        delTask(event)
    }
})
buttonCancel.addEventListener('click', resetSendForm)
buttonClear.addEventListener('click', clearLS)
output.addEventListener('dragover', initSortList)
output.addEventListener('dragenter', event => event.preventDefault())
document.addEventListener('click', () => {
    if (buttonCancel.classList.contains('none')) {
        buttonSendForm.style.margin = '0 0 42px 0'
    } else {
        buttonSendForm.style.margin = 0
    }
})


// функции
function addTask(event) {
    event.preventDefault();
    // проверка импута на пусоту и удаление лишних пробелов
    const task = textareaForm.value.trim().replace(/\s+/g, ' ');
    if (!task) {
        return
    }
    // редактируется ли задача?
    if (isEditTask) {
        saveEditedTask(task);
        return;
    }
    const arrayTasksLS = getTasksLocalStorage();
    arrayTasksLS.push({
        id: generateUniqueId(),
        task: task,
        done: false,
        pinned: false,
        time: getCreationTime(),
        position: 1000,
    })
    buttonClear.classList.remove('none')
    document.querySelector('.todo__counter').classList.remove('none')
    setTasksLocalStorage(arrayTasksLS)
    updateListTasks()
    form.reset()
}

// обработчики кнопок операций
function doneTask(event) {
    const task = event.target.closest('.task')
    const id = (+task.dataset.taskId)

    const arrayTasksLS = getTasksLocalStorage()
    const index = arrayTasksLS.findIndex(task => task.id === id);

    if (index === -1) {
        return
    }
    if (!arrayTasksLS[index].done && arrayTasksLS[index].pinned) {
        arrayTasksLS[index].pinned = false
    }
    if (arrayTasksLS[index].done) {
        arrayTasksLS[index].done = false
    } else {
        arrayTasksLS[index].done = true
    }
    setTasksLocalStorage(arrayTasksLS)
    updateListTasks()
}

// закрепление задачи
function pinTask(event) {
    const task = event.target.closest('.task')
    const id = (+task.dataset.taskId)

    const arrayTasksLS = getTasksLocalStorage()
    const index = arrayTasksLS.findIndex(task => task.id === id);

    if (index === -1) {
        return
    }

    if (!arrayTasksLS[index].pinned && arrayTasksLS[index].done) {
        return;
    }

    if (arrayTasksLS[index].pinned) {
        arrayTasksLS[index].pinned = false
    } else {
        arrayTasksLS[index].pinned = true
    }
    setTasksLocalStorage(arrayTasksLS)
    updateListTasks()
}

// удаление задачи
function delTask(event) {
    const task = event.target.closest('.task')
    const id = (+task.dataset.taskId)

    const arrayTasksLS = getTasksLocalStorage()
    const newTaskArray = arrayTasksLS.filter(task => task.id !== id);

    if (isEditTask) {
        alert('Сначала закончи с редактированием')
        return
    }
    setTasksLocalStorage(newTaskArray)
    updateListTasks()
}

// редактирование задачи
function editTask(event) {
    const task = event.target.closest('.task')
    const text = task.querySelector('.task__text')

    if (task.classList.contains('done')) {
        return alert('Нельзя редактировать выполненную задачу')
    }

    editId = (+task.dataset.taskId)

    textareaForm.value = text.innerText;
    isEditTask = true;
    buttonSendForm.innerText = 'Сохранить';
    buttonCancel.classList.remove('none');
    form.scrollIntoView({behavior: 'smooth'});
}

// сработает на кнопке "Сохранить" при редактировании
function saveEditedTask(task) {
    const arrayTasksLS = getTasksLocalStorage()
    const editedTaskIndex = arrayTasksLS.findIndex(task => task.id === editId);
    buttonSendForm.style.margin = '0 0 42px 0'

    arrayTasksLS[editedTaskIndex].task = task;
    // arrayTasksLS[editedTaskIndex].edited = 'edited';
    setTasksLocalStorage(arrayTasksLS)
    updateListTasks();
    resetSendForm()
}

// очистка формы после редактирование и при отмене
function resetSendForm() {
    editId = null;
    isEditTask = false;
    buttonCancel.classList.add('none');
    buttonSendForm.innerText = 'Добавить'
    form.reset()
}

// кнопка очистки списка
function clearLS() {
    localStorage.clear()
    buttonClear.classList.add('none')
    document.querySelector('.todo__counter').classList.add('none')
    updateListTasks();
}

// вытаскивает задачи из сторожки, если нет - отдает массив
function getTasksLocalStorage() {
    const tasksJSON = localStorage.getItem('tasks');
    if (tasksJSON) {
        return JSON.parse(tasksJSON); //из формата JSON в строку с массивом
    } else {
        return [];
    }
}

// заносит задачу в сторожку
function setTasksLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// генерация уникального id для задачи
function generateUniqueId() {
    let randomOne = Math.floor(Math.random() * 100000);
    let randomTwo = Math.floor(Math.random() * 100000);
    return randomOne + randomTwo;
}

// очистка списка, запрос актуальных задач и отристовка нового списка
function updateListTasks() {
    document.querySelector('.todo__output').innerText = '';
    const arrayTasksLS = getTasksLocalStorage();
    renderTasks(arrayTasksLS)
}

// отрисовка нового списка
function renderTasks(tasks) {
    if (!tasks || !tasks.length) {
        buttonClear.classList.add('none')  //убираем кнопку очистки, если нет задач
        document.querySelector('.todo__counter').classList.add('none')
        return
    }

    tasks = tasks.sort((a, b) => {
        if (a.done !== b.done) {
            if (a.done) {
                return 1
            } else return -1
        }

        if (a.pinned !== b.pinned) {
            if (a.pinned) {
                return -1
            } else return 1
        }
        return a.position - b.position;
    })
    let counter = 0
    tasks.forEach((value) => {
        const {id, task, pinned, done, time} = value;
        const item =
            `<div class="task ${done ? 'done' : ''} ${pinned ? 'pinned' : ''}" data-task-id="${id}" draggable="true">
                <div class="task__title">
                    <button class="task__done"><img src="https://i.postimg.cc/rsqgLjWv/done.png" class="task__icon"></button>
                    <div class="task__info">
                        <p class="task__time">${time}</p>
                        <p class="task__text">${task}</p>
                    </div>
                </div>
                <div class="task__btns">
                    <button class="task__pinned"><img src="https://i.postimg.cc/JhGd0psJ/pin.png" class="task__icon"></button>
                    <button class="task__edit"><img src="https://i.postimg.cc/63rzSg7r/edit.png" class="task__icon"></button>
                    <button class="task__del"><img src="https://i.postimg.cc/C1TmcSKM/del.png" class="task__icon"></button>
                </div>
            </div>`
        document.querySelector('.todo__output').insertAdjacentHTML('beforeend', item)
        counter += 1;
    });
    document.querySelector('.todo__counter p').innerText = `Всего задач: ${counter}`
    activationDrag(); // вешаем обработчик для перемещения
}

// перемещение задачи
function activationDrag() {
    const tasks = Array.from(document.querySelectorAll('.task'));

    tasks.forEach(item => {
        item.addEventListener('dragstart', () => {
            setTimeout(() => item.classList.add('dragging'), 0)
        });
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            if (tasks.length > 1) {
                savePositionTask()
            }
        })
    })
}

// смена position у существующих задач при перестановке
function savePositionTask() {
    const arrayTasksLS = getTasksLocalStorage()
    const tasks = Array.from(document.querySelectorAll('.task'))

    tasks.forEach((item, i) => {
        const id = (+item.dataset.taskId)
        const index = arrayTasksLS.findIndex(value => value.id === id)

        if (index !== -1) {
            arrayTasksLS[index].position = i;
        }
    })
    setTasksLocalStorage(arrayTasksLS)
    updateListTasks()
}

// захват претаскиваемого объекта и вставка перед новым соседом
function initSortList(event) {
    event.preventDefault()

    const draggingItem = document.querySelector('.dragging');
    let siblings = Array.from(output.querySelectorAll('.task:not(.dragging)'));

    let nextSibling = siblings.find(sibling => {
        return event.clientY <= sibling.offsetTop + sibling.offsetHeight / 2;
    })

    output.insertBefore(draggingItem, nextSibling);
}

// функции для работы со временем
function getCreationTime() {
    let day = correctingData(new Date().getDate());
    let month = correctingData(new Date().getMonth() + 1);
    let time = `${correctingData(new Date().getHours())}:${correctingData(new Date().getMinutes())}`
    return `${day}` + `.${month}` + ` ${time}`;
}

function correctingData(data) {
    if (data < 10) {
        data = '0' + data;
    }


    return data;
}