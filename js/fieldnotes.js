/**
 * Add the "Note Notification" to the queue.
 * Add the HTML <li> element for this note, and add it to cache. 
 */
function submitNote() {
    if (!notes || !notes.value) {
        return
    }
    let noteObject = {
        "id": "note_" + Date.now(),
        "type": "MobileNote",
        "value": notes.value
    }
    /**
     * async and save this "Note Notification" to the queue
     * then...
     */
    let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
    allNotes.push(noteObject)
    sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
    addedNotes.innerHTML +=
        `
		<li id=${noteObject.id} class="collection-item">
		    ${notes.value.length > 50 ? notes.value.substring(0, 50)+"..." : notes.value}
		    <i title="Tap here to remove this note." onclick="removeNote('${noteObject.id}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
		</li>
    `
    notes.value = ""
}

/**
 * Just the best, I'm keeping it.
 */
function cancelNote() {
    notes.value = ""
}

/**
 * Remove the "Note Notification" from the queue.
 * Remove the HTML <li> element for this note, and remove it from cache. 
 * @param {string} noteID - A unique string (probably a URI) that relates to an HTMLElement 'id' attribute
 */
function removeNote(noteID) {
    /**
     * async and clear this "Note Notification" from the queue
     * then...
     */
    let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ? ? []
    allNotes = allNotes.filter(obj => obj.id !== noteID)
    document.getElementById(noteID).remove()
    sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
}