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
          <li><a href="/dashboard.html">Dashboard<i class="material-icons right">speed</i></a></li>
          <li><a href="/entry.html">Entry<i class="material-icons right">snippet_folder</i></a></li>
          <li><a href="/fieldnotes.html">Fieldnotes<i class="material-icons right">edit_note</i></a></li>
        </ul>
        <ul id="nav-mobile" class="sidenav">
          <li><a href="/dashboard.html"><i class="material-icons">speed</i>Dashboard</a></li>
          <li><a href="/entry.html"><i class="material-icons">snippet_folder</i>Entry</a></li>
          <li><a href="/fieldnotes.html"><i class="material-icons">edit_note</i>Fieldnotes</a></li>
        </ul>
        <a href="#" data-target="nav-mobile" class="sidenav-trigger"><i class="material-icons">menu</i></a>
      </div>
    </nav>
    </div>
    <nav class="light-blue lighten-1 hide-on-med-and-up" role="navigation">
      <div class="nav-wrapper container"><a id="logo-container" href="/" class="brand-logo"><img src="/css/graphics/logo_clear.png" height="64" alt=""></a>
        <ul class="right hide-on-med-and-down">
          <li><a href="/dashboard.html">Dashboard<i class="material-icons right">speed</i></a></li>
          <li><a href="/entry.html">Entry<i class="material-icons right">snippet_folder</i></a></li>
          <li><a href="/fieldnotes.html">Fieldnotes<i class="material-icons right">edit_note</i></a></li>
        </ul>
        <ul id="nav-mobile" class="sidenav">
          <li><a href="/dashboard.html"><i class="material-icons">speed</i>Dashboard</a></li>
          <li><a href="/entry.html"><i class="material-icons">snippet_folder</i>Entry</a></li>
          <li><a href="/fieldnotes.html"><i class="material-icons">edit_note</i>Fieldnotes</a></li>
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
  }
  connectedCallback() {
    this.innerHTML = `
    <div class="navbar-fixed hide-on-med-and-up">
    <nav class="light-blue lighten-1" role="navigation">
      <div class="nav-wrapper container">
        <ul class="center">
          <li><a href="/dashboard.html"><i class="material-icons left">speed</i></a></li>
        </ul>
      </div>
    </nav>
    </div>
  `
  }
  addAction(label, icon, link) {
    const action = document.createElement('li')
    action.innerHTML = `<a href="${link}" title="${label}"><i class="material-icons left">${icon}</i></a>`
    this.querySelector('ul').append(action)
  }
  removeAction(link) {
    $(`a[href="${link}"]`).parent().remove()
  }
}
customElements.define('quick-actions', quickActions)