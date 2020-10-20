const setup = () => {
	console.log('asd');

	/*
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,2,3]), gl.STATIC_DRAW);

	gl.uniform3f(uColor,0.3,0.7,0.2);
	const aXY = gl.getAttribLocation(shaderProgram, 'aXY');
	gl.enableVertexAttribArray(aXY);
	//                                          total  offset
	gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 0, 0);
	*/
};

const render = () => {
	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.POINTS, 0, 1);
};
