import React from 'react';
import hl7 from '../hl7.json';
import JSONViewer from './JSONViewer';
import { useState, useEffect } from 'react';
import './Display.css';
import Form from 'react-bootstrap/Form';
import { useDebouncedCallback } from 'use-debounce';
import './JSONViewer.css'

const Display = () => {

    let [isChecked, setIsChecked] = useState(false);
    let JSONText = {};
    let eachMsgSeg = {};
    let [JText, setJText] = useState({});
    let nArrayMsgSeg = [];
    let arrayMsgSeg = [];
    let arrayMsgSegValues = [];
    let [parseJSONText, setParseJSONText] = useState({});
    let myObj2;
    let [myObj3, setMyObj3] = useState({});
    let [search, setSearch] = useState("");
    
    const debounced = useDebouncedCallback((value) => {
        setSearch(value);
    }, 600);

    const handleCheck = () => {
        setIsChecked(!isChecked);
    }

    useEffect(() => {
        if(isChecked)
            setJText(myObj3);
        else
            setJText(parseJSONText);
      }, [isChecked])

    const removeEmptyOrNull = (obj) => {
        Object.keys(obj).forEach(k =>
          ((obj[k] && typeof obj[k] === 'object') && removeEmptyOrNull(obj[k])) ||
          ((!obj[k]) && delete obj[k])
        );
        return obj;
      };

      const removeEmptyObj = (obj) => {
          Object.keys(obj).forEach(k => {
            if(Array.isArray(obj[k])) {
                for(let x=0;x<obj[k].length;x++) {
                    Object.keys(obj[k][x]).forEach(l => 
                        (Object.keys(obj[k][x][l]).length === 0 && obj[k][x][l].constructor === Object) && delete obj[k][x][l]  
                    )
                }
            }
            else {
                Object.keys(obj[k]).forEach(l =>
                    (Object.keys(obj[k][l]).length === 0 && obj[k][l].constructor === Object) && delete obj[k][l]
                )
            }
          }
          );

        return obj;
      }

    //function called on parseMessage button
    function parseMessage() {
        let msg = document.querySelector('#msg').value;
        let pattern = /\\n/g;
        msg = msg.replace(pattern, '\n');

        const mainMsgArr = msg.split('\n');
        let mArr = [];
        let msgArr = [];
        let mKeys, mValues;
        JSONText = `{`;
        let msgIndex;
        setJText(JSONText);
        let count = 0;

        for(let k=0;k<mainMsgArr.length;k++) {
            mainMsgArr[k] = mainMsgArr[k].trim();
            mArr = mainMsgArr[k].split("|");
            if(!nArrayMsgSeg.includes(mArr[0]))
                nArrayMsgSeg.push(mArr[0]);
            else {
                
                if(!arrayMsgSeg.includes(mArr[0])) {
                    arrayMsgSeg.push(mArr[0]);
                    arrayMsgSegValues[count] = [];
                    count++;
                }
            }
        }

        for(let k=0;k<mainMsgArr.length;k++) {
            msgArr = mainMsgArr[k].split("|");
            eachMsgSeg = `{`;

            if(hl7[msgArr[0]]) {
                mKeys = Object.keys(hl7[msgArr[0]]);
                mValues = Object.values(hl7[msgArr[0]]);
                JSONText = `${JSONText}${k!==0 && JSONText!=='{'?",":""}\n\t"${msgArr[0]}": {`;
                for(let i=0;i<mKeys.length;i++) {

                    if(msgArr[0] === 'MSH')
                        msgIndex = i;
                    else
                        msgIndex = i+1;

                    JSONText = `${JSONText} \n\t "${mKeys[i]}":`;
                    eachMsgSeg = `${eachMsgSeg}\n\t "${mKeys[i]}":`;

                    if(typeof mValues[i] === "object") {
                        JSONText = `${JSONText} {\n\t\t`;
                        eachMsgSeg = `${eachMsgSeg}{\n\t\t`;
                        let subKey = Object.keys(mValues[i]);
                        
                        if(msgArr[msgIndex] && msgArr[msgIndex].includes('^')) {
                            let subValues = msgArr[msgIndex].split('^');
                           
                            for(let j=0;j<subKey.length;j++) {
                                JSONText = `${JSONText} "${subKey[j]}": ${subValues[j]!==undefined?`"${subValues[j]}"`:"\"\""}${j!==subKey.length-1?",":""}\n\t\t`;
                                eachMsgSeg = `${eachMsgSeg}"${subKey[j]}": ${subValues[j]!==undefined?`"${subValues[j]}"`:"\"\""}${j!==subKey.length-1?",":""}\n\t\t`
                            }

                        } else {
                            JSONText = `${JSONText} "${subKey[0]}": "${msgArr[msgIndex]?msgArr[msgIndex]:""}"${subKey.length>1?",":""}\n\t\t`;
                            eachMsgSeg = `${eachMsgSeg}"${subKey[0]}": "${msgArr[msgIndex]?msgArr[msgIndex]:""}"${subKey.length>1?",":""}\n\t\t`;

                            for(let j=1;j<subKey.length;j++) {
                                JSONText = `${JSONText} "${subKey[j]}": ""${j!==subKey.length-1?",":""}\n\t\t`;
                                eachMsgSeg = `${eachMsgSeg} "${subKey[j]}": ""${j!==subKey.length-1?",":""}\n\t\t`
                            }
                        }
                        
                        JSONText = `${JSONText}}${i!==mKeys.length-1?",":""}`
                        eachMsgSeg = `${eachMsgSeg}}${i!==mKeys.length-1?",":""}`
                    }
                    else {
                        JSONText = `${JSONText} "${msgArr[msgIndex]?msgArr[msgIndex]==='MSH'?"|":msgArr[msgIndex]:""}"${i!==mKeys.length-1?",":""}`;
                        eachMsgSeg = `${eachMsgSeg} "${msgArr[msgIndex]?msgArr[msgIndex]:""}"${i!==mKeys.length-1?",":""}`;
                    }

                }
                JSONText = `${JSONText} \n }`;
                eachMsgSeg = `${eachMsgSeg} \n }`;

                let index = arrayMsgSeg.indexOf(msgArr[0]);
                if(index !== -1)
                    arrayMsgSegValues[index].push(eachMsgSeg);
            }
            else {
                msgArr = [];
                mKeys = [];
                mValues = [];
            }   
        }

        for(let i=0;i<arrayMsgSeg.length;i++) {
            if(arrayMsgSegValues[i].length !== 0) {
                JSONText = `${JSONText},\n"${arrayMsgSeg[i]}":[${arrayMsgSegValues[i]}]`
            }
        }
        JSONText = `${JSONText}\n}`
        let reg = /\\/g
        JSONText = JSONText.replace(reg,"\\\\");

        setParseJSONText(JSON.parse(JSONText));

        myObj2 = removeEmptyOrNull(JSON.parse(JSONText));
        let tempObj = removeEmptyObj(myObj2);
        setMyObj3(tempObj);

        if(isChecked)
            setJText(tempObj);
        else
            setJText(JSON.parse(JSONText));
    }

  return (
    <>
        <div className=''>
            <p className="header1">HL7 to JSON Parser</p>
        </div>
        <div className='flex-container'>
            <div className="div1">
                <label className="form-label">HL7 Text</label>
                <textarea className="form-control textArea1 scroll_con" id="msg" onChange={parseMessage}></textarea>
            </div>
            <div className="div2">
                <div className='jviewer-label'>
                    <label className="form-label">JSON Text</label>
                    
                  <div className='search-toggle-div'> 
                        <Form.Check type="switch" checked={isChecked} onChange={handleCheck} label="Remove empty values" /> 

                        <Form.Control type="text" placeholder="Search" className='search-box' onChange={(e) => debounced(e.target.value)} />
                     </div> 
                </div>

                <div className="jviewer scroll_con">
                    <JSONViewer highlightSearch={search} highlightSearchColor="#FFFD54" JText={JText} displayDataTypes={false} theme={"summerfruit:inverted"} collapsed={2} />
                </div>
            </div>
        </div>
        <div className='footer'>
            <span><a className='footer-link' href="https://hl7-definition.caristix.com/v2/HL7v2.3/Segments">HL7 Documentation (v2.3)</a></span>
            <span><a className='footer-link' href="https://github.com/Pragati-Khurana/hl7-parser">GitHub</a></span>
        </div>
    </>
    
  )
}

export default Display;