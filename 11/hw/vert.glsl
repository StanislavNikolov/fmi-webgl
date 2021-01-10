uniform vec2 uScale;
uniform vec2 uTrans;
uniform vec3 uColor;

attribute vec2 aXY;

void main() {
	gl_Position = vec4((aXY + uTrans) * uScale, 0.0, 1.0);
	gl_PointSize = 16.0;
}
