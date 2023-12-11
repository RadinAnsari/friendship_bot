const mongoose = require('mongoose')

const schema = mongoose.Schema

const chatSchema = new schema({
   from: {type:Number},
   requestStatus: {type:Boolean,default:false},
   to: {type:Number},
  
})

module.exports =  mongoose.model('Chat',chatSchema)