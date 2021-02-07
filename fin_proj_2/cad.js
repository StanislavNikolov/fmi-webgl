const initScene = () => {
	let cubes = [];
	let count = 1;
	for(let x = -count;x <= count;x ++) {
		for(let z = -count;z <= count;z ++) {
			const color = [r(), r(), r()];
			//const scale = [r(), r()*3, r()];
			//const rotation = [0, R(360), 0];
			//const position = [R(10), scale[1]/2, R(10)];

			//const color = [(x-count) / (2*count), 0.5, 0.5];
			const height = (x === 0 && z === 0 ? 2 : 0.1);
			const scale = [MAX_CUBE_SCALE, height, MAX_CUBE_SCALE];
			const rotation = [0, 0, 0];
			const position = [x*2, scale[1]/2, z*2];

			cubes.push(new Cube(color, scale, rotation, position));
		}
	}
	cubes.push(new Cube([0.3, 0.5, 0.6], [1000, 0.1, 1000], [0,0,0], [0,-0.1,0]));
	return cubes;
}
scene = new Scene();
//scene.cubes.push(...initScene());

class Operation {
	static TYPES = [
		'ADD',
		'REMOVE',
		'CHANGE_COLOR', 'CHANGE_COLOR',
		'CHANGE_POSITION', 'CHANGE_POSITION', 'CHANGE_POSITION', 'CHANGE_POSITION',
		'CHANGE_SCALE', 'CHANGE_SCALE', 'CHANGE_SCALE', 'CHANGE_SCALE',
	];
	//static TYPES = ['CHANGE_COLOR'];

	constructor() {
		let bad = false;
		//this.type = Operation.TYPES[Math.floor(Math.random() * Operation.TYPES.length)];
		do {
			this.type = Operation.TYPES[Math.floor(Math.random() * Operation.TYPES.length)];
			bad = (scene.cubes.length >= MAX_CUBE_COUNT && this.type === 'ADD') || (scene.cubes.length === 0 && this.type !== 'ADD');
		} while(bad);
		this.payload = null;
	}
	apply() {
		if(this.type === 'ADD') {
			const color = [r(), r(), r()];
			const scale = [
				map(r(), MIN_CUBE_SCALE, MAX_CUBE_SCALE),
				map(r(), MIN_CUBE_SCALE, MAX_CUBE_SCALE),
				map(r(), MIN_CUBE_SCALE, MAX_CUBE_SCALE)
			];
			const rotation = [0,0,0];
			//const rotation = [R(360), R(360), R(360)];
			const position = [R(POSITION_SCALE), R(POSITION_SCALE), R(POSITION_SCALE)];
			this.payload = new Cube(color, scale, rotation, position);
			scene.cubes.push(this.payload);
		}
		if(this.type === 'REMOVE') {
			const idx = Math.floor(Math.random() * scene.cubes.length);
			this.payload = scene.cubes.splice(idx, 1)[0];
		}
		if(this.type === 'CHANGE_COLOR') {
			const idx = Math.floor(Math.random() * scene.cubes.length);
			const diff = [R(0.1), R(0.1), R(0.1)];
			this.payload = {idx: idx, diff: diff};
			scene.cubes[idx].color[0] += diff[0];
			scene.cubes[idx].color[1] += diff[1];
			scene.cubes[idx].color[2] += diff[2];
		}
		if(this.type === 'CHANGE_POSITION') {
			const idx = Math.floor(Math.random() * scene.cubes.length);
			const koef = Math.random() > 0.5 ? 0.01 : 0.8;
			const diff = [R(POSITION_SCALE * koef), R(POSITION_SCALE * koef), R(POSITION_SCALE * koef)];
			this.payload = {idx: idx, diff: diff};

			const MIN = -POSITION_SCALE;
			const MAX = POSITION_SCALE;
			for(let i = 0;i < 3;i ++) {
				if(scene.cubes[idx].position[i] + diff[i] < MIN) {
					diff[i] = MIN - scene.cubes[idx].position[i];
				}
				if(scene.cubes[idx].position[i] + diff[i] > MAX) {
					diff[i] = MAX - scene.cubes[idx].position[i];
				}
				scene.cubes[idx].position[i] += diff[i];
			}

			scene.cubes[idx].recalc();
		}
		if(this.type === 'CHANGE_SCALE') {
			const idx = Math.floor(Math.random() * scene.cubes.length);
			const koef = Math.random() > 0.5 ? 0.01 : 0.8;
			const diff = [R(MAX_CUBE_SCALE*koef), R(MAX_CUBE_SCALE*koef), R(MAX_CUBE_SCALE*koef)];
			this.payload = {idx: idx, diff: diff};

			const MIN = MIN_CUBE_SCALE;
			const MAX = MAX_CUBE_SCALE;
			for(let i = 0;i < 3;i ++) {
				if(scene.cubes[idx].scale[i] + diff[i] < MIN) {
					diff[i] = MIN - scene.cubes[idx].scale[i];
				}
				if(scene.cubes[idx].scale[i] + diff[i] > MAX) {
					diff[i] = MAX - scene.cubes[idx].scale[i];
				}
				scene.cubes[idx].scale[i] += diff[i];
			}

			scene.cubes[idx].recalc();
		}
	}
	revert() {
		if(this.type === 'ADD') {
			scene.cubes.pop(this.payload);
		}
		if(this.type === 'REMOVE') {
			scene.cubes.push(this.payload);
		}
		if(this.type === 'CHANGE_COLOR') {
			const {idx, diff} = this.payload;
			scene.cubes[idx].color[0] -= diff[0];
			scene.cubes[idx].color[1] -= diff[1];
			scene.cubes[idx].color[2] -= diff[2];
		}
		if(this.type === 'CHANGE_POSITION') {
			const {idx, diff} = this.payload;

			scene.cubes[idx].position[0] -= diff[0];
			scene.cubes[idx].position[1] -= diff[1];
			scene.cubes[idx].position[2] -= diff[2];
			scene.cubes[idx].recalc();
		}
		if(this.type === 'CHANGE_SCALE') {
			const {idx, diff} = this.payload;

			scene.cubes[idx].scale[0] -= diff[0];
			scene.cubes[idx].scale[1] -= diff[1];
			scene.cubes[idx].scale[2] -= diff[2];
			scene.cubes[idx].recalc();
		}
	}
}

let bestScore = 1e50;
let lastOp = null;
const iterateBeforeRender = () => {
	lastOp = new Operation();
	lastOp.apply();
}

let iterationsCount = 0, successCount = 0;
let lastPrint = new Date();
const iterateAfterRender = () => {
	iterationsCount ++;

	let total = scene.cubes.length * 1000;
	for(const surf of surfaces) {
		total += surf.calcScore()
	}

	if(total >= bestScore) {
		lastOp.revert();
	} else {
		successCount ++;
		bestScore = total;
	}

	let now = new Date();
	if(now - lastPrint > 500) {
		//console.log('best score:', bestScore, 'cubes:', scene.cubes.length);
		console.log('successfull changes:', successCount);
		const itps = iterationsCount / ((now-lastPrint) / 500);
		document.getElementById('itps').innerText = itps.toFixed(2);
		document.getElementById('score').innerText = bestScore;
		document.getElementById('cubes').innerText = scene.cubes.length;
		iterationsCount = 0;
		successCount = 0;
		lastPrint = now;
	}
}
