import React from 'react';
import ReactPDF from '@intelllex/react-pdf';

const ExampleReactPDF = () => {
    return (
        <ReactPDF
            url="<PDF_url>"
            showProgressBar
            showToolbox
        />
    )
};
 
export default ExampleReactPDF;