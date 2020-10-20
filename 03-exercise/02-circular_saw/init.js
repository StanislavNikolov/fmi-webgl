const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

// get context
const canvas = document.getElementById('main-canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if(gl == null) {
	console.error("Couldn't load WebGL");
}

// load & compile vertex shader
const vShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vShader, document.getElementById('vshader').innerText);
gl.compileShader(vShader);
if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
	console.log(gl.getShaderInfoLog(vShader));
	console.error("Couldn't compile vertex shader");
}

// load & compile fragment shader
const fShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fShader, document.getElementById('fshader').innerText);
gl.compileShader(fShader);
if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
	console.log(gl.getShaderInfoLog(fShader));
	console.error("Couldn't compile fragment shader");
}

// link together
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vShader);
gl.attachShader(shaderProgram, fShader);
gl.linkProgram(shaderProgram);
if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	console.error(gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

let animated = false;

const animationLoop = () => {
	render();
	window.requestAnimationFrame(animationLoop);
};

// misc
const resize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, canvas.width, canvas.height);
	render();
}

window.addEventListener('resize', resize);
window.addEventListener('load', () => {
	setup();
	resize();
	if(animated) {
		window.requestAnimationFrame(animationLoop);
	}
});
