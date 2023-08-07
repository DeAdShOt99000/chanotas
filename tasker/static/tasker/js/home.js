(function(){
    'use strict';
    
    const selectDate = document.getElementById('select-date')
    const tasksContainer = document.getElementById('tasks-container')
    
    const addTask = document.querySelector('.add-task')
    const newTask = document.querySelector('#new-task')
    const noAvailTasks = document.querySelector('.no-avail-tasks')
    
    function addCheckbox(taskIdE, taskE, is_doneE){
        const container = document.createElement('div')
        container.className = 'single-task-cont'
        
        const input = document.createElement('input')
        input.type = 'checkbox'
        input.name = taskIdE
        input.id = 'all-tasks-' + taskIdE
        input.checked = is_doneE == 1
        input.className = 'all-tasks'
        
        const label = document.createElement('label')
        label.setAttribute('for', 'all-tasks-' + taskIdE)
        label.innerText = taskE
        
        const button = document.createElement('button')
        button.id = 'rm-task-' + taskIdE
        button.className = 'rm-task'
        button.innerHTML = '&#10060;'
        button.title = 'Remove this Task'
        
        container.appendChild(input)
        container.appendChild(label)
        container.appendChild(button)
        
        tasksContainer.appendChild(container)
        
        return container
    }
    
    function sendNewTask(taskText) {
        if (taskText.length > 0){
            fetch(`${selectDate.value}`, {
                method: 'POST',
                body: JSON.stringify({
                    task: taskText,      
                }),
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': window.csrf
                }
            })
            .then(response => response.json())
            .then(data => {
                const task = addCheckbox(data.taskIDE, data.taskE, data.is_doneE)
                rmTaskFunc(task.querySelector('.rm-task'))
                doneCount(document.querySelectorAll('.all-tasks'))
                newTask.value = ''
                noAvailTasks.style.display = 'none'
            })
        }
        addTask.style.display = 'inline'
        newTask.style.display = 'none'
    }

    function rmTaskFunc(task){
        task.addEventListener('click', function(event){
            fetch(`delete/${event.target.id.substring(8)}`)
            .then(function(){
                tasksContainer.removeChild(event.target.parentElement)
                doneCount(document.querySelectorAll('.all-tasks'))
            })
        })
    }
    
    selectDate.addEventListener('change', function(){
        window.location.href = selectDate.value
    })
    
    addTask.addEventListener('click', function(){
        addTask.style.display = 'none'
        newTask.style.display = 'inline'
        newTask.focus()
    })
    
    newTask.addEventListener('keydown', function(event){
        if (event.key == 'Enter'){
            sendNewTask(newTask.value)
        }
    })
    
    document.querySelector('.date-container').addEventListener('click', function(){
        document.querySelector('.date-container input').style.display = 'block'
        document.querySelector('.date-container > h1').style.visibility = 'hidden'
    })
    
    document.body.addEventListener('click', function(event){
        if (!document.querySelector('.date-container').contains(event.target)){
            document.querySelector('.date-container input').style.display = 'none'
            document.querySelector('.date-container > h1').style.visibility = 'visible'
        }
        
        if (newTask != event.target && addTask != event.target && newTask.style.display == 'inline'){
            sendNewTask(newTask.value)
        }
    })
            
    fetch(`tasker-tasks-json/${selectDate.value}`)
    .then(response => response.json())
    .then(json => {
        const data = JSON.parse(json)
        tasksContainer.innerHTML = ''
        
        if (Object.keys(data).length > 0){
            for (let i in data){
                const taskIdE = data[i].pk
                const taskE = data[i].fields.task
                const is_doneE = data[i].fields.is_done
                
                addCheckbox(taskIdE, taskE, is_doneE)            
            }
            
            doneCount(document.querySelectorAll('.all-tasks'))
            
            document.querySelectorAll('.rm-task').forEach(task => {rmTaskFunc(task)})
            
            document.querySelectorAll('.all-tasks').forEach(function(task) {
                task.addEventListener('change', function(){
                    doneCount(document.querySelectorAll('.all-tasks'))
    
                    fetch(`tasker-tasks-json/${selectDate.value}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            update_task_id: this.getAttribute('name')
                        }),
                        headers: {
                            'Content-type': 'application/json',
                            'X-CSRFToken': window.csrf
                        }
                    })
                })
            });
        } else {
            noAvailTasks.style.display = 'block'
        };
    });

    const doneCountContainer = document.querySelector('.done-count-container')
    function doneCount(allTasks){
        if (allTasks.length){
            let is_doneE_count = 0;
            for (let i=0; i < allTasks.length; i++){
                if (allTasks[i].checked){
                    is_doneE_count++
                }
            }
            if (allTasks.length - is_doneE_count == 1){
                doneCountContainer.innerText = `${allTasks.length - is_doneE_count} task is left to complete.`
            } else if (is_doneE_count < allTasks.length){
                doneCountContainer.innerText = `${allTasks.length - is_doneE_count} tasks are left to complete.`
            } else if (is_doneE_count == allTasks.length){
                doneCountContainer.innerText = 'Completed!'
            }
        } else {
            noAvailTasks.style.display = 'block'
            doneCountContainer.innerText = ''
        }
    }
})();