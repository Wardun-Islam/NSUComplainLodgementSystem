import React from "react";
import { ReactMic } from "react-mic";
import Box from "@material-ui/core/Box";
import StopIcon from "@material-ui/icons/Stop";
import MicIcon from "@material-ui/icons/Mic";

export default function RecordButton({postRecording}){
  
  const [record, setRecord] = React.useState(false);
  const [recordBlob, setRecordBlob] = React.useState(null);

  const startRecording = () => {
    setRecord(true);
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onData = (recordedBlob) =>{
    console.log("chunk of real-time data is: ", recordedBlob);
    setRecordBlob(recordedBlob);
  }

 const onStop = (recordedBlob) => {
    console.log("recordedBlob is: ", recordedBlob);
  }

  const onPost = ()=>{
    if (recordBlob != null) postRecording(recordBlob);
  }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyItems="center"
        overflow="hidden"
      >
        <Box display="block" overflow="hidden">
          <ReactMic
            record={record}
            className="sound-wave"
            onStop={onStop}
            onData={onData}
            strokeColor="#000000"
            backgroundColor="#F5F5F5"
          />
        </Box>
        <Box display="flex" flexDirection="row" width="100%">
          <Box component="span" m={1}>
            <button onClick={startRecording} type="button">
              Start
            </button>
          </Box>
          <Box component="span" m={1}>
            <button onClick={stopRecording} type="button">
              Stop
            </button>
          </Box>
          <Box component="span" m={1} alignSelf="end">
            <button onClick={onPost} type="button">
              Post
            </button>
          </Box>
        </Box>
      </Box>
    );
  }

