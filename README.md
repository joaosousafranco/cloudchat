Cloud Chat
=========

**Introduction**

Cloud chat is a javascript chat library that uses angularjs and jquery for user interface and realtime.co framework for messaging and storage.

You can check a live sample here: http://howdoyouphil.blogspot.pt/

**Getting started**

1 - With 2 lines of html:

	Refer to sample: samples/index.html
	
	<script type="text/javascript" src="http://dl.dropboxusercontent.com/s/sl5azkks6isi42v/cloudchat.js"></script>
	<div id="cloudchatcontainer" style="width: 700px; height: 350px;"></div>
	
2 - Custom html but no javascript

	<script type="text/javascript" src="http://dl.dropboxusercontent.com/s/sl5azkks6isi42v/cloudchat.js"></script>
	<div data-ng-controller="CloudChat.UserController" style="width: 700px; height: 350px; ">
    	<button data-ng-controller="CloudChat.LoginController" data-ng-click="login('guest')">login as guest</button>
    	</br>
    	<input data-ng-model="messageText" placeholder="Type your message here" type="text" />
       	<button data-ng-click="send()">Send with {{ user.name }}</button>
       </br>
       <div data-ng-controller="CloudChat.ChatController">
       		<div data-ng-controller="CloudChat.RoomsController">
       			<button data-ng-click="open(roomname)">{{ roomname }}</button>
       			<input data-ng-model="roomname" placeholder="Room name" type="text" />
       		</div>
       		</br>
	   		<ul  style="list-style-type: none; margin-left: -30px; margin-top: 0px; padding-right: 32px; padding-left: 32px;">
	   			<li data-ng-repeat="message in currentRoomMessages">
	   				{{ message.timestamp | date:"HH:mm:ss" }} {{ message.user }} : {{ message.content }}
	   			</li>
	   		</ul>
	   	</div>
    </div>

3 - Integrate with your angularjs application
	
	<html data-ng-app="cloudchat-custom">
	<script type="text/javascript" src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"></script>
	<script type="text/javascript" src="js/cloudchat.js"></script>
	<script type="text/javascript">
		angular.module('cloudchat-custom', []);

		function doIt(){
			CloudChat.setup.storage = {
	            initialChunk : 1,
	            order : "desc"
	        }  

			CloudChat.api.login("guest")
			.onLoggedin(function(user){
				console.log("Logged in with",user);	

				CloudChat.api.openRoom("home")
				.onMessage(function(room,message){
					console.log("Message on room",room,":",message);
				})
				.opened(function(room){
					console.log("Room opened",room);
				})
				.closed(function(room){
					console.log("Room closed",room);	
				});

				CloudChat.api.sendMessage(user,"home","Testing custom cloudchat");

				setTimeout(function(){
					CloudChat.api.closeRoom("home");

					setTimeout(function(){
						CloudChat.api.sendMessage(user,"home","Testing custom cloudchat after close room");
					},1000);
				},10 * 1000);
			})
			.onLoginFailed(function(provider){
				console.error("Unable to login with",provider);
			});	
		}
	</script>
	<div data-ng-controller="CloudChat.UserController" style="width: 700px; height: 350px; ">
       	<button onclick="doIt()">{{ user.name }}</button>
       </br>
   		<ul data-ng-controller="CloudChat.ChatController" style="list-style-type: none; margin-left: -30px; margin-top: 0px; padding-right: 32px; padding-left: 32px;">
   			<li data-ng-repeat="message in currentRoomMessages">
   				{{ message.timestamp | date:"HH:mm:ss" }} {{ message.user }} : {{ message.content }}
   			</li>
   		</ul>
    </div>



NOTE: CloudChat uses Realtime framework ( http://framework.realtime.co ) as a backend as a service

