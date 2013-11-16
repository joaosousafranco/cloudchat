Cloud Chat
=========

Cloud chat is a javascript chat library that uses angularjs and jquery for user interface and realtime.co framework for messaging and storage.

Getting started:

1 - With 2 lines of html:

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


NOTE: CloudChat uses Realtime framework ( http://framework.realtime.co ) as a backend as a service

