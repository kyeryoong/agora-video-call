import { useEffect, useState } from 'react';
import AgoraRTC, { createClient } from 'agora-rtc-sdk-ng';
import VideoPlayer from './VideoPlayer';



const APP_ID = '56137e3abb5845fe9ddf26499eca29dc';
const TOKEN =
    '007eJxTYBCcEDY/J8xqo4J9g8kxay8dmeiQiS/irFor3pVa/lqlEqXAYGpmaGyeapyYlGRqYWKalmqZkpJmZGZiaZmanGhkmZKclTUjpSGQkeFzcgYrIwMEgvjsDCWpxSXJ+XkMDAD1Wx8b';
const CHANNEL = 'testcon';



AgoraRTC.setLogLevel(4);

let agoraCommandQueue = Promise.resolve();



function createAgoraClient({ onVideoTrack, onUserDisconnected }) {
    const client = createClient({ mode: 'rtc', codec: 'vp8' });

    let tracks;



    function waitForConnectionState(connectionState) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (client.connectionState === connectionState) {
                    clearInterval(interval);
                    resolve();
                }
            }, 200);
        });
    }



    async function connect() {
        await waitForConnectionState('DISCONNECTED');

        const uid = await client.join(
            APP_ID,
            CHANNEL,
            TOKEN,
            null
        );

        client.on('user-published', (user, mediaType) => {
            client.subscribe(user, mediaType).then(() => {
                if (mediaType === 'video') {
                    onVideoTrack(user);
                }
            });
        });

        client.on('user-left', (user) => {
            onUserDisconnected(user);
        });

        tracks = await AgoraRTC.createScreenVideoTrack();

        await client.publish(tracks);

        return { tracks, uid }
    };



    async function disconnect() {
        await waitForConnectionState('CONNECTED');

        client.removeAllListeners();

        for (let track of tracks) {
            track.stop();
            track.close();
        }

        await client.unpublish(tracks);
        await client.leave();
    };



    return { disconnect, connect }
}



export function VideoRoom() {
    const [userList, setUserList] = useState([]);
    const [uid, setUid] = useState(null);



    console.log(userList);



    useEffect(() => {
        function onVideoTrack(user) {
            setUserList((prev) => [...prev, user]);
        };

        function onUserDisconnected(user) {
            setUserList((prev) => prev.filter((u) => u.uid !== user.uid));
        };

        

        const { connect, disconnect } = createAgoraClient({ onVideoTrack, onUserDisconnected });



        async function setup() {
            const { tracks, uid } = await connect();

            setUid(uid);
            setUserList((prev) => [...prev, { uid, videoTrack: tracks }]);
        }



        async function cleanup() {
            await disconnect();

            setUid(null);
            setUserList([]);
        }



        agoraCommandQueue = agoraCommandQueue.then(setup);

        return () => { agoraCommandQueue = agoraCommandQueue.then(cleanup); };
    }, [])



    return (
        <div>
            {uid}
            
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, fit-content(100%))',
                        gap: "20px"
                    }}
                >
                    {userList.map((user) => (
                        <VideoPlayer key={user.uid} user={user} />
                    ))}
                </div>
            </div>
        </div>
    );
};
