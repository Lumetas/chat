import requests
import time

TOKEN = '7449530361:AAGBsUuwVqjwANSWTdpoxuW0sg_OaHC8ZiE'
last_update_id = 0

def get_updates():
    global last_update_id
    url = f'https://api.telegram.org/bot{TOKEN}/getUpdates?offset={last_update_id + 1}'
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data['ok'] and data['result']:
            for update in data['result']:
                process_update(update)
                last_update_id = update['update_id']
        time.sleep(3)  # Повторить запрос через 3 секунды
    except requests.exceptions.RequestException as e:
        #print(f'Error getting updates: {e}')
        time.sleep(3)  # Повторить запрос через 3 секунды в случае ошибки

def process_update(update):
    print(update)
    if 'message' in update:
        chat_id = update['message']['chat']['id']
        text = update['message']['text']
        print(f'Received message from {chat_id}: {text}')
        # Здесь можно добавить логику обработки полученного сообщения

def send_message(text, chat_id, is_channel=False):
    url = f'https://api.telegram.org/bot{TOKEN}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': str(text)
    }
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()
        print(f'Message sent to {"channel" if is_channel else "user"}: {chat_id}')
    except requests.exceptions.RequestException as e:
        print(f'Error sending message: {e}')

if __name__ == '__main__':
    while True:
        get_updates()
