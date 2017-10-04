uniform sampler2D matcap;


varying vec2 vUv;
varying float vAvancement;
varying vec3 e;
varying vec3 n;

void main() {

    vec2 uv = vUv;
    float avancement = vAvancement;


    // Matcaping

    vec3 r = reflect( e, n );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    vec3 base = texture2D( matcap, vN ).rgb;


    float alpha = 1.;
    if(uv.x >= vAvancement + .1) {
        alpha = 0.;
    }

    gl_FragColor = vec4( base, alpha );


}