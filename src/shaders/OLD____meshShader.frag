uniform sampler2D matcap1;
uniform sampler2D noiseMap;
uniform float utime;

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

void main() {

    vec2 uv = vUv;
    float avancement = vAvancement;
    float time = utime / 200.;


    // Matcaping

    vec3 r = reflect( e, n );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    vec3 base = texture2D( matcap1, vN ).rgb;

    // hue Shift

    vec3 matcapHsv

    vec2 uvM = uv;
    vec3 noiseTex = texture2D( noiseMap, uvM ).rgb;

    base *= noiseTex * 1.3;

    float alpha = 1.;
    if(uv.x >= vAvancement + .1) {
        alpha = 0.;
    }

    gl_FragColor = vec4( base, alpha );


}