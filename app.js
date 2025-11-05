// TodoApp: Main application class
class TodoApp {
    constructor() {
        // Initialize DOM elements
        this.elements = {
            titleInput: document.getElementById('taskTitle'),
            descInput: document.getElementById('taskDesc'),
            priorityInput: document.getElementById('taskPriority'),
            categoryInput: document.getElementById('taskCategory'),
            taskList: document.getElementById('taskList'),
            todoForm: document.getElementById('todoForm'),
            categoryForm: document.getElementById('categoryForm'),
            categoryList: document.getElementById('categoryList'),
            categoryNameInput: document.getElementById('categoryName'),
            titleFilter: document.getElementById('titleFilter'),
            priorityFilter: document.getElementById('priorityFilter'),
            categoryFilter: document.getElementById('categoryFilter'),
            modal: document.getElementById('confirmModal'),
            modalTitle: document.getElementById('modalTitle'),
            modalMessage: document.getElementById('modalMessage'),
            modalConfirm: document.getElementById('modalConfirm'),
            modalCancel: document.getElementById('modalCancel')
        };

        // Initialize data
        this.todos = JSON.parse(localStorage.getItem('todos') || '[]');
        this.categories = JSON.parse(localStorage.getItem('categories') || '[]');

        // Bind methods to maintain 'this' context
        this.handleTaskSubmit = this.handleTaskSubmit.bind(this);
        this.handleCategorySubmit = this.handleCategorySubmit.bind(this);
        this.filterTasks = this.filterTasks.bind(this);

        // Edit state
        this.editingTaskIndex = null;
        this.editingCategoryIndex = null;

        // Sortable instances
        this.taskSortable = null;
        this.categorySortable = null;

        // Initialize event listeners
        this.initializeEventListeners();
    }

    // Event Listeners Setup
    initializeEventListeners() {
        this.elements.todoForm.onsubmit = this.handleTaskSubmit;
        this.elements.categoryForm.onsubmit = this.handleCategorySubmit;
        this.elements.titleFilter.addEventListener('input', this.filterTasks);
        this.elements.priorityFilter.addEventListener('change', this.filterTasks);
        this.elements.categoryFilter.addEventListener('change', this.filterTasks);

        // Export PDF button (if present)
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportTasksPDF());

        // Prepare Sortable for drag-and-drop (will work on rendered lists)
        this.setupSortables();
    }

    // Task Management Methods
    handleTaskSubmit(e) {
        e.preventDefault();
        const title = this.elements.titleInput.value.trim();
        const desc = this.elements.descInput.value.trim();
        const priority = this.elements.priorityInput.value;
        const category = this.elements.categoryInput.value;
        
        if (!title) return;

        if (this.editingTaskIndex !== null) {
            // update existing task
            const idx = this.editingTaskIndex;
            this.todos[idx] = { ...this.todos[idx], title, desc, priority, category };
            this.editingTaskIndex = null;
            // restore submit button text if changed
            const submitBtn = this.elements.todoForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = '➕ Aufgabe hinzufügen';
            // remove cancel button if present
            const cancel = document.getElementById('cancelTaskEditBtn');
            if (cancel) cancel.remove();
        } else {
            this.todos.push({ title, desc, priority, category, done: false });
        }
        this.elements.titleInput.value = '';
        this.elements.descInput.value = '';
        this.elements.priorityInput.value = 'Mittel';
        this.elements.categoryInput.value = '';
        
        this.save();
        this.render();
    }

    toggleTaskDone(todo) {
        todo.done = !todo.done;
        this.save();
        this.render();
    }

    showConfirmDialog(title, message, { confirmText, cancelText } = {}) {
        return new Promise((resolve) => {
            this.elements.modalTitle.textContent = title;
            this.elements.modalMessage.textContent = message;

            // Backup original button texts
            const modalConfirm = this.elements.modalConfirm;
            const modalCancel = this.elements.modalCancel;
            const oldConfirm = modalConfirm.textContent;
            const oldCancel = modalCancel.textContent;

            // Apply temporary labels if provided
            if (confirmText) modalConfirm.textContent = confirmText;
            if (cancelText) modalCancel.textContent = cancelText;

            this.elements.modal.classList.add('show');

            const cleanup = () => {
                this.elements.modal.classList.remove('show');
                // Restore labels
                modalConfirm.textContent = oldConfirm;
                modalCancel.textContent = oldCancel;
                modalConfirm.removeEventListener('click', handleConfirm);
                modalCancel.removeEventListener('click', handleCancel);
            };

            const handleConfirm = () => {
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            modalConfirm.addEventListener('click', handleConfirm);
            modalCancel.addEventListener('click', handleCancel);
        });
    }

    async deleteTask(index) {
        const confirmed = await this.showConfirmDialog(
            'Aufgabe löschen',
            'Möchtest du diese Aufgabe wirklich löschen?',
            { confirmText: 'Ja, löschen', cancelText: 'Abbrechen' }
        );
        
        if (confirmed) {
            this.todos.splice(index, 1);
            this.save();
            this.render();
        }
    }

    startEditTask(index) {
        const todo = this.todos[index];
        if (!todo) return;
        this.editingTaskIndex = index;
        this.elements.titleInput.value = todo.title;
        this.elements.descInput.value = todo.desc;
        this.elements.priorityInput.value = todo.priority;
        this.elements.categoryInput.value = todo.category || '';

        const submitBtn = this.elements.todoForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '💾 Änderungen speichern';

        // add cancel edit button
        if (!document.getElementById('cancelTaskEditBtn')) {
            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.id = 'cancelTaskEditBtn';
            cancel.className = 'btn-secondary';
            cancel.textContent = 'Abbrechen';
            cancel.onclick = () => {
                this.editingTaskIndex = null;
                this.elements.todoForm.reset();
                if (submitBtn) submitBtn.textContent = '➕ Aufgabe hinzufügen';
                cancel.remove();
            };
            this.elements.todoForm.appendChild(cancel);
        }
    }

    // Category Management Methods
    handleCategorySubmit(e) {
        e.preventDefault();
        const categoryName = this.elements.categoryNameInput.value.trim();
        if (!categoryName) return;
        if (this.editingCategoryIndex !== null) {
            this.categories[this.editingCategoryIndex].name = categoryName;
            this.editingCategoryIndex = null;
            const submitBtn = this.elements.categoryForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = '📁 Kategorie anlegen';
            const cancel = document.getElementById('cancelCategoryEditBtn');
            if (cancel) cancel.remove();
        } else {
            this.categories.push({ name: categoryName });
        }
        this.elements.categoryNameInput.value = '';
        this.save();
        this.renderCategories();
    }

    async deleteCategory(index) {
        const confirmed = await this.showConfirmDialog(
            'Kategorie löschen',
            'Möchtest du diese Kategorie wirklich löschen? Alle Aufgaben in dieser Kategorie werden keiner Kategorie zugeordnet.',
            { confirmText: 'Ja, löschen', cancelText: 'Abbrechen' }
        );

        if (confirmed) {
            const categoryName = this.categories[index].name;
            this.categories.splice(index, 1);
            
            // Update tasks that used this category
            this.todos = this.todos.map(todo => 
                todo.category === categoryName ? { ...todo, category: '' } : todo
            );
            
            this.save();
            this.renderCategories();
            this.render();
        }
    }

    startEditCategory(index) {
        const cat = this.categories[index];
        if (!cat) return;
        this.editingCategoryIndex = index;
        this.elements.categoryNameInput.value = cat.name;
        const submitBtn = this.elements.categoryForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = '💾 Speichern';

        if (!document.getElementById('cancelCategoryEditBtn')) {
            const cancel = document.createElement('button');
            cancel.type = 'button';
            cancel.id = 'cancelCategoryEditBtn';
            cancel.className = 'btn-secondary';
            cancel.textContent = 'Abbrechen';
            cancel.onclick = () => {
                this.editingCategoryIndex = null;
                this.elements.categoryForm.reset();
                if (submitBtn) submitBtn.textContent = '📁 Kategorie anlegen';
                cancel.remove();
            };
            this.elements.categoryForm.appendChild(cancel);
        }
    }

    // Filter Methods
    filterTasks() {
        const titleValue = this.elements.titleFilter.value.toLowerCase();
        const priorityValue = this.elements.priorityFilter.value;
        const categoryValue = this.elements.categoryFilter.value;

        const filteredTodos = this.todos.filter(todo => {
            const titleMatch = todo.title.toLowerCase().includes(titleValue);
            const priorityMatch = !priorityValue || todo.priority === priorityValue;
            const categoryMatch = !categoryValue || todo.category === categoryValue;
            return titleMatch && priorityMatch && categoryMatch;
        });

        this.renderTasks(filteredTodos);
    }

    // Render Methods
    render() {
        this.renderTasks(this.todos);
    }

    renderTasks(todosToRender) {
        const list = this.elements.taskList;
        list.innerHTML = '';

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
            
            const taskName = document.createElement('span');
            taskName.className = 'task-name';
            taskName.textContent = todo.title;
            title.appendChild(taskName);
            title.appendChild(prioritySpan);
            if (todo.category) title.appendChild(categorySpan);

            const desc = document.createElement('textarea');
            desc.className = 'desc';
            desc.value = todo.desc;
            desc.placeholder = 'Beschreibung';
            
            // Auto-resize function
            const autoResize = () => {
                desc.style.height = 'auto';
                desc.style.height = desc.scrollHeight + 'px';
            };
            
            desc.addEventListener('input', autoResize);
            desc.addEventListener('change', () => {
                todo.desc = desc.value;
                this.save();
            });
            
            // Initial resize
            setTimeout(autoResize, 0);

            const actions = document.createElement('div');
            actions.className = 'actions';

            // Action buttons order: Löschen, Bearbeiten, Markieren
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Löschen';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => this.deleteTask(this.todos.indexOf(todo));

            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️ Bearbeiten';
            editBtn.className = 'btn-secondary';
            editBtn.onclick = () => {
                const realIndex = this.todos.indexOf(todo);
                if (realIndex >= 0) this.startEditTask(realIndex);
            };

            const markBtn = document.createElement('button');
            markBtn.textContent = todo.done ? '✓ Erledigt' : '✓ Markieren';
            markBtn.className = todo.done ? 'btn-success' : 'btn-primary';
            markBtn.onclick = () => this.toggleTaskDone(todo);

            actions.appendChild(deleteBtn);
            actions.appendChild(editBtn);
            actions.appendChild(markBtn);

            // store real index so Sortable can rebuild order correctly
            const realIndex = this.todos.indexOf(todo);
            li.dataset.index = realIndex;

            li.appendChild(title);
            li.appendChild(desc);
            li.appendChild(actions);
            list.appendChild(li);
        });
    }

    renderCategories() {
        this.elements.categoryList.innerHTML = '';
        this.elements.categoryInput.innerHTML = '<option value="">📂 Kategorie auswählen</option>';
        this.elements.categoryFilter.innerHTML = '<option value="">📂 Alle Kategorien</option>';
        
        this.categories.forEach((category, index) => {
            // Add to category list
            const li = document.createElement('li');
            li.className = 'category-item';
            li.dataset.index = index;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = category.name;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️ Löschen';
            deleteBtn.className = 'btn-danger';
            deleteBtn.onclick = () => this.deleteCategory(index);

            const editBtn = document.createElement('button');
            editBtn.textContent = '✏️ Bearbeiten';
            editBtn.className = 'btn-secondary';
            editBtn.onclick = () => this.startEditCategory(index);

            li.appendChild(nameSpan);
            li.appendChild(deleteBtn);
            li.appendChild(editBtn);
            this.elements.categoryList.appendChild(li);
            
            // Add to dropdowns
            [this.elements.categoryInput, this.elements.categoryFilter].forEach(select => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });

        // re-init sortables so dataset.index values are current
        if (this.categorySortable) {
            this.categorySortable.destroy();
            this.setupCategorySortable();
        }
    }

    // Storage Methods
    save() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    setupSortables() {
        // Setup task sortable
        if (window.Sortable && this.elements.taskList) {
            this.setupTaskSortable();
        }
        // Setup category sortable
        if (window.Sortable && this.elements.categoryList) {
            this.setupCategorySortable();
        }
    }

    isFiltering() {
        return !!(this.elements.titleFilter.value || this.elements.priorityFilter.value || this.elements.categoryFilter.value);
    }

    setupTaskSortable() {
        // destroy existing
        if (this.taskSortable) try { this.taskSortable.destroy(); } catch (e) {}

        this.taskSortable = Sortable.create(this.elements.taskList, {
            animation: 150,
            onEnd: (evt) => {
                // rebuild todos order from dataset.index of li elements
                const items = Array.from(this.elements.taskList.children);
                const order = items.map(li => parseInt(li.dataset.index, 10));
                // if any index is NaN, skip reordering
                if (order.some(isNaN)) return;
                const newTodos = order.map(i => this.todos[i]);
                this.todos = newTodos;
                this.save();
                this.render();
            }
        });
    }

    setupCategorySortable() {
        if (this.categorySortable) try { this.categorySortable.destroy(); } catch (e) {}

        this.categorySortable = Sortable.create(this.elements.categoryList, {
            animation: 150,
            onEnd: (evt) => {
                const items = Array.from(this.elements.categoryList.children);
                const order = items.map(li => parseInt(li.dataset.index, 10));
                if (order.some(isNaN)) return;
                const newCats = order.map(i => this.categories[i]);
                this.categories = newCats;
                this.save();
                this.renderCategories();
                this.render();
            }
        });
    }

    exportTasksPDF() {
        try {
            const { jsPDF } = window.jspdf || {};
            if (!jsPDF) {
                alert('PDF-Bibliothek nicht verfügbar');
                return;
            }

            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text('Aufgabenliste', 14, 18);
            doc.setFontSize(11);

            const marginLeft = 14;
            let y = 30;
            const lineHeight = 8;

            this.todos.forEach((t, idx) => {
                const status = t.done ? '[x]' : '[ ]';
                const title = `${idx + 1}. ${status} ${t.title} (${t.priority})`;
                doc.text(title, marginLeft, y);
                y += lineHeight;
                if (t.desc) {
                    // wrap description if too long
                    const lines = doc.splitTextToSize(t.desc, 180);
                    doc.text(lines, marginLeft + 6, y);
                    y += lines.length * lineHeight;
                }
                if (t.category) {
                    doc.text(`Kategorie: ${t.category}`, marginLeft + 6, y);
                    y += lineHeight;
                }

                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });

            doc.save('aufgaben.pdf');
        } catch (err) {
            console.error(err);
            alert('Fehler beim Erstellen des PDFs');
        }
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // If not logged in, redirect to auth page
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = 'auth.html';
        return;
    }

    window.todoApp = new TodoApp();
    window.todoApp.render();
    window.todoApp.renderCategories();
    
    // Initialize Accessibility Features
    initializeAccessibility();
    initializeLogin();
    initializeFooter();
});

// Accessibility Mode Manager
function initializeAccessibility() {
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    const accessibilityModal = document.getElementById('accessibilityModal');
    const accessibilityCancel = document.getElementById('accessibilityCancel');
    const accessibilityOptions = document.querySelectorAll('.accessibility-option');
    
    // Load saved accessibility mode
    const savedMode = localStorage.getItem('accessibilityMode') || 'default';
    applyAccessibilityMode(savedMode);
    updateActiveOption(savedMode);
    
    // Open accessibility modal
    accessibilityBtn.addEventListener('click', () => {
        accessibilityModal.classList.add('show');
    });
    
    // Close modal
    accessibilityCancel.addEventListener('click', () => {
        accessibilityModal.classList.remove('show');
    });
    
    // Handle mode selection
    accessibilityOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mode = option.dataset.mode;
            applyAccessibilityMode(mode);
            updateActiveOption(mode);
            localStorage.setItem('accessibilityMode', mode);
            
            // Optional: close modal after selection
            setTimeout(() => {
                accessibilityModal.classList.remove('show');
            }, 300);
        });
    });
    
    function applyAccessibilityMode(mode) {
        // Remove all accessibility classes
        document.body.classList.remove('dark-mode', 'high-contrast', 'protanopia', 'deuteranopia', 'tritanopia');
        
        // Apply selected mode
        if (mode !== 'default') {
            document.body.classList.add(mode);
        }
    }
    
    function updateActiveOption(mode) {
        accessibilityOptions.forEach(option => {
            if (option.dataset.mode === mode) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
}

// Login Manager (with user info popup and logout)
function initializeLogin() {
    const userInfoBtn = document.getElementById('userInfoBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfoModal = document.getElementById('userInfoModal');
    const userInfoClose = document.getElementById('userInfoClose');
    
    if (!userInfoBtn || !logoutBtn) return;

    const getCurrentUser = () => {
        const email = localStorage.getItem('loggedInUser');
        if (!email) return null;
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            return users.find(u => u.email === email) || { name: email, email };
        } catch {
            return { name: email, email };
        }
    };

    const updateButtons = () => {
        const user = getCurrentUser();
        if (user) {
            userInfoBtn.textContent = `👤 ${user.name || user.email}`;
            userInfoBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
        } else {
            userInfoBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    };

    // Show user info modal
    userInfoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) return;

        // Get user stats
        const todos = JSON.parse(localStorage.getItem('todos') || '[]');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        
        // Populate modal
        document.getElementById('userInfoName').textContent = user.name || 'Nicht angegeben';
        document.getElementById('userInfoEmail').textContent = user.email;
        document.getElementById('userInfoDate').textContent = user.registeredDate || 'Unbekannt';
        document.getElementById('userInfoTasks').textContent = todos.length;
        document.getElementById('userInfoCategories').textContent = categories.length;

        userInfoModal.classList.add('show');
    });

    // Close user info modal
    if (userInfoClose) {
        userInfoClose.addEventListener('click', () => {
            userInfoModal.classList.remove('show');
        });
    }

    // Utility: show custom confirmation using existing modal
    const showConfirm = (title, message, { confirmText, cancelText } = {}) => new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const mTitle = document.getElementById('modalTitle');
        const mMessage = document.getElementById('modalMessage');
        const mConfirm = document.getElementById('modalConfirm');
        const mCancel = document.getElementById('modalCancel');

        if (!modal || !mTitle || !mMessage || !mConfirm || !mCancel) {
            // Fallback if modal not found
            resolve(confirm(message));
            return;
        }

    mTitle.textContent = title;
    mMessage.textContent = message;

    // store original button labels and apply temporary labels if provided
    const oldConfirmText = mConfirm.textContent;
    const oldCancelText = mCancel.textContent;
    if (confirmText) mConfirm.textContent = confirmText;
    if (cancelText) mCancel.textContent = cancelText;
        modal.classList.add('show');

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            cleanup();
            resolve(false);
        };
        const cleanup = () => {
            modal.classList.remove('show');
            // restore original labels
            mConfirm.textContent = oldConfirmText;
            mCancel.textContent = oldCancelText;
            mConfirm.removeEventListener('click', onConfirm);
            mCancel.removeEventListener('click', onCancel);
        };

        mConfirm.addEventListener('click', onConfirm);
        mCancel.addEventListener('click', onCancel);
    });

    // Logout button
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const confirmed = await showConfirm('Abmelden bestätigen', 'Möchtest du dich wirklich abmelden?', { confirmText: 'Ja, abmelden', cancelText: 'Abbrechen' });
        if (confirmed) {
            // Close user info modal if open
            if (userInfoModal) userInfoModal.classList.remove('show');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = 'auth.html';
        }
    });

    updateButtons();
}

// Footer utilities
function initializeFooter() {
    // Set current year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Open Accessibility from footer link
    const openAcc = document.getElementById('openAccessibility');
    if (openAcc) {
        openAcc.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = document.getElementById('accessibilityModal');
            if (modal) modal.classList.add('show');
        });
    }

    // Scroll to top
    const scrollTop = document.getElementById('scrollTop');
    if (scrollTop) {
        scrollTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
