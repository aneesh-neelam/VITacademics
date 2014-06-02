var error = {
    "Success": {"Error": "Successful Execution", "Code": 0},
    "TimedOut": {"Error": "Session timed out", "Code": 1},
    "Invalid": {"Error": "Invalid Credentials or Captcha", "Code": 2},
    "Other": {"Error": "Unknown Error", "Code": 9}
};

module.exports.errorCodes = error;