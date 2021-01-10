const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

const getSurface = (canvasId, vertFName, fragFName) => {
	// get context
	const canvas = document.getElementById(canvasId);
	const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	if(gl == null) {
		console.error("Couldn't load WebGL");
	}

	const fetchSource = function(fname) {
		let oReq = new XMLHttpRequest();
		let resp = '';
		const reqListener = function() { resp = this.responseText; }
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", fname, false);
		oReq.send();
		return resp;
	}

	// load & compile vertex shader
	const vShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vShader, fetchSource(vertFName));
	gl.compileShader(vShader);
	if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
			console.log(gl.getShaderInfoLog(vShader));
			console.error("Couldn't compile vertex shader");
	}

	// load & compile fragment shader
	const fShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fShader, fetchSource(fragFName));
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

	console.log(gl.getProgramInfoLog(shaderProgram));
	return {canvas: canvas, gl: gl, program: shaderProgram};
}

const main =  getSurface('main-canvas',  'vert.glsl', 'frag.glsl');
const lower = getSurface('lower-canvas', 'vert.glsl', 'frag.glsl');

let currentFrame = 0;
const renderWrapper = () => {
	render(currentFrame);

	currentFrame += 1;
	window.requestAnimationFrame(renderWrapper);
};

// misc
const resize = (surface) => {
	surface.canvas.width  = surface.canvas.getBoundingClientRect().width;
	surface.canvas.height = surface.canvas.getBoundingClientRect().height;
	surface.gl.viewport(0, 0, surface.canvas.width, surface.canvas.height);
	surface.redraw = true;
}

window.addEventListener('resize', () => {
	resize(main);
	resize(lower);
});

window.addEventListener('load', () => {
	setup(main);
	setup(lower);
	resize(main);
	resize(lower);
	window.requestAnimationFrame(renderWrapper);
});

let drag = true;
let leftSelVal = 0.4, rightSelVal = 0.6;
let selChange = true;
lower.canvas.addEventListener('mousedown', (ev) => {
	const v = ev.clientX / lower.canvas.width;
	drag = Math.abs(leftSelVal - v) < Math.abs(rightSelVal - v) ? 'left' : 'right';
});
lower.canvas.addEventListener('mousemove', (ev) => {
	const v = ev.clientX / lower.canvas.width;
	if(drag == 'left' && v < rightSelVal) {
		main.redraw = true;
		leftSelVal = v;
		document.getElementById('overlay-left').style.width = `${v*100}%`;
	}
	if(drag == 'right' && leftSelVal < v) {
		main.redraw = true;
		rightSelVal = v;
		document.getElementById('overlay-right').style.width = `${(1-v)*100}%`;
	}
});
lower.canvas.addEventListener('mouseup', (ev) => {
	drag = null;
});
lower.canvas.addEventListener('mouseleave', (ev) => {
	drag = null;
});

const map = (x, begin, end) => begin + x * (end-begin);

//let isKeyPressed = [];
//window.addEventListener('keydown', ev => isKeyPressed[ev.keyCode] = true);
//window.addEventListener('keyup',   ev => isKeyPressed[ev.keyCode] = false);
