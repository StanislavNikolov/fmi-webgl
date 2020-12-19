uniform mat4 uProjMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform vec3 uLightDir;

attribute vec3 aXYZ;
attribute vec3 aNrm;
attribute vec3 aColor;

varying vec3 vColor;

void main() {
	const vec3 ambientLight = vec3(0.2, 0.2, 0.2);

	gl_Position = uProjMatrix * uViewMatrix * uModelMatrix * vec4(aXYZ, 1.0);

	vec3 light = normalize(-uLightDir);
	vec3 normal = vec3(normalize( uModelMatrix * vec4(aNrm,0) ));
	vColor = aColor * (vec3(1.0, 1.0, 1.0) * max(dot(normal, light), 0.0) + ambientLight);

	gl_PointSize = 16.0;
}