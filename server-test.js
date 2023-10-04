

var cors = require('cors');
const express = require('express');
const path = require('path');
var http = require("http");
const socket = require('socket.io')
const app = express();
const bodyParser = require('body-parser');
const webrtc = require("wrtc");
const fs = require('fs');
app.use(express.static(path.join(__dirname, 'public'))); // load static resource
const server = http.createServer(app)
const io = socket(server); // use express to handle http server

// Routing

// var app1 = require('./app');
// var http1 = require('http');
// var port1 = process.env.PORT || 5000;
var port2 = process.env.PORT || 3000;
let senderStream ;
let senderStream2 ;
let senderStream3 ;
let senderStream4 ;
var streamer = [4];
var streamsdp = [];//如果改用MESH要用
var streamcount = 0;
var users = 0;
var localcandidate1 = [];
var localcandidate2 = [];
var isserver = false
var roomnum = null;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var userAr = [];
var streamstate = [false,false,false,false]
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

// app.post("/consumer", async ({ body }, res) => {

//     console.log("------"+ body.peernum +"------");
//     const peer = new webrtc.RTCPeerConnection({
//         iceServers: [
//             {
//                 "urls": ["stun:stun.l.google.com:19302", 
//                 "stun:stun1.l.google.com:19302", 
//                 "stun:stun2.l.google.com:19302"]
//             }
//         ]
//     });
//     const desc = new webrtc.RTCSessionDescription(body.sdp);
//     await peer.setRemoteDescription(desc);
//     //peer.addStream(senderStream[body.peernum]);
//     if(body.peernum == 0){
//         senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
//     }
//     else if(body.peernum == 1){
//         senderStream2.getTracks().forEach(track => peer.addTrack(track, senderStream2));
//     }
//     else if(body.peernum == 2){
//         senderStream3.getTracks().forEach(track => peer.addTrack(track, senderStream3));
//     }
//     else if(body.peernum == 3){
//         senderStream4.getTracks().forEach(track => peer.addTrack(track, senderStream4));
//     }
//     var tempice = body.candidate;
//     tempice.forEach(candidate => {
//         peer.addIceCandidate(candidate)
//         console.log("addice")
//     })
//     console.log(body.candidate)
//     //senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
//     //await peer.addIceCandidate(body.candidate).catch(error => console.log(error.message));
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     if(isserver == false){

//         peer.onicecandidate = ((e) => {
//             if(e.candidate == null){

//                 return
//             }
//             localcandidate1.push(e.candidate);
//             console.log("candidate  ")
//                 //console.log(localcandidate1);
//         })
//         console.log(localcandidate1)
//         isserver = true;
//     }
    
//     const payload = {
//         sdp: peer.localDescription,
//         candidate : localcandidate1
//     }

//     res.json(payload);
// });

// app.post('/broadcast', async ({ body }, res) => {

//     //console.log(body);
//     const peer = new webrtc.RTCPeerConnection({
//         iceServers: [
//             {
//                 "urls": ["stun:stun.l.google.com:19302", 
//                 "stun:stun1.l.google.com:19302", 
//                 "stun:stun2.l.google.com:19302"]
//             }
//         ]
//     });
//     //peer.addTransceiver("video") ///new
//     peer.ontrack = (e) => handleTrackEvent(e, peer);
//     //senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
//     const desc = new webrtc.RTCSessionDescription(body.sdp);
//     var tempice = body.candidate;
//     tempice.forEach(candidate => {
//         peer.addIceCandidate(candidate)
//         console.log("addice")
        
//     })
//     console.log(body.candidate)
//     //await peer.addIceCandidate(body.candidate).catch(error => console.log(error.message));;
//     await peer.setRemoteDescription(desc);
//     const answer = await peer.createAnswer();
//     await peer.setLocalDescription(answer);
//     if(isserver == false){

//         peer.onicecandidate = ((e) => {
//             if(e.candidate == null){
//                 return
//             }
//             localcandidate2.push(e.candidate);
//             console.log("candidate  ")
//                 //console.log(localcandidate1);
//         })
//         console.log(localcandidate2)
//         isserver = true;
//     }
//     const payload = {
//         sdp: peer.localDescription,
//         candidate : localcandidate2
//     }
    

    
//     res.json(payload);
// });

function handleTrackEvent(e, user) {
    if(streamstate[0] == false){
        
        streamstate[0] = true
        user.stream = 0
        senderStream = e.streams[0];
        return

    }
    if(streamstate[1] == false){

        streamstate[1] = true
        user.stream = 1
        senderStream2 = e.streams[0];
        return

    }
    if(streamstate[2] == false){
        streamstate[2] = true
        user.stream = 2
        senderStream3 = e.streams[0];
        return
    }
    if(streamstate[3] == false){
        streamstate[3] = true
        user.stream = 3
        senderStream4 = e.streams[0];
        return
    }
    //senderStream = e.streams[0];
    
};

/////////////////架構重用 socket 架構

io.on('connection',function(socket){


    socket.on('userlog',function(data){

        console.log("user login " + data);
        //users.push(data);
        //console.log(users.length);
        var newuser = {
            id : data,
            host: false,
            candnum: 0,
            candset: false,
            offerset: false,
            peertype: null,
            conrec: 0,
            streamrec: [false,false,false,false]

        }
        userAr.push(newuser)
        socket.id = data;
        console.log(socket.id);
        users++;
        console.log("number of users: "+users);
        io.emit('numusers',users);
        io.emit('streamcount',streamcount)
        io.emit('setroomnum',roomnum);
        socket.emit('succeedlog')
        io.emit('chat',"user "+socket.id+" join the chat ");

    })
    socket.on('disconnect',function(data){

        var user = findUser(socket.id);
        userAr.splice(userAr.findIndex(element => element.id == socket.id),1)
        users--;
        console.log(socket.id);
        if(streamer.find(element => element == socket.id) ){
            console.log(socket.id + "stop stream");
            streamstate[user.stream] = false
            streamcount--;
            streamer.splice(streamer.findIndex(element => element == socket.id),1);
            io.emit('streamcount',streamcount)

        }
        if(user.host == true){

            roomnum = null;
            io.emit('setroomnum',roomnum);

        }
        if(user == 0){
            roomnum = null;
        }
        console.log("number of users: "+users);
        console.log("user "+socket.id+" is leaved ");
        io.emit('chat',"user "+socket.id+" is leaved ");
        io.emit('numusers',users);

    })
    socket.on('sendtext',function(data){

        console.log("chat")
        console.log(data);
        io.emit('chat'," "+socket.id+" : "+ data);

        
    })
    socket.on('newstream',function(data){

        if(!streamer.find(element => element == socket.id)){
            streamcount++;
        streamer.push(socket.id);
        console.log("new streamer")
        console.log("return streamcount")
        io.emit('streamcount',streamcount)
        
        }
        //io.emit('restream',streamcount)

    })
    socket.on('setroom',function(data){

        var user = findUser(socket.id);
        if(data != null){

            user.host = true;

        }
        roomnum = data;
        io.emit('setroomnum',roomnum);

    })
    socket.on('restream',function(data){

        var user = findUser(socket.id);
        user.streamrec = [false,false,false,false];

    })
    socket.on('storecandidate',function(data){

        var user = findUser(socket.id);
        //console.log("!!!"+(user.id))
        if (user.candidates == null)
            user.candidates = []

        user.candidates.push(data)
        if(user.candidates.length >= user.candnum){
            user.candset = true;
            console.log("candset")
        }
        
        console.log("!!!"+(user.candidates))

    })
    socket.on('candidatenum',function(data){

        var user = findUser(socket.id);
        console.log(socket.id + "candidatenum " + user.candnum);
        user.candnum++;

    })
    socket.on('settype',function(data){

        var user = findUser(socket.id);
        user.peertype = data;
        console.log('settype')

    })
    socket.on('storeoffer',function(data){

        var user = findUser(socket.id);
        user.offer = data
        user.offerset = true
        console.log('offerset')
        

    })
    socket.on('isok',function(data){

        var user = findUser(socket.id);
        console.log('isok')
        if(user.offerset == true && user.candset == true){

            if(user.peertype == "broad"){
                socket.emit('sucessbro')

            }
            else if(user.peertype == "com"){

                socket.emit('sucesscom')

            }
            socket.emit('isok',true)

        }
        else{
            socket.emit('isok',false)
        }
        
    })
    socket.on('startbro',async function(data){

        var user = findUser(socket.id);
        console.log("connecting "+user.id)

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

            console.log("broad")
               const peerConn = new webrtc.RTCPeerConnection(configuration)

               peerConn.ontrack = (e) => handleTrackEvent(e, user);

            peerConn.onicecandidate = ((e) => {
                if (e.candidate == null)
                    return
                
                socket.emit('candidate1',e.candidate)
            })

            user.candidates.forEach(candidate => {
                peerConn.addIceCandidate(candidate)
            })

            const desc = new webrtc.RTCSessionDescription(user.offer);
            const answer = await createSetAnswer(peerConn,desc)
            peerConn.setLocalDescription(answer)
            socket.emit('answer1',peerConn.localDescription)

            //createAndSendAnswer(peerConn)
            //user.candnum = 0
            user.candset = false
            user.offerset = false
            user.peertype = null
            user.candidates.length = 0;
        
        

    })
    socket.on('startcom',async function(data){

        var user = findUser(socket.id);
        console.log("connecting "+user.id)

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

            console.log("com")

            const peerConn = new webrtc.RTCPeerConnection(configuration)
            if(streamstate[0] == true & user.streamrec[0] == false){

                user.streamrec[0] = true
                senderStream.getTracks().forEach(track => peerConn.addTrack(track, senderStream));
                user.conrec++;

            }
            else if(streamstate[1] == true & user.streamrec[1] == false){

                user.streamrec[1] = true
                senderStream2.getTracks().forEach(track => peerConn.addTrack(track, senderStream2));
                user.conrec++;
            }
            else if(streamstate[2] == true & user.streamrec[2] == false){
                user.streamrec[2] = true
                senderStream3.getTracks().forEach(track => peerConn.addTrack(track, senderStream3));
                user.conrec++;
            }
            else if(streamstate[3] == true & user.streamrec[3] == false){
                user.streamrec[3] = true
                senderStream4.getTracks().forEach(track => peerConn.addTrack(track, senderStream4));
                user.conrec++;
            }
            //senderStream.getTracks().forEach(track => peerConn.addTrack(track, senderStream));
    
            peerConn.onicecandidate = ((e) => {
                if (e.candidate == null)
                    return
                
                    // if(user.conrec == 0){
                    //     socket.emit('candidate2',e.candidate)
                    // }
                    // else if(user.conrec == 1){
                    //     socket.emit('candidate3',e.candidate)
                    // }
                    // else if(user.conrec == 2){
                    //     socket.emit('candidate4',e.candidate)
                    // }
                    // else if(user.conrec == 3){
                    //     socket.emit('candidate5',e.candidate)
                    // }
                    socket.emit('candidate'+(data+2).toString(),e.candidate)
            })

            user.candidates.forEach(candidate => {
                peerConn.addIceCandidate(candidate)
            })
            const desc = new webrtc.RTCSessionDescription(user.offer);
            const answer = await createSetAnswer(peerConn,desc)
            peerConn.setLocalDescription(answer)
            socket.emit('answer'+(data+2).toString(),peerConn.localDescription)
            //createAndSendAnswer2(peerConn)
            //user.candnum = 0
            user.candset = false
            user.offerset = false
            user.peertype = null
            user.candidates.length = 0;
            if(data + 1 < streamcount){

                socket.emit('conrec',data+1);

            }
            else if(user.conrec >= streamcount){

                user.conrec = 0;

            }
        
        

    })
            // await peer.setRemoteDescription(desc);
            // //peer.addStream(senderStream[body.peernum]);
            
            // if(data == true){
            //     peer.ontrack = (e) => handleTrackEvent(e, peer);
            //     console.log("ontrack")

            // }else{
            //     senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));

            // }
            // user.candidates.forEach(candidate => {
            //     peer.addIceCandidate(candidate)
            //     console.log("addice")
            // })
            // //senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
            // //await peer.addIceCandidate(body.candidate).catch(error => console.log(error.message));
            // const answer = await peer.createAnswer();
            // await peer.setLocalDescription(answer);
        
            

    })

async function createSetAnswer (peerConn,desc) {

    await peerConn.setRemoteDescription(desc)
    const answer = await peerConn.createAnswer();

    return answer
}

    
function findUser(username) {
    for (let i = 0;i < userAr.length;i++) {
        if (userAr[i].id == username)
            return userAr[i]
    }
}


    /////////測試///////////////
    // socket.on('broadcast',async function(body){

    //     const peer = new webrtc.RTCPeerConnection({
    //         iceServers: [
    //             {
    //                 urls: "stun:stun.stunprotocol.org"
    //             }
    //         ]
    //     });
    //     //peer.addTransceiver("video") ///new
    //     peer.ontrack = (e) => handleTrackEvent(e, peer);
    //     //senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    //     const desc = new webrtc.RTCSessionDescription(body.sdp);
    //     await peer.setRemoteDescription(desc);
    //     const answer = await peer.createAnswer();
    //     await peer.setLocalDescription(answer);
    //     const payload = {
    //         sdp: peer.localDescription
    //     }
        
    
        
    //     res.json(payload);

    // })
    // socket.on('consumer',async function(body){

    //     const peer = new webrtc.RTCPeerConnection({
    //         iceServers: [
    //             {
    //                 urls: "stun:stun.stunprotocol.org"
    //             }
    //         ]
    //     });
    //     const desc = new webrtc.RTCSessionDescription(body.sdp);
    //     await peer.setRemoteDescription(desc);
    //     senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    //     const answer = await peer.createAnswer();
    //     await peer.setLocalDescription(answer);
    //     const payload = {
    //         sdp: peer.localDescription
    //     }
    
    //     res.json(payload);
    

    // })



// })

// http1.createServer(app1.handleRequest).listen(8000);

// http.listen(port2,function(){

    
//     console.log("listening");

// })
//http.createServer(handleRequest).listen(3000);
// app.listen(5000,function(){

//     console.log("listening");

// })
server.listen(port2, () => {
    console.log('Server listening at port %d', port2);
  });