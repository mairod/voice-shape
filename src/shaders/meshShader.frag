varying vec2 vUv;
varying float vAvancement;

void main() {

    vec2 uv = vUv;
    float avancement = vAvancement;

    if(uv.x >= vAvancement) {
        gl_FragColor = vec4( 0., 0., 0., 0. );
    }

    gl_FragColor = vec4( 1., 1., 1., 1. );

}