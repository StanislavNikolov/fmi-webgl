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

const canonicalCubeVertexData = (()=>{
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

	return new Float32Array([].concat(
		// face(p        n             p            n            p            n      )
		verticies[0], normals[0], verticies[1], normals[0], verticies[2], normals[0],  // front face
		verticies[0], normals[0], verticies[2], normals[0], verticies[3], normals[0],
		verticies[1], normals[1], verticies[5], normals[1], verticies[2], normals[1],  // right side
		verticies[5], normals[1], verticies[2], normals[1], verticies[6], normals[1],
		verticies[2], normals[2], verticies[3], normals[2], verticies[7], normals[2],  // top side
		verticies[2], normals[2], verticies[7], normals[2], verticies[6], normals[2],
		verticies[0], normals[3], verticies[3], normals[3], verticies[4], normals[3],  // left side
		verticies[3], normals[3], verticies[4], normals[3], verticies[7], normals[3],
		verticies[0], normals[4], verticies[1], normals[4], verticies[4], normals[4],  // bottom side
		verticies[1], normals[4], verticies[4], normals[4], verticies[5], normals[4],
		verticies[4], normals[5], verticies[5], normals[5], verticies[7], normals[5],  // back side
		verticies[5], normals[5], verticies[7], normals[5], verticies[6], normals[5]
	));
})();

class Cube {
	constructor(color, scale, rotation, position) {
		this.scale = scale;
		this.rotation = rotation
		this.position = position;
		this.color = color;

		this.f_matrixData = null;
		this.recalc();
	}
	recalc() {
		const mat = new Matrix4();
		mat.scalei(this.scale[0], this.scale[1], this.scale[2]);
		mat.rotateXi(this.rotation[0]);
		mat.rotateYi(this.rotation[1]);
		mat.rotateZi(this.rotation[2]);
		mat.translatei(this.position[0], this.position[1], this.position[2]);
		this.f_matrixData = new Float32Array(mat.data);
	}
};

class Scene {
	constructor() {
		this.cubes = [];
	}

	draw(surface) {
		const {gl, vars} = surface;
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);

		//gl.uniform3f(vars.uAmbientLight, 0.3, 0.3, 0.3);
		gl.uniform3f(vars.uAmbientLight, 1.0, 1.0, 1.0);

		// light
		const lightPos = [4, 7, 2];
		gl.uniform3f(vars.uLightDir, -lightPos[0], -lightPos[1], -lightPos[2]);

		// draw cubes
		gl.bufferData(gl.ARRAY_BUFFER, canonicalCubeVertexData, gl.STATIC_DRAW);
		gl.vertexAttribPointer(vars.aXYZ, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 0 * FLOAT_SIZE);
		gl.vertexAttribPointer(vars.aNrm, 3, gl.FLOAT, false, 6 * FLOAT_SIZE, 3 * FLOAT_SIZE);
		for(const cube of this.cubes) {
			gl.uniformMatrix4fv(vars.uModelMatrix, false, cube.f_matrixData);
			gl.uniform3fv(vars.uColor, new Float32Array(cube.color));
			gl.drawArrays(gl.TRIANGLES, 0, canonicalCubeVertexData.length / 6);
		}

		// draw ...
	}
};

// setup surface for webgl rendering
const setup = (surface) => {
	surface.cam = new Camera();
	surface.vars = {};

	const {gl, vars, cam} = surface;

	vars.uProjMatrix   = gl.getUniformLocation(surface.program, 'uProjMatrix');
	vars.uViewMatrix   = gl.getUniformLocation(surface.program, 'uViewMatrix');
	vars.uModelMatrix  = gl.getUniformLocation(surface.program, 'uModelMatrix');
	vars.uLightDir     = gl.getUniformLocation(surface.program, 'uLightDir');
	vars.uAmbientLight = gl.getUniformLocation(surface.program, 'uAmbientLight');
	vars.uColor        = gl.getUniformLocation(surface.program, 'uColor');

	vars.aXYZ = gl.getAttribLocation(surface.program, 'aXYZ');
	vars.aNrm = gl.getAttribLocation(surface.program, 'aNrm');

	gl.enableVertexAttribArray(surface.vars.aXYZ);
	gl.enableVertexAttribArray(surface.vars.aNrm);

	gl.enable(gl.DEPTH_TEST);
};

const render = (surface) => {
	const {gl, glcanvas, vars, cam} = surface;

	//gl.clearColor(0.9, 0.9, 0.9, 1);
	gl.clearColor(0,0,0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// projection
	const proj = new PerspectiveMatrix(40, 0.1, 4000, glcanvas.width/glcanvas.height);
	gl.uniformMatrix4fv(vars.uProjMatrix, false, new Float32Array(proj.data));

	// camera
	const view = viewMatrix(
		cam.pos,
		[cam.pos[0] + cam.lookDir[0], cam.pos[1] + cam.lookDir[1], cam.pos[2] + cam.lookDir[2]],
		[0, 1, 0]  // up
	);
	gl.uniformMatrix4fv(vars.uViewMatrix, false, view);

	// add temporary cubes to denote the location of the other cameras
	let tmpCubes = 0;
	if(!CADStarted) {
		for(const surf of surfaces) {
			if(surf === surface) continue;
			const color = [0.5, 0.5, 0.5];
			const scale = [0.2, 0.5, 0.2];
			const rotation = [0, surf.cam.rotX / Math.PI * 180, 0];
			scene.cubes.push(new Cube(color, scale, rotation, surf.cam.pos));
			tmpCubes ++;
		}
	}
	scene.draw(surface);
	for(let i = 0;i < tmpCubes;i ++) scene.cubes.pop();


	/*                         IMPORTANT NOTE
	 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
	 * https://stackoverflow.com/questions/32556939/saving-canvas-to-image-via-canvas-todataurl-results-in-black-rectangle?noredirect=1&lq=1
	 * https://stackoverflow.com/questions/61984296/i-get-invalid-type-error-when-trying-to-call-readpixels
	 * http://math.hws.edu/graphicsbook/c2/s1.html
	 *
	 * readPixels has MANY caveats. Here's what you need to know
	 * 1) always use gl.RGBA and gl.UNSIGNED_BYTE - this is the only remotely
	 *    portable combination
	 * 2) although the world thinks otherwise, my browser wants to use the
	 *    normal coordinate system when passing arguments
	 * 3) readPixels fills its output array starting from the lower bottom
	 *    corner of the image. This means that glpixels[0] is the red component
	 *    of the pixel with NORMAL coordinates (x, h-1)
	 */
	if(CADStarted) {
		gl.readPixels(
			surface.compare.x,
			//gl.drawingBufferHeight-1-surface.compare.y,
			surface.compare.y,
			surface.compare.w,
			surface.compare.h,
			gl.RGBA, gl.UNSIGNED_BYTE, surface.glpixels
		);
		/*
		gl.readPixels(
			0, 0, 1, 1,
			gl.RGBA, gl.UNSIGNED_BYTE, surface.glpixels
		);
		*/
	}
}
