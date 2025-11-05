export class TaskManager {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
        this.titleInput = document.getElementById('taskTitle');
        this.descInput = document.getElementById('taskDesc');
        this.priorityInput = document.getElementById('taskPriority');
        this.categoryInput = document.getElementById('taskCategory');
        this.list = document.getElementById('taskList');
        this.form = document.getElementById('todoForm');
    }

    init() {
        this.form.onsubmit = this.handleSubmit.bind(this);
        this.render();
    }

    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    handleSubmit(e) {
        e.preventDefault();
        const title = this.titleInput.value.trim();
        const desc = this.descInput.value.trim();
        const priority = this.priorityInput.value;
        const category = this.categoryInput.value;
        if (!title) return;

        this.todos.push({ title, desc, priority, category, done: false });
        this.titleInput.value = '';
        this.descInput.value = '';
        this.priorityInput.value = 'Mittel';
        this.categoryInput.value = '';
        this.save();
        this.render();
    }

    render(filteredTodos = null) {
        const todosToRender = filteredTodos || this.todos;
        this.list.innerHTML = '';
        
        todosToRender.forEach((todo, index) => {
            const li = document.createElement('li');
            if (todo.done) li.classList.add('done');

            const title = document.createElement('div');
            title.className = 'title';
            
            const prioritySpan = document.createElement('span');
            prioritySpan.className = `priority priority-${todo.priority.toLowerCase()}`;
            const priorityIcon = todo.priority === 'Hoch' ? '🔴' : todo.priority === 'Mittel' ? '🟡' : '🟢';
            prioritySpan.textContent = `${priorityIcon} ${todo.priority}`;

            const categorySpan = document.createElement('span');
            categorySpan.className = 'category';
            categorySpan.textContent = todo.category ? `📁 ${todo.category}` : '';
            
            title.textContent = todo.title;
            title.appendChild(prioritySpan);
            if (todo.category) title.appendChild(categorySpan);

            const desc = document.createElement('div');
            desc.className = 'desc';
            desc.textContent = todo.desc;

            const actions = document.createElement('div');
            actions.className = 'actions';

            const markBtn = document.createElement('button');
            markBtn.textContent = todo.done ? '✓ Erledigt' : 'Markieren';
            markBtn.className = todo.done ? 'btn-success' : 'btn-primary';
            markBtn.onclick = () => {
                todo.done = !todo.done;
                this.save();
                this.render(filteredTodos);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Löschen';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => {
                if (confirm('Möchtest du diese Aufgabe wirklich löschen?')) {
                    this.todos.splice(this.todos.indexOf(todo), 1);
                    this.save();
                    this.render(filteredTodos);
                }
            };

            actions.appendChild(markBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(title);
            li.appendChild(desc);
            li.appendChild(actions);
            this.list.appendChild(li);
        });
    }

    getTodos() {
        return this.todos;
    }
}