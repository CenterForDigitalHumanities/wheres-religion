async function login(loginWidget, data, submitEvent){
    let authenticatedUser = await fetch('login', {
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
        //There is an error in the sysend broadcaster because this CustomEvent cannot be cloned, so we cannot attach the lrUserKnown or similar events here.  Too bad, that would be neat.
        //local_socket.broadcast('loginFinished', {message:"Lived Religion Login", customEvent : new CustomEvent('lrUserKnown', { detail: { "user": authenticatedUser } })})
        
        //This simple object can be cloned and can be a part of the broadcast, so we can fire custom events in the local_socket event handlers
        local_socket.broadcast('loginFinished', {message:"Lived Religion Login", "user": authenticatedUser })
        //The socket does not fire on the page they are generated, so we are doing whatever UI logic is necessary here just like the socket handlers on the html pages
        document.location.reload() 
    } 
    else {
        localStorage.removeItem("lr-user")
        local_socket.broadcast('loginError', {message:"Login Error"})
        alert("There was a problem logging in.  Check the username and password.  If this problem persist, contact the administrator to reset your username and/or password.")
    }
}