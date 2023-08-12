(function(){
    'use strict';

    const resendCd = document.querySelector('.resend-cd')
    const totalWaitTime = 10
    let x = totalWaitTime

    const resendBtn = document.querySelector('.resend')
    function countDown(){
        resendCd.innerText = x
        x--
        if (x >= 0){
            setTimeout(countDown, 1000)
        }
        else {
            resendBtn.removeAttribute('disabled')
            resendCd.innerText = ''
        }
    }
    countDown()
    
    resendBtn.addEventListener('click', fetchResend)

    const verifyForm = document.querySelector('form')
    verifyForm.addEventListener('submit', function(evt){
        evt.preventDefault();
        fetch(window.signupLink, {
            method: 'post',
            body: JSON.stringify({
                email: window.email,
                'v-code-input': document.getElementById('v-code-input').value
            }),
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': window.csrf
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.code_failed == true){
                document.querySelector('.verify-input-cont span').innerText = 'Wrong code, try again.'
            }
            else {
                document.querySelector('.verify-input-cont span').innerHTML = '&#9989;'
                setTimeout(function(){
                    if (window.next != 'None'){
                        window.location.href = window.next
                    } else {
                        window.location.href = window.homeLink
                    }
                }, 1000)
            }
        })
    })
    
    function fetchResend(){
        resendBtn.setAttribute('disabled', 'disabled')
        fetch(window.resendVerificationLink, {
            method: 'post',
            body: JSON.stringify({
                email: window.email
            }),
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': window.csrf,
            }
        })
        .then(function(){
            x = totalWaitTime
            countDown()
        })
    }

    const codeInp = document.querySelector('.verify-input-cont input')
    codeInp.focus()

    codeInp.addEventListener('keydown', function(event){
        if (event.key == 'Enter'){
            document.querySelector('.submit-resend-cont input[type="submit"').click()
        }
    })
})();