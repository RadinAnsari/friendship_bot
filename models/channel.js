const mongoose = require('mongoose')

const schema = mongoose.Schema

const channelSchema = new schema({
  channel_id: { type: Number },
  username: { type: String },
  from: { type: Number },
  date: { type: Number },

})

module.exports = mongoose.model('Channel', channelSchema)