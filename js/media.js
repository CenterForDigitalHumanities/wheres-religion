const S3_URI_PREFIX = "https://livedreligion.s3.amazonaws.com/"
const S3_PROXY_PREFIX = "http://s3-proxy.rerum.io/S3/"

/**
 * User has chosen and confirmed the file.  Generate the on-screen preview.
 * @param {ChangeEvent} event
 */
function fileSelected(event) {
    let file = event.target.files[0]
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
function mediaCapture(which, event){
    if(event.target.tagName==="INPUT"){
        return
    }
    event.preventDefault()
    event.stopPropagation()
    if(which === "camera"){
        mic_media.classList.remove("selected")
        cam_media.classList.add("selected")
        cam_media.click()
    }
    else{
        cam_media.classList.remove("selected")
        mic_media.classList.add("selected")
        mic_media.click()
    }
}

/**
 * The user would like to re-capture the same media type as the thing already captured.
 * This needs to reset the media preview, and open the camera or mic for recapture.
*/
function mediaRecapture(){
    let chosen = document.querySelector("input.selected")
    uploadCancelled("Recapture media chosen")
    chosen.click()
    return
}

/**
 * The upload button was clicked.  Upload the file from the selected input.
 */
function uploadFile(){
    mediaPreview.querySelector('.mediastatus').innerHTML = "Uploading, please wait..."
    let file = document.querySelector("input.selected").files[0]
    var data = new FormData()
    data.append('file', file)
    fetch(S3_PROXY_PREFIX+"uploadFile", {
        method: "POST",
        mode: "cors",
        body: data
    })
    .then(resp => {
        console.log("Got the response from the upload file servlet");
        if(resp.ok) uploadComplete(resp.headers.get("Location"))
        else resp.text().then(text => uploadFailed(text))
    })
    .catch(err => {
        console.error(err)
        uploadFailed(err)
    })
}


/**
 * The file upload was successful.
 * @param {string} uri - The URI of the uploaded item
 */
function uploadComplete(uri){
    mediaPreview.querySelector('.mediastatus').innerHTML = "Upload Complete!"
    //mediaPreview.querySelector(".preview").setAttribute("src", uri)
}

/**
 * The file upload failed.  Tell the user
 */
function uploadFailed(message="Upload Failed."){
    mediaPreview.querySelector('.mediastatus').innerHTML = message
}

/**
 * The file upload was cancelled.  RESET.
 */
function uploadCancelled(message="Upload Cancelled ;(") {
    mediaPreview.querySelector('.fileName').innerHTML = ""
    mediaPreview.querySelector('.fileSize').innerHTML = ""
    mediaPreview.querySelector('.fileType').innerHTML = ""
    mediaPreview.querySelector('.mediastatus').innerHTML = message
    setTimeout(() => {
        mediaPreview.querySelector('.mediastatus').innerHTML=""
    }, 3000)
    document.querySelector("input.selected")?.classList.remove("selected")
    preview.innerHTML = ""
}
