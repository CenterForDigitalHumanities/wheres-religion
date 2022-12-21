const S3_URI_PREFIX = "https://livedreligion.s3.amazonaws.com/"
const S3_PROXY_PREFIX = "http://s3-proxy.rerum.io/S3/"
const successCallback = (position) => {
  console.log(position)
  user_location = [position.coords.longitude, position.coords.latitude]
  yourLocation.innerHTML = `Your Position (long, lat): [${position.coords.longitude}, ${position.coords.latitude}]`
  yourLocation.removeAttribute("hidden")
  return position
}
const errorCallback = (error) => {
  console.error(error)
  return
}
let user_location = navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
let file_location

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}
/**
 * User has chosen and confirmed the file.  Generate the on-screen preview.
 * @param {ChangeEvent} event
 */
async function fileSelected(event) {
    const file = event.target.files[0]
    EXIF.getData(file, function () {
        const myData = this
        if(myData?.exifdata?.GPSLatitude?.length){
            // get latitude from exif data and calculate latitude decimal
            const latDegree = myData.exifdata.GPSLatitude[0].valueOf()
            const latMinute = myData.exifdata.GPSLatitude[1].valueOf()
            const latSecond = myData.exifdata.GPSLatitude[2].valueOf()
            const latDirection = myData.exifdata.GPSLatitudeRef
            const latFinal = ConvertDMSToDD(latDegree, latMinute, latSecond, latDirection)

            // get longitude from exif data and calculate longitude decimal
            const lonDegree = myData.exifdata.GPSLongitude[0].valueOf()
            const lonMinute = myData.exifdata.GPSLongitude[1].valueOf()
            const lonSecond = myData.exifdata.GPSLongitude[2].valueOf()
            const lonDirection = myData.exifdata.GPSLongitudeRef
            const lonFinal = ConvertDMSToDD(lonDegree, lonMinute, lonSecond, lonDirection)
            file_location = [lonFinal, latFinal]

            //Link out to google or something else?  Activate a 'pin on the map' UI?
            //mediaPreview.querSelector(.'map-link').innerHTML = '<a href="http://www.google.com/maps/place/'+site[1]+','+site[0]+'" target="_blank">Google Maps</a>
            mediaPreview.querySelector('.fileCoords').innerHTML = `File Location (long, lat): [${file_location[0]}, ${file_location[1]}]`
        }
        if(myData.lastModifiedDate){
            mediaPreview.querySelector('.fileTime').innerHTML = `Captured On: ${myData.lastModifiedDate}]`   
        }
        
    })
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
    const user = JSON.parse(localStorage.getItem("wr-user"))
    if (!user || !user["@id"]) {
        //alert("You must be logged in to submit a note")
        //localStorage.removeItem("wr-user")
        //sessionStorage.removeItem("mobile_notes")
        //sessionStorage.removeItem("associated_media")
        return
    }
    let mediaObj = JSON.parse(sessionStorage.getItem("associated_media")) ?? 
    {
      "body":{
        "associatedMedia":{
           "items" : []
        }
      }
    }
    let mediaString = ""
    mediaObj.body.associatedMedia.items.forEach(uri => {
        let filename = uri.replace("https://livedreligion.s3.amazonaws.com/", "")
        mediaString +=
        `
            <li id="${uri}" class="collection-item">
                ${filename > 50 ? filename.substring(0, 50)+"..." : filename}
                <i title="Tap here to remove this note." onclick="removeMedia('${uri}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
            </li>
        `    
    })
    addedMedia.innerHTML = mediaString   
}

/**
 * The upload button was clicked.  Upload the file from the selected input.
 */
function storeLocalMediaAssertion(uri) {
    // Prepare a local 
    const user = JSON.parse(localStorage.getItem("wr-user"))
    const filename = uri.replace("https://livedreligion.s3.amazonaws.com/", "")
    if (!user || !user["@id"]) {
        //localStorage.removeItem("wr-user")
        //sessionStorage.removeItem("mobile_notes")
        //sessionStorage.removeItem("associated_media")
        return
    }
    let t = location.hash ? location.hash.slice(1) : "will be assigned later"
    let mediaObj = JSON.parse(sessionStorage.getItem("associated_media")) ?? {
        "@context": "http://lived-religion.rerum.io/deer-lr/vocab/context.json",
        "id" : Date.now(),
        "type": "Annotation",
        "motivation": "supplementing",
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
    sessionStorage.setItem("associated_media", JSON.stringify(mediaObj))
    addedMedia.innerHTML +=
    `
        <li id="${uri}" class="collection-item">
            ${filename.length > 50 ? filename.substring(0, 50)+"..." : filename}
            <i title="Tap here to remove this note." onclick="removeMedia('${uri}')" class="material-icons small dropdown-trigger red-text secondary-content">delete_forever</i>
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
    let mediaObj = JSON.parse(sessionStorage.getItem("associated_media")) ?? 
    {
      "body":{
        "associatedMedia":{
           "items" : []
        }
      }
    }
    let mediaArray = mediaObj.body.associatedMedia.items
    mediaObj.body.associatedMedia.items = mediaArray.filter(uri => uri !== mediaID)
    document.getElementById(mediaID).remove()
    sessionStorage.setItem("associated_media", JSON.stringify(mediaObj))
    dispatchEvent(new CustomEvent('mediaDataUpdated', { detail: mediaObj, composed: true, bubbles: true })) 
}

/**
 * The file upload was successful.
 * @param {string} uri - The URI of the uploaded item
 */
function uploadComplete(uri) {
    mediaPreview.querySelector('.mediastatus').innerHTML = "Upload Complete!"
    storeLocalMediaAssertion(uri)
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
