document.addEventListener('DOMContentLoaded', () => {
    tinymce.init({
        selector: "#notepad-text"
    });

    const textarea = document.getElementById('notepad-text');
    const saveButton = document.getElementById('save-button');

    saveButton.addEventListener('click', () => {
        const text = textarea.value;
        alert(`Zapisano treść:\n\n${text}`);
    });
});
