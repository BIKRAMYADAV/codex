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

function CodeEditor() {
const socket = io(apiUrl)    
const [language, setLanguage] = useState('javascript');
const [execute, setExecute] = useState(false);
const [output, setOutput] = useState('');
const editorRef = useRef<HTMLDivElement | null>(null)
const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

const runCode = async (editor:any) => {
        const code = editor.getValue();
        const response = await axios.post(apiUrl+'/execute', {
            code, 
            language
        });
      setOutput(response.data.output);
}

useEffect(() => {
    if(editorRef.current){
       const editor =  monaco.editor.create(editorRef.current,{
            value: 'start coding here',
            language: 'javascript',
            theme:'vs-dark'
        })
    
        editor.onDidChangeModelContent(() => {
            socket.emit("code-update", editor.getValue());
        })

        socket.on("code-update", (updatedCode) => {
            const currentModel = editor.getModel();
            if (currentModel) {
                monaco.editor.getModel(currentModel.uri)?.setValue(updatedCode);
            }
        })
       if(execute){
        console.log('run was clicked');
        runCode(editor);
       }

    }

    return () => {
        monacoInstance.current?.dispose();
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
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="json">JSON</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="python">Python</option>
        </select>
        <button className='text-white' onClick={() => setExecute(true)}>run</button>
    </div>
    <div ref={editorRef} style={{height: '100vh',width: '100%'}}/>

    </div>
  )
}

export default CodeEditor;