/*       == verticies ==
 *
 *      Y       7      6
 *      ^ |\---------/|
 *      | | \       / |
 *      | | +------+  |
 *      | |3|      |  |
 *      | | |COLOUR|  |
 *      | | |      |  |
 *      | | +------+  |
 *      | |/0      1\ |
 *      | /__________\|
 *     ,+------------------>X
 *   .'
 *  '
 * Z
 */

const S1 = 0.85 / 2; // size of the front color part
const S2 = 1.00 / 2; // size of the back "lower" part
const depth = 0.07;

const verticies = [
	[-S1,-S1,depth], // (0) - front
	[+S1,-S1,depth], // (1)
	[+S1,+S1,depth], // (2)
	[-S1,+S1,depth], // (3)

	[-S2,-S2,0], // (4) - "lower"
	[+S2,-S2,0], // (5)
	[+S2,+S2,0], // (6)
	[-S2,+S2,0], // (7)
];

const normals = [
	[ 0,  0, +1], // (0) front
	[+1,  0,  0], // (1) right
	[ 0, +1,  0], // (2) top
	[-1,  0,  0], // (3) left
	[ 0, -1,  0], // (4) bottom
	[ 0,  0, -1]  // (6) back
];


let faces = [];
class RCFace {
	constructor(color, direction, position) {
		this.matrix = new Matrix4();
		this.matrix.rotateXi(direction[0]);
		this.matrix.rotateYi(direction[1]);
		this.matrix.rotateZi(direction[2]);
		this.matrix.translatei(position[0], position[1], position[2]);
		this.color = color;
		const darkC = [0.1, 0.1, 0.1];

		this.rawFaceData = [].concat(
			// face(p        n          c         p            n         c         p            n         c)
			verticies[0], normals[0], color, verticies[1], normals[0], color, verticies[2], normals[0], color,  // front face
			verticies[0], normals[0], color, verticies[2], normals[0], color, verticies[3], normals[0], color,
			verticies[1], normals[1], darkC, verticies[5], normals[1], darkC, verticies[2], normals[1], darkC,  // right side
			verticies[5], normals[1], darkC, verticies[2], normals[1], darkC, verticies[6], normals[1], darkC,
			verticies[2], normals[2], darkC, verticies[3], normals[2], darkC, verticies[7], normals[2], darkC,  // top side
			verticies[2], normals[2], darkC, verticies[7], normals[2], darkC, verticies[6], normals[2], darkC,
			verticies[0], normals[3], darkC, verticies[3], normals[3], darkC, verticies[4], normals[3], darkC,  // left side
			verticies[3], normals[3], darkC, verticies[4], normals[3], darkC, verticies[7], normals[3], darkC,
			verticies[0], normals[4], darkC, verticies[1], normals[4], darkC, verticies[4], normals[4], darkC,  // bottom side
			verticies[1], normals[4], darkC, verticies[4], normals[4], darkC, verticies[5], normals[4], darkC,
			verticies[4], normals[5], darkC, verticies[5], normals[5], darkC, verticies[7], normals[5], darkC,  // back side
			verticies[5], normals[5], darkC, verticies[7], normals[5], darkC, verticies[6], normals[5], darkC
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

let aXYZLoc, aNrmLoc, aColorLoc;
let uModelMatrixLoc, uProjMatrixLoc, uViewMatrixLoc, uLightDirLoc;

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

	uModelMatrixLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	uProjMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	uViewMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
	uLightDirLoc = gl.getUniformLocation(shaderProgram, 'uLightDir')

	gl.enable(gl.DEPTH_TEST);

	isKeyPressed[87] = false;

	const rndColor = () => {
		const colors = [[1,1,1], [1,0,0], [0,1,0], [0,0.2,0.8], [1,0.5,0.2], [1,1,0]];
		const idx = Math.floor(Math.random() * colors.length);
		return colors[idx];
	};

	for(let x = 0;x < 3;x ++) {
		for(let y = 0;y < 3;y ++) {
			faces.push(new RCFace(rndColor(), [0,0,0],   [x, y, 0])); // front
			faces.push(new RCFace(rndColor(), [180,0,0], [x, y, - 6*S2])); // back
		}
	}
	for(let z = 0;z < 3;z ++) {
		for(let y = 0;y < 3;y ++) {
			faces.push(new RCFace(rndColor(), [0,90,0],   [+5*S2, y, z - 5*S2])); // left
			faces.push(new RCFace(rndColor(), [0,270, 0], [-S2, y,   z - 5*S2])); // right
		}
	}
	for(let x = 0;x < 3;x ++) {
		for(let z = 0;z < 3;z ++) {
			faces.push(new RCFace(rndColor(), [270,0,0],   [x, 5 * S2, z - 5*S2])); // top
			faces.push(new RCFace(rndColor(), [90,0,0],   [x, -1 * S2, z - 5*S2])); // bottom
		}
	}
};

let camPos = [0, 20, 10];
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
		[Math.cos(fr * 1.2) * dist, Math.sin(fr * 0.7) * dist, Math.sin(fr) * dist],
		//camPos,
		[3*S2, 3*S2, -3*S2], // point to look towards
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(uViewMatrixLoc, false, view);

	const a = currentFrame * 0.05;
	//const lightPos = [Math.cos(a) * 7, Math.sin(a) * 7,  isKeyPressed[87] * 7 + 2];
	const lightPos = [4, 7, 3];
	//const lightPos = [5, 5, 0];
	gl.uniform3f(uLightDirLoc, -lightPos[0], -lightPos[1], -lightPos[2]);

	for(const face of faces) {
		face.draw();
	}
};
