const Chat = require('./models/chat')
let iranCity = require('iran-city');


const isNumber = (variable) => {
  if (typeof variable === "string") {
    return !isNaN(variable)
  }
}

const isValidProviance = async (proviance) => {
  const cities = iranCity.searchByName(proviance);
  return Boolean(cities.length - 1)
}

const isValidCity = async (city) => {
  const cities = iranCity.allCities() 
 const found = cities.find((element) => element.name===city);
  return typeof found!== 'undefined' || typeof found !=='null'

}

const checkUserOnChat = async (user_id) => {

  return await Chat.findOne(
    {
      $and: [
        {
          $or: [
            { from: user_id },
            { to: user_id }
          ]
        },
        {
          requestStatus: true
        }
      ]
    }
  )
}


exports.checkUserOnChat = checkUserOnChat
exports.isNumber = isNumber
exports.isValidCity = isValidCity
exports.isValidProviance = isValidProviance