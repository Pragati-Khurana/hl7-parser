import ReactJson from 'searchable-react-json-view';
import React from 'react'

const JSONViewer = (props) => {
  return (
    <div>
        <ReactJson highlightSearch={props.highlightSearch} highlightSearchColor={props.highlightSearchColor} highlightCurrentSearchColor={props.highlightCurrentSearchColor} src={props.JText} theme={props.theme} displayDataTypes={props.displayDataTypes} collapsed={props.collapsed} />
    </div>
  )
}

export default JSONViewer;