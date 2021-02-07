const setup = (surface) => {
	const gl = surface.gl;
	surface.vars = {};

	surface.vars.uTrans = gl.getUniformLocation(surface.program, 'uTrans');
	surface.vars.uScale = gl.getUniformLocation(surface.program, 'uScale');
	surface.vars.uColor = gl.getUniformLocation(surface.program, 'uColor');

	surface.vars.aXY = gl.getAttribLocation(surface.program, 'aXY');
	gl.enableVertexAttribArray(surface.vars.aXY);

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
};

const render = (currentFrame) => {
	console.time('render');

	if(main.redraw) {
		renderPlots(main, leftSelVal, rightSelVal);
		main.redraw = false;
	}
	if(lower.redraw) {
		renderPlots(lower, 0.0, 1.0);
		lower.redraw = false;
	}

	console.timeEnd('render');
};
