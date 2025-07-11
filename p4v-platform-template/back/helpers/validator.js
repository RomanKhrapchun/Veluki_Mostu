const fastestValidator = require('fastest-validator')
const validator = new fastestValidator({
    useNewCustomCheckerFunction: true,
    messages: {
        phone: "Sorry, but the phone number is in the wrong format.",
        password: "Choose a stronger password. Try a combination of uppercase and lowercase letters, numbers, and ensure it has a length of at least 8 characters.",
        action_stamp_tx: "Sorry, but the date does not match the format 'yyyy-mm-dd' or is an invalid date.",
        ip: "Invalid IP Address"
    }
});


module.exports = validator;