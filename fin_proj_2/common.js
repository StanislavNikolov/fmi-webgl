const r = Math.random;
const R = (x) => map(r(), -x, x);
const map = (x, begin, end) => begin + x * (end-begin);
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
		const MAX = Math.PI * 0.99;
		const MIN = Math.PI * 0.01;
		if(this.rotY > MAX) this.rotY = MAX;
		if(this.rotY < MIN) this.rotY = MIN;
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

class Rect {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
}

class Surface {
	constructor(glcanvasId, tcanvasId, vertFName, fragFName, targetImage) {
		this.tcanvas = document.getElementById(tcanvasId);
		this.tcontext = this.tcanvas.getContext('2d');
		this.targetImage = targetImage;
		this.tpixels = null;
		this.redrawn = true;
		this.glpixels = null;

		this.compareStarted = false;

		this.compare = new Rect();

		this.cam = new Camera();

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
	}

	rescale() {
		this.glcanvas.width  = this.glcanvas.clientWidth;
		this.glcanvas.height = this.glcanvas.clientHeight;
		this.tcanvas.width  = this.tcanvas.clientWidth;
		this.tcanvas.height = this.tcanvas.clientHeight;
		this.gl.viewport(0, 0, this.glcanvas.width, this.glcanvas.height);

		if(this.compareStarted) {
			this.drawTargetImage();
		}
	}

	drawTargetImage() {
		const scale = Math.min(this.tcanvas.width, this.tcanvas.height)
			/ Math.min(this.targetImage.width, this.targetImage.height);

		const dw = this.targetImage.width * scale;
		const dh = this.targetImage.height * scale;
		const x = (this.tcanvas.width - dw) / 2;
		const y = (this.tcanvas.height - dh) / 2;
		this.compare = new Rect(x, y, dw, dh);
		this.tcontext.drawImage(this.targetImage, x, y, dw, dh);
		this.tpixels = this.tcontext.getImageData(x, y, dw, dh);
		this.glpixels = new Uint8Array(this.compare.w * this.compare.h * 4);
	}

	calcScore() {
		let total = 0;
		for(let y = 0;y < this.compare.h;y += 3) {
			for(let x = 0;x < this.compare.w;x += 3) {
				const tid = (y * this.compare.w + x) * 4;
				const t_r = this.tpixels.data[tid+0];
				const t_g = this.tpixels.data[tid+1];
				const t_b = this.tpixels.data[tid+2];
				//if(t_r === 0 && t_g === 0 && t_b === 0) continue;

				// see "IMPORTANT NOTE" in render.js about gl.readPixels
				const glid = ((this.compare.h-y-1)*this.compare.w + x) * 4;
				const gl_r = this.glpixels[glid+0];
				const gl_g = this.glpixels[glid+1];
				const gl_b = this.glpixels[glid+2];

				total += (t_r-gl_r)*(t_r-gl_r) + (t_g-gl_g)*(t_g-gl_g) + (t_b-gl_b)*(t_b-gl_b);
			}
		}
		return total;
	}
}
