let time = 0;

const N = 100;

const setup = () => {
	const data = [];
	const radius = 0.3;
	for(let i = 0;i < N;i ++) {
		data.push(Math.cos(i / N * Math.PI * 2) * radius);
		data.push(Math.sin(i / N * Math.PI * 2) * radius);
	}
	for(let i = 0;i < N;i ++) {
		// scalp
		data.push(Math.cos(i / N * Math.PI * 2) * radius);
		data.push(Math.sin(i / N * Math.PI * 2) * radius);

		// tail
		const extRad = radius * (Math.random() + 1);
		data.push(Math.cos(i / N * Math.PI * 2) * extRad);
		data.push(Math.sin(i / N * Math.PI * 2) * extRad);
	}

	const aXY = gl.getAttribLocation(shaderProgram, 'aXY');
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(aXY);
	gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 0, 0);
}

const render = () => {
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	time += 0.01;

	//gl.vertexAttrib1f(gl.getAttribLocation(shaderProgram, 'aTime'), time);
	//gl.vertexAttrib1f(gl.getAttribLocation(shaderProgram, 'aRowCnt'), rows);
	const ratio = canvas.height / canvas.width;
	gl.vertexAttrib1f(gl.getAttribLocation(shaderProgram, 'aRatio'), ratio);

	gl.drawArrays(gl.LINE_LOOP, 0, N);
	gl.drawArrays(gl.LINES, N, 2*N);

	//window.requestAnimationFrame(render);
	//setTimeout(render, 1000 / 60);
}
