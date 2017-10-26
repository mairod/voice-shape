import Store from '../utils/store'
import DebugController from './DebugController'
import AudioAnalyzer from './audioAnalyzer'

import when from 'when'

let defer = when.defer()

class MicroInput {

    constructor(){}

    init(){
        this.checkSupport()
        return defer.promise
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
        
        this.analizer = new AudioAnalyzer({
            stream: stream,
            samplingFrequency: 1024,
        })

        this.analizer.init().then(()=>{
            defer.resolve()
        })

        Store.analizer = this.analizer
        DebugController.displayAudioAnalizer()
        this.analizer.addControlPoint({ bufferPosition: 1 })
        this.analizer.addControlPoint({ bufferPosition: 20 })
        this.analizer.addControlPoint({ bufferPosition: 45 })
        
        Store.volume = this.analizer.volume
        Store.audioControls = this.analizer.controls
        Store.audioData = this.analizer.dataArray

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