(function (CloudChat, undefined) {
    CloudChat.setup = {
        security : {
            facebook : {
                appId      : '640876879271174', // App ID
                channelUrl : '//howdoyouphil.blogspot.pt' // Channel File
            },
            google : {
                client_id: '532324559552.apps.googleusercontent.com'
            }
        },        
        realtime : {
            applicationKey : "Ugrahe",
            token : "cloud-chat",
            url: "http://ortc-developers.realtime.co/server/2.1"
        },
        storage : {
            initialChunk : 5,
            order : "desc"
        }        
    }
})(window.CloudChat = window.CloudChat || {});


(function (CloudChat, undefined) {
    CloudChat.Strings = {
        guid : function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
        }
    }
})(window.CloudChat = window.CloudChat || {});



(function (CloudChat, undefined) {
    var EventEmitter = function(){
        this.on = function(eventName,onEvent){
            $(document).on(eventName,function(event){
                var eventArguments = [];

                for(var i = 1; i < event.argumentsLength; i ++){
                    eventArguments.push(event[i]);
                }

                onEvent.apply(this,eventArguments);
            });
        }

        this.removeAllListeners = function(eventName){
            $(document).off(eventName);
        }

        this.emit = function(){
            var event = {
                type : arguments[0],
                argumentsLength : arguments.length
            }

            for(var i = 1; i < arguments.length; i++){
                event[i] = arguments[i];
            }

            $.event.trigger(event);
        }
    }

    var EventManager = function(configuration){
        this.emitter = new EventEmitter();      

        if(EventManager.caller != EventManager.getInstance){
            throw new Error("This object cannot be instanciated");
        }
    };

    EventManager.instance = null;

    EventManager.getInstance = function(){
        if(this.instance === null){
            this.instance = new EventManager();
        }
        return this.instance;
    };

    EventManager.prototype = {
        subscribe : function(eventName,onEvent){
            this.emitter.on(eventName,onEvent);
        },

        unsubscribe : function(eventName){
            this.emitter.removeAllListeners(eventName);
        },

        publish : function(){
            this.emitter.emit.apply(this.emitter,arguments);
        }   
    };

    CloudChat.EventManager = EventManager.getInstance();
})(window.CloudChat = window.CloudChat || {});

(function (CloudChat, undefined) {
    window.googleSignIn = function(authResult){  
        if(authResult && authResult['access_token']){
            gapi.client.load('oauth2', 'v2', function() {
                var request = gapi.client.oauth2.userinfo.get();
                request.execute(function(result){
                    CloudChat.google.loaded({
                        name : result.name,
                        provider : 'google',
                        email : result.email,
                        link : result.link,
                        id : result.id,
                        token : authResult['access_token']
                    });
                });
            });
        }else {
            CloudChat.google.loaded(null);
        }
    }

    CloudChat.google = {
        load : function(callback){
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = 'https://apis.google.com/js/client:plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);               

            CloudChat.google.loaded = callback;

            gapi.auth.authorize({
                client_id: CloudChat.setup.security.google.client_id,
                cookie_policy: 'single_host_origin',
                scope: 'https://www.googleapis.com/auth/userinfo.profile'
            },googleSignIn);
        }
    }
})(window.CloudChat = window.CloudChat || {});

(function (CloudChat, undefined) {
    CloudChat.guest = {
        load : function(callback){
            callback({
                name : "guest",
                provider : 'guest',
                email : null,
                link : null,
                id : CloudChat.Strings.guid(),
                token : CloudChat.Strings.guid()
            });
        }
    }
})(window.CloudChat = window.CloudChat || {});

(function (CloudChat, undefined) {
    // Additional JS functions here
    CloudChat.fbAsyncInit = function() {
        FB.init({
            appId      : CloudChat.setup.security.facebook.appId, // App ID
            channelUrl : CloudChat.setup.security.facebook.channelUrl, // Channel File
            status     : true, // check login status
            cookie     : true, // enable cookies to allow the server to access the session
            xfbml      : true,  // parse XFBML
            oauth      : true  
        });        

        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                CloudChat.facebook.getUser(response.authResponse.accessToken,function(result){
                    CloudChat.facebook.loaded(result);  
                });                
            } else {
                FB.login(function(result){
                    if (result.status === 'connected') {
                        CloudChat.facebook.getUser(result.authResponse.accessToken,function(data){
                            CloudChat.facebook.loaded(data);  
                        });
                    }else{
                        CloudChat.facebook.loaded(false);
                    }
                }, {scope: 'read_stream, email'});                
            } 
        });
    };

    CloudChat.facebook = {
        load : function(callback){
            CloudChat.facebook.loaded = callback;  

            CloudChat.fbAsyncInit();
        },

        getUser : function(token,callback){
            FB.api('/me', function(response) {                
                callback({
                    name : response.name,
                    provider : 'facebook',
                    id : response.id,
                    email : response.email,
                    link : response.link,
                    token : token
                });
            });
        }
    }
})(window.CloudChat = window.CloudChat || {});

(function (CloudChat, undefined) {
    var externalTools = [
        'http://connect.facebook.net/en_US/all.js',
        'https://apis.google.com/js/client.js',        
        'http://netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js'
    ];

    if((typeof angular == typeof undefined) || (angular && angular.version.full != "1.0.8")){
        externalTools.push('https://ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js');
    }

    if((typeof jQuery == typeof undefined) || (jQuery && jQuery.fn.jquery != "2.0.3")){
        externalTools.push('http://code.jquery.com/jquery-2.0.3.min.js');
    }

    externalTools.push('https://storage-cdn.realtime.co/storage/1.0.0/realtime-storage-min.js');

    Initializer = {
        externalTools: externalTools,

        internalTools: [ 
        ],

        load: function (callback) {
            Initializer.loadScripts(Initializer.externalTools, function () {
                Initializer.loadScripts(Initializer.internalTools, function () {
                    if(callback) callback();
                });
            });
        },

        loadScript: function (url, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";

            if (script.readyState) {  //IE
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {  //Others
                script.onload = function () {
                    callback();
                };
            }
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        },

        loadScripts: function (urls, callback) {
            if (urls && urls.length > 0) {
                Initializer.loadScript(urls[urls.length-1], function () {
                    urls.pop();
                    Initializer.loadScripts(urls, callback);
                });
            } else {
                callback();
            }
        }
    };

    Chat = function(){
        var angularAppAttribute = $("html").attr("ng-app") || $("html").attr("data-ng-app");
        if (typeof angularAppAttribute === 'undefined' || angularAppAttribute === false) {
            $("html").attr("data-ng-app",""); 
        }

        Initializer.load(function(){        
            CloudChat.Chat.render();
            CloudChat.EventManager.publish("loaded");
        });
    }

    Chat.prototype = {
        loginView : ''
            +   '<div data-ng-style="{ \'display\': loggedin && \'none\' || \'table\' }" id="chat-loginView" data-ng-controller="CloudChat.LoginController" style="display: table; text-align: center;width: 100%; height: 100%; border: 1px solid gray">'
            +   '   <h3 style="display: table-cell; vertical-align: middle;">Cloud Chat login with:</h3>'
            +   '   <div style="display: table-cell; vertical-align: middle;">'
            +   '       <span data-ng-click="login(\'facebook\')" style="cursor: pointer; display: inline-block;padding: 15px; width: 75px; height: 20px;border: 1px solid gray">facebook</span>'
            +   '   </div>'
            +   '   <div style="display: table-cell; vertical-align: middle;">'
            +   '       <span id="googleLoginButton" data-ng-click="login(\'google\')" style="cursor: pointer;display: inline-block;padding: 15px; width: 75px; height: 20px;border: 1px solid gray">google+</span>'
            +   '   </div>'
            +   '   <div style="display: table-cell; vertical-align: middle;">'
            +   '       <span data-ng-click="login(\'guest\')" style="cursor: pointer;display: inline-block;padding: 15px; width: 75px; height: 20px;border: 1px solid gray">guest</span>'
            +   '   </div>'
            +   '</div>'
        + '',

        mainView : ''
            +    '<table data-ng-show="loggedin" data-ng-controller="CloudChat.LoginController" id="chat-mainView" style="display: none;width: 100%; height: 100%; border-collapse: collapse; border: 1px solid gray">'
            +    '    <tr style="padding: 0;">'
            +    '        <td style="padding: 0;height: 100%;border: 1px solid gray; vertical-align: bottom;">'
            +    '            <div id="chat-messsages" data-ng-controller="CloudChat.ChatController" style="height: 100%; width: 100%; position: relative;bottom: 0px; overflow: auto;">'
            +    '                <ul style="font-size:14px; list-style-type: none; margin-left: -38px; margin-top: 0px">'                    
            +    '                  <li data-ng-repeat="message in currentRoomMessages">'
            +    '                      {{ message.timestamp | date:"HH:mm:ss" }} <span style="color: blue">{{ message.user }}</span> : {{ message.content }}'
            +    '                  </li>'                    
            +    '                </ul>'                    
            +    '            </div>'
            +    '        </td>'
            +    '        <td data-ng-controller="CloudChat.UsersController" style="padding: 0;width: 150px; border: 1px solid gray; vertical-align:text-top;">'
            +    '          <ul style="list-style-type: none; margin-left: -38px; margin-top: 0px">'                    
            +    '              <li style="margin-left: 2px; margin-right: 2px; margin-top: 10px; background-color: #dddddd" data-ng-repeat="user in users">'
            +    '                  <img style="vertical-align:middle;" src="http://www.experienceourenergy.com.br/public/img/interface/icon-facebook.png" data-ng-show="user.provider == \'facebook\'" ></img> '
            +    '                  <img style="vertical-align:middle;" src="http://www.videosoft.com.br/images/icn_google.png" data-ng-show="user.provider == \'google\'"></img> '
            +    '                  <img style="vertical-align:middle;" src="http://icons.iconarchive.com/icons/jeanette-foshee/simpsons-05/24/Simpsons-Family-Young-Abe-Simpson-icon.png" data-ng-show="user.provider == \'guest\'"></img> '
            +    '                  <a target="_blank" style="vertical-align:middle;text-decoration: none; color:inherit;" href="{{ user.link }}">{{ user.name }}</a>'
            +    '              </li>'                    
            +    '          </ul>'  
            +    '        </td>'
            +    '    </tr>'
            +    '    <tr style="padding: 0;" ng-model="user" data-ng-controller="CloudChat.UserController">'
            +    '        <td style="padding: 0; border: 1px solid gray; padding: 0px 2px 0px 2px">'
            +    '            <input id="chat-messagetextbox" ng-model="messageText" placeholder="Type your message here" type="text" style="border: 0px solid; width: 100%; outline: 0; " />'
            +    '        </td>'
            +    '        <td id="chat-sendbutton" data-ng-click="send()" style="cursor: pointer;padding: 0; border: 1px solid gray;text-align: center; ">'
            +    '            Send'
            +    '        </td>'
            +    '    </tr>'
            +    '    <tr data-ng-controller="CloudChat.RoomsController">' 
            +    '        <td style="height: 20px">'
            +    '          <ul style="list-style-type: none; margin-left: -30px; margin-top: 0px; padding-right: 32px; padding-left: 32px;">'                    
            +    '              <li data-ng-style="{ \'background-color\': room.active && \'gray\' || \'white\', \'color\': room.active && \'white\' || \'black\' }" class="cloudchatroom" style="cursor: pointer; cursor: hand; border: 1px solid gray; float: left; padding-left: 5px; padding-right: 5px; margin-right: 5px" data-ng-repeat="room in rooms">'
            +    '                  <span data-ng-click="open(room)">{{ room.name }}</span> <span data-ng-click="close(room)">x</span>' 
            +    '              </li>'                    
            +    '          </ul>'
            +    '        </td>'
            +    '        <td id="chat-openbutton" style="cursor: pointer;padding: 0; border: 1px solid gray;text-align: center; ">'
            +    '            Open'
            +    '            <div id="chatdialog-openroom" style="position: absolute; padding: 5px; border: 1px solid black; width: 250px; height:80px; display: none; background-color: white">'
            +    '                  <div>Open room</div></br>'
            +    '                  <input id="chatdialog-openroomtextbox" ng-model="roomname" placeholder="Type room name here" type="text" style="border: 1px solid black; width: 200px; outline: 0; " />'
            +    '                  <span id="chatdialog-openroombutton" data-ng-click="open(roomname)" style="border: 1px solid black; padding-left: 5px; padding-right:5px">open</span>'
            +    '            </div>'   
            +    '        </td>'                     
            +    '    </tr>'            
            +    '</table>'                    
            + '',

        render : function(){
            if($("#cloudchatcontainer") && $("#cloudchatcontainer").length){
                $("#cloudchatcontainer").html(this.loginView + this.mainView);                
                
                $("#chat-messagetextbox").keyup(function(event){
                    if(event.keyCode == 13){
                        $("#chat-sendbutton").click();
                    }
                });

                $("#chatdialog-openroomtextbox").keyup(function(event){
                    if(event.keyCode == 13){
                        $("#chatdialog-openroombutton").click();
                    }
                });

                $("#chat-openbutton").click(function(event){
                    var mainView = $("#chat-mainView").find("tr:first").find("td:first");
                    var mainViewPosition = mainView.position();
                        
                    $("#chatdialog-openroom").css({ position: "absolute",
                        marginLeft: 0, 
                        marginTop: 0,
                        top: mainViewPosition.top + (mainView.height() / 2) - $("#chatdialog-openroom").height(), 
                        left: mainViewPosition.left + (mainView.width() / 2)
                    });

                    $("#chatdialog-openroomtextbox").val("");
                    $("#chatdialog-openroom").show();
                });

                CloudChat.EventManager.subscribe("roomopened",function(room){ 
                    setTimeout(function(){
                        $("#chatdialog-openroom").hide();
                    },50);
                });

                CloudChat.EventManager.subscribe("receivedmessage",function(message){            
                    setTimeout(function(){
                        var $target = $('#chat-messsages'); 
                        $target.animate({scrollTop: $target.height()}, 1000);
                        setTimeout(function(){
                            $target.stop();
                        },1500);                    
                    },50);
                });

                CloudChat.EventManager.subscribe("loggedin",function(user){  
                    setTimeout(function(){
                        CloudChat.EventManager.publish("openroom",{ name: "home", active: true } );                
                    },10);                                      
                });

                CloudChat.EventManager.subscribe("loginfailed",function(provider){
                    console.error("Failed to login with",provider);
                });           
            }
        }
    }

    CloudChat.Chat = new Chat();

    CloudChat.SecurityService = {
        login : function(provider){
            if(CloudChat[provider]){
                CloudChat[provider].load(function(loggedUser){
                    if(loggedUser){
                        CloudChat.EventManager.publish("loggedin",loggedUser);                       
                    }else{
                        CloudChat.EventManager.publish("loginfailed",provider);   
                    }                
                }.bind(this));    
            }else{
                CloudChat.EventManager.publish("loginfailed",provider);   
            }
        }
    }

    CloudChat.RealtimeStorageService = function(configuration){
        var roomsTableRefs = {};        
        var initialChunk = CloudChat.setup.storage.initialChunk;        
        var order = CloudChat.setup.storage.order;

        var client = Realtime.Storage.create(
            configuration,
            null,
            function(error){
                console.log("Error while loading realtime storage service",error);
            }
        );

        CloudChat.EventManager.subscribe("savemessage",function(message){
            if(message && message.content && message.room){
                var messagesTableRef = client.table("chat-messages");

                messagesTableRef.push(message,null
                ,function(error){
                    console.log("Error in saving message:",error);
                }.bind(this));     
            }
        }.bind(this));

        CloudChat.EventManager.subscribe("openroom",function(room){
            var messagesTableRef;

            if(!roomsTableRefs[room.name]){
                roomsTableRefs[room.name] = messagesTableRef = client.table("chat-messages").equals({item: "room", value: room.name });

                if(initialChunk > 0){
                    roomsTableRefs[room.name] = messagesTableRef = messagesTableRef.limit(initialChunk);                    
                }

                if(order && messagesTableRef[order]){
                    roomsTableRefs[room.name] = messagesTableRef = messagesTableRef[order]();                    
                }

                messagesTableRef.on("put",function(itemSnapshot){            
                    if(itemSnapshot && itemSnapshot.val()){
                        CloudChat.EventManager.publish("receivedmessage",itemSnapshot.val());
                    }            
                });
            }
        }.bind(this));

        CloudChat.EventManager.subscribe("closeroom",function(room){
            var messagesTableRef;

            if(roomsTableRefs[room.name]){
                messagesTableRef = roomsTableRefs[room.name];
                messagesTableRef.off("put",room.name);
                delete roomsTableRefs[room.name];
            }

            CloudChat.EventManager.publish("closedroom", room);
        }.bind(this));
    }

    CloudChat.LoginController = function($scope){ 
        $scope.loggedin = false;
        CloudChat.EventManager.subscribe("loggedin",function(user){
            $scope.loggedin = true; 
        });    

        $scope.login = function(provider){
            CloudChat.SecurityService.login(provider);
        };       
    }

    CloudChat.UserController = function($scope){ 
        $scope.user = null;

        CloudChat.EventManager.subscribe("loggedin",function(user){
            $scope.user = user;

            new CloudChat.RealtimeStorageService({
                applicationKey: CloudChat.setup.realtime.applicationKey,
                authenticationToken: CloudChat.setup.realtime.token, 
            }); 

            if(!$scope.$$phase) {
                $scope.$apply();
            } 
        });      

        $scope.send = function(){
            CloudChat.EventManager.publish("sendmessage",$scope.messageText);
            $scope.messageText = null;
        }
    }

    CloudChat.ChatController = function($scope){
        $scope.user = {};
        $scope.messages = {};        
        $scope.currentRoom = null;
        $scope.currentRoomMessages = [];

        CloudChat.EventManager.subscribe("loggedin",function(user){
            $scope.user = user;            
        });

        CloudChat.EventManager.subscribe("sendmessage",function(text){
            var message = {
                content : text,
                user : $scope.user.name,
                userId : $scope.user.id,
                userProvider : $scope.user.provider,
                timestamp : +new Date(),
                room : $scope.currentRoom,
                id : (+new Date()) + '-' + CloudChat.Strings.guid() 
            };
            CloudChat.EventManager.publish("savemessage",message);
        });

        CloudChat.EventManager.subscribe("receivedmessage",function(message){   
            if(!$scope.messages[message.room]){
                $scope.messages[message.room] = [];
            }

            $scope.messages[message.room].push(message);
            $scope.messages[message.room].sort(function(a,b){
                return a.timestamp-b.timestamp;
            });       
            $scope.$apply(); 
        });

        CloudChat.EventManager.subscribe("openroom",function(room){            
            $scope.currentRoom = room.name;
            if(!$scope.messages[room.name]){
                $scope.messages[room.name] = [];
            }
            $scope.currentRoomMessages = $scope.messages[room.name];
        });

        CloudChat.EventManager.subscribe("closeroom",function(room){
            if($scope.messages[room.name]){
                delete $scope.messages[room.name];
            }
            $scope.currentRoom = null;
            $scope.currentRoomMessages = [];

            if(!$scope.$$phase) {
                $scope.$apply();
            } 
        });
    }

    CloudChat.RoomsController = function($scope){
        $scope.rooms = [];

        function isRoomOpened(room){
            var result = false;

            for(var roomIndex in $scope.rooms){
                var roomItem = $scope.rooms[roomIndex];
                if(room.name == roomItem.name){
                    result = true;
                    break;
                }
            }

            return result;
        }

        CloudChat.EventManager.subscribe("openroom",function(room){  
            if(room) {
                for(var roomIndex in $scope.rooms){
                    $scope.rooms[roomIndex].active = false;
                }    
            }

            if(!isRoomOpened(room)){
                $scope.rooms.push(room);
            }else{
                room.active = true;
            }   

            if(!$scope.$$phase) {
                $scope.$apply();
            }                     
        });

        $scope.close = function(room){            
            var roomIndex = $scope.rooms.indexOf(room);
            if(roomIndex >= 0){
                $scope.rooms.splice(roomIndex,1);
                CloudChat.EventManager.publish("closeroom",room); 
                if($scope.rooms.length > 0){
                    var roomToOpenIndex = roomIndex == 0 ? roomIndex : roomIndex -1;                    
                    CloudChat.EventManager.publish("openroom",$scope.rooms[roomToOpenIndex]);
                }
            }            
        }

        $scope.open = function(room){  
            if(room)         {
                if(typeof room !== "string"){
                    CloudChat.EventManager.publish("openroom",room);
                }else{
                    CloudChat.EventManager.publish("openroom",{
                        name : room,
                        active : true
                    }); 
                }
            } 
            CloudChat.EventManager.publish("roomopened",room);
        }
    }

    CloudChat.UsersController = function($scope){
        $scope.users = [];        
        var channelPrefix = "cloudchat:";
        var currentUser = null;
        var realtimeClient = null;
        var subscriptionsBuffer = [];
        var presenceInterval = null;

        function subscribeChannel(channel){
            if(!realtimeClient.isSubscribed(channel)){
                realtimeClient.subscribe(channel,true,function(sender,channel,message){
                    var subscribedUser = JSON.parse(message);
                    if(subscribedUser.id != currentUser.id || subscribedUser.provider != currentUser.provider){
                        var userfound = false;
                        for(var userIndex in $scope.users){
                            var user = $scope.users[userIndex];
                            if(user.id == subscribedUser.id && user.provider == subscribedUser.provider){
                                userfound = true;
                                break;
                            }                            
                        }

                        if(!userfound){
                            $scope.users.push(subscribedUser);
                            $scope.$apply();
                        }
                    }                    
                });
                realtimeClient.send(channel,JSON.stringify(currentUser));
            }
        }

        CloudChat.EventManager.subscribe("loaded",function(){
            loadOrtcFactory(IbtRealTimeSJType, function (factory, error) {
                if (error != null) {
                    console.error("Factory error: " + error.message);
                } else {

                    if (factory != null) {                    
                        realtimeClient = factory.createClient();                

                        CloudChat.EventManager.subscribe("loggedin",function(user){
                            currentUser = {
                                name : user.name,
                                provider : user.provider,
                                id : user.id,
                                link : user.link                           
                            };
                            realtimeClient.setConnectionMetadata(JSON.stringify(currentUser));
                            realtimeClient.setClusterUrl(CloudChat.setup.realtime.url);

                            realtimeClient.onException = function (ortc, exception) {
                                console.error(exception);
                            };

                            realtimeClient.onConnected = function (ortc) {
                                while(subscriptionsBuffer.length > 0){
                                    var channel = subscriptionsBuffer.shift();
                                    subscribeChannel(channel);
                                }                            
                            };

                            realtimeClient.onReconnected = function (ortc) {
                                while(subscriptionsBuffer.length > 0){
                                    var channel = subscriptionsBuffer.shift();
                                    subscribeChannel(channel);
                                }                            
                            };

                            realtimeClient.connect(CloudChat.setup.realtime.applicationKey,CloudChat.setup.realtime.token);
                        });
                    }
                }                                
            });
        });

        function checkPresence(presenceData){
            realtimeClient.presence(presenceData,
            function (error, result) {
                $scope.users = [];
                if (!error) {
                    if(result.subscriptions > 0){
                        for(var userIndex in result.metadata){
                            var user = JSON.parse(userIndex);
                            if(user.id != currentUser.id || user.provider != currentUser.provider){
                                $scope.users.push(user);
                            }                            
                        }
                    }
                    $scope.users.push(currentUser);                    
                }
                $scope.$apply();
            });
        }

        CloudChat.EventManager.subscribe("closeroom",function(room){
            if (realtimeClient.isSubscribed(channelPrefix + room.name)){
                realtimeClient.unsubscribe(channelPrefix + room.name);
            }
        });

        CloudChat.EventManager.subscribe("openroom",function(room){  
            if(!realtimeClient.getIsConnected()){
                subscriptionsBuffer.push(channelPrefix + room.name);
            } else {
                subscribeChannel(channelPrefix + room.name);
            }

            var presenceData = {
                applicationKey: CloudChat.setup.realtime.applicationKey,
                authenticationToken: CloudChat.setup.realtime.token,
                isCluster: true,
                url: CloudChat.setup.realtime.url,
                channel: channelPrefix + room.name
            };

            clearInterval(presenceInterval);
            checkPresence(presenceData);

            presenceInterval = setInterval(function(){
                checkPresence(presenceData);
            }, 60 * 1000);            
        });
    }

})(window.CloudChat = window.CloudChat || {});

(function (CloudChat, undefined) {
    var Room = function(name){
        this.name = name;
        this.active = true;

        this.roomOpened = null;
        this.roomClosed = null;
        this.messageReceived = null;
    }

    Room.prototype = {
        name : null,
        active : false,
        opened : function(callback){
            this.roomOpened = callback;
            return this;
        },

        closed : function(callback){
            this.roomClosed = callback;
            return this;
        },

        onMessage : function(callback){
            this.messageReceived = callback;
            return this;
        }
    }

    var Api = function(configuration){
        if(Api.caller != Api.getInstance){
            throw new Error("This object cannot be instanciated");
        }

        this.loggedin = null;
        this.loginfailed = null;
        this.rooms = {};


        CloudChat.EventManager.subscribe("loggedin",function(user){
            if(this.loggedin){
                this.loggedin(user);
            }
        }.bind(this));

        CloudChat.EventManager.subscribe("loginfailed",function(provider){
            if(this.loginfailed){
                this.loginfailed(provider);
            }
        }.bind(this));

        CloudChat.EventManager.subscribe("roomopened",function(room){ 
            if(this.rooms[room.name] && this.rooms[room.name].roomOpened){
                this.rooms[room.name].roomOpened(room);
            }
        }.bind(this));

        CloudChat.EventManager.subscribe("closedroom",function(room){ 
            if(this.rooms[room.name] && this.rooms[room.name].roomClosed){
                this.rooms[room.name].roomClosed(room);
            }
        }.bind(this));

        CloudChat.EventManager.subscribe("receivedmessage",function(message){   
             if(this.rooms[message.room] && this.rooms[message.room].messageReceived){
                this.rooms[message.room].messageReceived(this.rooms[message.room],message);
             }
        }.bind(this));
    };

    Api.instance = null;

    Api.getInstance = function(){
        if(this.instance === null){
            this.instance = new Api();
        }
        return this.instance;
    };

    Api.prototype = {
        login : function(provider){
            setTimeout(function(){
                CloudChat.SecurityService.login(provider);
            },1);            

            return this;
        },

        openRoom : function(name){
            if(!this.rooms[name]){
                this.rooms[name] = new Room(name);
            }

            this.rooms[name].active = true;
            setTimeout(function(){
                CloudChat.EventManager.publish("openroom",this.rooms[name]); 
                CloudChat.EventManager.publish("roomopened",this.rooms[name]);
            }.bind(this),1);

            return this.rooms[name];
        },

        closeRoom : function(name){
            var room = null;

            if(this.rooms[name]){
                room = this.rooms[name];

                setTimeout(function(){
                    CloudChat.EventManager.publish("closeroom",this.rooms[name]); 
                    delete this.rooms[name];
                }.bind(this),1);                
            }

            return room;
        },

        sendMessage : function(user,room,messageText){
            setTimeout(function(){
                var message = {
                    content : messageText,
                    user : user.name,
                    userId : user.id,
                    userProvider : user.provider,
                    timestamp : +new Date(),
                    room : room,
                    id : (+new Date()) + '-' + CloudChat.Strings.guid() 
                };
                CloudChat.EventManager.publish("savemessage",message);
            },1);            
            return this;
        },

        onLoggedin : function(callback){
            this.loggedin = callback;
            return this;
        },

        onLoginFailed : function(callback){
            this.loginfailed = callback;
            return this;
        }
    };

    CloudChat.api = {
        instance : function(){
            return Api.getInstance();
        },

        login : function(provider){
            return Api.getInstance().login(provider);
        },

        openRoom : function(name){
            return Api.getInstance().openRoom(name);
        },

        closeRoom : function(name){
            return Api.getInstance().closeRoom(name);
        },

        sendMessage : function(user,room,message){
            return Api.getInstance().sendMessage(user,room,message);
        },

        onLoggedin : function(callback){
            return Api.getInstance().onLoggedin(callback);
        },

        onLoginFailed : function(callback){
            return Api.getInstance().onLoginFailed(callback);
        },

        loaded : function(callback){
            CloudChat.EventManager.subscribe("loaded",function(){   
                if(callback){
                    callback();
                }
            });
        }
    }
})(window.CloudChat = window.CloudChat || {});