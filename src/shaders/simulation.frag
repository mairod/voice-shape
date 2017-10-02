varying vec2 vUv;
uniform float utime;

void main() {

    float time = utime / 100.;

    vec2 uv = vUv;

    float test = abs(sin(time));

    vec3 pos;
    pos = vec3(uv.x, uv.y * sin(time), uv.y);

    // vec3 pos = vec3(test * uv.x, 1.-test * uv.y, test);

    gl_FragColor = vec4( pos, 1. );

}