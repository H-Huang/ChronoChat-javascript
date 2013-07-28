function onChatInterest(inst){
//need msgcache
    console.log('Chat Interest received in callback.');
    console.log(inst.name.to_uri());
    var content;
    var seq = parseInt(DataUtils.toString(inst.name.components[4]),16);/////
    //console.log("seq");
    //console.log(seq)
    for(var i = msgcache.length-1;i>=0;i--){
	//console.log("msgseq:"+msgcache[i].seqno);
        if(msgcache[i].seqno ==seq){
            content = {msg:msgcache[i].msg,type:msgcache[i].msgtype};
            JSON.stringify(content);
            break;
        }
    }
    //console.log(content);
    var str = JSON.stringify(content);
    var co = new ContentObject(inst.name,str);
    co.sign(mykey,{'keyName':mykeyname});
    
    try {
        ndn.send(co);
	} 
    catch (e) {
        console.log(e.toString());
    }    
}

function onChatData(inst,co){
    console.log("ContentObject received in callback");
    console.log('name'+co.name.to_uri());
    var content = JSON.parse(DataUtils.toString(co.content));
    var name = DataUtils.toString(co.name.components[1]);
    if (content.type =="chat"){
        //display on the screen
        var d = new Date();//get time
        var t = d.toLocaleTimeString();
        document.getElementById('txt').innerHTML +='<p>'+ name+'-'+t+':'+content.msg+'</p>';
    }
    else if(content.type == "leave"){
        var n = rosterfind(name);
        roster.splice(n,1);
    }
}

var rosterfind = function (name) {
    for (var i = 0;i<roster.length;i++){
        if(roster[i].name == name){
            return i;
        }
    }
};

var heart_timeout = function(interest) {
        console.log("Hearbeat Interest time out.");
        console.log('Hearbeat Interest name: ' + interest.name.to_uri());
                                  
    };
    
function heartbeat(){
    usrseq++;
    //console.log(usrseq);//////
    var content = [{name:usrname,seqno:usrseq}];
    //console.log(content);
    msgcache.push({seqno:usrseq,msgtype:"heartbeat",msg:"xxx"});
    while (msgcache.length>maxmsgcachelength)
        msgcache.shift();
    digest_tree.update(content);
    addlog(content);
    var n = new Name('/ndn/broadcast/chronos/'+chatroom+'/');
    n.append(DataUtils.toNumbers(digest_tree.root));
    var template = new Interest();
    template.answerOriginKind = Interest.ANSWER_NO_CONTENT_STORE;
    template.interestLifetime = 60000;
    ndn.expressInterest(n, template, onSyncData, sync_timeout);                
    console.log('Heartbeat Interest expressed.');          
}

function SendMessage(){
    var chatmsg = document.getElementById('fname').value;
    document.getElementById('fname').value = "";
    usrseq++;
    var content = [{name:usrname,seqno:usrseq}];
    msgcache.push({seqno:usrseq,msgtype:"chat",msg:chatmsg});
    while (msgcache.length>maxmsgcachelength)
        msgcache.shift();
    digest_tree.update(content);
    addlog(content);
    var n = new Name('/ndn/broadcast/chronos/'+chatroom+'/');
    n.append(DataUtils.toNumbers(digest_tree.root));
    var template = new Interest();
    template.answerOriginKind = Interest.ANSWER_NO_CONTENT_STORE;
    template.interestLifetime = 10000;
    ndn.expressInterest(n, template, onSyncData, sync_timeout);              
    console.log('Sync Interest expressed.');
    //console.log(template.name.to_uri());
    var d = new Date();//get time
    var t = d.toLocaleTimeString();
    document.getElementById('txt').innerHTML += '<p>'+ usrname+'-'+t+':'+chatmsg + '</p>';          
}

function Leave(){
    alert("Leaving the Chatroom...");
    var i = 0;
    digest_tree.root = "unavailable";
    setTimeout(function(){window.close();},2000);	
    //window.close();
}
