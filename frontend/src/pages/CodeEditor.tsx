import React,{useRef,useEffect} from 'react'
import * as monaco from 'monaco-editor';
import 'monaco-editor/esm/vs/editor/editor.worker';
import 'monaco-editor/esm/vs/language/typescript/ts.worker';
import 'monaco-editor/esm/vs/language/json/json.worker';
import 'monaco-editor/esm/vs/language/html/html.worker';
import 'monaco-editor/esm/vs/language/css/css.worker';

function CodeEditor() {
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

  return (
    <div ref={editorRef} style={{height: '100vh',width: '100%'}}/>
  )
}

export default CodeEditor;