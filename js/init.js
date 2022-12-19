// Path: js\init.js
(function ($) {
  $(function () {

    $('.sidenav').sidenav()

  }) // end of document ready
})(jQuery) // end of jQuery name space

// custom element for the site header
class SiteNav extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    this.innerHTML = `
    <div class="navbar-fixed hide-on-small-and-down">
      <nav class="light-blue lighten-1" role="navigation">
        <div class="nav-wrapper container"><a id="logo-container" href="/" class="brand-logo"><img src="/css/graphics/logo_clear.png" height="64" alt=""></a>
          <ul class="right hide-on-med-and-down">
            <li><a href="/entry.html">Entry</a></li>
            <ul style="margin-left: 2em;">
                <li><a href="/entry.html">Basic Facts <i class="material-icons right">snippet_foldere</i></a></li>
                <li><a href="/fieldnotes.html">Scratch Notes <i class="material-icons right">edit_note</i></a></li>
                <li><a href="/fieldnotes.html">Media <i class="material-icons right">add_a_photo</i></a></li>
            </ul>
            <li><a href="/dashboard.html">Previous Entries <i class="material-icons right">border_color</i></a></li>
            <li><a href="/about.html">About <i class="material-icons right">question_answer</i></a></li>
          </ul>
        </div>
      </nav>
    </div>
    <nav class="light-blue lighten-1 hide-on-med-and-up" role="navigation">
      <div class="nav-wrapper container"><a id="logo-container" href="/" class="brand-logo"><img src="/css/graphics/logo_clear.png" height="64" alt=""></a>
        <ul class="right hide-on-med-and-down">
          <li><a href="/entry.html">Entry</a></li>
          <ul style="margin-left: 2em;">
              <li><a href="/entry.html">Basic Facts <i class="material-icons right">snippet_foldere</i></a></li>
              <li><a href="/fieldnotes.html">Scratch Notes <i class="material-icons right">edit_note</i></a></li>
              <li><a href="/fieldnotes.html">Media <i class="material-icons right">add_a_photo</i></a></li>
          </ul>
          <li><a href="/dashboard.html">Previous Entries <i class="material-icons right">border_color</i></a></li>
          <li><a href="/about.html">About <i class="material-icons right">question_answer</i></a></li>
        </ul>
        <ul id="nav-mobile" class="sidenav">
          <li><a href="/entry.html">Entry</a></li>
          <ul style="margin-left: 2em;">
              <li><a href="/entry.html">Basic Facts <i class="material-icons right">snippet_foldere</i></a></li>
              <li><a href="/fieldnotes.html">Scratch Notes <i class="material-icons right">edit_note</i></a></li>
              <li><a href="/fieldnotes.html">Media <i class="material-icons right">add_a_photo</i></a></li>
          </ul>
          <li><a href="/dashboard.html">Previous Entries <i class="material-icons right">border_color</i></a></li>
          <li><a href="/about.html">About <i class="material-icons right">question_answer</i></a></li>
        </ul>
        <a href="#" data-target="nav-mobile" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      </div>
    </nav>
    `
  }
}
customElements.define('site-nav', SiteNav)

// custom element for the site footer
class SiteFooter extends HTMLElement {
  constructor() {
    super()
  }
  connectedCallback() {
    this.innerHTML = `
    <footer class="page-footer deep-purple hide-on-small-and-down">
    <div class="container">
      <div class="row">
        <div class="col l6 s12">
          <h5 class="white-text">Company Bio</h5>
          <p class="grey-text text-lighten-4">We are a team of college students working on this project like it's our full time job. Any amount would help support and continue development on this project and is greatly appreciated.</p>
        </div>
        <div class="col l3 s12">
          <h5 class="white-text">Settings</h5>
          <ul>
            <li><a class="white-text" href="#!">Link 1</a></li>
            <li><a class="white-text" href="#!">Link 2</a></li>
            <li><a class="white-text" href="#!">Link 3</a></li>
            <li><a class="white-text" href="#!">Link 4</a></li>
          </ul>
        </div>
        <div class="col l3 s12">
          <h5 class="white-text">Connect</h5>
          <ul>
            <li><a class="white-text" href="#!">Link 1</a></li>
            <li><a class="white-text" href="#!">Link 2</a></li>
            <li><a class="white-text" href="#!">Link 3</a></li>
            <li><a class="white-text" href="#!">Link 4</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container">
      Saint Louis University
      </div>
    </div>
  </footer>
  <quick-actions></quick-actions>
  `
  }
}
customElements.define('site-footer', SiteFooter)

class quickActions extends HTMLElement {
  constructor() {
    super()
    addEventListener('wrUserKnown', event => {
        let user = event.detail.user
        if(user !== null){
            if(user.roles.administrator){

            }
        }
    })
  }
  connectedCallback() {
    this.innerHTML = `
    <div class="navbar-fixed hide-on-med-and-up">
    <nav class="light-blue lighten-1" role="navigation">
      <div class="nav-wrapper container">
        <ul class="center">
        </ul>
      </div>
    </nav>
    </div>
  `
  }
  addAction(label, icon, link) {
    const action = document.createElement('li')
    action.innerHTML = `<a href="${link}" title="${label}"><i class="material-icons">${icon}</i><span>${label}</span></a>`
    this.querySelector('ul').append(action)
  }
  removeAction(link) {
    $(`a[href="${link}"]`).parent().remove()
  }
}
customElements.define('quick-actions', quickActions)

class LrLogin extends HTMLElement {
    constructor() {
        super()
        let user = localStorage.getItem("wr-user")
        if (user !== null) {
            try {
                user = JSON.parse(user)
                this.setAttribute("wr-user", user["@id"])
                dispatchEvent(new CustomEvent('wrUserKnown', { detail: { user: user }, composed: true, bubbles: true }))
            } catch (err) {
                console.log("User identity reset; unable to parse ", localStorage.getItem("wr-user"))
                document.location.href="logout.html"
            }
        }
        if (this.hasAttribute("wr-user")) {
            //<a>${user.name}</a>
            this.innerHTML = `<a class="logout" title="${user.name}" href="logout.html">Logout</a>`
        } else {
            this.innerHTML = `
            <style>
            backdrop {
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9000;
                height: 93vh;
                background-color: rgba(7,42,12,1);
            }
            fieldset {
                background: #FFF;
                box-shadow: 0 0 0 2rem #FFF, .25rem .25rem 2rem 2rem #000;
                top: 15vh;
                position: relative;
            }

            </style>
            <backdrop class="is-full-screen">
            <form class="is-vertical-align is-horizontal-align">
            <fieldset>
            <legend>Enter User Details</legend>
            Username
            <input type="text" name="user" /> Password
            <input type="password" name="pwd" />
            <input type="submit" value="Login" />
            <input type="button" value="Forgot" disabled />    
            </fieldset>
            </form>
            </backdrop>`
            document.body.style.overflowY = 'hidden'
        }
    }
    connectedCallback() {
        try {
            let lrLogin = this
            lrLogin.querySelector('FORM').onsubmit = async function(event) {
                event.preventDefault()
                let data = new FormData(this)
                let userData = await login(lrLogin, data, event, false)
            }
        } catch (err) {
            // already logged in or other error
            // TODO: focus this catch
        }
    }
}
customElements.define("lr-login", LrLogin)

class LrNotifier extends HTMLElement {
    constructor() {
        super()
        let user = localStorage.getItem("wr-user")
        if (!user) {
            return
        }
        let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
        if(allNotes){
          this.innerHTML = `<label class="notesAvailable"> <i class="material-icons">chat</i>${allNotes.length}</label>`  
        }
    }
    connectedCallback() {
      /**
      * Catch user detection and trigger draw() for interfaces.
      */
      addEventListener('noteDataUpdated', event => {
        let allNotes = JSON.parse(sessionStorage.getItem("mobile_notes")) ?? []
        if(allNotes){
          this.innerHTML = `<label class="notesAvailable"> <i class="material-icons">chat</i>${allNotes.length}</label>`  
        }
      }, false)   
    }

    
}
customElements.define("lr-notifier", LrNotifier)

