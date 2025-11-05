export class TaskFilter {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.titleFilter = document.getElementById('titleFilter');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.categoryFilter = document.getElementById('categoryFilter');
    }

    init() {
        this.titleFilter.addEventListener('input', () => this.filterTasks());
        this.priorityFilter.addEventListener('change', () => this.filterTasks());
        this.categoryFilter.addEventListener('change', () => this.filterTasks());
    }

    filterTasks() {
        const titleValue = this.titleFilter.value.toLowerCase();
        const priorityValue = this.priorityFilter.value;
        const categoryValue = this.categoryFilter.value;

        const filteredTodos = this.taskManager.getTodos().filter(todo => {
            const titleMatch = todo.title.toLowerCase().includes(titleValue);
            const priorityMatch = !priorityValue || todo.priority === priorityValue;
            const categoryMatch = !categoryValue || todo.category === categoryValue;
            return titleMatch && priorityMatch && categoryMatch;
        });

        this.taskManager.render(filteredTodos);
    }
}