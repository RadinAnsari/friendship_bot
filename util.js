const fs = require('fs');
const https = require('https');
const randomstring = require("randomstring");
const {config} = require('./settings/default')


const downloadAvatarFromTelegram = (file)=>{

 const url =`https://api.telegram.org/file/bot${config.bot.api_key}/${file.file_path}`

const period = file.file_path.lastIndexOf('.')
const fileExtension = file.file_path.substring(period + 1)

const randome_name = `${randomstring.generate()}.${fileExtension}`
https.get(url,(res) => {
  const path = `${__dirname}/files/avatar/${randome_name}`
  const writeStream = fs.createWriteStream(path);
      res.pipe(writeStream);
      writeStream.on('finish',() => {
          writeStream.close()
          console.log('Download Completed')
      })
  })



  return randome_name
}

exports.downloadAvatarFromTelegram= downloadAvatarFromTelegram



