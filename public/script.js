const URL = `ws://${window.location.hostname}:3333`;

const socket = new WebSocket(URL);

let myId;
let userIds = new Set();

/**
 * 
 * @param {string} info
 * @returns void 
 */
function renderInfo(info) {
    const main = document.querySelector(".messages");  
  
    const chatHeader = document.createElement("p");

    const messageSection = document.createElement("section");
    messageSection.className = "chat chat-info";

    const messageText = document.createElement("p");
    messageText.innerText = info;

    const time = document.createElement("time");
    time.className = 'text-xs opacity-50';
    time.innerText = new Date().toLocaleString("ru");

    chatHeader.append(time);

    messageSection.append(chatHeader, messageText);
    main.append(messageSection);
}

/**
 * 
 * @param {string[]} users 
 * @returns void
 */
function renderUsers() {
    const usersElement = document.querySelector('.users');
    usersElement.replaceChildren();

    for (const user of userIds) {
        const userElement = document.createElement("button");   
        userElement.className = "user list-row";
        userElement.innerText = user;
        

        usersElement.append(userElement);
    }
}

/**
 * @param{ { authorId: string, content: string, sentAt: number } } message 
 * @returns {HTMLElement}
 */
function renderMessage(message) {
    const main = document.querySelector(".messages");  

    const messageSection = document.createElement("section");
    messageSection.classList.add("chat");

    switch (message.authorId) {
        case myId:
            messageSection.classList.add("chat-end");
            break;
        default:
            messageSection.classList.add("chat-start");
            break;
    }

    
    const chatHeader = document.createElement("p");
    chatHeader.classList = ["chat-header"];
    chatHeader.innerText = message.authorId == myId ? "me" : message.authorId;

    const messageText = document.createElement("p");
    messageText.classList = ["chat-bubble"];
    messageText.innerText = message.content;

    const time = document.createElement("time");
    time.className = 'text-xs opacity-50';
    time.innerText = ( new Date(message.sentAt) ).toLocaleString("ru");

    chatHeader.append(time);

    messageSection.append(chatHeader, messageText);
    main.append(messageSection);
}
/**
 * 
 * @param {string} content 
 */
function sendMessage(message) {
    socket.send(JSON.stringify(message))
}

socket.addEventListener("error", (event) => {
    console.error(event);
});

socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    const { type, value } = data;
    console.log(type)
    switch (type) {
        case "uuid": 
            myId = value;
            break;
        case "messages":
            const messages = Array.isArray(value) ? value : [value] 
            for (const message of messages) {
                console.log(message)
               renderMessage(message);
            }    
            break;
        case "message":
            renderMessage(value);
            break;``
        case "users":
            for (const userId of value) {
                userIds.add(userId);
            }
            renderUsers();
            break;
        case "join":
            userIds.add(value);
        
            renderInfo(`${value} присоединился к чату`);
            renderUsers();
            break;
        case "leave":
            userIds.delete(value);

            renderInfo(`${value} покинул чат`);
            renderUsers();
            break;
        default:
            console.log("unknown data type");
            break;
    }
 
});

socket.addEventListener("close", (event) => {
    console.log(`Connection closed ${event.reason}`)
})

const messagesForm = document.querySelector("form.messages__form");


function handleFormSend(event) {
    event.preventDefault();
    const formElement = event.target;

    const messageContent = String(
        formElement
        .elements
        .message__input
        .value)
        .replaceAll("\n", "</br>");

   const input = formElement.querySelector(".message__input");
   input.value = "";

    const message = {
        authorId: myId,
        sentAt: (new Date()).getTime(),
        content: messageContent,
    } 

    sendMessage(message);

}

messagesForm.addEventListener("submit", handleFormSend)
// messagesForm.addEventListener("keypress", (event) => {
//     if (event.keycode === 13) {
//         event.preventDefault();
//         handleFormSend(event);
//     }
// })
