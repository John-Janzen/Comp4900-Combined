var toolFlag = false;
var wandFlag = false;
var colorElimFlag = false;
var leftPercent = 0.5;
var rightPercent = 0.5;
var dragOrclick = true;
var draggedElement;
var ElementsFull = [false, false, false, false, false];
$(document).ready(function() {
	var item = 0;
	var item2 = 0;
	// this is the mouse position within the drag element
	var startOffsetX, startOffsetY;
	
	$("#leftButton").click(function() {
		if (item == 0) {
			item2 = 1; item = 2;
			rightPercent = 0.8; leftPercent = 0.2;
		} else if (item == 1) {
			item2 = 0; item = 0;
			rightPercent = 0.5; leftPercent = 0.5;
		}
		dragOrclick = false;
		$(window).trigger('resize');
	});
	$("#rightButton").click(function() {
		if (item2 == 0) {
			item = 1;item2 = 2;
			rightPercent = 0.2; leftPercent = 0.8;
		} else if (item2 == 1) {
			item = 0; item2 = 0;
			rightPercent = 0.5; leftPercent = 0.5;
		}
		dragOrclick = false;
		$(window).trigger('resize');
	});
	$("#toolButton").click(function() {
		toolFlag = true;
		$(this).fadeOut();
		$("#content").stop().animate({paddingLeft: 60},
			{step: function() {
				$(window).trigger('resize');
			}
		})
		.promise().done(function() {
			$("#toolBar").slideDown();
		});
	});
	$("#hideToolButton").click(function() {
		toolFlag = false;
		$("#toolBar").slideUp( function() {
			$("#toolButton").fadeIn();
			$("#content").stop().animate({paddingLeft: 0},
				{step: function() {
					$(window).trigger('resize');
				}
			});
		});
		
	});
	$("#Element1, #Element2, #Element3, #Element4, #Element5").hover(function() {
			$(this.id).css({borderColor:"#0000ff"});
		}, function() {
			$(this.id).css({borderColor:"#000000"});
	});
	
	$("#Element1").click(function() {
		if (ElementsFull[0]) {
			var scaleSize = 3;
			$('#uploadedImage').imgAreaSelect({remove:true});
			$("#previewCanvas").attr("draggable", "false");
			var OrigCanvas = document.getElementById($(this).children()[0].id);
			var canvas = document.getElementById("ElementCanvas");
			var ctx = canvas.getContext('2d');
			var pos = $(this).offset();
			var width = $("#" + OrigCanvas.id).width();
			var height = $("#" + OrigCanvas.id).height();
			$("#ElementCanvas").css({"width":width * scaleSize,
							"height":height * scaleSize});
			$("#ElementDisplay").animate({
						width: (width + 10) * scaleSize,
						height: (height + 30) * scaleSize,
						left: pos.left, 
						top: pos.top,
						}).show();
			ctx.drawImage(OrigCanvas, 0, 0, canvas.width, canvas.height);
		}
	});
	
	$("#tool1").click(function() {
		wandFlag = false;
		colorElimFlag = false;
		$('#uploadedImage').imgAreaSelect({onSelectChange: preview });
		$("#previewCanvas").attr("draggable", "true");
		$('#cropOut').css({display: 'none'});
		$('#thresSlider').css({display: 'none'});
	});
	$("#tool2").click(function() {
		wandFlag = true;
		colorElimFlag = false;
		$('#uploadedImage').imgAreaSelect({remove:true});
		$("#previewCanvas").attr("draggable", "false");
		$('#cropOut').css({display: ''});
		$('#thresSlider').css({display: ''});
	});
	$("#cropOut").click(function() {
		cropOut();
	});
	$("#tool3").click(function() {
		wandFlag = false;
		colorElimFlag = true;
		$('#uploadedImage').imgAreaSelect({remove:true});
		$("#previewCanvas").attr("draggable", "false");
		$('#cropOut').css({display: ''});
		$('#thresSlider').css({display: ''});
	});
	$(".dragSource").each(function() {
		this.onmousedown = mousedown;
		this.ondragstart = dragstart;
	});
	  
	$(".dragDest").each(function() {
		this.ondrop = drop;
		this.ondragover = allowDrop;
	});

	//draw selection on a canvas
	function preview(img2, selection) {
		var canvas = $('#previewCanvas')[0];
		var selectionSource = $('#uploadedImage')[0];
		var ctx = canvas.getContext("2d");  
		var maxSize = 200;
		var destX = 0;
		var destY = 0;
		var longestSide = Math.max(selection.width, selection.height);
		var scale = maxSize / longestSide;
		canvas.width =  selection.width * scale;
		canvas.height =  selection.height * scale;
		ctx.drawImage(img2,
				selection.x1 / (img2.offsetWidth / img.width),
				selection.y1 / (img2.offsetHeight / img.height),
				selection.width / (img2.offsetWidth / img.width),
				selection.height / (img2.offsetHeight / img.height),
				destX,
				destY, 
				selection.width * scale,
				selection.height * scale
				);               
	}
	
	$("#imgInp").change(function(){ readURL(this); });
});

$(window).resize(function() {
	var Size = parseFloat($("#content").width());
	if (dragOrclick) {
		$("#rightSection").stop().css({width:(Size * rightPercent) - 50.5});
		$("#leftSection").stop().css({width:(Size * leftPercent) - 50});
	} else {
		$("#rightSection").stop().animate({width:(Size * rightPercent) - 50.5});
		$("#leftSection").stop().animate({width:(Size * leftPercent) - 50});
		dragOrclick = true;
	}
});
/*
    Onload function for the window. initializes the globals and listeners
    for the magic wand select.
*/
window.onload = function() {
    blurRadius = 5;
    simplifyTolerant = 0;
    simplifyCount = 30;
    hatchLength = 4;
    hatchOffset = 0;

    imageInfo = null;
    cacheInd = null;
    mask = null;
    downPoint = null;
    img = null;
    allowDraw = false;

    slider = document.getElementById("thresSlider");

    slider.addEventListener("change", function() {
    	currentThreshold = slider.value;
    	//showThreshold();
    })
    colorThreshold = slider.value = 50;
    currentThreshold = colorThreshold;
    //showThreshold();
    setInterval(function () { hatchTick(); }, 300);
}
// Onclick event for the window. allows user to deselect when clicking off the canvas
window.onclick = function(e) {
	if(e.target.id != "uploadedImage") {
		mask = null;
		var ctx = document.getElementById("uploadedImage").getContext('2d');
		if(imageInfo != null) {
			ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
			ctx.putImageData(imageInfo.data, 0, 0);
		}
	}
};

function setToBlack() {
	$("#Element1").css({borderColor:"#000000"});
	$("#Element2").css({borderColor:"#000000"});
	$("#Element3").css({borderColor:"#000000"});
	$("#Element4").css({borderColor:"#000000"});
	$("#Element5").css({borderColor:"#000000"});
}

//uploading image function
function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			$('#uploadedImage').attr('src', e.target.result);
		}           
		reader.readAsDataURL(input.files[0]);          
	}
}

function allowDrop(ev) {
	ev.preventDefault();
}

function mousedown(ev) {
	startOffsetX = ev.offsetX;
	startOffsetY = ev.offsetY;
}

function dragstart(ev) {

	ev.dataTransfer.setData("Text", ev.target.id);
	draggedElement = ev.target;
}

function drop(ev) {
	ev.preventDefault();
	  
	var canvas = ev.target;
	if (canvas.id == "pic1") {
		ElementsFull[0] = true;
	}
	drawCopiedImage(canvas, ev); 
	//loops through multipaste elements and draws image on all of them
	var multiPasteClasses = ["multiPaste1", "multiPaste2"];
	for (var i = 0; i < multiPasteClasses.length; i++) {
	   
		if($(canvas).hasClass(multiPasteClasses[i])){
			$("." + multiPasteClasses[i]).each(function() {
				drawCopiedImage(this, ev);
			});
		}  
	}
}
//draws copied image on the canvas
function drawCopiedImage(canvas, ev){
	var ctx = canvas.getContext("2d");
	ctx.drawImage(draggedElement, 0, 0, canvas.width, canvas.height);
}
// loads the image and draws it on the canvas.
function imgChange (inp) {
    if (inp.files && inp.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //var img = document.getElementById("test-picture");
            //img.setAttribute('src', e.target.result);
            var ctx = document.getElementById("uploadedImage").getContext('2d');
            img = new Image;
            img.src = URL.createObjectURL(inp.files[0]);
            //console.log(img);
            img.onload = function() {
                window.initCanvas(img);
                ctx.drawImage(img, 0, 0);
            };
        }
        reader.readAsDataURL(inp.files[0]);
    }
};
// Initializes the canvas and image info
function initCanvas(img) {
    var cvs = document.getElementById("uploadedImage");
    cvs.width = img.width;
    cvs.height = img.height;
    //console.log(img);
    imageInfo = {
        width: img.width,
        height: img.height,
        context: cvs.getContext("2d")
    };
    mask = null;
    
    var tempCtx = document.createElement("canvas").getContext("2d");
    tempCtx.canvas.width = imageInfo.width;
    tempCtx.canvas.height = imageInfo.height;
    tempCtx.drawImage(img, 0, 0);
    imageInfo.data = tempCtx.getImageData(0, 0, imageInfo.width, imageInfo.height);
};
// Gets the position of the mouse on the canvas, and adjusts its scale.
function getMousePosition(e) { // NOTE*: These may need tweeking to work properly

    var p = $(e.target).offset(),
    	widthScale = document.getElementById('uploadedImage').offsetWidth / img.width,
    	heightScale = document.getElementById('uploadedImage').offsetHeight / img.height,
        x = Math.round(((e.clientX || e.pageX) - p.left) / widthScale),
        y = Math.round(((e.pageY) - p.top) / heightScale);
        //console.log(x, y);
        //console.log(e.pageY);
    return { x: x, y: y };
};
function onMouseDown(e) {
	//console.log('Test');
	if(wandFlag || colorElimFlag) {
	    if (e.button == 0) {
	        allowDraw = true;
	        downPoint = getMousePosition(e);
	        drawMask(downPoint.x, downPoint.y);
	        //console.log(mask);
	        //console.log(mask.data.length);
	    }
	    else allowDraw = false;
	}
};
function onMouseMove(e) {
    if (allowDraw) {
        var p = getMousePosition(e);
        if (p.x != downPoint.x || p.y != downPoint.y) {
            var dx = p.x - downPoint.x,
                dy = p.y - downPoint.y,
                len = Math.sqrt(dx * dx + dy * dy),
                adx = Math.abs(dx),
                ady = Math.abs(dy),
                sign = adx > ady ? dx / adx : dy / ady;
            sign = sign < 0 ? sign / 5 : sign / 3;
            //var thres = Math.min(Math.max(colorThreshold + Math.floor(sign * len), 1), 255);
            //var thres = Math.min(colorThreshold + Math.floor(len / 3), 255);
        }
    }
};
function onMouseUp(e) {
    allowDraw = false;
    //currentThreshold = colorThreshold;
};
function drawMask(x, y) {
    if (!imageInfo) return;
    
   // showThreshold();
    
    var image = {
        data: imageInfo.data.data,
        width: imageInfo.width,
        height: imageInfo.height,
        bytes: 4
    };
    if(wandFlag) {
    	mask = MagicWand.floodFill(image, x, y, currentThreshold);
	} else if(colorElimFlag) {
    	mask = colorElimination(image, x, y, currentThreshold);
	}
    mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius);
    drawBorder();
};
function hatchTick() {
    hatchOffset = (hatchOffset + 1) % (hatchLength * 2);
    drawBorder(true);
};
function drawBorder(noBorder) {
    if (!mask) return;
    
    var x,y,i,j,
        w = imageInfo.width,
        h = imageInfo.height,
        ctx = imageInfo.context,
        imgData = ctx.createImageData(w, h);
    imgData.data.set(new Uint8ClampedArray(imageInfo.data.data));
    var res = imgData.data;
    
    if (!noBorder) cacheInd = MagicWand.getBorderIndices(mask);
    
    ctx.clearRect(0, 0, w, h);
    //ctx.drawImage(img, 0, 0);
    var len = cacheInd.length;
    for (j = 0; j < len; j++) {
        i = cacheInd[j];
        x = i % w; // calc x by index
        y = (i - x) / w; // calc y by index
        k = (y * w + x) * 4; 
        if ((x + y + hatchOffset) % (hatchLength * 2) < hatchLength) { // detect hatch color 
            res[k + 3] = 255; // black, change only alpha
        } else {
            res[k] = 255; // white
            res[k + 1] = 255;
            res[k + 2] = 255;
            res[k + 3] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);
};
function cropOut() {
	if(mask == null) return;
	
	for(i = 0; i < mask.data.length; i++) {
		if(mask.data[i] != 0) {
			var tmp = i * 4;
			imageInfo.data.data[tmp] = 0;
			imageInfo.data.data[tmp + 1] = 0;
			imageInfo.data.data[tmp + 2] = 0;
			imageInfo.data.data[tmp + 3] = 0;
		}
	}
	mask = null;
	var ctx = document.getElementById("uploadedImage").getContext('2d');
	ctx.clearRect(0, 0, imageInfo.width, imageInfo.height);
	ctx.putImageData(imageInfo.data, 0, 0);
};

function colorElimination(image, x, y, threshold)
{
    // used for testing purposes
    /*for(var i = 0, value = 1, size = image.width*image.height,
         array = new Uint8Array(size); i < size; i++) array[i] = value;*/
    var tmp, f, ipix = (y * image.width * 4) + x * 4,
        pixel = [image.data[ipix], image.data[ipix+1], image.data[ipix+2], image.data[ipix+3]],
        b = image.bytes;
    //console.log(x);
    ///console.log(y);
    //console.log(ipix);
    //console.log(pixel);
    //console.log(image.data.length);
    //console.log(4 * image.width * image.height);
    for(var i = 0, size = image.width*image.height,
        array = new Uint8Array(size); i < size; i++) {
        
        //ipix = (y * i) + b;
        tmp = image.data[i*4] - pixel[0];
        //console.log(image.data[i*4]);
        //console.log(pixel[0]);
        //console.log(tmp);
        if(tmp > threshold || tmp < -threshold) continue;
        tmp = image.data[(i*4)+1] - pixel[1];
        //console.log(image.data[(i*4)+1]);
        //console.log(pixel[1]);
        //console.log(tmp);
        if(tmp > threshold || tmp < -threshold) continue;
        tmp = image.data[(i*4)+2] - pixel[2];
        //console.log(image.data[(i*4)+2]);
        //console.log(pixel[2]);
        //console.log(tmp);
        if(tmp > threshold || tmp < -threshold) continue;

        array[i] = 1;
    }
    //console.log('Done');
    return {data: array, width:image.width,height:image.height,bounds:{minX:0,minY:0,maxX:image.width,maxY:image.height}};
};