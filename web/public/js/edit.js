var panoCanvas, canvas, maskCanvas, tmpMaskCanvas;
var ctx;
var mode = "none";
var undoArray = [];
var redoArray = [];

let coord = {x:0 , y:0}; 
let paint = false;

var StorageRef = firebase.storage().ref();
var timestamp;

$( document ).ready( function() {
    panoCanvas = document.getElementById("displayCanvasPano");
    ctx = panoCanvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, panoCanvas.width, panoCanvas.height);

    canvas = document.getElementById("displayCanvas");
    ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = 0;

    maskCanvas = document.getElementById("displayCanvasMask");
    ctx = maskCanvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskCanvas.style.opacity = 0;
    ctx.strokeStyle = "white";
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    maskCanvas.addEventListener('mousedown', startInput);
    maskCanvas.addEventListener('mouseup', stopInput);
    maskCanvas.addEventListener('mousemove', sketch);

    tmpMaskCanvas = document.getElementById("tmpMask");
    
    slider = document.getElementById("myRange");
    ctx.lineWidth = slider.value;

    slider.oninput = function() {   
        ctx.lineWidth = this.value;
    }
});

function UploadMask(){
    var maskCanvas = document.getElementById("displayCanvasMask");
    maskCanvas.toBlob(function(blob){
        var image = new Image();
        image.src = blob;
        var uploadTask = StorageRef.child( timestamp + "/images/masks/currentMask.png").put(blob);
    })
}

function ShowMask(){
    var panoCheckBox = document.getElementById("pano-display");
    var maskCheckBox = document.getElementById("mask-display");
    var editCheckBox = document.getElementById("editing");
    var timeText = document.getElementById("timestamp");
    timestamp = timeText.innerText;
    timestamp = timestamp.replace("folder ID :", '');
    if (editCheckBox.checked == true){
        if (panoCheckBox.checked == true){
            maskCanvas.style.opacity = 0.5;
        } else {
            maskCanvas.style.opacity = 1.0;
        }
        maskCheckBox.checked = true;
        ChangeDisplayMask();
    }
    
}

function change_mode(num){
    var editCheckBox = document.getElementById("editing");

    if (editCheckBox.checked != true){
        alert("You have to check edit mode first!");
        return;
    }

    if (num == "brush"){
        mode = "brush";
    } else if (num == "eraser"){
        mode = "eraser";
    } else if (num == "redo"){
        mode = "redo";
        var elementToChange = document.getElementsByTagName("body")[0];
        elementToChange.style.cursor = "default";

        if (redoArray.length > 0) {
            undoArray.push(ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
            ctx.putImageData(redoArray.pop(), 0, 0);
        }
    } else if (num == "undo"){
        mode = "undo";
        var elementToChange = document.getElementsByTagName("body")[0];
        elementToChange.style.cursor = "default";

        if (undoArray.length > 0) {
            redoArray.push(ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
            ctx.putImageData(undoArray.pop(), 0, 0);
        }
    } else if (num == "select"){
        mode = "select";
    } else if (num == "remove"){
        mode = "remove";
        
        var newMask = new Image();
        StorageRef.child(timestamp + "/images/masks/maskset/remove_all_mask.png").getDownloadURL().then(function(url) {
            newMask.onload = function(){
                ctx_tmp = tmpMaskCanvas.getContext('2d');
                ctx_tmp.drawImage(newMask, 0, 0);
            }
            newMask.src = url + '?' + new Date().getTime();
            newMask.setAttribute('crossOrigin', '');
        }).then(function(){
            ctx_tmp = tmpMaskCanvas.getContext('2d');
            var newMaskData = ctx_tmp.getImageData(0, 0, tmpMaskCanvas.width, tmpMaskCanvas.height);
            var newData = newMaskData.data;
            console.log(newData);

            ctx = maskCanvas.getContext('2d');
            var oldMaskData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            var oldData = oldMaskData.data;
            console.log(oldData);

            for (var i = 0; i <= oldData.length; i+= 4){
                if (newData[i] == 255 && newData[i + 1] == 255 && newData[i + 2] == 255){
                    oldData[i] = 255;
                    oldData[i + 1] = 255;
                    oldData[i + 2] = 255;
                    //console.log(i);
                } else if (oldData[i] == 255 && oldData[i + 1] == 255 && oldData[i + 2] == 255){
                    oldData[i] = 255;
                    oldData[i + 1] = 255;
                    oldData[i + 2] = 255;
                    //console.log(i);
                } else {
                    oldData[i] = 0;
                    oldData[i + 1] = 0;
                    oldData[i + 2] = 0;
                }
            }
            ctx.putImageData(oldMaskData, 0, 0);  
        })
    }
}

function startInput(event){
    var editCheckBox = document.getElementById("editing");
    if (editCheckBox.checked == true){
        paint = true;
        
        undoArray.push(ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height));
        redoArray = [];
        coord.x = event.offsetX;
        coord.y = event.offsetY;
        if (mode == "brush") {
            ctx.globalCompositeOperation="source-over";
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(event.offsetX, event.offsetY);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        } else if (mode == "eraser") {
            ctx.globalCompositeOperation="source-over";
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(event.offsetX, event.offsetY);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        } else if (mode == "select"){
            //console.log(event.offsetX, event.offsetY);
            var canvas = document.getElementById('displayCanvasSeg');
            var ctx_tmp = canvas.getContext('2d');
            var x = event.offsetX;
            var y = event.offsetY;
            var pixel = ctx_tmp.getImageData(x, y, 1, 1);
            var data = pixel.data;
            var rgba = 'rgba(' + data[0] + ', ' + data[1] + ', ' + data[2] + ', ' + (data[3] / 255) + ')';
            console.log(rgba);

            var timeoutID = window.setTimeout(( () => {
                var newMask = new Image();
                StorageRef.child(timestamp + "/images/masks/maskset/mask_" + data[2] + '_' + data[1] + '_' + data[0] + '.png').getDownloadURL().then(function(url) {
                    newMask.onload = function(){
                        ctx_tmp = tmpMaskCanvas.getContext('2d');
                        ctx_tmp.drawImage(newMask, 0, 0);
                    }
                    newMask.src = url + '?' + new Date().getTime();
                    newMask.setAttribute('crossOrigin', '');
                }).then(function(){
                    ctx_tmp = tmpMaskCanvas.getContext('2d');
                    var newMaskData = ctx_tmp.getImageData(0, 0, tmpMaskCanvas.width, tmpMaskCanvas.height);
                    var newData = newMaskData.data;
                    console.log(newData);

                    ctx = maskCanvas.getContext('2d');
                    var oldMaskData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
                    var oldData = oldMaskData.data;
                    console.log(oldData);

                    for (var i = 0; i <= oldData.length; i+= 4){
                        if (newData[i] == 255 && newData[i + 1] == 255 && newData[i + 2] == 255){
                            oldData[i] = 255;
                            oldData[i + 1] = 255;
                            oldData[i + 2] = 255;
                            //console.log(i);
                        } else if (oldData[i] == 255 && oldData[i + 1] == 255 && oldData[i + 2] == 255){
                            oldData[i] = 255;
                            oldData[i + 1] = 255;
                            oldData[i + 2] = 255;
                            //console.log(i);
                        } else {
                            oldData[i] = 0;
                            oldData[i + 1] = 0;
                            oldData[i + 2] = 0;
                        }
                    }
                    ctx.putImageData(oldMaskData, 0, 0);            
                })
            }) , 1000);
            
/*
            eel.overlapMask(timestamp, true, event.offsetX, event.offsetY);
            alert("Please wait for few seconds to load mask.")
        
            var timeoutID = window.setTimeout(( () => {
                var newMask = new Image();
                //newMask.crossOrigin = 'Anonymous';
                StorageRef.child(timestamp + "/images/masks/currentMask.png").getDownloadURL().then(function(url) {
                    newMask.onload = function(){
                        ctx = maskCanvas.getContext('2d');
                        ctx.drawImage(newMask, 0, 0);
                    }
                    newMask.src = url + '?' + new Date().getTime();
                    newMask.setAttribute('crossOrigin', '');
                    //newMask.src = url;
                    maskCanvas.style.opacity = 0.5;
                })

                paint = false;
            } ), 1000);*/
        }
    }
}

function sketch(event){
    var editCheckBox = document.getElementById("editing");

    if (!paint || editCheckBox.checked != true) return;
    if(mode == "brush"){
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);  
    } else if(mode == "eraser"){
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);  
    }
}

function hold_pic(){
    var img;
    img = undoArray.pop();
    ctx.putImageData(img, 0, 0);
    undoArray.push(img);
}

function stopInput(event){
    paint = false;    
}

function handleImage(event){
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
          ctx.drawImage(img,0,0);
      }
      img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);     
}