class Matrix4 {
	constructor(data) {
		// column by column, identity matrix
		//                   aaaaaaa | bbbbbbb | ccccccc | ddddddd
		this.data = data || [1,0,0,0 , 0,1,0,0 , 0,0,1,0 , 0,0,0,1];
	};

	translatei(x, y, z) {
		this.data[0] += this.data[3] * x;
		this.data[4] += this.data[7] * x;
		this.data[8] += this.data[11]* x;
		this.data[12]+= this.data[15]* x;
		this.data[1] += this.data[3] * y;
		this.data[5] += this.data[7] * y;
		this.data[9] += this.data[11]* y;
		this.data[13]+= this.data[15]* y;
		this.data[2] += this.data[3] * z;
		this.data[6] += this.data[7] * z;
		this.data[10]+= this.data[11]* z;
		this.data[14]+= this.data[15]* z;
	};

	scalei(x, y, z) {
		this.data[0] *= x;
		this.data[4] *= x;
		this.data[8] *= x;
		this.data[12] *= x;
		this.data[1] *= y;
		this.data[5] *= y;
		this.data[9] *= y;
		this.data[13] *= y;
		this.data[2] *= z;
		this.data[6] *= z;
		this.data[10]*= z;
		this.data[14] *= z;
	};

	sub(other) {
		let arr = [];
		for(let i = 0;i < 16;i ++) arr[i] = this.data[i] - other.data[i];
		return new Matrix4(arr);
	}

	add(other) {
		let arr = [];
		for(let i = 0;i < 16;i ++) arr[i] = this.data[i] + other.data[i];
		return new Matrix4(arr);
	}

	only0() {
		for(let i = 0;i < 16;i ++) {
			if(Math.abs(this.data[i]) > 0.000001) return false;
		}
		return true;
	}
};

class PerspectiveMatrix extends Matrix4 {
	constructor(angle, near, far, aspect) {
		super();

		angle = angle / 360 * (Math.PI * 2); // convert from deg to rad

		const ctg = 1 / Math.tan(angle / 2);
		this.data = [
			ctg / aspect, 0, 0, 0, // column 0
			0, ctg, 0, 0, // column 1
			0, 0, (near+far)/(near-far), -1, // column 2
			0, 0, 2*near*far/(near-far), 0 // column 3
		];
	}
};

const test = () => {
	console.log('starting tests');

	const a = new Matrix4();
	a.scalei(1, 1, 1);
	console.log(a.sub(new Matrix4()).only0());

	const b = new Matrix4();
	b.scalei(2, 2, 2);
	b.translatei(10, 12, -45);
	b.translatei(-10, -12, 45);
	b.scalei(1/2, 1/2, 1/2);
	console.log(b.sub(new Matrix4()).only0());

	console.log('tests finished. you should see only true');
};

test();
