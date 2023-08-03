import "./App.css";
import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Rank from "./components/Rank/Rank";
import Particle from "./components/Particle/Particle";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    password: "",
    entries: 0,
    joined: "",
  },
};
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  calculateFaceLocation = (data) => {
    const clarifaiOutput = data?.outputs?.[0];
    if (!clarifaiOutput) {
      throw new Error("Invalid data format: No outputs found.");
    }

    const regions = clarifaiOutput?.data?.regions;
    if (!regions || regions.length === 0) {
      throw new Error("No regions found in the output.");
    }

    const firstRegion = regions[0];
    const boundingBox = firstRegion?.region_info?.bounding_box;
    if (!boundingBox) {
      throw new Error(
        "Invalid data format: Bounding box not found in the region."
      );
    }

    const image = document.getElementById("inputimage");
    if (!image || isNaN(image.width) || isNaN(image.height)) {
      throw new Error("Invalid image element or image dimensions.");
    }

    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: boundingBox.left_col * width,
      topRow: boundingBox.top_row * height,
      rightCol: width - boundingBox.right_col * width,
      bottomRow: height - boundingBox.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };
  onButtonSubmit = () => {
    const { input, user } = this.state;

    // Update the imageUrl state with the input value
    this.setState({ imageUrl: input });

    fetch(
      "https://protected-springs-76462-5801240df113.herokuapp.com/imageurl",
      {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input }), // Send the input image URL to the backend
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.outputs || data.outputs.length === 0) {
          throw new Error("Invalid data format: No outputs found.");
        }

        // Display the face box using the calculated face location
        this.displayFaceBox(this.calculateFaceLocation(data));

        // Proceed with updating the number of entries in the backend
        return fetch(
          "https://protected-springs-76462-5801240df113.herokuapp.com/image",
          {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id,
            }),
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error updating entries count in the backend.");
        }

        // Fetch the updated entries count from the response and update the state
        return response.json();
      })
      .then((count) => {
        this.setState((prevState) => ({
          user: {
            ...prevState.user,
            entries: count, // Set the updated entries count received from the backend
          },
        }));
      })
      .catch((error) => console.log("error", error));
  };

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <div>
            {" "}
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <Particle className="particles" />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
