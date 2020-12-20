let uModelMatrixLoc, uProjMatrixLoc, uViewMatrixLoc, uLightDirLoc, uAmbientLightLoc;
let aXYZLoc, aNrmLoc, aColorLoc;
let camPos = [0, 0, 8];
let DOM_MR;

const setup = () => {
	console.log('Setup called');

	uModelMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	uProjMatrixLoc   = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	uViewMatrixLoc   = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
	uLightDirLoc     = gl.getUniformLocation(shaderProgram, 'uLightDir')
	uAmbientLightLoc = gl.getUniformLocation(shaderProgram, 'uAmbientLight')

	aXYZLoc   = gl.getAttribLocation(shaderProgram, 'aXYZ');
	aNrmLoc   = gl.getAttribLocation(shaderProgram, 'aNrm');
	aColorLoc = gl.getAttribLocation(shaderProgram, 'aColor');
	gl.enableVertexAttribArray(aXYZLoc);
	gl.enableVertexAttribArray(aNrmLoc);
	gl.enableVertexAttribArray(aColorLoc);

	gl.enable(gl.DEPTH_TEST);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

	DOM_MR = document.getElementById('data-mr');

	//createVirus();
	reset();
};

const moveCamera = () => {
	const speed = 0.6;
	if(isKeyPressed[37]) camPos[0] -= speed;
	if(isKeyPressed[39]) camPos[0] += speed;
	if(isKeyPressed[40]) camPos[1] -= speed;
	if(isKeyPressed[38]) camPos[1] += speed;
};

const calcNormalOnTriangle = (a, b, c) => {
	const U = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const V = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];

	return [
		(U[1] * V[2]) - (U[2] * V[1]),
		(U[2] * V[0]) - (U[0] * V[2]),
		(U[0] * V[1]) - (U[1] * V[0])
	];
};

const calcSurfaceNormalAtPoint = (x, y, surfaceFunction) => {
	const D = 0.000001;
	// vertecies of equilateral triangle with center (0,0) and len=D
	const off = [
		[ 0.866025403784438 * D,  0.5 * D], // cos/sin 330 deg
		[-0.866025403784438 * D, -0.5 * D], // cos/sin 210 deg
		[ 0                 * D,  1   * D], // cos/sin 90 deg
	];
	return calcNormalOnTriangle(
		surfaceFunction(x+off[0][0], y+off[0][1]),
		surfaceFunction(x+off[1][0], y+off[1][1]),
		surfaceFunction(x+off[2][0], y+off[2][1])
	);
};

class Mesh {
	constructor(data) {
		this.data = data;
		this.pointCnt = data.length / 9;
	}

	draw() {
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.STATIC_DRAW);

		gl.vertexAttribPointer(aXYZLoc,   3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0 * FLOAT_SIZE);
		gl.vertexAttribPointer(aNrmLoc,   3, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
		gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 6 * FLOAT_SIZE);

		gl.uniform3f(uAmbientLightLoc, 0.2,0.2,0.2);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.pointCnt);

		if(debugLines) {
			gl.uniform3f(uAmbientLightLoc, 1,1,1);
			gl.drawArrays(gl.LINE_STRIP, 0, this.pointCnt);
			gl.drawArrays(gl.POINTS, 0, this.pointCnt);
		}
	}
};

class Plane {
	constructor(N, color, position, rotation, surfaceFunction) {
		this.color = color;
		this.matrix = new Matrix4();
		this.matrix.rotateXi(rotation[0]);
		this.matrix.rotateYi(rotation[1]);
		this.matrix.rotateZi(rotation[2]);
		this.matrix.translatei(position[0], position[1], position[2]);

		this.N = N;
		this.surfaceFunction = surfaceFunction;

		this.createMesh();
	}

	createMesh() {
		const data = [];
		const norm = 1.0 / (this.N-1);

		const addP = (x, y) => {
			const point = this.surfaceFunction(x, y);
			const normal = calcSurfaceNormalAtPoint(x, y, this.surfaceFunction);
			data.push(
				point[0], point[1], point[2], // XYZ
				normal[0], normal[1], normal[2], // Surface normal
				this.color[0], this.color[1], this.color[2] // Color
			);
		};

		const N = this.N;
		for(let yi = 0;yi < this.N-1;yi ++) {
			for(let xi = 0;xi < this.N;xi ++) {
				addP(xi * norm, (yi+0) * norm);
				addP(xi * norm, (yi+1) * norm);
			}
			if(yi !== this.N-2) { // if not the last strip, add first part of fake triangle
				addP(1, (yi+1) * norm);
				addP(0, (yi+1) * norm);
			}
		}

		this.mesh = new Mesh(data);
	}

	draw() {
		gl.uniformMatrix4fv(uModelMatrixLoc, false, new Float32Array(this.matrix.data));
		this.mesh.draw();
	}
}

// https://en.wikipedia.org/wiki/B%C3%A9zier_surface
// Bezier surface of degree (3,3), thus having 4*4=16 control points

// As in wikipedia, but N=3
const Bernstein = (i, u) => {
	if(i == 0) return (1-u)*(1-u)*(1-u);
	if(i == 1) return 3*u*(1-u)*(1-u);
	if(i == 2) return 3*u*u*(1-u);
	return u*u*u;

	// nCr(3, i) => [1, 3, 3, 1][i];
	//return [1, 3, 3, 1][i] * Math.pow(u, i) * Math.pow((1.0 - u), 3-i);
};

// function that returns another function with theese control points "baked" in
const BezierSurface = controlPoints => {
	return (x, y) => {
		const ans = [0, 0, 0];
		for(let i = 0;i < 4;i ++) {
			for(let j = 0;j < 4;j ++) {
				const mul = Bernstein(i, x) * Bernstein(j, y);
				ans[0] += controlPoints[j][i][0] * mul;
				ans[1] += controlPoints[j][i][1] * mul;
				ans[2] += controlPoints[j][i][2] * mul;
			}
		}
		return ans;
	};
};

const createVirus = () => {
	// Tried to create a virus by manually aligning bezier surfaces...
	/*
	const S = 1.5; // spike size
	const f = BezierSurface([
		[[0.00, 0.00, 0.00], [0.33, 0.00, 0.00], [0.66, 0.00, 0.00], [1.00, 0.00, -0.20]], // j=0
		[[0.00, 0.33, 0.00], [0.33, 0.33, 0.00], [0.66, 0.33, 0.00], [1.00, 0.33, 0.00]], // j=1
		[[0.00, 0.66, 0.00], [0.33, 0.66, 0.00], [0.66, 0.66, 0.00], [1.00, 0.66, 0.00]], // j=2
		[[0.00, 1.00, S   ], [0.33, 1.00, 0.00], [0.66, 1.00, 0.00], [1.00, 1.00, 0.00]] // j=3
	]);
	planes.push(new Plane(N, [0, 0, 0], [0, 0, 0], f));
	planes.push(new Plane(N, [-1, 1, 0], [0, 0, -90], f));
	planes.push(new Plane(N, [1, 1, 0], [0, 0, 90], f));
	planes.push(new Plane(N, [0, 2, 0], [0, 0, 180], f));
	*/
}

const getMutatedBezierPoints = (src, mutRate) => {
	const cpy = [];
	for(let row = 0;row < 4;row ++) {
		cpy[row] = [];
		for(let point = 0;point < 4;point ++) {
			cpy[row][point] = [];
			for(let i = 0;i < 3;i ++) {
				cpy[row][point][i] = src[row][point][i] + (Math.random() * 2*mutRate - mutRate);
			}
		}
	}
	return cpy;
};

let renderQual = 8;
const radius = 1.5;
const sphereFuncGenerator = (cuts, cofflon, cofflat, settings) => {
	return (x, y) => {
		const mlon = Math.PI * 2 / cuts;
		const mlat = Math.PI / cuts;
		const lon = map(x, mlon * cofflon, mlon * (cofflon+1));
		const lat = map(y, mlat * cofflat, mlat * (cofflat+1));

		const d1 = settings[0] * (lon+0.3) % (Math.PI / 3) < 0.3;
		const d2 = settings[1] * (lat+1.2) % (Math.PI / 4) < 0.2;
		const koef = d1 * d2 ? 2 * settings[2] : 1;
		//const koef = 1;

		return [
			radius * koef * Math.cos(lon) * Math.sin(lat),
			radius * koef * Math.sin(lon) * Math.sin(lat),
			radius * koef * Math.cos(lat)
		];
	};
};

class Patch {
	constructor(color, bp) {
		this.color = color;
		this.bp = bp;
		this.func = BezierSurface(bp);
		this.score = 0;
	}
	evalScore(targetFunc) {
		this.score = 0;
		for(let xi = 0;xi < renderQual;xi ++) {
			for(let yi = 0;yi < renderQual;yi ++) {
				const x = xi/(renderQual-1);
				const y = yi/(renderQual-1);

				const target = targetFunc(x, y);
				const actual = this.func(x, y);

				for(let i = 0;i < 3;i ++) {
					this.score += (target[i] - actual[i]) * (target[i] - actual[i]);
				}
			}
		}
		this.score /= (renderQual*renderQual);
	}
};

let planes = [];

let showPatches = true;
let showTarget = false;
let debugLines = false;
let targetType = 'special1';
let cuts = 5;

let globalMutRate;
let patches, targetFuncs;

const reset = () => {
	patches = [];

	globalMutRate = 0.2;

	for(let xi = 0;xi < cuts;xi ++) {
		patches[xi] = [];
		for(let yi = 0;yi < cuts;yi ++) {
			const newPatch = new Patch(
				[Math.random(), Math.random(), Math.random()], // color
				[ // initial bezier control points
					[[0.00, 0.00, 0.00], [0.33, 0.00, 0.00], [0.66, 0.00, 0.00], [1.00, 0.00, 0.00]],
					[[0.00, 0.33, 0.00], [0.33, 0.33, 0.00], [0.66, 0.33, 0.00], [1.00, 0.33, 0.00]],
					[[0.00, 0.66, 0.00], [0.33, 0.66, 0.00], [0.66, 0.66, 0.00], [1.00, 0.66, 0.00]],
					[[0.00, 1.00, 0.00], [0.33, 1.00, 0.00], [0.66, 1.00, 0.00], [1.00, 1.00, 0.00]]
				]
			);
			newPatch.score = 9999999;
			patches[xi][yi] = newPatch;
		}
	}

	targetFuncs = [];
	for(let xi = 0;xi < cuts;xi ++) {
		targetFuncs[xi] = [];
		for(let yi = 0;yi < cuts;yi ++) {
			if(targetType == 'ball') {
				targetFuncs[xi][yi] = sphereFuncGenerator(cuts, xi, yi, [0, 0, 1/2]);
			} else if(targetType == 'virus') {
				targetFuncs[xi][yi] = sphereFuncGenerator(cuts, xi, yi, [1, 1, 1]);
			} else if(targetType == 'special1') {
				targetFuncs[xi][yi] = sphereFuncGenerator(cuts, xi, yi, [0, 1, 1]);
			} else if(targetType == 'special2') {
				targetFuncs[xi][yi] = sphereFuncGenerator(cuts, xi, yi, [1, 0, 1]);
			}
		}
	}
};

const iterate = (prevBest, targetFunc) => {
	let best = prevBest;
	for(let i = 0;i < 10;i ++) {
		const newPatch = new Patch(best.color,
			getMutatedBezierPoints(best.bp, globalMutRate)
		);
		newPatch.evalScore(targetFunc);
		if(newPatch.score < best.score) best = newPatch;
	}

	return best;
};

const render = (currentFrame) => {
	//console.log('Render called for frame', currentFrame);

	moveCamera();

	gl.clearColor(0.4, 0.4, 0.4, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// projection
	const proj = new PerspectiveMatrix(30, 1, 4000, canvas.width/canvas.height);
	gl.uniformMatrix4fv(uProjMatrixLoc, false, new Float32Array(proj.data));

	// camera
	const fr = currentFrame * 0.01;
	const dist = 15;
	const view = viewMatrix(
		//[Math.cos(fr * 1.2) * dist, Math.sin(fr * 0.7) * dist, Math.sin(fr) * dist],
		camPos,
		[0, 0, 0],
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(uViewMatrixLoc, false, view);

	const a = currentFrame * 0.05;
	const lightPos = [4, 4, 4];
	gl.uniform3f(uLightDirLoc, -lightPos[0], -lightPos[1], -lightPos[2]);

	let fail = 0;
	for(let xi = 0;xi < cuts;xi ++) {
		for(let yi = 0;yi < cuts;yi ++) {
			const target = targetFuncs[xi][yi];
			const prevScore = patches[xi][yi].score;
			patches[xi][yi] = iterate(patches[xi][yi], target); // polish the turd into less turdy turd
			if(patches[xi][yi].score == prevScore) fail ++;
		}
	}
	const failPercent = fail / (cuts*cuts)

	if(failPercent > 0.6) {
		globalMutRate *= 0.95;
	}
	DOM_MR.innerText = globalMutRate;

	planes = [];
	for(let xi = 0;xi < cuts;xi ++) {
		for(let yi = 0;yi < cuts;yi ++) {
			const patch = patches[xi][yi];
			const target = targetFuncs[xi][yi];
			if(showPatches) {
				planes.push(new Plane(renderQual, patch.color, [0,0,0], [0,0,0], patch.func));
			}
			if(showTarget) {
				const color = [patch.color[0] * 0.7, patch.color[1] * 0.7, patch.color[2] * 0.7];
				//const color = [0.3, 0.6, 0.4];
				planes.push(new Plane(renderQual, color, [0,0,0], [0,0,0], target));
			}
		}
	}

	for(const p of planes) p.draw();
};
