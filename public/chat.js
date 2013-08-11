
/***** CLIENT *****/

localStorage.setItem('name', 'pluto');

var messages = [],
    socket = io.connect('http://localhost:1337'),

    field = document.querySelector('.field'),
    sendButton = document.querySelector('.send'),
    content = document.querySelector('.messages'),
    notice = document.querySelector('.notice'),

    getNick = function() {
        if (localStorage.getItem('name') === null) {
            var _maxRandomInt = 99999,
                randomInt = Math.floor(Math.random()*_maxRandomInt+1),
                randomName = 'Guest' + randomInt;
            localStorage.setItem('name', randomName);
        }
        return localStorage.getItem('name');
    },
    setNick = function(nick){
        if (nick != '' && nick != undefined && nick != null) {
            localStorage.setItem('name', nick);
            return localStorage.getItem('name');
        }
        return false;
    },

    message = function() {

        var name = getNick(),
            text = field.value,
            type = 1;

        return {
            // nome di chi l'ha spedito
            name: name,
            // testo del messaggio
            text: text,
            // tipo di messaggio (NORMAL, SYSTEM, SCREAM?)
            type: type
        }
    },

    sendMessage = function (data) {
        
        var commandRegex = /^\/([a-z0-9_-]+)\s?([a-z0-9_-]+)?\s?([a-z0-9_-]+)?$/i,
            isCommand = commandRegex.test(data.text);

        if (isCommand) {

            var matches = commandRegex.exec(data.text);
                commandName = matches[1]; // TODO we will use a switch statement here
            if (/nick/i.test(commandName)) {
                var newNickname = matches[2];
                console.log(newNickname);
                var emptyNickname = !!(newNickname == undefined || newNickname == '');
                console.log(emptyNickname)
                if (!emptyNickname) {

                    socket.emit('send', {
                        name: 'Server',
                        text: getNick() + ' changed his name to ' + newNickname,
                        type: 0
                    });

                    setNick(newNickname);
                }
            }

        } else {
            // send the message
            socket.emit('send', data);
        }
        field.value = ""; // clear input tag
    };


// server events

socket.on('message', function (data) {

    //console.log(data);

    if (data.name && data.text) {
        messages.push(data);
        var html = '';
        for(var i=0; i<messages.length; i++) {
            html += "<b>" + messages[i].name + "</b>: " +
            messages[i].text + 
            ' (type: ' + messages[i].type 
            + ') <br />';
        }
        content.innerHTML = html;
    } else {
        console.log("Houston, we have a problem: ", data);
    }
});

socket.on('foo', function(data) {

    console.log(data);
});

socket.on('broadcasting', function(data) {
    console.log('CLIENT: ' + data);
});



// client-side event listeners

sendButton.addEventListener("click", function(){
    sendMessage(message());
}, false);

field.addEventListener("keyup", function(event){

    console.log(field.value);

    if (field.value != '') {
        console.log("NOT empty");
        notice.innerHTML = "Nickname Sta scrivendo...";

    } else {
        console.log("empty");
        notice.innerHTML = '';
    }


	if(event.keyCode == 13) { //user pressed enter
        sendMessage(message());

        socket.emit('writing', 'user: im writing...');

        notice.innerHTML = '';
        // if message == "/nick new-nickname"
        //if (field.value == "/nick new-nickname") {
            //sendSystemMessage("new-nick");
        //    return;
        //}
	}
}, false);
