class Matrix4 {
	constructor() {
		// column by column, identity matrix
		//           aaaaaaa | bbbbbbb | ccccccc | ddddddd
		this.data = [1,0,0,0 , 0,1,0,0 , 0,0,1,0 , 0,0,0,1];
	};

	translate(x, y, z) {
		this.data[12] += this.data[0]*x + this.data[4]*y + this.data[8]*z;
		this.data[13] += this.data[1]*x + this.data[5]*y + this.data[9]*z;
		this.data[14] += this.data[2]*x + this.data[6]*y + this.data[10]*z;
	};

	scale(x, y, z) {
		this.data[0] *= x; this.data[1] *= x; this.data[2] *= x;
		this.data[4] *= y; this.data[5] *= y; this.data[6] *= y;
		this.data[8] *= z; this.data[9] *= z; this.data[10] *= z;
	};
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
