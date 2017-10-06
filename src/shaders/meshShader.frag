uniform sampler2D matcap1;
uniform sampler2D noiseMap;
uniform float utime;

varying vec2 vUv;
varying float vAvancement;
varying vec3 e;
varying vec3 n;


void main() {

    vec2 uv = vUv;
    float avancement = vAvancement;
    float time = utime / 200.;


    // Matcaping

    vec3 r = reflect( e, n );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    vec3 base = texture2D( matcap1, vN ).rgb;

    vec2 uvM = uv;
    vec3 noiseTex = texture2D( noiseMap, uvM ).rgb;

    base *= noiseTex * 1.3;

    float alpha = 1.;
    if(uv.x >= vAvancement + .1) {
        alpha = 0.;
    }

    gl_FragColor = vec4( base, alpha );


}