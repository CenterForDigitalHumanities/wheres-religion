

function submitNote(event){
	let noteObject = {
		"id" : "note_"+Date.now(),
		"type" : "MobileNote",
		"value" : notes.value
	}
	let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
	allNotes.push(noteObject)
	sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
	let notehtml = 
	`<div class="addedNote" id="${noteObject.id}">
		<div class="noteSnippet" style="display: inline-block;"> ${notes.value.substring(0, 50)}... </div>
		<div onclick="removeNote('${noteObject.id}')" class="dropdown-trigger" style="display: inline-block;">
            <i title="Tap here to remove this note-to-self" class="material-icons small light-blue-text">cloud_upload</i>
        </div>
	</div>`
	addedNotes.innerHTML += notehtml
}

function cancelNote(event){
	notes.value = ""
}

function removeNote(noteID){
	let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
	allNotes = allNotes.filter(obj => obj.id !== noteID)
	document.getElementById(noteID).remove()
	sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
}