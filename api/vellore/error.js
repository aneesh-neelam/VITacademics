var error = {
    Success: {Message: 'Successful Execution', Code: 0},
    TimedOut: {Message: 'Session timed out', Code: 1},
    Invalid: {Message: 'Invalid Credentials or Captcha', Code: 2},
    Down: {Message: 'VIT\'s servers may be down or we may be facing a connectivity issue', Code: 3},
    MongoDown: {Message: 'Our MongoDB may be down or we may be facing a connectivity issue', Code: 4},
    ToDo: {Message: 'This feature is incomplete', Code: 8},
    Other: {Message: 'Unknown Error', Code: 9}
};

module.exports.codes = error;