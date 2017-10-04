import * as THREE from 'three'
import Store from '../utils/store'
import FBO from './FBOSimulation'


class ReactiveRing {
    constructor(options){

        this.store = Store
        this.scene = Store.scene
        this.avancement = 0

        this.initMesh()

    }

    initMesh(){
        let geom = new THREE.TorusBufferGeometry(50, 5, 60, 200)
        // let geom = new THREE.CylinderBufferGeometry(20, 20, 100, 64, 1023, true)
        // 265 * 256 Vertices (65536)

        this.meshShader = new THREE.ShaderMaterial({
            uniforms: {
                utime: { type: "f", value: 0 },
                uAvancement: { type: "f", value: 0 },
                volume: { type: "f", value: 0 },
                simulationTex: { type: "t", value: FBO.rtt.texture },
            },
            vertexShader: require('../../shaders/meshShader.vert'),
            fragmentShader: require('../../shaders/meshShader.frag'),
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

    update(){
        
        if (this.meshShader != undefined && Store.volume > 10) {
            this.avancement += .005
        }

        this.avancement = Math.min(this.avancement, .91)
        this.meshShader.uniforms.uAvancement.value = this.avancement
        this.meshShader.uniforms.volume.value = Store.volume * -.1

    }
}
export default ReactiveRing