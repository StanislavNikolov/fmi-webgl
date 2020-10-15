// get context
const canvas = document.getElementById('main-canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if(gl == null) {
	alert("Couldn't load WebGL");
}

// load & compile vertex shader
const vShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vShader, document.getElementById('vshader').innerText);
gl.compileShader(vShader);
if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
	alert("Couldn't compile vertex shader");
}

// load & compile fragment shader
const fShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fShader, document.getElementById('fshader').innerText);
gl.compileShader(fShader);
if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
	alert("Couldn't compile fragment shader");
}

// link together
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vShader);
gl.attachShader(shaderProgram, fShader);
gl.linkProgram(shaderProgram);
if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	alert(gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

// misc
const resize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, canvas.width, canvas.height);
	render(); // should be defined already, for example from main.js
}
window.addEventListener('resize', resize);
window.addEventListener('load', () => {
	setup();
	resize();
});
