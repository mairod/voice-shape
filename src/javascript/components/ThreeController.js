import * as TOOLS from './tools.class.js'
import * as THREE from 'three'
import normalizeWheel from 'normalize-wheel'
import Store from '../utils/store'
import DebugController from './DebugController'
import FBO from './FBOSimulation'
import ReactiveRing from './reactiveRing'
import Snow from './snow'

class ThreeController {

    constructor(options) {

        this.options            = options
        this.container          = this.options.container
        this.width              = this.container.offsetWidth
        this.height             = this.container.offsetHeight
        this.camera             = new Object()
        this.assets             = new Object()
        this.scene              = new THREE.Scene()
        this.group              = new THREE.Group()
        this.mouse              = new THREE.Vector3(0, 0, -.3)
        this.mouse_drag         = new THREE.Vector2(0, 0)
        this.drag_rotation      = new THREE.Vector2(0, 0)
        this.rotation_direction = new THREE.Vector2(0, 0)
        this.camera_rotation    = new THREE.Vector2(0, 0)
        this.camera_direction   = new THREE.Vector3(0, 0, 0)
        this.camera_position    = new THREE.Vector3(0, 0, 0)
        this.cameraEasing       = { x: 2, y: 2 }
        this.time               = 0

        this.store = Store
        this.store.scene = this.group
        this.scene.add(this.group)

        this.rings = []

        this.config = {
            rotationSpeed: { value: 1, range: [0, 10] }
        }
        
        DebugController.register("config", this.config, "THREE controller")

        this.initEnvironement()
        this.initCamera()
        this.initEvent()
        this.initFbo()
        this.initMesh()
        this.initSnow()
        this.initBackground()
        this.initSphere()
        // this.initDummy()

        // Debug
        if (!DebugController.active) { return }
        this.enableDebugSimulation()


    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        this.camera.position.z = 200;
    }

    initEnvironement() {

        // this.scene.fog = new THREE.FogExp2(0xeaeaea, 0.0020)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)

        this.container.appendChild(this.renderer.domElement)
    }

    initEvent() {
        var that = this
        window.addEventListener('resize',  () => {
            this.width = window.innerWidth
            this.height = window.innerHeight
            this.camera.aspect = this.width / this.height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(this.width, this.height)
            bounds = this.container.getBoundingClientRect()
        }, false)

        let last_mouse = { x: 0, y: 0 }
        var bounds = this.container.getBoundingClientRect()

        function onMove(pointer, mobile) {

            this.mouse.x = ((pointer.clientX - bounds.left) / this.width - .5) * 2
            this.mouse.y = ((pointer.clientY - bounds.top) / this.height - .5) * 2

            let mouse_x = this.mouse.x - last_mouse.x
            let mouse_y = this.mouse.y - last_mouse.y

            if (this.drag) {                
                this.drag_rotation.x += mouse_x * 1.5
                this.drag_rotation.y += mouse_y * 1.5
                this.drag_rotation.y = Math.min(Math.max(this.drag_rotation.y, -Math.PI / 4), Math.PI / 4)
            }

            last_mouse.x = this.mouse.x
            last_mouse.y = this.mouse.y

        }

        window.addEventListener("mousemove", onMove.bind(this))
        window.addEventListener("touchmove", (e) => { onMove(e.touches[0]).bind(this) }, true)

        window.addEventListener("mousedown", () => this.drag = true)
        window.addEventListener("mouseup", () => this.drag = false)

        document.addEventListener("touchstart", () => this.drag = true)
        document.addEventListener("touchend", () => this.drag = false)

        document.addEventListener('wheel', (e) => {            
                const normalized_wheel = normalizeWheel(e)
                that.mouse.z += normalized_wheel.spinY * -.01
                that.mouse.z = Math.min(Math.max(that.mouse.z, -.4), 1)
        })


    }

    initDummy(){
        this.dummmy = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10, 1), new THREE.MeshNormalMaterial())
        this.scene.add(this.dummmy)
    }

    initFbo(){
        FBO.init(this.renderer)
    }

    initMesh(){
        
        for (var i = 0; i < 2; i++) {
            this.rings.push(
                new ReactiveRing({
                    index: i
                })
            )
        }
    
    }

    initSnow(){
        this.snow = new Snow({
            scene: this.group,
        })        
    }

    initSphere(){

        let geom = new THREE.SphereBufferGeometry(20, 20, 20)

        let material = new THREE.ShaderMaterial({
            uniforms: {
                matcap: { type: "t", value: Store.textureThree.matcap1 },
            },
            vertexShader: require('../../shaders/sphere.vert'),
            fragmentShader: require('../../shaders/sphere.frag'),
        })

        this.group.add(new THREE.Mesh(geom, material))

    }

    initBackground(){

        let geom = new THREE.PlaneBufferGeometry(this.width / 3.2, this.height / 3.2)

        let colors = Store.gradients[Math.floor(Store.gradients.length * Math.random())]

        this.backgroundShader = new THREE.ShaderMaterial({
            uniforms: {
                utime: { type: "f", value: 0 },
                offset: { type: "f", value: 0 },
                background: { type: "t", value: Store.textureThree.background },
                color1: { type: "v3", value: new THREE.Color(colors[0]) },
                color2: { type: "v3", value: new THREE.Color(colors[1]) },
            },
            vertexShader: require('../../shaders/simulation.vert'),
            fragmentShader: require('../../shaders/background.frag'),
        })

        this.background = new THREE.Mesh(geom, this.backgroundShader)
        this.scene.add(this.background)

        this.background.position.z = -100

    }

    enableDebugSimulation(){
        let plane = new THREE.PlaneBufferGeometry(30, 30)
        let bufferMaterial = new THREE.MeshBasicMaterial({ map: FBO.rtt.texture })
        let mesh = new THREE.Mesh(plane, bufferMaterial)
        mesh.position.y = - 65
        mesh.position.x = 77
        this.scene.add(mesh)
    }

    update() {

        FBO.update()

        if (this.dummmy != undefined) {
            this.dummmy.rotation.y += .01 * this.config.rotationSpeed.value
        }

        if (this.snow != undefined) {
            this.snow.update()
        }

        for (var i = 0; i < this.rings.length; i++) {
           this.rings[i].update()
        }

      
        // Vector Stuff
        this.rotation_direction.subVectors(this.drag_rotation, this.camera_rotation)
        this.rotation_direction.multiplyScalar(.08)
        this.camera_rotation.addVectors(this.camera_rotation, this.rotation_direction)
        
        this.camera_direction.subVectors(this.mouse, this.camera_position)
        this.camera_direction.multiplyScalar(.08)
        this.camera_position.addVectors(this.camera_position, this.camera_direction)
        
        this.group.rotation.y = this.camera_rotation.x * this.cameraEasing.x
        // this.group.rotation.x = this.camera_rotation.y * this.cameraEasing.y
        this.group.scale.set(1 + this.camera_position.z, 1 + this.camera_position.z, 1 + this.camera_position.z)
        this.background.scale.set(1.5 + this.camera_position.z, 1.5 + this.camera_position.z, 1.5 + this.camera_position.z)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        // offset background
        this.backgroundShader.uniforms.offset.value = this.camera_rotation.x * this.cameraEasing.x * .3
        
        // Render 
        this.renderer.render(this.scene, this.camera);
    }


}

export default ThreeController