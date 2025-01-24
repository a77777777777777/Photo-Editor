var ismenushowing,isdialogshowing;
var istexttoolboxactive=false;
var istransformchecked;
var ismousedown,islayermousedown,isdialogmousedown,iscanvasmousedown,istouchstart,isscalemousedown;
var xpos,ypos;
var xposmove,yposmove;
var DocumentsLayerCount=[];
var Documentsheight=[],Documentswidth=[],Documentsdpi=[];
var linknames=[];
var documentsccount,actualdoccount;
var currentdocument;
var isspacebardown,isctrldown;
var iscanvasmoved;
var imgxpos,imgypos;
var isdocumentsaved=[];
var currenttool;
var currentlayer;
var cancallpreview=0;
var timerID; 
var tempcanvas="",templayer="",tempstring="";
var imagepreview=document.createElement("canvas"); var img7=document.createElement("img");
var imageData;
var trimleft,trimtop,trimwidth,trimheight;
//document.addEventListener("contextmenu",(e)=>{e.preventDefault();});
timerID=setInterval(() => {
    if(actualdoccount>0 && cancallpreview>0){
        drawpreview();
        }
        if(cancallpreview>0)
            cancallpreview-=1;
    }, 50);

initialise();
createdocument('new');
function initialise(){
    ismenushowing=false; ismousedown=false; istouchstart=false;
    xpos=0,ypos=0; xposmove=0,yposmove=0;
    DocumentsLayerCount=[];
    documentsccount=0;
    actualdoccount=0;
    currentdocument=-1;
    isspacebardown=false; isctrldown=false; isdialogshowing=false;
    istransformchecked=false; document.getElementById("showtransformcheckbox").checked=false;
    imgxpos=0,imgypos=0;
    isdocumentsaved=[];
    currenttool="tmove";//"tshape";//"tmove";
    //setting font font and font size=16 as default size for text area 
    document.getElementById("texttool").style.fontFamily=document.getElementById("texttooloptionsfont").value;
    document.getElementById("texttool").style.fontSize=document.getElementById("texttooloptionsfsizetext").value+"px";
    defaultcolor();
    activatetool(currenttool);
}
window.addEventListener("resize",function(event){console.log(this.screen.height-this.screen.availHeight)});
document.addEventListener("keydown",function(event){keydown(event);});
document.addEventListener("keyup",function(){keyup();});
document.addEventListener("mouseup",function(){
    if(currenttool==="ttext") document.getElementById("texttool").focus();
    if(isspacebardown){ document.getElementById("doc"+currentdocument).style.cursor="grab";document.getElementById("transform").style.cursor="grab";}
    if(ismousedown && !isspacebardown){
        if(currenttool==="tshape" && !ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            //drawing objects
            trimimage();
            document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
            document.getElementById(currentlayer).style.left=trimleft+"px";
            document.getElementById(currentlayer).style.top=trimtop+"px";
            document.getElementById(currentlayer).src=imagepreview.toDataURL();
            //trimimage1(currentlayer);
        }else if(currenttool==="tbrush" && !ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            trimimage();
            document.getElementById(currentlayer).width=imagepreview.width;document.getElementById(currentlayer).height=imagepreview.height;
            document.getElementById(currentlayer).style.left=trimleft+"px";
            document.getElementById(currentlayer).style.top=trimtop+"px";
            document.getElementById(currentlayer).src=imagepreview.toDataURL();
        }
    }
ismousedown=false;isdialogmousedown=false;islayermousedown=false; if(isscalemousedown){isscalemousedown=false;showtransform();}tempcanvas="";templayer="";
if(currentlayer!="none")cancallpreview=3;document.getElementById("transform").style.cursor="default";

});

document.getElementById("workspace").addEventListener("wheel",function(event){
    if(event.ctrlKey){
        event.preventDefault();
        var height=Documentsheight[currentdocument];
        var width=Documentswidth[currentdocument];
        //if(event.deltaZ<0)
             zoom=event.deltaY*10; 
        document.getElementById("testmessage").innerText=zoom;
        document.getElementById("doc"+currentdocument).style.height=height-height*zoom/100+"px";
        document.getElementById("doc"+currentdocument).style.width=width-width*zoom/100+"px";
        const documentcurrent=document.getElementById("doc"+currentdocument).childNodes;
        
        document.getElementById("testmessage").innerText=document.getElementById(documentcurrent[0].id).clientWidth;
        for(var a=0;a<documentcurrent.length;a++){
            document.getElementById(documentcurrent[a].id).width=document.getElementById(documentcurrent[a].id).width-width*zoom/100;
            document.getElementById(documentcurrent[a].id).height=document.getElementById(documentcurrent[a].id).height-height*zoom/100;
        }


    }else{
        var object="doc"+currentdocument;
        var y=document.getElementById(object).style.top.slice(0,document.getElementById(object).style.top.length-2)*1-event.deltaY;
        var x=document.getElementById(object).style.left.slice(0,document.getElementById(object).style.left.length-2)*1-event.deltaX;
        //if project window goes off bound retain 10% of its height/width within working space area **if it goes negative
        if(x<(-document.getElementById(object).offsetWidth+50)) x=-document.getElementById(object).offsetWidth+50;
        if(y<(-document.getElementById(object).offsetHeight+50)) y=-document.getElementById(object).offsetHeight+50;
        if(x>((window.innerWidth*82/100)-50)) x=(window.innerWidth*82/100)-50;
        if(y>((window.innerHeight*93/100)-50)) y=(window.innerHeight*93/100)-50;
        document.getElementById(object).style.top=y+"px";
        document.getElementById(object).style.left=x+"px";
        if(currenttool==="tmove")showtransform();
    }
});

document.addEventListener("mousemove",function(event){mousemovenew(event);});

window.onclick = function(event) {
    if (!event.target.matches('.dropmenu')) {
        hidemenu()
    }
    console.log(event.target)
    if(currenttool==="tdrop" && !(event.target.matches('.tls1')||event.target.matches('.tlsimg'))){
        document.getElementById("colorf").style.backgroundColor=document.getElementById("eyedropcolor").style.backgroundColor;
        document.getElementById("forecolor").value=tempstring;
        activatetool("tmove");
    }
}

function mousemovenew(event){
    if(ismousedown && !isspacebardown && !isscalemousedown){
            //from canvass
            isdocumentsaved[currentdocument]=false;
            //var y=event.clientY-imgypos;
            //moving objects
        if(currenttool==="tmove" && currentlayer!="none"){
            iscanvasmoved=true;
            layers=[]; layers=getselectedlayers();
            if(layers[layers.length-1]==="allselected") layers.pop();
            if(layers.length===1){
                layers[0]=currentlayer.slice(1,currentlayer.length);
                if(document.getElementById("linkname"+layers[0]).name.length>0){
                    var linkedlayers=[];linkedlayers=getlinkedlayers(document.getElementById("linkname"+layers[0]).name);
                    //var x=event.clientX-xposmove,y=event.clienty-yposmove;
                    var x=event.screenX-xposmove,y=event.screenY-yposmove;
                    x-=document.getElementById(currentlayer).style.left.slice(0,document.getElementById(currentlayer).style.left.length-2)*1;
                    y=y-document.getElementById(currentlayer).style.top.slice(0,document.getElementById(currentlayer).style.top.length-2)*1;

                    for(var a=0;a<linkedlayers.length;a++){
                        document.getElementById("D"+linkedlayers[a]).style.top=document.getElementById("D"+linkedlayers[a]).style.top.slice(0,document.getElementById("D"+linkedlayers[a]).style.top.length-2)*1+y+"px";
                        document.getElementById("D"+linkedlayers[a]).style.left=document.getElementById("D"+linkedlayers[a]).style.left.slice(0,document.getElementById("D"+linkedlayers[a]).style.left.length-2)*1+x+"px";
                    }
                    if(istransformchecked){
                        document.getElementById(currentlayer).style.top=event.screenY-yposmove+"px";
                        document.getElementById(currentlayer).style.left=event.screenX-xposmove+"px";
                        showtransform();
                    }
                }else{
                    document.getElementById("testmessage").innerText="xposmove:"+xposmove+"yposmove:"+yposmove;
                    if(istransformchecked){
                        document.getElementById(currentlayer).style.top=event.screenY-yposmove+"px";
                        document.getElementById(currentlayer).style.left=event.screenX-xposmove+"px";
                        showtransform();
                    }else{ document.getElementById(currentlayer).style.top=event.screenY-yposmove+"px";
                        document.getElementById(currentlayer).style.left=event.screenX-xposmove+"px";
                    }
                }
            }else{
                var x=event.screenX-xposmove,y=event.screenY-yposmove;
                    if(istransformchecked){
                        x=x+document.getElementById("doc"+currentdocument).offsetLeft,y+=+document.getElementById("doc"+currentdocument).offsetTop;
                        var left=document.getElementById("transform").style.left.slice(0,document.getElementById("transform").style.left.length-2)*1-x;
                        var top=document.getElementById("transform").style.top.slice(0,document.getElementById("transform").style.top.length-2)*1-y;
                        document.getElementById("transform").style.top=y+"px";
                        document.getElementById("transform").style.left=x+"px";

                        for(var a=0;a<layers.length;a++){
                        document.getElementById("D"+layers[a]).style.top=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1-top+"px";
                        document.getElementById("D"+layers[a]).style.left=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1-left+"px";
                        }
                        //showtransform();
                    }else{
                        x-=document.getElementById(currentlayer).style.left.slice(0,document.getElementById(currentlayer).style.left.length-2)*1;
                        y=y-document.getElementById(currentlayer).style.top.slice(0,document.getElementById(currentlayer).style.top.length-2)*1;
                    for(var a=0;a<layers.length;a++){
                        document.getElementById("D"+layers[a]).style.top=document.getElementById("D"+layers[a]).style.top.slice(0,document.getElementById("D"+layers[a]).style.top.length-2)*1+y+"px";
                        document.getElementById("D"+layers[a]).style.left=document.getElementById("D"+layers[a]).style.left.slice(0,document.getElementById("D"+layers[a]).style.left.length-2)*1+x+"px";
                    }
                }
            }
        }else if(currenttool==="tshape" && !isspacebardown){
                if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
                var w=event.clientX-imgxpos-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
                var h=event.clientY-imgypos-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;;
                 
                const ctx1=imagepreview.getContext("2d");
                ctx1.clearRect(0,0,Documentswidth[currentdocument],Documentsheight[currentdocument]);
                ctx1.fillStyle =document.getElementById("colorf").style.backgroundColor;
                ctx1.fillRect(imgxpos, imgypos, w, h);
                document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
            }else showmessage("Select a layer to draw.");
        }else if(currenttool==="tbrush"){
            if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
                var x=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
                var y=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;;
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
                var y=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;;
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
            if(!ismultilayerselected()){
                if(tempstring==="right"){
                    var x=event.screenX-document.getElementById("transform").offsetLeft-document.getElementById("tools").offsetWidth;
                    if(x<=2)x=2;
                    document.getElementById(currentlayer).width=x;
                    const ctx=imagepreview.getContext("2d");
                    imagepreview.width=x;
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,x,img7.height);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                    document.getElementById("transformgrid").style.width=x+"px";
                }else if(tempstring==="left"){
                    var x=event.screenX-document.getElementById("tools").offsetWidth;
                    if((x-document.getElementById("doc"+currentdocument).offsetLeft)>(trimleft+trimwidth-2))x=trimleft+trimwidth-2+document.getElementById("doc"+currentdocument).offsetLeft;
                    document.getElementById("transform").style.left=x+"px";
                    x=x-document.getElementById("doc"+currentdocument).offsetLeft;
                    document.getElementById(currentlayer).style.left=x+"px";
                    
                    if(x<0) x=(trimwidth+trimleft)+Math.abs(x); else x=(trimwidth+trimleft)-x;
                    
                    document.getElementById(currentlayer).width=x; document.getElementById("transformgrid").style.width=x-3+"px";
                    const ctx=imagepreview.getContext("2d");
                    imagepreview.width=x;
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,x,img7.height);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else if(tempstring==="top"){
                    var y=event.clientY-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                    if((y-document.getElementById("doc"+currentdocument).offsetTop)>(trimtop+trimheight-2))y=trimheight+trimtop+document.getElementById("doc"+currentdocument).offsetTop-2;
                    document.getElementById("transform").style.top=y+"px";
                    document.getElementById(currentlayer).style.top=y-document.getElementById("doc"+currentdocument).offsetTop+"px";
                    y=y-document.getElementById("doc"+currentdocument).offsetTop;
                    if(y<0) y=(trimheight+trimtop)+Math.abs(y); else y=(trimheight+trimtop)-y;
                    document.getElementById(currentlayer).height=y; document.getElementById("transformgrid").style.height=y-2+"px";
                    const ctx=imagepreview.getContext("2d");
                    imagepreview.height=y;
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,img7.width,y);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }else{
                    var y=event.clientY-document.getElementById("transform").offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
                    if(y<=2)y=2;
                    document.getElementById(currentlayer).height=y;
                    const ctx=imagepreview.getContext("2d");
                    imagepreview.height=y; document.getElementById("transformgrid").style.height=y+"px";
                    ctx.drawImage(img7,0,0,img7.width,img7.height,0,0,img7.width,y);
                    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
                }
                //showtransform();
            }
        }
    }
}
function pagemousedown(event,object){
    xpos=event.clientX-document.getElementById(object).offsetLeft;//.style.left.slice(0,document.getElementById(object).style.left.length-2);
    ypos=event.clientY-document.getElementById(object).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;//.style.top.slice(0,document.getElementById(object).style.top.length-2);
    if(isspacebardown){
        document.getElementById(object).style.cursor="grabbing"; ismousedown=true;
    }else if(currenttool==="ttext" && document.getElementById("texttooldiv").classList.contains("hide")){
        istexttoolboxactive=true;
        document.getElementById("texttool").style.top=event.pageY+"px";document.getElementById("texttool").style.left=event.pageX+"px";
        document.getElementById("texttooldiv").classList.remove("hide");
        document.getElementById("drawtextcheckmark").classList.remove("hide"); document.getElementById("drawtextcancel").classList.remove("hide");
        changetextfont(); document.getElementById("texttool").value="";
    }else if(currenttool==="tshape"){
        imgxpos=event.clientX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
        imgypos=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
        imagepreview.height=Documentsheight[currentdocument];
        imagepreview.width=Documentswidth[currentdocument];
        if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            document.getElementById(currentlayer).height=imagepreview.height;document.getElementById(currentlayer).width=imagepreview.width;
            document.getElementById(currentlayer).style.left="0px";document.getElementById(currentlayer).style.top="0px";
            document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
        }
        ismousedown=true;
    }else if(currenttool==="tbrush"){
        imgxpos=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
        imgypos=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;;
        
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
            for(var a=(documentcanvas.length-1);a>=0;a--){ 
                var x, y; console.log(documentcanvas[a].id);
                x=xpos-document.getElementById("tools").offsetWidth;
                y=ypos;//-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight-document.getElementById("menu").offsetHeight;
                if(x>=document.getElementById(documentcanvas[a].id).offsetLeft && x<=(document.getElementById(documentcanvas[a].id).offsetLeft+document.getElementById(documentcanvas[a].id).offsetWidth))
                    if(y>=document.getElementById(documentcanvas[a].id).offsetTop && y<=(document.getElementById(documentcanvas[a].id).offsetTop+document.getElementById(documentcanvas[a].id).offsetHeight)){
                        var xc,yc;
                        xc=Math.round(x-document.getElementById(documentcanvas[a].id).offsetLeft);
                        yc=Math.round(y-document.getElementById(documentcanvas[a].id).offsetTop);
                        imagepreview.width=document.getElementById(documentcanvas[a].id).width;
                        imagepreview.height=document.getElementById(documentcanvas[a].id).height;
                        const ctx=imagepreview.getContext("2d"); ctx.drawImage(document.getElementById(documentcanvas[a].id),0,0);
                        const idata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height); document.getElementById("testmessage").innerText=idata.data[Math.round(((yc)*imagepreview.width*4+xc*4)-1)]+":"+(((yc)*imagepreview.width*4+xc*4)-1);
                        if(idata.data[((yc)*imagepreview.width*4+xc*4)-1]>0){ //console.log("opacity object "+documentcanvas[a].id);
                            xposmove=event.screenX-document.getElementById(documentcanvas[a].id).offsetLeft;
                            yposmove=event.screenY-document.getElementById(documentcanvas[a].id).offsetTop;
                            settempcanvas(documentcanvas[a].id); iscanvasmoved=false; iscanvasmousedown=true; ismousedown=true; 
                            break;
                        }
                    }
            }
            if(!ismousedown){ deselectlayers();hidelayerlink(); currentlayer="none"; hidetransform();}
        
    }else if(currenttool==="terase"){
        imgxpos=event.screenX-document.getElementById("doc"+currentdocument).offsetLeft-document.getElementById("tools").offsetWidth;
        imgypos=event.clientY-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;;
        
        imagepreview.height=Documentsheight[currentdocument];
        imagepreview.width=Documentswidth[currentdocument];
        if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
            document.getElementById(currentlayer).height=imagepreview.height;document.getElementById(currentlayer).width=imagepreview.width;
            document.getElementById(currentlayer).style.left="0px";document.getElementById(currentlayer).style.top="0px";
            //document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
        }
        ismousedown=true;
    }
}
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 
// MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!!  MENU OPTION FUNCTIONS START !!! 

function menushow(menu){
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
        showsliderpercent('saveasjpgslider'); previewjpg();
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
        const ctx=imagepreview.getContext("2d"); imagepreview.width=document.getElementById(currentlayer).width;imagepreview.height=document.getElementById(currentlayer).height;
        ctx.drawImage(document.getElementById(currentlayer),0,0);
        img7.src=imagepreview.toDataURL("image/png");
        trimwidth=document.getElementById(currentlayer).width;
        trimleft=document.getElementById(currentlayer).offsetLeft;
        trimheight=document.getElementById(currentlayer).height;
        trimtop=document.getElementById(currentlayer).offsetTop;
        if(action==="right" || action==="left"){document.getElementById("transform").style.cursor="e-resize";}
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
            if(!isctrldown){
            deselectlayers();
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
    }iscanvasmousedown=false;

}
function canvasmousemove(event,object){
    if(currenttool==="tmove" && ismousedown && tempcanvas!=""){
        if(!isctrldown){
            if(!ismultilayerselected()) {
                var layer=tempcanvas.slice(1,tempcanvas.length); //console.log(tempcanvas)
                currentlayer=tempcanvas;
                deselectlayers();
                document.getElementById("layer"+tempcanvas.slice(1,tempcanvas.length)).classList.add("activelayer");
                if(document.getElementById("linkname"+tempcanvas.slice(1,tempcanvas.length)).name.length>0)showlayerlink(tempcanvas.slice(1,tempcanvas.length));
            }else {
                if(currentlayer!=tempcanvas){
                    var layers=[]; layers=getselectedlayers(); if(layers[layers.length-1]==="allselected")layers.pop();
                    var istempcanvasselected=false;
                    for(var a=0;a<layers.length;a++)if(layers[a]===tempcanvas.slice(1,tempcanvas.length)){ istempcanvasselected=true;break;}
                    if(!istempcanvasselected){
                        deselectlayers(); currentlayer=tempcanvas;
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
    if(ismousedown && isspacebardown){
            var y=event.clientY-ypos-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight;
            var x=event.clientX-xpos; 
            document.getElementById("testmessage").innerText=document.getElementById("transform").offsetLeft+":"+document.getElementById("doc"+currentdocument).offsetLeft
            console.log(event.clientX+"mx:my"+event.clientY);
            console.log(document.getElementById(object).style.left+"lft::tp"+document.getElementById(object).style.top)
            //if project window goes off bound retain 10% of its height/width within working space area **if it goes negative
            if(x<(-document.getElementById(object).offsetWidth+50)) x=-document.getElementById(object).offsetWidth+50;
            if(y<(-document.getElementById(object).offsetHeight+50)) y=-document.getElementById(object).offsetHeight+50;
            if(x>((window.innerWidth*82/100)-50)) x=(window.innerWidth*82/100)-50;
            if(y>((window.innerHeight*93/100)-50)) y=(window.innerHeight*93/100)-50;
            console.log(x+"x:y"+y);
            document.getElementById(object).style.top=y+"px"; document.getElementById(object).style.left=x+"px"; 
            showtransform();
    }
}
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
            var sizestring=Math.floor(size)+"."; console.log(sizestring)
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
function showsliderpercent(sliderid){
    document.getElementById(sliderid+"pc").innerText= document.getElementById(sliderid).value+"%";
}
function createdocument(nwidth,nheight,ndpi){
    if(nwidth>1){
        var height=nheight,width=nwidth;
        var top,left;
        var previewimageheight=window.innerHeight*4/100,previewimagewidth;
        if(height===width) previewimagewidth=previewimageheight; else previewimagewidth=(width/height)*previewimageheight;
        top=(window.innerHeight-document.getElementById("tooloptions").offsetHeight*2)/2-height/2;
        left=(window.innerWidth-document.getElementById("layerbox").offsetWidth)/2-width/2;
        tempstring=documentsccount;
        document.getElementById("projecttitle").innerHTML=document.getElementById("projecttitle").innerHTML+"<div id='title"+documentsccount+"' class='documenttitle' onclick='showdocument("+tempstring+")'><div style='overflow:hidden;text-wrap:nowrap;'>&nbsp;New Project</div><div class='closebtn'><a onclick='checksaved("+tempstring+")'>X</a></div></div>";
        tempstring="'"+"D"+documentsccount+"1"+"'";
        document.getElementById("projects").innerHTML=document.getElementById("projects").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='clip-path:inset(0px);width:"+width+"px;height:"+height+"px;top:"+top+"px;left:"+left+"px' onmousedown="+String.fromCharCode(34)+"pagemousedown(event,'doc"+documentsccount+"')"+String.fromCharCode(34)+"><img draggable='false' class='canvass' id='D"+documentsccount+"1' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tempstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tempstring+")"+String.fromCharCode(34)+"/></div>";
        document.getElementById("layerbox").innerHTML+="<div id='layerbox"+documentsccount+"'><div id='layerdock"+documentsccount+"' class='layerbox'><div id='layer"+documentsccount+"1' class='layer activelayer layerdrag' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'  onmousemove="+String.fromCharCode(34)+"activatelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"selectlayer('"+documentsccount+"1')"+String.fromCharCode(34)+"><div><img id='eye"+documentsccount+"1' src='./public/img/eye.svg' onclick="+String.fromCharCode(34)+"hidelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+documentsccount+"1' src='' class='layerpreview layerdrag' style='height:"+previewimageheight+"px;width:"+previewimagewidth+"px;'></div><div><img id='link"+documentsccount+"1' src='' class='layerlink layerdrag'><input type='text' hidden value='' id='linkname"+documentsccount+"1'></div><div id='name"+documentsccount+"1' class='layername layerdrag'>Layer 1</div></div></div></div>";
        Documentsheight.push(height); Documentswidth.push(width); Documentsdpi.push(72);
        currentlayer="D"+documentsccount+"1";    
    }else{
    hidedialog('new');
    var height=document.getElementById("newheight").value; width=document.getElementById("newwidth").value;
    var top,left;
    var previewimageheight=window.innerHeight*4/100,previewimagewidth;
    if(height===width) previewimagewidth=previewimageheight; else previewimagewidth=(width/height)*previewimageheight;
    top=(window.innerHeight-document.getElementById("tooloptions").offsetHeight*2)/2-height/2;
    left=(window.innerWidth-document.getElementById("layerbox").offsetWidth)/2-width/2;
    tempstring=documentsccount;
    document.getElementById("projecttitle").innerHTML=document.getElementById("projecttitle").innerHTML+"<div id='title"+documentsccount+"' class='documenttitle' onclick='showdocument("+tempstring+")'><div style='overflow:hidden;text-wrap:nowrap;'>&nbsp;New Project</div><div class='closebtn'><a onclick='checksaved("+tempstring+")'>X</a></div></div>";
    tempstring="'"+"D"+documentsccount+"1"+"'";
    document.getElementById("projects").innerHTML=document.getElementById("projects").innerHTML+"<div id='doc"+documentsccount+"' class='document1' style='clip-path:inset(0px);width:"+width+"px;height:"+height+"px;top:"+top+"px;left:"+left+"px' onmousedown="+String.fromCharCode(34)+"pagemousedown(event,'doc"+documentsccount+"')"+String.fromCharCode(34)+"><img draggable='false' class='canvass' id='D"+documentsccount+"1' height='0px' width='0px' onmousemove="+String.fromCharCode(34)+"canvasmousemove(event,"+tempstring+")"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"canvasmouseup(event,"+tempstring+")"+String.fromCharCode(34)+"/></div>";
    document.getElementById("layerbox").innerHTML+="<div id='layerbox"+documentsccount+"'><div id='layerdock"+documentsccount+"' class='layerbox'><div id='layer"+documentsccount+"1' class='layer activelayer layerdrag' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'  onmousemove="+String.fromCharCode(34)+"activatelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+documentsccount+"1')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"selectlayer('"+documentsccount+"1')"+String.fromCharCode(34)+"><div><img id='eye"+documentsccount+"1' src='./public/img/eye.svg' onclick="+String.fromCharCode(34)+"hidelayer('"+documentsccount+"1')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+documentsccount+"1' src='' class='layerpreview layerdrag' style='height:"+previewimageheight+"px;width:"+previewimagewidth+"px;'></div><div><img id='link"+documentsccount+"1' src='' class='layerlink layerdrag'><input type='text' hidden value='' id='linkname"+documentsccount+"1'></div><div id='name"+documentsccount+"1' class='layername layerdrag'>Layer 1</div></div></div></div>";
    Documentsheight.push(document.getElementById("newheight").value);
    Documentswidth.push(document.getElementById("newwidth").value);
    Documentsdpi.push(document.getElementById("newdpi").value);
    currentlayer="D"+documentsccount+"1"; //document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    }
    DocumentsLayerCount.push(1);
    actualdoccount+=1;
    isdocumentsaved.push(false);
    currentdocument=documentsccount;
    linknames[currentdocument]=new Array(); linknames[currentdocument].push(0);
    documentsccount+=1;
    showdocument(currentdocument);
}
function openfile(){
    for(var a=0;a<document.getElementById("fileopen").files.length;a++){
        const img=document.createElement("img");
        img.src=URL.createObjectURL(document.getElementById("fileopen").files[a]);
        img.onload=function(){
        createdocument(img.width,img.height);
        imagepreview.width=img.width;
        imagepreview.height=img.height;
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
    //console.log(canvas.height+":"+canvas.width)
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
    save(); closedocument();    
}
function checksaved(doc){
    if(isdocumentsaved[doc]){ closedocument();
    }else{ document.getElementById("closingdocument").classList.remove("hide"); }
}
function showdocument(doc){
    currentdocument=doc;
    /*const documentcurrent=document.getElementById("projecttitle").childNodes;
    console.log(documentcurrent[0]+documentcurrent.length)
    for(var a=0;a<documentcurrent.length;a++){
            documentcurrent[a].classList.remove("titleborder");
            document.getElementById("doc"+documentcurrent[a].id.slice(5,documentcurrent[a].id.length)).classList.add("hide");
            document.getElementById("layerbox"+documentcurrent[a].id.slice(5,documentcurrent[a].id.length)).classList.add("hide");
        }*/
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
    currentlayer=getcurrentlayer();
    if(currentlayer!="none" && currenttool==="tmove")showtransform();
}

//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
//^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START^^^^ TOOLS FUNCTIONS START
// MOVE TOOL FUNCTIONS //
function hidetransform(){document.getElementById("transform").classList.add("hide");}
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
    if(document.getElementById(element).checked){istransformchecked=true; if(currentlayer!="none")showtransform();}
    else{hidetransform(); istransformchecked=false;} 
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
function setcolor(){
    document.getElementById("colorf").style.backgroundColor=document.getElementById("forecolor").value;
    document.getElementById("colorb").style.backgroundColor=document.getElementById("backcolor").value;
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
        document.getElementById("drawtextcheckmark").classList.add("hide");
        document.getElementById("drawtextcancel").classList.add("hide");
        istexttoolboxactive=false;
    }
    if(currenttool==="tdrop" || currenttool==="tbucket" || currenttool==="ttext" || currenttool==="terase" || currenttool==="tbrush" || currenttool==="tcrop"){
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
    }else if(currenttool==="ttext") {
        document.getElementById("texttooloptions").classList.remove("hide");
        document.getElementById("doc"+currentdocument).style.cursor="text";
    }else if(currenttool==="tbucket") {
        document.getElementById("cursor").src="./public/img/color-fill-outline.svg"
        document.querySelector("html").style.cursor="none";
        document.getElementById("doc"+currentdocument).style.cursor="none";
    }else if(currenttool==="tmove"){
        showtransform();
        document.getElementById("movetooloptions").classList.remove("hide");
    }else if(currenttool==="tcrop"){
        document.getElementById("doc"+currentdocument).style.cursor="crosshair";
    }

}
function deactivatetools(){
    hidetransform();
    document.getElementById("movetooloptions").classList.add("hide");
    document.getElementById("cursor").classList.add("hide");
    document.getElementById("eyedropcolor").classList.add("hide");
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
    document.getElementById("texttool").style.fontSize=document.getElementById("texttooloptionsfsizetext").value+"px";
    document.getElementById("texttoolcolorpicker").style.backgroundColor=document.getElementById("texttoolcolor").value;
}
function opentexttoolcolor(){
    document.getElementById("texttoolcolor").click();;
}
function canceldrawtext(){
    document.getElementById("drawtextcancel").classList.add("hide");
    document.getElementById("drawtextcheckmark").classList.add("hide");
    document.getElementById("texttooldiv").classList.add("hide");
    istexttoolboxactive=false;
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
        document.getElementById(currentlayer).width=canvas1.width;
        document.getElementById(currentlayer).height=canvas1.height;
        document.getElementById(currentlayer).style.left=document.getElementById("texttool").offsetLeft-document.getElementById("tools").offsetWidth-document.getElementById("doc"+currentdocument).offsetLeft+"px";
        document.getElementById(currentlayer).style.top=document.getElementById("texttool").offsetTop-document.getElementById("doc"+currentdocument).offsetTop-document.getElementById("menu").offsetHeight-document.getElementById("tooloptions").offsetHeight-document.getElementById("projecttitle").offsetHeight-trimtop+"px";
        document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");//document.getElementById("drawingcanvas").toDataURL("image/png");
    }
    document.getElementById("drawtextcheckmark").classList.add("hide");
    document.getElementById("drawtextcancel").classList.add("hide");
    document.getElementById("texttooldiv").classList.add("hide");
}
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
function selectlayer(layer){
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
    var layeractive=gettopmostactivelayer();
    linknames[currentdocument].push(0);
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
    document.getElementById("layerdock"+currentdocument).innerHTML+="<div id='layer"+tempstring+"' class='layer activelayer layerdrag' draggable='true' ondragleave='layerdragleave(event)' ondragover='layerdragover(event)' ondragstart='layerdragstart(event)' ondrop='layerdrop(event)'  onmousemove="+String.fromCharCode(34)+"activatelayer('"+tempstring+"')"+String.fromCharCode(34)+" onmousedown="+String.fromCharCode(34)+"settemplayer('"+tempstring+"')"+String.fromCharCode(34)+" onmouseup="+String.fromCharCode(34)+"selectlayer('"+tempstring+"')"+String.fromCharCode(34)+"><div><img id='eye"+tempstring+"' src='./public/img/eye.svg' alt='altname' onclick="+String.fromCharCode(34)+"hidelayer('"+tempstring+"')"+String.fromCharCode(34)+" class='layereye layerdrag'></div><div><img id='preview"+tempstring+"' src='' class='layerpreview layerdrag' style='height:"+previewimageheight+"px;width:"+previewimagewidth+"px;'></div><div><img id='link"+tempstring+"' src='' class='layerlink layerdrag'><input type='text' hidden value='' id='linkname"+tempstring+"'></div><div id='name"+tempstring+"' class='layername layerdrag'>Layer "+getnewlayername()+"</div></div>";
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
                    for(var a=0;a<layers.length;a++) console.log(document.getElementById("linkname"+layers[a]).name)
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
        console.log(layers.length+":"+layers)
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
    if(event.ctrlKey)isctrldown=true;
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
        if(event.key==="v" || event.key==="V"){
            activatetool("tmove");
        }else if(event.key==="x" || event.key==="x"){defaultcolor();
        }else if(event.key==="Delete"){
            deletelayer();
        }else if(event.key==="t" || event.key==="T"){
            activatetool("ttext");
        }else if(event.key===" " && !ismousedown){
            if(!isspacebardown){ isspacebardown=true;
            if(!ismenushowing && !isdialogshowing){ document.getElementById("doc"+currentdocument).style.cursor="grab";document.getElementById("transform").style.cursor="grab";}
            }
        }else if(event.key==="f" || event.key==="F"){ togglefullscreen();
        }
    }
    if(currenttool==="tdrop"){
        activatetool("tmove");
    } 
}
function keyup(){
    if(isspacebardown){
         document.getElementById("doc"+currentdocument).style.cursor="default";
         document.getElementById("transform").style.cursor="default";
         mousedown=false;
        isspacebardown=false;
    }
    isctrldown=false;
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
    const ctx1=imagepreview.getContext("2d");
    var xml=new XMLSerializer().serializeToString(document.getElementById("svg10"));
    var svg64=btoa(xml);
    var svg64star="data:image/svg+xml;base64,"+svg64;
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
    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    //trimimage1();
}
function test(){
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
var url = DOMURL.createObjectURL(svg);
img.src=svg;
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
var top=0,left=0,bottom=0,right=0,w=3,h;
var canvasleft,canvastop;
canvasleft=canvas1.style.left.slice(0,canvas1.style.left.length-2)*1;
canvastop=canvas1.style.top.slice(0,canvas1.style.top.length-2)*1;
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
    canvas1.height=canvas1.height-top-bottom;
    ctx1.putImageData(idata,0,0);
    imagedata=ctx1.getImageData(0,0,canvas1.width,canvas1.height);
    //ctx1.scale(2,2);
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
    canvas1.width=canvas1.width-left-right;
    ctx1.putImageData(idata,0,0);
    //ctx1.scale(2,2);
    //canvas1.style.left=canvasleft+left+"px";
    //canvas1.style.top=canvastop+top+"px";
    //console.log(imagedata.data.length/4)ps
    trimleft=left;trimtop=top;
    console.log("top="+top+"bottom="+bottom+"left="+left+"right="+right)

}

/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
/// *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** *** IMAGE MENU FUNCTIONS START *** ///
function showimagemenudialog(dialog){
    if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
        if(dialog==="invert"){
            invertimage(); return;
        }
        const img=document.getElementById(currentlayer);
        imagepreview.width=img.width;
        imagepreview.height=img.height;
        var ctx=imagepreview.getContext("2d");
        ctx.drawImage(img,0,0,img.width,img.height);//,img.offsetLeft,img.offsetTop,img.width,img.height);
        //ctx.putImageData(document.getElementById(currentlayer).getContext("2d").getImageData(0,0,imagepreview.width,imagepreview.height),0,0);
        resetbrightnesscontrastslider();
        document.getElementById(dialog).classList.remove("hide");
    }else{
        showmessage("Layer not editable!");
    }
}
function hideimagemenudialog(dialog){
    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    hidedialog(dialog);
}
function invertimage(){
    if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
        const img=document.getElementById(currentlayer);
        imagepreview.width=img.width;
        imagepreview.height=img.height;
        var ctx=imagepreview.getContext("2d");
        ctx.drawImage(img,0,0,img.width,img.height,0,0,img.width,img.height);
        var imagedata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
        for(var a=0;a<imagedata.data.length;a+=4){
            imagedata.data[a]=255-imagedata.data[a];
            imagedata.data[a+1]=255-imagedata.data[a+1];
            imagedata.data[a+2]=255-imagedata.data[a+2];
        }
       ctx.putImageData(imagedata,0,0);
       img.src=imagepreview.toDataURL("image/png");
    }
}
function brightnessimage(){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    if(document.getElementById("brightnesscontrastpreviewcheckbox").checked){
        var imagedata=ctx2.getImageData(0,0,canvas1.width,canvas1.height);
        for(var a=0;a<imagedata.data.length;a+=4){
                imagedata.data[a]=imagedata.data[a]+document.getElementById("brightnessimageslider").value*1;
                imagedata.data[a+1]=imagedata.data[a+1]+document.getElementById("brightnessimageslider").value*1;
                imagedata.data[a+2]=imagedata.data[a+2]+document.getElementById("brightnessimageslider").value*1;
                if(imagedata.data[a]<0) imagedata.data[a]=0;
                else if(imagedata.data[a]>255) imagedata.data[a]=255;
                if(imagedata.data[a+1]<0) imagedata.data[a+1]=0;
                else if(imagedata.data[a+1]>255) imagedata.data[a+1]=255;
                if(imagedata.data[a+2]<0) imagedata.data[a+2]=0;
                else if(imagedata.data[a+2]>255) imagedata.data[a+2]=255;
        }
       ctx1.putImageData(imagedata,0,0);
    }else ctx1.putImageData(ctx2.getImageData(0,0,canvas1.width,canvas1.height),0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}
function contrastimage(){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    if(document.getElementById("brightnesscontrastpreviewcheckbox").checked){
        var imagedata=ctx2.getImageData(0,0,canvas1.width,canvas1.height); var max,min;
        var imagedata2=imagedata;
        for(var a=0;a<imagedata.data.length;a+=4){
            
            imagedata.data[a]=imagedata.data[a]+document.getElementById("brightnessimageslider").value*1;
            imagedata.data[a+1]=imagedata.data[a+1]+document.getElementById("brightnessimageslider").value*1;
            imagedata.data[a+2]=imagedata.data[a+2]+document.getElementById("brightnessimageslider").value*1;
            
            if(imagedata2.data[a]<127)imagedata.data[a]-=document.getElementById("contrastimageslider").value*1;
            else imagedata.data[a]+=document.getElementById("contrastimageslider").value*1;
            if(imagedata2.data[a+1]<127)imagedata.data[a+1]-=document.getElementById("contrastimageslider").value*1;
            else imagedata.data[a+1]+=document.getElementById("contrastimageslider").value*1;
            if(imagedata2.data[a+2]<12)imagedata.data[a+2]-=document.getElementById("contrastimageslider").value*1;
            else if(imagedata2.data[a+2]>177) imagedata.data[a+2]+=document.getElementById("contrastimageslider").value*1;
        }
       ctx1.putImageData(imagedata,0,0);
    }else ctx1.putImageData(ctx2.getImageData(0,0,canvas1.width,canvas1.height),0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    console.log(imagedata.data)
}
function contrastimage2(){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    if(document.getElementById("brightnesscontrastpreviewcheckbox").checked){
        var imagedata=ctx2.getImageData(0,0,canvas1.width,canvas1.height); var max,min;
        for(var a=0;a<imagedata.data.length;a+=4){
            max=(imagedata.data[a]+imagedata.data[a+1]+imagedata.data[a+2])/3;
            if(max<127){
                imagedata.data[a]-=document.getElementById("brightnessimageslider").value*1;
                imagedata.data[a+1]-=document.getElementById("brightnessimageslider").value*1;
                imagedata.data[a+2]-=document.getElementById("brightnessimageslider").value*1;
        }else{
            imagedata.data[a]+=document.getElementById("brightnessimageslider").value*1;
            imagedata.data[a+1]+=document.getElementById("brightnessimageslider").value*1;
            imagedata.data[a+2]+=document.getElementById("brightnessimageslider").value*1;
        }
        }
       ctx1.putImageData(imagedata,0,0);
    }else ctx1.putImageData(ctx2.getImageData(0,0,canvas1.width,canvas1.height),0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}
function previewbrightnessimage(element){
    if(element==="brightnessimagetbox"){
        if(!(document.getElementById("brightnessimagetbox").value<100)){
            document.getElementById("brightnessimagetbox").value=0;
            document.getElementById("brightnessimagetbox").select();
        }    
    document.getElementById("brightnessimageslider").value=document.getElementById("brightnessimagetbox").value;
    }else document.getElementById("brightnessimagetbox").value=document.getElementById("brightnessimageslider").value;
    //brightnessimage();
    contrastimage();
}
function previewcontrastimage(element){
    if(element==="contrastimagetbox"){
        if(!(document.getElementById("contrastimagetbox").value<150)){
            document.getElementById("contrastimagetbox").value=0;
            document.getElementById("contrastimagetbox").select();
        }    
    document.getElementById("contrastimageslider").value=document.getElementById("contrastimagetbox").value;
    }else document.getElementById("contrastimagetbox").value=document.getElementById("contrastimageslider").value;
    contrastimage();
}
function changebrightnesscontrast(){
        const ctx=imagepreview.getContext("2d");
        var imagedata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
        for(var a=0;a<imagedata.data.length;a+=4){
            imagedata.data[a]=imagedata.data[a]+document.getElementById("brightnessimageslider").value*1;
            imagedata.data[a+1]=imagedata.data[a+1]+document.getElementById("brightnessimageslider").value*1;
            imagedata.data[a+2]=imagedata.data[a+2]+document.getElementById("brightnessimageslider").value*1;
            if(imagedata.data[a]<0) imagedata.data[a]=0;
            else if(imagedata.data[a]>255) imagedata.data[a]=255;
            if(imagedata.data[a+1]<0) imagedata.data[a+1]=0;
            else if(imagedata.data[a+1]>255) imagedata.data[a+1]=255;
            if(imagedata.data[a+2]<0) imagedata.data[a+2]=0;
            else if(imagedata.data[a+2]>255) imagedata.data[a+2]=255;
            }
       ctx.putImageData(imagedata,0,0);
       document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
       hidedialog("brightnesscontrast");
}
function resetbrightnesscontrastslider(){
    document.getElementById("brightnessimageslider").value=0;
    document.getElementById("brightnessimagetbox").value=0;
    document.getElementById("contrastimageslider").value=0;
    document.getElementById("contrastimagetbox").value=0;
    brightnessimage();
}
function previewcolorbalanceimage(element){
    if(element==="colorbalancebluetbox"){
        if(!(document.getElementById("colorbalancebluetbox").value<100)){
        document.getElementById("colorbalancebluetbox").value=0;
        document.getElementById("colorbalancebluetbox").select();
        }    
        document.getElementById("colorbalanceblueslider").value=document.getElementById("colorbalancebluetbox").value;
    }else document.getElementById("colorbalancebluetbox").value=document.getElementById("colorbalanceblueslider").value;

    if(element==="colorbalancegreentbox"){
        if(!(document.getElementById("colorbalancegreentbox").value<100)){
        document.getElementById("colorbalancegreentbox").value=0;
        document.getElementById("colorbalancegreentbox").select();
        }    
        document.getElementById("colorbalancegreenslider").value=document.getElementById("colorbalancegreentbox").value;
    }else document.getElementById("colorbalancegreentbox").value=document.getElementById("colorbalancegreenslider").value;

    if(element==="colorbalanceredtbox"){
        if(!(document.getElementById("colorbalanceredtbox").value<100)){
        document.getElementById("colorbalanceredtbox").value=0;
        document.getElementById("colorbalanceredtbox").select();
        }    
        document.getElementById("colorbalanceredslider").value=document.getElementById("colorbalanceredtbox").value;
    }else document.getElementById("colorbalanceredtbox").value=document.getElementById("colorbalanceredslider").value;

    colorbalanceimage();
}
function colorbalanceimage(){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    const ctx2=imagepreview.getContext("2d");
    canvas1.width=imagepreview.width; canvas1.height=imagepreview.height;
    if(document.getElementById("colorbalancepreviewcheckbox").checked){
        var imagedata=ctx2.getImageData(0,0,canvas1.width,canvas1.height);
        for(var a=0;a<imagedata.data.length;a+=4){
                imagedata.data[a]=imagedata.data[a]+document.getElementById("colorbalanceredslider").value*1;
                imagedata.data[a+1]=imagedata.data[a+1]+document.getElementById("colorbalancegreenslider").value*1;
                imagedata.data[a+2]=imagedata.data[a+2]+document.getElementById("colorbalanceblueslider").value*1;
        }
       ctx1.putImageData(imagedata,0,0);
    }else ctx1.putImageData(ctx2.getImageData(0,0,canvas1.width,canvas1.height),0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
}
function resetcolorbalanceslider(){
    document.getElementById("colorbalanceredslider").value=0;
    document.getElementById("colorbalanceredtbox").value=0;
    document.getElementById("colorbalancegreenslider").value=0;
    document.getElementById("colorbalancegreentbox").value=0;
    document.getElementById("colorbalanceblueslider").value=0;
    document.getElementById("colorbalancebluetbox").value=0;
    colorbalanceimage();
}
function changecolorbalance(){
    const ctx=imagepreview.getContext("2d");
    var imagedata=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
        for(var a=0;a<imagedata.data.length;a+=4){
                imagedata.data[a]=imagedata.data[a]+document.getElementById("colorbalanceredslider").value*1;
                imagedata.data[a+1]=imagedata.data[a+1]+document.getElementById("colorbalancegreenslider").value*1;
                imagedata.data[a+2]=imagedata.data[a+2]+document.getElementById("colorbalanceblueslider").value*1;
                if(imagedata.data[a]<0) imagedata.data[a]=0;
                else if(imagedata.data[a]>255) imagedata.data[a]=255;
                if(imagedata.data[a+1]<0) imagedata.data[a+1]=0;
                else if(imagedata.data[a+1]>255) imagedata.data[a+1]=255;
                if(imagedata.data[a+2]<0) imagedata.data[a+2]=0;
                else if(imagedata.data[a+2]>255) imagedata.data[a+2]=255;
        }
    ctx.putImageData(imagedata,0,0);
    document.getElementById(currentlayer).src=imagepreview.toDataURL("image/png");
    hidedialog("colorbalance");
}
function blackandwhite(){
    if(!ismultilayerselected() && islayereditable(currentlayer.slice(1,currentlayer.length))){
    const canvas1=document.createElement('canvas');
    const ctx1=canvas1.getContext("2d");
    canvas1.width=document.getElementById(currentlayer).width; canvas1.height=document.getElementById(currentlayer).height;
    ctx1.drawImage(document.getElementById(currentlayer),0,0,canvas1.width,canvas1.height,0,0,canvas1.width,canvas1.height);
        var imagedata=ctx1.getImageData(0,0,canvas1.width,canvas1.height);
        for(var a=0;a<imagedata.data.length;a+=4){
                imagedata.data[a]=(imagedata.data[a+2]+imagedata.data[a+1]+imagedata.data[a])/3;
                imagedata.data[a+1]=imagedata.data[a];
                imagedata.data[a+2]=imagedata.data[a];
        }
       ctx1.putImageData(imagedata,0,0);
    document.getElementById(currentlayer).src=canvas1.toDataURL("image/png");
    }else showmessage("Layer is not editable.");
}
function rotateimage(deg){
    if(currentlayer!="none") if(!ismultilayerselected() && document.getElementById(currentlayer).width===0)return;
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
    if(currentlayer!="none") if(!ismultilayerselected() && document.getElementById(currentlayer).width===0)return;
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
    if(currentlayer!="none") if(!ismultilayerselected() && document.getElementById(currentlayer).width===0)return;
    
    const ctx=imagepreview.getContext("2d");
    imagepreview.height=document.getElementById(currentlayer).height;
    imagepreview.width=x;
    ctx.putImageData(imageData,0,0,0,0,x,imagepreview.height);
}
function copyimage(){
    if(currentlayer!="none") if(!ismultilayerselected() && document.getElementById(currentlayer).width===0)return;
    
}
function pasteimage(){


    if(istransformchecked)showtransform();
}
function scaleimage(){

}