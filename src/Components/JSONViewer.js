import ReactJson from 'react-json-view';

import React from 'react'

const JSONViewer = (props) => {
  return (
    <div>
        <ReactJson src={props.JText} theme={props.theme} displayDataTypes={props.displayDataTypes} collapsed={props.collapsed} />
    </div>
  )
}

export default JSONViewer;