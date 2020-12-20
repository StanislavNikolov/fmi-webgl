const render = () => {
	gl.clearColor(1, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.POINTS, 0, 1);
}
