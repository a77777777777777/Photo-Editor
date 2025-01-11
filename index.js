var ismenushowing;
var istexttoolboxactive=false;
var ismousedown,islayermousedown,isdialogmousedown;
var xpos,ypos;
var xposmove,yposmove;
var DocumentsLayerCount=[];
var documentsccount;
var actualdoccount;
var currentdocument;
var isspacebardown;
var isctrldown;
var isdialogshowing;
var iscanvasmoved;
var imagexpos,imageypos;
var isdocumentsaved=[];
var currenttool;
var currentlayer;
var cancallpreview=0;
var timerID;
var tempcanvas="",templayer="";
var tmpcanvass=document.getElementById("tmpcanvas");

//document.addEventListener("contextmenu",(e)=>{e.preventDefault();});
timerID=setInterval(() => {
    if(actualdoccount>0 && cancallpreview>0){
        drawpreview();
        if(cancallpreview>0)
            cancallpreview-=1;
    }}, 50);

initialise();
createdocument();
function initialise(){
    ismenushowing=false;
    ismousedown=false;
    xpos=0,ypos=0;
    xposmove=0,yposmove=0;
    DocumentsLayerCount=[];
    documentsccount=0;
    actualdoccount=0;
    currentdocument=-1;
    isspacebardown=false;
    isctrldown=false;
    isdialogshowing=false;
    imagexpos=0,imageypos=0;
    isdocumentsaved=[];
    currenttool="tmove";
    defaultcolor();
    activatetool(currenttool);
    document.addEventListener("keydown",function(event){keydown(event);});
    document.addEventListener("keyup",function(){keyup();});
    document.addEventListener("mouseup",function(){
        ismousedown=false; isdialogmousedown=false; islayermousedown=false; tempcanvas="";templayer=""; cancallpreview=3;
    });
    document.addEventListener("mousemove",function(event){mousemovenew(event);})

    window.onclick = function(event) {
        drawpreview();
        if (!event.target.matches('.dropmenu')) {
          var dropdowns = document.getElementsByClassName("menuitems-hide");
          var i;
          for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (!openDropdown.classList.contains('hide')) {
              openDropdown.classList.add('hide');
              ismenushowing=false;
            }
          }
        }
        console.log(event.target)
        if(currenttool==="tdrop" && !(event.target.matches('.tls1')||event.target.matches('.tlsimg'))){
        deactivatetools();
        currenttool="tmove";
        document.getElementById("tmove").classList.add("activetool");
        }
    }
}
function mousemovenew(event){
    if(ismousedown && !isspacebardown){
            //from canvass
            isdocumentsaved[currentdocument]=false;
            //var y=event.clientY-imageypos;
            
            //moving objects
        if(currenttool==="tmove"){
            iscanvasmoved=true;
            layers=selectedlayers();
            if(layers[layers.length-1]==="allselected") layers.pop();
            if(layers.length===1){
            document.getElementById(currentlayer).style.top=event.screenY-yposmove+"px";
            document.getElementById(currentlayer).style.left=event.screenX-xposmove+"px";
            }else{
                for(var a=0;a<layers.length;a++){
                    document.getElementById("D"+layers[a]).style.top=event.screenY-yposmove+"px";
                    document.getElementById("D"+layers[a]).style.left=event.screenX-xposmove+"px";
                }
            }
            //drawpreview();
        }else if(currenttool==="tshape" && !ismultilayerselected()){
            //drawing objects
            const ctx = document.getElementById(currentlayer).getContext("2d");
            ctx.clearRect(0,0,500,500);
            ctx.fillStyle = document.getElementById("colorf").style.backgroundColor;
            ctx.fillRect(imagexpos, imageypos, event.layerX-imagexpos, event.layerY-imageypos);
            //drawpreview();
        }
            //console.log(event.screenX+":"+event.screenY+"="+imagexpos+":"+document.getElementById(object).offsetTop);
    }else{
            if(currenttool==="tdrop"){
                if(document.getElementById("cursor").classList.contains("hide")) document.getElementById("cursor").classList.remove("hide");
                document.getElementById("cursor").style.top=event.pageY-document.getElementById("cursor").offsetHeight+"px";
                document.getElementById("cursor").style.left=event.pageX+"px";
                if(event.target.matches(".canvass")){
                }
            }
    }
}
function menushow(menu){
    ismenushowing=true;
    document.getElementById(menu).classList.remove("hide");
}
function showdialog(dialog){
    isdialogshowing=true;
    if(dialog==="saveas"){
        if(window.innerHeight>window.innerWidth){
            document.getElementById("saveasdialog").style.width="90vw";
            document.getElementById("saveasdialog").style.height="90vw";
            var int=document.getElementById("doc"+currentdocument).offsetHeight/document.getElementById("doc"+currentdocument).offsetWidth;
            //stretch background image to max height & width
            //document.getElementById("savejpg").style.backgroundSize=document.getElementById("doc"+currentdocument).offsetHeight+"px "+document.getElementById("doc"+currentdocument).offsetHeight+"px";
            if(int===1){
                document.getElementById("savejpg").style.height=window.innerWidth*44/100+"px";
                document.getElementById("savejpg").style.width=window.innerWidth*44/100+"px";
            }else if(int>1){
                document.getElementById("savejpg").style.width=window.innerWidth*44/100+"px";
                document.getElementById("savejpg").style.height=document.getElementById("savejpg").offsetWidth*int+"px";
            }else{
                document.getElementById("savejpg").style.width=window.innerWidth*44/100+"px";
                document.getElementById("savejpg").style.height=document.getElementById("savejpg").offsetWidth*int+"px";
            }
        }else{
            //stretch background image to max height & width
            //document.getElementById("savejpg").style.backgroundSize=document.getElementById("doc"+currentdocument).offsetHeight+"px "+document.getElementById("doc"+currentdocument).offsetHeight+"px";
            document.getElementById("saveasdialog").style.width="90vh";
            document.getElementById("saveasdialog").style.width="80vh";
            var int=document.getElementById("doc"+currentdocument).offsetHeight/document.getElementById("doc"+currentdocument).offsetWidth;
            if(int===1){
                document.getElementById("savejpg").style.height=window.innerHeight*44/100+"px";
                document.getElementById("savejpg").style.width=window.innerHeight*44/100+"px";
            }else if(int>1){
                document.getElementById("savejpg").style.width=window.innerHeight*44/100+"px";
                document.getElementById("savejpg").style.height=document.getElementById("savejpg").offsetWidth*int+"px";
            }else{
                document.getElementById("savejpg").style.width=window.innerHeight*44/100+"px";
                document.getElementById("savejpg").style.height=document.getElementById("savejpg").offsetWidth*int+"px";
            }
        }
        previewjpg();
    }
    document.getElementById(dialog).classList.remove("hide");
}
function hidedialog(dialog){
    isdialogshowing=false;
    document.getElementById(dialog).classList.add("hide");
}
function mousedown(event){
xpos=event.layerX;
ypos=event.layerY;
isdialogmousedown=true;
}
function mousemove(event,dialogbox){
    if(isdialogmousedown){
        var y=event.clientY-ypos;
        if(y<0)y=0;
        document.getElementById(dialogbox).style.top=y+"px";
        document.getElementById(dialogbox).style.left=event.clientX-xpos+"px";
    }
}
function canvasmousedown(event,object){
    if(currenttool==="tmove"){settempcanvas(object); iscanvasmoved=false;}
    imagexpos=event.layerX;
    xposmove=event.screenX-document.getElementById(object).offsetLeft;
    yposmove=event.screenY-document.getElementById(object).offsetTop;
    imageypos=event.layerY;//-document.getElementById(object).offsetTop;
    ismousedown=true;
}
function canvasmouseup(event,object){
    if(currenttool==="tmove" && !iscanvasmoved){
        if(isctrldown){
            if(!document.getElementById("layer"+object.slice(1,object.length)).classList.contains("activelayer")){
            currentlayer=object;
            selectlayer(object.slice(1,object.length));
            }else if(ismultilayerselected()){
                document.getElementById("layer"+object.slice(1,object.length)).classList.remove("activelayer");
            }
        }else {selectlayer(object.slice(1,object.length)); currentlayer=object;}
    }
}
function canvasmousemove(event,object){
    var layer=object.slice(1,object.length);
    if(!document.getElementById("layer"+layer).classList.contains("activelayer") && tempcanvas===object && ismousedown){
        currentlayer=object;
        selectlayer(layer);
    }
}
function pagemouseup(){
    if(currenttool==="ttext") document.getElementById("texttool").focus();
}
function pagemousedown(event,object){
    xpos=event.screenX-document.getElementById(object).style.left.slice(0,document.getElementById(object).style.left.length-2);
    ypos=event.screenY-document.getElementById(object).style.top.slice(0,document.getElementById(object).style.top.length-2);
    if(currenttool==="ttext" && document.getElementById("texttooldiv").classList.contains("hide")){
        ismousedown=false;
        istexttoolboxactive=true;
        document.getElementById("texttool").style.color=document.getElementById("forecolor").value;
        document.getElementById("texttool").style.top=event.pageY+"px";
        document.getElementById("texttool").style.left=event.pageX+"px";
        document.getElementById("texttooldiv").classList.remove("hide");
        document.getElementById("drawtextcheckmark").classList.remove("hide");
        changetextfont();
        document.getElementById("texttool").value="";
    }else ismousedown=true;
}
function pagemousemove(event,canvas){
    var object="doc"+currentdocument;
    
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
        
            document.getElementById(object).style.top=y+"px";
            document.getElementById(object).style.left=x+"px";
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
function drawpreview(){
    if(!ismultilayerselected() && !islayerhidden(currentlayer.slice(1,currentlayer.length))){
    const canvas1=document.createElement("canvas");
    canvas1.height=document.getElementById("doc"+currentdocument).offsetHeight;
    canvas1.width=document.getElementById("doc"+currentdocument).offsetWidth;
    const ctx1=canvas1.getContext("2d");
    var tmpcanvas=document.getElementById(currentlayer);
    ctx1.putImageData(tmpcanvas.getContext("2d").getImageData(0,0,tmpcanvas.clientWidth,tmpcanvas.clientHeight),tmpcanvas.offsetLeft,tmpcanvas.offsetTop);

    const img=document.createElement("img");
    img.src=canvas1.toDataURL("image/png");
    
    const canvas2=document.createElement("canvas");
    const ctx2=canvas2.getContext("2d");
    canvas2.height=document.getElementById("preview"+currentlayer.slice(1,currentlayer.length)).offsetHeight;
    canvas2.width=document.getElementById("preview"+currentlayer.slice(1,currentlayer.length)).offsetWidth;
    ctx2.drawImage(img,0,0,canvas1.width,canvas1.height,0,0,canvas2.width,canvas2.height);
    const img1=new Image();
    img1.src=canvas2.toDataURL("image/png");

    document.getElementById("preview"+currentlayer.slice(1,currentlayer.length)).src=img1.src;
    }
}
function previewjpg(){
    const canvas=document.createElement("canvas");
    canvas.height=document.getElementById("doc"+currentdocument).offsetHeight;
    canvas.width=document.getElementById("doc"+currentdocument).offsetWidth;
    //console.log(canvas.height+":"+canvas.width)
    const ctx=canvas.getContext("2d");
    var imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null && !islayerhidden(currentdocument+""+a)){
            var tmpcanvas=document.getElementById("D"+currentdocument+""+a);
            
            ctx.putImageData(tmpcanvas.getContext("2d").getImageData(0,0,tmpcanvas.width,tmpcanvas.height),tmpcanvas.offsetLeft,tmpcanvas.offsetTop);
            const tmpimagedata=ctx.getImageData(0,0,canvas.width,canvas.height);
            for(var m=0;m<imageData.data.length;m+=4){
                if(tmpimagedata.data[m+3]===255 || imageData.data[m+3]===0){
                    imageData.data[m]=tmpimagedata.data[m];
                    imageData.data[m+1]=tmpimagedata.data[m+1];
                    imageData.data[m+2]=tmpimagedata.data[m+2];
                    imageData.data[m+3]=tmpimagedata.data[m+3];
                }else if(tmpimagedata.data[m+3]>0){
                    var tmpint=tmpimagedata.data[m+3]/255;
                    imageData.data[m]+=(tmpimagedata.data[m]-imageData.data[m])*tmpint;
                    imageData.data[m+1]+=(tmpimagedata.data[m+1]-imageData.data[m+1])*tmpint;
                    imageData.data[m+2]+=(tmpimagedata.data[m+2]-imageData.data[m+2])*tmpint;
                }
            }
        }
    }
    ctx.putImageData(imageData,0,0);
    var data=canvas.toDataURL("image/jpeg",document.getElementById("saveasjpgslider").value*1/100);
    document.getElementById("savejpg").src=data;//style.backgroundImage="url('"+data+"')";
    
    canvas.toBlob((blob) =>{
        var size=blob.size/1024;
        if(size>1024){
            size=size/1024;
            var sizestring=Math.floor(size).toString()+".";
            if(size.toString().slice(sizestring.length,sizestring.length+2)==="") sizestring+="0";
            else sizestring+=size.toString().slice(sizestring.length,sizestring.length+2);
            document.getElementById("previewjpgfs").innerText="File Size: "+Math.floor(size/1024)+(size/1024).toString((size/1024).toString().indexOf('.')+1,(size/1024).toString().length)+" MB";
        }
        else {
            var sizestring=Math.floor(size).toString()+".";
            if(size.toString().slice(sizestring.length,sizestring.length+2)==="") sizestring+="0";
            else sizestring+=size.toString().slice(sizestring.length,sizestring.length+2);
            document.getElementById("previewjpgfs").innerText="File Size: "+sizestring+" KB";
        }
    },'image/jpeg',document.getElementById("saveasjpgslider").value*1/100);
    
}
function savejpg(){
    save("jpeg",document.getElementById("saveasjpgslider").value*1/100,document.getElementById("jpgname").value);
    document.getElementById("saveas").classList.add("hide");
}
function showsliderpercent(sliderid){
    document.getElementById(sliderid+"pc").innerText= document.getElementById(sliderid).value+"%";
}
function drawtext(){
    istexttoolboxactive=false;
    var stringarray=[];
    var rows=0,cols=0;
    stringarray.push("");

if(document.getElementById("texttool").value.length>0){
    for(var a=0;a<document.getElementById("texttool").value.length;a++){
        if(document.getElementById("texttool").value.toString().charCodeAt(a)!=10){
            stringarray[rows]+=document.getElementById("texttool").value.toString().charAt(a);
        }else{
            if(cols<stringarray[rows].toString().length) cols=stringarray[rows].toString().length;
            stringarray.push("");
            rows+=1;
        }
    }
    
        if(cols<stringarray[rows].toString().length) cols=stringarray[rows].toString().length;
        newlayer();
        const canvas1=document.getElementById(currentlayer);
        const ctx1=canvas1.getContext("2d");
        document.getElementById(currentlayer).style.left=document.getElementById("texttool").offsetLeft-document.getElementById("doc"+currentdocument).offsetLeft+"px";
        document.getElementById(currentlayer).style.top=document.getElementById("texttool").offsetTop-document.getElementById("doc"+currentdocument).offsetTop+"px";
        document.getElementById(currentlayer).height=(rows+1)*document.getElementById("texttooloptionsfsize").value+rows;
        document.getElementById(currentlayer).width=(cols)*document.getElementById("texttooloptionsfsize").value;
        
        ctx1.font=document.getElementById("texttooloptionsfsize").value+"px "+document.getElementById("texttooloptionsfont").value;
        ctx1.fillStyle=document.getElementById("forecolor").value;
        for(var a=0;a<=rows;a++) ctx1.fillText(stringarray[a],0,document.getElementById("texttooloptionsfsize").value*(a+1)+a);
    }
    document.getElementById("drawtextcheckmark").classList.add("hide");
    document.getElementById("texttooldiv").classList.add("hide");
}
function createdocument(){
    hidedialog('new');
    var height=width=500;
    var top,left;
    top=document.getElementById("projects").offsetHeight/2-height/2;
    left=document.getElementById("projects").offsetWidth/2-width/2;
    var tmpstring=documentsccount;
    document.getElementById("projecttitle").innerHTML=document.getElementById("projecttitle").innerHTML+"<div id='title"+documentsccount+"' class='documenttitle' onclick='showdocument("+tmpstring+")'><div style='overflow:hidden;text-wrap:nowrap;'>&nbsp;New Project</div><div class='closebtn'><a onclick='checksaved("+tmpstring+")'>X</a></div></div>";
    tmpstring="'"+"D"+documentsccount+"1"+"'";
    document.getElementById("projects").innerHTML=document.getElementById("projects").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='clip-path:inset(0px);width:500px;height:500px;top:"+top+"px;left:"+left+"px' onmouseup='pagemouseup()' onmousedown="+String.fromCharCode(34)+"pagemousedown(event,'doc"+documentsccount+"')"+String.fromCharCode(34)+"><canvas class='canvass' id='D"+documentsccount+"1' height='"+height+"' width='"+width+"' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tmpstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tmpstring+")"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"canvasmousedown(event,"+tmpstring+")"+String.fromCharCode(34)+"></canvas></div>";
    document.getElementById("layerbox").innerHTML+="<div id='layerbox"+documentsccount+"'><div id='layerdock"+documentsccount+"' class='layerbox'><div id='layer"+documentsccount+"1' class='layer activelayer layerdrag' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'><div><img id='eye"+documentsccount+"1' src='./public/img/eye.svg' onclick="+String.fromCharCode(34)+"hidelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+documentsccount+"1' src='' class='layerpreview layerdrag'></div><div id='name"+documentsccount+"1' class='layername layerdrag' onmousemove="+String.fromCharCode(34)+"activatelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"selectlayer('"+documentsccount+"1')"+String.fromCharCode(34)+">Layer 1</div></div></div></div>";
    
    DocumentsLayerCount.push(1);
    currentlayer="D"+documentsccount+"1";
    actualdoccount+=1;
    isdocumentsaved.push(false);
    currentdocument=documentsccount;
    documentsccount+=1;
    hidedialog("new");
    showdocument(currentdocument);
}
function save(filetype,percent,filename){
    isdocumentsaved[currentdocument]=true;
    
    //var img=new Image();
    //var imagefile=document.getElementById("D"+currentdocument+""+1).toDataURL('image/jpeg',1);// high quality
    //var imagefile2=document.getElementById("D"+currentdocument+""+1).toDataURL('image/jpeg',0.5);//medium quality
    //var imagefile3=document.getElementById("D"+currentdocument+""+1).toDataURL('image/jpeg',0.1);// low quality
    //img.src=imagefile;
    //document.getElementById("tmpimg").style.backgroundImage="url('"+imagefile+"')";
    //document.getElementById("tmpimg1").src=img.src;

    const canvas=document.createElement("canvas");
    canvas.height=document.getElementById("doc"+currentdocument).offsetHeight;
    canvas.width=document.getElementById("doc"+currentdocument).offsetWidth;
    //console.log(canvas.height+":"+canvas.width)
    const ctx=canvas.getContext("2d");
    var imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null && !islayerhidden(currentdocument+""+a)){
            var tmpcanvas=document.getElementById("D"+currentdocument+""+a);

            ctx.putImageData(tmpcanvas.getContext("2d").getImageData(0,0,tmpcanvas.width,tmpcanvas.height),tmpcanvas.offsetLeft,tmpcanvas.offsetTop);
            const tmpimagedata=ctx.getImageData(0,0,canvas.width,canvas.height);
            for(var m=0;m<imageData.data.length;m+=4){
                if(tmpimagedata.data[m+3]===255 || imageData.data[m+3]===0){
                    imageData.data[m]=tmpimagedata.data[m];
                    imageData.data[m+1]=tmpimagedata.data[m+1];
                    imageData.data[m+2]=tmpimagedata.data[m+2];
                    imageData.data[m+3]=tmpimagedata.data[m+3];
                }else if(tmpimagedata.data[m+3]>0){
                    var tmpint=tmpimagedata.data[m+3]/255;
                    imageData.data[m]+=(tmpimagedata.data[m]-imageData.data[m])*tmpint;
                    imageData.data[m+1]+=(tmpimagedata.data[m+1]-imageData.data[m+1])*tmpint;
                    imageData.data[m+2]+=(tmpimagedata.data[m+2]-imageData.data[m+2])*tmpint;
                }
            }
        }
    }
    ctx.putImageData(imageData,0,0);
    canvas.toBlob((blob) =>{
        const url=URL.createObjectURL(blob);
        const download=document.createElement("a");
        download.href=url;
        if(filetype==="jpeg") download.download=filename+".jpg";
        else download.download=filename+"."+filetype;
        download.click();
    },'image/'+filetype,percent);
    //console.log(atob(imagefile.slice(22,imagefile.length)));
}
function closedocument(){
    actualdoccount-=1;
    document.getElementById("closingdocument").classList.add("hide");

    document.getElementById("title"+currentdocument).remove();
    document.getElementById("doc"+currentdocument).remove();
    document.getElementById("layerbox"+currentdocument).remove();

    if(actualdoccount>0){
        DocumentsLayerCount[currentdocument]=0;
        for(var a=0;a<DocumentsLayerCount.length;a++){
            if(DocumentsLayerCount[a]>0){
                currentdocument=a;
                showdocument(a);
                break;
            }
        }
    }else{
        initialise();
    }
}
function saveandclose(){
    save();
    closedocument();    
}
function checksaved(doc){
    if(isdocumentsaved[doc]){
        closedocument();
    }else{
        document.getElementById("closingdocument").classList.remove("hide");
    }
}
function showdocument(doc){
        /*
        if(currentdocument>=0){
        document.getElementById("title"+currentdocument).classList.remove("titleborder");
        document.getElementById("doc"+currentdocument).classList.add("hide");
        document.getElementById("title"+doc).classList.add("titleborder");
        document.getElementById("doc"+doc).classList.remove("hide");
        document.getElementById("layerbox"+currentdocument).classList.add("hide");
        document.getElementById("layerbox"+doc).classList.remove("hide");
        currentdocument=doc;}
        */
    currentdocument=doc;
    for(var a=0;a<DocumentsLayerCount.length;a++){
        if(DocumentsLayerCount[a]>0){
            document.getElementById("title"+a).classList.remove("titleborder");
            document.getElementById("doc"+a).classList.add("hide");
            document.getElementById("layerbox"+a).classList.add("hide");
        }
    }
    document.getElementById("title"+doc).classList.add("titleborder");
    document.getElementById("doc"+doc).classList.remove("hide");
    document.getElementById("layerbox"+doc).classList.remove("hide");
    currentlayer="D"+getcurrentlayer();
}
function getcurrentlayer(){
    var count=0; var layer="";
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null){
            if(document.getElementById("layer"+currentdocument+""+a).classList.contains("activelayer")){
                count+=1;
                layer=""+currentdocument+""+a;
                if(count>1) {break;}
            }
        }
    }
    if(count>1)return "multi";
    else return layer;
}
function setcolor(){
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
    if(currenttool==="ttext") document.getElementById("texttool").style.color=document.getElementById("forecolor").value;
}
function opencolorbox1(){
    document.getElementById("forecolor").click();
}
function opencolorbox2(){
    document.getElementById("backcolor").click();
}
function defaultcolor(){
    document.getElementById("backcolor").value="#000000";
    document.getElementById("forecolor").value="#ffffff";
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
}
function swapcolor(){
    var color=document.getElementById("backcolor").value;
    document.getElementById("backcolor").value=document.getElementById("forecolor").value;
    document.getElementById("forecolor").value=color;
    setcolor();
}
function activatetool(name){
    if(currenttool==="ttext"){
        document.getElementById("texttooldiv").classList.add("hide");
        document.getElementById("texttooloptions").classList.add("hide");
        istexttoolboxactive=false;
    }
    currenttool=name;
    deactivatetools();
    document.getElementById(currenttool).classList.add("activetool");
    if(currenttool==="tdrop"){
        document.getElementById("cursor").src="./public/img/eyedrop-outline.svg"
        document.querySelector("html").style.cursor="none";
        if(actualdoccount>0){document.getElementById("doc"+currentdocument).style.cursor="none";}
    }else if(currenttool==="ttext") {
        document.getElementById("texttooloptions").classList.remove("hide");
        document.getElementById("doc"+currentdocument).style.cursor="text";
    }
}
function deactivatetools(){
    if(actualdoccount>0){document.getElementById("doc"+currentdocument).style.cursor="default";}
    document.getElementById("cursor").classList.add("hide");
    document.querySelector("html").style.cursor="default";
    document.getElementById("tmove").classList.remove("activetool");
    document.getElementById("tbrush").classList.remove("activetool");
    document.getElementById("tshape").classList.remove("activetool");
    document.getElementById("ttext").classList.remove("activetool");
    document.getElementById("tcrop").classList.remove("activetool");
    document.getElementById("tdrop").classList.remove("activetool");
    document.getElementById("terase").classList.remove("activetool");
    document.getElementById("tbucket").classList.remove("activetool");
}
function changetextfont(){
    document.getElementById("texttool").style.fontFamily=document.getElementById("texttooloptionsfont").value;
    document.getElementById("texttool").style.fontSize=document.getElementById("texttooloptionsfsize").value+"px";
}
function selectlayer(layer){
    if(isctrldown){
        if(document.getElementById("layer"+layer).classList.contains("activelayer")){
            document.getElementById("layer"+layer).classList.remove("activelayer");
        }else document.getElementById("layer"+layer).classList.add("activelayer");
    }else {
        deselectlayers();
        document.getElementById("layer"+layer).classList.add("activelayer");
        currentlayer="D"+layer;
    }
}
function deselectlayers(){
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null){
            document.getElementById("layer"+currentdocument+""+a).classList.remove("activelayer");
        }
    }
}
function selectedlayers(){
    var layers=[];
    var count=0;
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null){
            count+=1;
            if(document.getElementById("layer"+currentdocument+""+a).classList.contains("activelayer")){
                layers.push(currentdocument+""+a);
            }
        }
    }
    if(count===layers.length) layers.push("allselected");

    return layers;
}
function ismultilayerselected(){
    var count=0;
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null){
            if(document.getElementById("layer"+currentdocument+""+a).classList.contains("activelayer")){
                count+=1;
                if(count>1) break;
            }
        }
    }
    if(count>1) return true;
    else return false;
}
function hidelayer(layer){
    if(document.getElementById("eye"+layer).src.toString().includes("eye.svg")){
        document.getElementById("D"+layer).classList.add("hide");
        document.getElementById("eye"+layer).src="./public/img/eye-off-sharp.svg";
    }else {
        document.getElementById("D"+layer).classList.remove("hide");
        document.getElementById("eye"+layer).src="./public/img/eye.svg";
    }
}
function islayerhidden(layer){
    if(document.getElementById("eye"+layer).src.toString().includes("eye.svg"))return false;
    else return true;
}
function deletelayer(){
    var layers=selectedlayers();
    var a=0;
    if(layers[layers.length-1]==="allselected"){
        document.getElementById("layer"+layers[0]).classList.add("activelayer");
        currentlayer="D"+layers[0];
        a=1;
        for(;a<layers.length-1;a++){
            console.log(document.getElementById("layer"+layers[a]))
            document.getElementById("layer"+layers[a]).remove();
            document.getElementById("D"+layers[a]).remove();
        }
    }else{
        for(;a<layers.length;a++){
            document.getElementById("layer"+layers[a]).remove();
            document.getElementById("D"+layers[a]).remove();
        }
        for(a=1;a<=DocumentsLayerCount[currentdocument];a++){
            if(document.getElementById("layer"+currentdocument+""+a)!=null){
                document.getElementById("layer"+currentdocument+""+a).classList.add("activelayer");
                currentlayer="D"+currentdocument+""+a;
                break;
            }
        }
    }
}
function settemplayer(object){
    templayer=object;
    islayermousedown=true;
}
function settempcanvas(object){
    tempcanvas=object;
}
function activatelayer(layer){
    if(!document.getElementById("layer"+layer).classList.contains("activelayer") && templayer===layer && islayermousedown){
        selectlayer(layer);
    }
}
function newlayer(){
    var layers=selectedlayers();
    deselectlayers();
    DocumentsLayerCount[currentdocument]+=1;
    var tmpstring="'"+"D"+currentdocument+""+DocumentsLayerCount[currentdocument]+"'";
    document.getElementById("doc"+currentdocument).innerHTML+="<canvas class='canvass' id='D"+currentdocument+""+DocumentsLayerCount[currentdocument]+"' height='' width='' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tmpstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tmpstring+")"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"canvasmousedown(event,"+tmpstring+")"+String.fromCharCode(34)+"></canvas>";
    document.getElementById("doc"+currentdocument).insertBefore(document.getElementById("D"+layers[0]),document.getElementById("D"+currentdocument+""+DocumentsLayerCount[currentdocument]));
    tmpstring=currentdocument+""+DocumentsLayerCount[currentdocument];
    document.getElementById("layerdock"+currentdocument).innerHTML+="<div id='layer"+tmpstring+"' class='layer activelayer layerdrag' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'><div><img id='eye"+tmpstring+"' src='./public/img/eye.svg' onclick="+String.fromCharCode(34)+"hidelayer('"+tmpstring+"')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+tmpstring+"' src='' class='layerpreview layerdrag'></div><div id='name"+tmpstring+"' class='layername layerdrag' onmousemove="+String.fromCharCode(34)+"activatelayer('"+tmpstring+"')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+tmpstring+"')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"selectlayer('"+tmpstring+"')"+String.fromCharCode(34)+">Layer "+layername()+"</div></div>";
    document.getElementById("layerdock"+currentdocument).insertBefore(document.getElementById("layer"+tmpstring),document.getElementById("layer"+layers[0]));
    currentlayer="D"+tmpstring;
    //document.getElementById("D"+currentdocument+"1").getContext("2d").restore();
}
function layerdrop(event){
  event.preventDefault();
  document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)).style.setProperty("box-shadow","0 0");
  const data = event.dataTransfer.getData("Text");
  event.target.appendChild(document.getElementById(data));
  console.log(event.target)
  console.log("source:"+document.getElementById(data))
}
function layerdragstart(event){
    event.dataTransfer.setData("Text",event.target.id);
    console.log(event.target.id)
}
function layerdragover(event){
    if(event.target!=undefined)
    if(event.target.matches(".layerdrag"))
    document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)).style.setProperty("box-shadow","0px 2px 10px black inset");
}
function layerdragleave(event){
    console.log(event)
    if(event.target!=undefined)
    if(event.target.matches(".layerdrag"))
    document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)).style.setProperty("box-shadow","0 0");
}
function layername(){
    var tmpstring;
    var layernum=1;
    for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
        if(document.getElementById("layer"+currentdocument+""+a)!=null){
            tmpstring=document.getElementById("name"+currentdocument+""+a).innerText;
            if(tmpstring.includes("Layer ")){
                tmpstring=tmpstring.slice(6,tmpstring.length);
                if(layernum<(tmpstring*1)) layernum=tmpstring*1;
            }
        }
    }
    return (layernum+1);
}
function togglefullscreen(){
    if(document.getElementById("fullscreen").src.toString().includes("expand.svg")){
        document.documentElement.requestFullscreen();
        document.getElementById("fullscreen").src="./public/img/contract-outline.svg";
    }else{
        document.exitFullscreen();
        document.getElementById("fullscreen").src="./public/img/expand.svg";
    }
}
//  KEY EVENTS
function keydown(event){
    console.log(event.key);
    if(event.ctrlKey)isctrldown=true;
    if(event.key==="Escape"){
        if(currenttool==="ttext"){
            document.getElementById("texttooldiv").classList.add("hide");
            document.getElementById("texttooloptions").classList.add("hide");
            istexttoolboxactive=false;
        } 
    }
    if(!istexttoolboxactive){
        if(event.key==="v"){
            activatetool("tmove");
        }else if(event.key==="x"){defaultcolor();
        }else if(event.key==="Delete"){
            deletelayer();
        }else if(event.key===" "){
            isspacebardown=true;
            if(!ismenushowing && !isdialogshowing){
            document.getElementById("doc"+currentdocument).style.cursor="grab";
            }
        }
    }
    if(currenttool==="tdrop"){
        activatetool("tmove");
    } 
}
function keyup(){
    if(isspacebardown){
         document.getElementById("doc"+currentdocument).style.cursor="default";
        isspacebardown=false;
    }
    isctrldown=false;
}