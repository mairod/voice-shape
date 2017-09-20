import ThreeController from './components/ThreeController'
import DebugController from './components/DebugController'
import MicroInput from './components/MicroInput'

let Three = new ThreeController({
    container: document.querySelector('#container')
})

// start animating
animate();

function animate() {
    requestAnimationFrame(animate);

    // Updating components
    Three.update()
    MicroInput.update()

}

// console.log("YO !");
