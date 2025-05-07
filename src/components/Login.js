import React, { Component } from "react";
import { Navigate } from "react-router-dom"; // Updated from Redirect to Navigate
import withContext from "../withContext";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      error: "",
    };
  }

  handleChange = (e) =>
    this.setState({ [e.target.name]: e.target.value, error: "" });

  login = (e) => {
    e.preventDefault();

    const { username, password } = this.state;
    if (!username || !password) {
      return this.setState({ error: "Fill all fields!" });
    }
    this.props.context.login(username, password).then((loggedIn) => {
      if (!loggedIn) {
        this.setState({ error: "Invalid Credentials" });
      }
    });
  };

  render() {
    return !this.props.context.user ? (
      <div className="container-fluid">
          <div className="d-flex justify-content-center container">
            <h4 className="title">Login</h4>
          </div>
        <form onSubmit={this.login} className='d-flex justify-content-center container p-3 ' >
          <div className="row gy-4 d-flex justify-content-center ">

            <input 
              className="form-control input"
              type="email" 
              name="username" 
              placeholder="Your email"                   
              onChange={this.handleChange}
              required=""/>
                
            <input
              className=" form-control input"
              type="password"
              name="password"
              onChange={this.handleChange}
              required=""/>
              {this.state.error && (
                <div className="text-danger">{this.state.error}</div>
              )}
              <div  align='center'>
                <button
                  className="rounded-pill"
                >
                  Submit
                </button>
              </div>
              </div>
        </form>
      </div>
    ) : (
      <Navigate to="/products" /> // Updated from Redirect to Navigate
    );
  }
}

export default withContext(Login);
