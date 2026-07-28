

import React, { useState, useEffect } from "react";
import "./Calendar.css";
import { findApplicableEarlyDiscount } from "../utils/priceCalculator";
import chevronUp from "../assets/chevron-up.svg";
import chevronDown from "../assets/chevron-down.svg";
import { getLocale } from '../utils/locale';

function getDaysInMonth(year, month) {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
	// In JS, 0=Sunday, 1=Monday... we want Monday as first day
	let day = new Date(year, month, 1).getDay();
	return day === 0 ? 6 : day - 1;
}

export default function Calendar({ lang = 'it', onDateSelect, selectedDate, onMonthChange, isDateEnabled, discounts = null }) {
	const dict = getLocale(lang);
	const localeCode = dict.localeCode || 'it-IT';

	const daysFormatter = new Intl.DateTimeFormat(localeCode, { weekday: 'short' });
	const monthFormatter = new Intl.DateTimeFormat(localeCode, { month: 'long' });

	const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
		const d = new Date(2026, 5, 1 + i);
		return daysFormatter.format(d).replace('.', '');
	});

	const today = new Date();
	const [currentMonth, setCurrentMonth] = useState(today.getMonth());
	const [currentYear, setCurrentYear] = useState(today.getFullYear());

	// Normalize selectedDate: accept both Date objects and YYYY-MM-DD strings
	const selectedDateObj = selectedDate
		? (selectedDate instanceof Date ? selectedDate : (() => { const [y,m,d] = String(selectedDate).split('-'); return new Date(+y, +m - 1, +d); })())
		: null;

	// notify parent of initial month
	useEffect(() => {
		if (onMonthChange) onMonthChange(currentYear, currentMonth);
	}, []);


	const daysInMonth = getDaysInMonth(currentYear, currentMonth);
	const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);

	const handlePrevMonth = () => {
		let newMonth, newYear;
		if (currentMonth === 0) {
			newMonth = 11;
			newYear = currentYear - 1;
		} else {
			newMonth = currentMonth - 1;
			newYear = currentYear;
		}
		setCurrentMonth(newMonth);
		setCurrentYear(newYear);
		if (onMonthChange) onMonthChange(newYear, newMonth);
	};

	const handleNextMonth = () => {
		let newMonth, newYear;
		if (currentMonth === 11) {
			newMonth = 0;
			newYear = currentYear + 1;
		} else {
			newMonth = currentMonth + 1;
			newYear = currentYear;
		}
		setCurrentMonth(newMonth);
		setCurrentYear(newYear);
		if (onMonthChange) onMonthChange(newYear, newMonth);
	};

	const handleDateClick = (day) => {
		const date = new Date(currentYear, currentMonth, day);
		if (isDateEnabled && !isDateEnabled(date)) return;
		if (onDateSelect) onDateSelect(date);
	};


	// Build calendar grid (always 6 rows, show prev/next month days as disabled)
	const calendarCells = [];
	// Days from previous month
	const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
	const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
	const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
	for (let i = 0; i < firstDayOfWeek; i++) {
		const day = daysInPrevMonth - firstDayOfWeek + i + 1;
		calendarCells.push(
			<div
				key={"prev-" + day}
				className="calendar-cell other-month"
				onClick={() => {
					// Move to previous month and select the day
					const newMonth = prevMonth;
					const newYear = prevYear;
					setCurrentMonth(newMonth);
					setCurrentYear(newYear);
					setTimeout(() => {
						const date = new Date(newYear, newMonth, day);
						if (onDateSelect) onDateSelect(date);
					}, 0);
				}}
			>
				<span className="calendar-day-number other-month">{day}</span>
			</div>
		);
	}
	// Days in current month
	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(currentYear, currentMonth, day);
		const isToday =
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear();
		const isSelected =
			selectedDateObj &&
			date.getDate() === selectedDateObj.getDate() &&
			date.getMonth() === selectedDateObj.getMonth() &&
			date.getFullYear() === selectedDateObj.getFullYear();
		const isDisabled = isDateEnabled ? !isDateEnabled(date) : false;
		const applicableDiscount = discounts ? findApplicableEarlyDiscount(discounts, date) : null;
		calendarCells.push(
			<div
				key={"cur-" + day}
				className={`calendar-cell${isToday ? " today" : ""}${isSelected ? " selected" : ""}${isDisabled ? " disabled" : ""}`}
				onClick={() => !isDisabled && handleDateClick(day)}
			>
				{applicableDiscount ? (
				  <span className="discount-seal">★</span>
				) : null}
				{isSelected ? (
					<span className="calendar-day-number selected">{day}</span>
				) : (
					<span className={`calendar-day-number${isDisabled ? " disabled" : " available"}`}>{day}</span>
				)}
			</div>
		);
	}
	// Days from next month
	const totalCells = firstDayOfWeek + daysInMonth;
	const nextDays = 42 - totalCells;
	for (let i = 1; i <= nextDays; i++) {
		calendarCells.push(
			<div
				key={"next-" + i}
				className="calendar-cell other-month"
				onClick={() => {
					const newMonth = (currentMonth + 1) % 12;
					const newYear = newMonth === 0 ? currentYear + 1 : currentYear;
					setCurrentMonth(newMonth);
					setCurrentYear(newYear);
					if (onMonthChange) onMonthChange(newYear, newMonth);
					setTimeout(() => {
						const date = new Date(newYear, newMonth, i);
						if (isDateEnabled && !isDateEnabled(date)) return;
						if (onDateSelect) onDateSelect(date);
					}, 0);
				}}
			>
				<span className="calendar-day-number other-month">{i}</span>
			</div>
		);
	}

	return (
		   <div className="calendar" style={{position: 'relative', overflow: 'hidden'}}>
			   <div className="calendar-content">
				<div className="calendar-header">
					<div className="calendar-month-label">
						{monthFormatter.format(new Date(currentYear, currentMonth, 1))} {currentYear}
					</div>
					<div className="calendar-nav">
						<button className="calendar-nav-btn" onClick={handlePrevMonth} aria-label={dict.calendar.prevMonth}>
							<img src={chevronUp} alt={dict.calendar.prevMonth} className="calendar-chevron" />
						</button>
						<button className="calendar-nav-btn" onClick={handleNextMonth} aria-label={dict.calendar.nextMonth}>
							<img src={chevronDown} alt={dict.calendar.nextMonth} className="calendar-chevron" />
						</button>
					</div>
				</div>
				<div className="calendar-grid">
					{daysOfWeek.map((day, idx) => (
						<div key={day + idx} className="calendar-day">
							{day}
						</div>
					))}
					{calendarCells}
				</div>
			   </div>
			   {/* Footer rimosso, ora gestito da BookingFooter */}
		</div>
	);
}
