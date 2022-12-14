
/**
 * Query for all the notes in the user's notes queue and paginate them.
 */
async function getNotesInQueue() {
    let user = JSON.parse(localStorage.getItem("wr-user"))
    if (!user || !user["@id"]) {
        //alert("You must be logged in to submit a note")
        localStorage.removeItem("wr-user")
        localStorage.removeItem("mobile_notes")
        return
    }
    const historyWildcard = {"$exists":true, "$size":0}
    let queryObj = {
        "type": "MobileNote",
        "target": user["@id"],
        "__rerum.history.next": historyWildcard
    }
    let allNotes = await fetch('http://tinydev.rerum.io/app/query', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(queryObj)
    })
    .then(resp => resp.json())
    .catch(err => {return []})
    if(allNotes){
        let notesString = ""
        allNotes.forEach(noteObject => {
            notesString +=
            `
                <li id=${noteObject["@id"]} class="collection-item">
                    ${noteObject.value.length > 50 ? noteObject.value.substring(0, 50)+"..." : noteObject.value}
                    <i title="Tap here to remove this note." onclick="removeNote('${noteObject["@id"]}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
                </li>
            `    
        })
        sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
        addedNotes.innerHTML = notesString   
    }
    else{
        sessionStorage.setItem("mobile_notes", "[]")
    }
}

/**
 * Add the "Note Notification" to the queue.
 * Add the HTML <li> element for this note, and add it to cache. 
 */
async function submitNote() {
    if (!notes || !notes.value) {
        return
    }
    let user = JSON.parse(localStorage.getItem("wr-user"))
    if (!user || !user["@id"]) {
        alert("You must be logged in to submit a note")
        localStorage.removeItem("wr-user")
        localStorage.removeItem("mobile_notes")
        return
    }
    // My bucket is all notes targeted at me.  Presumably, these are all the notes I have added.
    // They are Experience agnostic?  Can I send a note to myself and assign it to any experience?
    // Since it targets me, maybe 'creator' would be better?
    // What type should this be?
    // Should it have a label/will we let users provide a label?
    // Note the time it was created will already be noted in __rerum.createdAt
    let noteObject = {
        "type": "MobileNote",
        "value": notes.value,
        "target":user["@id"]
    }
    /**
     * Note we are trying to use the Lived Religion Web App API.  
     * That API needs to be CORS friendly to this companion app.
     * TODO: Make the Lived Religion web app API check if the user is logged in before doing server stuff?
     */
    const newNote = await fetch("http://tinydev.rerum.io/app/create", {
        method: "POST",
        mode: "cors",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(noteObject)
    })
    .then(response => response.json())
    .then(data => data["new_obj_state"])
    .catch(err => {return err})

    if(newNote && newNote["@id"]){
        let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
        allNotes.push(newNote)
        sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
        addedNotes.innerHTML +=
            `
            <li id=${newNote["@id"]} class="collection-item">
                ${notes.value.length > 50 ? notes.value.substring(0, 50)+"..." : notes.value}
                <i title="Tap here to remove this note." onclick="removeNote('${newNote["@id"]}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
            </li>
        `
        notes.value = ""      
    }
    else{
        console.error("Could not save note.  See log below")
        console.log(newNote)
    }
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
async function removeNote(noteID) {
    /**
     * Is this only something you can do from the desktop site?? Not sure if we will offer this. 
     */
    let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
    allNotes = allNotes.filter(obj => obj["@id"] !== noteID)
    document.getElementById(noteID).remove()
    sessionStorage.setItem("mobile_notes", JSON.stringify(allNotes))
}
