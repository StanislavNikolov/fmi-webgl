let cameraMode = null;
let cam = null;
let isKeyPressed = [];

const setTopDownCamera = () => {
	document.getElementById('instructions').innerHTML = `
		Use W/A/S/D to fly above.<br>
		Use up/down arrows to get closer/further away.
	`;
	cameraMode = 0;
	cam = [5, 55, -5];
};

const setSidewaysCamera = () => {
	document.getElementById('instructions').innerHTML = `
		Use W/S to move ahead/back.<br>
		Use A/D to move left/right.<br>
		Use up/down arrows to move up/down.
	`;
	cameraMode = 1;
	cam = [0, 10, 50];
};

const setAnimatedCamera = () => {
	document.getElementById('instructions').innerHTML = `
		Just enjoy the view :D<br>
		Press the buttons for other user controllable cameras.
	`;
	cameraMode = 2;
};

document.getElementById('top-down').onclick = setTopDownCamera;
document.getElementById('sideways').onclick = setSidewaysCamera;
document.getElementById('animated').onclick = setAnimatedCamera;

const setup = () => {
	const a = 1.0 / 2;

	const data = [
		-a,-a,+a, // (0)  // предна стена
		+a,-a,+a, // (1)
		+a,+a,+a, // (2)
		-a,+a,+a, // (3)

		-a,-a,-a, // (4) // задна стена
		+a,-a,-a, // (5)
		+a,+a,-a, // (6)
		-a,+a,-a, // (7)

		-a,-a,+a, // (0) // леви ръбове
		-a,-a,-a, // (4)
		-a,+a,+a, // (3)
		-a,+a,-a, // (7)

		+a,-a,+a, // (1) // десни ръбове
		+a,-a,-a, // (5)
		+a,+a,+a, // (2)
		+a,+a,-a, // (6)
	];

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	const aPosition = gl.getAttribLocation(shaderProgram, 'aPosition');
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

	setAnimatedCamera();
};

let frame = 0;
const render = () => {
	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const projModelLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
	const projViewLoc  = gl.getUniformLocation(shaderProgram, 'uViewMatrix');

	const proj = new PerspectiveMatrix(30, 1, 4000, canvas.width/canvas.height);
	const projMatrixLoc = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	gl.uniformMatrix4fv(projMatrixLoc, false, new Float32Array(proj.data));

	const cube = mat => {
		gl.uniformMatrix4fv(projModelLoc, false, new Float32Array(mat.data));
		gl.drawArrays(gl.LINE_LOOP, 0, 4); // предна стена
		gl.drawArrays(gl.LINE_LOOP, 4, 4); // задна стена
		gl.drawArrays(gl.LINES,     8, 8); // околни ръбове между тях
	}

	if(cameraMode === 0) {
		// top-down view
		if(isKeyPressed[68]) cam[0] ++; // d
		if(isKeyPressed[65]) cam[0] --; // a
		if(isKeyPressed[87]) cam[2] --; // w
		if(isKeyPressed[83]) cam[2] ++; // s
		if(isKeyPressed[38]) cam[1] --; // up
		if(isKeyPressed[40]) cam[1] ++; // down

		gl.uniformMatrix4fv(projViewLoc, false, viewMatrix(
			cam,
			[cam[0], cam[1] - 1, cam[2]],
			[0, 0, -1]
		));
	} else if(cameraMode === 1) {
		// sideways view
		if(isKeyPressed[68]) cam[0] ++; // d
		if(isKeyPressed[65]) cam[0] --; // a
		if(isKeyPressed[87]) cam[2] --; // w
		if(isKeyPressed[83]) cam[2] ++; // s
		if(isKeyPressed[38]) cam[1] ++; // up
		if(isKeyPressed[40]) cam[1] --; // down

		gl.uniformMatrix4fv(projViewLoc, false, viewMatrix(
			cam,
			[cam[0], cam[1], cam[2] - 1],
			[0, 1, 0]
		));
	} else {
		const fr = frame * 0.02;
		gl.uniformMatrix4fv(projViewLoc, false, viewMatrix(
			[Math.cos(fr) * 40, 40, Math.sin(fr) * 40],
			[0, 0, 0],
			[0, 1, 0]
		));
	}

	const calc = ang => {
		return [
			16 * Math.sin(ang) * Math.sin(ang) * Math.sin(ang),
			13 * Math.cos(ang) - 5*Math.cos(2*ang) - 2*Math.cos(3*ang) - Math.cos(4*ang)
		];
	};

	const heartLayer = (cnt, yOffset, angOffset) => {
		// https://mathworld.wolfram.com/HeartCurve.html
		for(let i = 0;i < cnt;i ++) {
			const curr = calc(map(i     / (cnt-1), 0, Math.PI * 2) + Math.PI*2 + angOffset);
			const next = calc(map((i+1) / (cnt-1), 0, Math.PI * 2) + Math.PI*2 + angOffset);

			const ang = Math.PI - Math.atan2(next[1] - curr[1], next[0] - curr[0]);

			const mat = new Matrix4();
			mat.scalei(0.5, 0.5, 1);
			mat.rotateYi(ang * 180 / Math.PI);
			mat.translatei(curr[1], yOffset, -curr[0]);
			cube(mat);
		}
	}

	for(let i = 0;i < 20;i ++) {
		heartLayer(90, i * 0.55, Math.PI * 0.1 * (i % 2));
	}

	frame ++;
	window.requestAnimationFrame(render);
};

window.addEventListener('keydown', ev => isKeyPressed[ev.keyCode] = true);
window.addEventListener('keyup',   ev => isKeyPressed[ev.keyCode] = false);
