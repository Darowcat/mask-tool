var panoInput, layoutInput, edgeInput, segInput, maskInput;
var panoImage, layoutImage, edgeImage, segImage, maskImage;
var editLayoutImage, editEdgeImage;
var panoCheckBox, layoutCheckBox, edgeCheckBox, segCheckBox;
var StorageRef = firebase.storage().ref();
var n;

window.onload = function() {
    var d = new Date();
    n = d.getTime();
    var timeText = document.getElementById("timestamp");
    timeText.innerText = "folder ID :" + n;
    let panoRef = StorageRef.child( n + "/images/panorama.png");
    let layoutRef = StorageRef.child( n + "/images/layouts/raw_layout.png");
    let edgeRef = StorageRef.child( n + "/images/edges/raw_edge.png");
    let segRef = StorageRef.child( n + "/images/segmentation.png");
    let maskRef = StorageRef.child( n + "/images/masks/mask.png");

    let panoInput = document.getElementById("panoinput");
    let layoutInput = document.getElementById("layoutinput");
    let edgeInput = document.getElementById("edgeinput");
    let segInput = document.getElementById("segmentationinput");
    let maskInput = document.getElementById("maskinput");

    panoInput.addEventListener('change', function(evt) {
        let firstFile = evt.target.files[0]; // upload the first file only
        let uploadTask = panoRef.put(firstFile);

    })

    layoutInput.addEventListener('change', function(evt) {
        let firstFile = evt.target.files[0]; // upload the first file only
        let uploadTask = layoutRef.put(firstFile);

        eel.editLayout(n);
    })

    edgeInput.addEventListener('change', function(evt) {
        let firstFile = evt.target.files[0]; // upload the first file only
        let uploadTask = edgeRef.put(firstFile);

        eel.editEdge(n);
    })

    segInput.addEventListener('change', function(evt) {
        let firstFile = evt.target.files[0]; // upload the first file only
        let uploadTask = segRef.put(firstFile);

        eel.generateMasks(n);
    })

    maskInput.addEventListener('change', function(evt) {
        let firstFile = evt.target.files[0];// upload the first file only
        let uploadTask = maskRef.put(firstFile);
    })
}

function PanoUpload(){
    panoInput = document.getElementById("panoinput");
    panoCheckBox = document.getElementById("pano-display");
    panoCheckBox.checked = true;
    panoImage = new SimpleImage(panoInput);
    ChangeDisplayPano();
}

function LayoutUpload() {
    layoutInput = document.getElementById("layoutinput");
    layoutImage = new SimpleImage(layoutInput);
}

function EdgeUpload() {
    edgeInput = document.getElementById("edgeinput");
    edgeImage = new SimpleImage(edgeInput);
}

function SegmentationUpload() {
    segInput = document.getElementById("segmentationinput");
    segImage = new SimpleImage(segInput);

    var imgcanvas = document.getElementById("displayCanvasSeg");
    segImage.drawTo(imgcanvas);
}

function MaskUpload() {
    maskInput = document.getElementById("maskinput");
    maskImage = new SimpleImage(maskInput);
}

function ChangeDisplayPano(){
    panoCheckBox = document.getElementById("pano-display");
    layoutCheckBox = document.getElementById("layout-display");
    edgeCheckBox = document.getElementById("edge-display");
    segCheckBox = document.getElementById("seg-display");
    maskCheckBox = document.getElementById("mask-display");

    if (panoCheckBox.checked == true){
        if (panoImage != undefined){
            var imgcanvas = document.getElementById("displayCanvasPano"); 
            var topCanvas = document.getElementById("displayCanvas");
            var maskCanvas = document.getElementById("displayCanvasMask");
            if (layoutCheckBox.checked == true || edgeCheckBox.checked == true || segCheckBox.checked == true){
                if (layoutCheckBox.checked == true){
                    var editLayoutImage = new Image();
                    StorageRef.child(n + "/images/layouts/preprocessed_layout.png").getDownloadURL().then(function(url) {
                        console.image(url);
                        editLayoutImage.onload = function(){
                            ctx = topCanvas.getContext('2d');
                            ctx.drawImage(editLayoutImage, 0, 0);
                        }
                        editLayoutImage.src = url + '?' + new Date().getTime();
                        editLayoutImage.setAttribute('crossOrigin', '');
                        topCanvas.style.opacity = 0.5;
                    })
                } else if (edgeCheckBox.checked == true){
                    var editEdgeImage = new Image();
                    StorageRef.child(n + "/images/edges/preprocessed_edge.png").getDownloadURL().then(function(url) {
                        console.image(url);
                        editEdgeImage.onload = function(){
                            ctx = topCanvas.getContext('2d');
                            ctx.drawImage(editEdgeImage, 0, 0);
                        }
                        editEdgeImage.src = url + '?' + new Date().getTime();
                        editEdgeImage.setAttribute('crossOrigin', '');
                        topCanvas.style.opacity = 0.5;
                    })
                } else if (segCheckBox.checked == true){
                    topCanvas.style.opacity = 1.0;
                }
            } else {
                topCanvas.style.opacity = 0;
            }
            if (maskCheckBox.checked == true){
                maskCanvas.style.opacity = 0.5;
            } else {
                maskCanvas.style.opacity = 0;
            }
            panoImage.drawTo(imgcanvas);
        } else {
            alert("You have to upload a panorama first.");
            panoCheckBox.checked = false;
        }
    } else {
        if (layoutCheckBox.checked == true || edgeCheckBox.checked == true || segCheckBox.checked == true){
            var topCanvas = document.getElementById("displayCanvas");
            topCanvas.style.opacity = 1.0;
            if (layoutCheckBox.checked == true){
                layoutImage.drawTo(topCanvas);
            } else if (edgeCheckBox.checked == true){
                edgeImage.drawTo(topCanvas);
            } else if (segCheckBox.checked == true){
                segImage.drawTo(topCanvas);
            }
        } else if (maskCheckBox.checked == true){
            var maskCanvas = document.getElementById("displayCanvasMask");
            maskCanvas.style.opacity = 1.0;
        } else {
            var imgcanvas = document.getElementById("displayCanvasPano"); 
            ctx = imgcanvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function ChangeDisplayLayout(){
    panoCheckBox = document.getElementById("pano-display");
    layoutCheckBox = document.getElementById("layout-display");
    edgeCheckBox = document.getElementById("edge-display");
    segCheckBox = document.getElementById("seg-display");
    maskCheckBox = document.getElementById("mask-display");

    if (layoutCheckBox.checked == true){
        if (layoutImage != undefined){
            var imgcanvas = document.getElementById("displayCanvas");
            var maskCanvas = document.getElementById("displayCanvasMask");
            if (panoCheckBox.checked == true){
                var editLayoutImage = new Image();
                StorageRef.child(n + "/images/layouts/preprocessed_layout.png").getDownloadURL().then(function(url) {
                    console.log(url);
                    console.image(url);
                    editLayoutImage.onload = function(){
                        var ctx = imgcanvas.getContext('2d');
                        ctx.drawImage(editLayoutImage, 0, 0);
                    }
                    editLayoutImage.src = url + '?' + new Date().getTime();
                    editLayoutImage.setAttribute('crossOrigin', '');
                    imgcanvas.style.opacity = 0.5;
                })
            } else {
                imgcanvas.style.opacity = 1.0;
                layoutImage.drawTo(imgcanvas);
            }
            maskCanvas.style.opacity = 0;
            
            //panoCheckBox.checked = false;
            edgeCheckBox.checked = false;
            segCheckBox.checked = false;
            maskCheckBox.checked = false;
        } else {
            alert("You have to upload a layout first.");
            layoutCheckBox.checked = false;
        }
    } else {
        var imgcanvas = document.getElementById("displayCanvas");
        imgcanvas.style.opacity = 0;
        if (panoCheckBox.checked == false){
            var imgcanvas = document.getElementById("displayCanvasPano"); 
            ctx = imgcanvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function ChangeDisplayEdge(){
    panoCheckBox = document.getElementById("pano-display");
    layoutCheckBox = document.getElementById("layout-display");
    edgeCheckBox = document.getElementById("edge-display");
    segCheckBox = document.getElementById("seg-display");
    maskCheckBox = document.getElementById("mask-display");

    if (edgeCheckBox.checked == true){
        if (edgeImage != undefined){
            var imgcanvas = document.getElementById("displayCanvas");
            var maskCanvas = document.getElementById("displayCanvasMask");

            if (panoCheckBox.checked == true){
                var editEdgeImage = new Image();
                StorageRef.child(n + "/images/edges/preprocessed_edge.png").getDownloadURL().then(function(url) {
                    editEdgeImage.onload = function(){
                        var ctx = imgcanvas.getContext('2d');
                        ctx.drawImage(editEdgeImage, 0, 0);
                    }
                    editEdgeImage.src = url + '?' + new Date().getTime();
                    editEdgeImage.setAttribute('crossOrigin', '');
                    imgcanvas.style.opacity = 0.5;
                })
            } else {
                imgcanvas.style.opacity = 1.0;
                edgeImage.drawTo(imgcanvas);
            }
            maskCanvas.style.opacity = 0;

            //panoCheckBox.checked = false;
            layoutCheckBox.checked = false;
            segCheckBox.checked = false;
            maskCheckBox.checked = false;
        } else {
            alert("You have to upload a edge picture first.");
            edgeCheckBox.checked = false;
        }
    } else {
        var imgcanvas = document.getElementById("displayCanvas");
        imgcanvas.style.opacity = 0;
        if (panoCheckBox.checked == false){
            var imgcanvas = document.getElementById("displayCanvasPano"); 
            ctx = imgcanvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function ChangeDisplaySeg(){
    panoCheckBox = document.getElementById("pano-display");
    layoutCheckBox = document.getElementById("layout-display");
    edgeCheckBox = document.getElementById("edge-display");
    segCheckBox = document.getElementById("seg-display");
    maskCheckBox = document.getElementById("mask-display");

    if (segCheckBox.checked == true){
        if (segImage != undefined){
            var imgcanvas = document.getElementById("displayCanvas");
            var maskCanvas = document.getElementById("displayCanvasMask");
            if (panoCheckBox.checked == true){
                imgcanvas.style.opacity = 0.5;
            } else {
                imgcanvas.style.opacity = 1.0;
            }
            maskCanvas.style.opacity = 0;

            segImage.drawTo(imgcanvas);
            //panoCheckBox.checked = false;
            layoutCheckBox.checked = false;
            edgeCheckBox.checked = false;
            maskCheckBox.checked = false;
        } else {
            alert("You have to upload a semantic segmentation first.");
            segCheckBox.checked = false;
        }
    } else {
        var imgcanvas = document.getElementById("displayCanvas");
        imgcanvas.style.opacity = 0;
        if (panoCheckBox.checked == false){
            var imgcanvas = document.getElementById("displayCanvasPano"); 
            ctx = imgcanvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}

function ChangeDisplayMask(){
    panoCheckBox = document.getElementById("pano-display");
    layoutCheckBox = document.getElementById("layout-display");
    edgeCheckBox = document.getElementById("edge-display");
    segCheckBox = document.getElementById("seg-display");
    maskCheckBox = document.getElementById("mask-display");

    if (maskCheckBox.checked == true){
        var maskCanvas = document.getElementById("displayCanvasMask");
        var imgcanvas = document.getElementById("displayCanvas");

        if (panoCheckBox.checked == true){
            maskCanvas.style.opacity = 0.5;
        } else {
            maskCanvas.style.opacity = 1.0;
        }
        imgcanvas.style.opacity = 0;

        layoutCheckBox.checked = false;
        edgeCheckBox.checked = false; 
        segCheckBox.checked = false;

        if (maskImage != undefined){
            maskImage.drawTo(maskCanvas);
        }

    } else {
        var imgcanvas = document.getElementById("displayCanvasMask");
        imgcanvas.style.opacity = 0;
        if (panoCheckBox.checked == false){
            var imgcanvas = document.getElementById("displayCanvasPano"); 
            ctx = imgcanvas.getContext("2d");
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
}