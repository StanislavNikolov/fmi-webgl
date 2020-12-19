/*       == verticies ==
 *
 *      Y       7      6
 *      ^      .+------+
 *      |    .' |    .'|
 *      |   +------+'  |
 *      |  3|   | 2|   |
 *      |   |  ,+--|---+
 *      |   |.' 4  | .'5
 *      |   +------+'
 *      |   0      1
 *      |
 *     ,+------------------>X
 *   .'
 *  '
 * Z
 */

const S = 1.0 / 2; // default size of the cube

// verticies of cube, centered in (0,0,0)
const verticies = [
	[-S,-S,+S], // (0) // front
	[+S,-S,+S], // (1)
	[+S,+S,+S], // (2)
	[-S,+S,+S], // (3)

	[-S,-S,-S], // (4) // back
	[+S,-S,-S], // (5)
	[+S,+S,-S], // (6)
	[-S,+S,-S], // (7)
];

const normals = [
	[ 0,  0, +1], // (0) front
	[+1,  0,  0], // (1) right
	[ 0, +1,  0], // (2) top
	[-1,  0,  0], // (3) left
	[ 0, -1,  0], // (4) bottom
	[ 0,  0, -1]  // (6) back
];

class Cube {
	constructor(color, direction, position) {
		this.matrix = new Matrix4();
		this.matrix.rotateXi(direction[0]);
		this.matrix.rotateYi(direction[1]);
		this.matrix.rotateZi(direction[2]);
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

		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.rawFaceData), gl.STATIC_DRAW);

		gl.vertexAttribPointer(aXYZLoc,   3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0 * FLOAT_SIZE);
		gl.vertexAttribPointer(aNrmLoc,   3, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
		gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 6 * FLOAT_SIZE);

		gl.drawArrays(gl.TRIANGLES, 0, this.rawFaceData.length / 9);
	};
};

let uModelMatrixLoc, uProjMatrixLoc, uViewMatrixLoc, uLightDirLoc;
let aXYZLoc, aNrmLoc, aColorLoc;

const setup = () => {
	console.log('Setup called');

	uModelMatrixLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	uProjMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	uViewMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
	uLightDirLoc    = gl.getUniformLocation(shaderProgram, 'uLightDir')

	aXYZLoc   = gl.getAttribLocation(shaderProgram, 'aXYZ');
	aNrmLoc   = gl.getAttribLocation(shaderProgram, 'aNrm');
	aColorLoc = gl.getAttribLocation(shaderProgram, 'aColor');
	gl.enableVertexAttribArray(aXYZLoc);
	gl.enableVertexAttribArray(aNrmLoc);
	gl.enableVertexAttribArray(aColorLoc);

	gl.enable(gl.DEPTH_TEST);
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
		//[Math.cos(fr * 1.2) * dist, Math.sin(fr * 0.7) * dist, Math.sin(fr) * dist],
		camPos,
		[0, 0, 0],
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(uViewMatrixLoc, false, view);

	const a = currentFrame * 0.05;
	const lightPos = [4, 7, 2];
	gl.uniform3f(uLightDirLoc, -lightPos[0], -lightPos[1], -lightPos[2]);

	let c = new Cube([0.2, 0.1, 0.3], [0, 0, 0], [0, 0, -3]);
	c.draw();
};
