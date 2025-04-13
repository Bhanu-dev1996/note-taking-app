// DOM Elements
const addNoteForm = document.getElementById('add-note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const notesContainer = document.getElementById('notes-container');
const searchInput = document.getElementById('search');
const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
const colorOptions = document.querySelectorAll('.color-option');

// Variables
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let selectedColor = 'white';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Remove any saved theme preference
    localStorage.removeItem('theme');
    
    // Remove dark-theme class if it exists
    document.body.classList.remove('dark-theme');
    
    displayNotes();
    setupColorOptions();
    setupViewToggle();
    setupSearch();
});

addNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveNote();
});

// Functions
function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    const timestamp = new Date().toISOString();
    
    if (!title || !content) return;
    
    // Check if we're editing an existing note
    const editId = addNoteForm.dataset.editId;
    
    if (editId) {
        // Find the note to update
        const noteIndex = notes.findIndex(note => note.id === Number(editId));
        
        if (noteIndex !== -1) {
            // Update existing note
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                content,
                color: selectedColor,
                timestamp // Update timestamp to show it was edited
            };
        }
    } else {
        // Create new note
        const newNote = {
            id: Date.now(),
            title,
            content,
            color: selectedColor,
            timestamp
        };
        
        notes.push(newNote);
    }
    
    saveToLocalStorage();
    displayNotes();
    resetForm();
}

function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function displayNotes(notesToDisplay = notes) {
    // Clear notes container
    notesContainer.innerHTML = '';
    
    if (notesToDisplay.length === 0) {
        notesContainer.innerHTML = '<p class="no-notes">No notes yet. Create your first note!</p>';
        return;
    }
    
    // Get current view mode
    const currentView = document.querySelector('.view-toggle-btn.active').dataset.view;
    notesContainer.className = `notes-container ${currentView}-view`;
    
    // Create note elements
    notesToDisplay.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.dataset.id = note.id;
        noteElement.style.backgroundColor = note.color;
        
        // Calculate text color based on background brightness
        const isDarkColor = isColorDark(note.color);
        const textColor = isDarkColor ? '#ffffff' : '#212121';
        
        const formattedDate = new Date(note.timestamp).toLocaleString();
        const truncatedContent = note.content.length > 150 ? 
            note.content.substring(0, 150) + '...' : note.content;
        
        noteElement.innerHTML = `
            <div class="note-header" >
                <h3>${note.title}</h3>
                <div class="note-actions">
                    <a href="#" class="btn-edit" data-id="${note.id}" title="Edit note">
                        <i class="fas fa-edit"></i>
                    </a>
                    <a href="#" class="btn-delete" data-id="${note.id}" title="Delete note">
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
            </div>
            <div class="note-body" style="border-left: 4px solid ${note.color}">
                <p class="note-content">${truncatedContent}</p>
            </div>
            <div class="note-footer">
                <div class="note-metadata">
                    <i class="far fa-calendar-alt"></i>
                    <span class="note-date">${formattedDate}</span>
                </div>
                <div class="note-badge" style="background-color: ${note.color}"></div>
            </div>   
        `;
        
        notesContainer.appendChild(noteElement);
    });
    
    // Add event listeners to the links
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            deleteNote(e);
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior
            editNote(e);
        });
    });

    // Add click event to expand note content
    document.querySelectorAll('.note').forEach(note => {
        note.addEventListener('click', (e) => {
            // Only expand if not clicking on action buttons
            if (!e.target.closest('.btn-edit') && !e.target.closest('.btn-delete')) {
                note.classList.toggle('expanded');
            }
        });
    });
}

// Helper function to determine if a color is dark
function isColorDark(color) {
    // Default to false for white or transparent
    if (!color || color === 'white' || color === 'transparent') return false;
    
    // Convert hex to RGB
    let r, g, b;
    if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
    } else {
        return false; // For named colors just return false (assume light)
    }
    
    // Calculate perceived brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128; // Below 128 is considered dark
}

function deleteNote(e) {
    const id = Number(e.currentTarget.dataset.id);
    notes = notes.filter(note => note.id !== id);
    saveToLocalStorage();
    displayNotes();
}

function editNote(e) {
    const id = Number(e.currentTarget.dataset.id);
    const noteToEdit = notes.find(note => note.id === id);
    
    if (noteToEdit) {
        // Fill form with note data
        noteTitleInput.value = noteToEdit.title;
        noteContentInput.value = noteToEdit.content;
        
        // Set color option
        colorOptions.forEach(option => {
            if (option.dataset.color === noteToEdit.color) {
                option.classList.add('selected');
                selectedColor = noteToEdit.color;
            } else {
                option.classList.remove('selected');
            }
        });
        
        // Change form mode
        addNoteForm.querySelector('button[type="submit"]').textContent = 'Update Note';
        addNoteForm.dataset.editId = id;
    }
}

function resetForm() {
    noteTitleInput.value = '';
    noteContentInput.value = '';
    selectedColor = 'white';
    
    colorOptions.forEach(option => {
        if (option.dataset.color === 'white') {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    addNoteForm.querySelector('button[type="submit"]').textContent = 'Save Note';
    delete addNoteForm.dataset.editId;
}

function setupColorOptions() {
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            option.classList.add('selected');
            
            // Update selected color
            selectedColor = option.dataset.color;
        });
    });
}

function setupViewToggle() {
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update view
            displayNotes();
        });
    });
}

function setupSearch() {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredNotes = searchTerm ? 
            notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            ) : notes;
        
        displayNotes(filteredNotes);
    });
}