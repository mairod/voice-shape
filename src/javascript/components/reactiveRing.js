import * as THREE from 'three'
import Store from '../utils/store'
import FBO from './FBOSimulation'
import DebugController from './DebugController'


class ReactiveRing {
    constructor(options){

        this.store         = Store
        this.scene         = Store.scene
        this.avancement    = 0
        this.config        = {}
        this.defaultRadius = 2
        this.index         = options.index        

        this.volumeTarget  = new THREE.Vector3(0, 0, 0)
        this.volumeTmp     = new THREE.Vector3(0, 0, 0)
        this.volumeDir     = new THREE.Vector3(0, 0, 0)

        this.initMesh()

        if (DebugController.active) {
            this.initGUI()
        }

    }

    initMesh(){
        
        let geom = new THREE.TorusBufferGeometry(30 * (this.index + 1) , this.defaultRadius, 30, 200)
        // let geom = new THREE.CylinderBufferGeometry(20, 20, 100, 64, 1023, true)
        // 265 * 256 Vertices (65536)
        
        this.meshShader = new THREE.ShaderMaterial({
            uniforms: {
                utime: { type: "f", value: 0 },
                uAvancement: { type: "f", value: 0 },
                volume: { type: "f", value: 0 },
                radius: { type: "f", value: this.defaultRadius },
                simulationTex: { type: "t", value: FBO.rtt.texture },
                matcap1: { type: "t", value: Store.textureThree.matcap1 },
                noiseMap: { type: "t", value: Store.textureThree.noiseMap },


                // PARAMS
                topHeight: { type: "f", value: 1.5, gui: true, range: [0, 5] },
                blending: { type: "f", value: .45, gui: true, range: [0, 1] },
                height: { type: "f", value: 40, gui: true, range: [0, 50] },
                noiseHeight: { type: "f", value: 10, gui: true, range: [0, 50] },
                inputColor1: { type: "v3", value: [0.39215686274509803, 0.2196078431372549, 0.8196078431372549], guiType:"color", gui: true, range: [0, 1] },
                inputColor2: { type: "v3", value: [0, 0.615686274509804, 1], guiType:"color", gui: true, range: [0, 1] },
                
            },
            vertexShader: require('../../shaders/meshShader_1.vert'),
            fragmentShader: require('../../shaders/meshShader_1.frag'),
            side: THREE.DoubleSide,
            // wireframe: true,
            transparent: true,
            shading: THREE.SmoothShading,
            // depthTest: false
        })


        let mesh = new THREE.Mesh(geom, this.meshShader)

        mesh.rotation.x = Math.PI * 2 * Math.random()
        mesh.rotation.y = Math.PI * 2 * Math.random()
        mesh.rotation.z = Math.PI * 2 * Math.random()

        this.mesh = mesh
        this.scene.add(mesh)
    }

    initGUI(){

        for (var key in this.meshShader.uniforms) {
            if (this.meshShader.uniforms.hasOwnProperty(key)) {
                var element = this.meshShader.uniforms[key];
                if (element.gui) {
                    this.config[key] = element
                }
            }
        }
        
        DebugController.register("config", this.config, "Ring params")
    }

    update(){
        
        if (this.meshShader != undefined && Store.volume > 10) {
            this.volumeTarget.x += .003
            this.volumeTarget.x = Math.min(this.volumeTarget.x, .91)
        }

        this.volumeDir.subVectors(this.volumeTarget, this.volumeTmp)
        this.volumeDir.multiplyScalar(.1)
        this.volumeTmp.addVectors(this.volumeTmp, this.volumeDir)

        this.meshShader.uniforms.uAvancement.value = this.volumeTmp.x
        this.meshShader.uniforms.volume.value = Store.volume * -.1        
        this.meshShader.uniforms.utime.value = Store.time

        Store.avancement = this.volumeTmp.x

    }
}
export default ReactiveRing