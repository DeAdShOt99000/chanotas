(function(){
    'use strict';
    
    const chatBox = document.getElementById('chat-box');
    const toBottomBtn = document.getElementById('to-bottom-btn');
    const toBottomBtnCont = document.getElementById('to-bottom-btn-container');
    const msgCircle = document.getElementById('msg-circle');

    toBottomBtn.onclick = function(){
        chatBox.scrollTop = chatBox.scrollHeight;
    };
    
    document.getElementById('send').addEventListener('click', function(){
        const textMessage = {
            'text-message': document.getElementById('text-message').value
        };
        if (textMessage['text-message'] != ''){
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': window.csrf
                },
                body: JSON.stringify(textMessage)
            });
            document.getElementById('text-message').value = '';
        };
    });

    const messageInp = document.getElementById('text-message');

    messageInp.focus()

    messageInp.addEventListener('keydown', function(event){
        if (event.key == 'Enter') {
            document.getElementById('send').click()
            document.getElementById('text-message').value = '';
        };
    });
    
    function tagAsViewed(lst){
        fetch(window.tagAsViewedLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.csrf
            },
            body: JSON.stringify({'ids': lst})
        });
    };

    const unRead = document.createElement('div');
    unRead.setAttribute('id', 'unread');

    let unReadPosition;
    let unReadNumber;
    let chat;
    let firstLoad = true;

    const idsLst = [];

    let last_msg_id = -2;
    function updateMsg(){
        fetch(window.chatJson + `?last-msg-id=${last_msg_id}`)
        .then(response => response.json())
        .then(data => {
            const last_msg_id_server = data[Object.values(data).length-1] ? data[Object.values(data).length-1]['id']: -1;
            if (last_msg_id_server != 'same' && last_msg_id != -1){
                last_msg_id = last_msg_id_server;
                chatBox.innerHTML = '';
    
                if (Object.values(data).length > 0){
                    const dateList = [];
                    for (let i in data){
                        chat = data[i];

                        if (!chat.viewed && !idsLst.includes(chat.id) && chat.sent_by_id == window.friendId){
                            idsLst.push(chat.id);
                        };
        
                        const chatElementContainer = document.createElement('div');
                        chatElementContainer.setAttribute('class', 'chat-text-container');
        
                        const chatElement = document.createElement('div');
                        
                        const chatText = document.createElement('div');
                        chatText.innerText = chat.text;
                        chatText.setAttribute('class', 'text');

                        const chatTime = document.createElement('div');
                        chatTime.innerText = chat.time;
                        chatTime.setAttribute('class', 'time');
                        
                        if (chat.sent_by_id == window.userId){
                            chatElement.setAttribute('class', 'sender chat-text');
                        } else {
                            chatElement.setAttribute('class', 'receiver chat-text');
                        };
        
                        if (!dateList.includes(chat.date)){
                            const dateContainer = document.createElement('div');
                            dateContainer.setAttribute('class', 'date-container');
                            
                            const dateElement = document.createElement('span');
                            dateElement.setAttribute('class', 'date');
                            
                            dateElement.innerText = chat.date;
                            
                            dateContainer.appendChild(dateElement);
                            chatBox.appendChild(dateContainer);
                            
                            dateList.push(chat.date);
                        };
                        
                        chatElement.appendChild(chatText);
                        chatElement.appendChild(chatTime);
                        chatElementContainer.appendChild(chatElement);
                        chatBox.appendChild(chatElementContainer);

                        if (idsLst.length == 1){
                            unReadPosition = Array.from(chatBox.children).indexOf(chatElementContainer);
                        };
                    };
                        
                    unReadNumber = idsLst.length;
                    if (unReadNumber && firstLoad){
                        if (unReadNumber > 1){
                            unRead.innerText = '** ' + unReadNumber + ' unread messages **';
                        } else {
                            unRead.innerText = '** ' + unReadNumber + ' unread message **';
                        }

                        tagAsViewed(idsLst)
                        idsLst.length = 0;

                        chatBox.insertBefore(unRead, chatBox.children[unReadPosition]);
                        unRead.scrollIntoView();
                    } else if (unReadNumber){
                        tagAsViewed(idsLst)
                        msgCircle.innerText = parseInt(msgCircle.innerText) + 1;
                        msgCircle.style.display = 'block';
                        idsLst.length = 0;
                        if (toBottomBtnCont.style.display != 'block'){
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }
                    } else {
                        chatBox.scrollTop = chatBox.scrollHeight;
                    };
                    firstLoad = false;

                } else {
                    chatBox.innerHTML = '<div class="send-first-msg">--- Send The First Message! ---</div>';
                }
            }
                    
            setTimeout(updateMsg, 1500)

        })
    }

    window.onload = function(){
        chatBox.addEventListener('scroll', function(){
            if (chatBox.scrollHeight - 15 > chatBox.clientHeight + chatBox.scrollTop){
                toBottomBtnCont.style.display = 'block';
            } else {
                toBottomBtnCont.style.display = 'none';
                msgCircle.innerText = 0;
                msgCircle.style.display = 'none';
            };
        });
        updateMsg()
    };
})()