uniform sampler2D background;
uniform float utime;
uniform float offset;
uniform float opacity;
uniform vec3 color1;
uniform vec3 color2;

varying vec2 vUv;


void main() {

    float time = utime / 200.;
    vec2 uv = vUv;

    vec3 tex = texture2D( background, vec2(uv.x + offset, uv.y) ).rgb;

    vec3 color = mix(color1, color2, uv.y) * tex;

    gl_FragColor = vec4( color, opacity );

}