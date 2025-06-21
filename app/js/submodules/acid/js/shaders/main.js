export default `

void main() {
	vec2 CENTER = vec2(0.2,0.5);
	int mode = 2;
	float _X = gl_FragCoord.x / resolution.x;
	float _Y = gl_FragCoord.y / resolution.y;
	float	X = abs(-1.0 + 2.0 * _X); //0-1 > 0-1 - 1-0-1 - 1-0
	float	Y = abs(-1.0 + 2.0 * _Y);
	vec2 XY = vec2(X,Y);
	vec2 _XY = vec2(_X,_Y);

	float H = mouse.x;
	float J = mouse.y;
	float R = Random();
	float U = Uncertain();
	float Z = float(spacePressed);
	float I = 0.5; //RESERVED
	float O = 0.5; //RESERVED
	gl_FragColor = vec4(0.0);
}

`