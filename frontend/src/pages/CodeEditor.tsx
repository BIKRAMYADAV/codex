import React,{useRef,useEffect, useState} from 'react'
import { io } from 'socket.io-client';
import * as monaco from 'monaco-editor';
const apiUrl = 'http://localhost:3000'
import 'monaco-editor/esm/vs/editor/editor.worker';
import 'monaco-editor/esm/vs/language/typescript/ts.worker';
import 'monaco-editor/esm/vs/language/json/json.worker';
import 'monaco-editor/esm/vs/language/html/html.worker';
import 'monaco-editor/esm/vs/language/css/css.worker';
import axios from 'axios';

const socket = io(apiUrl)    

function CodeEditor() {
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
},[]);

useEffect(() => {
    if (monacoInstance.current) {
      monaco.editor.setModelLanguage(monacoInstance.current.getModel()!, language);
    }
  }, [language]);

  return (
    <div>
    <div className='bg-black p-2'>
        select language:
        <select
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
          <option value="python">python</option>
        </select>
        <button
          className="ml-4 bg-blue-500 text-white px-4 py-1 rounded"
          onClick={runCode}
        >
          Run
        </button>
    </div>
    <div className='flex'>
    <div ref={editorRef} style={{height: '100vh',width: '100%'}}/>
    <div className="bg-gray-800 text-white p-4 w-1/2">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
      </div>
    </div>
  )
}

export default CodeEditor;