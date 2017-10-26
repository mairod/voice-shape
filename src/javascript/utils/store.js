const Store = {

    time: 0,
    volume: 0,
    scene: null,
    audioControls: [],
    avancement: 0,
    
    // Storing textures
    textureThree: {},

    gradientDefault: ["#FFFFFF", "#EAEAEA"],

    // Gradients
    gradients: [
        ["#3f55de", "#1c1640", "#4a4ae4", "#14377f", "#1c1640", "#14377f"],
        ["#1c5b90", "#103965", "#1c5b90", "#103965", "#1c5b90", "#103965"],
        ["#7EE081", "#62A87C", "#C3F3C0", "#62A87C", "#2E4057", "#62A87C"],
        ["#070707", "#4A4A48", "#70A9A1", "#4A4A48", "#40798C", "#070707"],
        ["#7D4E57", "#212D40", "#7D4E57", "#D66853", "#11151C", "#212D40"],
        ["#A74482", "#693668", "#A74482", "#FFB997", "#F67E7D", "#FFB997"],
        ["#6D6875", "#2D898B", "#EACDC2", "#B5838D", "#E5989B", "#FFFFFF"],
        ["#FFef83", "#4A4A48", "#FFFFFF", "#B5838D", "#070707", "#4A4A48"],
    ],

    micIcon: document.querySelector('.mic'),
    micProgress: document.querySelector('.progress'),
    restartBtn: document.querySelector('.restart'),
    micIsAcive: false,
    shapeActive: false

}
export default Store