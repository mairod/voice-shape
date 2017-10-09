uniform sampler2D matcap1;
uniform sampler2D noiseMap;
uniform sampler2D simulationTex;

uniform float utime;
uniform float topHeight;
uniform float height;
uniform float blending;
uniform vec3 inputColor1;
uniform vec3 inputColor2;

varying vec2 vUv;
varying float vAvancement;
varying vec3 e;
varying vec3 n;

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
    float reflectivity = .5;

    // Matcaping
    vec3 r = reflect( e, n );
    float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );
    vec2 vN = r.xy / m + .5;

    vec3 base = texture2D( matcap1, vN ).rgb;


    vec3 matcapHsv;

    // Noise
    vec4 sim = texture2D(simulationTex, uv);
    float displacement = normalize((sim.a * height) + (sim.r * 4.));

    float intensity = base.b;

    vec3 color;

    color = mix(inputColor1, inputColor2, smoothstep(.5 - blending, .5 + blending, sim.a * topHeight));
    // color *= base ; 
    color *= (1. - reflectivity) + base * reflectivity; 
    color *= (luminance(color) * .5) + .6;

    float alpha = 1.;
    if(uv.x >= vAvancement + .1) {
        alpha = 0.;
    }

    gl_FragColor = vec4( color, alpha );


}