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
	[-S,-S,+S], // (0) // front
	[+S,-S,+S], // (1)
	[+S,+S,+S], // (2)
	[-S,+S,+S], // (3)

	[-S,-S,-S], // (4) // back
	[+S,-S,-S], // (5)
	[+S,+S,-S], // (6)
	[-S,+S,-S], // (7)
];

//const cubeFaces = [-0.6, -0.6, 1, 0, 0, 1, 0.4, 0, 0];
const cubeFaces = [].concat(
	verticies[0], verticies[1], verticies[2], // front face
	verticies[0], verticies[2], verticies[3],
	verticies[1], verticies[5], verticies[2], // right side
	verticies[5], verticies[2], verticies[6],
	verticies[2], verticies[3], verticies[7], // top side
	verticies[2], verticies[7], verticies[6],
	verticies[0], verticies[3], verticies[4], // left side
	verticies[3], verticies[4], verticies[7],
	verticies[0], verticies[1], verticies[4], // bottom side
	verticies[1], verticies[4], verticies[5],
	verticies[4], verticies[5], verticies[7], // back side
	verticies[5], verticies[7], verticies[6]
);

const setup = () => {
	console.log('Setup called');

	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeFaces), gl.STATIC_DRAW);

	const aXYZ = gl.getAttribLocation(shaderProgram, 'aXYZ');
	gl.enableVertexAttribArray(aXYZ);
	//                                           total  offset
	gl.vertexAttribPointer(aXYZ, 3, gl.FLOAT, false, 0, 0);
};

const render = (currentFrame) => {
	//console.log('Render called for frame', currentFrame);

	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const projModelLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	const colorLoc = gl.getUniformLocation(shaderProgram, 'uColor');
	const cube = (mat) => {
		gl.uniformMatrix4fv(projModelLoc, false, new Float32Array(mat.data));

		gl.uniform3f(colorLoc, 0, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, cubeFaces.length / 3);

		gl.uniform3f(colorLoc, 1, 1, 1);
		gl.drawArrays(gl.POINTS, 0, cubeFaces.length / 3);
	};

	// projection
	const projMatrixLoc = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	const proj = new PerspectiveMatrix(30, 1, 4000, canvas.width/canvas.height);
	gl.uniformMatrix4fv(projMatrixLoc, false, new Float32Array(proj.data));

	// camera
	const fr = currentFrame * 0.02;
	const viewMatrixLoc  = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
	const view = viewMatrix(
		[Math.cos(fr) * 15, 15, Math.sin(fr) * 15],
		[0, 0, 0], // point to look towards
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(viewMatrixLoc, false, view);

	const mat = new Matrix4()
	mat.scalei(3, 3, 3);

	cube(mat);
};
