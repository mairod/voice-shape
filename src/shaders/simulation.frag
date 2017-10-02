varying vec2 vUv;
uniform float utime;

void main() {

    float time = utime / 100.;

    vec2 uv = vUv;

    float test = abs(sin(time));

    vec3 pos;
    if(uv.x > abs(sin(time))){
        pos = vec3(.5, 1. - uv.x, 1.);
        // pos = vec3(abs(uv.y - .5), abs(uv.y - .5), abs(uv.y - .5));
    } else {
        pos = vec3(.0, .0, .0);
    }

    // vec3 pos = vec3(test * uv.x, 1.-test * uv.y, test);

    gl_FragColor = vec4( pos, 1. );

}