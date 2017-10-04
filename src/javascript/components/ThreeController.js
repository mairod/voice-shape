import * as TOOLS from './tools.class.js'
import * as THREE from 'three'
import Store from '../utils/store'
import DebugController from './DebugController'
import FBO from './FBOSimulation'
import ReactiveRing from './reactiveRing'

class ThreeController {

    constructor(options) {

        this.options        = options
        this.container      = this.options.container
        this.width          = this.container.offsetWidth
        this.height         = this.container.offsetHeight
        this.camera         = new Object()
        this.assets         = new Object()
        this.scene          = new THREE.Scene()
        this.mouse          = new THREE.Vector2(0, 0)
        this.direction      = new THREE.Vector2(0, 0)
        this.cameraPosition = new THREE.Vector2(0, 0)
        this.cameraEasing   = { x: 100, y: 10 }
        this.time           = 0

        this.store = Store
        this.store.scene = this.scene

        this.rings = []

        this.config = {
            rotationSpeed: { value: 1, range: [0, 10] }
        }
        
        DebugController.register("config", this.config, "THREE controller")

        this.initLoader()
        this.initEnvironement()
        this.initCamera()
        this.initEvent()
        this.initLoader()
        this.initFbo()
        this.initMesh()
        // this.initDummy()

        // Debug
        if (!DebugController.active) { return }
        this.enableDebugSimulation()


    }

    initLoader() {

        this.manager = new THREE.LoadingManager();
        this.manager.onProgress = function (item, loaded, total) {
            var progress = Math.round((loaded / total) * 100)
            if (progress == 100) {
                setTimeout(function () {

                }, 1000);
            }
        }

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

        // this.renderer.shadowMap.enabled = true
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        // this.renderer.shadowMapWidth = 1024
        // this.renderer.shadowMapHeight = 1024
        // this.renderer.sortObjects = false

        this.container.appendChild(this.renderer.domElement)
    }

    initEvent() {
        var that = this
        window.addEventListener('resize', function () {
            that.width = window.innerWidth
            that.height = window.innerHeight
            that.camera.aspect = that.width / that.height;
            that.camera.updateProjectionMatrix();
            that.renderer.setSize(that.width, that.height);
        }, false)

        window.addEventListener("mousemove", function (event) {
            that.mouse.x = (event.clientX / that.width - .5) * 2
            that.mouse.y = (event.clientY / that.height - .5) * 2
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
        
        this.rings.push(
            new ReactiveRing({

            })
        )
    
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

        for (var i = 0; i < this.rings.length; i++) {
           this.rings[i].update() 
        }

        // camera
        // this.direction.subVectors(this.mouse, this.cameraPosition)
        // this.direction.multiplyScalar(.06)
        // this.cameraPosition.addVectors(this.cameraPosition, this.direction)
        // this.camera.position.x = this.cameraPosition.x * this.cameraEasing.x * -1
        // this.camera.position.y = -this.cameraPosition.y * this.cameraEasing.y * -1
        // this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        this.renderer.render(this.scene, this.camera);
    }


}

export default ThreeController