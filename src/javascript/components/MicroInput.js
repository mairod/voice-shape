import * as TOOLS from './tools.class.js'
import Store from '../utils/store'
import DebugController from './DebugController'

class MicroInput {

    constructor(){
        this.checkSupport()
    }

    checkSupport(){
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
        }
        if (navigator.getUserMedia) {
            navigator.getUserMedia({ audio: true },
                this.startMic.bind(this),
                function (e) {
                    alert('Error capturing audio.');
                }
            )
            return true
        }
    }

    startMic(stream){
        
        this.analizer = new TOOLS.AudioAnalyzer({
            stream: stream,
            samplingFrequency: 128
        })

        Store.analizer = this.analizer
        DebugController.displayAudioAnalizer()
        this.analizer.addControlPoint({ bufferPosition: 1 })
        this.analizer.addControlPoint({ bufferPosition: 8 })
        this.analizer.addControlPoint({ bufferPosition: 15 })
        
        Store.volume = this.analizer.volume
        Store.audioControls = this.analizer.controls

    }

    update(){
        if (this.analizer != undefined) { 
            this.analizer.update()
            Store.volume = this.analizer.volume
        }
    }
}
const exportable = new MicroInput()
export default exportable