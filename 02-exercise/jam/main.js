const data = [
	// x, y, r, g, b
];

//                      a      b       c    color (in 0-255)
const addTriangle = (x1,y1,  x2,y2,  x3,y3,  r,g,b) => {
	data.push(x1, y1, r / 255, g / 255, b / 255);
	data.push(x2, y2, r / 255, g / 255, b / 255);
	data.push(x3, y3, r / 255, g / 255, b / 255);
};

// fill the screen
addTriangle(-10,-10,  0,10,  10,0,  255,204,0);

// green from top and bottom
addTriangle(-0.8, 1,  0.8, 1,  0, 0.2,  25,153,51);
addTriangle(-0.8,-1,  0.8,-1,  0,-0.2,  25,153,51);

// black from left and right
addTriangle(-1,0.8,  -1,-0.8,  -0.2,0,  0,0,0);
addTriangle( 1,0.8,   1,-0.8,   0.2,0,  0,0,0);

const setup = () => {
};

const render = () => {
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	const aXY = gl.getAttribLocation(shaderProgram, 'aXY');
	gl.enableVertexAttribArray(aXY);
	gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false,
		5 * FLOAT_SIZE, 0 * FLOAT_SIZE);

	const aRGB = gl.getAttribLocation(shaderProgram, 'aRGB');
	gl.enableVertexAttribArray(aRGB);
	gl.vertexAttribPointer(aRGB, 3, gl.FLOAT, false,
		5 * FLOAT_SIZE, 2 * FLOAT_SIZE);


	gl.drawArrays(gl.TRIANGLES, 0, data.length / 5);
};
