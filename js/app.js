async function login(loginWidget, data, submitEvent){
    let authenticatedUser = await fetch('http://lived-religion.rerum.io/deer-lr/login', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            username: data.get("user"),
            password: data.get("pwd")
        })
    })
    .then(res =>{
        if(res.ok){
            return res.json()
        }
        else{
            //TODO maybe handle special?  
            throw new Error("There was a server error logging in.")
            return {}
        }
    })
    .catch(err => {
        console.error(err)
        return {}
    })
    
    if (authenticatedUser && authenticatedUser["@id"]) {
        localStorage.setItem("lr-user", JSON.stringify(authenticatedUser))
        document.location.reload() 
    } 
    else {
        localStorage.removeItem("lr-user")
        alert("There was a problem logging in.  Check the username and password.  If this problem persist, contact the administrator to reset your username and/or password.")
    }
}

/**
 * Remove a user from Session storage on the back end and localStorage on the front end. 
 * Broadcast the logout across tabs. 
 */
async function logout(){
    fetch('http://lived-religion.rerum.io/deer-lr/logout', {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'text/plain'
        }
    })
    .then(res =>{
        if(res.ok){
            localStorage.removeItem("lr-user")
        }
        else{
            //TODO maybe handle special?  Something didn't work right, but we can still clear them from localStorage
            localStorage.removeItem("lr-user")
        }
    })
    .catch(err =>{
        localStorage.removeItem("lr-user")
    })
    
}