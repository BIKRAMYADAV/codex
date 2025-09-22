import React from 'react'
interface INickname{
    username: string;
    setUsername: (name:string) => void;
    setNickname: (name:string) => void;
}
const NicknamePrompt:React.FC<INickname> = ({username, setUsername, setNickname}) => {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h2 className="mb-4 text-xl">Enter your nickname</h2>
      <input
        className="text-black px-4 py-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        className="mt-2 bg-blue-500 px-4 py-1 rounded"
        onClick={() => setNickname(username)}
      >
        Join
      </button>
    </div>
  )
}

export default NicknamePrompt