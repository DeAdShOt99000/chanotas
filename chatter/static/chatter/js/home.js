(function(){
    'use strict';

    const search = document.getElementById('search-flex');
    search.addEventListener('input', searchFunc);
    
    function searchFunc(){
        for (let elem of document.querySelectorAll('.each-chat')){
            if (elem.querySelector('.friend-chat').innerText.toLowerCase().includes(search.value.toLowerCase()) || elem.querySelector('.friend-user').innerText.toLowerCase().includes(search.value.toLowerCase())){
                elem.querySelector('.friend-chat').innerHTML = highlight(elem.querySelector('.friend-chat').innerText, search.value);
                elem.querySelector('.friend-user').innerHTML = highlight(elem.querySelector('.friend-user').innerText, search.value);
                elem.style.display = 'block';
            } else {
                elem.style.display = 'none';
            };
        };
    };

    function highlight(text, word){
        let lowerText = text.toLowerCase();
        word = word.toLowerCase();

        if (word.length > 0){
            let start = 0;
            let indecies = [];
            let currentInd;
            let inLst;
            
            while (lowerText.indexOf(word, start) != -1){
                currentInd = lowerText.indexOf(word, start);
                inLst = [];

                start = currentInd + 1;
                while (lowerText.indexOf(word, start) != -1 && (lowerText.indexOf(word, start) - currentInd) < word.length){
                    inLst.push(currentInd)
                    currentInd = lowerText.indexOf(word, start);
                    start = currentInd + 1;
                }

                if (inLst.length > 0){
                    inLst.push(currentInd)
                    indecies.push(inLst)
                } else {
                    indecies.push(currentInd)
                    currentInd = lowerText.indexOf(word, start);
                }
            }
    
            const opening = '<span style="background-color: rgb(47, 47, 47); color: white;">';
            const closing = '</span>';
            
            let newText = text;
            let incrementor = 0;

            let ind1;
            let ind2;
            for (let ind of indecies){
                if (Array.isArray(ind)){
                    ind1 = ind[0] + incrementor;
                    ind2 = word.length + (incrementor + ind[ind.length - 1]);
                } else {
                    ind1 = ind + incrementor;
                    ind2 = word.length + ind1;
                }
                newText = newText.slice(0, ind1) + opening + newText.slice(ind1, ind2) + closing + newText.slice(ind2);
                incrementor += (opening + closing).length;
            };
            return newText;
        };
        return text;
    }

    const byEmail = document.getElementById('by-email');
    const byUsername = document.getElementById('by-username');
    const emailInp = document.getElementById('add-friend-email');
    const usernameInp = document.getElementById('add-friend-username');

    let currentMethod = 'Email';

    function toggleEmailUsername(emUs){
        if (emUs == 'email'){
            byEmail.classList.add('chosen-method')
            byUsername.classList.remove('chosen-method')
            emailInp.style.display = 'inline';
            usernameInp.style.display = 'none';
            usernameInp.value = '';
            emailInp.focus()
            currentMethod = 'Email';
        } else if (emUs == 'username'){
            byEmail.classList.remove('chosen-method')
            byUsername.classList.add('chosen-method')
            emailInp.style.display = 'none';
            usernameInp.style.display = 'inline';
            emailInp.value = '';
            usernameInp.focus()
            currentMethod = 'Username';
        }
    }

    byEmail.onclick = function(){toggleEmailUsername('email')};
    byUsername.onclick = function(){toggleEmailUsername('username')};

    const validationSpan = document.querySelector('.validation');
    const submitBtn = document.querySelector('.add-friend-form input[type="submit"]');

    function checkUserEmail(){
        if (emailInp.value.length > 0 || usernameInp.value.length > 0){
            validationSpan.innerHTML = `<img src=${window.spinner} alt="loading..." width="14px">`;

            const data = {};
            if (emailInp.value){ data.email = emailInp.value }
            else if (usernameInp.value){ data.username = usernameInp.value };
            
            fetch(window.checkUserEmailLink, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': window.csrf
                }
            })
            .then(response => response.json())
            .then(data => {
                validationSpan.innerHTML = '';
                if (!data['message']) {
                    validationSpan.innerHTML = '&#9989;';
                    submitBtn.disabled = false;
                } else {
                    validationSpan.innerHTML = `This ${currentMethod} is not available &#10060;`;
                    submitBtn.disabled = true;
                }
            });
        } else {
            validationSpan.innerHTML = '';
            submitBtn.disabled = true;
        };
    };

    emailInp.oninput = function(){setTimeout(checkUserEmail, 50)};
    usernameInp.oninput = function(){setTimeout(checkUserEmail, 50)};

    const addFriendBox = document.getElementById('add-friend-box');
    const addFriendBtn = document.querySelector('.add-friend-btn');

    document.body.addEventListener('click', function(event){
        if (!addFriendBox.contains(event.target) && !addFriendBtn.contains(event.target)){
            addFriendBox.style.display = 'none';
        };
    });

    addFriendBtn.onclick = toggleBox;

    let last_msg_id = -1;
    function updateHome(){
        fetch(window.homeJsonLink + `?last-msg-id=${last_msg_id}`)
        .then(response => response.json())
        .then(data => {
            if (data[0]['last_msg'] != 'same'){
                last_msg_id = data[0]['last_msg'][2];
                const chats = document.getElementById('chats');
                chats.innerHTML = '';
    
                let friend;
                if (Object.values(data).length > 0){
                    for (let i in data){
                        friend = data[i];
    
                        const eachChat = document.createElement('div');
                        eachChat.className = 'each-chat';
                        eachChat.id = 'ec-' + friend.id;
                        eachChat.onclick = function(){
                            window.location.href = "chat/" + eachChat.id.substring(3);
                        };
                        
                        const friendChatCont = document.createElement('div');
                        friendChatCont.className = 'friend-chat-cont';
    
                        const friendLogoCont = document.createElement('div');
                        friendLogoCont.className = 'friend-logo-cont';
                        friendLogoCont.setAttribute('style', `background-color: #${friend.user_color}`)
    
                        const friendLogo = document.createElement('div');
                        friendLogo.className = 'friend-logo';
                        friendLogo.innerText = friend.first_name.substring(0, 1) + friend.last_name.substring(0, 1);
                            
                        const friendChat = document.createElement('span');
                        friendChat.setAttribute('class', 'friend-chat')
                        friendChat.setAttribute('id', 'fc-'+friend.id)
                        friendChat.innerText = `${friend.first_name} ${friend.last_name}`;
        
                        const friendUser = document.createElement('span');
                        friendUser.setAttribute('class', 'friend-user')
                        friendUser.setAttribute('id', 'pe-'+friend.id)
                        friendUser.innerText = '@' + friend.username;
        
                        const msgCircle = document.createElement('div');
                        msgCircle.setAttribute('class', 'msg-circle')
                        
                        if (friend.not_viewed){
                            msgCircle.innerText = friend.not_viewed;
                            msgCircle.style.display = 'block';
                        };
        
                        friendLogoCont.appendChild(friendLogo)
    
                        friendChatCont.appendChild(friendLogoCont)
                        friendChatCont.appendChild(friendChat)
                        friendChatCont.appendChild(friendUser)
        
                        eachChat.appendChild(friendChatCont)
                        eachChat.appendChild(msgCircle)
                        chats.appendChild(eachChat)
    
                        searchFunc()
                    }
                } else {
                    const noFriends = document.createElement('h3');
                    noFriends.innerText = 'No available friends';
                    noFriends.setAttribute('id', 'no-friends')
                    chats.appendChild(noFriends)
                };
            };

            setTimeout(updateHome, 3000)
        });
    };

    function toggleBox(){
        if (addFriendBox.style.display === 'none'){
            addFriendBox.style.display = 'grid';
            if (currentMethod == 'Email'){
                emailInp.focus()
            } else {
                usernameInp.focus()
            }
        }
        else{
            addFriendBox.style.display = 'none';
        }
    }
    
    window.onload = updateHome;
})()