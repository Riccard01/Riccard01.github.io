
import React from "react";
import Calendar from "./Calendar";
import "./BoatCard.css";
import maestraleImg from "../assets/maestrale.png";

const placeholderImg = maestraleImg;

export default function BoatCard({ image = placeholderImg, calendarProps = {}, name = "" }) {
       return (
	       <div className="boat-card">
		       { name ? (
				   <div className="boat-card-name">{name}</div>
				) : null }
		       <div className="boat-card-image-container">
				   <div className="boat-card-image-gradient"></div>
			       <img src={image} alt="Boat" className="boat-card-image" />
		       </div>
		       <div className="boat-card-calendar-container">
			       <Calendar {...calendarProps} />
		       </div>
	       </div>
       );
}
