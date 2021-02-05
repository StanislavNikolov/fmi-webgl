let currentFrame = 0;
const renderWrapper = () => {
	for(const surf of surfaces) render(surf);

	currentFrame += 1;
	window.requestAnimationFrame(renderWrapper);
};

let surfaces = [];
let activeSurface = null;

const addSurface = () => {
	const cvs = document.createElement('canvas');
	cvs.id = Math.random();
	document.getElementById('container').appendChild(cvs);

	const surf = new Surface(cvs.id, 'vert.glsl', 'frag.glsl');
	surfaces.push(surf);

	surf.canvas.addEventListener('click', () => {
		surf.canvas.requestPointerLock();
	});

	surf.canvas.addEventListener('mousemove', (ev) => {
		if(activeSurface == null || activeSurface !== surf) return;

		surf.cam.rotDX(ev.movementX / 500.0)
		surf.cam.rotDY(ev.movementY / 500.0);
		surf.cam.calcLookDir();
	});

	setup(surf);
}

window.addEventListener('load', () => {
	for(let i = 0;i < 4;i ++) addSurface();
	surfaces[0].cam.pos = [ 10, 1,   0]; surfaces[0].cam.rotDX(-Math.PI/2);
	surfaces[1].cam.pos = [  0, 1,  10];
	surfaces[2].cam.pos = [-10, 1,   0]; surfaces[2].cam.rotDX(Math.PI/2);
	surfaces[3].cam.pos = [0  , 1, -10]; surfaces[3].cam.rotDX(Math.PI);

	window.addEventListener('resize', () => {
		for(const surf of surfaces) surf.rescale();
	});
	for(const surf of surfaces) surf.rescale();

	document.addEventListener('pointerlockchange', (ev) => {
		activeSurface = null;
		for(const surf of surfaces) {
			if(document.pointerLockElement === surf.canvas) {
				activeSurface = surf;
				break;
			}
		}
	});

	let isKeyPressed = [];
	window.addEventListener('keydown', ev => isKeyPressed[ev.keyCode] = true);
	window.addEventListener('keyup',   ev => isKeyPressed[ev.keyCode] = false);

	setInterval(() => {
		if(activeSurface == null) return;

		if(isKeyPressed[87]) activeSurface.cam.moveForward(0.1);
		if(isKeyPressed[83]) activeSurface.cam.moveForward(-0.1);
		if(isKeyPressed[68]) activeSurface.cam.moveRight(0.1);
		if(isKeyPressed[65]) activeSurface.cam.moveRight(-0.1);

		/*
		for(const i in isKeyPressed) {
			if(isKeyPressed[i]) console.log(i, isKeyPressed[i]);
		}
		*/
	}, 10);

	window.requestAnimationFrame(renderWrapper);
});

//let isKeyPressed = [];
