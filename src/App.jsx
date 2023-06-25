import { useState } from 'react';
import './App.css';
import { VideoRoom } from './components/VideoRoom';

function App() {
    const [joined, setJoined] = useState(false);

    return (
        <div className="App">
            {
                joined

                    ?

                    <>
                        <button onClick={() => setJoined(false)}>
                            To Lobby
                        </button>

                        <VideoRoom />
                    </>

                    :

                    <button onClick={() => setJoined(true)}>
                        Join Room
                    </button>
            }
        </div>
    );
}

export default App;
