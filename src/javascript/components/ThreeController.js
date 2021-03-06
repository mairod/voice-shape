import * as TOOLS from './tools.class.js'
import * as THREE from 'three'
import normalizeWheel from 'normalize-wheel'
import Store from '../utils/store'
import DebugController from './DebugController'
import FBO from './FBOSimulation'
import ReactiveRing from './reactiveRing'
import Snow from './snow'
import TimelineMax from 'gsap/timelinemax'

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
        this.pickColor()
        this.initFbo()
        this.initMesh()
        this.initSnow()
        this.initBackground()
        this.initSphere()
        this.initIntroChoregraphy()
        
        window.GL = this.scene
        // Debug
        if (!DebugController.active) { return }
        this.enableDebugSimulation()


    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
        this.camera.position.z = 200;
    }

    initEnvironement() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: window.devicePixelRatio < 1.5,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.setSize(this.width, this.height)

        this.container.appendChild(this.renderer.domElement)
        setTimeout(()=>{
            this.renderer.domElement.classList.add('active')
        }, 10)
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

        window.addEventListener("mousedown", () => {
            this.drag = true
            document.body.classList.add('grabbing')
        })
        window.addEventListener("mouseup", () => {
            this.drag = false
            document.body.classList.remove('grabbing')
        })

        window.addEventListener("touchstart", () => {
            this.drag = true
            document.body.classList.add('grabbing')
        })
        window.addEventListener("touchend", () => {
            this.drag = false
            document.body.classList.remove('grabbing')
        })

        document.addEventListener('wheel', (e) => {            
                const normalized_wheel = normalizeWheel(e)
                that.mouse.z += normalized_wheel.spinY * -.01
                that.mouse.z = Math.min(Math.max(that.mouse.z, -.4), 1)
        })

        Store.restartBtn.addEventListener('click', ()=>{
            this.reset()
        })

    }

    initDummy(){
        this.dummmy = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10, 1), new THREE.MeshNormalMaterial())
        this.scene.add(this.dummmy)
    }

    pickColor(){
        Store.activeColor = Store.gradients[Math.floor(Store.gradients.length * Math.random())]        
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

        this.sphere = new THREE.Mesh(geom, material)
        this.sphere.position.y = -200
        this.group.add(this.sphere)

    }

    initBackground(){

        let geom = new THREE.PlaneBufferGeometry(100, 100)

        // let colors = Store.gradients[Math.floor(Store.gradients.length * Math.random())]
        let colors = [Store.activeColor[4], Store.activeColor[5]]

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

    initIntroChoregraphy(){
        this.tl = new TimelineMax({ paused: true })
        this.tl.stop(0)
        
        let tmp = { x: 0, y: -200, z: 0 }
        function onUpdate(){
            this.sphere.position.y = tmp.y
        }

        this.tl.to(tmp, 3, { 
            x: 0, y: 0,z: 0,
            onUpdate: onUpdate.bind(this),
            ease: Power3.easeOut
        })
        this.tl.add(()=>{
            setTimeout(() => {
                this.enableMic()
            }, 100)
        })

        Store.timelineIntro = this.tl
    }

    enableMic(){
        Store.micIcon.classList.add('active')
        for (var i = 0; i < this.rings.length; i++) {
            this.rings[i].enable()
        }

        Store.micIsAcive = true
        Store.shapeActive = true
    
        this.mouse.z = -.3

    }

    disableMic(){
        Store.micIsAcive = false
        Store.micIcon.classList.remove('active')
        Store.restartBtn.classList.add('active')
    }
    
    declareEnd(){
        if (Store.shapeActive) {
            this.disableMic()
            Store.shapeActive = false
            this.mouse.z = -.4
            for (var i = 0; i < this.rings.length; i++) {
                this.rings[i].playEndAnim()
            }
        }
    }

    reset(){
        Store.micProgress.style.height = 0
        Store.restartBtn.classList.remove('active')
        for (var i = 0; i < this.rings.length; i++) {
            this.rings[i].playHideAnim()
        }
        this.mouse.z = -.3
        this.pickColor()
        this.changeBackground()
        setTimeout(() => {
            for (var i = 0; i < this.rings.length; i++) {
                this.rings[i].playHideAnim()
            }
            this.rings.length = 0
        }, 2000);
        setTimeout(() => {
            this.initMesh()
            for (var i = 0; i < this.rings.length; i++) {
                this.rings[i].enable()
            }
            this.enableMic()
            Store.avancement = 0
        }, 3000);
        // this.initMesh()
    }

    changeBackground(){
        let tl = new TimelineMax()

        let nc1 = new THREE.Color(Store.activeColor[4])
        let nc2 = new THREE.Color(Store.activeColor[5])

        let tmp = {
            c1r: this.backgroundShader.uniforms.color1.value.r,
            c1g: this.backgroundShader.uniforms.color1.value.g,
            c1b: this.backgroundShader.uniforms.color1.value.b,
            c2r: this.backgroundShader.uniforms.color2.value.r,
            c2g: this.backgroundShader.uniforms.color2.value.g,
            c2b: this.backgroundShader.uniforms.color2.value.b
        }

        function onUpdate() {
            this.backgroundShader.uniforms.color1.value.r = tmp.c1r
            this.backgroundShader.uniforms.color1.value.g = tmp.c1g
            this.backgroundShader.uniforms.color1.value.b = tmp.c1b
            this.backgroundShader.uniforms.color2.value.r = tmp.c2r
            this.backgroundShader.uniforms.color2.value.g = tmp.c2g
            this.backgroundShader.uniforms.color2.value.b = tmp.c2b
        }

        tl.to(tmp, 1, {
            c1r: nc1.r,
            c1g: nc1.g,
            c1b: nc1.b,
            c2r: nc2.r,
            c2g: nc2.g,
            c2b: nc2.b,
            onUpdate: onUpdate.bind(this),
            ease: Power3.easeOut
        })
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

        this.group.scale.set(1 + this.camera_position.z, 1 + this.camera_position.z, 1 + this.camera_position.z)
        this.background.scale.set((3 + this.camera_position.z) * (this.width / this.height), 3 + this.camera_position.z, 1)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        // offset background
        this.backgroundShader.uniforms.offset.value = this.camera_rotation.x * this.cameraEasing.x * .3
        
        // Render 
        this.renderer.render(this.scene, this.camera);
    }


}

export default ThreeController