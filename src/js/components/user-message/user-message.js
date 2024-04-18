class UserMessage {
    constructor(message, isTemporary, type) {

        const oldMessages = document.getElementsByClassName('message-container');
        if (oldMessages.length > 0) {
            Array.from(oldMessages).forEach(msg => {
                msg.remove();
            });
        }

        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        messageContainer.style.background = MESSAGE_PROPERTIES[type].background;

        const messageText = document.createElement('p');
        messageText.className = 'non-selectable-text message-text';
        messageText.textContent = message;
        messageText.style.color = MESSAGE_PROPERTIES[type].text;
        messageContainer.appendChild(messageText);

        const closeBtn = document.createElement('div');
        closeBtn.className = 'message-close-btn';
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            messageContainer.remove();
        };
        messageContainer.appendChild(closeBtn);

        document.getElementById('mapa').appendChild(messageContainer);

        if (!isTemporary) {
            return;
        }

        setTimeout(() => {
            if (messageContainer) {
                messageContainer.remove();
            }
        }, MESSAGE_PROPERTIES[type].time);
    }
};
