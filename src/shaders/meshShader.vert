uniform sampler2D simulationTex;
varying vec2 vUv;

void main() {

    vUv = uv;

    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices
    vec4 sim = (texture2D( simulationTex, uv.xy ) - .5) * 2.;
    sim *= 10.;

    float heightFactor = 1.5;
    float heightDispl = heightFactor * sim.r;

    vec3 aPosition = position;
    // displacement height
    aPosition += vec3(0., 0., heightDispl);

    // displacement radius
    float simDisplRadius = sim.y;
    float radiusFactor = 1.5;
    aPosition *= vec3(.5 + (simDisplRadius / length(aPosition)) * radiusFactor, .5 + (simDisplRadius / length(aPosition)) * radiusFactor, .5 + (simDisplRadius / length(aPosition)) * radiusFactor);

    // displacement radius

    vec4 newPosition = projectionMatrix * modelViewMatrix * vec4( aPosition, 1. );

    // gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    gl_Position = newPosition;


}