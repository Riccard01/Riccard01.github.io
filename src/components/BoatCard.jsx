
import React from "react";
import Calendar from "./Calendar";
import "./BoatCard.css";

export default function BoatCard({ calendarProps = {} }) {
       return (
	       <div className="boat-card">
		       <div className="boat-card-calendar-container">
			       <Calendar {...calendarProps} />
		       </div>
	       </div>
       );
}
