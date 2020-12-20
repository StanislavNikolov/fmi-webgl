const S = 1.00 / 2;

const verticies = [
	[-S,-S,-S], // (0) - front
	[+S,-S,-S], // (1)
	[+S,+S,-S], // (2)
	[-S,+S,-S], // (3)

	[-S,-S,+S], // (4) - back
	[+S,-S,+S], // (5)
	[+S,+S,+S], // (6)
	[-S,+S,+S], // (7)
];

const normals = [
	[ 0,  0, +1], // (0) front
	[+1,  0,  0], // (1) right
	[ 0, +1,  0], // (2) top
	[-1,  0,  0], // (3) left
	[ 0, -1,  0], // (4) bottom
	[ 0,  0, -1]  // (6) back
];


class Cuboid {
	constructor(color, direction, position, scale) {
		this.matrix = new Matrix4();
		this.matrix.rotateXi(direction[0]);
		this.matrix.rotateYi(direction[1]);
		this.matrix.rotateZi(direction[2]);
		this.matrix.scalei(scale[0], scale[1], scale[2]);
		this.matrix.translatei(position[0], position[1], position[2]);
		this.color = color;

		this.rawFaceData = [].concat(
			// face(p        n          c         p            n         c         p            n         c)
			verticies[0], normals[0], color, verticies[1], normals[0], color, verticies[2], normals[0], color,  // front face
			verticies[0], normals[0], color, verticies[2], normals[0], color, verticies[3], normals[0], color,
			verticies[1], normals[1], color, verticies[5], normals[1], color, verticies[2], normals[1], color,  // right side
			verticies[5], normals[1], color, verticies[2], normals[1], color, verticies[6], normals[1], color,
			verticies[2], normals[2], color, verticies[3], normals[2], color, verticies[7], normals[2], color,  // top side
			verticies[2], normals[2], color, verticies[7], normals[2], color, verticies[6], normals[2], color,
			verticies[0], normals[3], color, verticies[3], normals[3], color, verticies[4], normals[3], color,  // left side
			verticies[3], normals[3], color, verticies[4], normals[3], color, verticies[7], normals[3], color,
			verticies[0], normals[4], color, verticies[1], normals[4], color, verticies[4], normals[4], color,  // bottom side
			verticies[1], normals[4], color, verticies[4], normals[4], color, verticies[5], normals[4], color,
			verticies[4], normals[5], color, verticies[5], normals[5], color, verticies[7], normals[5], color,  // back side
			verticies[5], normals[5], color, verticies[7], normals[5], color, verticies[6], normals[5], color
		);
	}

	draw() {
		gl.uniformMatrix4fv(uModelMatrixLoc, false, new Float32Array(this.matrix.data));
		// gl.vertexAttrib3fv(aColor, this.color);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.rawFaceData), gl.STATIC_DRAW);

		gl.vertexAttribPointer(aXYZLoc,   3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0 * FLOAT_SIZE);
		gl.vertexAttribPointer(aNrmLoc,   3, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
		gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 6 * FLOAT_SIZE);

		gl.drawArrays(gl.TRIANGLES, 0, this.rawFaceData.length / 9);
	};
};

class Skeleton {
	constructor(object) {
		this.object = object;
		this.subSkeletons = [];
	}

	attachSkeleton(skeleton, matrix) {
		this.subSkeletons.push([skeleton, matrix]);
	}

	draw(accumulatedMatrix) {
		gl.uniformMatrix4fv(uAccModelMatrixLoc, false, new Float32Array(accumulatedMatrix.data));
		if(this.object != null) this.object.draw();

		for(const [subSkel, matrix] of this.subSkeletons) {
			//subSkel.draw(matrix.mul(accumulatedMatrix));
			subSkel.draw(accumulatedMatrix.mul(matrix));
		}
	}
};

let aXYZLoc, aNrmLoc, aColorLoc;
let uModelMatrixLoc, uAccModelMatrixLoc, uProjMatrixLoc, uViewMatrixLoc, uLightDirLoc;

const setup = () => {
	console.log('Setup called');

	//const uLightDirLoc = gl.getUniformLocation(shaderProgram, 'uLightDir');
	//gl.uniform3f(uLightDirLoc, 0, 0, 0);
	aXYZLoc   = gl.getAttribLocation(shaderProgram, 'aXYZ');
	aNrmLoc   = gl.getAttribLocation(shaderProgram, 'aNrm');
	aColorLoc = gl.getAttribLocation(shaderProgram, 'aColor');
	gl.enableVertexAttribArray(aXYZLoc);
	gl.enableVertexAttribArray(aNrmLoc);
	gl.enableVertexAttribArray(aColorLoc);

	uAccModelMatrixLoc = gl.getUniformLocation(shaderProgram, 'uAccModelMatrix');
	uModelMatrixLoc    = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	uProjMatrixLoc     = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	uViewMatrixLoc     = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
	uLightDirLoc       = gl.getUniformLocation(shaderProgram, 'uLightDir')

	gl.enable(gl.DEPTH_TEST);

	isKeyPressed[87] = false;
};

const map = (x, begin, end) => begin + x * (end-begin);

const createWing = () => {
	let main = null, prev = null;
	for(let i = 0;i < 15;i ++) {
		const c = i/9;
		const color = [map(c, 1, 0), map(c, 1, 0), map(c, 0.2, 0)]
		const newPart = new Skeleton(new Cuboid(color, [0,0,0], [0,0,0], [0.3,0.2,2]));
		const offset = new Matrix4();
		offset.scalei(0.92, 0.92, 0.92);
		offset.translatei(0.3,0,0.05);
		if(main == null) {
			main = newPart;
		} else {
			prev.attachSkeleton(newPart, offset);
		}
		prev = newPart;
	}
	return main;
}

const body = new Cuboid([1,1,1], [0,0,0], [0,0,0], [1,1,3]);
const mainSkel = new Skeleton(body);

const rightWingMtrx = new Matrix4();
const rightWing = createWing();
rightWingMtrx.translatei(0.5,0,0);
mainSkel.attachSkeleton(rightWing, rightWingMtrx);

const leftWingMtrx = new Matrix4();
const leftWing = createWing();
leftWingMtrx.rotateZi(180);
leftWingMtrx.translatei(-0.5, 0, 0);
mainSkel.attachSkeleton(leftWing, leftWingMtrx);

const head = new Skeleton(new Cuboid([0.3, 0.3, 0.6], [0,0,0], [0,0,0], [1,1,1]));
const headMtrx = new Matrix4();
headMtrx.scalei(0.5, 0.8, 0.5);
headMtrx.translatei(0, 0, 2);
mainSkel.attachSkeleton(head, headMtrx);

// eyes
{
const M = new Matrix4();
M.scalei(0.1, 0.1, 0.1);
M.translatei(0.2,0.25,0.5);
head.attachSkeleton( new Skeleton(new Cuboid([1,1,1], [0,0,0], [0,0,0], [1,1,1])), M);
}
{
const M = new Matrix4();
M.scalei(0.1, 0.1, 0.1);
M.translatei(-0.2,0.25,0.5);
head.attachSkeleton( new Skeleton(new Cuboid([1,1,1], [0,0,0], [0,0,0], [1,1,1])), M);
}

const flapWing = (wing, frame, mul) => {
	if(wing.subSkeletons.length == 0) return;
	wing.subSkeletons[0][1].rotateZi(mul*Math.sin(-frame*0.1 )*20); // unrotate prev rotation
	wing.subSkeletons[0][1].rotateXi(mul*Math.sin(-frame*0.1 )*2.5); // unrotate prev rotation

	wing.subSkeletons[0][1].rotateXi(mul*Math.sin((frame+1)*0.1)*2.5);
	wing.subSkeletons[0][1].rotateZi(mul*Math.sin((frame+1)*0.1)*20);

	flapWing(wing.subSkeletons[0][0], frame, mul*0.80);
};

const rotateHead = (headss, frame) => {
	headss[1].rotateZi(Math.sin(-frame*0.1) * 30);
	headss[1].rotateZi(Math.sin((frame+1)*0.1) * 30);
}

let camPos = [0, 0, 10];
const moveCamera = () => {
	for(let i = 0;i < 200;i ++) {
		if(isKeyPressed[i]) console.log(i);
	}
	if(isKeyPressed[37]) camPos[0] --;
	if(isKeyPressed[39]) camPos[0] ++;
	if(isKeyPressed[40]) camPos[1] --;
	if(isKeyPressed[38]) camPos[1] ++;
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
		[0, 0, -3], // point to look towards
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(uViewMatrixLoc, false, view);

	const a = currentFrame * 0.05;
	//const lightPos = [Math.cos(a) * 7, Math.sin(a) * 7,  isKeyPressed[87] * 7 + 2];
	const lightPos = [4, 7, 3];
	//const lightPos = [5, 5, 0];
	gl.uniform3f(uLightDirLoc, -lightPos[0], -lightPos[1], -lightPos[2]);

	let m = new Matrix4();
	// body rotation
	m.scalei(0.4, 0.4, 0.4);
	m.rotateXi(20 * Math.sin(currentFrame * 0.05));
	m.rotateZi(20 * Math.sin(currentFrame * 0.01));
	m.rotateYi(currentFrame * 0.2);

	flapWing(leftWing, currentFrame, 1);
	flapWing(rightWing, currentFrame, -1);
	rotateHead(mainSkel.subSkeletons[2], currentFrame);
	mainSkel.draw(m);
};
