// it's the wild west in here. Any file/class/function can use those for whatever it wants

let currentFrame = 0;
let CADStarted = false;

let surfaces = [];
let activeSurface = null;

let isKeyPressed = []; // read only, except by this file

let scene = null; // read only, except by cad.js

window.addEventListener('keydown', ev => isKeyPressed[ev.keyCode] = true);
window.addEventListener('keyup',   ev => isKeyPressed[ev.keyCode] = false);