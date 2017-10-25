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
    
function animate() {
    requestAnimationFrame(animate);

    if (Store.avancement < 1) {
        Store.micProgress.style.heigt = Store.avancement * 100 + "%"
    }

    // Updating components
    Store.time += 1
    Three.update()
    MicroInput.update()

}