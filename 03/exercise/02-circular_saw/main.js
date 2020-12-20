const points = 2000;
const data = [];
for(let i = 0;i < points;i ++) {
	data.push(i / points);
}

const setup = () => {
	animated = true;

	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	const aI = gl.getAttribLocation(shaderProgram, 'aI');
	gl.enableVertexAttribArray(aI);
	//                                          total  offset
	gl.vertexAttribPointer(aI, 1, gl.FLOAT, false, 0, 0);
};

let frame = 0;
const render = () => {
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uFrame'), frame);
	gl.uniform2f(gl.getUniformLocation(shaderProgram, 'uAspect'), canvas.height/canvas.width, 1);

	gl.drawArrays(gl.LINE_LOOP, 0, points);

	frame += 1;
};
