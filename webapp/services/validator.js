const validator = require("email-validator");

class Validator{
    validEmail(email){
        if(validator.validate(email)){
            return true;
        }
        else{
            return false;
        }

    }

    validPassword(password){
        let regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/ 
        if(regex.test(password))
            return true;
        else
            return false;
    }

    isEmpty(val)
    {
        if(val === null || val.match(/^ *$/) !== null)
            return true;
        else
            return false;
    }

    validName(name){
        let regex = /(?!^\d+$)^.+$/ 
        if(regex.test(name))
            return true;
        else
            return false;
    }

}

module.exports = Validator;