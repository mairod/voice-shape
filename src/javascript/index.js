import ThreeController from './components/ThreeController'
import DebugController from './components/DebugController'
import MicroInput from './components/MicroInput'
import Store from './utils/store'
import Loader from './utils/loader'

let Three
Loader.load().then(MicroInput.init()).then(() => {
    Three = new ThreeController({ container: document.querySelector('#container') })
    animate()
})

let progress = 0
    
function animate() {
    requestAnimationFrame(animate);

    progress = Math.min((Store.avancement * 1.1) * 100, 100)
    if (Store.avancement < 1 && Store.micIsAcive && progress < 100) {
        Store.micProgress.style.height = progress + "%"
    } else if( progress === 100 ){
        Three.declareEnd()
    }

    // Updating components
    Store.time += 1
    Three.update()
    MicroInput.update()

}