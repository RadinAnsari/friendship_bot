const mongoose = require('mongoose')


const schema = mongoose.Schema

const userSchema = new schema({
  id: { type: Number, required: true },
  is_bot: { type: Boolean, required: true },
  first_name: { type: String },
  last_name: { type: String },
  username: { type: String },
  nick_name: { type: String, required: true },
  age: { type: Number, required: true },
  city: { type: String },
  province: { type: String },
  language_code: { type: String, required: true },
  photo_url: { type: String, require: true },
  public_id: { type: String, require: true },
  last_activity:{type:Number},
})


module.exports = mongoose.model('User', userSchema)
