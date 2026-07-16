import { useState } from "react";
import axios from "axios";

export default function AIChat() {

    const [message, setMessage] = useState("");
    const [reply, setReply] = useState("");

    const askAI = async () => {

        const res = await axios.post(
            "http://127.0.0.1:8000/api/ai-chat",
            {
                message: message
            }
        );

        setReply(res.data.reply);
    };

    return (
        <div>

            <textarea
                rows="6"
                cols="60"
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
            />

            <br/>

            <button onClick={askAI}>
                Ask AI
            </button>

            <hr/>

            <h3>AI Response</h3>

            <p>{reply}</p>

        </div>
    );
}
