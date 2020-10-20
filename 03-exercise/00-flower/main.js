const data = [];

const points = 1000;
for(let i = 0;i < points;i ++) {
	data.push(i / points);
}

const setup = () => {
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	const aPercent = gl.getAttribLocation(shaderProgram, 'aPercent');
	gl.enableVertexAttribArray(aPercent);
	//                                          total  offset
	gl.vertexAttribPointer(aPercent, 1, gl.FLOAT, false, 0, 0);

};

const render = () => {
	console.time('render');

	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const uRatio = gl.getUniformLocation(shaderProgram, 'uRatio');
	gl.uniform1f(uRatio, canvas.height / canvas.width);

	gl.drawArrays(gl.TRIANGLE_FAN, 0, points);

	console.timeEnd('render');
};
