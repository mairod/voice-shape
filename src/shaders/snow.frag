uniform sampler2D texture;
uniform float     pixelRatio;
varying vec4      vColor;

void main()
{
    // gl_FragColor = vColor;
    gl_FragColor = vColor * texture2D(texture,gl_PointCoord);
}