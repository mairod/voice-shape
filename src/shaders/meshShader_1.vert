uniform float uAvancement;
uniform float volume;
uniform float radius;
uniform sampler2D noiseMap;
uniform sampler2D simulationTex;
uniform float utime;
uniform float height;
uniform float noiseHeight;

varying vec2 vUv;
varying float vAvancement;

varying vec3 e;
varying vec3 n;

void main() {

    float time = utime / 100.;

    vUv = uv;
    vAvancement = uAvancement;
    vec3 bPosition = position;
    float heightFactor = .1;

    // TO BE UNIFORMS
    // float radius = 5.;

    ///////////////////////////
    // Along normal displacement 

    vec4 sim = texture2D(simulationTex, uv);
    vec3 elevation = texture2D( noiseMap, vec2( (uv.x * 4.) + time, uv.y) ).rgb;
    // float displacement = .1 +( elevation.x * height);
    float displacement = .1 + (sim.a * height) + (sim.r * noiseHeight);

    // Closing tops Start
    if(uv.x < .1){
        // displacement *= smoothstep(0., 1., uv.x);
        float i = (smoothstep(0., 1., 1. - (uv.x / .09)) * -(radius + displacement)) + displacement;
        displacement = i;
        heightFactor *= smoothstep(0., 1., uv.x / .09);
    }

    // Cloasing Avancement Top
    if(uv.x > uAvancement - .1){
        // displacement *= smoothstep(0., 1., uv.x);
        float i = (smoothstep(0., 1., (uv.x - uAvancement) * 15. )  * -(radius + displacement)) + displacement;
        displacement = i;
        heightFactor *= 1. - smoothstep(0., 1., (uv.x - uAvancement) * 15. );
    }

    // Displacement ripple
    if(uv.x > .1 && uv.x < uAvancement - .1){
        // displacement *= smoothstep(0., 1., (uv.x - uAvancement) * 30. );
    }


    // Creating new position

    vec3 mPosition = position;
    vec3 newPosition = mPosition + normal * displacement;

    // Chencking advancement
    // if(uv.x >= uAvancement) {
    //     gl_Position = projectionMatrix * modelViewMatrix * vec4( bPosition, 1.0 );
    // } else {
    // }

    // Matcaping
    e = normalize( vec3( modelViewMatrix * vec4( newPosition, 1.0 ) ) );
    n = normalize( normalMatrix * normal * displacement );



    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}