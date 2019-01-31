import React, { Component } from "react";
import API from "../../utils/API"
import { Link } from "react-router-dom";
import "./home.css"

class Home extends Component {

  state = {
    isLoggedIn: false,
    userName: "",
    // email: ""
  }

  componentDidMount() {
    API.getUser()
      .then(user => {
        this.setState({
          userName: user.data.userName
        })
      })

    // I dont think we need this
    // ============================================
    // const home = this

    // async function setUserInfo() {
    //   const cookie = document.cookie.split(";");
    //   console.log("cookie", cookie)
    //   let userName = cookie[0];
    //   userName = userName.split("=");
    //   userName = userName[1];
    //   console.log("userName:", userName);
    //   home.setState({
    //     userName: userName
    //   })
    // }
    // setUserInfo()
    // ============================================

  }

  logout = () => {
    API.logout().then(res => {
    })
  }

  render() {
    return (
      <div>
        <div id="sidebar">
          <div>
            <h5>Hello, {this.state.userName}</h5>
            <a href="/"><button onClick={this.logout}>Sign Out</button></a>
          </div>
        </div>
        <div id="display">

        </div>
      </div>
    )
  }
}

export default Home;