// DOM Elements
const addNoteForm = document.getElementById('add-note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('search');
const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
const colorOptions = document.querySelectorAll('.color-option');
const themeToggleBtn = document.getElementById('theme-toggle');

// State variables
let notes = [];
let selectedColor = 'white';
let editingNoteId = null;
let darkMode = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    loadThemePreference();
    renderNotes();
});

// Add theme toggle event listener
themeToggleBtn.addEventListener('click', () => {
    toggleTheme();
});

// View toggle event listeners
viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        viewToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const viewType = btn.dataset.view;
        if (viewType === 'list') {
            notesContainer.classList.add('list-view');
        } else {
            notesContainer.classList.remove('list-view');
        }
        
        // Save view preference
        localStorage.setItem('notesViewPreference', viewType);
    });
});

// Color selection event listeners
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedColor = option.dataset.color;
    });
});

// Functions
function loadNotes() {
    const storedNotes = localStorage.getItem('notes');
    if (storedNotes) {
        notes = JSON.parse(storedNotes);
    }
    
    // Load view preference
    const viewPreference = localStorage.getItem('notesViewPreference');
    if (viewPreference === 'list') {
        notesContainer.classList.add('list-view');
        viewToggleBtns.forEach(btn => {
            if (btn.dataset.view === 'list') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        darkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
    }
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}

function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (!title || !content) return;
    
    const newNote = {
        id: Date.now().toString(),
        title,
        content,
        color: selectedColor,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    
    notes.unshift(newNote);
    saveNotes();
    renderNotes();
    
    // Reset form
    addNoteForm.reset();
    colorOptions[0].click(); // Reset color selection
}

function updateNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (!title || !content) return;
    
    const noteIndex = notes.findIndex(note => note.id === editingNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        notes[noteIndex].color = selectedColor;
        notes[noteIndex].updatedAt = Date.now();
        
        saveNotes();
        renderNotes();
        
        // Reset form and edit mode
        addNoteForm.reset();
        document.querySelector('h2').textContent = 'Add New Note';
        document.querySelector('button[type="submit"]').textContent = 'Save Note';
        editingNoteId = null;
        colorOptions[0].click(); // Reset color selection
    }
}

function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        noteTitleInput.value = note.title;
        noteContentInput.value = note.content;
        document.querySelector('h2').textContent = 'Edit Note';
        document.querySelector('button[type="submit"]').textContent = 'Update Note';
        editingNoteId = id;
        
        // Select correct color
        colorOptions.forEach(option => {
            if (option.dataset.color === note.color) {
                option.click();
            }
        });
        
        // Scroll to form
        document.querySelector('.note-form').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
        
        // If deleting note being edited, reset form
        if (editingNoteId === id) {
            addNoteForm.reset();
            document.querySelector('h2').textContent = 'Add New Note';
            document.querySelector('button[type="submit"]').textContent = 'Save Note';
            editingNoteId = null;
            colorOptions[0].click(); // Reset color selection
        }
    }
}

function renderNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm) || 
        note.content.toLowerCase().includes(searchTerm)
    );
    
    notesContainer.innerHTML = '';
    
    if (filteredNotes.length === 0) {
        const noNotesMessage = document.createElement('div');
        noNotesMessage.className = 'no-notes';
        noNotesMessage.textContent = searchTerm 
            ? 'No notes found matching your search.' 
            : 'No notes yet. Create your first note!';
        notesContainer.appendChild(noNotesMessage);
        return;
    }
    
    filteredNotes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.style.backgroundColor = note.color;
        
        noteElement.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
            </div>
            <p>${note.content}</p>
            <div class="note-timestamp">
                Created: ${formatDate(note.createdAt)}
                ${note.updatedAt !== note.createdAt ? `<br>Updated: ${formatDate(note.updatedAt)}` : ''}
            </div>
            <div class="note-actions">
                <button class="btn btn-info btn-small" onclick="editNote('${note.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteNote('${note.id}')">Delete</button>
            </div>
        `;
        
        notesContainer.appendChild(noteElement);
    });
}

// Make functions available globally
window.editNote = editNote;
window.deleteNote = deleteNote;