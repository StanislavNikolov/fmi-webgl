const renderWrapper = () => {
	if(CADStarted) {
		for(let i = 0;i < 5;i ++) {
			iterateBeforeRender();
			for(const surf of surfaces) render(surf);
			iterateAfterRender();
		}
	}
	for(const surf of surfaces) render(surf);

	currentFrame += 1;
	window.requestAnimationFrame(renderWrapper);
};

const addSurface = (targetImage) => {
	const pair = document.createElement('span');
	pair.classList.add('pair');
	document.getElementById('surfaces').appendChild(pair);

	const tcvs = document.createElement('canvas');
	tcvs.classList.add('target');
	tcvs.id = Math.random();
	pair.appendChild(tcvs);

	const scvs = document.createElement('canvas');
	scvs.classList.add('webgl');
	scvs.id = Math.random();
	scvs.style['opacity'] = 0.5;
	pair.appendChild(scvs);

	const surf = new Surface(scvs.id, tcvs.id, 'vert.glsl', 'frag.glsl', targetImage);

	surfaces.push(surf);

	surf.glcanvas.addEventListener('click', () => {
		console.log('click', activeSurface);
		if(activeSurface != null) return;
		surf.glcanvas.requestPointerLock();
	});

	setup(surf);
}

const setOpacity = (opacity) => {
	for(const surf of surfaces) {
		surf.glcanvas.style['opacity'] = opacity;
	}
}

const reload = (dataset) => {
	const url = document.URL.split('?');
	window.location = url[0] + '?' + dataset;
};

const setCADState = (state) => {
	const el = document.getElementById('btn_startpause')
	if(state) {
		el.innerText = 'Pause';
		el.classList.add('red');
		el.classList.remove('green');
	} else {
		el.innerText = 'Start';
		el.classList.add('green');
		el.classList.remove('red');
	}
	const text = (state === true ? 'Pause' : 'Start');
	CADStarted = state;
};

window.addEventListener('load', () => {
	document.getElementById('overlay').oninput = (ev) => {
		setOpacity(1-ev.target.value);
	};

	let loadedCounter = 0;
	const loaded = () => {
		loadedCounter ++;
		if(loadedCounter == 4) {
			for(const surf of surfaces) surf.drawTargetImage();
			everythingLoaded = true;
			setCADState(true);
			document.getElementById('btn_startpause').disabled = false;
			document.getElementById('btn_startpause').onclick = () => {
				setCADState(!CADStarted);
			};
		}
	};

	const url = document.URL.split('?');
	const dataset = (url.length > 1 ? url[1] : 'monkey_2');
	for(let i = 0;i < 4;i ++) {
		const targetImage = new Image();
		targetImage.onload = loaded;
		targetImage.src = `data/export/${dataset}/${i+1}.png`;
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

	document.addEventListener('mousemove', (ev) => {
		if(activeSurface == null) return;
		console.log('mouse move');

		activeSurface.cam.rotDX(ev.movementX / 500.0)
		activeSurface.cam.rotDY(ev.movementY / 500.0);
		activeSurface.cam.calcLookDir();
	});


	setInterval(() => {
		/*
		for(const i in isKeyPressed) {
			if(isKeyPressed[i]) console.log(i, isKeyPressed[i]);
		}
		*/

		//if(isKeyPressed[219]) changeOpacity(-0.01);
		//if(isKeyPressed[221]) changeOpacity(0.01);

		if(activeSurface == null) return;
		if(isKeyPressed[87]) activeSurface.cam.moveForward(0.1);
		if(isKeyPressed[83]) activeSurface.cam.moveForward(-0.1);
		if(isKeyPressed[68]) activeSurface.cam.moveRight(0.1);
		if(isKeyPressed[65]) activeSurface.cam.moveRight(-0.1);

	}, 10);

	window.requestAnimationFrame(renderWrapper);
});
