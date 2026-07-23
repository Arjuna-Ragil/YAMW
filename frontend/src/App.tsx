import {useState} from 'react';
import './App.css';
import {PingTest} from "../wailsjs/go/handlers/Health";
import {GetRandomSongs} from "../wailsjs/go/handlers/List";

function App() {
    const [resultText, setResultText] = useState("Please enter your name below 👇");
    const [name, setName] = useState('');
    const updateName = (e: any) => setName(e.target.value);
    const updateResultText = (result: string) => setResultText(result);

    function songTest() {
        const fetchLagu = async () => {
            try {
                const hasil = await GetRandomSongs();
                console.log(hasil); 
            } catch (err) {
                console.error("Error:", err);
            }
        }

        fetchLagu()
    }

    return (
        <div id="App">
            <div id="result" className="result">{resultText}</div>
            <div id="input" className="input-box">
                <input id="name" className="input" onChange={updateName} autoComplete="off" name="input" type="text"/>
                <button className="btn" onClick={songTest}>test</button>
            </div>
        </div>
    )
}

export default App
