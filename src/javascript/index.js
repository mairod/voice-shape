import ThreeController from './components/ThreeController'
import DebugController from './components/DebugController'
import MicroInput from './components/MicroInput'
import Store from './utils/store'

let Three
MicroInput.init().then(()=>{

    // when context linked
    console.log('Audio created')
    

    Three = new ThreeController({
        container: document.querySelector('#container')
    })
    // start animating
    animate()
})



function animate() {
    requestAnimationFrame(animate);

    // Updating components
    Store.time += 1
    Three.update()
    MicroInput.update()

}

// console.log("YO !");
