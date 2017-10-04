uniform sampler2D simulationTex;
uniform float uAvancement;
uniform float volume;

varying vec2 vUv;
varying float vAvancement;

varying vec3 e;
varying vec3 n;

void main() {

    vUv = uv;
    vAvancement = uAvancement;
    vec3 bPosition = position;
    float heightFactor = .1;

    // TO BE UNIFORMS
    float radius = 5.;

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec4 sim = (texture2D( simulationTex, uv.xy ) - .5) * 2.;
    sim *= 10.;



    ///////////////////////////
    // Along normal displacement 

    
    float displacement = sim.b * .2 * volume / 2.;
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


    // displacement height
    float heightDisplZ = (heightFactor * sim.r) + 2.;
    float heightDisplY = (heightFactor * sim.g) + 2.;

    vec3 mPosition = position;
    mPosition += vec3(0., heightDisplY, heightDisplZ);


    // Creating new position
    vec3 newPosition = mPosition + normal * displacement;

    // Chencking advancement
    // if(uv.x >= uAvancement) {
    //     gl_Position = projectionMatrix * modelViewMatrix * vec4( bPosition, 1.0 );
    // } else {
    // }

    e = normalize( vec3( modelViewMatrix * vec4( newPosition, 1.0 ) ) );
    n = normalize( normalMatrix * normal );

    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}