const methods = {}
let method;
let contact;


function define_storage(name, value, session = false) {
    if (session) {
        if (sessionStorage[name] === undefined) {
            sessionStorage[name] = value;
        }
    }
    else {
        if (localStorage[name] === undefined) {
            localStorage[name] = value;
        }
    }

}

let storage_edit = {
    get_array: function (name, session = false) {
        if (session) {
            return JSON.parse(sessionStorage[name]);
        }
        else {
            return JSON.parse(localStorage[name]);
        }
    },

    set_array: function (name, array, session = false) {
        if (session) {
            sessionStorage[name] = JSON.stringify(array);
        }
        else {
            localStorage[name] = JSON.stringify(array);
        }
    }
}

function load_plugin(path) {
    let scr = document.createElement("script");
    scr.src = path;
    document.body.appendChild(scr);
}

function add_chat() {
    let chat = document.getElementById('chat_info').value;
    document.getElementById('chat_info').value = "";
    if (chat === null || chat === "") { return false; }
    let chats = storage_edit.get_array("chat_list");
    chats.push(chat);
    storage_edit.set_array("chat_list", chats);
    rewrite_chat_list();
}

function rewrite_chat_list() {
    let chats = storage_edit.get_array("chat_list");
    count = chats.length;
    i = 0;
    c = `<br class="exit_settings_btn">`;
    while (i < count) {
        c += `
        <input type="text" placeholder="⥥   ${chats[i]}   ⥥" class="move_btn" onclick='this.blur(); document.getElementById("select-chat-checkbox-${chats[i]}").click()' class="chat_name">
        <input onchange="open_window('chatwindow', ['exit_chat', this])" id="select-chat-checkbox-${chats[i]}" type="checkbox" name="selected_chat" value="${chats[i]}" class="chat_element_radio">
        <br>
        `
        i += 1;
    }
    document.getElementById('chats').innerHTML = c;

    document.querySelector('#chat_list_area').value = chats.join('\n');
}

function open_window(id, th = undefined) {
    document.getElementById(id).style.top = "0dvh";
    if (th !== undefined) {
        
        document.getElementById(th[0]).placeholder = `⥣   ${th[1].value}   ⥣`;
        storage_edit.set_array("current_window", [th[1].value], true);
        update();
        
    }

}

function close_window(id) {
    document.getElementById(id).style.top = "-100dvh";
}

document.querySelector('body').onload = () => {
    define_storage("chat_list", "[]");
    define_storage("lum_messenger_plugins", "[]");
    define_storage("current_window", '[]', true);

    rewrite_chat_list();
    let plugins = storage_edit.get_array("lum_messenger_plugins");
    for (let i = 0; i < plugins.length; i++) {
        load_plugin(plugins[i]);
    }
    document.getElementById("plugin_list_area").value = plugins.join('\n');

}

document.querySelector('#chat_list_area').oninput = () => {
    storage_edit.set_array("chat_list", document.querySelector('#chat_list_area').value.split('\n'));
    rewrite_chat_list();
}

document.getElementById("plugin_list_area").oninput = () => {
    storage_edit.set_array("lum_messenger_plugins", document.querySelector('#plugin_list_area').value.split('\n'));
}

function send(){
    let chat = storage_edit.get_array("current_window", true)[0].split(':');
    let method = chat[0];
    let user = chat[1];

    methods[method].send(document.querySelector('#text_to_send').value, user);
    document.querySelector('#text_to_send').value = '';
    document.getElementById('text_to_send').focus();
}


function update(){
    let chat = storage_edit.get_array("current_window", true)[0].split(':');
    method = chat[0];
    contact = chat[1];
    
    
}

document.getElementById('text_to_send').onkeyup = (e) => {
    if (e.key === "Enter"){send()}
}




elementToObserve = window.document.getElementById('history');
observer = new MutationObserver(function(mutationsList, observer) {
    setTimeout(() => {document.getElementById('history').scrollTo(0,99999999);}, 100);
});
observer.observe(elementToObserve, {characterData: false, childList: true, attributes: false});

document.getElementById('history').onload = () => {
    document.getElementById('history').scrollTo(0,99999999);
}