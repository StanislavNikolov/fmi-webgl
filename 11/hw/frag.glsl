precision highp float;

uniform vec2 uTrans;
uniform vec2 uScale;
uniform vec3 uColor;

void main() {
	gl_FragColor = vec4(uColor, 1);
}
