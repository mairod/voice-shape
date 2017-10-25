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
        document.querySelector('#loader').style.display = "none"
        defer.resolve()
        setTimeout(() => { document.querySelector('.title').classList.add('active') }, 1000)
        setTimeout(() => { document.querySelector('.introDesc').classList.add('active') }, 3000)
        setTimeout(() => { 
            document.querySelector('.title').classList.remove('active')
            document.querySelector('.introDesc').classList.remove('active')
        }, 5000)
        setTimeout(() => { document.querySelector('.secoondScreen').classList.add('active') }, 6000)
        setTimeout(() => { document.querySelector('.secondDesc').classList.add('active') }, 7500)
        setTimeout(() => {
            document.querySelector('.secoondScreen').classList.remove('active')
            document.querySelector('.secondDesc').classList.remove('active')
        }, 10000)
        setTimeout(() => { 
            Store.timelineIntro.play()
        }, 11000)
    }
}

const singleton = new Loader()
export default singleton