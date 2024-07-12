import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'antd';
import SimplePeer from 'simple-peer';
import { useSocket } from '@/contexts/SocketContext';

const CallPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const socket = useSocket();
    const [stream, setStream] = useState(null);
    const [peer, setPeer] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleSignal = ({ signal, from }) => {
            if (peer) {
                peer.signal(signal);
            }
        };

        socket.on('signal', handleSignal);

        return () => {
            socket.off('signal', handleSignal);
        };
    }, [socket, peer]);

    useEffect(() => {
        if (!id || !socket) return;

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            setStream(stream);

            const peer = new SimplePeer({
                initiator: false,
                stream: stream,
                trickle: false
            });

            peer.on('signal', data => {
                socket.emit('signal', { signal: data, to: id });
            });

            peer.on('stream', remoteStream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = remoteStream;
                }
            });

            setPeer(peer);
        });
    }, [id, socket]);

    const handleStopCall = () => {
        if (peer) {
            peer.destroy();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        router.push('/');
    };

    return (
        <div>
            <h1>Call Page</h1>
            <video ref={videoRef} autoPlay />
            <Button onClick={handleStopCall}>Stop</Button>
        </div>
    );
};

export default CallPage;
