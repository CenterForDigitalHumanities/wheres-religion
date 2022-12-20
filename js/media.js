const S3_URI_PREFIX = "https://livedreligion.s3.amazonaws.com/"
const S3_PROXY_PREFIX = "http://s3-proxy.rerum.io/S3/"

/**
 * User has chosen and confirmed the file.  Generate the on-screen preview.
 * @param {ChangeEvent} event
 */
function fileSelected(event) {
    const file = event.target.files[0]
    if (!file) { return }
    let fileSize = (file.size > 1024 * 1024)
        ? (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB'
        : (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB'

    mediaPreview.querySelector('.fileName').innerHTML = `Name: ${file.name}`
    mediaPreview.querySelector('.fileSize').innerHTML = `Size: ${fileSize}`
    mediaPreview.querySelector('.fileType').innerHTML = `Type: ${file.type}`

    let elementType
    switch (file.type.split("/")[0]) {
        case "image": elementType = "img"
            break
        case "video": elementType = "video"
            break
        case "audio": elementType = "audio"
            break
        default: elementType = "object"
    }
    const reader = new FileReader()
    reader.onload = (e) => {
        preview.innerHTML = elementType === "img"
            ? `<img class="preview" src="${e.target.result}" alt="Captured Image" />`
            : `<${elementType} class="preview" controls><source src="${e.target.result}" type="${file.type}" </source></${elementType}>`
    }
    reader.readAsDataURL(file)
}
/**
 * One of the big div wrapped icons with text was clicked
 * The clickable element is actually a hidden input.
 * If the thing clicked was not the hidden input, click the hidden input.
 * @param {string} which - "camera" or "recorder"
 * @param {ClickEvent} event
*/
function mediaCapture(which, event) {
    if (event.target.tagName === "INPUT") {
        return
    }
    event.preventDefault()
    event.stopPropagation()
    if (which === "camera") {
        mic_media.classList.remove("selected")
        cam_media.classList.add("selected")
        cam_media.click()
    }
    else {
        cam_media.classList.remove("selected")
        mic_media.classList.add("selected")
        mic_media.click()
    }
}

/**
 * The user would like to re-capture the same media type as the thing already captured.
 * This needs to reset the media preview, and open the camera or mic for recapture.
*/
function mediaRecapture() {
    const chosen = document.querySelector("input.selected")
    if (!chosen) { return }
    uploadCancelled("Recapture media chosen")
    chosen.click()
}

/**
 * The upload button was clicked.  Upload the file from the selected input.
 */
function uploadFile() {
    mediaPreview.querySelector('.mediastatus').innerHTML = "Uploading, please wait..."
    const file = document.querySelector("input.selected").files[0]
    let data = new FormData()
    data.append('file', file)
    fetch(S3_PROXY_PREFIX + "uploadFile", {
        method: "POST",
        mode: "cors",
        body: data
    })
    .then(resp => {
        console.log("Got the response from the upload file servlet");
        if (resp.ok) { return uploadComplete(resp.headers.get("Location")) }
        resp.text().then(text => uploadFailed(text))
    })
    .catch(err => {
        console.error(err)
        uploadFailed(err)
    })
}

/**
 * Query for all the notes in the user's notes queue and paginate them.
 */
async function getMediaInQueue() {
    let user = JSON.parse(localStorage.getItem("wr-user"))
    if (!user || !user["@id"]) {
        //alert("You must be logged in to submit a note")
        localStorage.removeItem("wr-user")
        //sessionStorage.removeItem("mobile_notes")
        return
    }
    let allMedia = JSON.parse(sessionStorage.getItem("associated_media")) ?? []
    if(allMedia.length){
        let mediaString = ""
        allMedia.forEach(mediaObj => {
            let uri = mediaObj.body.associatedMedia.items[0]
            mediaString +=
            `
                <li id=${mediaObj.id} class="collection-item">
                    ${uri > 50 ? uri.substring(0, 50)+"..." : uri}
                    <i title="Tap here to remove this note." onclick="removeMedia('${mediaObj["id"]}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
                </li>
            `    
        })
        sessionStorage.setItem("associated_media", JSON.stringify(allMedia))
        addedMedia.innerHTML = mediaString   
    }
    else{
        sessionStorage.setItem("associated_media", "[]")
    }
}

/**
 * The upload button was clicked.  Upload the file from the selected input.
 */
function storeLocalMediaAssertion(uri) {
    // Prepare a local 
    let user = JSON.parse(localStorage.getItem("wr-user"))
    if (!user || !user["@id"]) {
        localStorage.removeItem("wr-user")
        return
    }
    let t = location.hash ? location.hash.slice(1) : "will be assigned later"
    let mediaObj = JSON.parse(sessionStorage.getItem("associated_media")) ?? {
        "@context": "http://lived-religion.rerum.io/deer-lr/vocab/context.json",
        "id" : Date.now(),
        "type": "Annotation",
        "motivation": "supplementing"
        "target": t,
        "body": {
            "associatedMedia": {
                "@type": "Set",
                "items": []
            }
        },
        "creator": user["@id"],
    }
    mediaObj.body.associatedMedia.items.push(uri)
    let mediaArray = JSON.parse(sessionStorage.getItem("associated_media")) ?? []
    mediaArray.push(mediaObj)
    sessionStorage.setItem("associated_media", JSON.stringify(mediaArray))
    addedMedia.innerHTML +=
    `
        <li id=${mediaObj.id} class="collection-item">
            ${uri > 50 ? uri.substring(0, 50)+"..." : uri}
            <i title="Tap here to remove this note." onclick="removeMedia('${mediaObj.id}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
        </li>
    `
    dispatchEvent(new CustomEvent('mediaDataUpdated', { detail: mediaObj, composed: true, bubbles: true })) 
}

/**
 * Remove the "Note Notification" from the queue.
 * Remove the HTML <li> element for this note, and remove it from cache. 
 * @param {string} noteID - A unique string (probably a URI) that relates to an HTMLElement 'id' attribute
 */
function removeMedia(mediaID) {
    let mediaArray = JSON.parse(sessionStorage.getItem("associated_media")) ?? []
    mediaArray = mediaArray.filter(obj => obj["id"] !== mediaID)
    document.getElementById(mediaID).remove()
    sessionStorage.setItem("associated_media", JSON.stringify(mediaArray))
    dispatchEvent(new CustomEvent('mediaDataUpdated', { detail: mediaArray, composed: true, bubbles: true })) 
}

/**
 * The file upload was successful.
 * @param {string} uri - The URI of the uploaded item
 */
function uploadComplete(uri) {
    mediaPreview.querySelector('.mediastatus').innerHTML = "Upload Complete!"
    storeLocalMediaAssertion(uri,)
}

/**
 * The file upload failed.  Tell the user
 */
function uploadFailed(message = "Upload Failed.") {
    mediaPreview.querySelector('.mediastatus').innerHTML = message
}

/**
 * The file upload was cancelled.  RESET.
 */
function uploadCancelled(message = "Upload Cancelled ☹") {
    mediaPreview.querySelector('.fileName').replaceChildren()
    mediaPreview.querySelector('.fileSize').replaceChildren()
    mediaPreview.querySelector('.fileType').replaceChildren()
    mediaPreview.querySelector('.mediastatus').innerHTML = message
    setTimeout(() => {
        mediaPreview.querySelector('.mediastatus').replaceChildren()
    }, 3000)
    document.querySelector("input.selected")?.classList.remove("selected")
    preview.replaceChildren()
}
