const DEG2RAD = Math.PI / 180;

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
		this.data[12]*= x;
		this.data[1] *= y;
		this.data[5] *= y;
		this.data[9] *= y;
		this.data[13]*= y;
		this.data[2] *= z;
		this.data[6] *= z;
		this.data[10]*= z;
		this.data[14]*= z;
	};

	rotatei(angle, x, y, z)
	{
		const c = Math.cos(angle * DEG2RAD);
		const s = Math.sin(angle * DEG2RAD);
		const c1 = 1 - c;
		const m0 = this.data[0],  m4 = this.data[4],  m8 = this.data[8],  m12= this.data[12],
		      m1 = this.data[1],  m5 = this.data[5],  m9 = this.data[9],  m13= this.data[13],
		      m2 = this.data[2],  m6 = this.data[6],  m10= this.data[10], m14= this.data[14];

		// build rotation matrix
		const r0 = x * x * c1 + c;
		const r1 = x * y * c1 + z * s;
		const r2 = x * z * c1 - y * s;
		const r4 = x * y * c1 - z * s;
		const r5 = y * y * c1 + c;
		const r6 = y * z * c1 + x * s;
		const r8 = x * z * c1 + y * s;
		const r9 = y * z * c1 - x * s;
		const r10= z * z * c1 + c;

		// multiply rotation matrix
		this.data[0] = r0 * m0 + r4 * m1 + r8 * m2;
		this.data[1] = r1 * m0 + r5 * m1 + r9 * m2;
		this.data[2] = r2 * m0 + r6 * m1 + r10* m2;
		this.data[4] = r0 * m4 + r4 * m5 + r8 * m6;
		this.data[5] = r1 * m4 + r5 * m5 + r9 * m6;
		this.data[6] = r2 * m4 + r6 * m5 + r10* m6;
		this.data[8] = r0 * m8 + r4 * m9 + r8 * m10;
		this.data[9] = r1 * m8 + r5 * m9 + r9 * m10;
		this.data[10]= r2 * m8 + r6 * m9 + r10* m10;
		this.data[12]= r0 * m12+ r4 * m13+ r8 * m14;
		this.data[13]= r1 * m12+ r5 * m13+ r9 * m14;
		this.data[14]= r2 * m12+ r6 * m13+ r10* m14;
	}

	rotateXi(angle)
	{
		const c = Math.cos(angle * DEG2RAD);
		const s = Math.sin(angle * DEG2RAD);
		const m1 = this.data[1],  m2 = this.data[2],
			m5 = this.data[5],  m6 = this.data[6],
			m9 = this.data[9],  m10= this.data[10],
			m13= this.data[13], m14= this.data[14];

		this.data[1] = m1 * c + m2 *-s;
		this.data[2] = m1 * s + m2 * c;
		this.data[5] = m5 * c + m6 *-s;
		this.data[6] = m5 * s + m6 * c;
		this.data[9] = m9 * c + m10*-s;
		this.data[10]= m9 * s + m10* c;
		this.data[13]= m13* c + m14*-s;
		this.data[14]= m13* s + m14* c;
	}

	rotateYi(angle)
	{
		const c = Math.cos(angle * DEG2RAD);
		const s = Math.sin(angle * DEG2RAD);
		const m0 = this.data[0],  m2 = this.data[2],
		      m4 = this.data[4],  m6 = this.data[6],
		      m8 = this.data[8],  m10= this.data[10],
		      m12= this.data[12], m14= this.data[14];

		this.data[0] = m0 * c + m2 * s;
		this.data[2] = m0 *-s + m2 * c;
		this.data[4] = m4 * c + m6 * s;
		this.data[6] = m4 *-s + m6 * c;
		this.data[8] = m8 * c + m10* s;
		this.data[10]= m8 *-s + m10* c;
		this.data[12]= m12* c + m14* s;
		this.data[14]= m12*-s + m14* c;
	}

	rotateZi(angle)
	{
		const c = cosf(angle * DEG2RAD);
		const s = sinf(angle * DEG2RAD);
		const m0 = this.data[0],  m1 = this.data[1],
		      m4 = this.data[4],  m5 = this.data[5],
		      m8 = this.data[8],  m9 = this.data[9],
		      m12= this.data[12], m13= this.data[13];

		this.data[0] = m0 * c + m1 *-s;
		this.data[1] = m0 * s + m1 * c;
		this.data[4] = m4 * c + m5 *-s;
		this.data[5] = m4 * s + m5 * c;
		this.data[8] = m8 * c + m9 *-s;
		this.data[9] = m8 * s + m9 * c;
		this.data[12]= m12* c + m13*-s;
		this.data[13]= m12* s + m13* c;
	}

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
