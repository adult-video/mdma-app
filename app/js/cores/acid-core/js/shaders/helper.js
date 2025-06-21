export default `

//DEFINITIONS
precision mediump float;
uniform float time; //time in seconds
uniform vec2 resolution; //resolution in px
uniform vec2 mouse; //mouse position in grid units
uniform float seed; //random seed
uniform float size; //unit definition
uniform float bitmap[32];
uniform int bitmapSize;
uniform float slBitmaps[128];
uniform float slBitmapSizes[32];
uniform int spacePressed;
#define PI 3.141592653589793 //pi circle radius
#define PHI 1.61803398874989484820459 //phi golden ratio
#define DEFAULT_PHASE 0.0
#define TAU 6.28318530718
#define DEFAULT_ROTATION 0.125

//HELPER
float scale(float v, float max){ //will scale a value so that 0 is 0, 0.5 is 1 and 1 is max
	float multiplier = 1.0;
	if(v < 0.0){
		multiplier = -1.0;
	}
	v = abs(v);
	if(v > 0.5){
		v = ((v - 0.5) * 2.0); // 0 - 1
		v = v * v; // 0 - 1
		v = 1.0 + (v * max); //1 - max
	}
	else{
		v = v * 2.0; // 0 - 1
	}
	return v * multiplier;
}
float range(float v){
	return -1.0 + v * 2.0;
}
vec4 taylorInvSqrt(vec4 r){
	return 1.79284291400159 - 0.85373472095314 * r;
}
float clamp(float v){ //will make sure a value is between 0 and 1
	return max(0.0,mod(v,1.0));
}
float smoothclamp(float v){ //will make sure a value is between 0 and 1 and use a smooth triangle function for that
	return abs(mod(v,2.0) - 1.0);
}
vec4 permute(vec4 x){
	return mod(((x*34.0)+1.0)*x, 289.0);
}
vec2 rotate(vec2 xy, float rotation){ //takes a vector and rotates it around the center
	float radians = rotation * 360.0 * PI / 180.0;
	vec2 r = vec2(sin(radians),cos(radians));
	return vec2(xy.x * r.x, xy.y * r.y);
}
float reduce(vec2 xy, float rotation){ //takes a vector rotates it and reduces it into a single value
	vec2 r = rotate(xy,rotation);
	return r.x + r.y;
}
vec4 rgba(float v, float r, float g, float b, float a){ //takes a value and rgba values and returns a single color vector
	return vec4(v * r * a,v * g * a,v * b * a,1.0);
}
float hash21(in vec2 n){
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
mat2 makem2(in float theta){
  float c = cos(theta);
  float s = sin(theta);
  return mat2(c,-s,s,c);
}

float Random(){
  return fract(tan(distance(time*PHI*size,time*size)*seed)*time*size);
	}
	float Uncertain(){
  return fract(tan(distance(floor(time)*PHI*size,floor(time)*size)*seed)*floor(time)*size);
	}



//TEXTURES
float PLASMA(in vec2 xy, in float _stretch, in float pos, in float speed)
{
	float stretch = 0.3 + _stretch * 0.69;
	float t = time * pow(speed,2.0) * 1000.0 + seed * 20000.0 + pos * 1000.0;
	vec2  R =  vec2(scale(1.0 - stretch,size)), S = vec2(160,100),
          p = ( xy+xy - R ) / R * S,
          q = vec2(cos(-t / 165.), cos( t / 45.))  * S - p;
    t = 1. + cos( length( vec2(cos( t / 98.),  sin( t / 178.)) * S - p ) / 30.)
           + cos( length( vec2(sin(-t / 124.), cos( t / 104.)) * S - p ) / 20.)
           + sin( length(q) / 25. ) * sin(q.x / 20.) * sin(q.y / 15.);
	return .5 + .5* cos(t * PI );
}
float PLASMA(in float seed, in vec2 xy){
	return PLASMA(xy,0.5,seed * 1000.0,0.0);
}
float PLASMA(in float seed, in vec2 xy, in float pos){
	return PLASMA(xy,0.5,seed * 1000.0 + pos,0.0);
}

float PLASMA(in float seed, in vec2 xy, in float pos, in float a){
	return PLASMA(xy,0.5,seed * 1000.0 + pos,0.0);
}
float PLASMA(in float seed, in vec2 xy, in float pos, in float a, in float b){
	return PLASMA(xy,0.5,seed * 1000.0 + pos,0.0);
}


float SIMPLEX(
	in vec2 xy,
	in vec2 skew,
	in vec3 offset
){
	float _x = (scale(range(offset.x),size * 0.1) + xy.x) * scale(skew.x,size);
	float _y = (scale(range(offset.y),size * 0.1) + xy.y) * scale(skew.y,size);
	float _z = offset.z + seed * 10000.0;
	vec3 v = vec3(_x,_y,_z);
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  float r = 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  return mod(r,1.0);
}

float SIMPLEX( //alias with just a single float
	in float n
){
	return SIMPLEX(vec2(n,n),vec2(1.0,1.0),vec3(0.0,0.0,0.0));
}
float SIMPLEX( //alias with just a single zoom factor
	in vec2 xy
){
	return SIMPLEX(xy,vec2(1.0),vec3(0.0,0.0,0.0));
}
float SIMPLEX(in vec2 xy,in float pos){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(1.0),vec3(0.5,0.5,pos));
}

float SIMPLEX(in float seed, in vec2 xy,in float pos){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(1.0),vec3(0.5,0.5,seed * 1000.0 + pos));
}
float SIMPLEX( //alias with just a single zoom factor
	in float seed, in vec2 xy
){
	return SIMPLEX(xy,vec2(1.0),vec3(0.0,0.0,seed * 1000.0));
}

float SIMPLEX(in float seed, in vec2 xy,in float pos, in float a){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(1.0),vec3(0.5,0.5,seed * 1000.0 + pos));
}
float SIMPLEX(in float seed, in vec2 xy,in float pos, in float a, in float b){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(1.0),vec3(0.5,0.5,seed * 1000.0 + pos));
}









float PERLIN( //alias with just a single zoom factor
	in float seed, in vec2 xy
){
	return SIMPLEX(xy,vec2(0.63),vec3(0.0,0.0,seed * 1000.0));
}
float PERLIN(in float seed, in vec2 xy,in float pos){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(0.5),vec3(0.5,0.5,seed * 1000.0 + pos));
}

float PERLIN(in float seed, in vec2 xy,in float pos, in float a){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(0.5),vec3(0.5,0.5,seed * 1000.0 + pos));
}
float PERLIN(in float seed, in vec2 xy,in float pos, in float a, in float b){ //alias with just a single zoom factor
	return SIMPLEX(xy,vec2(0.5),vec3(0.5,0.5,seed * 1000.0 + pos));
}











float noise( in vec2 x ){
  return SIMPLEX(x);
}
vec2 gradn(vec2 p)
{
  float ep = .09;
  float gradx = noise(vec2(p.x+ep,p.y))-noise(vec2(p.x-ep,p.y));
  float grady = noise(vec2(p.x,p.y+ep))-noise(vec2(p.x,p.y-ep));
  return vec2(gradx,grady);
}
float flow(in vec2 p)
{
  float z=2.;
  float rz = 0.;
  vec2 bp = p;
  for (float i= 1.;i < 7.;i++ )
  {
    //primary flow speed
    p += time*.6;

    //secondary flow speed (speed of the perceived flow)
    bp += time*1.9;

    //displacement field (try changing time multiplier)
    vec2 gr = gradn(i*p*.34+time*1.);

    //rotation of the displacement field
    gr*=makem2(time*6.-(0.05*p.x+0.03*p.y)*40.);

    //displace the system
    p += gr*.5;

    //add noise octave
    rz+= (sin(noise(p)*7.)*0.5+0.5)/z;

    //blend factor (blending displaced system with base system)
    //you could call this advection factor (.5 being low, .95 being high)
    p = mix(bp,p,.77);

    //intensity scaling
    z *= 1.4;
    //octave scaling
    p *= 2.;
    bp *= 1.9;
  }
  return rz;
}


float WATER(in vec2 xy,in float scale, in float pos, in float speed){
	vec2 uv = xy*scale*2.0;
  vec2 p = mod(uv*TAU, TAU)-250.0;
	vec2 i = vec2(p);
	float c = 1.0;
	float inten = .005;
	float _t = time * speed + pos + seed * 10000.0;
	for (int n = 0; n < 5; n++)
	{
		float t = _t * (1.0 - (3.5 / float(n+1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
	}
	c /= float(5);
	c = 1.17-pow(c, 1.4);
	return pow(abs(c), 8.0);
}
float WATER(in float seed, in vec2 xy,in float pos){
	return WATER(xy,0.5,seed * 1000.0 + pos,0.0);
}
float WATER(in float seed, in vec2 xy){
	return WATER(xy,0.5,seed * 1000.0,0.0);
}

float WATER(in float seed, in vec2 xy,in float pos, in float a){
	return WATER(xy,0.5,seed * 1000.0 + pos,0.0);
}
float WATER(in float seed, in vec2 xy,in float pos, in float a, in float b){
	return WATER(xy,0.5,seed * 1000.0 + pos,0.0);
}




float SINE(in float n){
	return sin(n * PI);
}
float SINE(){
	return 0.0;
}

float SINE(in float n, in float a){
	return SINE(n);
}
float SINE(in float n, in float a, in float b){
	return SINE(n);
}






float TRIANGLE(in float n){
	return abs(-1.0+n*2.0);
}
float TRIANGLE(){
	return 0.0;
}

float TRIANGLE(in float n, in float a){
	return TRIANGLE(n);
}
float TRIANGLE(in float n, in float a, in float b){
	return TRIANGLE(n);
}





float SQUARE(in float n){
	if(n < 0.5){
		return 0.0;
	}
	else{
		return 1.0;
	}
}
float SQUARE(){
	return 0.0;
}

float SQUARE(in float n, in float a){
	return SQUARE(n);
}
float SQUARE(in float n, in float a, in float b){
	return SQUARE(n);
}



float INVERT(in float n){
	return mod(abs(1.0 - n),1.0);
}
float INVERT(){
	return 0.0;
}

float INVERT(in float n, in float a){
	return INVERT(n);
}
float INVERT(in float n, in float a, in float b){
	return INVERT(n);
}





float COMPRESS(in float n){
	return pow(n,2.0);
}
float COMPRESS(){
	return 0.0;
}

float COMPRESS(in float n, in float a){
	return COMPRESS(n);
}
float COMPRESS(in float n, in float a, in float b){
	return COMPRESS(n);
}






float EXPAND(in float n){
	return sqrt(n);
}
float EXPAND(){
	return 1.0;
}

float EXPAND(in float n, in float a){
	return EXPAND(n);
}
float EXPAND(in float n, in float a, in float b){
	return EXPAND(n);
}


float CLOCK(in float n){
	return clamp(time*n);
}
float CLOCK(){
	return clamp(time);
}

float CLOCK(in float n, in float a){
	return CLOCK(n);
}
float CLOCK(in float n, in float a, in float b){
	return CLOCK(n);
}






float FRAME(in float n){
	return time * n;
}
float FRAME(){
	return time;
}

float FRAME(in float n, in float a){
	return FRAME(n);
}
float FRAME(in float n, in float a, in float b){
	return FRAME(n);
}


float LOWER(in float a, in float b){
	if(a < b){
		return a;
	}
	else{
		return b;
	}
}
float LOWER(in float n){
	return n;
}
float LOWER(){
	return 0.0;
}

float LOWER(in float a, in float b, in float c){
	return LOWER(a,b);
}
float LOWER(in float a, in float b, in float c, in float d){
	return LOWER(a,b);
}


float BIGGER(in float a, in float b){
	if(a > b){
		return a;
	}
	else{
		return b;
	}
}
float BIGGER(in float n){
	return n;
}
float BIGGER(){
	return 1.0;
}

float BIGGER(in float a, in float b, in float c){
	return BIGGER(a,b);
}
float BIGGER(in float a, in float b, in float c, in float d){
	return BIGGER(a,b);
}
float BITMAP(in float _n){
	float r;
	int n = int(floor(_n * float(bitmapSize)));
  	for (int i=0; i<1024; i++) {
     	if (i==n) {
        r = bitmap[i];
        break;
     }
  }
	return r;
}

float BITMAP(){
	return bitmap[0];
}

float BITMAP(in float _n, in float a){
	return BITMAP(_n);
}



float SLBITMAP(in int l, in float _n){

	int size;
	int start;
	int end;
	for (int i=0; i<128; i++) {
     	if (i==l) {
			start = int(slBitmapSizes[i]);
			end = int(slBitmapSizes[i+1]);
       	 	size = end - start;
        break;
     }
	}
	int n = int(floor(clamp(_n) * float(size)));
	int g = start + n;
	float r = 0.0;
	
  	for (int i=0; i<128; i++) {
     	if (i==n) {
        	r = bitmap[i];
        	break;
     	}
  	}
	return r;
}
float SLBITMAP(in int l, in float _n, in float a){
	return SLBITMAP(l,_n);
}
float SLBITMAP(in float _n){
	return BITMAP(_n);
}
float SLBITMAP(in int l){
	return SLBITMAP(l,0.0);
}



float frandom (in vec2 st) {
    return SIMPLEX(st,time);
}
 
float fnoise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = frandom(i);
    float b = frandom(i + vec2(1.0, 0.0));
    float c = frandom(i + vec2(0.0, 1.0));
    float d = frandom(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float fbm (in vec2 st) {
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    for (int i = 0; i < 10; i++) {
        value += amplitude * frandom(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}


float FIRE(in vec2 xy )
{
 return fbm(xy*3.0);
} 

`