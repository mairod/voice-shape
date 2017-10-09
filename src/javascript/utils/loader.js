import * as THREE from 'three'
import when from 'when'
import Store from './store'
import Manifest from './manifest'

let defer = when.defer()

class Loader {
    constructor(){}

    load(){

        this.manager = new THREE.LoadingManager()

        Store.textureThree.matcap1 = new THREE.TextureLoader(this.manager).load(Manifest.matcap1)
        Store.textureThree.particle = new THREE.TextureLoader(this.manager).load(Manifest.particle)
        Store.textureThree.background = new THREE.TextureLoader(this.manager).load(Manifest.background, function (texture) {
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        })

        this.manager.onProgress =  (item, loaded, total) => {
            var progress = Math.round((loaded / total) * 100)
            if (progress == 100) {
                setTimeout( () => {
                    this.close()
                }, 1000)
            }
        }

        return defer.promise
    }

    close(){
        
        defer.resolve()
        
    }
}

const singleton = new Loader()
export default singleton