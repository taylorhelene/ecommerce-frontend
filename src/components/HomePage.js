import React from "react";
import withContext from "../withContext";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { NavLink } from "react-router-dom";


const Homepage = props => {
  return (
    <div className="home p-2">
      <div className="hero row d-flex align-items-center text-wrap ">
        <div className="col-sm-6 ">
          <h1 className="title ">Our Sweet Treats are Handcrafted with Love</h1>
          <h4 className="subtitle">Customize Your Cake and Indulge in Flavors. You can get freshly baked 
            sweet treats that are moist and warm with flavour fillings. Visit our location to try out the flavours
            first before order.
          </h4>
          <button className="button rounded-pill" type="button" >
            <NavLink to="/products">
            View our products
            </NavLink>
          </button>
        </div>   
        <img  className="col-sm-5 hero-img " src={process.env.PUBLIC_URL + '/hero.png'}/>
      </div>
      <div className="row about ">
        <DotLottieReact
          src={process.env.PUBLIC_URL + '/cake.lottie'}
          loop
          autoplay
          className="col-sm-4 about-img object-fit-contain"      
          />
        <div    className="col-sm " >
          <h2 className="subtitle">Our Services</h2>
          <p  className="body-text">We make the most incredible treats depending on our cutomers orders, 
            our delights are a mixture of the best flavours and most of the ingredients are natural .
            We let out customers choose from the various pictures that are availbale and they can taste the
            products in order to purchase the products that they are delighted with. </p>

          <button className="button rounded-pill" type="button">Read More</button>
        </div>
       
        
      </div>
    </div>
  );
};

export default withContext(Homepage);