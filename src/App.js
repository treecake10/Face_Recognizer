import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'sign_in',
  signed_In: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '' 
  }

}

class App extends Component {

  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  componentDidMount() {
    fetch('https://fast-depths-26607.herokuapp.com')
      .then(response => response.json())
      .then(data => console.log(data));
  }

  calculateFacelocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)

    }

  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
     this.setState({input: event.target.value});
  }

  onButtonSubmit = (event) => {
    this.setState({imageUrl: this.state.input});
      fetch('https://fast-depths-26607.herokuapp.com/imageurl', { 
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })

      })
      .then(response => response.json())
      .then(response => {

        if(response) {

          fetch('https://fast-depths-26607.herokuapp.com/image', { 
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })

          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            //.catch(console.log)

        }
        this.displayFaceBox(this.calculateFacelocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'sign_out') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({signed_In: true})

    }
    this.setState({route: route});
  }

  render() {

    const { signed_In, imageUrl, route, box } = this.state;
    
    return (
      <div className="App">
         <Particles className='particles'
             params={particlesOptions}
          />
          <Navigation signed_In={signed_In} onRouteChange={this.onRouteChange}/>
          { route === 'home' 
            ? <div>
                <Logo />
                <Rank
                  name={this.state.user.name}
                  entries={this.state.user.entries}

                />
                <ImageLinkForm 
                   onInputChange={this.onInputChange}
                   onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition 
                   box={box} 
                   imageUrl={imageUrl} 
                />
              </div>
            : (
                this.state.route === 'sign_in'
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              )
          }
      </div>
    );
  }
}

export default App;
