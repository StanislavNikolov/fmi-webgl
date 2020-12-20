uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform vec3 uLightDir;
uniform vec3 uAmbientLight;

attribute vec3 aXYZ;
attribute vec3 aNrm;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
	gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aXYZ, 1.0);

	vec3 light = normalize(-uLightDir);
	vec3 normal = vec3(normalize( uModelMatrix * vec4(aNrm,0) ));
	vColor = aColor * (vec3(1.0, 1.0, 1.0) * max(dot(normal, light), 0.0) + uAmbientLight);
	//vColor = uAmbientLight;

	gl_PointSize = 4.0;
}
