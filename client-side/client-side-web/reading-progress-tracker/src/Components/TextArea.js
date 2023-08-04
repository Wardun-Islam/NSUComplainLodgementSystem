import React, { Component } from 'react';
import './App.css';
import { TextareaAutosize } from '@material-ui/core';



class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
      file: ''
    }
    this.handleFileChange=this.handleFileChange.bind(this)
    this.handleTextChange=this.handleTextChange.bind(this)
    this.handleSubmit=this.handleSubmit.bind(this)
  }
  handleTextChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  handleFileChange = (e) => {
    console.log(e.target.files[0])
    this.setState({ file: e.target.files[0] })
  }

  handleSubmit = (e) => {
    const { text, file } = this.state

  }

  render() {
    return (
      <div className="App">
        <form action="" className="w-100" onSubmit={(e) => this.handleSubmit(e)}>
          <div className="pt-1 pb-3">
            <TextareaAutosize
              className="form-control"
              placeholder="write some text here"
              minRows="4"
              name="text"
              onChange={(e) => this.handleChange(e)}
            />
          </div>
          <div className="w-100 d-flex justify-content-between align-items-center">
            <div>
              <input
                type="file"
                className="form-control-file"
                name="file"
                onChange={(e) => this.handleFileChange(e)}
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary">
                Post
           </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default App;