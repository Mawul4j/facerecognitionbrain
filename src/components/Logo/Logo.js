import React from "react";
import Tilt from "react-parallax-tilt";
import "./Logo.css";
import brain from "./brainIcon.png";

const Navigation = () => {
  return (
    <div className="ma4 mt0">
      <Tilt
        className="Tilt br2 shadow-2"
        options={{ max: 55 }}
        style={{ height: 125, width: 125 }}
      >
        <div className="Tilt-inner pa3">
          <img
            style={{ paddingTop: "5px", height: "75px" }}
            alt="logo"
            src={brain}
          />
        </div>
      </Tilt>
    </div>
  );
};

export default Navigation;
