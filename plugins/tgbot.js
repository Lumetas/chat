methods.tgbot = {
    update: async function () {
        const url = `https://api.telegram.org/bot${this.token}/getUpdates`;
        fetch(url + `?offset=${this.lastUpdateId + 1}`)
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Error getting updates');
                }
                return response.json();
            })
            .then(data => {
                if (data.ok && data.result.length > 0) {
                    data.result.forEach(update => {
                        this.processUpdate(update);
                        this.lastUpdateId = update.update_id;

                    });
                }
            })
            .catch(error => {
                console.error(error);
            });
        setTimeout(() => {
            methods.tgbot.update();
        }, 3000);
    },

    isVideoFile: function (filename) {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.webm', '.3gp', '.3g2'];
        const fileExtension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
        return videoExtensions.includes(fileExtension);
    },

    processUpdate: async function (update) {
        //console.log(update)
        let file_url = undefined;
        if (update.message) {
            let chatId = update.message.chat.id;
            let text = update.message.text;
            if (text === undefined) { text = ""; }
            let update_id = update.message.message_id;
            let array = storage_edit.get_array("tgbot_chats");
            //console.log(update.message.document, update.message.photo, update.message.document);
            if (update.message.document !== undefined || update.message.photo !== undefined || update.message.document !== undefined || update.message.video !== undefined) {
                let document = update.message.document ?? update.message.photo ?? update.message.document ?? update.message.video;
                if (Array.isArray(document)) {
                    document = document[document.length - 1];
                }
                let file_id = document.file_id;
                file_url = await this.getFileLink(file_id);
            }

            if (array.indexOf(chatId) === -1) {
                array.push(chatId);
                let hist = [];
                hist.push({ sender: chatId, text: text, update_id: update_id, file_url: file_url });
                storage_edit.set_array(`tgbot-history-${chatId}`, hist);
                storage_edit.set_array('tgbot_chats', array);
            }
            else {

                let hist = storage_edit.get_array(`tgbot-history-${chatId}`);
                if (hist[hist.length - 1].update_id === update_id) {
                    return;
                }
                hist.push({ sender: chatId, text: text, update_id: update_id, file_url: file_url });
                storage_edit.set_array(`tgbot-history-${chatId}`, hist);
            }


        }
    },

    load: async function () {
        chatId = contact;
        define_storage(`tgbot-history-${chatId}`, '[]');
        if (!method === "tgbot") { return; }
        let hist = storage_edit.get_array(`tgbot-history-${chatId}`);
        let c = '';
        for (let i = 0; i < hist.length; i++) {
            let p = document.createElement("p");
            if (hist[i].file_url !== undefined) {
                if (this.isVideoFile(hist[i].file_url)){
                    p.innerHTML = `${String(hist[i].sender).replaceAll('<', '&lt;').replaceAll('>', '&gt;')} : <video controls="true" src="${String(hist[i].file_url)}"> ${String(hist[i].text).replaceAll('<', '&lt;').replaceAll('>', '&gt;')}`;
                }
                else {
                    p.innerHTML = `${String(hist[i].sender).replaceAll('<', '&lt;').replaceAll('>', '&gt;')} : <embed src="${String(hist[i].file_url)}"> ${String(hist[i].text).replaceAll('<', '&lt;').replaceAll('>', '&gt;')}`;
                }
                
            }
            else {
                p.innerHTML = `${String(hist[i].sender).replaceAll('<', '&lt;').replaceAll('>', '&gt;')} : ${String(hist[i].text).replaceAll('<', '&lt;').replaceAll('>', '&gt;')}`;
            }

            c += p.outerHTML;
        }

        if (this.old_page === undefined || this.old_page !== c) {
            document.querySelector('#history').innerHTML = c;
            document.querySelector('#history').scrollTo(0, 999999999999999);
            this.old_page = c;
        }




    },

    send: async function (text, chatId, isChannel = false) {
        const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

        const data = {
            chat_id: chatId,
            text: text.toString()
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('post_text error');
                }
                //console.log(`Message sent to ${isChannel ? 'channel' : 'user'}: ${chatId}`);

                //console.log(`Received message from ${chatId}: ${text}`);
                let array = storage_edit.get_array("tgbot_chats");
                if (array.indexOf(chatId) === -1) {
                    array.push(chatId);
                    let history = [];
                    history.push({ sender: "you", text: text, update_id: 'lum', file_url: undefined });
                    storage_edit.set_array(`tgbot-history-${chatId}`, history);
                    storage_edit.set_array('tgbot_chats', array);
                }
                else {
                    let history = storage_edit.get_array(`tgbot-history-${chatId}`);
                    history.push({ sender: "you", text: text, update_id: 'lum', file_url: undefined });
                    storage_edit.set_array(`tgbot-history-${chatId}`, history);
                }
                history = storage_edit.get_array(`tgbot-history-${chatId}`);
                for (let i = 0; i < history.length; i++) {
                    //console.log(history);
                    let p = document.createElement("p");

                    p.innerHTML = `${history[i].sender} : ${history[i].text}`;
                    document.querySelector('#history').appendChild(p);
                }
            })
            .catch(error => {
                console.error(error);
            });
    },

    init: async function () {
        this.old_page = "";
        define_storage('tgbot_token', '');
        define_storage('tgbot_chats', '[]');


        this.token = localStorage.tgbot_token;
        let input = document.createElement("input");
        input.value = this.token;
        input.oninput = (e) => {
            localStorage.tgbot_token = e.srcElement.value;
        }

        input.onload = (e) => {
            e.srcElement.outerHTML = "<br><br><br>" + e.srcElement.outerHTML;
        }

        input.placeholder = "tgbot token";
        input.classList = "shot_input"

        document.querySelector('#settings_window').appendChild(input);
        this.update();
        setInterval(() => {
            methods.tgbot.load();
        }, 100);
        console.log("init tgbot module");
    },
    getFileLink: async function (fileId) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.token}/getFile?file_id=${fileId}`);
            const data = await response.json();

            if (data.ok) {
                const fileLink = `https://api.telegram.org/file/bot${this.token}/${data.result.file_path}`;
                return fileLink;
            } else {
                throw new Error(`Error getting file link: ${data.description}`);
            }
        } catch (error) {
            console.error('Error getting file link:', error);
            throw error;
        }
    }


}
methods.tgbot.init();
