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
	constructor(glcanvasId, tcanvasId, vertFName, fragFName, targetImage) {
		this.tcanvas = document.getElementById(tcanvasId);
		this.tcontext = this.tcanvas.getContext('2d');
		this.targetImage = targetImage;

		// get context
		this.glcanvas = document.getElementById(glcanvasId);
		this.gl = this.glcanvas.getContext('webgl') || this.glcanvas.getContext('experimental-webgl');
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
		this.glcanvas.width  = this.glcanvas.clientWidth;
		this.glcanvas.height = this.glcanvas.clientHeight;
		this.tcanvas.width  = this.tcanvas.clientWidth;
		this.tcanvas.height = this.tcanvas.clientHeight;
		this.gl.viewport(0, 0, this.glcanvas.width, this.glcanvas.height);
		this.drawTargetImage();
	}

	drawTargetImage() {
		const scale = Math.min(this.tcanvas.width, this.tcanvas.height)
			/ Math.min(this.targetImage.width, this.targetImage.height);

		const dw = this.targetImage.width * scale;
		const dh = this.targetImage.height * scale;
		const x = (this.tcanvas.width - dw) / 2;
		const y = (this.tcanvas.height - dh) / 2;
		this.tcontext.drawImage(this.targetImage, x, y, dw, dh);
	}
}
