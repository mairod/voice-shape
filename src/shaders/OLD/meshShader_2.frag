uniform sampler2D matcap1;
uniform sampler2D noiseMap;
uniform float utime;
uniform float topHeight;
uniform vec3 inputColor1;
uniform vec3 inputColor2;

varying vec2 vUv;
varying float vAvancement;
varying vec3 e;
varying vec3 n;

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float luminance(vec3 rgb)
{
    // Algorithm from Chapter 10 of Graphics Shaders.
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    return dot(rgb, W);
}

void main() {

    vec2 uv = vUv;
    float avancement = vAvancement;
    float time = utime / 100.;


    // Matcaping
    vec3 r = reflect( e, n );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    vec3 base = texture2D( matcap1, vN ).rgb;

    // hue Shift

    vec3 matcapHsv;

    // uv.x += .5;

    // Noise
    vec3 elevation = texture2D( noiseMap, vec2( (uv.x * 4.) + time, uv.y) ).rgb;
    float intensity = base.b;

    vec3 color;

    color = mix(inputColor1, inputColor2, smoothstep(.5 - topHeight, .5 + topHeight, elevation.r));
    color *= 1. + intensity * .5; 
    color *= (luminance(color) * .5) + .6;

    float alpha = 1.;
    if(uv.x >= vAvancement + .1) {
        alpha = 0.;
    }

    gl_FragColor = vec4( color, alpha );


}