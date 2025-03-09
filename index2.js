
function undok(){
    if(undo[currentdocument][undo[currentdocument].length-1].name==="imageprocess"){
        const ctx2=imagepreview.getContext("2d");
        imagepreview.width=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).width; imagepreview.height=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).height;
        ctx2.putImageData(undo[currentdocument][undo[currentdocument].length-1].imageDataold,0,0);
        document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).src=imagepreview.toDataURL();
        if(undo[currentdocument].length>1){deselecthistory(); document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-2)).classList.add("activelayer");}
    }else if(undo[currentdocument][undo[currentdocument].length-1].name==="paintbucket"){
        const ctx2=imagepreview.getContext("2d");
        imagepreview.width=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).width; imagepreview.height=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).height;
        ctx2.putImageData(undo[currentdocument][undo[currentdocument].length-1].imageDataold,0,0);
        document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).src=imagepreview.toDataURL();
        if(undo[currentdocument].length>1){deselecthistory(); document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-2)).classList.add("activelayer");}
    }
}
function undokback(){
    const curhistory=getcurrenthistory(); if(curhistory===0)return; //console.log(curhistory);
    if(undo[currentdocument][curhistory].name==="imageprocess"){
        const ctx2=imagepreview.getContext("2d");
        imagepreview.width=document.getElementById(undo[currentdocument][curhistory].layer).width; imagepreview.height=document.getElementById(undo[currentdocument][curhistory].layer).height;
        ctx2.putImageData(undo[currentdocument][curhistory].imageDataold,0,0);
        document.getElementById(undo[currentdocument][curhistory].layer).src=imagepreview.toDataURL();
        if(curhistory>0){deselecthistory(); document.getElementById('history'+currentdocument+''+(curhistory-1)).classList.add("activelayer");}
    }else if(undo[currentdocument][undo[currentdocument].length-1].name==="paintbucket"){
        const ctx2=imagepreview.getContext("2d");
        imagepreview.width=document.getElementById(undo[currentdocument][curhistory].layer).width; imagepreview.height=document.getElementById(undo[currentdocument][curhistory].layer).height;
        ctx2.putImageData(undo[currentdocument][curhistory].imageDataold,0,0);
        document.getElementById(undo[currentdocument][curhistory].layer).src=imagepreview.toDataURL();
        if(curhistory>0){deselecthistory(); document.getElementById('history'+currentdocument+''+(curhistory-1)).classList.add("activelayer");}
    }
}

function undokindex(index){
console.log(index);
}

function redok(){console.log("redok");
    if(undo[currentdocument][undo[currentdocument].length-1].name==="imageprocess"){
        const ctx2=imagepreview.getContext("2d");
        imagepreview.width=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).width; imagepreview.height=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).height;
        ctx2.putImageData(undo[currentdocument][undo[currentdocument].length-1].imageDatanew,0,0);
        document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).src=imagepreview.toDataURL();
        deselecthistory(); document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-1)).classList.add("activelayer");
    }else if(undo[currentdocument][undo[currentdocument].length-1].name==="paintbucket"){
        const ctx2=imagepreview.getContext("2d");
        imagepreview.width=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).width; imagepreview.height=document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).height;
        ctx2.putImageData(undo[currentdocument][undo[currentdocument].length-1].imageDatanew,0,0);
        document.getElementById(undo[currentdocument][undo[currentdocument].length-1].layer).src=imagepreview.toDataURL();
        deselecthistory(); document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-1)).classList.add("activelayer");
    }
}

function createundo(process,processname){ 
    const curhistory=getcurrenthistory(); if(curhistory<undo[currentdocument].length-1){
        for(var m=curhistory+1;m<=undo[currentdocument].length-1;m++){
            document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-1)).remove();undo[currentdocument].pop();
        }
    } isundo=false;
    if(process==="imageprocess"){
        const imageprocess=new Object();
        imageprocess.name="imageprocess";
        imageprocess.layer=currentlayer;
        imageprocess.imageDataold=[];
        imageprocess.imageDatanew=[];

        const ctx=imagepreview.getContext("2d"); const img=document.getElementById(currentlayer);
        imageprocess.imageDataold=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
        ctx.drawImage(img,0,0);
        imageprocess.imageDatanew=ctx.getImageData(0,0,img.width,img.height);
        undo[currentdocument].push(imageprocess);
        const historynodes=document.getElementById('historydock'+currentdocument).childNodes;
        document.getElementById('historydock'+currentdocument).innerHTML+='<div id="history'+currentdocument+''+historynodes.length+'" class="history"><div><img id="historycheckbox'+currentdocument+''+historynodes.length+'" src="./public/img/document-outline.svg" onmousedown="" class="historyeye"></div><div class="historyname" onclick="undokindex('+historynodes.length+')">'+processname+'</div></div>';
        deselecthistory(); document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-1)).classList.add("activelayer");
    }else if(process==="paintbucket"){
        const imageprocess=new Object();
        imageprocess.name="paintbucket";
        imageprocess.layer=currentlayer;
        imageprocess.imageDataold=[]; imageprocess.imageDatanew=imageData;

        const ctx=imagepreview.getContext("2d");
        imageprocess.imageDataold=ctx.getImageData(0,0,imagepreview.width,imagepreview.height);
        undo[currentdocument].push(imageprocess);
        const historynodes=document.getElementById('historydock'+currentdocument).childNodes;
        document.getElementById('historydock'+currentdocument).innerHTML+='<div id="history'+currentdocument+''+historynodes.length+'" class="history"><div><img id="historycheckbox'+currentdocument+''+historynodes.length+'" src="./public/img/document-outline.svg" onmousedown="" class="historyeye"></div><div class="historyname" onclick="undokindex('+historynodes.length+')">'+processname+'</div></div>';
        deselecthistory(); document.getElementById('history'+currentdocument+''+(undo[currentdocument].length-1)).classList.add("activelayer");
    }
}

function getcurrenthistory(){ 
    const historynodes=document.getElementById('historydock'+currentdocument).childNodes;
    for(var a=0;a<historynodes.length;a++){
        if(document.getElementById(historynodes[a].id).classList.contains("activelayer")){return a;}
    }
}

function deselecthistory(){
    const historynodes=document.getElementById('historydock'+currentdocument).childNodes;
    for(var a=0;a<historynodes.length;a++){
        document.getElementById(historynodes[a].id).classList.remove("activelayer");
    }
}