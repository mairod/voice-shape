import * as THREE from 'three'
import Store from '../utils/store'

class FBO {
    constructor() {

        this.active = false

        this.soundTarget = new THREE.Vector3(0, 0, 0)
        this.soundTmp = new THREE.Vector3(0, 0, 0)
        this.soundDir = new THREE.Vector3(0, 0, 0)

        this.oldActivePixelLine = 0

    }

    init2dContext(){

        this.canvas2d = document.createElement('canvas')
        this.canvas2d.width = this.canvas2d.height = this.width
        this.canvas2dContext = this.canvas2d.getContext('2d')

        // this.canvas2d.style.position = "fixed"
        // this.canvas2d.style.zIndex = "100"
        // document.body.appendChild(this.canvas2d)

        this.audioDataTexture = new THREE.Texture(this.canvas2d)

    }

    render2dCanvas(){

        let activePixelLine = Math.ceil(Store.avancement * this.width * 1.09)
                
        if (activePixelLine <= this.oldActivePixelLine) { return }
        
        let width = (activePixelLine - this.oldActivePixelLine) + 1
        
        let ctx = this.canvas2dContext
        for (var i = 0; i < (Store.audioData.length / 4) + 4; i++) {
            var peak = Store.audioData[i]
            ctx.fillStyle = `rgb(${peak}, ${peak}, ${peak})`
            ctx.fillRect(activePixelLine, i * 4 , width, 4)       
        }
        this.oldActivePixelLine = activePixelLine

        this.audioDataTexture.needsUpdate = true 
            
    }

    createShader(){        

        this.simulationShader = new THREE.ShaderMaterial({
            uniforms: {
                utime: { type: "f", value: 0 },
                audioControl: { type: "v3", value: this.soundTmp},
                audioData: { type: "t", value: this.audioDataTexture } ,
            },
            vertexShader: require('../../shaders/simulation.vert'),
            fragmentShader: require('../../shaders/simulation.frag'),
            transparent: true,
        })

    }

    init(renderer) {
        
        this.width = Store.audioData.length
        this.height = Store.audioData.length
        
        this.init2dContext()        
        this.createShader()


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
        // this.scene.add(new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ map: this.audioDataTexture})))

        this.renderer = renderer
    }

    update() {
        //1 update the simulation and render the result in a target texture
        if (this.renderer != undefined) {

            // console.log(Store.audioData)
            this.render2dCanvas()
            
            // Update uniforms
            this.simulationShader.uniforms.utime.value += 1

            if (Store.audioControls.length > 0) {
                this.soundTarget.x = Store.audioControls[0].strength * .5
                this.soundTarget.y = Store.audioControls[1].strength * .5
                this.soundTarget.z = Store.audioControls[2].strength * .5
            }            

            this.soundDir.subVectors(this.soundTarget, this.soundTmp)
            this.soundDir.multiplyScalar(.1)
            this.soundTmp.addVectors(this.soundTmp, this.soundDir)
            this.simulationShader.uniforms.audioControl.value = this.soundTmp

            this.renderer.render(this.scene, this.orthoCamera, this.rtt, true)   
        }
    }
}
export default new FBO()