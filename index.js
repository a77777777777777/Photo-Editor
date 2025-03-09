var ismenushowing,isdialogshowing;
var istexttoolboxactive=false;
var istransformchecked,istransformactive,transformleft,transformtop;
var ismousedown,islayermousedown,isdialogmousedown,iscanvasmoved,iscanvasmousedown,istouchstart,isscalemousedown,istitledrop;
var xpos,ypos,xposmove,yposmove;
var DocumentsLayerCount=[],isdocumentsaved=[],undo=[],isundo;
var Documentsheight=[],Documentswidth=[],Documentsdpi=[];
var documentsccount,actualdoccount;
var isspacebardown,isctrldown,isAltdown,isShiftdown;
var imgxpos,imgypos;
var currenttool,currentlayer,currentdocument,currentshape="r";
var cancallpreview=0;
var timerID; 
var tempcanvas="",templayer="",tempstring="";
var imagepreview=document.createElement("canvas"); var img7=document.createElement("img"); var imageData;
var trimleft,trimtop,trimwidth,trimheight,zoom; const MaxColor=255;


window.onload=(event)=>{ initialise(); createdocument('new'); hideloading();}

    timerID=setInterval(() => {
        if(actualdoccount>0 && cancallpreview>0){ drawpreview(); 
           if(currenttool==="tshape") document.getElementById(currentlayer).style.objectFit="fill"; }
        if(cancallpreview>0) cancallpreview-=1;
    }, 50);

//document.addEventListener("contextmenu",(e)=>{e.preventDefault();});
function hideloading(){document.getElementById("loading").style.display="none";clearInterval(loadingid);}
function initialise(){
    ismenushowing=ismousedown=istouchstart=false;
    xpos=ypos=xposmove=yposmove=imgxpos=imgypos=0; zoom=100;
    DocumentsLayerCount=[],isdocumentsaved=[]; undo=[]; isundo=false;
    documentsccount=actualdoccount=0; currentdocument=-1;
    isspacebardown=isctrldown=isShiftdown=islayerclone=isdialogshowing=false;
    istransformchecked=istransformactive=false; document.getElementById("showtransformcheckbox").checked=false; showsliderpercent('buckettoolthresholdslider','');showsliderpercent('buckettooltransparentslider','%');
    //setting default values for text tool font/size, default color black/white and default tool as move tool. 
    changetextfont("list"); defaultcolor(); activatetool("tmove"); resetcolorbalanceslider(); resetbrightnesscontrastslider(); document.getElementById("shapetoolLinecolor").value="#000000"; document.getElementById("shapetoolcolor").value="#ffffff"; document.getElementById("buckettoolcolor").value="#ffffff";
}
window.addEventListener("resize",function(event){//console.log(this.screen.height-this.screen.availHeight);

});
document.addEventListener("keydown",function(event){keydown(event);});
document.addEventListener("keyup",function(event){if(event.key==="Alt" || event.key==="Control")event.preventDefault(); keyup(event);});
document.addEventListener("mouseup",function(event){
    if(isspacebardown || currenttool==="thand"){ document.getElementById("doc"+currentdocument).style.cursor="grab";document.getElementById("transform").style.cursor="grab";}
    else document.getElementById("transform").style.cursor="default";
    if(ismousedown && !isspacebardown){
        if(currenttool==="tshape" && !ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            if(trimheight===0){
                trimwidth=20; trimheight=20;
                imagepreview.width=trimwidth; imagepreview.height=trimheight;
                const ctx1=imagepreview.getContext("2d");
                ctx1.fillStyle =document.getElementById("colorf").style.backgroundColor;
                if(currentshape==="r") ctx1.fillRect(0, 0, trimwidth, trimheight);
                else if(currentshape==="c") { 
                    if(trimheight>trimwidth) ctx1.arc(trimwidth/2,trimwidth/2,trimwidth/2,0,Math.PI*2,true);
                    else  ctx1.arc(trimheight/2,trimheight/2,trimheight/2,0,Math.PI*2,true);
                    ctx1.fill();
                }else if(currentshape==="t"){ ctx1.beginPath(); ctx1.moveTo(trimwidth/2,0); ctx1.lineTo(0,trimheight); ctx1.lineTo(trimwidth,trimheight); ctx1.fill();
                }else if(currentshape==="hc"){
                    if(trimheight>trimwidth) ctx1.arc(0,trimwidth/2,trimwidth/2,Math.PI/2,-Math.PI/2,true);
                    else  ctx1.arc(0,trimheight/2,trimheight/2,Math.PI/2,-Math.PI/2,true);
                    ctx1.fill();
                }else if(currentshape==="rt"){ ctx1.beginPath(); ctx1.moveTo(0,0); ctx1.lineTo(trimwidth,trimheight); ctx1.lineTo(0,trimheight); ctx1.fill();
                }else{

                }
            }
                trimimage();
                document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
                document.getElementById(currentlayer).src=imagepreview.toDataURL();
            
        }else if(currenttool==="tbrush" && !ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            trimimage();
            document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
            document.getElementById(currentlayer).style.left=trimleft+"px";
            document.getElementById(currentlayer).style.top=trimtop+"px";
            document.getElementById(currentlayer).src=imagepreview.toDataURL();
        }else if(currenttool==="tmove"){
            document.getElementById("imagebordertb").style.display="none";document.getElementById("imageborderlr").style.display="none";
        }else if(currenttool==="tbucket"){
            if(document.getElementById(currentlayer).width===0){
                imagepreview.width=Documentswidth[currentdocument]; imagepreview.height=Documentsheight[currentdocument];
                const ctx=imagepreview.getContext("2d");
                ctx.fillStyle=document.getElementById("forecolor").value;
                ctx.fillRect(0,0,imagepreview.width,imagepreview.height);
                document.getElementById(currentlayer).width=imagepreview.width; document.getElementById(currentlayer).height=imagepreview.height;
                document.getElementById(currentlayer).src=imagepreview.toDataURL();
            }else{
                xpos=Math.round(xpos-document.getElementById(currentlayer).offsetLeft-document.getElementById("tools").offsetWidth);
                ypos=Math.round(ypos-document.getElementById(currentlayer).offsetTop); if(xpos===0 && ypos===0)xpos=1;
                paintbucket();
            }
        }
    }
    
isdialogmousedown=false;islayermousedown=false;ismousedown=iscanvasmousedown=iscanvasmoved=false; islayerclone=false; if(isscalemousedown){isscalemousedown=false;showtransform();}tempcanvas="";templayer="";
if(currentlayer!="none")cancallpreview=3;
});

document.getElementById("workspace").addEventListener("wheel",function(event){
    var height=Documentsheight[currentdocument], width=Documentswidth[currentdocument];
    xpos=event.clientX-document.getElementById("tools").offsetWidth;
    ypos=event.clientY-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
    xpos-=document.getElementById("doc"+currentdocument).offsetLeft;ypos-=document.getElementById("doc"+currentdocument).offsetTop;
    const documentcurrent=document.getElementById("doc"+currentdocument).childNodes;
    if(event.ctrlKey){
        event.preventDefault();
        if(event.deltaY<0){
            if((zoom+zoom*0.1)>700)return;
            for(var a=0;a<documentcurrent.length;a++){
                img7.src=document.getElementById(documentcurrent[a].id).src;
                document.getElementById(documentcurrent[a].id).height=Math.round(img7.height*Math.round(zoom+zoom*0.1)/100);
                document.getElementById(documentcurrent[a].id).width=Math.round(img7.width*Math.round(zoom+zoom*0.1)/100);
                document.getElementById(documentcurrent[a].id).style.left=document.getElementById(documentcurrent[a].id).offsetLeft*1+Math.round(document.getElementById(documentcurrent[a].id).offsetLeft*(zoom*0.001))+"px";
                document.getElementById(documentcurrent[a].id).style.top=document.getElementById(documentcurrent[a].id).offsetTop*1+Math.round(document.getElementById(documentcurrent[a].id).offsetTop*(zoom*0.001))+"px";
            } 

            zoom+=Math.round(zoom*0.1); 
            if(xpos>0 && xpos<document.getElementById("doc"+currentdocument).offsetWidth && ypos>0 && ypos<document.getElementById("doc"+currentdocument).offsetHeight){
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft-Math.round((width*zoom/100-document.getElementById("doc"+currentdocument).offsetWidth)*(xpos/document.getElementById("doc"+currentdocument).offsetWidth)))+"px";
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop-Math.round(((height*zoom/100-document.getElementById("doc"+currentdocument).offsetHeight)*(ypos/document.getElementById("doc"+currentdocument).offsetHeight))))+"px";  
            }else if(xpos<0 && ypos<0){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop+"px";
            }else if(ypos<0 && xpos>document.getElementById("doc"+currentdocument).offsetWidth){
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop+"px";
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft-Math.round((width*zoom/100-document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            }else if(ypos>document.getElementById("doc"+currentdocument).offsetHeight && xpos<0){
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop-Math.round((height*zoom/100-document.getElementById("doc"+currentdocument).offsetHeight))+"px";
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";
            }else if(xpos<0){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop-Math.round(((height*zoom/100-document.getElementById("doc"+currentdocument).offsetHeight)*(ypos/document.getElementById("doc"+currentdocument).offsetHeight)))+"px";
            }else if(ypos<0){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft-Math.round((width*zoom/100-document.getElementById("doc"+currentdocument).offsetWidth)*(xpos/document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop+"px";
            }else if(xpos>document.getElementById("doc"+currentdocument).offsetWidth && ypos>document.getElementById("doc"+currentdocument).offsetHeight){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft-Math.round((width*zoom/100-document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop-Math.round((height*zoom/100-document.getElementById("doc"+currentdocument).offsetHeight))+"px";
            }else if(xpos>document.getElementById("doc"+currentdocument).offsetWidth){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft-Math.round((width*zoom/100-document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop-Math.round(((height*zoom/100-document.getElementById("doc"+currentdocument).offsetHeight)*(ypos/document.getElementById("doc"+currentdocument).offsetHeight)))+"px";
            }else if(ypos>document.getElementById("doc"+currentdocument).offsetHeight){
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop-Math.round((height*zoom/100-document.getElementById("doc"+currentdocument).offsetHeight))+"px";
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft-Math.round((width*zoom/100-document.getElementById("doc"+currentdocument).offsetWidth)*(xpos/document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            }
        }
        else{
            if((zoom-zoom*0.1)<25)return;
            for(var a=0;a<documentcurrent.length;a++){
                console.log(document.getElementById(documentcurrent[a].id).offsetLeft+":"+zoom*0.1+":"+Math.round(document.getElementById(documentcurrent[a].id).offsetLeft*Math.round(zoom*0.1)/100))

                img7.src=document.getElementById(documentcurrent[a].id).src;
                document.getElementById(documentcurrent[a].id).style.left=document.getElementById(documentcurrent[a].id).offsetLeft-Math.round(document.getElementById(documentcurrent[a].id).offsetLeft*Math.round(zoom*0.1)/100)+"px"; 
                document.getElementById(documentcurrent[a].id).style.top=document.getElementById(documentcurrent[a].id).offsetTop-Math.round(document.getElementById(documentcurrent[a].id).offsetTop*Math.round(zoom*0.1)/100)+"px";
                document.getElementById(documentcurrent[a].id).height-=Math.round(document.getElementById(documentcurrent[a].id).height*Math.round(zoom*0.1)/100);
                document.getElementById(documentcurrent[a].id).width-=Math.round(document.getElementById(documentcurrent[a].id).width*Math.round(zoom*0.1)/100);
            }

            zoom-=Math.round(zoom*0.1);
            if(xpos>0 && xpos<document.getElementById("doc"+currentdocument).offsetWidth && ypos>0 && ypos<document.getElementById("doc"+currentdocument).offsetHeight){    
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop+((document.getElementById("doc"+currentdocument).offsetHeight-height*zoom/100)*(ypos/document.getElementById("doc"+currentdocument).offsetHeight)))+"px";
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft+(document.getElementById("doc"+currentdocument).offsetWidth-width*zoom/100)*(xpos/document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            }else if(xpos<0 && ypos<0){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop+"px";
            }else if(ypos>document.getElementById("doc"+currentdocument).offsetHeight && xpos<0){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop+(document.getElementById("doc"+currentdocument).offsetHeight-(height*zoom/100)))+"px";
            }else if(xpos>document.getElementById("doc"+currentdocument).offsetWidth && ypos<0){
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft+(document.getElementById("doc"+currentdocument).offsetWidth-(width*zoom/100)))+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop+"px";
            }else if(xpos<0){
            document.getElementById("doc"+currentdocument).style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop+((document.getElementById("doc"+currentdocument).offsetHeight-height*zoom/100)*(ypos/document.getElementById("doc"+currentdocument).offsetHeight)))+"px";
            }else if(ypos<0){
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft+(document.getElementById("doc"+currentdocument).offsetWidth-width*zoom/100)*(xpos/document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            document.getElementById("doc"+currentdocument).style.top=document.getElementById("doc"+currentdocument).offsetTop+"px";
            }else if(xpos>document.getElementById("doc"+currentdocument).offsetWidth && ypos>document.getElementById("doc"+currentdocument).offsetHeight){
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft+(document.getElementById("doc"+currentdocument).offsetWidth-(width*zoom/100)))+"px";
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop+(document.getElementById("doc"+currentdocument).offsetHeight-(height*zoom/100)))+"px";
            }else if(xpos>document.getElementById("doc"+currentdocument).offsetWidth){
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft+(document.getElementById("doc"+currentdocument).offsetWidth-(width*zoom/100)))+"px";
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop+((document.getElementById("doc"+currentdocument).offsetHeight-height*zoom/100)*(ypos/document.getElementById("doc"+currentdocument).offsetHeight)))+"px";
            }else if(ypos>document.getElementById("doc"+currentdocument).offsetHeight){
            document.getElementById("doc"+currentdocument).style.left=Math.round(document.getElementById("doc"+currentdocument).offsetLeft+(document.getElementById("doc"+currentdocument).offsetWidth-width*zoom/100)*(xpos/document.getElementById("doc"+currentdocument).offsetWidth))+"px";
            document.getElementById("doc"+currentdocument).style.top=Math.round(document.getElementById("doc"+currentdocument).offsetTop+(document.getElementById("doc"+currentdocument).offsetHeight-(height*zoom/100)))+"px";
            }
        }
        document.getElementById("doc"+currentdocument).style.height=Math.round(height*zoom/100)+"px";
        document.getElementById("doc"+currentdocument).style.width=Math.round(width*zoom/100)+"px";
        showtransform();

    }else{
        var object="doc"+currentdocument;
        var y=Math.round(document.getElementById(object).offsetTop-event.deltaY);
        var x=Math.round(document.getElementById(object).offsetLeft-event.deltaX);
        //if project window goes off bound retain 10% of its height/width within working space area **if it goes negative
        if(x<(-document.getElementById(object).offsetWidth+50)) x=-document.getElementById(object).offsetWidth+50;
        if(y<(-document.getElementById(object).offsetHeight+50)) y=-document.getElementById(object).offsetHeight+50;
        if(x>((window.innerWidth*82/100)-50)) x=Math.round(window.innerWidth*82/100)-50;
        if(y>((window.innerHeight*93/100)-50)) y=Math.round(window.innerHeight*93/100)-50;
        document.getElementById(object).style.top=y+"px";
        document.getElementById(object).style.left=x+"px";
        if(currenttool==="tmove")showtransform();
    }
});

document.addEventListener("mousemove",function(event){mousemovenew(event);});

window.onclick = function(event) {
    if (event.target.matches('.document1')) {
    if(!document.getElementById("texttool").classList.contains("hide"))document.getElementById("texttool").focus();
    }
    if (!event.target.matches('.dropmenu')) {
        hidemenu();
    }
    
    if(currenttool==="tdrop" && !(event.target.matches('.tls1')||event.target.matches('.tlsimg'))){
        document.getElementById("colorf").style.backgroundColor=document.getElementById("eyedropcolor").style.backgroundColor;
        document.getElementById("forecolor").value=tempstring;
        activatetool("tmove");
    }
}

function mousemovenew(event){
    if(ismousedown && !isspacebardown && !isscalemousedown){
        isdocumentsaved[currentdocument]=false;
        if(currenttool==="tmove" && currentlayer!="none"){ //moving objects
            if(isAltdown && !islayerclone){
                islayerclone=true;isAltdown=false; //iscanvasmoved=false; 
                var layers=[]; layers=getselectedlayers();
                if(layers[layers.length-1]==="allselected") layers.pop();
                if(layers.length===1){
                    const ctx1=imagepreview.getContext("2d");
                    imagepreview.width=document.getElementById(currentlayer).width;imagepreview.height=document.getElementById(currentlayer).height;
                    ctx1.drawImage(document.getElementById(currentlayer),0,0);
                    newlayer();document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                    document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
                    document.getElementById(currentlayer).style.top=event.screenY-yposmove+"px"; document.getElementById(currentlayer).style.left=event.screenX-xposmove+"px";
                    showtransform();
                }else{
                        var currentlayertemp=currentlayer,clonelayers=[];
                        for(var a=0;a<layers.length;a++){
                            const ctx1=imagepreview.getContext("2d");
                            trimleft=document.getElementById("D"+layers[a]).offsetLeft; trimtop=document.getElementById("D"+layers[a]).offsetTop;
                            imagepreview.width=document.getElementById("D"+layers[a]).width;imagepreview.height=document.getElementById("D"+layers[a]).height;
                            document.getElementById("D"+layers[a]).classList.remove("activelayer");
                            ctx1.drawImage(document.getElementById("D"+layers[a]),0,0);
                            newlayer(); if(currentlayertemp==="D"+layers[a])currentlayertemp=currentlayer;
                            clonelayers.push(currentlayer);
                            document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                            document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
                            document.getElementById(currentlayer).style.top=trimtop+"px";document.getElementById(currentlayer).style.left=trimleft+"px";
                       }
                       for(var a=0;a<layers.length;a++) document.getElementById("layer"+clonelayers[a].slice(1,clonelayers[a].length)).classList.add("activelayer");
                       currentlayer=currentlayertemp;
                       showtransform();
                }
            }else{
                iscanvasmoved=true; var top,left,bottom,right;islayerclone=true;
                layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected") layers.pop();
                if(layers.length===1){
                    layers[0]=currentlayer.slice(1,currentlayer.length);
                    if(document.getElementById("linkname"+layers[0]).name.length>0){
                        var linkedlayers=[];linkedlayers=getlinkedlayers(document.getElementById("linkname"+layers[0]).name);
                        var x=event.screenX-xposmove,y=event.screenY-yposmove; //var x=event.clientX-xposmove,y=event.clienty-yposmove;
                        x-=document.getElementById(currentlayer).style.left.slice(0,document.getElementById(currentlayer).style.left.length-2)*1;
                        y-=document.getElementById(currentlayer).style.top.slice(0,document.getElementById(currentlayer).style.top.length-2)*1;
    
                        for(var a=0;a<linkedlayers.length;a++){
                            bottom=top+document.getElementById("D"+linkedlayers[a]).offsetHeight;right=left+document.getElementById("D"+linkedlayers[a]).offsetWidth;
                            if(top<8 && top>-8) top=0; 
                            if(left<8 && left>-8) left=0;
                            if(bottom>(document.getElementById("doc"+currentdocument).offsetHeight-8) && bottom<(document.getElementById("doc"+currentdocument).offsetHeight+8)){ 
                                top=document.getElementById("doc"+currentdocument).offsetHeight-document.getElementById("D"+linkedlayers[a]).height; bottom=0;
                            }
                            if(right>(document.getElementById("doc"+currentdocument).offsetWidth-8) && right<(document.getElementById("doc"+currentdocument).offsetWidth+8)){ 
                                left=document.getElementById("doc"+currentdocument).offsetWidth-document.getElementById("D"+linkedlayers[a]).width; right=0; 
                            }
                            document.getElementById("D"+linkedlayers[a]).style.top=document.getElementById("D"+linkedlayers[a]).style.top.slice(0,document.getElementById("D"+linkedlayers[a]).style.top.length-2)*1+y+"px";
                            document.getElementById("D"+linkedlayers[a]).style.left=document.getElementById("D"+linkedlayers[a]).style.left.slice(0,document.getElementById("D"+linkedlayers[a]).style.left.length-2)*1+x+"px";
                        }
                        showtransform();
                    }else{
                        document.getElementById("imagebordertb").style.display="none";document.getElementById("imageborderlr").style.display="none";
                        top=event.screenY-yposmove; left=event.screenX-xposmove;

                        bottom=top+document.getElementById(currentlayer).offsetHeight;right=left+document.getElementById(currentlayer).offsetWidth;
                        if(top<8 && top>-8) top=0; 
                        if(left<8 && left>-8) left=0;
                        if(bottom>(document.getElementById("doc"+currentdocument).offsetHeight-8) && bottom<(document.getElementById("doc"+currentdocument).offsetHeight+8)){ 
                            top=document.getElementById("doc"+currentdocument).offsetHeight-document.getElementById(currentlayer).height; bottom=0;
                        }
                        if(right>(document.getElementById("doc"+currentdocument).offsetWidth-8) && right<(document.getElementById("doc"+currentdocument).offsetWidth+8)){ 
                            left=document.getElementById("doc"+currentdocument).offsetWidth-document.getElementById(currentlayer).width; right=0; 
                        }

                        document.getElementById(currentlayer).style.top=top+"px";
                        document.getElementById(currentlayer).style.left=left+"px";

                        if(top===0){//show corner mark
                            document.getElementById("imagebordertb").style.width=document.getElementById(currentlayer).width+"px"; 
                            document.getElementById("imagebordertb").style.left=document.getElementById("doc"+currentdocument).offsetLeft+document.getElementById(currentlayer).offsetLeft+"px";
                            document.getElementById("imagebordertb").style.top=document.getElementById("doc"+currentdocument).offsetTop+"px"; 
                            document.getElementById("imagebordertb").style.display="block";
                        }
                        if(left===0){
                            document.getElementById("imageborderlr").style.height=document.getElementById(currentlayer).height+"px"; 
                            document.getElementById("imageborderlr").style.left=document.getElementById("doc"+currentdocument).offsetLeft+"px";//.slice(0,document.getElementById("doc"+currentdocument).style.left.length-2)*1-1+"px"; 
                            document.getElementById("imageborderlr").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById(currentlayer).offsetTop+"px"; 
                            document.getElementById("imageborderlr").style.display="block";
                        }
                        if(bottom===0){ 
                            document.getElementById("imagebordertb").style.width=document.getElementById(currentlayer).width+"px"; 
                            document.getElementById("imagebordertb").style.left=document.getElementById("doc"+currentdocument).offsetLeft+document.getElementById(currentlayer).offsetLeft+"px";
                            document.getElementById("imagebordertb").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById("doc"+currentdocument).offsetHeight-1.7+"px"; 
                            document.getElementById("imagebordertb").style.display="block"; 
                        }
                        if(right===0){  
                            document.getElementById("imageborderlr").style.height=document.getElementById(currentlayer).height+"px"; 
                            document.getElementById("imageborderlr").style.left=document.getElementById("doc"+currentdocument).offsetLeft+document.getElementById("doc"+currentdocument).offsetWidth-1.7+"px"; 
                            document.getElementById("imageborderlr").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById(currentlayer).offsetTop+"px"; 
                            document.getElementById("imageborderlr").style.display="block";
                        }
                        showtransform();
                    }
                }else{
                    var x=event.screenX-xposmove,y=event.screenY-yposmove;
                        if(istransformchecked){
                            x=x+document.getElementById("doc"+currentdocument).offsetLeft,y+=+document.getElementById("doc"+currentdocument).offsetTop;
                            left=document.getElementById("transform").style.left.slice(0,document.getElementById("transform").style.left.length-2)*1-x;
                            top=document.getElementById("transform").style.top.slice(0,document.getElementById("transform").style.top.length-2)*1-y;
                            document.getElementById("transform").style.top=y+"px";
                            document.getElementById("transform").style.left=x+"px";
    
                            for(var a=0;a<layers.length;a++){
                            document.getElementById("D"+layers[a]).style.top=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1-top+"px";
                            document.getElementById("D"+layers[a]).style.left=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1-left+"px";
                            }
                        }else{
                            x-=document.getElementById(currentlayer).style.left.slice(0,document.getElementById(currentlayer).style.left.length-2)*1;
                            y=y-document.getElementById(currentlayer).style.top.slice(0,document.getElementById(currentlayer).style.top.length-2)*1;
                        for(var a=0;a<layers.length;a++){
                            document.getElementById("D"+layers[a]).style.top=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1+y+"px";
                            document.getElementById("D"+layers[a]).style.left=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1+x+"px";
                        }
                    }
                }
            }
        }else if(currenttool==="tshape" && !isspacebardown){
                if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
                trimwidth=event.clientX-imgxpos-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
                trimheight=event.clientY-imgypos-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                imagepreview.width=trimwidth; imagepreview.height=trimheight;
                const ctx1=imagepreview.getContext("2d");
                ctx1.fillStyle =document.getElementById("shapetoolcolor").value;
                ctx1.strokeStyle =document.getElementById("shapetoolLinecolor").value;
                ctx1.lineWidth=document.getElementById("shapetooloptionsstrokew").value;
                ctx1.lineJoin=document.getElementById("shapetooloptionstype").value;
                ctx1.setLineDash([document.getElementById("shapetooloptionsstrokel").value,document.getElementById("shapetooloptionsstrokeg").value]);
                if(trimheight<10 || trimwidth<10){trimheight=10;trimwidth=10;}
                
                if(currentshape==="r"){
                    if(isShiftdown){
                        if(trimheight>trimwidth){
                            if( document.getElementById("shapetoolstrokecheckbox").checked){
                                  ctx1.strokeRect(ctx1.lineWidth/2,ctx1.lineWidth/2, trimwidth-ctx1.lineWidth, trimwidth-ctx1.lineWidth);
                                } 
                            else ctx1.fillRect(0, 0, trimwidth, trimwidth); 
                        }else{
                            if( document.getElementById("shapetoolstrokecheckbox").checked){
                                  ctx1.strokeRect(ctx1.lineWidth/2,ctx1.lineWidth/2, trimheight-ctx1.lineWidth, trimheight-ctx1.lineWidth);
                                } 
                            else ctx1.fillRect(0, 0, trimheight, trimheight);
                        }
                    } else {
                        if( document.getElementById("shapetoolstrokecheckbox").checked){
                              ctx1.strokeRect(ctx1.lineWidth/2,ctx1.lineWidth/2, trimwidth-ctx1.lineWidth, trimheight-ctx1.lineWidth);
                            } 
                        else ctx1.fillRect(0, 0, trimwidth, trimheight);
                    }

                }
                else if(currentshape==="c") {
                    if( document.getElementById("shapetoolstrokecheckbox").checked){  
                        if(trimheight>trimwidth) ctx1.arc(trimwidth/2,trimwidth/2,trimwidth/2-ctx1.lineWidth/2,0,Math.PI*2,true);
                        else  ctx1.arc(trimheight/2,trimheight/2,trimheight/2-ctx1.lineWidth/2,0,Math.PI*2,true);
                        ctx1.stroke();
                    }else {
                        if(trimheight>trimwidth) ctx1.arc(trimwidth/2,trimwidth/2,trimwidth/2,0,Math.PI*2,true);
                        else  ctx1.arc(trimheight/2,trimheight/2,trimheight/2,0,Math.PI*2,true);
                        ctx1.fill();
                    }
                }else if(currentshape==="t"){
                    //var d=new Path2D(document.getElementById("S01").innerHTML.slice(9,document.getElementById("S01").innerHTML.length-9));
                    ctx1.beginPath();
                    if( document.getElementById("shapetoolstrokecheckbox").checked){
                        if(isShiftdown){
                            if(trimheight>=trimwidth){
                                ctx1.moveTo(trimwidth/2,ctx1.lineWidth/2); ctx1.lineTo(ctx1.lineWidth/2,trimwidth-ctx1.lineWidth/2);
                                ctx1.lineTo(trimwidth-ctx1.lineWidth/2,trimwidth-ctx1.lineWidth/2); ctx1.lineTo(trimwidth/2,1);
                            }else{
                                ctx1.moveTo(trimheight/2,ctx1.lineWidth/2); ctx1.lineTo(ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2);
                                ctx1.lineTo(trimheight-ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2); ctx1.lineTo(trimheight/2,1);
                            }
                        }else{
                            ctx1.moveTo(trimwidth/2,ctx1.lineWidth/2); ctx1.lineTo(ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2);
                            ctx1.lineTo(trimwidth-ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2); ctx1.lineTo(trimwidth/2,1);
                        }
                        ctx1.stroke();
                    }else{
                        if(isShiftdown){
                            if(trimheight>=trimwidth){
                                ctx1.moveTo(trimwidth/2,0); ctx1.lineTo(0,trimwidth);
                                ctx1.lineTo(trimwidth,trimwidth); ctx1.lineTo(trimwidth/2,0);
                            }else{
                                ctx1.moveTo(trimheight/2,0); ctx1.lineTo(0,trimheight);
                                ctx1.lineTo(trimheight,trimheight); ctx1.lineTo(trimheight/2,0);
                            }
                        }else{
                            ctx1.moveTo(trimwidth/2,0); ctx1.lineTo(0,trimheight);
                            ctx1.lineTo(trimwidth,trimheight); ctx1.lineTo(trimwidth/2,0);
                        }
                        ctx1.fill();
                    }
                }else if(currentshape==="hc"){
                    
                    if( document.getElementById("shapetoolstrokecheckbox").checked){  
                        if(trimheight>trimwidth){
                            ctx1.arc(ctx1.lineWidth,trimwidth/2-ctx1.lineWidth/2,trimwidth/2-ctx1.lineWidth,Math.PI/2,-Math.PI/2,true);
                            ctx1.stroke(); ctx1.beginPath(); ctx1.moveTo(ctx1.lineWidth/2,0);
                            ctx1.lineTo(ctx1.lineWidth/2,trimwidth-ctx1.lineWidth); ctx1.stroke();
                        }
                        else {
                            ctx1.arc(ctx1.lineWidth,trimheight/2-ctx1.lineWidth/2,trimheight/2-ctx1.lineWidth,Math.PI/2,-Math.PI/2,true);
                            ctx1.stroke(); ctx1.beginPath(); ctx1.moveTo(ctx1.lineWidth/2,0);
                            ctx1.lineTo(ctx1.lineWidth/2,trimheight-ctx1.lineWidth); ctx1.stroke();
                        }
                    }else{
                        if(trimheight>trimwidth) ctx1.arc(0,trimwidth/2,trimwidth/2,Math.PI/2,-Math.PI/2,true);
                        else  ctx1.arc(0,trimheight/2,trimheight/2,Math.PI/2,-Math.PI/2,true);
                        ctx1.fill();
                    }
                }else if(currentshape==="rt"){
                    ctx1.beginPath();
                    if( document.getElementById("shapetoolstrokecheckbox").checked){
                        ctx1.moveTo(ctx1.lineWidth/2,ctx1.lineWidth/2);
                        if(isShiftdown){
                            if(trimheight>trimwidth){
                                ctx1.lineTo(trimwidth-ctx1.lineWidth,trimwidth-ctx1.lineWidth/2);
                                ctx1.lineTo(ctx1.lineWidth/2,trimwidth-ctx1.lineWidth/2);
                                ctx1.lineTo(ctx1.lineWidth/2,ctx1.lineWidth/2);
                            }else{
                                ctx1.lineTo(trimheight-ctx1.lineWidth,trimheight-ctx1.lineWidth/2);
                                ctx1.lineTo(ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2);
                                ctx1.lineTo(ctx1.lineWidth/2,ctx1.lineWidth/2);
                            }
                        }else{
                            ctx1.lineTo(trimwidth-ctx1.lineWidth,trimheight-ctx1.lineWidth/2);
                            ctx1.lineTo(ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2);
                            ctx1.lineTo(ctx1.lineWidth/2,ctx1.lineWidth/2);
                        }
                        ctx1.lineTo(1,1); ctx1.stroke();
                    }else{
                        ctx1.moveTo(0,0);
                        if(isShiftdown){
                            if(trimheight>trimwidth){ ctx1.lineTo(trimwidth,trimwidth); ctx1.lineTo(0,trimwidth);
                            }else{ ctx1.lineTo(trimheight,trimheight); ctx1.lineTo(0,trimheight); }
                        }else{ ctx1.lineTo(trimwidth,trimheight); ctx1.lineTo(0,trimheight); }
                        ctx1.fill();
                    }
                }else if(currentshape==="l"){
                    ctx1.beginPath();
                        if(isShiftdown){
                            if(trimheight>trimwidth){ ctx1.moveTo(ctx1.lineWidth/2,0); ctx1.lineTo(ctx1.lineWidth/2,trimheight);
                            }else{ ctx1.moveTo(0,ctx1.lineWidth/2); ctx1.lineTo(trimwidth,ctx1.lineWidth/2); }
                        }else{
                            ctx1.moveTo(ctx1.lineWidth/2,ctx1.lineWidth/2); ctx1.lineTo(trimwidth-ctx1.lineWidth/2,trimheight-ctx1.lineWidth/2);
                        }
                        ctx1.stroke();
                }else{

                }
                
                document.getElementById(currentlayer).width=trimwidth;document.getElementById(currentlayer).height=trimheight;
                document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
            }else showmessage("Select a layer to draw.");
        }else if(currenttool==="tbrush"){
            if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
                var x=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
                var y=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                if(x>Documentswidth[currentdocument]) x=Documentswidth[currentdocument];if(y>Documentsheight[currentdocument]) y=Documentsheight[currentdocument];

                const ctx1=imagepreview.getContext("2d");
                ctx1.drawImage(document.getElementById(currentlayer),0,0);
                var radgrad = ctx1.createRadialGradient(x+50,y+50,0,x+50,y+50,50);
                radgrad.addColorStop(0, '#A7D30C'); radgrad.addColorStop(0.7, '#019F62');
                radgrad.addColorStop(0.7, 'rgba(1,159,98,0)'); radgrad.addColorStop(1, 'rgba(1,159,98,0)');
                
                ctx1.beginPath(); ctx1.moveTo(imgxpos, imgypos); ctx1.lineTo(x, y);
                ctx1.lineWidth=20; ctx1.lineCap="round"; ctx1.lineJoin="round";
                ctx1.strokeStyle =document.getElementById("colorf").style.backgroundColor;//radgrad;//
                ctx1.closePath(); //ctx1.fill();
                ctx1.stroke();
            
                //ctx1.arc(x,y,20,0,20*Math.PI);//ctx1.fillRect(x, y, 100, 100);
                imgxpos=x,imgypos=y;
                document.getElementById("testmessage").innerText="x="+x+":y:"+y+"w="+x+":h="+y;
                document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
            }else showmessage("Select a layer to draw.");
            
        }else if(currenttool==="terase"){
            if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
                var x=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
                var y=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                if(x>Documentswidth[currentdocument]) x=Documentswidth[currentdocument];if(y>Documentsheight[currentdocument]) y=Documentsheight[currentdocument];

                const ctx1=imagepreview.getContext("2d");
                ctx1.drawImage(document.getElementById(currentlayer),0,0);
                
                ctx1.beginPath(); ctx1.moveTo(imgxpos, imgypos); ctx1.lineTo(x, y);
                ctx1.lineWidth=20; ctx1.lineCap="round"; ctx1.lineJoin="round";
                ctx1.strokeStyle ='rgba(255,255,255,0)';//document.getElementById("colorf").style.backgroundColor;//radgrad;// 
                ctx1.closePath(); ctx1.stroke();
            
                imgxpos=x,imgypos=y;
                document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
            }else showmessage("Select a layer to draw.");

        }
    }else{
        if(currenttool==="tdrop"){
            if(document.getElementById("cursor").classList.contains("hide")){
                document.getElementById("cursor").classList.remove("hide");
                document.getElementById("eyedropcolor").classList.remove("hide");
            }
            document.getElementById("cursor").style.top=event.pageY-document.getElementById("cursor").offsetHeight+5+"px";
            document.getElementById("cursor").style.left=event.pageX+"px";
            document.getElementById("eyedropcolor").style.top=event.pageY-document.getElementById("cursor").offsetHeight*2+20+"px";
            document.getElementById("eyedropcolor").style.left=event.pageX+document.getElementById("cursor").offsetWidth+5+"px";
            
            xpos=event.clientX-document.getElementById("doc"+currentdocument).style.left.slice(0,document.getElementById("doc"+currentdocument).style.left.length-2);
            ypos=event.clientY-document.getElementById("doc"+currentdocument).style.top.slice(0,document.getElementById("doc"+currentdocument).style.top.length-2);

            var x=Math.round(xpos-document.getElementById("tools").offsetWidth),y;
            y=Math.round(ypos-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight-document.getElementById("menu").offsetHeight);
            var index=y*Documentswidth[currentdocument]*4+x*4;
            var red=imageData.data[(index-4)],green=imageData.data[(index-3)],blue=imageData.data[(index-2)];
            //document.getElementById("testmessage").innerText=x+":"+y;
            if(imageData.data[index-1]>0){
                tempstring="0123456789abcdef";
                tempstring="#"+tempstring.charAt(Math.floor(red/16))+""+tempstring.charAt(red%16)+""+tempstring.charAt(Math.floor(green/16))+""+tempstring.charAt(blue%16)+""+tempstring.charAt(Math.floor(blue/16))+""+tempstring.charAt(blue%16);
                document.getElementById("eyedropcolor").style.backgroundColor=tempstring;
            }
        }if(isscalemousedown){
            if(!ismultilayerselected()){ document.getElementById("imagebordertb").style.display="none";document.getElementById("imageborderlr").style.display="none";
                if(tempstring==="right"){
                    var x=event.screenX-document.getElementById("transform").offsetLeft-document.getElementById("tools").offsetWidth;
                    if(x<=2)x=2;
                    if((document.getElementById(currentlayer).offsetLeft+x)>(document.getElementById("doc"+currentdocument).offsetWidth-8) && (document.getElementById(currentlayer).offsetLeft+x)<(document.getElementById("doc"+currentdocument).offsetWidth+8)){
                        x=document.getElementById("doc"+currentdocument).offsetWidth-document.getElementById(currentlayer).offsetLeft; document.getElementById("imageborderlr").style.display="block";
                        document.getElementById("imageborderlr").style.height=document.getElementById(currentlayer).height+"px";
                        document.getElementById("imageborderlr").style.left=document.getElementById("doc"+currentdocument).style.left.slice(0,document.getElementById("doc"+currentdocument).style.left.length-2)*1+document.getElementById("doc"+currentdocument).offsetWidth-2+"px";
                        document.getElementById("imageborderlr").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById(currentlayer).offsetTop+"px";
                    }document.getElementById("transformgrid").style.width=x-2+"px";
                    document.getElementById(currentlayer).width=x;
                    const ctx=imagepreview.getContext("2d");
                    imagepreview.width=x;
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,x,document.getElementById(currentlayer).height);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else if(tempstring==="left"){
                    var x=event.screenX-document.getElementById("tools").offsetWidth;
                    if((x-document.getElementById("doc"+currentdocument).offsetLeft)>(trimleft+trimwidth-2))x=trimleft+trimwidth-2+document.getElementById("doc"+currentdocument).offsetLeft;
                    
                    if(x>(document.getElementById("doc"+currentdocument).offsetLeft-8) && x<(document.getElementById("doc"+currentdocument).offsetLeft+8)){
                        x=document.getElementById("doc"+currentdocument).offsetLeft; document.getElementById("imageborderlr").style.display="block";
                        document.getElementById("imageborderlr").style.height=document.getElementById(currentlayer).height+"px";
                        document.getElementById("imageborderlr").style.left=x-1+"px";
                        document.getElementById("imageborderlr").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById(currentlayer).offsetTop+"px";
                        document.getElementById("transform").style.left=x-1+"px";
                        x=x-document.getElementById("doc"+currentdocument).offsetLeft;
                        document.getElementById(currentlayer).style.left=x+"px";
                        
                        if(x<0) x=(trimwidth+trimleft)+Math.abs(x); else x=(trimwidth+trimleft)-x;
                        document.getElementById(currentlayer).width=x; document.getElementById("transformgrid").style.width=x-2+"px";
                    }else{
                        document.getElementById("transform").style.left=x-1+"px";
                        x=x-document.getElementById("doc"+currentdocument).offsetLeft;
                        document.getElementById(currentlayer).style.left=x+"px";
                        if(x<0) x=(trimwidth+trimleft)+Math.abs(x); else x=(trimwidth+trimleft)-x;
                        document.getElementById(currentlayer).width=x; document.getElementById("transformgrid").style.width=x-2+"px";
                    }
                    const ctx=imagepreview.getContext("2d"); imagepreview.width=x;
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,x,document.getElementById(currentlayer).height);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else if(tempstring==="top"){
                    var y=event.clientY-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                    if((y-document.getElementById("doc"+currentdocument).offsetTop)>(trimtop+trimheight-2))y=trimheight+trimtop+document.getElementById("doc"+currentdocument).offsetTop-2;
                    
                    if(y>(document.getElementById("doc"+currentdocument).offsetTop-8) && y<(document.getElementById("doc"+currentdocument).offsetTop+8)){
                        y=document.getElementById("doc"+currentdocument).offsetTop; document.getElementById("imagebordertb").style.display="block";
                        document.getElementById("imagebordertb").style.width=document.getElementById(currentlayer).width+"px";
                        document.getElementById("imagebordertb").style.left=document.getElementById("doc"+currentdocument).offsetLeft+document.getElementById(currentlayer).offsetLeft+"px";
                        document.getElementById("imagebordertb").style.top=y-1+"px";
                        document.getElementById("transform").style.top=y-1+"px";
                        document.getElementById(currentlayer).style.top=y-document.getElementById("doc"+currentdocument).offsetTop+"px";
                        y=y-document.getElementById("doc"+currentdocument).offsetTop;
                        if(y<0) y=(trimheight+trimtop)+Math.abs(y); else y=(trimheight+trimtop)-y;
                        document.getElementById(currentlayer).height=y; document.getElementById("transformgrid").style.height=y+"px";
                    }else{
                        document.getElementById("transform").style.top=y-1+"px";
                        document.getElementById(currentlayer).style.top=y-document.getElementById("doc"+currentdocument).offsetTop+"px";
                        y=y-document.getElementById("doc"+currentdocument).offsetTop;
                        if(y<0) y=(trimheight+trimtop)+Math.abs(y); else y=(trimheight+trimtop)-y;
                        document.getElementById(currentlayer).height=y; document.getElementById("transformgrid").style.height=y-1+"px";
                    }
                    const ctx=imagepreview.getContext("2d");
                    imagepreview.height=y;
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,document.getElementById(currentlayer).width,y);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else if(tempstring==="bottom"){
                    var y=event.clientY-document.getElementById("transform").offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                    if(y<=2)y=2;
                    if((y+document.getElementById(currentlayer).offsetTop)>(document.getElementById("doc"+currentdocument).offsetHeight-8) && (y+document.getElementById(currentlayer).offsetTop)<(document.getElementById("doc"+currentdocument).offsetHeight+8)){
                        y=document.getElementById("doc"+currentdocument).offsetHeight-document.getElementById(currentlayer).offsetTop; document.getElementById("imagebordertb").style.display="block";
                        document.getElementById("imagebordertb").style.width=document.getElementById(currentlayer).width+"px";
                        document.getElementById("imagebordertb").style.left=document.getElementById("doc"+currentdocument).offsetLeft+document.getElementById(currentlayer).offsetLeft+"px";
                        document.getElementById("imagebordertb").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById("doc"+currentdocument).offsetHeight-1+"px";
                    }
                    document.getElementById("transformgrid").style.height=y-1+"px";
                    document.getElementById(currentlayer).height=y; const ctx=imagepreview.getContext("2d");
                    imagepreview.height=y; //document.getElementById("transformgrid").style.height=y+"px";
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,document.getElementById(currentlayer).width,y);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else if(tempstring==="rightdown"){
                        var x=event.screenX-document.getElementById("transform").offsetLeft-document.getElementById("tools").offsetWidth;
                        if(x<=2)x=2;
                        if((document.getElementById(currentlayer).offsetLeft+x)>(document.getElementById("doc"+currentdocument).offsetWidth-8) && (document.getElementById(currentlayer).offsetLeft+x)<(document.getElementById("doc"+currentdocument).offsetWidth+8)){
                            x=document.getElementById("doc"+currentdocument).offsetWidth-document.getElementById(currentlayer).offsetLeft; document.getElementById("imageborderlr").style.display="block";
                            document.getElementById("imageborderlr").style.height=document.getElementById(currentlayer).height+"px";
                            document.getElementById("imageborderlr").style.left=document.getElementById("doc"+currentdocument).style.left.slice(0,document.getElementById("doc"+currentdocument).style.left.length-2)*1+document.getElementById("doc"+currentdocument).offsetWidth-2+"px";
                            document.getElementById("imageborderlr").style.top=document.getElementById("doc"+currentdocument).offsetTop+document.getElementById(currentlayer).offsetTop+"px";
                        }
                        y=Math.round(x/(img7.width/img7.height));
                        document.getElementById("transformgrid").style.height=y-1+"px";document.getElementById("transformgrid").style.width=x-2+"px";
                        document.getElementById(currentlayer).width=x;document.getElementById(currentlayer).height=y;
                        const ctx=imagepreview.getContext("2d");
                        imagepreview.width=x; imagepreview.height=y;
                        ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,x,y);
                        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else{
                    var x=event.clientX-document.getElementById("transform").offsetLeft-document.getElementById("tools").offsetWidth;var y=event.clientY-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                    var ra; var canvas1=document.createElement("canvas");
                    if(y>(trimtop+trimwidth/2+trimheight/2)) y=(trimtop+trimwidth/2+trimheight/2); if(x>(trimleft+trimwidth/2+trimheight/2)) x=(trimleft+trimwidth/2+trimheight/2);
                    if(x<(trimwidth+trimleft)){ ra=(y/(trimtop+trimwidth/2+trimheight/2))-(x/(trimleft+trimwidth/2+trimheight/2));
                    }else{ra=(x/(trimleft+trimwidth/2+trimheight/2))-(y/(trimtop+trimwidth/2+trimheight/2));
                    }
                    if(trimheight>trimwidth){canvas1.width=imagepreview.width*1.5; canvas1.height=imagepreview.height*1.5;} else {canvas1.width=imagepreview.width*1.5; canvas1.height=imagepreview.height*1.5;}
                    const ctx1=canvas1.getContext("2d");
                    ctx1.translate(canvas1.width/2,canvas1.height/2); //console.log(ra+":"+(y/(trimtop+trimwidth/2+trimheight/2)))
                    ctx1.rotate(Math.PI/ra); //document.getElementById(currentlayer).width=imagepreview.width; document.getElementById(currentlayer).height=imagepreview.height;
                    const img=new Image(); img.src=imagepreview.toDataURL("image/png");
                    img.onload=function(){
                        ctx1.drawImage(img,-imagepreview.width/2,-imagepreview.width/2); //trimimage(); document.getElementById(currentlayer).src=
                        //document.getElementById(currentlayer).style.left=document.getElementById(currentlayer).offsetLeft+document.getElementById(currentlayer).width/2-document.getElementById(currentlayer).height/2+"px"; //document.getElementById(currentlayer).style.top=document.getElementById(currentlayer).offsetTop+document.getElementById(currentlayer).height/2-document.getElementById(currentlayer).width/2+"px";
                        document.getElementById(currentlayer).width=canvas1.width; document.getElementById(currentlayer).height=canvas1.height;
                        document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");showtransform();
                    }
                }
            }
        }
    }
}
function pagemousedown(event,object){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    xpos=event.clientX-document.getElementById(object).offsetLeft;//.style.left.slice(0,document.getElementById(object).style.left.length-2);
    ypos=event.clientY-document.getElementById(object).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;//.style.top.slice(0,document.getElementById(object).style.top.length-2);
    if(isspacebardown || currenttool==="thand"){
        document.getElementById(object).style.cursor="grabbing"; ismousedown=true;
    }else if(currenttool==="ttext" && document.getElementById("texttooldiv").classList.contains("hide")){
        istexttoolboxactive=true;
        document.getElementById("texttool").style.top=event.pageY+"px";document.getElementById("texttool").style.left=event.pageX+"px";
        document.getElementById("texttooldiv").classList.remove("hide");document.getElementById("texttooloptions").classList.remove("hide");
        document.getElementById("drawtextapplycancel").classList.remove("hide");
        changetextfont(); document.getElementById("texttool").value="";
    }else if(currenttool==="tshape"){
        imgxpos=event.clientX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
        imgypos=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
            newlayer();
            trimheight=trimwidth=0,imagepreview.width=imagepreview.height=1;
            document.getElementById(currentlayer).style.objectFit="none";
            document.getElementById(currentlayer).style.left=imgxpos+"px"; document.getElementById(currentlayer).style.top=imgypos+"px";
            document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
        ismousedown=true;
    }else if(currenttool==="tbrush"){
        imgxpos=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
        imgypos=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
        
        imagepreview.height=Documentsheight[currentdocument];
        imagepreview.width=Documentswidth[currentdocument];
        if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            document.getElementById(currentlayer).height=imagepreview.height;document.getElementById(currentlayer).width=imagepreview.width;
            document.getElementById(currentlayer).style.left="0px";document.getElementById(currentlayer).style.top="0px";
            document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
        }
        ismousedown=true;
    }else if(currenttool==="tmove"){
            var documentcanvas=[]; documentcanvas=document.getElementById("doc"+currentdocument).childNodes;
            var x, y; x=xpos-document.getElementById("tools").offsetWidth; y=ypos; //-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight-document.getElementById("menu").offsetHeight;
            for(var a=(documentcanvas.length-1);a>=0;a--){ 
                if(x>=document.getElementById(documentcanvas[a].id).offsetLeft && x<=(document.getElementById(documentcanvas[a].id).offsetLeft+document.getElementById(documentcanvas[a].id).offsetWidth))
                    if(y>=document.getElementById(documentcanvas[a].id).offsetTop && y<=(document.getElementById(documentcanvas[a].id).offsetTop+document.getElementById(documentcanvas[a].id).offsetHeight)){
                        var xc,yc;
                        xc=Math.round(x-document.getElementById(documentcanvas[a].id).offsetLeft);
                        yc=Math.round(y-document.getElementById(documentcanvas[a].id).offsetTop); if(xc===0 && yc===0)xc=1;
                        imagepreview.width=document.getElementById(documentcanvas[a].id).width;
                        imagepreview.height=document.getElementById(documentcanvas[a].id).height;
                        const ctx=imagepreview.getContext("2d"); ctx.drawImage(document.getElementById(documentcanvas[a].id),0,0);
                        const idata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height); //document.getElementById("testmessage").innerText=idata.data[Math.round(((yc)*imagepreview.width*4+xc*4)-1)]+":"+(((yc)*imagepreview.width*4+xc*4)-1);
                        if(idata.data[((yc)*imagepreview.width*4+xc*4)-1]>0){
                            xposmove=event.screenX-document.getElementById(documentcanvas[a].id).offsetLeft;
                            yposmove=event.screenY-document.getElementById(documentcanvas[a].id).offsetTop;
                            settempcanvas(documentcanvas[a].id); iscanvasmoved=false; iscanvasmousedown=true; ismousedown=true; break;
                        }
                    }
            }
            if(!ismousedown){ deselectlayers();hidelayerlink(); currentlayer="none"; hidetransform();}
        
    }else if(currenttool==="terase"){
        imgxpos=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
        imgypos=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
        
        imagepreview.height=Documentsheight[currentdocument];
        imagepreview.width=Documentswidth[currentdocument];
        if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            document.getElementById(currentlayer).height=imagepreview.height;document.getElementById(currentlayer).width=imagepreview.width;
            document.getElementById(currentlayer).style.left="0px";document.getElementById(currentlayer).style.top="0px";
            //document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
        }
        ismousedown=true;
    }else if(currenttool==="tbucket"){
        if(currentlayer==="none"){ showmessage("Select a layer to paint."); return;}
        var documentcanvas=[]; documentcanvas=document.getElementById("doc"+currentdocument).childNodes;
        var x, y; x=xpos-document.getElementById("tools").offsetWidth; y=ypos;//-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight-document.getElementById("menu").offsetHeight;
        for(var a=(documentcanvas.length-1);a>=0;a--){ 
            if(x>=document.getElementById(documentcanvas[a].id).offsetLeft && x<=(document.getElementById(documentcanvas[a].id).offsetLeft+document.getElementById(documentcanvas[a].id).offsetWidth))
                if(y>=document.getElementById(documentcanvas[a].id).offsetTop && y<=(document.getElementById(documentcanvas[a].id).offsetTop+document.getElementById(documentcanvas[a].id).offsetHeight)){
                    var xc,yc;
                    xc=Math.round(x-document.getElementById(documentcanvas[a].id).offsetLeft);
                    yc=Math.round(y-document.getElementById(documentcanvas[a].id).offsetTop);
                    imagepreview.width=document.getElementById(documentcanvas[a].id).width;
                    imagepreview.height=document.getElementById(documentcanvas[a].id).height;
                    const ctx=imagepreview.getContext("2d"); ctx.drawImage(document.getElementById(documentcanvas[a].id),0,0);
                    const idata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height); //document.getElementById("testmessage").innerText=idata.data[Math.round(((yc)*imagepreview.width*4+xc*4)-1)]+":"+(((yc)*imagepreview.width*4+xc*4)-1);
                    if(idata.data[((yc)*imagepreview.width*4+xc*4)-1]>0){
                        xposmove=event.screenX-document.getElementById(documentcanvas[a].id).offsetLeft;
                        yposmove=event.screenY-document.getElementById(documentcanvas[a].id).offsetTop;
                        currentlayer=documentcanvas[a].id; deselectlayers();hidelayerlink();
                        if(document.getElementById("linkname"+currentlayer.slice(1,currentlayer.length)).name.length>0) showlayerlink(currentlayer.slice(1,currentlayer.length));
                        document.getElementById("layer"+currentlayer.slice(1,currentlayer.length)).classList.add("activelayer");
                        break;
                    }
                }
        } ismousedown=true;
    }
}
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 

function menushow(menu){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    ismenushowing=true;
    document.getElementById(menu).classList.remove("hide");
}
function menuhovershow(menu){
    if(ismenushowing===true){
        hidemenu(); ismenushowing=true;
        document.getElementById(menu).classList.remove("hide");
    }
}
function hidemenu(){
    var dropdowns = document.getElementsByClassName("menuitems-hide");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (!openDropdown.classList.contains('hide')) {
        openDropdown.classList.add('hide');
        ismenushowing=false;
      }
    }
}
function showopen(){document.getElementById("fileopen").click();}

function showdialog(dialog){ isdialogshowing=true;
    if(dialog==="saveas"){
        if(Documentsheight[currentdocument]>Documentswidth[currentdocument]){
            if(window.innerHeight>window.innerWidth) document.getElementById("savejpg").style.height=0.41*window.innerWidth+"px";
            else document.getElementById("savejpg").style.height=0.41*window.innerHeight+"px";
        }else if(Documentsheight[currentdocument]===Documentswidth[currentdocument]){ 
            if(window.innerHeight>window.innerWidth) document.getElementById("savejpg").style.height=0.37*window.innerWidth+"px";
            else document.getElementById("savejpg").style.height=0.37*window.innerHeight+"px";
        }else{ 
            if(window.innerHeight>window.innerWidth) document.getElementById("savejpg").style.height=0.41*window.innerWidth+"px";
            else document.getElementById("savejpg").style.height=0.41*window.innerHeight+"px";
        }
        showsliderpercent('saveasjpgslider','%'); previewjpg();
    }  
    document.getElementById(dialog).classList.remove("hide");
}
function hidedialog(dialog){
    isdialogshowing=false; document.getElementById(dialog).classList.add("hide");
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
// MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!! 
// MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!! 
// MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!! 
// MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!!  MENU OPTION FUNCTIONS END !!! 

function mousedown(event){ xpos=event.layerX; ypos=event.layerY; isdialogmousedown=true; }
function mousedowntransform(event,action){
    if(action==="main"){
        ismousedown=true;
        if(isspacebardown){
            document.getElementById("transform").style.cursor="grabbing";
            var layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected")layers.pop();
            if(layers.length>1){
                var top=document.getElementById("D"+layers[0]).offsetTop,left=document.getElementById("D"+layers[0]).offsetLeft;
                for(var a=1;a<layers.length;a++){
                    if(top>document.getElementById("D"+layers[a]).offsetTop)top=document.getElementById("D"+layers[a]).offsetTop;
                    if(left>document.getElementById("D"+layers[a]).offsetLeft)left=document.getElementById("D"+layers[a]).offsetLeft;
                }
                xpos=event.clientX-document.getElementById("transform").offsetLeft+left;
                ypos=event.clientY-document.getElementById("transform").offsetTop+top-(document.getElementById("menu").offsetHeight+document.getElementById("tooloptions").offsetHeight+document.getElementById("projecttitle").offsetHeight);      
            }else{
                xpos=event.clientX-document.getElementById("transform").offsetLeft+document.getElementById(currentlayer).offsetLeft;
                ypos=event.clientY-document.getElementById("transform").offsetTop+document.getElementById(currentlayer).offsetTop-(document.getElementById("menu").offsetHeight+document.getElementById("tooloptions").offsetHeight+document.getElementById("projecttitle").offsetHeight);      
            }
        }else{     
        xposmove=event.screenX-document.getElementById("transform").offsetLeft+document.getElementById("doc"+currentdocument).offsetLeft;
        yposmove=event.screenY-document.getElementById("transform").offsetTop+document.getElementById("doc"+currentdocument).offsetTop;
        }
    }else {
        trimleft=document.getElementById(currentlayer).offsetLeft; trimtop=document.getElementById(currentlayer).offsetTop;
        trimwidth=document.getElementById(currentlayer).width; trimheight=document.getElementById(currentlayer).height;
        if(!istransformactive){
            istransformactive=true;
            document.getElementById("tgl").style.backgroundColor="blue";document.getElementById("tgr").style.backgroundColor="blue";document.getElementById("tgrt").style.backgroundColor="black";
            document.getElementById("tgt").style.backgroundColor="blue";document.getElementById("tgb").style.backgroundColor="blue";document.getElementById("tgrd").style.backgroundColor="black";
            transformleft=document.getElementById(currentlayer).offsetLeft; transformtop=document.getElementById(currentlayer).offsetTop;
            const ctx=imagepreview.getContext("2d"); imagepreview.width=trimwidth;imagepreview.height=trimheight;
            ctx.drawImage(document.getElementById(currentlayer),0,0);
            img7.src=imagepreview.toDataURL("image/png");
            document.getElementById("transformapplycancel").classList.remove("hide");
        }
        if(action==="right" || action==="left"){document.getElementById("transform").style.cursor="e-resize";}
        else if(action==="rightdown"){document.getElementById("transform").style.cursor="se-resize";}
        else if(action==="rotate") document.getElementById("transform").style.cursor="grab";
        else document.getElementById("transform").style.cursor="n-resize";
        isscalemousedown=true;tempstring=action;
    }
}
function mousemove(event,dialogbox){
    if(isdialogmousedown){
         var y=event.clientY-ypos; if(y<0)y=0;
        document.getElementById(dialogbox).style.top=y+"px";
        document.getElementById(dialogbox).style.left=event.clientX-xpos+"px";
    }
}
function canvasmouseup(event,object){
    if(currenttool==="tmove"){
        if(!iscanvasmoved && iscanvasmousedown){
            if(!isctrldown){ hidelayerlink();
            selectlayer(tempcanvas.slice(1,tempcanvas.length));currentlayer=tempcanvas; 
            }else{
                if(!document.getElementById("layer"+object.slice(1,object.length)).classList.contains("activelayer")){
                currentlayer=object;
                selectlayer(object.slice(1,object.length));
                }else{
                    document.getElementById("layer"+object.slice(1,object.length)).classList.remove("activelayer");
                    if(!ismultilayerselected()) currentlayer=getcurrentlayer();
                    else currentlayer="multi";
                } 
            }
        }
    }
}
function canvasmousemove(event,object){
    if(currenttool==="tmove" && ismousedown && tempcanvas!=""){ 
        if(!isctrldown){
            if(!ismultilayerselected()) { //var layer=tempcanvas.slice(1,tempcanvas.length); //console.log(tempcanvas)
                currentlayer=tempcanvas; deselectlayers();hidelayerlink();
                document.getElementById("layer"+tempcanvas.slice(1,tempcanvas.length)).classList.add("activelayer");
                if(document.getElementById("linkname"+tempcanvas.slice(1,tempcanvas.length)).name.length>0)showlayerlink(tempcanvas.slice(1,tempcanvas.length));
            }else {
                if(currentlayer!=tempcanvas){
                    var layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected")layers.pop();
                    var istempcanvasselected=false;
                    for(var a=0;a<layers.length;a++)if(layers[a]===tempcanvas.slice(1,tempcanvas.length)){ istempcanvasselected=true;break;}
                    if(!istempcanvasselected){
                        deselectlayers();hidelayerlink(); currentlayer=tempcanvas;
                        document.getElementById("layer"+tempcanvas.slice(1,tempcanvas.length)).classList.add("activelayer");
                        if(document.getElementById("linkname"+tempcanvas.slice(1,tempcanvas.length)).name.length>0)showlayerlink(tempcanvas.slice(1,tempcanvas.length));
                    }else currentlayer=tempcanvas;
                }
            }
        }else{
            currentlayer=tempcanvas;
            document.getElementById("layer"+tempcanvas.slice(1,tempcanvas.length)).classList.add("activelayer");
            if(document.getElementById("linkname"+tempcanvas.slice(1,tempcanvas.length)).name.length>0)showlayerlink(tempcanvas.slice(1,tempcanvas.length));
            if(istransformchecked){
                var layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected")layers.pop();
                if(layers.length>1){
                    var top=document.getElementById("D"+layers[0]).offsetTop,left=document.getElementById("D"+layers[0]).offsetLeft;
                    for(var a=1;a<layers.length;a++){
                        if(top>document.getElementById("D"+layers[a]).offsetTop)top=document.getElementById("D"+layers[a]).offsetTop;
                        if(left>document.getElementById("D"+layers[a]).offsetLeft)left=document.getElementById("D"+layers[a]).offsetLeft;
                    }
                    xposmove=event.screenX-left; yposmove=event.screenY-top;
                }
            }
        }
        tempcanvas=""; showtransform();
    }
}
function pagemousemove(event){
    var object="doc"+currentdocument;
    if(ismousedown && (isspacebardown || currenttool==="thand")){
            var y=event.clientY-ypos-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
            var x=event.clientX-xpos; 
            document.getElementById("testmessage").innerText=document.getElementById("transform").offsetLeft+":"+document.getElementById("doc"+currentdocument).offsetLeft
            //if project window goes off bound retain 10% of its height/width within working space area **if it goes negative
            if(x<(-document.getElementById(object).offsetWidth+50)) x=-document.getElementById(object).offsetWidth+50;
            if(y<(-document.getElementById(object).offsetHeight+50)) y=-document.getElementById(object).offsetHeight+50;
            if(x>((window.innerWidth*82/100)-50)) x=(window.innerWidth*82/100)-50;
            if(y>((window.innerHeight*93/100)-50)) y=(window.innerHeight*93/100)-50;
            document.getElementById(object).style.top=y+"px"; document.getElementById(object).style.left=x+"px"; 
            showtransform();
    }
}
function projectmousedown(event){ if(currenttool==="tmove" && event.target.id==="projects" && !istransformactive){deselectlayers(); currentlayer="none"; hidetransform();}}
function swapheightwidth(){
    var a=document.getElementById("newheight").value;
    document.getElementById("newheight").value=document.getElementById("newwidth").value;
    document.getElementById("newwidth").value=a;
}
function validatenumber(element,defaultvalue){ if(!(document.getElementById(element).value*1)>=1) document.getElementById(element).value=defaultvalue*1; }
function drawpreview(){
try{
    if(!ismultilayerselected() && currentlayer!="none"){
    const canvas1=document.createElement("canvas");
    canvas1.height=Documentsheight[currentdocument];
    canvas1.width=Documentswidth[currentdocument];
    const ctx1=canvas1.getContext("2d");
    const img=document.getElementById(currentlayer);
    ctx1.drawImage(img,0,0,img.width,img.height,img.offsetLeft,img.offsetTop,img.width,img.height);
    const img1=new Image();
    img1.src=canvas1.toDataURL("image/png");
    
    const canvas2=document.createElement("canvas");
    const ctx2=canvas2.getContext("2d");
    canvas2.height=document.getElementById("preview"+currentlayer.slice(1,currentlayer.length)).offsetHeight;
    canvas2.width=document.getElementById("preview"+currentlayer.slice(1,currentlayer.length)).offsetWidth;
    ctx2.drawImage(img1,0,0,canvas1.width,canvas1.height,0,0,canvas2.width,canvas2.height);
    const img2=new Image();
    img2.src=canvas2.toDataURL("image/png");

    document.getElementById("preview"+currentlayer.slice(1,currentlayer.length)).src=img2.src;
    }
    }catch(err){console.error("Error from Drawpreview() function:"+err);}
}
function generatepreview(){
    const canvas=document.createElement("canvas");
    canvas.height=Documentsheight[currentdocument];
    canvas.width=Documentswidth[currentdocument];
    const ctx=canvas.getContext("2d");
        imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
    
        const documentcurrent=document.getElementById("doc"+currentdocument).childNodes;
        for(var a=0;a<documentcurrent.length;a++){
        if(!islayerhidden(documentcurrent[a].id.slice(1,documentcurrent[a].id.length))){
            var tmpcanvas=documentcurrent[a];
            ctx.drawImage(tmpcanvas,0,0,tmpcanvas.width,tmpcanvas.height,tmpcanvas.offsetLeft,tmpcanvas.offsetTop,tmpcanvas.width,tmpcanvas.height);

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
}
function previewjpg(){
    generatepreview();
    const canvas=document.createElement("canvas");
    canvas.height=Documentsheight[currentdocument];
    canvas.width=Documentswidth[currentdocument];
    const ctx=canvas.getContext("2d");
    ctx.putImageData(imageData,0,0);
    var data=canvas.toDataURL("image/jpeg",document.getElementById("saveasjpgslider").value*1/100);
    document.getElementById("savejpg").src=data;
    
    canvas.toBlob((blob) =>{
        var size=blob.size/1024;
        if(size>1024){
            size=size/1024;
            var sizestring=Math.floor(size)+".";
            if(size.toString().slice(sizestring.length,sizestring.length+2)==="") sizestring+="0";
            else sizestring+=size.toString().slice(sizestring.length,sizestring.length+2);
            document.getElementById("previewjpgfs").innerText="File Size: "+sizestring+" MB";
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
function showsliderpercent(sliderid,suffix){
    if(sliderid==="buckettooltransparentslider")document.getElementById("bucketcolorshow").style.border="1.6vh solid rgba("+HextoRGB(document.getElementById("forecolor").value,'R')+","+HextoRGB(document.getElementById("forecolor").value,'G')+","+HextoRGB(document.getElementById("forecolor").value,'B')+","+document.getElementById("buckettooltransparentslider").value/100+")";
    document.getElementById(sliderid+"pc").innerText= document.getElementById(sliderid).value+suffix;
}

function titledmouseup(event,id){
    document.getElementById("title"+id).style.backgroundColor="rgb(50,50,50)";
    document.getElementById("title"+id).style.cursor="default";
    if(istitledrop){
        var layers=[],draggedlayers=[]; layers=getselectedlayers(); var copyfrom=currentdocument;
        showdocument(id);
        if(layers.length>0){
            if(layers[layers.length-1]==="allselected")layers.pop();
            for(var a=0;a<layers.length;a++){
                //document.getElementById(currentlayer).src=
                const ctx1=imagepreview.getContext("2d");
                imagepreview.width=document.getElementById("D"+layers[a]).width;imagepreview.height=document.getElementById("D"+layers[a]).height;
                ctx1.drawImage(document.getElementById("D"+layers[a]),0,0);
                newlayer(); 
                draggedlayers.push(currentlayer);
                document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
                //document.getElementById(currentlayer).style.top=trimtop+"px";document.getElementById(currentlayer).style.left=trimleft+"px";
           }
           if(layers.length>1){
            for(var a=0;a<layers.length;a++) document.getElementById("layer"+draggedlayers[a].slice(1,draggedlayers[a].length)).classList.add("activelayer");
            currentlayer="multi";
           }
           showtransform();
        }
        istitledrop=false;
    }
}

function titledmouseleave(event,id){
    if(id!=currentdocument){
        document.getElementById("title"+id).style.backgroundColor="rgb(50,50,50)";
        istitledrop=false;
    }

}

function titledmouseover(event,id){
    if(id!=currentdocument){
        document.getElementById("title"+id).style.backgroundColor="rgb(115,115,115)";
        if(ismousedown){
            istitledrop=true;
            document.getElementById("title"+id).style.cursor="url('public/img/cursorcopy.png'),grabbing";
        }else document.getElementById("title"+id).style.cursor="pointer";
    }
}

function createdocument(nwidth,nheight,filename,filesrc){
    if(nwidth>1){
        var height=nheight,width=nwidth;
        var top,left;
        var previewimageheight=window.innerHeight*4/100,previewimagewidth;
        if(height===width) previewimagewidth=previewimageheight; else previewimagewidth=(width/height)*previewimageheight;
        top=(window.innerHeight-document.getElementById("tooloptions").offsetHeight*2)/2-height/2;
        left=(window.innerWidth-document.getElementById("layerbox").offsetWidth)/2-width/2;
        tempstring=documentsccount;
        document.getElementById("projecttitle").innerHTML=document.getElementById("projecttitle").innerHTML+"<div id='title"+documentsccount+"' class='documenttitle' onmouseup='titledmouseup(event,"+documentsccount+")' onmouseover='titledmouseover(event,"+documentsccount+")' onmouseleave='titledmouseleave(event,"+documentsccount+")'><div style='overflow:hidden;text-wrap:nowrap;width:10vw;height:92%;margin:4% 0 4%;' onclick='showdocument("+tempstring+")'>&nbsp;New Project</div><div class='closebtn'><a onclick='checksaved("+tempstring+")'>X</a></div></div>";
        tempstring="'"+"D"+documentsccount+"1"+"'";
        document.getElementById("projects").innerHTML=document.getElementById("projects").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='clip-path:inset(0px);width:"+width+"px;height:"+height+"px;top:"+top+"px;left:"+left+"px' onmousedown="+String.fromCharCode(34)+"pagemousedown(event,'doc"+documentsccount+"')"+String.fromCharCode(34)+"><img draggable='false' class='canvass' id='D"+documentsccount+"1' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tempstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tempstring+")"+String.fromCharCode(34)+"/></div>";
        document.getElementById("layerbox").innerHTML+="<div id='layerbox"+documentsccount+"'><div id='layerdock"+documentsccount+"' class='layerbox'><div id='layer"+documentsccount+"1' class='layer activelayer layerdrag' oncontextmenu='showlayermenu(event)' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'  onmousemove="+String.fromCharCode(34)+"activatelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"layermouseup(event,'"+documentsccount+"1')"+String.fromCharCode(34)+"><div><img id='eye"+documentsccount+"1' src='./public/img/eye.svg' onmousedown="+String.fromCharCode(34)+"hidelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+documentsccount+"1' src='' class='layerpreview layerdrag' style='height:"+previewimageheight+"px;width:"+previewimagewidth+"px;'></div><div><img id='link"+documentsccount+"1' src='' class='layerlink layerdrag'><input type='text' hidden value='' id='linkname"+documentsccount+"1'></div><div id='name"+documentsccount+"1' class='layername layerdrag'>Layer 1</div></div></div></div>";
        document.getElementById("historybox").innerHTML+='<div id="historybox'+documentsccount+'"><div id="historydock'+documentsccount+'" class="historybox"><div id="history'+documentsccount+'0" class="history"><div><img id="historycheckbox'+documentsccount+'0" src="./public/img/document-outline.svg" onmousedown="" class="historyeye"></div><div class="historyname" onclick="undokindex(0)">File Open '+filename+'</div></div></div></div>';
        Documentsheight.push(height); Documentswidth.push(width); Documentsdpi.push(72);
        undo[documentsccount]=new Array();
        const newdoc=new Object(); newdoc.name="File open"; newdoc.fileurl=filesrc;
        undo[documentsccount].push(newdoc);   
    }else{
    hidedialog('new');
    var height=document.getElementById("newheight").value; width=document.getElementById("newwidth").value;
    var top,left;
    var previewimageheight=window.innerHeight*4/100,previewimagewidth;
    if(height===width) previewimagewidth=previewimageheight; else previewimagewidth=(width/height)*previewimageheight;
    top=(window.innerHeight-document.getElementById("tooloptions").offsetHeight*2)/2-height/2;
    left=(window.innerWidth-document.getElementById("layerbox").offsetWidth)/2-width/2;
    tempstring=documentsccount;
    document.getElementById("projecttitle").innerHTML=document.getElementById("projecttitle").innerHTML+"<div id='title"+documentsccount+"' class='documenttitle'  onmouseup='titledmouseup(event,"+documentsccount+")' onmouseover='titledmouseover(event,"+documentsccount+")' onmouseleave='titledmouseleave(event,"+documentsccount+")'><div style='overflow:hidden;text-wrap:nowrap;width:10vw;height:92%;margin:4% 0 4%;' onclick='showdocument("+tempstring+")'>&nbsp;New Project</div><div class='closebtn'><a onclick='checksaved("+tempstring+")'>X</a></div></div>";
    tempstring="'"+"D"+documentsccount+"1"+"'";
    document.getElementById("projects").innerHTML=document.getElementById("projects").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='clip-path:inset(0px);width:"+width+"px;height:"+height+"px;top:"+top+"px;left:"+left+"px' onmousedown="+String.fromCharCode(34)+"pagemousedown(event,'doc"+documentsccount+"')"+String.fromCharCode(34)+"><img draggable='false' class='canvass' id='D"+documentsccount+"1' height='0px' width='0px' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tempstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tempstring+")"+String.fromCharCode(34)+"/></div>";
    document.getElementById("layerbox").innerHTML+="<div id='layerbox"+documentsccount+"'><div id='layerdock"+documentsccount+"' class='layerbox'><div id='layer"+documentsccount+"1' class='layer activelayer layerdrag' oncontextmenu='showlayermenu(event)' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'  onmousemove="+String.fromCharCode(34)+"activatelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"layermouseup(event,'"+documentsccount+"1')"+String.fromCharCode(34)+"><div><img id='eye"+documentsccount+"1' src='./public/img/eye.svg' onmousedown="+String.fromCharCode(34)+"hidelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+documentsccount+"1' src='' class='layerpreview layerdrag' style='height:"+previewimageheight+"px;width:"+previewimagewidth+"px;'></div><div><img id='link"+documentsccount+"1' src='' class='layerlink layerdrag'><input type='text' hidden value='' id='linkname"+documentsccount+"1'></div><div id='name"+documentsccount+"1' class='layername layerdrag'>Layer 1</div></div></div></div>";
    document.getElementById("historybox").innerHTML+='<div id="historybox'+documentsccount+'"><div id="historydock'+documentsccount+'" class="historybox"><div id="history'+documentsccount+'0" class="history"><div><img id="historycheckbox'+documentsccount+'0" src="./public/img/document-outline.svg" onmousedown="" class="historyeye"></div><div class="historyname" onclick="undokindex(0)">New Document</div></div></div></div>';
    Documentsheight.push(height);Documentswidth.push(width); Documentsdpi.push(document.getElementById("newdpi").value);
    undo[documentsccount]=new Array();
    const newdoc=new Object(); newdoc.name="New Document"; newdoc.height=height; newdoc.width=width; newdoc.backgroundColor="#000000";
    undo[documentsccount].push(newdoc);
    }
    currentlayer="D"+documentsccount+"1";
    DocumentsLayerCount.push(1);
    actualdoccount+=1;
    isdocumentsaved.push(false);
    showdocument(documentsccount);documentsccount+=1;
}
function openfile(){
    for(var a=0;a<document.getElementById("fileopen").files.length;a++){
        const img=document.createElement("img");
        img.src=URL.createObjectURL(document.getElementById("fileopen").files[a]);
        const filename=document.getElementById("fileopen").files[a].name;
        img.onload=function(){
        createdocument(img.width,img.height,filename,img.src);
        imagepreview.width=img.width; imagepreview.height=img.height;
        imagepreview.getContext("2d").drawImage(img,0,0);
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
        drawpreview();
        }
    }
}
function save(filetype,percent,filename){
    isdocumentsaved[currentdocument]=true;
    //var img=new Image(); //var imagefile=document.getElementById("D"+currentdocument+""+1).toDataURL('image/jpeg',1);// high quality ('image/jpeg',0.5);//medium quality
    //var imagefile3=document.getElementById("D"+currentdocument+""+1).toDataURL('image/jpeg',0.1);// low quality //img.src=imagefile; document.getElementById("tmpimg").style.backgroundImage="url('"+imagefile+"')"; //document.getElementById("tmpimg1").src=img.src;
    const canvas=document.createElement("canvas");
    canvas.height=Documentsheight[currentdocument];
    canvas.width=Documentswidth[currentdocument];
    const ctx=canvas.getContext("2d");
    var imageData=ctx.getImageData(0,0,canvas.width,canvas.height);

    const documentcurrent=document.getElementById("doc"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++){
    if(!islayerhidden(documentcurrent[a].id.slice(1,documentcurrent[a].id.length))){
        var tmpcanvas=documentcurrent[a];
        ctx.drawImage(tmpcanvas,0,0,tmpcanvas.width,tmpcanvas.height,tmpcanvas.offsetLeft,tmpcanvas.offsetTop,tmpcanvas.width,tmpcanvas.height);

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
function closedocument(option){
    actualdoccount-=1;
    document.getElementById("closingdocument").classList.add("hide");
    if(option==="1"){ document.getElementById("title"+tempstring).remove(); document.getElementById("doc"+tempstring).remove(); document.getElementById("layerbox"+tempstring).remove(); DocumentsLayerCount[tempstring]=0;}
    else{
    document.getElementById("title"+currentdocument).remove();
    document.getElementById("doc"+currentdocument).remove();
    document.getElementById("layerbox"+currentdocument).remove();
    document.getElementById("historybox"+currentdocument).remove();
    DocumentsLayerCount[currentdocument]=0;
    }
    if(actualdoccount>0){
        for (var a=0;a<DocumentsLayerCount.length;a++){if(DocumentsLayerCount[a]>0){showdocument(a); break;} }
    }else initialise();
}
function saveandclose(){
    save(); closedocument('1');    
}
function checksaved(doc){
    if(isdocumentsaved[doc]){ closedocument();}else{ tempstring=doc; document.getElementById("closingdocument").classList.remove("hide"); }
}
function showdocument(doc){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    if(DocumentsLayerCount[currentdocument]>0){
        document.getElementById("title"+currentdocument).classList.remove("titleborder");
        document.getElementById("doc"+currentdocument).classList.add("hide");
        document.getElementById("layerbox"+currentdocument).classList.add("hide");
        document.getElementById("historybox"+currentdocument).classList.add("hide");}

    currentdocument=doc;
    document.getElementById("title"+doc).classList.add("titleborder"); document.getElementById("doc"+doc).classList.remove("hide");
    document.getElementById("layerbox"+doc).classList.remove("hide");document.getElementById("historybox"+currentdocument).classList.remove("hide");
    currentlayer=getcurrentlayer(); if(currenttool==="tmove")showtransform(); else hidetransform();
}

//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
// MOVE TOOL FUNCTIONS //
function hidetransform(){document.getElementById("transform").classList.add("hide");}

function canceltransform(){
    document.getElementById(currentlayer).width=img7.width; document.getElementById(currentlayer).height=img7.height;
    document.getElementById(currentlayer).style.left=transformleft+"px"; document.getElementById(currentlayer).style.top=transformtop+"px";
    imagepreview.width=img7.width;imagepreview.height=img7.height;
    const ctx=imagepreview.getContext("2d");
    ctx.drawImage(img7,0,0);//,img7.width,img7.height);//,0,0,img7.width,img7.height);
    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    showtransform(); applytransform();
}

function applytransform(){
    document.getElementById("tgl").style.backgroundColor="white";document.getElementById("tgr").style.backgroundColor="white";document.getElementById("tgrt").style.backgroundColor="white";
    document.getElementById("tgt").style.backgroundColor="white";document.getElementById("tgb").style.backgroundColor="white";document.getElementById("tgrd").style.backgroundColor="white";
    document.getElementById("transformapplycancel").classList.add("hide"); istransformactive=false; 
    document.getElementById("applytransform").classList.add("hide");
}

function showtransform(){
    if(istransformchecked){          
        if(ismultilayerselected()){ var top,left,width,height;
            var layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected")layers.pop();
            
            top=document.getElementById("D"+layers[0]).offsetTop;left=document.getElementById("D"+layers[0]).offsetLeft;
            width=document.getElementById("D"+layers[0]).offsetWidth+left;height=document.getElementById("D"+layers[0]).offsetHeight+top;
            for(var a=0;a<layers.length;a++){
            if(document.getElementById("D"+layers[a]).width!=0 && !islayerhidden(layers[a])){
                if(document.getElementById("D"+layers[a]).offsetLeft<left)left=document.getElementById("D"+layers[a]).offsetLeft;
                if(document.getElementById("D"+layers[a]).offsetTop<top)top=document.getElementById("D"+layers[a]).offsetTop;
                if(width<(document.getElementById("D"+layers[a]).offsetWidth+document.getElementById("D"+layers[a]).offsetLeft))width=document.getElementById("D"+layers[a]).offsetWidth+document.getElementById("D"+layers[a]).offsetLeft;
                if(height<(document.getElementById("D"+layers[a]).offsetHeight+document.getElementById("D"+layers[a]).offsetTop))height=(document.getElementById("D"+layers[a]).offsetHeight+document.getElementById("D"+layers[a]).offsetTop);
                
                }
            }
            document.getElementById("transform").classList.remove("hide");
            document.getElementById("transform").style.top=top+document.getElementById("doc"+currentdocument).offsetTop-1+"px"; document.getElementById("transform").style.left=left+document.getElementById("doc"+currentdocument).offsetLeft-1+"px";
            document.getElementById("transformgrid").style.width=width-left-2+"px"; document.getElementById("transformgrid").style.height=height-top-1+"px";
        }else{
            if(currentlayer!="none")
            if(document.getElementById(currentlayer).width!=0 && !islayerhidden(currentlayer.slice(1,currentlayer.length))){
            document.getElementById("transform").classList.remove("hide");
            document.getElementById("transform").style.top=document.getElementById(currentlayer).offsetTop+document.getElementById("doc"+currentdocument).offsetTop-1+"px";
            document.getElementById("transform").style.left=document.getElementById(currentlayer).offsetLeft+document.getElementById("doc"+currentdocument).offsetLeft-1+"px";
            
            document.getElementById("transformgrid").style.width=document.getElementById(currentlayer).offsetWidth-2+"px";
            document.getElementById("transformgrid").style.height=document.getElementById(currentlayer).offsetHeight-1+"px";
            }else hidetransform();
        }
    }
}
function toggletransfrom(element){
    if(document.getElementById(element).checked){istransformchecked=true; showtransform();}
    else{
        if(istransformactive){document.getElementById("applytransform").classList.remove("hide");}
        hidetransform(); istransformchecked=false;
    }
}
function alignlayershorizontal(align){
    if(ismultilayerselected()){
        if(align==="right"){
            var layers=getselectedlayers(),temp,right=document.getElementById("D"+layers[0]).style.left.slice(0,document.getElementById("D"+layers[0]).style.left.length-2)*1+document.getElementById("D"+layers[0]).width;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1+document.getElementById("D"+layers[a]).width;
                if(temp>right)right=temp;
             }
             for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.left=right-document.getElementById("D"+layers[a]).width+"px";
             }
        }else if(align==="center"){
            var layers=getselectedlayers(),temp;
            var right=document.getElementById("D"+layers[0]).style.left.slice(0,document.getElementById("D"+layers[0]).style.left.length-2)*1+document.getElementById("D"+layers[0]).width;
            var left=document.getElementById("D"+layers[0]).style.left.slice(0,document.getElementById("D"+layers[0]).style.left.length-2)*1;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1+document.getElementById("D"+layers[a]).width;
                if(temp>right)right=temp;
                temp=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1;
                if(temp<left)left=temp;
             }
             right=(right+left)/2;
             for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.left=right-(document.getElementById("D"+layers[a]).width/2)+"px";
             }
        }else if(align==="gap"){
            var layers=getselectedlayers(),temp,right=document.getElementById("D"+layers[0]).style.left.slice(0,document.getElementById("D"+layers[0]).style.left.length-2)*1;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1;
                if(temp<right)right=temp;
             }
             document.getElementById("D"+layers[0]).style.left=right+"px";
             right+=document.getElementById("D"+layers[0]).width+document.getElementById("movetoolx").value*1;
             for(var a=1;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.left=right+"px";
                right+=document.getElementById("D"+layers[a]).width+document.getElementById("movetoolx").value*1;
             }
        }else{
            var layers=getselectedlayers(),temp,right=document.getElementById("D"+layers[0]).style.left.slice(0,document.getElementById("D"+layers[0]).style.left.length-2)*1;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1;
                if(temp<right)right=temp;
             }
             for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.left=right+"px";
             }
        }
        showtransform();
    }else showmessage("Select multiple layers to align.")
}
function alignlayersvertical(align){
    if(ismultilayerselected()){
        if(align==="top"){
            var layers=getselectedlayers(),temp,right=document.getElementById("D"+layers[0]).style.top.slice(0,document.getElementById("D"+layers[0]).style.top.length-2)*1;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1;
                if(temp<right)right=temp;
             }
             for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.top=right+"px";
             }
        }else if(align==="center"){
            var layers=getselectedlayers(),temp;
            var right=document.getElementById("D"+layers[0]).style.top.slice(0,document.getElementById("D"+layers[0]).style.top.length-2)*1+document.getElementById("D"+layers[0]).height;
            var left=document.getElementById("D"+layers[0]).style.top.slice(0,document.getElementById("D"+layers[0]).style.top.length-2)*1;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1+document.getElementById("D"+layers[a]).height;
                if(temp>right)right=temp;
                temp=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1;
                if(temp<left)left=temp;
             }
             right=(right+left)/2;
             for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.top=right-(document.getElementById("D"+layers[a]).height/2)+"px";
             }
        }else if(align==="gap"){
            var layers=getselectedlayers(),temp,right=document.getElementById("D"+layers[0]).style.top.slice(0,document.getElementById("D"+layers[0]).style.top.length-2)*1;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1;
                if(temp<right)right=temp;
             }
             document.getElementById("D"+layers[0]).style.top=right+"px";
             right+=document.getElementById("D"+layers[0]).height+document.getElementById("movetooly").value*1;
             for(var a=1;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.top=right+"px";
                right+=document.getElementById("D"+layers[a]).height+document.getElementById("movetooly").value*1;
             }
        }else{
            var layers=getselectedlayers(),temp,right=document.getElementById("D"+layers[0]).style.top.slice(0,document.getElementById("D"+layers[0]).style.top.length-2)*1+document.getElementById("D"+layers[0]).height;
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=1;a<layers.length;a++){
                temp=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1+document.getElementById("D"+layers[a]).height;
                if(temp>right)right=temp;
             }
             for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.top=right-document.getElementById("D"+layers[a]).height+"px";
             }
        }
        showtransform();
    }else showmessage("Select multiple layers to align.")
}
// MOVE TOOL FUNCTIONS END //


// Shape TOOL FUNCTIONS start //
function showshapetoolmenu(element){
    document.getElementById(element).classList.remove("hide");
    document.getElementById(element).style.top=document.getElementById("tools").offsetTop+"px";
    document.getElementById(element).style.left=document.getElementById("shapetoollist").offsetLeft+40+"px";
}
function changeshape(id,code){
    if(id!="s"){
            currentshape=id;
            document.getElementById("shapetoollist").innerHTML=document.getElementById("shapetoollist"+code).innerHTML+'&nbsp;<img src="./public/img/carot-right.svg" class="caretright dropmenu" style="margin: 0;transform: rotate(90deg);"/>';
    }
}

// Shape TOOL FUNCTIONS END //

function setcolor(id1,id2){
    document.getElementById(id1).style.backgroundColor=document.getElementById(id2).value;
    if(id2==="forecolor") document.getElementById("bucketcolorshow").style.border="1.6vh solid rgba("+HextoRGB(document.getElementById("forecolor").value,'R')+","+HextoRGB(document.getElementById("forecolor").value,'G')+","+HextoRGB(document.getElementById("forecolor").value,'B')+","+document.getElementById("buckettooltransparentslider").value/100+")";
    //document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
}
function opencolorbox(id){
    document.getElementById(id).click();
}
function defaultcolor(){
    document.getElementById("backcolor").value="#000000";
    document.getElementById("forecolor").value="#ffffff";
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
    document.getElementById("bucketcolorshow").style.border="1.6vh solid rgba("+HextoRGB(document.getElementById("forecolor").value,'R')+","+HextoRGB(document.getElementById("forecolor").value,'G')+","+HextoRGB(document.getElementById("forecolor").value,'B')+","+document.getElementById("buckettooltransparentslider").value/100+")";
}
function switchcolor(){
    var color=document.getElementById("backcolor").value;
    document.getElementById("backcolor").value=document.getElementById("forecolor").value;
    document.getElementById("forecolor").value=color;
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
    document.getElementById("bucketcolorshow").style.border="1.6vh solid rgba("+HextoRGB(document.getElementById("forecolor").value,'R')+","+HextoRGB(document.getElementById("forecolor").value,'G')+","+HextoRGB(document.getElementById("forecolor").value,'B')+","+document.getElementById("buckettooltransparentslider").value/100+")";
}
function activatetool(name){ if(currenttool===name)return;
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    if(currenttool==="ttext"){
        document.getElementById("texttooldiv").classList.add("hide");
        document.getElementById("texttooloptions").classList.add("hide");
        document.getElementById("drawtextapplycancel").classList.add("hide");
        istexttoolboxactive=false;
    }
    if(currenttool==="tdrop" || currenttool==="tbucket" || currenttool==="ttext" || currenttool==="terase" || currenttool==="tbrush" || currenttool==="tcrop" || currenttool==="thand"){
        document.getElementById("doc"+currentdocument).style.cursor="default";
    }
    currenttool=name;
    deactivatetools();
    document.getElementById(currenttool).classList.add("activetool");
    if(currenttool==="tdrop"){
        generatepreview();
        document.getElementById("cursor").src="./public/img/eyedrop-outline.svg"
        document.querySelector("html").style.cursor="none";
        document.getElementById("doc"+currentdocument).style.cursor="none";
    }else if(currenttool==="tmove"){
        showtransform();
        document.getElementById("movetooloptions").classList.remove("hide");
    }else if(currenttool==="tshape"){
        document.getElementById("shapetooloptions").classList.remove("hide");
    }else if(currenttool==="tcrop"){
        document.getElementById("doc"+currentdocument).style.cursor="crosshair";
    }else if(currenttool==="ttext") {
        document.getElementById("texttooloptions").classList.remove("hide");
        document.getElementById("doc"+currentdocument).style.cursor="text";
    }else if(currenttool==="tbucket") {
        document.getElementById("buckettooloptions").classList.remove("hide");
        document.getElementById("cursor").src="./public/img/color-fill-outline.svg"
        document.getElementById("doc"+currentdocument).style.cursor="url('public/img/cursortbucket.png'),default";
    }else if(currenttool==="thand") { document.getElementById("doc"+currentdocument).style.cursor="grab";
    }

}
function deactivatetools(){
    hidetransform();
    document.getElementById("movetooloptions").classList.add("hide");
    document.getElementById("shapetooloptions").classList.add("hide");
    document.getElementById("buckettooloptions").classList.add("hide");
    document.getElementById("cursor").classList.add("hide");
    document.getElementById("eyedropcolor").classList.add("hide");
    document.querySelector("html").style.cursor="default";
    document.getElementById("tmove").classList.remove("activetool");
    document.getElementById("tblur").classList.remove("activetool");
    document.getElementById("tbrush").classList.remove("activetool");
    document.getElementById("tshape").classList.remove("activetool");
    document.getElementById("ttext").classList.remove("activetool");
    document.getElementById("tcrop").classList.remove("activetool");
    document.getElementById("tdrop").classList.remove("activetool");
    document.getElementById("terase").classList.remove("activetool");
    document.getElementById("tbucket").classList.remove("activetool");
    document.getElementById("thand").classList.remove("activetool");
}
function changetextfont(source){
    if(source==="list"){document.getElementById("texttooloptionsfsizetext").value=document.getElementById("texttooloptionsfsize").value;
    }else{
        if(document.getElementById("texttooloptionsfsizetext").value===""){
            document.getElementById("texttooloptionsfsizetext").value="1";
            document.getElementById("texttooloptionsfsizetext").select();
        }
        else if(!(document.getElementById("texttooloptionsfsizetext").value*1>0)){
        document.getElementById("texttooloptionsfsizetext").value=document.getElementById("texttooloptionsfsize").value;
        document.getElementById("texttooloptionsfsizetext").select();
        }
    }
    document.getElementById("texttool").style.color=document.getElementById("texttoolcolor").value;
    document.getElementById("texttool").style.fontFamily=document.getElementById("texttooloptionsfont").value;
    document.getElementById("texttooloptionsfont").style.fontFamily=document.getElementById("texttooloptionsfont").value;
    document.getElementById("texttooloptionsfsize").style.fontFamily=document.getElementById("texttooloptionsfont").value;
    document.getElementById("texttooloptionsfsizetext").style.fontFamily=document.getElementById("texttooloptionsfont").value;
    document.getElementById("texttool").style.fontSize=document.getElementById("texttooloptionsfsizetext").value+"px";
    document.getElementById("texttoolcolorpicker").style.backgroundColor=document.getElementById("texttoolcolor").value;
}
function opentexttoolcolor(){
    document.getElementById("texttoolcolor").click();
}
function canceldrawtext(){
    document.getElementById("drawtextapplycancel").classList.add("hide");
    document.getElementById("texttooldiv").classList.add("hide");
    istexttoolboxactive=false;
}
function drawtext(){
    istexttoolboxactive=false; var stringarray=[]; var rows=0,cols=0; stringarray.push("");

    if(document.getElementById("texttool").value.length>0){
        for(var a=0;a<document.getElementById("texttool").value.length;a++){
            if(document.getElementById("texttool").value.toString().charCodeAt(a)!=10){
                stringarray[rows]+=document.getElementById("texttool").value.toString().charAt(a);
            }else{
                if(cols<stringarray[rows].toString().length) cols=stringarray[rows].toString().length;
                stringarray.push(""); rows+=1;
            }
        }
        if(cols<stringarray[rows].toString().length) cols=stringarray[rows].toString().length;
        newlayer();
        const canvas1=imagepreview;
        const ctx1=canvas1.getContext("2d");
        canvas1.style.left=document.getElementById("texttool").offsetLeft-document.getElementById("doc"+currentdocument).offsetLeft+"px";
        canvas1.style.top=document.getElementById("texttool").offsetTop-document.getElementById("doc"+currentdocument).offsetTop+"px";
        canvas1.height=(rows+1)*document.getElementById("texttooloptionsfsizetext").value+rows;
        canvas1.width=(cols)*document.getElementById("texttooloptionsfsizetext").value;
        ctx1.font=document.getElementById("texttooloptionsfsizetext").value+"px "+document.getElementById("texttooloptionsfont").value;
        ctx1.fillStyle=document.getElementById("texttoolcolor").value;
        for(var a=0;a<=rows;a++) ctx1.fillText(stringarray[a],0,document.getElementById("texttooloptionsfsizetext").value*(a+1));

        trimimage();
        document.getElementById(currentlayer).width=canvas1.width; document.getElementById(currentlayer).height=canvas1.height;
        document.getElementById(currentlayer).style.left=document.getElementById("texttool").offsetLeft-document.getElementById("tools").offsetWidth-document.getElementById("doc"+currentdocument).offsetLeft+"px";
        document.getElementById(currentlayer).style.top=document.getElementById("texttool").offsetTop-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight-trimtop+"px";
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");//document.getElementById("drawingcanvas").toDataURL("image/png");
    }
    document.getElementById("drawtextapplycancel").classList.add("hide"); document.getElementById("texttooldiv").classList.add("hide");
}

function HextoRGB(hex,code){
    var color;
    if(code==='R'){ code=hex.slice(1,3); color=HextoDecimal(code.slice(0,1))*16+HextoDecimal(code.slice(1,2));
    }else if(code==='G'){ code=hex.slice(3,5);color=HextoDecimal(code.slice(0,1))*16+HextoDecimal(code.slice(1,2));
    }else{ code=hex.slice(5,7);color=HextoDecimal(code.slice(0,1))*16+HextoDecimal(code.slice(1,2));
    } return color;
}

function HextoDecimal(hex){ if(hex==='0')return 0; if(hex==='1')return 1; if(hex==='2')return 2; if(hex==='3')return 3; if(hex==='4')return 4; if(hex==='5')return 5; if(hex==='6')return 6; if(hex==='7')return 7; if(hex==='8')return 8; if(hex==='9')return 9; if(hex==='a')return 10; if(hex==='b')return 11; if(hex==='c')return 12; if(hex==='d')return 13; if(hex==='e')return 14; if(hex==='f')return 15;}

//^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END
//^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END
//^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END
//^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END^^^^ TOOLS FUNCTIONS END

//****  LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START */
//****  LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START */
//****  LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START */
//****  LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START LAYER FUNCTIONS START */
function getcurrentlayer(){
    var count=0; var layer="none";
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++){
            if(documentcurrent[a].classList.contains("activelayer")){
                count+=1;
                layer="D"+documentcurrent[a].id.slice(5,documentcurrent[a].id.length);
                if(count>1) {break;}
            }
        }
    if(count>1)return "multi";
    else return layer;
}
function mergelayers(){
    var layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected") layers.pop();
    if(layers.length>1){

        for(var a=0;a<layers.length;a++){ if(!islayerhidden(layers[a])){ const tmpcanvas=document.getElementById("D"+layers[a]);
            trimleft=tmpcanvas.offsetLeft; trimtop=tmpcanvas.offsetTop; trimheight=tmpcanvas.offsetHeight+tmpcanvas.offsetTop; trimwidth=tmpcanvas.offsetLeft+tmpcanvas.offsetWidth; break;
            }
        }
        for(var a=0;a<layers.length;a++){ if(!islayerhidden(layers[a])){ const tmpcanvas=document.getElementById("D"+layers[a]);
            if(trimleft>tmpcanvas.offsetLeft) trimleft=tmpcanvas.offsetLeft; 
            if(trimtop>tmpcanvas.offsetTop) trimtop=tmpcanvas.offsetTop;
            if(trimheight<tmpcanvas.offsetHeight+tmpcanvas.offsetTop) trimheight=tmpcanvas.offsetHeight+tmpcanvas.offsetTop; 
            if(trimwidth<tmpcanvas.offsetLeft+tmpcanvas.offsetWidth) trimwidth=tmpcanvas.offsetLeft+tmpcanvas.offsetWidth;
            }
        }

    imagepreview.height=trimheight-trimtop; imagepreview.width=trimwidth-trimleft;
    const ctx=imagepreview.getContext("2d");
    var imageData=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);

        for(var a=0;a<layers.length;a++){  if(document.getElementById("linkname"+layers[a]).name.length>0) unlinklayers(document.getElementById("linkname"+layers[a]).name);
            if(!islayerhidden(layers[a])){
                var tmpcanvas=document.getElementById("D"+layers[a]);
                ctx.drawImage(tmpcanvas,0,0,tmpcanvas.width,tmpcanvas.height,tmpcanvas.offsetLeft-trimleft,tmpcanvas.offsetTop-trimtop,tmpcanvas.width,tmpcanvas.height);
                const tmpimagedata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
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
            if(a<layers.length-1){ document.getElementById("D"+layers[a]).remove(); document.getElementById("layer"+layers[a]).remove(); }
        }
        ctx.putImageData(imageData,0,0); //trimimage();
        document.getElementById("D"+layers[layers.length-1]).width=imagepreview.width;document.getElementById("D"+layers[layers.length-1]).height=imagepreview.height;
        document.getElementById("D"+layers[layers.length-1]).style.left=trimleft+"px";document.getElementById("D"+layers[layers.length-1]).style.top=trimtop+"px";
        document.getElementById("D"+layers[layers.length-1]).src=imagepreview.toDataURL("image/png");
        if(islayerhidden(layers[layers.length-1]))hidelayer(layers[layers.length-1]);
        currentlayer="D"+layers[layers.length-1];
    }else showmessage("Select multiple layers to merge.");
}
function showlayermenu(event){
    event.preventDefault(); hidemenu();
    if((event.clientX+160)>window.innerWidth)document.getElementById("layermenu").style.left=window.innerWidth-160+"px";
    else document.getElementById("layermenu").style.left=event.clientX+"px";
    if((event.clientY+160)>window.innerHeight)document.getElementById("layermenu").style.top=window.innerHeight-160+"px";
    else document.getElementById("layermenu").style.top=event.clientY+"px";
    menushow('layermenu');
}
function layermouseup(event,layer){if(event.button!=2) selectlayer(layer);}

function selectlayer(layer){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    if(isctrldown){
        if(document.getElementById("layer"+layer).classList.contains("activelayer")){
            document.getElementById("layer"+layer).classList.remove("activelayer");
            hidelayerlink();
        }else {
            document.getElementById("layer"+layer).classList.add("activelayer");
            if(document.getElementById("linkname"+layer).name.length>0)showlayerlink(layer);
        }
    }else {
        deselectlayers();
        hidelayerlink();
        if(document.getElementById("linkname"+layer).name.length>0) showlayerlink(layer);
        document.getElementById("layer"+layer).classList.add("activelayer");
        currentlayer="D"+layer;
    }
    if(currenttool==="tmove")showtransform();
}
function deselectlayers(){
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++){
        documentcurrent[a].classList.remove("activelayer");
    }
}

function selectAlllayers(){
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++){
        documentcurrent[a].classList.add("activelayer"); if(document.getElementById("linkname"+documentcurrent[a].id.slice(5,documentcurrent[a].id.length)).name.length>0)showlayerlink(documentcurrent[a].id.slice(5,documentcurrent[a].id.length));
    }
}

function getselectedlayers(){
    var layers=[];
    var count=0;
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    for(var a=documentcurrent.length-1;a>=0;a--){
            count+=1;
            if(documentcurrent[a].classList.contains("activelayer")){
                layers.push(documentcurrent[a].id.slice(5,documentcurrent[a].id.length));
            }
    }
    if(count===layers.length) layers.push("allselected");

    return layers;
}
function ismultilayerselected(){
    var count=0;
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++){
            if(documentcurrent[a].classList.contains("activelayer")){
                count+=1;
                if(count>1) return true;
            }
    } return false;
}
function hidelayer(layer){
    if(document.getElementById("eye"+layer).src.toString().includes("eye.svg")){
        document.getElementById("D"+layer).classList.add("hide");
        document.getElementById("eye"+layer).src="./public/img/eye-off-sharp.svg";
    }else {
        document.getElementById("D"+layer).classList.remove("hide");
        document.getElementById("eye"+layer).src="./public/img/eye.svg";
    }showtransform();
}
function islayereditable(layer){ 
    if(currentlayer==="none" || currentlayer==="multi") return false;
    if(islayerhidden(layer)) return false;
    else return true;
}
function islayerhidden(layer){
    if(document.getElementById("eye"+layer).src.toString().includes("eye.svg"))return false;
    else return true;
}
function deletelayer(){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    if(currentlayer==="none") showmessage("Select a layer to delete.");
    else{
        var layers=getselectedlayers();
        var a=0;
        if(layers[layers.length-1]==="allselected"){
            if(document.getElementById("linkname"+layers[0]).name.length>0) unlinklayers(document.getElementById("linkname"+layers[0]).name);
            document.getElementById("layer"+layers[0]).classList.add("activelayer");
            currentlayer="D"+layers[0];
            a=1;
        for(;a<layers.length-1;a++){
            if(document.getElementById("linkname"+layers[a]).name.length>0) unlinklayers(document.getElementById("linkname"+layers[a]).name);
            document.getElementById("layer"+layers[a]).remove();
            document.getElementById("D"+layers[a]).remove();
        }
        }else{
            for(;a<layers.length;a++){
            if(document.getElementById("linkname"+layers[a]).name.length>0) unlinklayers(document.getElementById("linkname"+layers[a]).name);
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
        if(currenttool==="tmove")showtransform();
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
function gettopmostactivelayer(){
    var layers=[];
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    if(currentlayer==="none" || documentcurrent.length===1){ 
        layers.push(documentcurrent[0].id.slice(5,documentcurrent[0].id.length));
        layers.push(documentcurrent[0].id.slice(5,documentcurrent[0].id.length)); return layers;
    }
    for(var a=0;a<documentcurrent.length;a++){
            if(documentcurrent[a].classList.contains("activelayer")){ 
                layers.push(documentcurrent[a].id.slice(5,documentcurrent[a].id.length));
                if(a===0)layers.push(documentcurrent[a].id.slice(5,documentcurrent[a].id.length));
                else layers.push(documentcurrent[a].id.slice(5,documentcurrent[a].id.length));
                return layers;
            }
    }
}
function newlayer(){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    var layeractive=gettopmostactivelayer();
    deselectlayers();
    DocumentsLayerCount[currentdocument]+=1;
    var height=Documentsheight[currentdocument],width=Documentswidth[currentdocument];
    var previewimageheight=window.innerHeight*4/100,previewimagewidth;
    if(height===width) previewimagewidth=previewimageheight; else previewimagewidth=(width/height)*previewimageheight;
    var tempstring="'"+"D"+currentdocument+""+DocumentsLayerCount[currentdocument]+"'";
    document.getElementById("doc"+currentdocument).innerHTML+="<img src='' draggable='false' class='canvass' id='D"+currentdocument+""+DocumentsLayerCount[currentdocument]+"' height='0px' width='0px' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tempstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tempstring+")"+String.fromCharCode(34)+"/>";
    document.getElementById("doc"+currentdocument).insertBefore(document.getElementById("D"+currentdocument+""+DocumentsLayerCount[currentdocument]),document.getElementById("D"+layeractive[1]));
    document.getElementById("doc"+currentdocument).insertBefore(document.getElementById("D"+layeractive[1]),document.getElementById("D"+currentdocument+""+DocumentsLayerCount[currentdocument]));
    tempstring=currentdocument+""+DocumentsLayerCount[currentdocument];
    document.getElementById("layerdock"+currentdocument).innerHTML+="<div id='layer"+tempstring+"' class='layer activelayer layerdrag' oncontextmenu='showlayermenu(event)' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'  onmousemove="+String.fromCharCode(34)+"activatelayer('"+tempstring+"')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+tempstring+"')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"layermouseup(event,'"+tempstring+"')"+String.fromCharCode(34)+"><div><img id='eye"+tempstring+"' src='./public/img/eye.svg' alt='altname' onmousedown="+String.fromCharCode(34)+"hidelayer('"+tempstring+"')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+tempstring+"' src='' class='layerpreview layerdrag' style='height:"+previewimageheight+"px;width:"+previewimagewidth+"px;'></div><div><img id='link"+tempstring+"' src='' class='layerlink layerdrag'><input type='text' hidden value='' id='linkname"+tempstring+"'></div><div id='name"+tempstring+"' class='layername layerdrag'>Layer "+getnewlayername()+"</div></div>";
    document.getElementById("layerdock"+currentdocument).insertBefore(document.getElementById("layer"+tempstring),document.getElementById("layer"+layeractive[0]));
    currentlayer="D"+tempstring;
    showtransform();
}
function layerdrop(event){
    event.preventDefault();
    //const data = event.dataTransfer.getData("Text");
    document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)).style.setProperty("box-shadow","0 0");
    const layers=getselectedlayers();
    if(layers[layers.length]!="allselected")
    for(var a=(layers.length-1);a>=0;a--){
        document.getElementById("layerdock"+currentdocument).insertBefore(document.getElementById("layer"+layers[a]),document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)));
        document.getElementById("doc"+currentdocument).insertBefore(document.getElementById("D"+layers[a]),document.getElementById("D"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)));
        document.getElementById("doc"+currentdocument).insertBefore(document.getElementById("D"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)),document.getElementById("D"+layers[a]));
    }
}
function layerdragstart(event){
    event.dataTransfer.setData("Text",event.target.id);
}
function layerdragover(event){
    event.preventDefault();
    if(event.target!=undefined)
    if(event.target.matches(".layerdrag"))
    document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)).style.setProperty("box-shadow","0px 2px 10px black inset");
}
function layerdragleave(event){
    try{
    if(event.target!=undefined)
    if(event.target.matches(".layerdrag"))
    document.getElementById("layer"+event.target.id.slice(event.target.id.indexOf(""+currentdocument+""),event.target.id.length)).style.setProperty("box-shadow","0 0");
    }catch(err){
        //remove box shadow on layers if any 
        for(var a=1;a<=DocumentsLayerCount[currentdocument];a++){
            if(document.getElementById("layer"+currentdocument+""+a)!=null) document.getElementById("layer"+currentdocument+""+a).style.setProperty("box-shadow","0 0");
        }
        console.log("error:"+err);
    }
}
function getnewlayername(){
    tempstring;
    var layernum=1;
    const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++){
            tempstring=document.getElementById("name"+documentcurrent[a].id.slice(5,documentcurrent[a].id.length)).innerText;
            if(tempstring.includes("Layer ")){
                tempstring=tempstring.slice(6,tempstring.length);
                if(layernum<(tempstring*1)) layernum=tempstring*1;
            }
        
    }
    return (layernum+1);
}
function movelayercontent(x,y){
    if(currenttool==="tmove"){
        iscanvasmoved=true;
        if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
        document.getElementById(currentlayer).style.top=document.getElementById(currentlayer).style.top.slice(0,document.getElementById(currentlayer).style.top.length-2)*1+y+"px";
        document.getElementById(currentlayer).style.left=document.getElementById(currentlayer).style.left.slice(0,document.getElementById(currentlayer).style.left.length-2)*1+x+"px";
        }else{
            var layers=getselectedlayers();
            if(layers[layers.length-1]==="allselected") layers.pop();
            for(var a=0;a<layers.length;a++){
                document.getElementById("D"+layers[a]).style.top=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1+y+"px";
                document.getElementById("D"+layers[a]).style.left=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1+x+"px";
            }
        }
        showtransform();
    }
}
function unlinklayers(linkname){
    var linkedlayers=[];linkedlayers=getlinkedlayers(linkname);
    for(var a=0;a<linkedlayers.length;a++){
        document.getElementById("linkname"+linkedlayers[a]).name="";
        document.getElementById("link"+linkedlayers[a]).src="";
        }
}
function linklayers(){
    if(islayereditable(currentlayer.slice(1,currentlayer.length))){
    var layers=getselectedlayers();
    if(layers[layers.length-1]==="allselected") layers.pop();
    if(layers.length>1){
        var linkcount=0;
        for(var a=0;a<layers.length;a++) if(document.getElementById("linkname"+layers[a]).name.length>0) linkcount+=1;
        if(linkcount===layers.length){
            //unlink layers
            for(a=0;a<layers.length;a++){
                if(document.getElementById("linkname"+layers[a]).name.length>0)
                    unlinklayers(document.getElementById("linkname"+layers[a]).name);
            }
        }else{
            //link layers
                if(linkcount===1){
                    var layerlinkname,linkindex;
                    for(var a=0;a<layers.length;a++) if(document.getElementById("linkname"+layers[a]).name.length>0){ layerlinkname=document.getElementById("linkname"+layers[a]).name;linkindex=a; break;}
                    if(layerlinkname.includes("end")){
                        layerlinkname=layerlinkname.slice(3,layerlinkname.length);
                        for(var a=0;a<layers.length;a++) if(!document.getElementById("linkname"+layers[a]).name.length>0){
                            document.getElementById("linkname"+layers[linkindex]).name=layers[a]; linkindex=a;
                            document.getElementById("link"+layers[a]).src="./public/img/link.svg";
                        } document.getElementById("linkname"+layers[linkindex]).name="end"+layerlinkname;
                    }else{
                        if(layerlinkname.includes("start"))layerlinkname=layerlinkname.slice(5,layerlinkname.length);
                        var previouslayername;
                        while(!layerlinkname.includes("end")){
                            previouslayername=layerlinkname;
                            layerlinkname=document.getElementById("linkname"+layerlinkname).name;
                        }
                        layerlinkname=layerlinkname.slice(3,layerlinkname.length);
                        for(var a=0;a<layers.length;a++) if(!document.getElementById("linkname"+layers[a]).name.length>0){
                            document.getElementById("linkname"+previouslayername).name=layers[a]; previouslayername=layers[a];
                            document.getElementById("link"+layers[a]).src="./public/img/link.svg";
                        }
                        document.getElementById("linkname"+previouslayername).name="end"+layerlinkname;
                    }
                }else if(linkcount>1){ var sublinkedlayers;
                    for(var a=0;a<layers.length;a++) if(document.getElementById("linkname"+layers[a]).name.length>0)
                        sublinkedlayers=getlinkedlayers(document.getElementById("linkname"+layers[a]).name);
                        var sublinkcount=0;
                        for(var n=0;n<sublinkedlayers.length;n++)
                            for(var m=0;m<layers.length;m++)
                                if(sublinkedlayers[n]===layers[m]) sublinkcount+=1;

                        if(sublinkcount===linkcount){
                            var layerend=sublinkedlayers[sublinkedlayers.length-1];
                            for(var a=0;a<layers.length;a++) if(!document.getElementById("linkname"+layers[a]).name.length>0){
                                document.getElementById("linkname"+layerend).name=layers[a]; layerend=layers[a];
                                document.getElementById("link"+layers[a]).src="./public/img/link.svg";
                            }document.getElementById("linkname"+layerend).name="end"+sublinkedlayers[0];
                        }else{ //unlinklayers
                            for(var a=0;a<layers.length;a++) if(document.getElementById("linkname"+layers[a]).name.length>0) unlinklayers(document.getElementById("linkname"+layers[a]).name);
                        }
                    
                }else{ //linklayers
                    document.getElementById("link"+layers[0]).src="./public/img/link.svg";
                    document.getElementById("linkname"+layers[0]).name="start"+layers[1];
                    for(var a=1;a<layers.length;a++) {
                    document.getElementById("link"+layers[a]).src="./public/img/link.svg";
                    if(a===(layers.length-1)) document.getElementById("linkname"+layers[a]).name="end"+layers[0];
                    else document.getElementById("linkname"+layers[a]).name=layers[a+1];
                }

            }
        }
    }else if(document.getElementById("linkname"+layers[0]).name.length>0){
        var layers=getlinkedlayers(document.getElementById("linkname"+layers[0]).name);
        for(var a=0;a<layers.length;a++){
            document.getElementById("linkname"+layers[a]).name="";
            document.getElementById("link"+layers[a]).src="";
        }
    }else showmessage("Select multiple layers to link.");
}else showmessage("Select multiple layers to link.");
}
function getlinkedlayers(layername){
    var layers=[]; var startinglayer;
    if(layername.includes("end")) startinglayer=layername.slice(3,layername.length);
    else {
            if(layername.includes("start")) layername=layername.slice(5,layername.length);
            while(!layername.includes("end")){layername=document.getElementById("linkname"+layername).name;}
            startinglayer=layername.slice(3,layername.length);
        }
        layers.push(startinglayer); layername=document.getElementById("linkname"+startinglayer).name;
        layername=layername.slice(5,layername.length);
        while(!layername.includes("end")){
            layers.push(layername); layername=document.getElementById("linkname"+layername).name;
        }
        return layers;
}
function hidelayerlink(){
const documentcurrent=document.getElementById("layerdock"+currentdocument).childNodes;
for(var a=0;a<documentcurrent.length;a++) document.getElementById("link"+documentcurrent[a].id.slice(5,documentcurrent[a].id.length)).src="";
}
function showlayerlink(layername){
    var layers=getlinkedlayers(document.getElementById("linkname"+layername).name);
    for(var a=0;a<layers.length;a++) document.getElementById("link"+layers[a]).src="./public/img/link.svg";
}

//****  LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END */
//****  LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END */
//****  LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END */
//****  LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END LAYER FUNCTIONS END */

//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$

function keydown(event){
    console.log(event.key);
    //if(event.altKey){isAltdown=true;}
    if(event.key==="Shift") isShiftdown=true;
    if(event.ctrlKey){isctrldown=true; event.preventDefault();}
    if(event.altKey && !islayerclone)isAltdown=true;
    if(event.key==="Escape"){
        if(currenttool==="ttext"){
            document.getElementById("texttooldiv").classList.add("hide");
            document.getElementById("texttooloptions").classList.add("hide");
            istexttoolboxactive=false;
        } 
    }
    if(!istexttoolboxactive){
        if(event.key==="ArrowUp")movelayercontent(0,-1);
        if(event.key==="ArrowDown")movelayercontent(0,1);
        if(event.key==="ArrowRight")movelayercontent(1,0);
        if(event.key==="ArrowLeft")movelayercontent(-1,0);

        if(event.ctrlKey){
            if((event.key==="t" || event.key==="T") && isAltdown){
                if(currenttool==="tmove"){document.getElementById("showtransformcheckbox").checked=true; istransformchecked=true; showtransform();}
            }else if((event.key==="z" || event.key==="Z") && isShiftdown){
                undokback();cancallpreview=3;isundo=true;
            }else if((event.key==="z" || event.key==="Z")){ if(actualdoccount!=0){if(isundo){isundo=false; redok();}else{isundo=true; undok();}cancallpreview=3;}
            }else if((event.key==="i" || event.key==="I")){ showimageandfiltermenudialog('invert');
            }
        }else{
            if(event.key==="v" || event.key==="V"){
                activatetool("tmove");
            }else if(event.key==="d" || event.key==="D"){defaultcolor();
            }else if(event.key==="x" || event.key==="X"){switchcolor();
            }else if(event.key==="Delete"){
                deletelayer();
            }else if(event.key==="t" || event.key==="T"){
                activatetool("ttext");
            }else if(event.key===" " && !ismousedown && currenttool!="tdrop"){
                if(!isspacebardown){ isspacebardown=true;
                if(!ismenushowing && !isdialogshowing){ document.getElementById("doc"+currentdocument).style.cursor="grab";document.getElementById("transform").style.cursor="grab";}
                }
            }else if(event.key==="f" || event.key==="F"){ togglefullscreen();
            }
        }
    }
}
function keyup(event){
    if(event.key==="Shift")isShiftdown=false;
    if(isspacebardown){
         document.getElementById("doc"+currentdocument).style.cursor="default";
         document.getElementById("transform").style.cursor="default";
         mousedown=false;
        isspacebardown=false;
    }
    isctrldown=false; isAltdown=false;
}
function showmessage(message){
    document.getElementById("message").innerText=message;
    if(document.getElementById("message").classList.contains("hide")){
        document.getElementById("message").offsetWidth=window.innerWidth/3;
        document.getElementById("message").style.left=(window.innerWidth-window.innerWidth/2-document.getElementById("layerbox").offsetWidth)/2+"px";
        document.getElementById("message").style.top=(window.innerHeight+document.getElementById("message").offsetHeight)/2+"px";
        document.getElementById("message").classList.remove("hide");
    setTimeout(function(){
        document.getElementById("message").classList.add("hide");
    },2500);}
}

//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
//  KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$ KEY EVENTS START $$$
function test2(){
    gaussianblur2();
    /*
    const ctx1=imagepreview.getContext("2d");
    var xml=new XMLSerializer().serializeToString(document.getElementById("svg10"));
    var svg64=btoa(xml);
    var svg64star="data:image/svg+xml;charsetutf8,"+encodeURIComponent(svg64);
    var img =new Image();
    //img.src=document.getElementById("S01").src;
    img.src=svg64star;
    img.width=400;
    img.height=400;
    imagepreview.height=400; imagepreview.width=400;
    
    ctx1.rotate((Math.PI/180)*25);
    img.onload=function(){
        ctx1.drawImage(img,0,0);
    }
    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png"); */
    //trimimage1();
}
function test(){
    //const saveas= window.saveAs;

    
    /*
    const element=document.getElementById("S01").cloneNode(true);
    documentsccount[currentdocument]+=1;
    element.id="S"+currentdocument+DocumentsLayerCount[currentdocument];
    element.classList.add("canvass");
    element.style.display='';
    element.addEventListener("mousemove",function(event){canvasmousemove(event,'S'+currentdocument+DocumentsLayerCount[currentdocument])});
    element.addEventListener("mouseup",function(event){canvasmousemove(event,'S'+currentdocument+DocumentsLayerCount[currentdocument])});
    document.getElementById("doc0").insertBefore(element,document.getElementById("doc0").lastChild);
    //documents.getElementById("svg1")   */
    const canvas1=imagepreview;
    const ctx1=canvas1.getContext("2d");
    var xml=new XMLSerializer().serializeToString(document.getElementById("svg10"));
    var svg64=btoa(xml);
    var svg64star="data:image/svg+xml;base64,"+svg64;
    var img =new Image();
    img.src= svg64star;
    img.width=400;
    img.height=400;
    //document.getElementById("drawingcanvas").height=800; document.getElementById("drawingcanvas").width=800;
    
    ctx1.rotate((Math.PI/180)*25);
     
    ctx1.drawImage(img,0,0);
    document.getElementById(currentlayer).src=imagepreview.toDataURL(); //document.getElementById("drawingcanvas").toDataURL("image/png");
 
    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
             '<em>I</em> like ' + 
             '<span style="color:white; text-shadow:0 0 2px blue;">' +
             'cheese</span>' +
           '</div>' +
           '</foreignObject>' +
           '</svg>';

var DOMURL = window.URL || window.webkitURL || window;
//const ctx1=imagepreview.getContext("2d");
imagepreview.width=200;
imagepreview.height=200;
var img = new Image();
var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});//"data:image/svg+xml;base64,"+
var url = URL.createObjectURL(svg);
img.src=url;
img.onload = function () {
  ctx1.drawImage(img, 0, 0);
  DOMURL.revokeObjectURL(url);
}
//ctx1.drawImage(img, 0, 0);
1    /* test 1 starts
    const documentcurrent=document.getElementById("doc"+currentdocument).childNodes;
    for(var a=0;a<documentcurrent.length;a++) console.log(documentcurrent[a].id)
const canvas1=document.getElementById(currentlayer);
const ctx1=canvas1.getContext("2d");
//document.getElementById(currentlayer).height=document.getElementById("svg01").height;
//document.getElementById(currentlayer).width=document.getElementById("svg01").width;
//var imagedata=ctx1.getImageData(0,0,canvas1.width,canvas1.height);
ctx1.putImageData(ctx1.getImageData(0,0,canvas1.width,canvas1.height),0,0);
ctx1.scale(2,2);
//ctx1.drawImage(document.getElementById("drawtextcheckmark"),0,0,500,500,0,0,200,100);

const img=document.createElement("img");
//console.log(canvas1.toDataURL("image/png"));
//ctx1.putImageData(ctx1.getImageData(img,0,0,img.width,img.height), 10, 10);

/*
const imgData = ctx1.createImageData(canvas1.width, canvas1.height);
for (let i = 0; i < imgData.data.length; i += 4)
  {
  if(imgData.data[i+3]>0){
  imgData.data[i+0] = 255;
  imgData.data[i+1] = 0;
  imgData.data[i+2] = 0;
  }
  }
ctx1.putImageData(imgData, 10, 10); *///test 1 ends
//trimimage(currentlayer);
document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
}
function trimimage(canvaselement){
//trim image from all the corners
const canvas1=imagepreview;//drawingcanvas;
const ctx1=canvas1.getContext("2d");
var imagedata=ctx1.getImageData(0,0,canvas1.width,canvas1.height);
var top=0,left=0,bottom=0,right=0,w=3,h; //var canvasleft,canvastop; canvasleft=canvas1.style.left.slice(0,canvas1.style.left.length-2)*1; canvastop=canvas1.style.top.slice(0,canvas1.style.top.length-2)*1;
// calculating top
var istransparent=true;
    for(h=0;h<canvas1.height;h++){
        for(w=(h*4*canvas1.width)+3;w<=canvas1.width*4*(h+1);w+=4){
            if(imagedata.data[w]>0){
                istransparent=false; break;
            }
        }
        if(istransparent) top+=1;
        else {break;}
    }

    if(top===canvas1.width)throw("empty canvas");
    // calculating bottom
    istransparent=true;
    for(h=(canvas1.height-1);h>=0;h--){
        for(w=(h*4*canvas1.width)+3;w<=canvas1.width*4*(h+1);w+=4){
            if(imagedata.data[w]>0){
                istransparent=false; break;
            }
        }
        if(istransparent) bottom+=1;
        else {break;}
    }

    var idata=ctx1.getImageData(0,top,canvas1.width,(canvas1.height-top-bottom));
    canvas1.height=trimheight=canvas1.height-top-bottom;
    ctx1.putImageData(idata,0,0);
    imagedata=ctx1.getImageData(0,0,canvas1.width,canvas1.height); //ctx1.scale(2,2);
    // calculating left
    istransparent=true;
    for(w=3;w<canvas1.width*4;w+=4){
        for(h=w;h<=(canvas1.width*4*(canvas1.height-1)+w);h+=(canvas1.width*4)){
            if(imagedata.data[h]>0){
                istransparent=false; break;
            }
        }
        if(istransparent) left+=1;
        else {break;}
    }
    // calculating right
    istransparent=true;
    for(w=(canvas1.width*4-1);w>0;w-=4){
        for(h=w;h<=(canvas1.width*4*(canvas1.height-1)+w);h+=(canvas1.width*4)){
            if(imagedata.data[h]>0){
                istransparent=false; break;
            }
        }
        if(istransparent) right+=1;
        else {break;}
    }

    idata=ctx1.getImageData(left,0,(canvas1.width-left-right),canvas1.height);
    canvas1.width=trimwidth=canvas1.width-left-right;
    ctx1.putImageData(idata,0,0); //ctx1.scale(2,2); //canvas1.style.left=canvasleft+left+"px"; //canvas1.style.top=canvastop+top+"px"; //console.log(imagedata.data.length/4)ps
    trimleft=left;trimtop=top; //console.log("top="+top+"bottom="+bottom+"left="+left+"right="+right);
}

/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
var colorbalance=[0,0,0,0,0,0,0,0,0];
function showimageandfiltermenudialog(dialog){
    if(ismultilayerselected() || !islayereditable(currentlayer.slice(1,currentlayer.length))){showmessage("Layer not editable!"); return;}
    if(document.getElementById(currentlayer).width===0){showmessage("Layer not editable!"); return;}

    const img=document.getElementById(currentlayer);
    imagepreview.width=img.width; imagepreview.height=img.height;
    var ctx=imagepreview.getContext("2d");
    ctx.drawImage(img,0,0,img.width,img.height);//,img.offsetLeft,img.offsetTop,img.width,img.height); //ctx.putImageData(document.getElementById(currentlayer).getContext("2d").getImageData(0,0,imagepreview.width,imagepreview.height),0,0);
    
    if(dialog==="invert"){invertimage(); return;} 
    if(dialog==="sharp"){sharp(); return;} 
    if(dialog==="sepia"){sepia(); return;} 
    if(dialog==="greyscale"){blackandwhite(); return;}
    if(dialog==="boxblur"){ document.getElementById(dialog).classList.remove("hide"); boxblur("boxblurslider");showslidervalue('boxblurslider'); return; }//document.getElementById("boxblursliderpc").innerText="1"; document.getElementById("boxblurslider").value=1;
    if(dialog==="noiserandom"){ document.getElementById(dialog).classList.remove("hide"); noiseimage("noiserandomslider","random");showslidervalue('noiserandomslider'); return; }
    if(dialog==="noisegreyscale"){ document.getElementById(dialog).classList.remove("hide"); noiseimage("noisegreyscaleslider","greyscale");showslidervalue('noisegreyscaleslider'); return; }
    if(dialog==="noise"){ document.getElementById(dialog).classList.remove("hide"); noiseimage("noiseslider","noise");showslidervalue('noiseslider'); return; }
    if(dialog==="mosaic"){ mosaic("mosaicslider");document.getElementById(dialog).classList.remove("hide"); showslidervalue('mosaicslider'); return;} 
    if(dialog==="brightnesscontrast"){ brightnesscontrastimage("brightnessimageslider");document.getElementById(dialog).classList.remove("hide"); return;} 
    if(dialog==="colorbalance"){ colorbalanceimage(false);document.getElementById(dialog).classList.remove("hide"); return;} 
    if(dialog==="thresholdblur"){ document.getElementById(dialog).classList.remove("hide"); thresholdblur("thresholdblurslider");showslidervalue('thresholdblurslider'); showslidervalue('thresholdlimitblurslider'); return; }
    document.getElementById(dialog).classList.remove("hide");
}
function cancelimageprocess(dialog){
    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    hidedialog(dialog);
}
function applyimageprocess(dialog){
    if(dialog==="invert")createundo("imageprocess","Invert"); if(dialog==="sharp")createundo("imageprocess","Sharp"); if(dialog==="greyscale")createundo("imageprocess","Greyscale"); if(dialog==="boxblur")createundo("imageprocess","Box Blur");
    if(dialog==="noiserandom")createundo("imageprocess","Noise Random"); if(dialog==="noisegreyscale")createundo("imageprocess","Noise Greyscale"); if(dialog==="noise")createundo("imageprocess","Noise"); if(dialog==="mosaic")createundo("imageprocess","Mosaic");
    if(dialog==="brightnesscontrast")createundo("imageprocess","Brightness Contrast"); if(dialog==="colorbalance")createundo("imageprocess","Color Balance"); if(dialog==="thresholdblur")createundo("imageprocess","Threshold Blur");
    hidedialog(dialog);
}

function sepia(){
    const canvas1=document.createElement('canvas'); const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    imageData=ctx2.getImageData(0,0,canvas1.width,canvas1.height);
        for(var a=0;a<imageData.data.length;a+=4){//393 769 189 , 349 686 168 , 272 534 131
                r=imageData.data[a]*0.393+imageData.data[a+1]*0.769+imageData.data[a+2]*0.189; g=imageData.data[a]*0.349+imageData.data[a+1]*0.686+imageData.data[a+2]*0.168;  b=imageData.data[a]*0.272+imageData.data[a+1]*0.534+imageData.data[a+2]*0.131;
                imageData.data[a]=r; imageData.data[a+1]=g; imageData.data[a+2]=b;
        }
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    const img=new Image(); img.src=canvas1.toDataURL("image/png"); img.onload=()=>{ createundo("imageprocess","Sepia"); }
}

function invertimage(){
        const canvas1=document.createElement('canvas');
        const ctx1=canvas1.getContext("2d");
        canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
        const img=document.getElementById(currentlayer);
        var ctx=imagepreview.getContext("2d");
        imageData=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
        for(var a=0;a<imageData.data.length;a+=4){
            imageData.data[a]=255-imageData.data[a];
            imageData.data[a+1]=255-imageData.data[a+1];
            imageData.data[a+2]=255-imageData.data[a+2];
        }
       ctx1.putImageData(imageData,0,0); img.src=canvas1.toDataURL("image/png");
    const img2=new Image(); img2.src=canvas1.toDataURL("image/png");
    img2.onload=()=>{ createundo("imageprocess","Invert"); }

}
function brightnesscontrastimage(element,option){
    if(option && document.getElementById("brightnesscontrastpreviewcheckbox").checked){applyimageprocess("brightnesscontrast"); return;}
    if(element==="brightnessimagetbox"){
        if(!(document.getElementById(element).value<100)){
            document.getElementById(element).value=0; document.getElementById(element).select(); element="brightnessimageslider";
        } document.getElementById("brightnessimageslider").value=document.getElementById("brightnessimagetbox").value;
    }else if(element==="brightnessimageslider") document.getElementById("brightnessimagetbox").value=document.getElementById(element).value;
    else if(element==="contrastimagetbox"){
        if(!(document.getElementById(element).value<150)){
            document.getElementById(element).value=0; document.getElementById(element).select();
        }  document.getElementById("contrastimageslider").value=document.getElementById("contrastimagetbox").value;
    }else document.getElementById("contrastimagetbox").value=document.getElementById("contrastimageslider").value;

    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    if(document.getElementById("brightnesscontrastpreviewcheckbox").checked || option){
    imageData=ctx2.getImageData(0,0,canvas1.width,canvas1.height);
    var value=document.getElementById("brightnessimageslider").value*1,value2=document.getElementById("contrastimageslider").value*1;

        for(var a=0;a<imageData.data.length;a+=4){
            imageData.data[a]=imageData.data[a]+value; imageData.data[a+1]=imageData.data[a+1]+value; imageData.data[a+2]=imageData.data[a+2]+value;
            
            imageData.data[a]=((imageData.data[a]-128)*value2/10)+128;
            imageData.data[a+1]=((imageData.data[a+1]-128)*value2/10)+128;
            imageData.data[a+2]=((imageData.data[a+2]-128)*value2/10)+128;
        }
       ctx1.putImageData(imageData,0,0);
    }else ctx1.putImageData(ctx2.getImageData(0,0,canvas1.width,canvas1.height),0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    if(option)applyimageprocess("brightnesscontrast");
}
function resetbrightnesscontrast(){resetbrightnesscontrastslider(); brightnesscontrastimage("brightnessimageslider");}
function resetbrightnesscontrastslider(){
    document.getElementById("brightnessimageslider").value=0; document.getElementById("brightnessimagetbox").value=0;
    document.getElementById("contrastimageslider").value=10; document.getElementById("contrastimagetbox").value=10;
}

function previewcolorbalanceimage(element){
    if(element==="colorbalancebluetbox"){
        if(!(document.getElementById("colorbalancebluetbox").value<100)){
        document.getElementById("colorbalancebluetbox").value=0; document.getElementById("colorbalancebluetbox").select();
        }    
        document.getElementById("colorbalanceblueslider").value=document.getElementById("colorbalancebluetbox").value;
    }else document.getElementById("colorbalancebluetbox").value=document.getElementById("colorbalanceblueslider").value;

    if(element==="colorbalancegreentbox"){
        if(!(document.getElementById("colorbalancegreentbox").value<100)){
        document.getElementById("colorbalancegreentbox").value=0; document.getElementById("colorbalancegreentbox").select();
        }    
        document.getElementById("colorbalancegreenslider").value=document.getElementById("colorbalancegreentbox").value;
    }else document.getElementById("colorbalancegreentbox").value=document.getElementById("colorbalancegreenslider").value;

    if(element==="colorbalanceredtbox"){
        if(!(document.getElementById("colorbalanceredtbox").value<100)){
        document.getElementById("colorbalanceredtbox").value=0; document.getElementById("colorbalanceredtbox").select();
        }    
        document.getElementById("colorbalanceredslider").value=document.getElementById("colorbalanceredtbox").value;
    }else document.getElementById("colorbalanceredtbox").value=document.getElementById("colorbalanceredslider").value;

    if(document.getElementById('colorbalanceoptions').value==="Highlight"){
        colorbalance[6]=document.getElementById("colorbalanceredslider").value*1;
        colorbalance[7]=document.getElementById("colorbalancegreenslider").value*1;
        colorbalance[8]=document.getElementById("colorbalanceblueslider").value*1;
    }else if(document.getElementById('colorbalanceoptions').value==="Midtone"){
        colorbalance[3]=document.getElementById("colorbalanceredslider").value*1;
        colorbalance[4]=document.getElementById("colorbalancegreenslider").value*1;
        colorbalance[5]=document.getElementById("colorbalanceblueslider").value*1;
    }else{
        colorbalance[0]=document.getElementById("colorbalanceredslider").value*1;
        colorbalance[1]=document.getElementById("colorbalancegreenslider").value*1;
        colorbalance[2]=document.getElementById("colorbalanceblueslider").value*1;
    }

    colorbalanceimage(false);
}
function changecolorbalancevalues(element){
    if(document.getElementById(element).value==="Highlight"){
        document.getElementById("colorbalanceredtbox").value=colorbalance[6];document.getElementById("colorbalanceredslider").value=colorbalance[6];
        document.getElementById("colorbalancegreentbox").value=colorbalance[7];document.getElementById("colorbalancegreenslider").value=colorbalance[7];
        document.getElementById("colorbalancebluetbox").value=colorbalance[8];document.getElementById("colorbalanceblueslider").value=colorbalance[8];
    }else if(document.getElementById(element).value==="Midtone"){
        document.getElementById("colorbalanceredtbox").value=colorbalance[3];document.getElementById("colorbalanceredslider").value=colorbalance[3];
        document.getElementById("colorbalancegreentbox").value=colorbalance[4];document.getElementById("colorbalancegreenslider").value=colorbalance[4];
        document.getElementById("colorbalancebluetbox").value=colorbalance[5];document.getElementById("colorbalanceblueslider").value=colorbalance[5];
    }else{
        document.getElementById("colorbalanceredtbox").value=colorbalance[0];document.getElementById("colorbalanceredslider").value=colorbalance[0];
        document.getElementById("colorbalancegreentbox").value=colorbalance[1];document.getElementById("colorbalancegreenslider").value=colorbalance[1];
        document.getElementById("colorbalancebluetbox").value=colorbalance[2];document.getElementById("colorbalanceblueslider").value=colorbalance[2];
    }
}
function colorbalanceimage(option){
    if(option && document.getElementById("colorbalancepreviewcheckbox").checked){applyimageprocess('colorbalance'); return;}
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    if(document.getElementById("colorbalancepreviewcheckbox").checked || option){
        var imageData=ctx2.getImageData(0,0,canvas1.width,canvas1.height);
        for(var a=0;a<imageData.data.length;a+=4){
            const lum=(imageData.data[a]*299+imageData.data[a+1]*587+imageData.data[a+2]*114)/1000;
            if(lum<85) {
                imageData.data[a]+=colorbalance[0]+(colorbalance[3]+colorbalance[6])/1.1;
                imageData.data[a+1]+=colorbalance[1]+(colorbalance[4]+colorbalance[7])/1.1;
                imageData.data[a+2]+=colorbalance[2]+(colorbalance[5]+colorbalance[8])/1.1;
            }
            else if(lum>85 && lum<170){
                imageData.data[a]+=colorbalance[0]+(colorbalance[3]+colorbalance[6])/1.1;
                imageData.data[a+1]+=colorbalance[1]+(colorbalance[4]+colorbalance[7])/1.1;
                imageData.data[a+2]+=colorbalance[2]+(colorbalance[5]+colorbalance[8])/1.1;
            } else{ 
                imageData.data[a]+=colorbalance[0]+(colorbalance[3]+colorbalance[6])/1.1;
                imageData.data[a+1]+=colorbalance[1]+(colorbalance[4]+colorbalance[7])/1.1;
                imageData.data[a+2]+=colorbalance[2]+(colorbalance[5]+colorbalance[8])/1.1;
            }
        }
       ctx1.putImageData(imageData,0,0);
    }else ctx1.putImageData(ctx2.getImageData(0,0,canvas1.width,canvas1.height),0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    if(option) applyimageprocess('colorbalance');
}
function resetcolorbalance(){ resetcolorbalanceslider(); colorbalanceimage();}
function resetcolorbalanceslider(){
    colorbalance=[0,0,0,0,0,0,0,0,0];
    document.getElementById("colorbalanceredslider").value=0;
    document.getElementById("colorbalanceredtbox").value=0;
    document.getElementById("colorbalancegreenslider").value=0;
    document.getElementById("colorbalancegreentbox").value=0;
    document.getElementById("colorbalanceblueslider").value=0;
    document.getElementById("colorbalancebluetbox").value=0;
}
function blackandwhite(){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    var imagedata=ctx2.getImageData(0,0,canvas1.width,canvas1.height);
        for(var a=0;a<imagedata.data.length;a+=4){
                imagedata.data[a]=(imagedata.data[a+2]+imagedata.data[a+1]+imagedata.data[a])/3;
                imagedata.data[a+1]=imagedata.data[a];
                imagedata.data[a+2]=imagedata.data[a];
        }
       ctx1.putImageData(imagedata,0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    
    const img=new Image();
    img.src=canvas1.toDataURL("image/png");
    img.onload=()=>{
        createundo("imageprocess","Greyscale");
    }
}

function sharp(option=1,value=4){
    var index=option,kernel=[0,-1,0,-1,8,-1,0,-1,0];
    kernel[0]*=index;kernel[1]*=index;kernel[2]*=index;kernel[3]*=index;kernel[4]*=index;kernel[5]*=index;kernel[6]*=index;kernel[7]*=index;kernel[8]*=index;
    
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");

    var width=imagepreview.width,height=imagepreview.height,a,m,sharpvalue=value;
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=width; canvas1.height=height;
    
    imageData=ctx2.getImageData(0,0,width,height);

        m=0; //blurring first pixel
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m+4+(4*width)]*kernel[8]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[1]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[3]+imageData.data[m]*kernel[6])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m+5+(4*width)]*kernel[8]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[1]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[3]+imageData.data[m+1]*kernel[6])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m+6+(4*width)]*kernel[8]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[1]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[3]+imageData.data[m+2]*kernel[6])/sharpvalue;
    
        for(m=4;m<width*4-5;m+=4){ //blurring first row
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m+4+(4*width)]*kernel[8]+imageData.data[m-4]*kernel[3]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[1]+imageData.data[m]*kernel[2])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m+5+(4*width)]*kernel[8]+imageData.data[m-3]*kernel[3]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[1]+imageData.data[m+1]*kernel[2])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m+6+(4*width)]*kernel[8]+imageData.data[m-2]*kernel[3]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[1]+imageData.data[m+2]*kernel[2])/sharpvalue;
        }
        m=width*4-4; //blurring last pixel in first row
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[1]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[5]+imageData.data[m]*kernel[8])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[1]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[5]+imageData.data[m+1]*kernel[8])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[1]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[5]+imageData.data[m+2]*kernel[8])/sharpvalue;
    
        for(a=1;a<(height-1);a++){
            m=a*width*4; //blurring left corner
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m+4+(4*width)]*kernel[8]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[3]+imageData.data[m]*kernel[6])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m+5+(4*width)]*kernel[8]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[3]+imageData.data[m+1]*kernel[6])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m+6+(4*width)]*kernel[8]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[3]+imageData.data[m+2]*kernel[6])/sharpvalue;
        
            for(m=a*width*4+4;m<(width*(a+1)*4-5);m+=4){
                imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m+4+(4*width)]*kernel[8])/sharpvalue;
                imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+5+(4*width)]*kernel[8])/sharpvalue;
                imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+6+(4*width)]*kernel[8])/sharpvalue;
            }
            m=width*(a+1)*4-4;//blurring right corner
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4]*kernel[3]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[5]+imageData.data[m]*kernel[8])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3]*kernel[3]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[5]+imageData.data[m+1]*kernel[8])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2]*kernel[3]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[5]+imageData.data[m+2]*kernel[8])/sharpvalue;
        }
        
        m=width*4*(height-1); //blurring first pixel in last row
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[3]+imageData.data[m]*kernel[6]+imageData.data[m]*kernel[7]+imageData.data[m]*kernel[8])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[3]+imageData.data[m+1]*kernel[6]+imageData.data[m+1]*kernel[7]+imageData.data[m+1]*kernel[8])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[3]+imageData.data[m+2]*kernel[6]+imageData.data[m+2]*kernel[7]+imageData.data[m+2]*kernel[8])/sharpvalue;
    
        for(m=(width*4*(height-1)+4);m<(height*width*4-5);m+=4){ //blurring last row
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m-4]*kernel[3]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m]*kernel[6]+imageData.data[m]*kernel[7]+imageData.data[m]*kernel[8])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m-3]*kernel[3]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+1]*kernel[6]+imageData.data[m+1]*kernel[7]+imageData.data[m+1]*kernel[8])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m-2]*kernel[3]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+2]*kernel[6]+imageData.data[m+2]*kernel[7]+imageData.data[m+2]*kernel[8])/sharpvalue;
        }
        m=height*width*4-4; //blurring last pixel
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[5]+imageData.data[m]*kernel[6]+imageData.data[m]*kernel[7]+imageData.data[m]*kernel[8])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[5]+imageData.data[m+1]*kernel[6]+imageData.data[m+1]*kernel[7]+imageData.data[m+1]*kernel[8])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[5]+imageData.data[m+2]*kernel[6]+imageData.data[m+2]*kernel[7]+imageData.data[m+2]*kernel[8])/sharpvalue;
    
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    
    const img=new Image();
    img.src=canvas1.toDataURL("image/png");
    img.onload=()=>{
        createundo("imageprocess","Sharp");
    }

}

function rotateimage(deg){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    if(currentlayer==="none" || ismultilayerselected() || document.getElementById(currentlayer).width===0){showmessage("Layer not editable!"); return;}
    if(deg==="cc"){
        if(document.getElementById(currentlayer).height>document.getElementById(currentlayer).width){
            imagepreview.width=document.getElementById(currentlayer).height;
            imagepreview.height=document.getElementById(currentlayer).height;
        }else{
            imagepreview.width=document.getElementById(currentlayer).width;
            imagepreview.height=document.getElementById(currentlayer).width;
        }
        const ctx=imagepreview.getContext("2d");
        ctx.translate(imagepreview.width/2,imagepreview.height/2);
        ctx.rotate(-90*Math.PI/180);
        ctx.drawImage(document.getElementById(currentlayer),-imagepreview.width/2,-imagepreview.height/2);
        trimimage();
        document.getElementById(currentlayer).style.left=document.getElementById(currentlayer).offsetLeft+document.getElementById(currentlayer).width/2-document.getElementById(currentlayer).height/2+"px";
        document.getElementById(currentlayer).style.top=document.getElementById(currentlayer).offsetTop+document.getElementById(currentlayer).height/2-document.getElementById(currentlayer).width/2+"px";
        document.getElementById(currentlayer).width=imagepreview.width;
        document.getElementById(currentlayer).height=imagepreview.height
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    }else{
        if(document.getElementById(currentlayer).height>document.getElementById(currentlayer).width){
            imagepreview.width=document.getElementById(currentlayer).height;
            imagepreview.height=document.getElementById(currentlayer).height;
        }else{
            imagepreview.width=document.getElementById(currentlayer).width;
            imagepreview.height=document.getElementById(currentlayer).width;
        }
        const ctx=imagepreview.getContext("2d");
        ctx.translate(imagepreview.width/2,imagepreview.height/2);
        ctx.rotate(90*Math.PI/180);
        ctx.drawImage(document.getElementById(currentlayer),-imagepreview.width/2,-imagepreview.height/2);
        trimimage();
        document.getElementById(currentlayer).style.left=document.getElementById(currentlayer).offsetLeft+document.getElementById(currentlayer).width/2-document.getElementById(currentlayer).height/2+"px";
        document.getElementById(currentlayer).style.top=document.getElementById(currentlayer).offsetTop+document.getElementById(currentlayer).height/2-document.getElementById(currentlayer).width/2+"px";
        document.getElementById(currentlayer).width=imagepreview.width;
        document.getElementById(currentlayer).height=imagepreview.height
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    }
    if(istransformchecked)showtransform();
}
function flipimage(vh){
    if(istransformactive){document.getElementById("applytransform").classList.remove("hide"); return;}
    if(currentlayer==="none" || ismultilayerselected() || document.getElementById(currentlayer).width===0){showmessage("Layer not editable!"); return;}
    imagepreview.height=document.getElementById(currentlayer).height;
    imagepreview.width=document.getElementById(currentlayer).width;
    if(vh==="v"){
        const ctx=imagepreview.getContext("2d");
        ctx.translate(imagepreview.width/2,imagepreview.height/2);
        ctx.scale(1,-1);
        ctx.drawImage(document.getElementById(currentlayer),-imagepreview.width/2,-imagepreview.height/2);
        trimimage();
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    }else{
        const ctx=imagepreview.getContext("2d");
        ctx.translate(imagepreview.width/2,imagepreview.height/2);
        ctx.scale(-1,1);
        ctx.drawImage(document.getElementById(currentlayer),-imagepreview.width/2,-imagepreview.height/2);
        trimimage();
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    }
    if(istransformchecked)showtransform();
}
function cutimage(){
    if(currentlayer==="none" || ismultilayerselected() || document.getElementById(currentlayer).width===0){showmessage("Layer not editable!"); return;}
    
    const ctx=imagepreview.getContext("2d");
    imagepreview.height=document.getElementById(currentlayer).height;
    imagepreview.width=x;
    ctx.putImageData(imageData,0,0,0,0,x,imagepreview.height);
}
function copyimage(){
    if(currentlayer==="none" || ismultilayerselected() || document.getElementById(currentlayer).width===0){showmessage("Layer not editable!"); return;}
    
}
function pasteimage(){


    if(istransformchecked)showtransform();
}
function scaleimage(){

}

function boxblur(option){
    const canvas1=document.createElement('canvas');
    var width=imagepreview.width,height=imagepreview.height,a,m,blurvalue=9,blurvaluelrtb=6,blurvaluecorner=4;
    const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d"); //ctx2.drawImage(document.getElementById(currentlayer),0,0);
    canvas1.width=width; canvas1.height=height;
    
    imageData=ctx2.getImageData(0,0,width,height);

    for(var n=0;n<document.getElementById(option).value*1;n++){
        m=0; //blurring first pixel
        imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m+(4*width)]+imageData.data[m+4+(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1+(4*width)]+imageData.data[m+5+(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2+(4*width)]+imageData.data[m+6+(4*width)])/blurvaluecorner;
    
        for(m=4;m<width*4-5;m+=4){ //blurring first row
            imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m+(4*width)]+imageData.data[m+4+(4*width)]+imageData.data[m-4]+imageData.data[m-4+(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1+(4*width)]+imageData.data[m+5+(4*width)]+imageData.data[m-3]+imageData.data[m-3+(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2+(4*width)]+imageData.data[m+6+(4*width)]+imageData.data[m-2]+imageData.data[m-2+(4*width)])/blurvaluelrtb;
        }
        m=width*4-4; //blurring last pixel in first row
        imageData.data[m]=(imageData.data[m]+imageData.data[m-4]+imageData.data[m+(4*width)]+imageData.data[m-4+(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m-3]+imageData.data[m+1+(4*width)]+imageData.data[m-3+(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m-2]+imageData.data[m+2+(4*width)]+imageData.data[m-2+(4*width)])/blurvaluecorner;
    
        for(a=1;a<(height-1);a++){
            m=a*width*4; //blurring left corner
            imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m+4-(4*width)]+imageData.data[m+(4*width)]+imageData.data[m+4+(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m+5-(4*width)]+imageData.data[m+1+(4*width)]+imageData.data[m+5+(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m+6-(4*width)]+imageData.data[m+2+(4*width)]+imageData.data[m+6+(4*width)])/blurvaluelrtb;
        
            for(m=a*width*4+4;m<(width*(a+1)*4-5);m+=4){
                imageData.data[m]=(imageData.data[m]+imageData.data[m-4]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m-4-(4*width)]+imageData.data[m+4-(4*width)]+imageData.data[m+(4*width)]+imageData.data[m-4+(4*width)]+imageData.data[m+4+(4*width)])/blurvalue;
                imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m-3]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m-3-(4*width)]+imageData.data[m+5-(4*width)]+imageData.data[m+1+(4*width)]+imageData.data[m-3+(4*width)]+imageData.data[m+5+(4*width)])/blurvalue;
                imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m-2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m-2-(4*width)]+imageData.data[m+6-(4*width)]+imageData.data[m+2+(4*width)]+imageData.data[m-2+(4*width)]+imageData.data[m+6+(4*width)])/blurvalue;
            }
            m=width*(a+1)*4-4;//blurring right corner
            imageData.data[m]=(imageData.data[m]+imageData.data[m-(4*width)]+imageData.data[m+(4*width)]+imageData.data[m-4]+imageData.data[m-4+(4*width)]+imageData.data[m-4-(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+1-(4*width)]+imageData.data[m+1+(4*width)]+imageData.data[m-3]+imageData.data[m-3+(4*width)]+imageData.data[m-3-(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+2-(4*width)]+imageData.data[m+2+(4*width)]+imageData.data[m-2]+imageData.data[m-2+(4*width)]+imageData.data[m-2-(4*width)])/blurvaluelrtb;
        }
        
        m=width*4*(height-1); //blurring first pixel in last row
        imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m+4-(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m+5-(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m+6-(4*width)])/blurvaluecorner;
    
        for(m=(width*4*(height-1)+4);m<(height*width*4-5);m+=4){ //blurring last row
            imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m+4-(4*width)]+imageData.data[m-4]+imageData.data[m-4-(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m+5-(4*width)]+imageData.data[m-3]+imageData.data[m-3-(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m+6-(4*width)]+imageData.data[m-2]+imageData.data[m-2-(4*width)])/blurvaluelrtb;
        }
        m=height*width*4-4; //blurring last pixel
        imageData.data[m]=(imageData.data[m]+imageData.data[m-4]+imageData.data[m-(4*width)]+imageData.data[m-4-(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m-3]+imageData.data[m+1-(4*width)]+imageData.data[m-3-(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m-2]+imageData.data[m+2-(4*width)]+imageData.data[m-2-(4*width)])/blurvaluecorner;
    }
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}


function thresholdblur(option){
    const canvas1=document.createElement('canvas');
    var width=imagepreview.width,height=imagepreview.height,a,m,blurvalue,r,g,b,th=document.getElementById("thresholdlimitblurslider").value;
    const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d");
    canvas1.width=width; canvas1.height=height;
    imageData=ctx2.getImageData(0,0,width,height);

    for(var n=0;n<document.getElementById(option).value*1;n++){
        m=0; //blurring first pixel            
        r=g=b=0,blurvalue=1;
        if(imageData.data[m+4]>=(imageData.data[m]-th) && imageData.data[m+4]<=(imageData.data[m]+th) && imageData.data[m+5]>=(imageData.data[m+1]-th) && imageData.data[m+5]<=(imageData.data[m+1]+th) && imageData.data[m+6]>=(imageData.data[m+2]-th) && imageData.data[m+6]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m+4];g+=imageData.data[m+5];b+=imageData.data[m+6]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2+(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m+(4*width)];g+=imageData.data[m+1+(4*width)];b+=imageData.data[m+2+(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m+4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6+(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m+4+(4*width)];g+=imageData.data[m+5+(4*width)];b+=imageData.data[m+6+(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;

        for(m=4;m<width*4-5;m+=4){ //blurring first row
            r=g=b=0,blurvalue=1;
            if(imageData.data[m+4]>=(imageData.data[m]-th) && imageData.data[m+4]<=(imageData.data[m]+th) && imageData.data[m+5]>=(imageData.data[m+1]-th) && imageData.data[m+5]<=(imageData.data[m+1]+th) && imageData.data[m+6]>=(imageData.data[m+2]-th) && imageData.data[m+6]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4];g+=imageData.data[m+5];b+=imageData.data[m+6]; blurvalue++;
            }else continue;
            if(imageData.data[m-4]>=(imageData.data[m]-th) && imageData.data[m-4]<=(imageData.data[m]+th) && imageData.data[m-3]>=(imageData.data[m+1]-th) && imageData.data[m-3]<=(imageData.data[m+1]+th) && imageData.data[m-2]>=(imageData.data[m+2]-th) && imageData.data[m-2]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4];g+=imageData.data[m-3];b+=imageData.data[m-2]; blurvalue++;
            }else continue;
            if(imageData.data[m+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+(4*width)];g+=imageData.data[m+1+(4*width)];b+=imageData.data[m+2+(4*width)]; blurvalue++;
            }else continue;
            if(imageData.data[m-4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4+(4*width)];g+=imageData.data[m-3+(4*width)];b+=imageData.data[m-2+(4*width)]; blurvalue++;
            }else continue;
            if(imageData.data[m+4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4+(4*width)];g+=imageData.data[m+5+(4*width)];b+=imageData.data[m+6+(4*width)]; blurvalue++;
            }else continue;
            imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;
       }
        m=width*4-4; //blurring last pixel in first row
        r=g=b=0,blurvalue=1;
        if(imageData.data[m-4]>=(imageData.data[m]-th) && imageData.data[m-4]<=(imageData.data[m]+th) && imageData.data[m-3]>=(imageData.data[m+1]-th) && imageData.data[m-3]<=(imageData.data[m+1]+th) && imageData.data[m-2]>=(imageData.data[m+2]-th) && imageData.data[m-2]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m-4];g+=imageData.data[m-3];b+=imageData.data[m-2]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2+(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m+(4*width)];g+=imageData.data[m+1+(4*width)];b+=imageData.data[m+2+(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m-4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2+(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m-4+(4*width)];g+=imageData.data[m-3+(4*width)];b+=imageData.data[m-2+(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;

        for(a=1;a<(height-1);a++){
            m=a*width*4; //blurring left corner
            r=g=b=0,blurvalue=1;
            if(imageData.data[m+4]>=(imageData.data[m]-th) && imageData.data[m+4]<=(imageData.data[m]+th) && imageData.data[m+5]>=(imageData.data[m+1]-th) && imageData.data[m+5]<=(imageData.data[m+1]+th) && imageData.data[m+6]>=(imageData.data[m+2]-th) && imageData.data[m+6]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4];g+=imageData.data[m+5];b+=imageData.data[m+6]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-(4*width)];g+=imageData.data[m+1-(4*width)];b+=imageData.data[m+2-(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m+4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4-(4*width)];g+=imageData.data[m+5-(4*width)];b+=imageData.data[m+6-(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+(4*width)];g+=imageData.data[m+1+(4*width)];b+=imageData.data[m+2+(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m+4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4+(4*width)];g+=imageData.data[m+5+(4*width)];b+=imageData.data[m+6+(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;
            
            for(m=a*width*4+4;m<(width*(a+1)*4-5);m+=4){
                r=g=b=0,blurvalue=1;
                if(imageData.data[m+4]>=(imageData.data[m]-th) && imageData.data[m+4]<=(imageData.data[m]+th) && imageData.data[m+5]>=(imageData.data[m+1]-th) && imageData.data[m+5]<=(imageData.data[m+1]+th) && imageData.data[m+6]>=(imageData.data[m+2]-th) && imageData.data[m+6]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m+4];g+=imageData.data[m+5];b+=imageData.data[m+6]; blurvalue++;
                }else continue;
                if(imageData.data[m-4]>=(imageData.data[m]-th) && imageData.data[m-4]<=(imageData.data[m]+th) && imageData.data[m-3]>=(imageData.data[m+1]-th) && imageData.data[m-3]<=(imageData.data[m+1]+th) && imageData.data[m-2]>=(imageData.data[m+2]-th) && imageData.data[m-2]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m-4];g+=imageData.data[m-3];b+=imageData.data[m-2]; blurvalue++;
                }else continue;
                if(imageData.data[m-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2-(4*width)]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m-(4*width)];g+=imageData.data[m+1-(4*width)];b+=imageData.data[m+2-(4*width)]; blurvalue++;
                }else continue;
                if(imageData.data[m+4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6-(4*width)]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m+4-(4*width)];g+=imageData.data[m+5-(4*width)];b+=imageData.data[m+6-(4*width)]; blurvalue++;
                }else continue;
                if(imageData.data[m-4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2-(4*width)]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m-4-(4*width)];g+=imageData.data[m-3-(4*width)];b+=imageData.data[m-2-(4*width)]; blurvalue++;
                }else continue;
                if(imageData.data[m+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2+(4*width)]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m+(4*width)];g+=imageData.data[m+1+(4*width)];b+=imageData.data[m+2+(4*width)]; blurvalue++;
                }else continue;
                if(imageData.data[m-4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2+(4*width)]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m-4+(4*width)];g+=imageData.data[m-3+(4*width)];b+=imageData.data[m-2+(4*width)]; blurvalue++;
                }else continue;
                if(imageData.data[m+4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6+(4*width)]<=(imageData.data[m+2]+th)){
                    r+=imageData.data[m+4+(4*width)];g+=imageData.data[m+5+(4*width)];b+=imageData.data[m+6+(4*width)]; blurvalue++;
                }else continue;
                imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;
            }
            m=width*(a+1)*4-4;//blurring right corner
            
            r=g=b=0,blurvalue=1;
            if(imageData.data[m-4]>=(imageData.data[m]-th) && imageData.data[m-4]<=(imageData.data[m]+th) && imageData.data[m-3]>=(imageData.data[m+1]-th) && imageData.data[m-3]<=(imageData.data[m+1]+th) && imageData.data[m-2]>=(imageData.data[m+2]-th) && imageData.data[m-2]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4];g+=imageData.data[m-3];b+=imageData.data[m-2]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-(4*width)];g+=imageData.data[m+1-(4*width)];b+=imageData.data[m+2-(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m-4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4-(4*width)];g+=imageData.data[m-3-(4*width)];b+=imageData.data[m-2-(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m+(4*width)]>=(imageData.data[m]-th) && imageData.data[m+(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+(4*width)];g+=imageData.data[m+1+(4*width)];b+=imageData.data[m+2+(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            if(imageData.data[m-4+(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4+(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3+(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3+(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2+(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2+(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4+(4*width)];g+=imageData.data[m-3+(4*width)];b+=imageData.data[m-2+(4*width)]; blurvalue++;
            }else {r=g=b=0,blurvalue=1;}
            imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;
        }
        
        m=width*4*(height-1); //blurring first pixel in last row
        r=g=b=0,blurvalue=1;
        if(imageData.data[m+4]>=(imageData.data[m]-th) && imageData.data[m+4]<=(imageData.data[m]+th) && imageData.data[m+5]>=(imageData.data[m+1]-th) && imageData.data[m+5]<=(imageData.data[m+1]+th) && imageData.data[m+6]>=(imageData.data[m+2]-th) && imageData.data[m+6]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m+4];g+=imageData.data[m+5];b+=imageData.data[m+6]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2-(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m-(4*width)];g+=imageData.data[m+1-(4*width)];b+=imageData.data[m+2-(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m+4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6-(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m+4-(4*width)];g+=imageData.data[m+5-(4*width)];b+=imageData.data[m+6-(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;

        for(m=(width*4*(height-1)+4);m<(height*width*4-5);m+=4){ //blurring last row
            r=g=b=0,blurvalue=1;
            if(imageData.data[m+4]>=(imageData.data[m]-th) && imageData.data[m+4]<=(imageData.data[m]+th) && imageData.data[m+5]>=(imageData.data[m+1]-th) && imageData.data[m+5]<=(imageData.data[m+1]+th) && imageData.data[m+6]>=(imageData.data[m+2]-th) && imageData.data[m+6]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4];g+=imageData.data[m+5];b+=imageData.data[m+6]; blurvalue++;
            }else continue;
            if(imageData.data[m-4]>=(imageData.data[m]-th) && imageData.data[m-4]<=(imageData.data[m]+th) && imageData.data[m-3]>=(imageData.data[m+1]-th) && imageData.data[m-3]<=(imageData.data[m+1]+th) && imageData.data[m-2]>=(imageData.data[m+2]-th) && imageData.data[m-2]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4];g+=imageData.data[m-3];b+=imageData.data[m-2]; blurvalue++;
            }else continue;
            if(imageData.data[m-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-(4*width)];g+=imageData.data[m+1-(4*width)];b+=imageData.data[m+2-(4*width)]; blurvalue++;
            }else continue;
            if(imageData.data[m+4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m+4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+5-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+5-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+6-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+6-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m+4-(4*width)];g+=imageData.data[m+5-(4*width)];b+=imageData.data[m+6-(4*width)]; blurvalue++;
            }else continue;
            if(imageData.data[m-4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2-(4*width)]<=(imageData.data[m+2]+th)){
                r+=imageData.data[m-4-(4*width)];g+=imageData.data[m-3-(4*width)];b+=imageData.data[m-2-(4*width)]; blurvalue++;
            }else continue;
            imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;
        }
        m=height*width*4-4; //blurring last pixel
        r=g=b=0,blurvalue=1;
        if(imageData.data[m-4]>=(imageData.data[m]-th) && imageData.data[m-4]<=(imageData.data[m]+th) && imageData.data[m-3]>=(imageData.data[m+1]-th) && imageData.data[m-3]<=(imageData.data[m+1]+th) && imageData.data[m-2]>=(imageData.data[m+2]-th) && imageData.data[m-2]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m-4];g+=imageData.data[m-3];b+=imageData.data[m-2]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-(4*width)]<=(imageData.data[m]+th) && imageData.data[m+1-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m+1-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m+2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m+2-(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m-(4*width)];g+=imageData.data[m+1-(4*width)];b+=imageData.data[m+2-(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        if(imageData.data[m-4-(4*width)]>=(imageData.data[m]-th) && imageData.data[m-4-(4*width)]<=(imageData.data[m]+th) && imageData.data[m-3-(4*width)]>=(imageData.data[m+1]-th) && imageData.data[m-3-(4*width)]<=(imageData.data[m+1]+th) && imageData.data[m-2-(4*width)]>=(imageData.data[m+2]-th) && imageData.data[m-2-(4*width)]<=(imageData.data[m+2]+th)){
            r+=imageData.data[m-4-(4*width)];g+=imageData.data[m-3-(4*width)];b+=imageData.data[m-2-(4*width)]; blurvalue++;
        }else {r=g=b=0,blurvalue=1;}
        imageData.data[m]=(imageData.data[m]+r)/blurvalue; imageData.data[m+1]=(imageData.data[m+1]+g)/blurvalue; imageData.data[m+2]=(imageData.data[m+2]+b)/blurvalue;
    }
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}


function showslidervalue(sliderelement){ document.getElementById(sliderelement+"pc").innerText=document.getElementById(sliderelement).value; }


function gaussianblur(option){
    const canvas1=document.createElement('canvas');
    var width=imagepreview.width,height=imagepreview.height,a,m;
    const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d");
    canvas1.width=width; canvas1.height=height; imageData=ctx2.getImageData(0,0,width,height);
    var red,green,blue,w,h,ww,index=15;
    if(width<=(index*2+1)) index=Math.floor(width/2)-1; if(height<=(index*2+1)) index=Math.floor(height/2)-1;

    for(a=0;a<height;a++){
        for(m=a*width*4;m<width*(a+1)*4;m+=4){
            red=blue=green=0; w=((m-(a*width*4))/4)+1;
            if(w>index && a>=index && (w+index)<=width && (a+index+1)<=height){ //middle of the canvas
                for(h=(a-index);h<=(a+index);h++){
                    for(ww=(((w-index)*4-4)+(h*width*4));ww<=(((w+index)*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if((w+index)>width && a>=index && (a+index)<height){ // rightside of the image
                for(h=(a-index);h<=(a+index);h++){
                    for(ww=((width-(2*index+1))*4+(h*width*4));ww<=((width*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if(w<=index && a>=index && (a+index)<height){ //leftside of the image
                for(h=(a-index);h<=(a+index);h++){
                    for(ww=(h*width*4);ww<=(((1+2*index)*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if(w>index && (w+index)<=width && a<index){ //top of the image
                for(h=0;h<(1+2*index);h++){
                    for(ww=(((w-index)*4-4)+(h*width*4));ww<=(((w+index)*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if(w>index && (w+index)<width && (a+index)>=height){ //bottom of the image
                for(h=(height-(1+2*index));h<height;h++){
                    for(ww=(((w-index)*4-4)+(h*width*4));ww<=(((w+index)*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if(w<=index && a<index){ //top left corner
                for(h=0;h<=(1+2*index);h++){
                    for(ww=(h*width*4);ww<=(((1+2*index)*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if((w+index)>width && a<index){ // top right corner
                for(h=0;h<(1+2*index);h++){
                    for(ww=((width-(2*index+1))*4+(h*width*4));ww<=((width*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else if(w<=index && (a+index)>=height){//bottom left corner
                for(h=(height-(1+2*index));h<height;h++){
                    for(ww=(h*width*4);ww<=(((1+2*index)*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }else{ //bottom right corner
                for(h=(height-(1+2*index));h<height;h++){
                    for(ww=((width-(2*index+1))*4+(h*width*4));ww<=((width*4-4)+(h*width*4));ww+=4){
                        red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                    }
                }
                ww=(index*2+1)*(index*2+1); red=red/(ww); blue=blue/(ww);green=green/(ww);
            }
            imageData.data[m]=red; imageData.data[m+1]=green; imageData.data[m+2]=blue;
        }
    }   
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}

function noiseimage(element,option){
    const canvas1=document.createElement('canvas');
    var width=imagepreview.width,height=imagepreview.height,a,n,m,noiselevel=document.getElementById(element).value*width/100;
    const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d");
    canvas1.width=width; canvas1.height=height;
    imageData=ctx2.getImageData(0,0,width,height);

    if(option==="random"){
        for(a=0;a<height;a++){ for(m=0;m<noiselevel;m++){
                n=Math.floor(Math.random()*width)*4+(width*a*4);
                imageData.data[n]=Math.floor(Math.random()*256); imageData.data[n+1]=Math.floor(Math.random()*256); imageData.data[n+2]=Math.floor(Math.random()*256);}
        }
    }else if(option==="greyscale"){
        if(document.getElementById("greyscaleoptions").value==="Random"){
            for(a=0;a<height;a++){ for(m=0;m<noiselevel;m++){
            n=Math.floor(Math.random()*width)*4+(width*a*4);
            imageData.data[n]=Math.floor(Math.random()*256); imageData.data[n+1]=imageData.data[n]; imageData.data[n+2]=imageData.data[n];}
            }
        }else{ var value; if(document.getElementById("greyscaleoptions").value==="White")value=255;else value=0;
            for(a=0;a<height;a++){ for(m=0;m<noiselevel;m++){
                n=Math.floor(Math.random()*width)*4+(width*a*4);
                imageData.data[n]=value; imageData.data[n+1]=value; imageData.data[n+2]=value;}
                }
        }
    }else{
        for(a=0;a<height;a++){ for(m=0;m<noiselevel;m++){
                n=Math.floor(Math.random()*width)*4+(width*a*4);
              
            const lum=(imageData.data[n]*299+imageData.data[n+1]*587+imageData.data[n+2]*114)/1000;
            if(lum<85) { imageData.data[n]+=imageData.data[n]*0.3; imageData.data[n+1]+=imageData.data[n+1]*0.3; imageData.data[n+2]+=imageData.data[n+2]*0.3;}
            else if(lum>85 && lum<170){ if(Math.floor((Math.random()*2))>0){
            imageData.data[n]+=imageData.data[n]*0.3; imageData.data[n+1]+=imageData.data[n+1]*0.3; imageData.data[n+2]+=imageData.data[n+2]*0.3;
            }else{ imageData.data[n]-=imageData.data[n]*0.3; imageData.data[n+1]-=imageData.data[n+1]*0.3; imageData.data[n+2]-=imageData.data[n+2]*0.3;}
            } else{ imageData.data[n]-=imageData.data[n]*0.3; imageData.data[n+1]-=imageData.data[n+1]*0.3; imageData.data[n+2]-=imageData.data[n+2]*0.3;}

            }
        }
    }
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}

function mosaic(element){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d"),ctx2=imagepreview.getContext("2d");
    const width=imagepreview.width,height=imagepreview.height;
    if(width<height)index=Math.floor((document.getElementById(element).value/2)*width/100); else index=Math.floor((document.getElementById(element).value/2)*height/100);
    canvas1.width=width; canvas1.height=height; console.log(index)
    imageData=ctx2.getImageData(0,0,width,height); var sourceindex,red,green,blue,w,h=index,hh,ww;
        for(a=0;a<height;a+=index){ w=index;
            if((a+index)>height)h=height-a;
            for(m=a*width*4;m<width*(a+1)*4;m+=index*4){
                if((m+4+index*4)>((width*(a+1)*4)-1))w=(((width*(a+1)*4)-1)-(m+3))/4;
                if(document.getElementById("mosaiccheckbox").checked){ ////average the pixel values of the kernel
                    red=blue=green=0;
                    for(hh=0;hh<h;hh++){
                        for(ww=m+(hh*4*width);ww<((m+(hh*4*width))+w*4);ww+=4){
                            red+=imageData.data[ww]; green+=imageData.data[ww+1]; blue+=imageData.data[ww+2];
                        }
                    }
                    red=red/(h*w); blue=blue/(h*w);green=green/(h*w);
                }else{ //take pixel value from the center of the kernel 
                sourceindex=m+(Math.floor(w/2)*4)+((Math.ceil(h/2)-1)*width*4); 
                red=imageData.data[sourceindex]; green=imageData.data[sourceindex+1];blue=imageData.data[sourceindex+2];
                }
                for(hh=0;hh<h;hh++){
                    for(ww=m+(hh*4*width);ww<=((m+(hh*4*width))+w*4);ww+=4){
                        imageData.data[ww]=red; imageData.data[ww+1]=green; imageData.data[ww+2]=blue;
                    }
                }
            }
        }
       ctx1.putImageData(imageData,0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}


function gaussianblur2(option){
    var red,green,blue,w,h,ww,index=option,kernel=[1,2,1,2,4,2,1,2,1];//kernel=[0,-1,0,-1,8,-1,0,-1,0]; //kernel=[0,0,0,2,2,2,0,0,0];//
    kernel[0]*=index;kernel[1]*=index;kernel[2]*=index;kernel[3]*=index;kernel[4]*=index;kernel[5]*=index;kernel[6]*=index;kernel[7]*=index;kernel[8]*=index;
    const canvas1=document.createElement('canvas');
    var width=imagepreview.width,height=imagepreview.height,a,m,blurvalue=kernel[0]+kernel[1]+kernel[2]+kernel[3]+kernel[4]+kernel[5]+kernel[6]+kernel[7]+kernel[8],blurvaluelrtb=6,blurvaluecorner=4;
    const ctx1=canvas1.getContext("2d"); const ctx2=imagepreview.getContext("2d"); //ctx2.drawImage(document.getElementById(currentlayer),0,0);
    canvas1.width=width; canvas1.height=height; 
    
    imageData=ctx2.getImageData(0,0,width,height);

    for(var n=0;n<11;n++){ //<document.getElementById(option).value*1;n++){
        m=0; //blurring first pixel
        imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m+(4*width)]+imageData.data[m+4+(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1+(4*width)]+imageData.data[m+5+(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2+(4*width)]+imageData.data[m+6+(4*width)])/blurvaluecorner;
    
        for(m=4;m<width*4-5;m+=4){ //blurring first row
            imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m+(4*width)]+imageData.data[m+4+(4*width)]+imageData.data[m-4]+imageData.data[m-4+(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1+(4*width)]+imageData.data[m+5+(4*width)]+imageData.data[m-3]+imageData.data[m-3+(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2+(4*width)]+imageData.data[m+6+(4*width)]+imageData.data[m-2]+imageData.data[m-2+(4*width)])/blurvaluelrtb;
        }
        m=width*4-4; //blurring last pixel in first row
        imageData.data[m]=(imageData.data[m]+imageData.data[m-4]+imageData.data[m+(4*width)]+imageData.data[m-4+(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m-3]+imageData.data[m+1+(4*width)]+imageData.data[m-3+(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m-2]+imageData.data[m+2+(4*width)]+imageData.data[m-2+(4*width)])/blurvaluecorner;
    
        for(a=1;a<(height-1);a++){
            m=a*width*4; //blurring left corner
            imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m+4-(4*width)]+imageData.data[m+(4*width)]+imageData.data[m+4+(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m+5-(4*width)]+imageData.data[m+1+(4*width)]+imageData.data[m+5+(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m+6-(4*width)]+imageData.data[m+2+(4*width)]+imageData.data[m+6+(4*width)])/blurvaluelrtb;
        
            for(m=a*width*4+4;m<(width*(a+1)*4-5);m+=4){
                imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m+4+(4*width)]*kernel[8])/blurvalue;
                imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+5+(4*width)]*kernel[8])/blurvalue;
                imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+6+(4*width)]*kernel[8])/blurvalue;
            }
            m=width*(a+1)*4-4;//blurring right corner
            imageData.data[m]=(imageData.data[m]+imageData.data[m-(4*width)]+imageData.data[m+(4*width)]+imageData.data[m-4]+imageData.data[m-4+(4*width)]+imageData.data[m-4-(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+1-(4*width)]+imageData.data[m+1+(4*width)]+imageData.data[m-3]+imageData.data[m-3+(4*width)]+imageData.data[m-3-(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+2-(4*width)]+imageData.data[m+2+(4*width)]+imageData.data[m-2]+imageData.data[m-2+(4*width)]+imageData.data[m-2-(4*width)])/blurvaluelrtb;
        }
        
        m=width*4*(height-1); //blurring first pixel in last row
        imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m+4-(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m+5-(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m+6-(4*width)])/blurvaluecorner;
    
        for(m=(width*4*(height-1)+4);m<(height*width*4-5);m+=4){ //blurring last row
            imageData.data[m]=(imageData.data[m]+imageData.data[m+4]+imageData.data[m-(4*width)]+imageData.data[m+4-(4*width)]+imageData.data[m-4]+imageData.data[m-4-(4*width)])/blurvaluelrtb;
            imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m+5]+imageData.data[m+1-(4*width)]+imageData.data[m+5-(4*width)]+imageData.data[m-3]+imageData.data[m-3-(4*width)])/blurvaluelrtb;
            imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m+6]+imageData.data[m+2-(4*width)]+imageData.data[m+6-(4*width)]+imageData.data[m-2]+imageData.data[m-2-(4*width)])/blurvaluelrtb;
        }
        m=height*width*4-4; //blurring last pixel
        imageData.data[m]=(imageData.data[m]+imageData.data[m-4]+imageData.data[m-(4*width)]+imageData.data[m-4-(4*width)])/blurvaluecorner;
        imageData.data[m+1]=(imageData.data[m+1]+imageData.data[m-3]+imageData.data[m+1-(4*width)]+imageData.data[m-3-(4*width)])/blurvaluecorner;
        imageData.data[m+2]=(imageData.data[m+2]+imageData.data[m-2]+imageData.data[m+2-(4*width)]+imageData.data[m-2-(4*width)])/blurvaluecorner;
    }
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}

function blur2(option=1,value=4){
    var index=option,kernel=[0,0,0,2,2,2,0,0,0];
    kernel[0]*=index;kernel[1]*=index;kernel[2]*=index;kernel[3]*=index;kernel[4]*=index;kernel[5]*=index;kernel[6]*=index;kernel[7]*=index;kernel[8]*=index;
    
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");

    var width=imagepreview.width,height=imagepreview.height,a,m,sharpvalue=value;
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=width; canvas1.height=height;
    
    imageData=ctx2.getImageData(0,0,width,height);

        m=0; //blurring first pixel
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m+4+(4*width)]*kernel[8]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[1]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[3]+imageData.data[m]*kernel[6])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m+5+(4*width)]*kernel[8]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[1]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[3]+imageData.data[m+1]*kernel[6])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m+6+(4*width)]*kernel[8]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[1]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[3]+imageData.data[m+2]*kernel[6])/sharpvalue;
    
        for(m=4;m<width*4-5;m+=4){ //blurring first row
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m+4+(4*width)]*kernel[8]+imageData.data[m-4]*kernel[3]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[1]+imageData.data[m]*kernel[2])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m+5+(4*width)]*kernel[8]+imageData.data[m-3]*kernel[3]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[1]+imageData.data[m+1]*kernel[2])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m+6+(4*width)]*kernel[8]+imageData.data[m-2]*kernel[3]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[1]+imageData.data[m+2]*kernel[2])/sharpvalue;
        }
        m=width*4-4; //blurring last pixel in first row
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[1]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[5]+imageData.data[m]*kernel[8])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[1]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[5]+imageData.data[m+1]*kernel[8])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[1]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[5]+imageData.data[m+2]*kernel[8])/sharpvalue;
    
        for(a=1;a<(height-1);a++){
            m=a*width*4; //blurring left corner
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m+4+(4*width)]*kernel[8]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[3]+imageData.data[m]*kernel[6])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m+5+(4*width)]*kernel[8]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[3]+imageData.data[m+1]*kernel[6])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m+6+(4*width)]*kernel[8]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[3]+imageData.data[m+2]*kernel[6])/sharpvalue;
        
            for(m=a*width*4+4;m<(width*(a+1)*4-5);m+=4){
                imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m+4+(4*width)]*kernel[8])/sharpvalue;
                imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m+5+(4*width)]*kernel[8])/sharpvalue;
                imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m+6+(4*width)]*kernel[8])/sharpvalue;
            }
            m=width*(a+1)*4-4;//blurring right corner
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+(4*width)]*kernel[7]+imageData.data[m-4]*kernel[3]+imageData.data[m-4+(4*width)]*kernel[6]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[5]+imageData.data[m]*kernel[8])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+1+(4*width)]*kernel[7]+imageData.data[m-3]*kernel[3]+imageData.data[m-3+(4*width)]*kernel[6]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[5]+imageData.data[m+1]*kernel[8])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+2+(4*width)]*kernel[7]+imageData.data[m-2]*kernel[3]+imageData.data[m-2+(4*width)]*kernel[6]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[5]+imageData.data[m+2]*kernel[8])/sharpvalue;
        }
        
        m=width*4*(height-1); //blurring first pixel in last row
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m]*kernel[0]+imageData.data[m]*kernel[3]+imageData.data[m]*kernel[6]+imageData.data[m]*kernel[7]+imageData.data[m]*kernel[8])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m+1]*kernel[0]+imageData.data[m+1]*kernel[3]+imageData.data[m+1]*kernel[6]+imageData.data[m+1]*kernel[7]+imageData.data[m+1]*kernel[8])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m+2]*kernel[0]+imageData.data[m+2]*kernel[3]+imageData.data[m+2]*kernel[6]+imageData.data[m+2]*kernel[7]+imageData.data[m+2]*kernel[8])/sharpvalue;
    
        for(m=(width*4*(height-1)+4);m<(height*width*4-5);m+=4){ //blurring last row
            imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m+4]*kernel[5]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m+4-(4*width)]*kernel[2]+imageData.data[m-4]*kernel[3]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m]*kernel[6]+imageData.data[m]*kernel[7]+imageData.data[m]*kernel[8])/sharpvalue;
            imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m+5]*kernel[5]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m+5-(4*width)]*kernel[2]+imageData.data[m-3]*kernel[3]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+1]*kernel[6]+imageData.data[m+1]*kernel[7]+imageData.data[m+1]*kernel[8])/sharpvalue;
            imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m+6]*kernel[5]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m+6-(4*width)]*kernel[2]+imageData.data[m-2]*kernel[3]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+2]*kernel[6]+imageData.data[m+2]*kernel[7]+imageData.data[m+2]*kernel[8])/sharpvalue;
        }
        m=height*width*4-4; //blurring last pixel
        imageData.data[m]=(imageData.data[m]*kernel[4]+imageData.data[m-4]*kernel[3]+imageData.data[m-(4*width)]*kernel[1]+imageData.data[m-4-(4*width)]*kernel[0]+imageData.data[m]*kernel[2]+imageData.data[m]*kernel[5]+imageData.data[m]*kernel[6]+imageData.data[m]*kernel[7]+imageData.data[m]*kernel[8])/sharpvalue;
        imageData.data[m+1]=(imageData.data[m+1]*kernel[4]+imageData.data[m-3]*kernel[3]+imageData.data[m+1-(4*width)]*kernel[1]+imageData.data[m-3-(4*width)]*kernel[0]+imageData.data[m+1]*kernel[2]+imageData.data[m+1]*kernel[5]+imageData.data[m+1]*kernel[6]+imageData.data[m+1]*kernel[7]+imageData.data[m+1]*kernel[8])/sharpvalue;
        imageData.data[m+2]=(imageData.data[m+2]*kernel[4]+imageData.data[m-2]*kernel[3]+imageData.data[m+2-(4*width)]*kernel[1]+imageData.data[m-2-(4*width)]*kernel[0]+imageData.data[m+2]*kernel[2]+imageData.data[m+2]*kernel[5]+imageData.data[m+2]*kernel[6]+imageData.data[m+2]*kernel[7]+imageData.data[m+2]*kernel[8])/sharpvalue;
    
    ctx1.putImageData(imageData,0,0); document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    
    const img=new Image();
    img.src=canvas1.toDataURL("image/png");
    img.onload=()=>{
        createundo("imageprocess","Sharp");
    }

}

function paintbucket(){
    
    imagepreview.width=document.getElementById(currentlayer).width; imagepreview.height=document.getElementById(currentlayer).height;
    const ctx=imagepreview.getContext("2d"); ctx.drawImage(document.getElementById(currentlayer),0,0);
    imageData=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
    var r1=HextoRGB(document.getElementById("forecolor").value,'R'),g1=HextoRGB(document.getElementById("forecolor").value,'G'),b1=HextoRGB(document.getElementById("forecolor").value,'B'),t1=Math.round((document.getElementById("buckettooltransparentslider").value/100)*MaxColor),th=document.getElementById("buckettoolthresholdslider").value*1,isTransparent=false;
    if(xpos<0 || ypos<0 || xpos>document.getElementById(currentlayer).offsetWidth || ypos>document.getElementById(currentlayer).offsetHeight)isTransparent=true;
    if(!isTransparent)
    if(imageData.data[((ypos)*imagepreview.width*4+xpos*4)-1]>0){
        var r=imageData.data[((ypos)*imagepreview.width*4+xpos*4)-4],g=imageData.data[((ypos)*imagepreview.width*4+xpos*4)-3],b=imageData.data[((ypos)*imagepreview.width*4+xpos*4)-2],t=imageData.data[(ypos*imagepreview.width*4+xpos*4)-1];
        //document.getElementById("testmessage").innerText=r+":"+g+":"+b+":"+r1+":"+g1+":"+b1+":"; document.getElementById("testmessage").innerText=xpos+":"+ypos+":r:"+r+":r1:"+r1+":g:"+g+":g1:"+g1+":b:"+b+":b1:"+b1;
        var xUp=[],yUp=[],xDown=[],yDown=[],a; var isUpavail,isDownavail; if(ypos===imagepreview.height){xDown.push(xpos);yDown.push(ypos);}else{xUp.push(xpos);yUp.push(ypos);}
        if(r!=r1 || g!=g1 || b!=b1 || t!=t1){
            if(th===0){
                while(xUp.length>0 || xDown.length>0){
                    isUpavail=isDownavail=false;
                    if(yUp.length>0)
                    if(yUp[yUp.length-1]===0){
                        for(a=xUp[xUp.length-1]*4;a<imagepreview.width*4;a+=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]===r && imageData.data[a+1+imagepreview.width*4]===g && imageData.data[a+2+imagepreview.width*4]===b && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push(a/4); yDown.push(yUp[yUp.length-1]+1); }
                            }else isDownavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=xUp[xUp.length-1]*4-4;a>=0;a-=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]===r && imageData.data[a+1+imagepreview.width*4]===g && imageData.data[a+2+imagepreview.width*4]===b && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push(a/4); yDown.push(yUp[yUp.length-1]+1); }
                            }else isDownavail=false;
                        } yUp.pop();xUp.pop();
                    }else{
                        const x=xUp[xUp.length-1],y=yUp[yUp.length-1]; xUp.pop(); yUp.pop();
                        for(a=(x*4+y*imagepreview.width*4);a<(imagepreview.width*4+y*imagepreview.width*4);a+=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]===r && imageData.data[a+1+imagepreview.width*4]===g && imageData.data[a+2+imagepreview.width*4]===b && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]===r && imageData.data[a+1-imagepreview.width*4]===g && imageData.data[a+2-imagepreview.width*4]===b && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=(x*4+y*imagepreview.width*4-4);a>=y*imagepreview.width*4;a-=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]===r && imageData.data[a+1+imagepreview.width*4]===g && imageData.data[a+2+imagepreview.width*4]===b && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]===r && imageData.data[a+1-imagepreview.width*4]===g && imageData.data[a+2-imagepreview.width*4]===b && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                    }
                    isUpavail=isDownavail=false;
                    if(yDown.length>0)
                    if(yDown[yDown.length-1]===imagepreview.height){
                        if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                        for(a=(xDown[xDown.length-1]*4+(yDown[yDown.length-1]-1)*4*imagepreview.width);a<(imagepreview.width*4+imagepreview.height*4*imagepreview.width);a+=4){
                            if(imageData.data[a-imagepreview.width*4]===r && imageData.data[a+1-imagepreview.width*4]===g && imageData.data[a+2-imagepreview.width*4]===b && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-(imagepreview.height-1)*imagepreview.width*4)/4); yUp.push(yDown[yDown.length-1]-2); }
                            }else isUpavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=(xDown[xDown.length-1]*4+(yDown[yDown.length-1]-1)*4*imagepreview.width)-4;a>=(yDown[yDown.length-1]-1)*4*imagepreview.width;a-=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1; 
                            }else break;
                            if(imageData.data[a-imagepreview.width*4]===r && imageData.data[a+1-imagepreview.width*4]===g && imageData.data[a+2-imagepreview.width*4]===b && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xDown.push((a-(imagepreview.height-1)*imagepreview.width*4)/4); yDown.push(yUp[yUp.length-1]-2); }
                            }else isUpavail=false;
                        } yDown.pop();xDown.pop();
                    }else {
                        const x=xDown[xDown.length-1],y=yDown[yDown.length-1]; xDown.pop(); yDown.pop();
                        for(a=(x*4+y*imagepreview.width*4);a<(imagepreview.width*4+y*imagepreview.width*4);a+=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1; 
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]===r && imageData.data[a+1+imagepreview.width*4]===g && imageData.data[a+2+imagepreview.width*4]===b && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]===r && imageData.data[a+1-imagepreview.width*4]===g && imageData.data[a+2-imagepreview.width*4]===b && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=(x*4+y*imagepreview.width*4-4);a>=y*imagepreview.width*4;a-=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){ // imageData.data[a]=(r1-r)*t1/255; imageData.data[a+1]=(g1-g)*t1/255; imageData.data[a+2]=(b1-b)*t1/255;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1; 
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]===r && imageData.data[a+1+imagepreview.width*4]===g && imageData.data[a+2+imagepreview.width*4]===b && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]===r && imageData.data[a+1-imagepreview.width*4]===g && imageData.data[a+2-imagepreview.width*4]===b && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                    }
                }
            }else{
                while(xUp.length>0 || xDown.length>0){
                    isUpavail=isDownavail=false;
                    if(yUp.length>0)
                    if(yUp[yUp.length-1]===0){
                        for(a=xUp[xUp.length-1]*4;a<imagepreview.width*4;a+=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]>(r-th) && imageData.data[a+imagepreview.width*4]<(r+th) && imageData.data[a+1+imagepreview.width*4]>(g-th) && imageData.data[a+1+imagepreview.width*4]<(g+th) && imageData.data[a+2+imagepreview.width*4]>(b-th)&& imageData.data[a+2+imagepreview.width*4]<(b+th) && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push(a/4); yDown.push(yUp[yUp.length-1]+1); }
                            }else isDownavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=xUp[xUp.length-1]*4-4;a>=0;a-=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]>(r-th) && imageData.data[a+imagepreview.width*4]<(r+th) && imageData.data[a+1+imagepreview.width*4]>(g-th) && imageData.data[a+1+imagepreview.width*4]<(g+th) && imageData.data[a+2+imagepreview.width*4]>(b-th)&& imageData.data[a+2+imagepreview.width*4]<(b+th) && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push(a/4); yDown.push(yUp[yUp.length-1]+1); }
                            }else isDownavail=false;
                        } yUp.pop();xUp.pop();
                    }else{
                        const x=xUp[xUp.length-1],y=yUp[yUp.length-1]; xUp.pop(); yUp.pop();
                        for(a=(x*4+y*imagepreview.width*4);a<(imagepreview.width*4+y*imagepreview.width*4);a+=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]>(r-th) && imageData.data[a+imagepreview.width*4]<(r+th) && imageData.data[a+1+imagepreview.width*4]>(g-th) && imageData.data[a+1+imagepreview.width*4]<(g+th) && imageData.data[a+2+imagepreview.width*4]>(b-th)&& imageData.data[a+2+imagepreview.width*4]<(b+th) && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]>(r-th) && imageData.data[a-imagepreview.width*4]<(r+th) && imageData.data[a+1-imagepreview.width*4]>(g-th) && imageData.data[a+1-imagepreview.width*4]<(g+th) && imageData.data[a+2-imagepreview.width*4]>(b-th)&& imageData.data[a+2-imagepreview.width*4]<(b+th) && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=(x*4+y*imagepreview.width*4-4);a>=y*imagepreview.width*4;a-=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]>(r-th) && imageData.data[a+imagepreview.width*4]<(r+th) && imageData.data[a+1+imagepreview.width*4]>(g-th) && imageData.data[a+1+imagepreview.width*4]<(g+th) && imageData.data[a+2+imagepreview.width*4]>(b-th)&& imageData.data[a+2+imagepreview.width*4]<(b+th) && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]>(r-th) && imageData.data[a-imagepreview.width*4]<(r+th) && imageData.data[a+1-imagepreview.width*4]>(g-th) && imageData.data[a+1-imagepreview.width*4]<(g+th) && imageData.data[a+2-imagepreview.width*4]>(b-th)&& imageData.data[a+2-imagepreview.width*4]<(b+th) && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                    }
                    isUpavail=isDownavail=false;
                    if(yDown.length>0)
                    if(yDown[yDown.length-1]===imagepreview.height){
                        for(a=(xDown[xDown.length-1]*4+(yDown[yDown.length-1]-1)*4*imagepreview.width);a<(imagepreview.width*4+imagepreview.height*4*imagepreview.width);a+=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                            }else break;
                            if(imageData.data[a-imagepreview.width*4]>(r-th) && imageData.data[a-imagepreview.width*4]<(r+th) && imageData.data[a+1-imagepreview.width*4]>(g-th) && imageData.data[a+1-imagepreview.width*4]<(g+th) && imageData.data[a+2-imagepreview.width*4]>(b-th)&& imageData.data[a+2-imagepreview.width*4]<(b+th) && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-(imagepreview.height-1)*imagepreview.width*4)/4); yUp.push(yDown[yDown.length-1]-2); }
                            }else isUpavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=(xDown[xDown.length-1]*4+(yDown[yDown.length-1]-1)*4*imagepreview.width)-4;a>=(yDown[yDown.length-1]-1)*4*imagepreview.width;a-=4){
                            if(imageData.data[a]===r && imageData.data[a+1]===g && imageData.data[a+2]===b && imageData.data[a+3]===t){
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1; 
                            }else break;
                            if(imageData.data[a-imagepreview.width*4]>(r-th) && imageData.data[a-imagepreview.width*4]<(r+th) && imageData.data[a+1-imagepreview.width*4]>(g-th) && imageData.data[a+1-imagepreview.width*4]<(g+th) && imageData.data[a+2-imagepreview.width*4]>(b-th)&& imageData.data[a+2-imagepreview.width*4]<(b+th) && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xDown.push((a-(imagepreview.height-1)*imagepreview.width*4)/4); yDown.push(yUp[yUp.length-1]-2); }
                            }else isUpavail=false;
                        } yDown.pop();xDown.pop();
                    }else {
                        const x=xDown[xDown.length-1],y=yDown[yDown.length-1]; xDown.pop(); yDown.pop();
                        for(a=(x*4+y*imagepreview.width*4);a<(imagepreview.width*4+y*imagepreview.width*4);a+=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1; 
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]>(r-th) && imageData.data[a+imagepreview.width*4]<(r+th) && imageData.data[a+1+imagepreview.width*4]>(g-th) && imageData.data[a+1+imagepreview.width*4]<(g+th) && imageData.data[a+2+imagepreview.width*4]>(b-th)&& imageData.data[a+2+imagepreview.width*4]<(b+th) && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]>(r-th) && imageData.data[a-imagepreview.width*4]<(r+th) && imageData.data[a+1-imagepreview.width*4]>(g-th) && imageData.data[a+1-imagepreview.width*4]<(g+th) && imageData.data[a+2-imagepreview.width*4]>(b-th)&& imageData.data[a+2-imagepreview.width*4]<(b+th) && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                        isUpavail=isDownavail=false;
                        for(a=(x*4+y*imagepreview.width*4-4);a>=y*imagepreview.width*4;a-=4){
                            if(imageData.data[a]>(r-th) && imageData.data[a]<(r+th) && imageData.data[a+1]>(g-th) && imageData.data[a+1]<(g+th) && imageData.data[a+2]>(b-th) && imageData.data[a+2]<(b+th) && imageData.data[a+3]===t){
                                if(imageData.data[a]===r1 && imageData.data[a+1]===g1 && imageData.data[a+2]===b1 && imageData.data[a+3]===t1)break; // imageData.data[a]=(r1-r)*t1/255; imageData.data[a+1]=(g1-g)*t1/255; imageData.data[a+2]=(b1-b)*t1/255;
                                imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1; 
                            }else break;
                            if(imageData.data[a+imagepreview.width*4]>(r-th) && imageData.data[a+imagepreview.width*4]<(r+th) && imageData.data[a+1+imagepreview.width*4]>(g-th) && imageData.data[a+1+imagepreview.width*4]<(g+th) && imageData.data[a+2+imagepreview.width*4]>(b-th)&& imageData.data[a+2+imagepreview.width*4]<(b+th) && imageData.data[a+3+imagepreview.width*4]===t){
                                if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                            }else isDownavail=false;
                            if(imageData.data[a-imagepreview.width*4]>(r-th) && imageData.data[a-imagepreview.width*4]<(r+th) && imageData.data[a+1-imagepreview.width*4]>(g-th) && imageData.data[a+1-imagepreview.width*4]<(g+th) && imageData.data[a+2-imagepreview.width*4]>(b-th)&& imageData.data[a+2-imagepreview.width*4]<(b+th) && imageData.data[a+3-imagepreview.width*4]===t){
                                if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                            }else isUpavail=false;
                        }
                    }
                }
            }createundo("paintbucket","Paint Bucket"); ctx.putImageData(imageData,0,0); document.getElementById(currentlayer).src=imagepreview.toDataURL();
        }
    }else { //if current pixel is transparent
        var xUp=[],yUp=[],xDown=[],yDown=[],a; var isUpavail,isDownavail; if(ypos===imagepreview.height){xDown.push(xpos);yDown.push(ypos);}else{xUp.push(xpos);yUp.push(ypos);}
            while(xUp.length>0 || xDown.length>0){
                isUpavail=isDownavail=false;
                if(yUp.length>0)
                if(yUp[yUp.length-1]===0){
                    for(a=xUp[xUp.length-1]*4;a<imagepreview.width*4;a+=4){
                        if(imageData.data[a+3+imagepreview.width*4]===0){
                            if(!isDownavail){ isDownavail=true; xDown.push(a/4); yDown.push(yUp[yUp.length-1]+1); }
                        }else isDownavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    }
                    isUpavail=isDownavail=false;
                    for(a=xUp[xUp.length-1]*4-4;a>=0;a-=4){
                        if(imageData.data[a+3+imagepreview.width*4]===0){
                            if(!isDownavail){ isDownavail=true; xDown.push(a/4); yDown.push(yUp[yUp.length-1]+1); }
                        }else isDownavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1;  imageData.data[a+3]=t1;
                        }else break;
                    } yUp.pop();xUp.pop();
                }else{
                    const x=xUp[xUp.length-1],y=yUp[yUp.length-1]; xUp.pop(); yUp.pop();
                    for(a=(x*4+y*imagepreview.width*4);a<(imagepreview.width*4+y*imagepreview.width*4);a+=4){
                        if(imageData.data[a+3+imagepreview.width*4]===0){
                            if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                        }else isDownavail=false;
                        if(imageData.data[a+3-imagepreview.width*4]===0){
                            if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                        }else isUpavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    }
                    isUpavail=isDownavail=false;
                    for(a=(x*4+y*imagepreview.width*4-4);a>=y*imagepreview.width*4;a-=4){
                        if(imageData.data[a+3+imagepreview.width*4]===0){
                            if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                        }else isDownavail=false;
                        if(imageData.data[a+3-imagepreview.width*4]===0){
                            if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                        }else isUpavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    }
                }
                isUpavail=isDownavail=false;
                if(yDown.length>0)
                if(yDown[yDown.length-1]===imagepreview.height){
                    for(a=(xDown[xDown.length-1]*4+(yDown[yDown.length-1]-1)*4*imagepreview.width);a<(imagepreview.width*4+imagepreview.height*4*imagepreview.width);a+=4){
                        if(imageData.data[a+3-imagepreview.width*4]===0){
                            if(!isUpavail){ isUpavail=true; xUp.push((a-(imagepreview.height-1)*imagepreview.width*4)/4); yUp.push(yDown[yDown.length-1]-2); }
                        }else isUpavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    }
                    isUpavail=isDownavail=false;
                    for(a=(xDown[xDown.length-1]*4+(yDown[yDown.length-1]-1)*4*imagepreview.width)-4;a>=(yDown[yDown.length-1]-1)*4*imagepreview.width;a-=4){
                        if(imageData.data[a+3-imagepreview.width*4]===0){
                            if(!isUpavail){ isUpavail=true; xDown.push((a-(imagepreview.height-1)*imagepreview.width*4)/4); yDown.push(yUp[yUp.length-1]-2); }
                        }else isUpavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    } yDown.pop();xDown.pop();
                }else {
                    const x=xDown[xDown.length-1],y=yDown[yDown.length-1]; xDown.pop(); yDown.pop();
                    for(a=(x*4+y*imagepreview.width*4);a<(imagepreview.width*4+y*imagepreview.width*4);a+=4){
                        if(imageData.data[a+3+imagepreview.width*4]===0){
                            if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                        }else isDownavail=false;
                        if(imageData.data[a+3-imagepreview.width*4]===0){
                            if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                        }else isUpavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    }
                    isUpavail=isDownavail=false;
                    for(a=(x*4+y*imagepreview.width*4-4);a>=y*imagepreview.width*4;a-=4){
                        if(imageData.data[a+3+imagepreview.width*4]===0){
                            if(!isDownavail){ isDownavail=true; xDown.push((a-y*imagepreview.width*4)/4); yDown.push(y+1); }
                        }else isDownavail=false;
                        if(imageData.data[a+3-imagepreview.width*4]===0){
                            if(!isUpavail){ isUpavail=true; xUp.push((a-y*imagepreview.width*4)/4); yUp.push(y-1); }
                        }else isUpavail=false;
                        if(imageData.data[a+3]===0){
                            imageData.data[a]=r1; imageData.data[a+1]=g1; imageData.data[a+2]=b1; imageData.data[a+3]=t1;
                        }else break;
                    }
                }
            }createundo("paintbucket","Paint Bucket"); ctx.putImageData(imageData,0,0); document.getElementById(currentlayer).src=imagepreview.toDataURL();      
    }
    if(isTransparent){ console.log("isTransparent")

    }
}