const mongoose = require('mongoose')

const schema = mongoose.Schema

const msgSchema = new schema({
   from: {type:Number},
   content: {type:String},
   to: {type:Number},
  
})

module.exports =  mongoose.model('Msg',msgSchema)