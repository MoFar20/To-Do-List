// Pure helper functions for testing (extracted from modules)
// No DOM dependencies, easy to unit test

/**
 * Filter tasks by title, priority, and category
 * @param {Array} tasks - Array of task objects
 * @param {Object} criteria - { title, priority, category }
 * @returns {Array} Filtered tasks
 */
function filterTasks(tasks, { title = '', priority = '', category = '' } = {}) {
  return tasks.filter(task => {
    const titleMatch = task.title.toLowerCase().includes(title.toLowerCase());
    const priorityMatch = !priority || task.priority === priority;
    const categoryMatch = !category || task.category === category;
    return titleMatch && priorityMatch && categoryMatch;
  });
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate password policy
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
function validatePassword(password) {
  if (!password || password.length < 8) return 'Passwort muss mindestens 8 Zeichen lang sein.';
  if (!/[A-Z]/.test(password)) return 'Passwort muss mindestens einen Großbuchstaben enthalten.';
  if (!/[a-z]/.test(password)) return 'Passwort muss mindestens einen Kleinbuchstaben enthalten.';
  if (!/[0-9]/.test(password)) return 'Passwort muss mindestens eine Zahl enthalten.';
  if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/;'+=]/.test(password)) return 'Passwort muss mindestens ein Sonderzeichen enthalten.';
  return null;
}

/**
 * Check if verification code is expired
 * @param {number} expiryTimestamp
 * @returns {boolean}
 */
function isCodeExpired(expiryTimestamp) {
  return Date.now() > expiryTimestamp;
}

/**
 * Generate 6-digit verification code
 * @returns {string}
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate category name (no duplicates, not empty)
 * @param {string} name
 * @param {Array} existingCategories
 * @returns {string|null} Error message or null if valid
 */
function validateCategoryName(name, existingCategories = []) {
  if (!name || !name.trim()) return 'Kategoriename darf nicht leer sein.';
  if (existingCategories.some(cat => cat.name === name)) return 'Kategorie existiert bereits.';
  return null;
}

module.exports = {
  filterTasks,
  isValidEmail,
  validatePassword,
  isCodeExpired,
  generateVerificationCode,
  validateCategoryName
};
