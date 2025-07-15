
import './Assistant.css'
import {useState} from 'react'
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {firebaseConfig} from "./firebase-config.ts";
import {API_BASE} from "./config.ts";


type Message = {
    message: string,
    sender: 'assistant' | 'user'
};


function Assistant() {
    const [newInput, setNewInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([

        {
            message:"Hello, what can I do for you today? I'm here to help with you finances.",
            sender: "assistant",
        },

    ]);



    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);


    const newMessage: React.FormEventHandler = async (event) => {
        event.preventDefault();
        setNewInput("");
        const NewMessages: Message[] = [...messages, {
            message: newInput,
            sender: "user"
        },
            {
                message: "Loading...",
                sender: "assistant",
            }

        ];

        setMessages(NewMessages);
        getAIResponse(NewMessages);

    }
    async function getAIResponse(currentMessage: Message[]) {
        const formData = new FormData();
        formData.append("userid", "11");
        formData.append("message", newInput);
        const token = await auth.currentUser?.getIdToken(true)


        try {
            const response = await axios.post(`${API_BASE}/ask_question`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Category data:", response.data);
            const updatedMessages = currentMessage.slice(0, -1); // remove last item
            updatedMessages.push({
                message: response.data,
                sender: "assistant"
            });

            setMessages(updatedMessages);
        } catch (error) {
            console.error("Error fetching category data:", error);
        }
    }
    return (
        <div className={"stuff"}>
            {messages.map((message, index) => (
                <p key={index} className={"message " + message.sender}>
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                </p>
            ))}


            <form onSubmit={newMessage} className={"form"}>
                <input type="text" placeholder="Message"
                       value = {newInput} className={"input"}
                       onChange={(e) => setNewInput(e.currentTarget.value)}
                />
                <button type="submit" className={"submit"}>Send</button>
            </form>
        </div>
    );
}

export default Assistant;
