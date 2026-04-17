import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../layouts/StudentLayout';
import { registerFace } from '../../api';
import { toast } from 'react-toastify';

const StudentFaceAuth = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [step, setStep] = useState(1); // 1: Position, 2: Scan, 3: Verify
    const [status, setStatus] = useState('Position your face in the frame');
    const [stream, setStream] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (err) {
                console.error('Camera access denied');
                setStatus('Camera access denied. Please check permissions.');
            }
        };
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startScan = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.error("Session expired. Please login again.");
            return navigate('/student/login');
        }

        setStep(2);
        setLoading(true);
        setStatus('Scanning biometric landmarks...');

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;

            // Wait a tiny bit for the frames to settle
            await new Promise(r => setTimeout(r, 800));

            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
            const base64DataUrl = canvas.toDataURL('image/jpeg', 0.85); // store locally to avoid CORS
            sessionStorage.setItem('referenceFaceBase64', base64DataUrl);
            const formData = new FormData();
            formData.append('image', blob, 'face_scan.jpg');

            const data = await registerFace(formData, token);
            
            // Sync session
            const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
            userData.faceImage = data.faceImage;
            userData.isVerified = true;
            sessionStorage.setItem('user', JSON.stringify(userData));

            setStep(3);
            setStatus('Face verification complete ✓');
            toast.success('Identity Verified Successfully! ✅');
            
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Face scan error:', err);
            setStep(1);
            setLoading(false);
            setStatus('Position correctly and try again');
            toast.error(err.message || 'Face registration failed. Please try again.');
        }
    };

    return (
        <StudentLayout>
            <div className="pg-intro">
                <h2>Face Authentication</h2>
                <p>Verify your face identity to unlock exam portal access</p>
            </div>

            <div className="face-verify-card mx-auto shadow-sm">
                <div className="fv-title">Biometric Identity Check</div>
                <div className="fv-sub">{status}</div>

                <div className="fv-cam-wrap border">
                    <div className="cam-viewport">
                        <div className="cam-feed">
                             <video ref={videoRef} autoPlay playsInline muted 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                             <canvas ref={canvasRef} style={{ display: 'none' }} />
                             
                             <div className="cam-grid"></div>
                             {step < 3 && <div className="face-oval"></div>}
                             {step === 2 && <div className="scan-ln"></div>}
                             {step === 3 && (
                                 <div className="d-flex align-items-center justify-content-center h-100" 
                                      style={{ fontSize: '64px', position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10 }}>✅</div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="fv-steps d-flex gap-2">
                    <div className={`fv-step ${step >= 1 ? 'done' : 'todo'}`}>1. Position</div>
                    <div className={`fv-step ${step === 2 ? 'active' : step > 2 ? 'done' : 'todo'}`}>2. Scan</div>
                    <div className={`fv-step ${step === 3 ? 'active' : 'todo'}`}>3. Verify</div>
                </div>

                {step < 3 ? (
                    <button className="login-btn lb-std w-100 py-3" onClick={startScan} disabled={loading}>
                        {loading ? 'Processing scan...' : 'Start Verification'}
                    </button>
                ) : (
                    <button className="login-btn lb-std w-100 py-3" style={{ background: 'var(--green)' }}>Verified!</button>
                )}
            </div>
        </StudentLayout>
    );
};

export default StudentFaceAuth;
