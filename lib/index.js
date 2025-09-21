/**
 * Determine the booking state from the provided date boundaries.
 * @param {string} start_date_str Booking start date (ISO string).
 * @param {string} end_date_str Booking end date (ISO string).
 * @param {string} current_date_str Date to evaluate against the booking (ISO string).
 * @returns {string} Booking state: pending, processing, success, or failed.
 */
const getCurrentBookingState = (start_date_str , end_date_str, current_date_str) => {
    const start_date = new Date(start_date_str);
    const end_date = new Date(end_date_str);
    const current_date = new Date(current_date_str);

    if (isNaN(start_date.getTime()) || isNaN(end_date.getTime()) || isNaN(current_date.getTime())) {
        return "failed";
    }

    if (end_date < start_date) {
        return "failed";
    }

    if (current_date < start_date) {
        return "pending";
    }else if (current_date >= start_date && current_date <= end_date){
        return "processing";
    }else if (current_date > end_date) {
        return "success";
    }

    return "failed";
}

module.exports = {
    getCurrentBookingState
}