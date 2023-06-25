import { useEffect, useRef } from 'react';

export default function VideoPlayer ({ user }) {
    const ref = useRef();

    useEffect(() => {
        user.videoTrack.play(ref.current);
    }, []);

    return (
        <div>
            {user.uid}

            <div
                ref={ref}
                style={{ width: '640px', height: '480px' }}
            />
        </div>
    );
};
