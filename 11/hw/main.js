const POINTS_PER_FUNCTION = 50000;

class Plot {
	constructor(color, func) {
		this.color = color;
		this.rawBytes = new ArrayBuffer(POINTS_PER_FUNCTION * 2 * 4);
		this.view = new Float32Array(this.rawBytes);

		for(let i = 0;i < POINTS_PER_FUNCTION;i ++) {
			const x = i / POINTS_PER_FUNCTION;
			const noise = Math.random() * 0.05;
			this.view[i*2+0] = x;
			this.view[i*2+1] = func(x) + noise;
		}
	}
}

console.time('data generation');
const randColor = () => [Math.random(), Math.random(), Math.random()];
const plots = [
	new Plot(randColor(), x => Math.sin(x * 10)),
	new Plot(randColor(),
		x => Math.max(Math.min(Math.tan(x * 23), 1.5), -1.5) * Math.cos(x*3)
	),
	new Plot(randColor(), x => Math.log(x + 0.3)),
	new Plot(randColor(), x => (x-0.5)*(x-0.5)*10),
	new Plot(randColor(), x => Math.cos(x * 301) * 0.2),
	new Plot(randColor(), x => (x-0.5)*(x-0.5)*5 + Math.sin(x*50) * 0.1),
];
console.timeEnd('data generation');


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

const renderPlots = (surface, leftSel, rightSel) => {
	const gl = surface.gl;

	gl.clearColor(0.0, 0.0, 0.0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const pfrom = Math.floor(leftSel * POINTS_PER_FUNCTION);
	const pto = Math.ceil(rightSel * POINTS_PER_FUNCTION);

	let low = plots[0].view[pfrom*2+1];
	let high = plots[0].view[pfrom*2+1];
	for(const plot of plots) {
		for(let i = pfrom;i < pto;i ++) {
			high = Math.max(high, plot.view[i*2+1]);
			low  = Math.min(low,  plot.view[i*2+1]);
		}
	}

	// fml, took me 10 minutes to math this out!!!
	gl.uniform2f(surface.vars.uScale, -2 / (leftSel-rightSel), -2 / (low-high));
	gl.uniform2f(surface.vars.uTrans, (leftSel+rightSel) / (-2), (low+high) / (-2));

	for(const plot of plots) {
		gl.uniform3f(surface.vars.uColor, plot.color[0], plot.color[1], plot.color[2]);
		const view = new Float32Array(plot.rawBytes, pfrom * 2 * 4, (pto-pfrom) * 2);

		gl.bufferData(gl.ARRAY_BUFFER, view, gl.STATIC_DRAW);
		gl.vertexAttribPointer(surface.vars.aXY, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.LINE_STRIP, 0, pto-pfrom);
		//gl.drawArrays(gl.POINTS, 0, pto-pfrom);
	}
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
