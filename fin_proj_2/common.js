const FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;

const fetchSource = function(fname) {
	let oReq = new XMLHttpRequest();
	let resp = '';
	const reqListener = function() { resp = this.responseText; }
	oReq.addEventListener("load", reqListener);
	oReq.open("GET", fname, false);
	oReq.send();
	return resp;
}

class Camera {
	constructor() {
		this.pos = [0,1,0];
		this.rotX = 0; // 360 deg
		this.rotY = Math.PI / 2; // 180 deg - "ground" to "sky"

		this.lookDir = [];
		this.calcLookDir();
	}

	calcLookDir() {
		this.lookDir = [
			Math.sin(this.rotY) * Math.sin(this.rotX),
			Math.cos(this.rotY),
			- Math.sin(this.rotY) * Math.cos(this.rotX)
		];
	}

	rotDX(dx) {
		this.rotX += dx;
		this.calcLookDir();
	}
	rotDY(dy) {
		this.rotY += dy;
		if(this.rotY > Math.PI) this.rotY = Math.PI;
		if(this.rotY < 0.001)   this.rotY = 0.001;
		this.calcLookDir();
	}
	/*
	moveForward(distance) {
		this.pos[0] += this.lookDir[0] * distance;
 		this.pos[1] += this.lookDir[1] * distance;
		this.pos[2] += this.lookDir[2] * distance;
	}
	*/
	moveForward(distance) {
		this.pos[0] += this.lookDir[0] * distance;
		this.pos[2] += this.lookDir[2] * distance;
	}
	moveRight(distance) {
		this.pos[0] += -this.lookDir[2] * distance;
		this.pos[2] +=  this.lookDir[0] * distance;
	}
}

class Surface {
	constructor(canvasId, vertFName, fragFName) {
		// get context
		this.canvas = document.getElementById(canvasId);
		this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
		if(this.gl == null) {
			console.error("Couldn't load WebGL");
		}

		// load & compile vertex shader
		const vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
		this.gl.shaderSource(vShader, fetchSource(vertFName));
		this.gl.compileShader(vShader);
		if(!this.gl.getShaderParameter(vShader, this.gl.COMPILE_STATUS)) {
				console.log(this.gl.getShaderInfoLog(vShader));
				console.error("Couldn't compile vertex shader");
		}

		// load & compile fragment shader
		const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
		this.gl.shaderSource(fShader, fetchSource(fragFName));
		this.gl.compileShader(fShader);
		if(!this.gl.getShaderParameter(fShader, this.gl.COMPILE_STATUS)) {
				console.log(this.gl.getShaderInfoLog(fShader));
				console.error("Couldn't compile fragment shader");
		}

		// link together
		this.program = this.gl.createProgram();
		this.gl.attachShader(this.program, vShader);
		this.gl.attachShader(this.program, fShader);
		this.gl.linkProgram(this.program);
		if(!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			console.error(this.gl.getProgramInfoLog(this.program));
		}

		this.gl.useProgram(this.program);
		console.log(this.gl.getProgramInfoLog(this.program));

		this.cam = new Camera();
	}

	rescale() {
		//this.canvas.width  = this.canvas.getBoundingClientRect().width;
		//this.canvas.height = this.canvas.getBoundingClientRect().height;
		this.canvas.width  = this.canvas.clientWidth;
		this.canvas.height = this.canvas.clientHeight;
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}
}
