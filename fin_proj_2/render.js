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
	constructor(color, scale, direction, position) {
		this.matrix = new Matrix4();
		this.matrix.scalei(scale[0], scale[1], scale[2]);
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

	draw(surface) {
		const {gl, vars} = surface;

		gl.uniformMatrix4fv(vars.uModelMatrix, false, new Float32Array(this.matrix.data));

		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.rawFaceData), gl.STATIC_DRAW);

		gl.vertexAttribPointer(vars.aXYZ, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0 * FLOAT_SIZE);
		gl.vertexAttribPointer(vars.aNrm, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
		gl.vertexAttribPointer(vars.aCol, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 6 * FLOAT_SIZE);

		gl.drawArrays(gl.TRIANGLES, 0, this.rawFaceData.length / 9);
	};
};

// setup surface for webgl rendering
const setup = (surface) => {
	surface.cam = new Camera();
	surface.vars = {};

	const {gl, canvas, vars, cam} = surface;

	vars.uProjMatrix   = gl.getUniformLocation(surface.program, 'uProjMatrix');
	vars.uViewMatrix   = gl.getUniformLocation(surface.program, 'uViewMatrix');
	vars.uModelMatrix  = gl.getUniformLocation(surface.program, 'uModelMatrix');
	vars.uLightDir     = gl.getUniformLocation(surface.program, 'uLightDir');
	vars.uAmbientLight = gl.getUniformLocation(surface.program, 'uAmbientLight');

	vars.aXYZ = gl.getAttribLocation(surface.program, 'aXYZ');
	vars.aNrm = gl.getAttribLocation(surface.program, 'aNrm');
	vars.aCol = gl.getAttribLocation(surface.program, 'aCol');

	gl.enableVertexAttribArray(surface.vars.aXYZ);
	gl.enableVertexAttribArray(surface.vars.aNrm);
	gl.enableVertexAttribArray(surface.vars.aCol);

	gl.enable(gl.DEPTH_TEST);
};

const map = (x, begin, end) => begin + x * (end-begin);

const r = Math.random;
const R = (x) => map(r(), -x, x);
const init_level = () => {
	let cubes = [];
	let count = 10;
	for(let x = -count;x <= count;x ++) {
		for(let z = -count;z <= count;z ++) {
			//const color = [r(), r(), r()];
			//const scale = [r(), r()*3, r()];
			//const rotation = [0, R(360), 0];
			//const position = [R(10), scale[1]/2, R(10)];

			const color = [(x-count) / (2*count), 0.5, 0.5];
			const height = (x === 0 && z === 0 ? 2 : 0.1);
			const scale = [0.2, height, 0.2];
			const rotation = [0, 0, 0];
			const position = [x, scale[1]/2, z];

			cubes.push(new Cube(color, scale, rotation, position));
		}
	}
	cubes.push(new Cube([0.3, 0.5, 0.6], [1000, 0.1, 1000], [0,0,0], [0,-0.1,0]));
	return cubes;
}
let cubes = init_level();

const render = (surface) => {
	const {gl, canvas, vars, cam} = surface;

	gl.clearColor(0.9, 0.9, 0.9, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// projection
	const proj = new PerspectiveMatrix(30, 1, 4000, canvas.width/canvas.height);
	gl.uniformMatrix4fv(vars.uProjMatrix, false, new Float32Array(proj.data));

	// camera
	const fr = 10 * 0.01;
	const dist = 15;
	const view = viewMatrix(
		//[Math.cos(fr * 1.2) * dist, Math.sin(fr * 0.7) * dist, Math.sin(fr) * dist],
		cam.pos,
		[cam.pos[0] + cam.lookDir[0], cam.pos[1] + cam.lookDir[1], cam.pos[2] + cam.lookDir[2]],
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(vars.uViewMatrix, false, view);

	gl.uniform3f(vars.uAmbientLight, 0.3, 0.3, 0.3);

	// light
	const lightPos = [4, 7, 2];
	gl.uniform3f(vars.uLightDir, -lightPos[0], -lightPos[1], -lightPos[2]);

	for(const c of cubes) c.draw(surface);
	for(const surf of surfaces) {
		if(surf === surface) continue;
		const color = [0.6, 0.6, 0.2];
		const scale = [0.2, 0.5, 0.2];
		const rotation = [0, surf.cam.rotX / Math.PI * 180, 0];
		(new Cube(color, scale, rotation, surf.cam.pos)).draw(surface);
	}
}
