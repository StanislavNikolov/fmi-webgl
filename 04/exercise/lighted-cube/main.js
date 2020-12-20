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

const verticies = [
	[-S,-S,+S], // (0) - front
	[+S,-S,+S], // (1)
	[+S,+S,+S], // (2)
	[-S,+S,+S], // (3)

	[-S,-S,-S], // (4) - back
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

const cubeData = [].concat(
	// face(p        n            p            n            p            n)
	verticies[0], normals[0], verticies[1], normals[0], verticies[2], normals[0], // front face
	verticies[0], normals[0], verticies[2], normals[0], verticies[3], normals[0],
	verticies[1], normals[1], verticies[5], normals[1], verticies[2], normals[1], // right side
	verticies[5], normals[1], verticies[2], normals[1], verticies[6], normals[1],
	verticies[2], normals[2], verticies[3], normals[2], verticies[7], normals[2], // top side
	verticies[2], normals[2], verticies[7], normals[2], verticies[6], normals[2],
	verticies[0], normals[3], verticies[3], normals[3], verticies[4], normals[3], // left side
	verticies[3], normals[3], verticies[4], normals[3], verticies[7], normals[3],
	verticies[0], normals[4], verticies[1], normals[4], verticies[4], normals[4], // bottom side
	verticies[1], normals[4], verticies[4], normals[4], verticies[5], normals[4],
	verticies[4], normals[5], verticies[5], normals[5], verticies[7], normals[5], // back side
	verticies[5], normals[5], verticies[7], normals[5], verticies[6], normals[5]
);

const setup = () => {
	console.log('Setup called');

	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData), gl.STATIC_DRAW);

	//const uLightDirLoc = gl.getUniformLocation(shaderProgram, 'uLightDir');
	//gl.uniform3f(uLightDirLoc, 0, 0, 0);

	const aXYZ = gl.getAttribLocation(shaderProgram, 'aXYZ');
	const aNrm = gl.getAttribLocation(shaderProgram, 'aNrm');
	gl.enableVertexAttribArray(aXYZ);
	gl.enableVertexAttribArray(aNrm);
	//                                               total           offset
	gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0 * FLOAT_SIZE);
	gl.vertexAttribPointer(aNrm, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE);

	gl.enable(gl.DEPTH_TEST);
};

let camPos = [0, 10, 30];
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

	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	const projModelLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	const cube = (mat) => {
		gl.uniformMatrix4fv(projModelLoc, false, new Float32Array(mat.data));

		gl.drawArrays(gl.TRIANGLES, 0, cubeData.length / 6);
	};

	// projection
	const projMatrixLoc = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	const proj = new PerspectiveMatrix(30, 1, 4000, canvas.width/canvas.height);
	gl.uniformMatrix4fv(projMatrixLoc, false, new Float32Array(proj.data));

	// camera
	const fr = currentFrame * 0.01;
	const viewMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
	const view = viewMatrix(
		//[Math.cos(fr) * 15, 15, Math.sin(fr) * 15],
		camPos,
		[0, 0, 0], // point to look towards
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(viewMatrixLoc, false, view);

	const uLightDirLoc = gl.getUniformLocation(shaderProgram, 'uLightDir');
	const a = currentFrame * 0.05;
	const lightPos = [Math.cos(a) * 7, Math.sin(a) * 7,  isKeyPressed[87] * 5];
	//const lightPos = [4, 4, 0];
	//const lightPos = [5, 5, 0];
	gl.uniform3f(uLightDirLoc, -lightPos[0], -lightPos[1], -lightPos[2]);

	const mat = new Matrix4();
	mat.scalei(3, 3, 3);
	cube(mat);

	const mat2 = new Matrix4();
	mat2.translatei(lightPos[0], lightPos[1], lightPos[2]);
	cube(mat2);
};
