import * as THREE from 'three'
import Store from '../utils/store'
import FBO from './FBOSimulation'
import DebugController from './DebugController'


class ReactiveRing {
    constructor(options){

        this.store = Store
        this.scene = Store.scene
        this.avancement = 0
        this.config = {}

        this.initMesh()

        if (DebugController.active) {
            this.initGUI()
        }

    }

    initMesh(){
        let geom = new THREE.TorusBufferGeometry(50, 5, 30, 200)
        // let geom = new THREE.CylinderBufferGeometry(20, 20, 100, 64, 1023, true)
        // 265 * 256 Vertices (65536)
        
        this.meshShader = new THREE.ShaderMaterial({
            uniforms: {
                utime: { type: "f", value: 0 },
                uAvancement: { type: "f", value: 0 },
                volume: { type: "f", value: 0 },
                simulationTex: { type: "t", value: FBO.rtt.texture },
                matcap1: { type: "t", value: Store.textureThree.matcap1 },
                noiseMap: { type: "t", value: Store.textureThree.noiseMap },


                // PARAMS
                topHeight: { type: "f", value: .1, gui: true, range: [0, 1] },
                height: { type: "f", value: 3, gui: true, range: [0, 10] },
                inputColor1: { type: "v3", value: new THREE.Color('#e96443'), gui: false, range: [0, 1] },
                inputColor2: { type: "v3", value: new THREE.Color('#904e95'), gui: false, range: [0, 1] },
                
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
        mesh.rotation.x = - Math.PI / 3
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
        
        if (this.meshShader != undefined && Store.volume > 50) {
            this.avancement += .005
        }

        this.avancement = Math.min(this.avancement, .91)
        this.meshShader.uniforms.uAvancement.value = this.avancement
        this.meshShader.uniforms.volume.value = Store.volume * -.1        
        this.meshShader.uniforms.utime.value = Store.time

    }
}
export default ReactiveRing