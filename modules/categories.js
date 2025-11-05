export class CategoryManager {
    constructor(taskManager) {
        this.categories = JSON.parse(localStorage.getItem('categories') || '[]');
        this.taskManager = taskManager;
        this.categoryInput = document.getElementById('taskCategory');
        this.categoryList = document.getElementById('categoryList');
        this.categoryForm = document.getElementById('categoryForm');
        this.categoryFilter = document.getElementById('categoryFilter');
    }

    init() {
        this.categoryForm.onsubmit = this.handleSubmit.bind(this);
        this.render();
    }

    save() {
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    handleSubmit(e) {
        e.preventDefault();
        const categoryName = document.getElementById('categoryName').value.trim();
        if (!categoryName) return;
        
        this.categories.push({ name: categoryName });
        document.getElementById('categoryName').value = '';
        this.save();
        this.render();
    }

    render() {
        this.categoryList.innerHTML = '';
        this.categoryInput.innerHTML = '<option value="">📂 Kategorie auswählen</option>';
        this.categoryFilter.innerHTML = '<option value="">📂 Alle Kategorien</option>';
        
        this.categories.forEach((category, index) => {
            // Add to category list
            const li = document.createElement('li');
            li.className = 'category-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = category.name;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Löschen';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => this.deleteCategory(index);
            
            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            this.categoryList.appendChild(li);
            
            // Add to dropdowns
            [this.categoryInput, this.categoryFilter].forEach(select => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }

    deleteCategory(index) {
        if (confirm('Möchtest du diese Kategorie wirklich löschen?')) {
            const categoryName = this.categories[index].name;
            this.categories.splice(index, 1);
            
            // Update tasks that used this category
            const todos = this.taskManager.getTodos();
            todos.forEach(todo => {
                if (todo.category === categoryName) {
                    todo.category = '';
                }
            });
            
            this.save();
            this.taskManager.save();
            this.render();
            this.taskManager.render();
        }
    }

    getCategories() {
        return this.categories;
    }
}