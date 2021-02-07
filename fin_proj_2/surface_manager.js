const renderWrapper = () => {
	for(let i = 0;i < 10;i ++) {
		if(CADStarted) iterateBeforeRender();
		for(const surf of surfaces) render(surf);
		if(CADStarted) iterateAfterRender();
	}
	for(const surf of surfaces) render(surf);

	currentFrame += 1;
	window.requestAnimationFrame(renderWrapper);
};

const addSurface = (targetImage) => {
	const pair = document.createElement('span');
	pair.classList.add('pair');
	document.getElementById('container').appendChild(pair);

	const tcvs = document.createElement('canvas');
	tcvs.classList.add('target');
	tcvs.id = Math.random();
	pair.appendChild(tcvs);

	const scvs = document.createElement('canvas');
	scvs.classList.add('webgl');
	scvs.id = Math.random();
	scvs.style['opacity'] = 0.7;
	pair.appendChild(scvs);

	const surf = new Surface(scvs.id, tcvs.id, 'vert.glsl', 'frag.glsl', targetImage);

	surfaces.push(surf);

	surf.glcanvas.addEventListener('click', () => {
		if(activeSurface != null) return;
		surf.glcanvas.requestPointerLock();
	});

	surf.glcanvas.addEventListener('mousemove', (ev) => {
		if(activeSurface == null || activeSurface !== surf) return;

		surf.cam.rotDX(ev.movementX / 500.0)
		surf.cam.rotDY(ev.movementY / 500.0);
		surf.cam.calcLookDir();
	});

	setup(surf);
}

const changeOpacity = (delta) => {
	for(const surf of surfaces) {
		const curr = Number(surf.glcanvas.style['opacity']);
		let set = curr + delta;
		if(set < 0) set = 0;
		if(set > 1) set = 1;
		surf.glcanvas.style['opacity'] = set;
	}
}

window.addEventListener('load', () => {
	let loadedCounter = 0;
	const loaded = () => {
		loadedCounter ++;
		if(loadedCounter == 4) {
			for(const surf of surfaces) surf.drawTargetImage();
			CADStarted = true;
		}
	};

	for(let i = 0;i < 4;i ++) {
		const targetImage = new Image();
		targetImage.onload = () => {
			loaded();
		};
		targetImage.src = `data/export/monkey_2/${i+1}.png`;
		addSurface(targetImage);
	}

	const dist = 4;
	const height = 0;
	surfaces[0].cam.pos = [ dist, height,     0];
	surfaces[1].cam.pos = [  0,   height, -dist];
	surfaces[2].cam.pos = [-dist, height,     0];
	surfaces[3].cam.pos = [0  ,   height,  dist];
	surfaces[0].cam.rotDX(-Math.PI/2);
	surfaces[1].cam.rotDX(Math.PI);
	surfaces[2].cam.rotDX(Math.PI/2);

	//for(const surf of surfaces) surf.cam.rotDY(0.4);

	window.addEventListener('resize', () => {
		for(const surf of surfaces) surf.rescale();
	});
	for(const surf of surfaces) surf.rescale();

	document.addEventListener('pointerlockchange', (ev) => {
		activeSurface = null;
		for(const surf of surfaces) {
			if(document.pointerLockElement === surf.glcanvas) {
				activeSurface = surf;
				break;
			}
		}
	});

	setInterval(() => {
		/*
		for(const i in isKeyPressed) {
			if(isKeyPressed[i]) console.log(i, isKeyPressed[i]);
		}
		*/

		if(isKeyPressed[219]) changeOpacity(-0.01);
		if(isKeyPressed[221]) changeOpacity(0.01);

		if(activeSurface == null) return;
		if(isKeyPressed[87]) activeSurface.cam.moveForward(0.1);
		if(isKeyPressed[83]) activeSurface.cam.moveForward(-0.1);
		if(isKeyPressed[68]) activeSurface.cam.moveRight(0.1);
		if(isKeyPressed[65]) activeSurface.cam.moveRight(-0.1);

	}, 10);

	window.requestAnimationFrame(renderWrapper);
});
