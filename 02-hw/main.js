const POINTS_PER_WAVE = 100;
const map = (x, a, b) => a + (b-a) * x;

// Adapted from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
const hslToRgb = (h, s, l) => {
	if(s == 0) return [l, l, l]; // achromatic

	const hue2rgb = (p, q, t) => {
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if(t < 1/6) return p + (q - p) * 6 * t;
		if(t < 1/2) return q;
		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
	}

	const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p = 2 * l - q;
	return [
	    hue2rgb(p, q, h + 1/3) // r
	   ,hue2rgb(p, q, h) // g
	   ,hue2rgb(p, q, h - 1/3) // b
	];
}

/* utilities to create "vertical" waves
 * w0 w1  w2 w3
 * |  \   /  |
 * |   |  \  |
 * |   \   \ |
 * |    /  | |
 */

const createVWave = (xStart, amplitude, frequency) => {
	const points = [];
	for(let pI = 0;pI < POINTS_PER_WAVE;pI ++) {
		const y = map(pI / (POINTS_PER_WAVE-1), 1, -1);
		const x = xStart + Math.sin(y * frequency) * amplitude;
		points.push(x, y);
	}
	return points;
};

const makeWaves = (waveCount) => {
	const waves = [];

	waves.push(createVWave(-1, 0, 0)); // right straigh line

	for(let i = 0;i < waveCount;i ++) {
		const xStart = map(i / (waveCount-1), -0.9, 0.9);
		const amplitude = map(Math.random(), 0.05, 0.10);
		const frequency = map(Math.random(), 1, 10);
		waves.push(createVWave(xStart, amplitude, frequency));
	}

	waves.push(createVWave(1, 0, 0)); // right straigh line

	return waves;
};

/* interlieve wave points into strips with proper LINE_STRIP order
 * adds a border of white points after every strip
 */
const interlieveWaves = (wA, wB, makeBorder) => {
	if(wA.length !== wB.length) throw "Wave lengths differ";
	if(wA.length % 2 !== 0 || wB.length % 2 !== 0) throw "Invalid wave";

	const merged = [];

	// strip
	const rgb = hslToRgb(Math.random(), 0.4, 0.5);
	const r = Math.random(), g = Math.random(), b = Math.random();
	for(let pIdx = 0;pIdx < wA.length / 2;pIdx ++) {
		merged.push(wA[pIdx * 2 + 0], wA[pIdx * 2 + 1], rgb[0], rgb[1], rgb[2],
		            wB[pIdx * 2 + 0], wB[pIdx * 2 + 1], rgb[0], rgb[1], rgb[2]
		);
	}

	if(!makeBorder) return merged;

	// white border on the left
	const BORDER_WIDTH = 0.02;
	for(let pIdx = 0;pIdx < wB.length / 2;pIdx ++) {
		merged.push(wB[pIdx * 2 + 0], wB[pIdx * 2 + 1], 1.0, 1.0, 1.0,
					wB[pIdx * 2 + 0] - BORDER_WIDTH, wB[pIdx * 2 + 1], 1.0, 1.0, 1.0
		);
	}

	return merged;
};

const waves = makeWaves(7);
const data = [];
for(let wI = 0;wI < waves.length - 1;wI ++) {
	data.push(...interlieveWaves(waves[wI], waves[wI+1], wI !== waves.length - 2));
}

const setup = () => {
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	const aXY = gl.getAttribLocation(shaderProgram, 'aXY');
	const aRGB = gl.getAttribLocation(shaderProgram, 'aRGB');
	gl.enableVertexAttribArray(aXY);
	gl.enableVertexAttribArray(aRGB);
	gl.vertexAttribPointer(aXY,  2, gl.FLOAT, false, 5 * FLOAT_SIZE, 0);
	gl.vertexAttribPointer(aRGB, 3, gl.FLOAT, false, 5 * FLOAT_SIZE, 2 * FLOAT_SIZE);

};

const render = () => {
	gl.clearColor(1, 1, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.lineWidth(10);
	//gl.enable()

	// if there are N waves, there are N-1 strips
	for(let strip = 0;strip < waves.length - 1;strip ++) {
		// strip
		gl.drawArrays(gl.TRIANGLE_STRIP,
		              strip * POINTS_PER_WAVE * 4 + POINTS_PER_WAVE * 0,
		              POINTS_PER_WAVE * 2
		);

		// border
		gl.drawArrays(gl.TRIANGLE_STRIP,
		              strip * POINTS_PER_WAVE * 4 + POINTS_PER_WAVE * 2,
		              POINTS_PER_WAVE * 2
		);
	}

	//gl.drawArrays(gl.POINTS, 0, data.length / 5);
};
