var ismenushowing=false;
var ismousedown=false;
var xpos=0,ypos=0;
var xposmove=0,yposmove=0;
var Documents=[];
var documentsccount=0;
var currentdocument=0;
var isspacebardown=false;
var isctrldown=false;
var isdialogshowing=false;
var imagexpos=0,imageypos=0;
var isdocumentsaved=[];
var tempdocument;
var currenttool="tmove";
var currentlayer;
//var tmpcanvass=document.createElement("<canvass id='tmpcanvas'></canvass>");
initialise();
function initialise(){
    defaultcolor();
    activatetool(currenttool);
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
        var y=event.clientY-ypos;
        if(y<0)y=0;
        document.getElementById(dialogbox).style.top=y+"px";
        document.getElementById(dialogbox).style.left=event.clientX-xpos+"px";
    }
}

function canvasmousedown(event,object){
    imagexpos=event.layerX;
    currentlayer=object;
    xposmove=event.screenX-document.getElementById(object).offsetLeft;
    yposmove=event.screenY-document.getElementById(object).offsetTop;
    imageypos=event.layerY;//-document.getElementById(object).offsetTop;
    ismousedown=true;
    console.log(event);
    }
function canvasmousemove(event,object){
    if(ismousedown){
            //from canvass
            // onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tmpstring+")"+String.fromCharCode(34)+"
            isdocumentsaved[currentdocument]=false;
            //var y=event.clientY-imageypos;
            //console.log(event.screenY+"-"+imageypos+":"+event.screenX+"-"+imagexpos)
            //moving objects
            //document.getElementById(object).style.top=event.screenY-imageypos+"px";
            //document.getElementById(object).style.left=event.screenX-imagexpos+"px";
            //drawing objects
            const ctx = document.getElementById(object).getContext("2d");
            ctx.clearRect(0,0,500,500);
            ctx.fillStyle = document.getElementById("colorf").style.backgroundColor;
            ctx.fillRect(imagexpos, imageypos, event.layerX-imagexpos, event.layerY-imageypos);
            //console.log(event.screenX+":"+event.screenY+"="+imagexpos+":"+document.getElementById(object).offsetTop);
            //console.log(event);
    }
}
function pagemousedown(event,object){
    xpos=event.screenX-document.getElementById(object).style.left.slice(0,document.getElementById(object).style.left.length-2);
    ypos=event.screenY-document.getElementById(object).style.top.slice(0,document.getElementById(object).style.top.length-2);
    ismousedown=true;
}
function pagemousemove(event,canvas){
    var object="doc"+currentdocument;
    //console.log(object+":x="+event.layerX+":y="+event.layerY);
    if(ismousedown){
        if(isspacebardown){
            var y=event.screenY-ypos;
            var x=event.screenX-xpos;
            if(!ismenushowing){
                document.getElementById(object).style.cursor="none";
            }
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
        else{
            //from canvass
            canvas=currentlayer;
            isdocumentsaved[currentdocument]=false;
            //var y=event.clientY-imageypos;
            //console.log(event.screenY+"-"+imageypos+":"+event.screenX+"-"+imagexpos)
            //moving objects
            if(currenttool==="tmove"){
            document.getElementById(canvas).style.top=event.screenY-yposmove+"px";
            document.getElementById(canvas).style.left=event.screenX-xposmove+"px";
            }else if(currenttool==="tshape"){
            //drawing objects
            const ctx = document.getElementById(canvas).getContext("2d");
            ctx.clearRect(0,0,500,500);
            ctx.fillStyle = document.getElementById("colorf").style.backgroundColor;
            ctx.fillRect(imagexpos, imageypos, event.layerX-imagexpos, event.layerY-imageypos);
            }
            //console.log(event.screenX+":"+event.screenY+"="+imagexpos+":"+document.getElementById(object).offsetTop);
            //console.log(event);
        }
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

function createdocument(){
    hidedialog('new');
    var height=width=500;
    var tmpstring=documentsccount;
    document.getElementById("projecttitle").innerHTML=document.getElementById("projecttitle").innerHTML+"<div id='title"+documentsccount+"' class='documenttitle' onclick='showdocument("+tmpstring+")'><div style='overflow:hidden;text-wrap:nowrap;'>&nbsp;New Project</div><div class='closebtn' style='padding-left: 20px;'><a onclick='checksaved("+tmpstring+")'>X</a></div></div>";
    tmpstring="'"+"D"+documentsccount+"1"+"'";
    document.getElementById("projects").innerHTML=document.getElementById("projects").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='width:500px;height:500px;' onmousedown="+String.fromCharCode(34)+"pagemousedown(event,'doc"+documentsccount+"')"+String.fromCharCode(34)+" onmouseup='mouseup()'><canvas class='canvass' id='D"+documentsccount+"1' height='"+height+"' width='"+width+"' onmousedown="+String.fromCharCode(34)+"canvasmousedown(event,"+tmpstring+")"+String.fromCharCode(34)+" onmouseup='mouseup()'></canvas></div>";
    Documents.push(1);
    currentlayer="D"+documentsccount+"1";
    isdocumentsaved.push(false);
    currentdocument=documentsccount;
    documentsccount+=1;
    hidedialog("new");
    showdocument(currentdocument);
}
function keydown(event){
    if(event.key===" "){
        isspacebardown=true;
        if(!ismenushowing && !isdialogshowing){
            document.getElementById("doc"+currentdocument).style.cursor="grab";
        }
    }
    if(event.key==="x"){defaultcolor();}
    if(event.ctrlKey){isctrldown=true;}
}
function keyup(){
    document.getElementById("doc"+currentdocument).style.cursor="default";
    isspacebardown=false;
    isctrldown=false;
}
function save(){
    hidemenu();
    isdocumentsaved[currentdocument]=true;
    //console.log(window.location.href);
    var imagefile=document.getElementById("D11").toDataURL('image/jpeg');
    document.getElementById("tooloptions").style.backgroundImage="url('"+imagefile+"')";
    //console.log(atob(imagefile.slice(22,imagefile.length)));
    saveAs(imagefile,"download.jpg");
}

function closedocument(){
    document.getElementById("closingdocument").classList.add("hide");
    if(tempdocument===currentdocument){
        document.getElementById("title"+currentdocument).remove();
        document.getElementById("doc"+currentdocument).remove();
        Documents[currentdocument]=0;
        for(var a=0;a<Documents.length;a++){
            if(Documents[a]>0){
                currentdocument=a;
                showdocument(a);
                break;
            }
        }
    }else{
        document.getElementById("title"+tempdocument).remove();
        document.getElementById("doc"+tempdocument).remove();
        Documents[tempdocument]=0;
    }
}

function checksaved(doc){
    if(isdocumentsaved[doc]){
        tempdocument=doc;
        closedocument();
    }else{
        tempdocument=doc;
        document.getElementById("closingdocument").classList.remove("hide");
    }
}

function showdocument(doc){
    currentdocument=doc;
    for(var a=0;a<Documents.length;a++){
        if(Documents[a]>0){
            document.getElementById("title"+a).classList.remove("titleborder");
            document.getElementById("doc"+a).classList.add("hide");
        }
    }

    //console.log(doc);
    //console.log(document.getElementById("doc"+doc));
    document.getElementById("title"+doc).classList.add("titleborder");
    document.getElementById("doc"+doc).classList.remove("hide");
}
function setcolor(){
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
}
function opencolorbox1(){
    //document.title=document.getElementById("colorf").style.backgroundColor;
    //document.getElementById("forecolor").value=document.getElementById("colorf").style.backgroundColor;
    document.getElementById("forecolor").click();
}
function opencolorbox2(){
    //document.title=document.getElementById("colorb").style.backgroundColor;
    //document.getElementById("backcolor").color=document.getElementById("colorb").style.backgroundColor;
    document.getElementById("backcolor").click();
}
function defaultcolor(){
    document.getElementById("backcolor").value="#000000";
    document.getElementById("forecolor").value="#ffffff";
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
}
function activatetool(name){
    currenttool=name;
    if(name==="tmove"){
        document.getElementById("tshape").classList.remove("activetool");
        document.getElementById("ttext").classList.remove("activetool");
        document.getElementById("tmove").classList.add("activetool");
    }else if(name==="tshape"){
        document.getElementById("tmove").classList.remove("activetool");
        document.getElementById("ttext").classList.remove("activetool");
        document.getElementById("tshape").classList.add("activetool");
    }else if(name==="ttext"){
        document.getElementById("tshape").classList.remove("activetool");
        document.getElementById("tmove").classList.remove("activetool");
        document.getElementById("ttext").classList.add("activetool");
    }
}
function selectlayer(layer){
    if(isctrldown){
        if(document.getElementById("layer"+layer).classList.contains("activelayer")){
            document.getElementById("layer"+layer).classList.remove("activelayer");
        }else document.getElementById("layer"+layer).classList.add("activelayer");
    }else document.getElementById("layer"+layer).classList.add("activelayer");
}