import * as THREE from 'three'
import Store from '../utils/store'


class Snow {

    constructor(options) {

        this.blending      = 'AdditiveBlending'
        this.scene         = options.scene
        this.parameters    = { 
            count: 5000,
            wind: { x: 0, y: 0, z: 0 },
            noise_intensity: 60,
            gravity: 100,
            color: "#FFFFFF"
        }

        this.wind          = new THREE.Vector3(this.parameters.wind.x, this.parameters.wind.y, this.parameters.wind.z)
        this.count         = this.parameters.count / 10
        this.multiplier    = 1
        this.volume_corner = { x: - 250, y: -150, z: - 250 }
        this.volume_size   = { x: 500, y:   300, z:  500 }
        this.gravity       = this.parameters.gravity
        this.time_scale    = 1
        this.time          = 0
        this.particle_size = 650
        this.pixel_ratio   = window.devicePixelRatio

        this.init()
        this.createParticles()

    }

    init() {

        this.uniforms = {}
        this.material = null        

        this.uniforms.pixelRatio      = { type: 'f', value:  window.devicePixelRatio }
        this.uniforms.volumeCorner    = { type: 'v3', value: new THREE.Vector3(this.volume_corner.x, this.volume_corner.y, this.volume_corner.z) }
        this.uniforms.volumeSize      = { type: 'v3', value: new THREE.Vector3(this.volume_size.x, this.volume_size.y, this.volume_size.z) }
        this.uniforms.offset          = { type: 'v3', value: new THREE.Vector3(0, 0, 0) }
        this.uniforms.perlinIntensity = { type: 'f', value:  this.parameters.noise_intensity }
        this.uniforms.perlinFrequency = { type: 'f', value:  0.5 }
        this.uniforms.time            = { type: 'f', value:  0 }
        this.uniforms.timeScale       = { type: 'f', value:  this.time_scale }
        this.uniforms.fadeDistance    = { type: 'f', value:  2 }
        this.uniforms.particleOpacity = { type: 'f', value:  .4 }
        this.uniforms.particleScale   = { type: 'f', value:  this.particle_size * this.pixel_ratio }
        this.uniforms.particlesColor  = { type: 'c', value:  new THREE.Color(this.parameters.color) }
        this.uniforms.depthAtenuation = { type: 'i', value: true }
        this.uniforms.texture         = { type: 't', value: Store.textureThree.particle }

        const vertex_shader = require("../../shaders/snow.vert")
        const fragment_shader = require("../../shaders/snow.frag")

        this.material = new THREE.ShaderMaterial(
            {
                uniforms: this.uniforms,
                vertexShader: vertex_shader,
                fragmentShader: fragment_shader,
                transparent: true,
                blending: THREE[this.blending],
                depthTest: false,
                depthWrite: false,
            })

    }

    createParticles() {

        this.geometry = new THREE.Geometry()
        this.point_cloud = new THREE.Points(this.geometry, this.material)

        // Loop
        var count = this.count
        while (count--) {
            this.geometry.vertices.push(new THREE.Vector3(
                Math.random() * this.volume_size.x - this.volume_size.x / 2,
                Math.random() * this.volume_size.y - this.volume_size.y / 2,
                Math.random() * this.volume_size.z - this.volume_size.z / 2
            ))
        }

        this.scene.add(this.point_cloud)

    }


    update() {

        this.time += .001 //+ (Store.audioControls[2].strength * .001)
        this.uniforms.time.value     = this.time
        this.uniforms.offset.value.x = this.wind.x * this.time * this.time_scale
        this.uniforms.offset.value.y = this.wind.y * this.time * this.time_scale
        this.uniforms.offset.value.z = this.wind.z * this.time * this.time_scale
        this.uniforms.offset.value.y = this.gravity * this.time * this.time_scale
        // let particles_size = (Math.round(this.particle_size * this.point_cloud.parent.scale.x * 1000) / 1000) * this.pixel_ratio
        // this.uniforms.particleScale.value = particles_size

    }

}

export default Snow