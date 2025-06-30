import {useRef,useEffect, useState} from 'react'
import { io } from 'socket.io-client';
import * as monaco from 'monaco-editor';
const apiUrl = 'http://localhost:3000'
import 'monaco-editor/esm/vs/editor/editor.worker';
import 'monaco-editor/esm/vs/language/typescript/ts.worker';
import 'monaco-editor/esm/vs/language/json/json.worker';
import 'monaco-editor/esm/vs/language/html/html.worker';
import 'monaco-editor/esm/vs/language/css/css.worker';
import axios from 'axios';
import NicknamePrompt from '../components/NicknamePrompt';
const socket = io(apiUrl)    

function CodeEditor() {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('')

const [language, setLanguage] = useState('javascript');
const [output, setOutput] = useState('');
console.log('The output being set is : ',output);
const editorRef = useRef<HTMLDivElement | null>(null)
const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

const runCode = async () => {
  
    const code = monacoInstance.current?.getValue();
    try {
      console.log('The code being sent is : ',code,' language: ',language);
      const response = await axios.post(`${apiUrl}/execute`, {
        code,
        language,
      });
  
      setOutput(response.data.output);
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput('Error executing code.');
    }
}

useEffect(() => {
    if(editorRef.current){
       const editor =  monaco.editor.create(editorRef.current,{
            value: 'start coding here',
            language: 'javascript',
            theme:'vs-dark'
        })

        monacoInstance.current = editor
         setTimeout(() => {
      editor.layout(); // 👈 Force layout after mounting
    }, 0);
    requestAnimationFrame(() => editor.layout());
    console.log('the size of the edittor: ',editorRef.current?.getBoundingClientRect());
    
        editor.onDidChangeModelContent(() => {
            const currentCode = editor.getValue();
            socket.emit("code-update", currentCode);
        })

        socket.on("code-update", (updatedCode) => {
            const currentModel = editor.getModel();
            if (currentModel && editor.getValue() !== updatedCode) {
                monaco.editor.getModel(currentModel.uri)?.setValue(updatedCode);
            }
        })
    

    }

    return () => {
        monacoInstance.current?.dispose();
         socket.off("code-update"); 
      };
},[nickname]);

useEffect(() => {
    if (monacoInstance.current) {
      monaco.editor.setModelLanguage(monacoInstance.current.getModel()!, language);
    }
  }, [language]);


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
<div className="flex h-screen flex-col">
  {/* Top bar */}
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

  {/* Editor + Output */}
  <div className="flex flex-1 overflow-hidden h-full">
    {/* Editor */}
    <div className="w-2/3 h-full">
      <div ref={editorRef} className="w-full h-full" />
    </div>

    {/* Output */}
    <div className="w-1/3 bg-gray-800 text-white p-4 overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Output:</h3>
      <pre className="whitespace-pre-wrap break-words">{output}</pre>
    </div>
  </div>
</div>
  )
}

export default CodeEditor;