var ismenushowing=false;
var ismousedown=false;
var xpos=0,ypos=0;
var documents=[];
var documentsccount=0;
var currentdocument;
var isspacebardown=false;
var isdialogshowing=false;
var imagexpos=0,imageypos=0;
initialise();
draw();
function initialise(){
    var height=document.getElementById("menulist").offsetHeight+document.getElementById("tooloptions").offsetHeight;
    var height=document.querySelector("body").offsetHeight-height;
    document.getElementById("tools").style.height=height+"px";
    document.addEventListener("keydown",function(event){keydown(event);});
    document.addEventListener("keyup",function(){keyup();});
    document.addEventListener("mouseup",function(){ismousedown=false;})
}
function menushow(menu){
    ismenushowing=true;
    document.getElementById(menu).classList.remove("hide");
}
function hidemenu(){
    if(ismenushowing){
    document.getElementById("file").classList.add("hide");
    ismenushowing=false;
    }
}
function showdialog(dialog){
    hidemenu();
    isdialogshowing=true;
    document.getElementById(dialog).classList.remove("hide");
}
function hidedialog(dialog){
    isdialogshowing=false;
    document.getElementById(dialog).classList.add("hide");
}
function mousedown(event){
xpos=event.layerX;
ypos=event.layerY;
ismousedown=true;
}
function mouseup(){
ismousedown=false;
}
function mousemove(event,dialogbox){
    if(ismousedown){
        if(!ismenushowing && isspacebardown){
            document.getElementById("doc1").style.cursor="none";
        }
        var y=event.clientY-ypos;
        if(y<0)y=0;
        document.getElementById(dialogbox).style.top=y+"px";
        document.getElementById(dialogbox).style.left=event.clientX-xpos+"px";
    }
}

function canvasmousedown(event,object){
    imagexpos=event.screenX-document.getElementById(object).style.left.slice(0,document.getElementById(object).style.left.length-2);
    imageypos=event.screenY-document.getElementById(object).style.top.slice(0,document.getElementById(object).style.top.length-2);
    //console.log(event.screenX+":"+event.screenY+"="+imagexpos+":"+imageypos);
    ismousedown=true;
    }
function canvasmousemove(event,object){
    if(ismousedown){
        //var y=event.clientY-imageypos;
        console.log(event.screenY+"-"+imageypos+":"+event.screenX+"-"+imagexpos)
        document.getElementById(object).style.top=event.screenY-imageypos+"px";
        document.getElementById(object).style.left=event.screenX-imagexpos+"px";
    }
}
function pagemousedown(event,object){
    xpos=event.screenX-document.getElementById(object).style.left.slice(0,document.getElementById(object).style.left.length-2);
    ypos=event.screenY-document.getElementById(object).style.top.slice(0,document.getElementById(object).style.top.length-2);
    ismousedown=true;
}
function pagemousemove(event,object){
    //console.log(object+":x="+event.layerX+":y="+event.layerY);
    if(ismousedown && isspacebardown){
        var y=event.screenY-ypos;
        var x=event.screenX-xpos;
        //if project window goes off bound retain 10% of its height/width within working space area **if it goes negative
        if(x<(-document.getElementById(object).offsetWidth+(document.getElementById(object).offsetWidth*10/100))) x=-document.getElementById(object).offsetWidth+document.getElementById(object).offsetWidth*10/100;
        if(y<(-document.getElementById(object).offsetHeight+(document.getElementById(object).offsetHeight*10/100))) y=-document.getElementById(object).offsetHeight+document.getElementById(object).offsetHeight*10/100;
        //**if it goes positive
        //if(x>(document.getElementById(object).offsetWidth+(document.getElementById(object).offsetWidth*90/100))) x=document.getElementById(object).offsetWidth+document.getElementById(object).offsetWidth*90/100;
        //if(y>(document.getElementById(object).offsetHeight+(document.getElementById(object).offsetHeight*90/100))) y=document.getElementById(object).offsetHeight+document.getElementById(object).offsetHeight*90/100;
        
        //console.log("xpos:"+x+"ypos:"+y+":"+document.getElementById(object).offsetHeight+":"+document.getElementById(object).offsetWidth);
        document.getElementById(object).style.top=y+"px";
        document.getElementById(object).style.left=x+"px";
    }
}
function swapheightwidth(){
    var a=document.getElementById("newheight").value;
    document.getElementById("newheight").value=document.getElementById("newwidth").value;
    document.getElementById("newwidth").value=a;
}
function validatenumber(element){
    if(!(document.getElementById(element).value*1)>=1) document.getElementById(element).value=1;
}

function draw(){
const canvas = document.getElementById("D11");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "red";
ctx.fillRect(10, 10, 100, 50);

}
function draw2(){
    
const canvas = document.getElementById("D12");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "blue";
ctx.fillRect(10, 10, 40, 50);

}
function createdocument(){
    document.getElementById("workspace").innerHTML=document.getElementById("workspace").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='width:500px;height:500px;'><canvas class='canvass' id='D1' height='100' width='100' ></canvas><canvas class='canvass' id='D2'></canvas></div>"
    documents.push(documentsccount)
    documentsccount+=1;
    hidedialog("new");
}
function keydown(event){
    console.log(event)
    if(event.key===" "){
        isspacebardown=true;
        if(!ismenushowing && !isdialogshowing){
            document.getElementById("doc1").style.cursor="grab";
        }
    }
}
function keyup(){
    document.getElementById("doc1").style.cursor="default"; 
    isspacebardown=false;
}
function save(){
    hidemenu();
    console.log(window.location.href);
    var imagefile=document.getElementById("D11").toDataURL('image/jpeg');
    document.getElementById("tooloptions").style.backgroundImage="url('"+imagefile+"')";
    //console.log(atob(imagefile.slice(22,imagefile.length)));
    saveAs(imagefile,"download.jpg");
}