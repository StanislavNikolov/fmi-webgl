const setup = () => {
	/*
	gl.uniform3f(uColor,0.3,0.7,0.2);
	gl.enableVertexAttribArray(aXY);
	//                                          total  offset
	gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 0, 0);
	*/

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
	// рисуваме рамките на куба
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

	const proj = new PerspectiveMatrix(30, 1, 4000, canvas.width/canvas.height);
	const projMatrixLoc = gl.getUniformLocation(shaderProgram, 'uProjMatrix');
	gl.uniformMatrix4fv(projMatrixLoc, false, new Float32Array(proj.data));
};

let frame = 0;
const render = () => {
	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const projModelLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');

	const cube = mat => {
		gl.uniformMatrix4fv(projModelLoc, false, new Float32Array(mat.data));
		gl.drawArrays(gl.LINE_LOOP, 0, 4); // предна стена
		gl.drawArrays(gl.LINE_LOOP, 4, 4); // задна стена
		gl.drawArrays(gl.LINES,     8, 8); // околни ръбове между тях
	}

	// WORKS!!
	//const mat = new Matrix4();
	//mat.translatei(5, 5, -30);

	/*
	for(let i = 0;i < 10;i ++) {
		const mat = new Matrix4();
		mat.scalei(i, 2, i);
		mat.translatei(0, -i, -30);
		cube(mat);
	}
	*/

	const mat = new Matrix4();
	mat.rotatei(frame, 0, 1, 0);
	for(let i = 1;i < 13;i ++) {
		mat.scalei(1.3, 1, 1.3);
		mat.translatei(0, -i - 4, -100);
		cube(mat);

		mat.translatei(0, i + 4, 100);
		//mat.scalei(1/i, 1/2, 1/i);
	}


	//mat.scalei(2, 2, 4);
	/*
	mat.translate(
		map(Math.random(), -500, 500),
		map(Math.random(), -500, 500),
		map(Math.random(), -500, 0)
	);
	*/

	frame ++;
	window.requestAnimationFrame(render);
};
