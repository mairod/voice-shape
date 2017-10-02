import * as THREE from 'three'
import Store from '../utils/store'

class FBO {
    constructor() {

        this.width = 128
        this.height = 128

        this.createShader()

    }

    createShader(){
        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                utime: { type: "f", value: 0 }
            },
            vertexShader: require('../../shaders/simulation.vert'),
            fragmentShader: require('../../shaders/simulation.frag'),
            transparent: true,
        })
    }

    init(renderer) {

        let gl = renderer.getContext()

        //1 we need FLOAT Textures to store positions
        //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
        if (!gl.getExtension("OES_texture_float")) {
            throw new Error("float textures not supported")
        }

        //2 we need to access textures from within the vertex shader
        //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
        if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
            throw new Error("vertex shader cannot read textures")
        }

        //3 rtt setup
        this.scene = new THREE.Scene()
        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1)

        //4 create a target texture
        let options = {
            minFilter: THREE.NearestFilter,//important as we want to sample square pixels
            magFilter: THREE.NearestFilter,//
            format: THREE.RGBAFormat,//could be RGBAFormat
            type: THREE.FloatType//important as we need precise coordinates (not ints)
        }
        this.rtt = new THREE.WebGLRenderTarget(this.width, this.height, options)


        //5 the simulation:
        //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
        let geom = new THREE.BufferGeometry()
        geom.addAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3))
        geom.addAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2))
        this.scene.add(new THREE.Mesh(geom, this.simulationShader))

        this.renderer = renderer
    }

    update() {
        //1 update the simulation and render the result in a target texture
        if (this.renderer != undefined) {
            
            // Update uniforms
            this.simulationShader.uniforms.utime.value += 1

            this.renderer.render(this.scene, this.orthoCamera, this.rtt, true)   
        }
    }
}
export default new FBO()