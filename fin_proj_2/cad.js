const initScene = () => {
	let cubes = [];
	let count = 5;
	for(let x = -count;x <= count;x ++) {
		for(let z = -count;z <= count;z ++) {
			const color = [r(), r(), r()];
			//const scale = [r(), r()*3, r()];
			//const rotation = [0, R(360), 0];
			//const position = [R(10), scale[1]/2, R(10)];

			//const color = [(x-count) / (2*count), 0.5, 0.5];
			const height = (x === 0 && z === 0 ? 2 : 0.1);
			const scale = [0.2, height, 0.2];
			const rotation = [0, 0, 0];
			const position = [x*2, scale[1]/2, z*2];

			cubes.push(new Cube(color, scale, rotation, position));
		}
	}
	cubes.push(new Cube([0.3, 0.5, 0.6], [1000, 0.1, 1000], [0,0,0], [0,-0.1,0]));
	return cubes;
}
scene = new Scene();
scene.cubes.push(...initScene());

class Operation {
	static TYPES = ['ADD', 'REMOVE'];
	constructor() {
		this.type = Operation.TYPES[Math.floor(Math.random() * Operation.TYPES.length)];
		this.payload = null;
	}
	apply() {
		if(this.type === 'ADD') {
			const color = [r(), r(), r()];
			const scale = [r()*2, r()*2, r()*2];
			const rotation = [R(360), R(360), R(360)];
			const position = [R(2), R(2), R(2)];
			this.payload = new Cube(color, scale, rotation, position);
			scene.cubes.push(this.payload);
		}
		if(this.type === 'REMOVE') {
			const idx = Math.floor(Math.random() * scene.cubes.length);
			this.payload = scene.cubes.splice(idx, 1)[0];
		}
		/*
		if(this.type === 'CHANGE') {
			const idx = Math.floor(Math.random() * scene.cubes.length);
			this.splice = 
		}
		*/
	}
	revert() {
		if(this.type === 'ADD') {
			scene.cubes.pop(this.payload);
		}
		if(this.type === 'REMOVE') {
			scene.cubes.push(this.payload);
		}
	}
}

let bestScore = 1e50;
let lastOp = null;
const iterateBeforeRender = () => {
	lastOp = new Operation();
	lastOp.apply();
}

const iterateAfterRender = () => {
	let total = 0;
	for(const surf of surfaces) {
		total += surf.calcScore()
	}

	if(total > bestScore) {
		lastOp.revert();
	} else {
		bestScore = total;
	}
}
