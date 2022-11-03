function submitNote(event){
	let noteObject = {
		"id" : "note_"+Date.now(),
		"type" : "MobileNote",
		"value" : notes.value
	}
	let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
	allNotes.push(noteObject)
	sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
    let noteitemhtml =
    `<li id=${noteObject.id} class="collection-item">
        <div>
            ${notes.value.length > 50 ? notes.value.substring(0, 50)+"..." : notes.value}
            <i title="Tap here to remove this note." onclick="removeNote('${noteObject.id}')" class="material-icons small dropdown-trigger red-text">remove_circle</i>
        </div>
    </li>`
	addedNotes.innerHTML += noteitemhtml
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