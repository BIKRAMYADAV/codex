import { useEffect, useRef, useState } from "react"
import * as monaco from 'monaco-editor'
import axios from "axios";
const apiUrl = 'https://codex-backend-71uq.onrender.com'

//socket-io setup
import { io } from "socket.io-client";
import NicknamePrompt from "../components/NicknamePrompt.tsx";


function Hero() {
  const [username, setUsername] = useState('');
  //can't set it as default because then the nickname prompt never shows up
    const [nickname, setNickname] = useState("")
    const [language, setLanguage] = useState("javascript")
    const [output, setOutput] = useState<String |"">("")

    //initial editor setup
const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const editorRef = useRef<HTMLDivElement | null>(null);
   const socketRef = useRef<any>(null);
    //editor+socket effect
   useEffect(() => {
  if (!editorRef.current) return;

  const editor = monaco.editor.create(editorRef.current, {
    value: "start coding here",
    language: language,
    theme: "vs-dark",
  });
  monacoInstance.current = editor;

  const socket = io(apiUrl);
  socketRef.current = socket;

  // assign a client ID for this browser
  const clientId = Math.random().toString(36).substring(2, 9);

  // listen for updates from others
  socket.on("code-update", ({ code, sender }: { code: string; sender: string }) => {
    if (sender !== clientId && editor.getValue() !== code) {
      const cursor = editor.getPosition();
      editor.executeEdits(null, [
        {
          range: editor.getModel()!.getFullModelRange(),
          text: code,
        },
      ]);
      if (cursor) editor.setPosition(cursor);
    }
  });

  // send changes
  editor.onDidChangeModelContent(() => {
    if (socket.connected) {
      socket.emit("code-update", { code: editor.getValue(), sender: clientId });
    }
  });

  setTimeout(() => editor.layout(), 0);
  requestAnimationFrame(() => editor.layout());

  return () => {
    editor.dispose();
    socket.disconnect();
  };
}, []);

    //language setup
    useEffect(() => {
        if (monacoInstance.current) {
          monaco.editor.setModelLanguage(monacoInstance.current.getModel()!, language);
        }
      }, [language]);

    //running the code
    const runCode = async () => {
        const code = monacoInstance.current?.getValue();
        try{
            const response = await axios.post(`${apiUrl}/executionAsyncResource`, {
                code, language
            });
            setOutput(response.data.output);
        } catch(error){
            setOutput('Error executing the code');
        }
    }



  //resize listener
  useEffect(() => {
  const handleResize = () => {
    monacoInstance.current?.layout();
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);


//all hooks must be placed before a conditional return
//React requires all hooks to be called in the same order every render.
  if(!nickname){
    return(
      <NicknamePrompt
      username={username}
      setUsername={setUsername}
      setNickname={setNickname}
      />
    )
  }


  return (
    <>
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
    <div className="space-x-2">
      <label htmlFor="language">Select language:</label>
      <select
        id="language"
        className="text-black rounded px-2 py-1"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="json">JSON</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="python">Python</option>
      </select>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
        onClick={runCode}
      >
        Run
      </button>
    </div>
    <div className="text-green-400 font-semibold">👤 {nickname}</div>
  </div>
    {/* //main editor */}
    <div className="w-full h-full flex">
        <div className="w-1/2 h-screen bg-black text-white">
          <div ref={editorRef} className="w-full h-full" />
        </div>
        {/* <div className="w-1/2 h-full"> */}
  <div className="w-1/2 h-screen bg-gray-900 text-green-400 p-4 overflow-auto">
  <pre>{output}</pre>
</div>
        {/* </div> */}
    </div>
    </>
  )
}

export default Hero