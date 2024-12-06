import React,{useRef,useEffect, useState} from 'react'
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/editor/editor.worker';
import 'monaco-editor/esm/vs/language/typescript/ts.worker';
import 'monaco-editor/esm/vs/language/json/json.worker';
import 'monaco-editor/esm/vs/language/html/html.worker';
import 'monaco-editor/esm/vs/language/css/css.worker';

function CodeEditor() {
const [language, setLanguage] = useState('javascript');
const editorRef = useRef<HTMLDivElement | null>(null)
const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

useEffect(() => {
    if(editorRef.current){
        monaco.editor.create(editorRef.current,{
            value: 'start coding here',
            language: 'javascript',
            theme:'vs-dark'
        })
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
    </div>
    <div ref={editorRef} style={{height: '100vh',width: '100%'}}/>

    </div>
  )
}

export default CodeEditor;