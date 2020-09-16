import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';


@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})

export class VideoCallComponent implements OnInit {
  database : any;
  myVideo: any;
  clientVideo: any;
  id: any;
  pc: any;
  constructor() { }
  servers = {
    'iceServers': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }, { 'urls': 'turn:numb.viagenie.ca', 'credential': 'webrtc', 'username': 'websitebeaver@mail.com' }]
  };
  ngOnInit(): void {
    var config = {
      apiKey: "AIzaSyB7tTYfwZsb6admw0Q2f1zC3kGBnk9lUis",
      authDomain: "koumirtc.firebaseapp.com",
      databaseURL: "https://koumirtc.firebaseio.com",
      projectId: "koumirtc",
      storageBucket: "koumirtc.appspot.com",
      messagingSenderId: "926790374930",
    };
    firebase.initializeApp(config);
    navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => this.myVideo.srcObject = stream)
    .then(stream => this.pc.addStream(stream));
    this.database = firebase.database().ref();
    this.myVideo = document.getElementById("myVideo");
    this.clientVideo = document.getElementById("clientVideo");
    this.id = Math.floor(Math.random()*1000000000);
    this.pc = new RTCPeerConnection(this.servers);
    console.log("hh",this.pc);
    this.pc.onicecandidate = (event => event.candidate?this.sendMessage(this.id, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
    this.pc.onaddstream  = (event => this.clientVideo.srcObject = event.stream)
    this.database.on('child_added', this.readMessage)
  }
  clientSide() {
    this.pc.createOffer()
    .then(offer => this.pc.setLocalDescription(offer) )
    .then(() => this.sendMessage(this.id, JSON.stringify({'sdp': this.pc.localDescription})) );
    
  }

  sendMessage(senderId, data) {
   
    let msg = this.database.push({ sender: senderId, message: data });
    // setTimeout(()=>{
    //   msg.remove();
    // },100); 
   }

   readMessage(data) {
    let msg = JSON.parse(data.val().message);
    let sender = data.val().sender;
    console.log("data from database",data,sender)
    if (sender !== this.id) {
    if (msg.ice != undefined)
    this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    else if (msg.sdp.type == "offer")
    this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
    .then(() => this.pc.createAnswer())
    .then(answer => this.pc.setLocalDescription(answer))
    .then(() => this.sendMessage(this.id, JSON.stringify({'sdp': this.pc.localDescription})));
    else if (msg.sdp.type == "answer")
    this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    else{
      console.log("else condition")
    }
   };
   

}
