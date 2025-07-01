
import './Assistant.css'
import {useState} from 'react'
import axios from "axios";
import ReactMarkdown from "react-markdown";

type Message = {
    message: string,
    sender: 'assistant' | 'user'
};


function Assistant() {
    const [newInput, setNewInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([

        {
            message:"Sample",
            sender: "assistant",
        },
        {
            message:"Sample 12",
            sender:"user"
        }
    ]);
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

        try {
            const response = await axios.post('http://127.0.0.1:5000/ask_question', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
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
        <div>
            {messages.map((message, index) => (
                <p key={index} className={"message " + message.sender}>
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                </p>
            ))}


            <form onSubmit={newMessage}>
                <input type="text" placeholder="Message"
                       value = {newInput}
                       onChange={(e) => setNewInput(e.currentTarget.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Assistant;
