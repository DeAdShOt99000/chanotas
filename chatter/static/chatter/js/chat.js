(function(){
    'use strict';

    const chatBox = document.getElementById('chat-box');
    const toBottomBtn = document.getElementById('to-bottom-btn')

    function scrollToBottom(){
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    toBottomBtn.onclick = scrollToBottom

    const messageInp = document.getElementById('text-message')

    messageInp.focus()

    messageInp.addEventListener('keydown', function(event){
        if (event.key == 'Enter') {
            event.preventDefault();
            document.getElementById('send').click()
            document.getElementById('text-message').value = ''
        }
    })

    document.getElementById('send').addEventListener('click', function(){
        const textMessage = {
            'text-message': document.getElementById('text-message').value
        }
        if (textMessage['text-message'] != ''){
            fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': window.csrf
                },
                body: JSON.stringify(textMessage)
            })
            document.getElementById('text-message').value = ''
        }
    })
    
    function tagAsViewed(lst){
        fetch(window.tagAsViewedLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': window.csrf
            },
            body: JSON.stringify({'ids': lst})
        })
    }

    const msgCircle = document.getElementById('msg-circle')

    const unRead = document.createElement('div')
    unRead.setAttribute('id', 'unread')

    let unReadPosition = false
    let unReadNumber = false

    let firstLoad = true
    const idsLst = []
    function updateMsg(){
        fetch(window.chatJson)
        .then(response => response.json())
        .then(data => {
            chatBox.innerHTML = ''

            if (Object.values(data).length > 0){

                const dateList = []
                let chat;
                for (let i in data){
                    chat = data[i]
                    if (firstLoad){
                        unReadNumber = Object.keys(data).map(x => data[x].viewed).filter(x => x === false).length
                    }
                    
                    if (!chat.viewed && !idsLst.includes(chat.id) && chat.sent_by_id == window.friendId){
                        idsLst.push(chat.id)
                        if (!unReadPosition && firstLoad){
                            unReadPosition = i
                        }
                    }
    
                    const chatElementContainer = document.createElement('div')
                    chatElementContainer.setAttribute('class', 'chat-text-container')
    
                    const chatElement = document.createElement('span')
                    chatElement.innerText = chat.text
    
                    const chatTime = document.createElement('span')
                    chatTime.innerText = chat.time
                    chatTime.setAttribute('class', 'time')
                    
                    if (chat.sent_by_id == window.userId){
                        chatElement.setAttribute('class', 'sender chat-text')
                    }
                    else {
                        chatElement.setAttribute('class', 'receiver chat-text')
                    }
                    
                    if (unReadPosition === i){
                        if (unReadNumber > 1){
                            unRead.innerText = '** ' + unReadNumber + ' unread messages **'
                        }
                        else {
                            unRead.innerText = '** ' + unReadNumber + ' unread message **'
                        }
                        chatBox.appendChild(unRead)
                    }
    
                    if (!dateList.includes(chat.date)){
                        const dateContainer = document.createElement('div')
                        dateContainer.setAttribute('class', 'date-container')
                        
                        const dateElement = document.createElement('span')
                        dateElement.setAttribute('class', 'date')
                        
                        dateElement.innerText = chat.date
                        
                        dateContainer.appendChild(dateElement)
                        chatBox.appendChild(dateContainer)
                        
                        dateList.push(chat.date)
                    }
                    
                    const br = document.createElement('br')
                    chatElement.appendChild(br)
                    chatElement.appendChild(chatTime)
                    chatElementContainer.appendChild(chatElement)
                    chatBox.appendChild(chatElementContainer)
                }
                if (firstLoad){
                    // console.log('first-time-only')
                    if (unReadPosition){
                        chatBox.scrollTop = unRead.offsetTop
                    }
                    else {
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }
                    if (idsLst){
                        tagAsViewed(idsLst)
                        idsLst.length = 0
                    }
                    firstLoad = false
                }
    
                if (idsLst.length > 0){
                    if (chatBox.scrollHeight - chatBox.scrollTop < chatBox.clientHeight + 1){
                        tagAsViewed(idsLst)
                        idsLst.length = 0
                    } else {
                        msgCircle.innerText = idsLst.length
                        msgCircle.style.display = 'Block'
                    }
                } else {
                    msgCircle.innerText = 0
                };
    
                if (toBottomBtn.style.display == 'none'){
                    chatBox.scrollTop = chatBox.scrollHeight;
                };
            } else {
                chatBox.innerHTML = '<div class="send-first-msg">--- Send The First Message! ---</div>'
            }
                    
            setTimeout(updateMsg, 1500);

        })
    }

    document.addEventListener('DOMContentLoaded', function(){
        chatBox.addEventListener('scroll', function(){
            if (chatBox.scrollHeight - chatBox.scrollTop < chatBox.clientHeight + 1){
                toBottomBtn.style.display = 'none';
                msgCircle.style.display = 'none'
            }
            else {
                toBottomBtn.style.display = 'block';
            }
        })
        updateMsg()
    })
})()