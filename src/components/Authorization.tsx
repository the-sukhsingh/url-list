"use client"
import React, { useEffect } from 'react'

const Authorization = ({ onAuthorize }: { onAuthorize: (key: string) => void }) => {
    const [authKey, setAuthKey] = React.useState('');

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                onAuthorize(authKey);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [authKey, onAuthorize]);

    return (
        <div className='flex flex-col justify-center items-center w-full h-screen border-x border-edge '>
            <div className='flex justify-center items-center h-full w-full max-w-sm flex-col border-x border-edge'>

                <div className='w-full max-w-4xl screen-line-after text-center screen-line-before flex justify-center items-center p-2 text-2xl '>
                    Enter Authorization Key
                </div>
                <div className='w-full max-w-4xl screen-line-after'>
                    <input autoFocus type="password" value={authKey} onChange={(e) => setAuthKey(e.target.value)} autoComplete='off' className='w-full h-full bg-transparent outline-none p-2 text-center' />
                </div>
                <div className='w-full max-w-4xl screen-line-after'>
                    <button disabled={!authKey} onClick={() => onAuthorize(authKey)} className='w-full max-w-4xl text-center flex items-center justify-center p-2 text-2xl disabled:opacity-70 disabled:hover:scale-100 disabled:active:scale-100 hover:scale-105 active:scale-95'>
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Authorization