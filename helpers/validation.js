const User = require("../models/User");

exports.validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/);
};

exports.validateLength = (text,min,max) => {
    if(text.length > max || text.length < min) return false
    return true
}

exports.validateUsername = async username => {
    let flag = false
    do {
        let checkUsername = await User.findOne({username})
        if(checkUsername) {
            username += (+new Date() * Math.random()).toString().substring(0,1)
            flag = true
        }
        else flag = false
    }while(flag)
    return username
}