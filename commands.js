
const { startKeyboard, searchtKeyboard, itemKeyboard, agekeyboard, channelKeyboard, proviancesKeyboard, citesKeyboard } = require('./keyboard')
const { isNumber, checkUserOnChat, isValidCity,isValidProviance } = require('./validate')
const { InlineKeyboard, InputFile } = require("grammy");
const User = require('./models/user')
const Channel = require('./models/channel')
const { downloadAvatarFromTelegram } = require('./util')
const convert_seconds = require('convert-seconds');
const randomstring = require("randomstring");
const { addReplyParam } = require("@roziscoding/grammy-autoquote");
const { config } = require('./settings/default')


const Activity = {
  Now: 180,
  Hour: 3600,
  Day: 86400,
  TwoDays: 172800,
  TenDays: 864000
}




const start = async (ctx) => {

  await ctx.reply("به کانال دوست یابی خوش آمدید اینجا می توانید با افراد دوست شوید", {
    reply_markup: startKeyboard
  });
}


const signup = async (conversation, ctx) => {


  const from_id = ctx.update.callback_query.from.id
  const channels = await Channel.find({ from: from_id })


  if (channels.length === 0) {

    const channel_items = config.channels
    let channels_link = ``
    channel_items.forEach((channel) => {
      channels_link += `\n <a href="https://t.me/${channel.user_name}">${channel.title}</a>`

    })
    await ctx.reply(`برای ادامه مراحل ثبت نام باید عضو کانال های زیر باشید ${channels_link}`
      , {
        parse_mode: "HTML"
      });
    return
  }
  const founduser = await User.findOne({ id: from_id })

  if (founduser) {
    await ctx.reply("شما قبلا ثبت نام کرده اید!");
    return;
  }



  await ctx.reply("اسم  ؟");
  const name = await conversation.wait();


  do {

    await ctx.reply("سن  ؟", { reply_markup: agekeyboard });
    ctx = await conversation.wait();

  } while (!isNumber(ctx.message?.text))

  const age = ctx.message.text


  do {
    await ctx.reply("عکس خودتان را ارسال کنید  ؟");
    ctx = await conversation.wait();


  } while (!ctx.message?.photo);



  const photos = ctx.message.photo




 do {
  
  await ctx.reply("استان  ؟", {
    reply_markup: proviancesKeyboard(),
   });
   
  ctx = await conversation.wait();

  } while (!isValidProviance(ctx.message?.text));

 const province = ctx.message.text
  



    do {
   await ctx.reply("شهر  ؟", {
    reply_markup: citesKeyboard(province)
  });
    ctx = await conversation.wait();


  } while (!isValidCity(ctx.message?.text));


  const city = ctx.message.text

  
  


  const inlineKeyboard = new InlineKeyboard()
    .text("لیست همه کاربر ها ", "list_users")

  const user = ctx.update.message.from

  const lastPhototIndex = photos.length - 1;
  const lastPhoto = photos[lastPhototIndex]


  const fetch_info_photo = await ctx.api.getFile(lastPhoto.file_id)
  
  const photo_url =  downloadAvatarFromTelegram(fetch_info_photo)


  const newUser = new User({
    id: user.id,
    is_bot: user.is_bot,
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    nick_name: name.update.message.text,
    age: age,
    city: city,
    province: province,
    language_code: user.language_code,
    photo_url: photo_url,
    public_id: `user_${randomstring.generate(7)}`,
    last_activity: name.update.message.date
  })


  await newUser.save()
  await ctx.reply("ثبت نام با موفقیت انجام شد! برای دیدن لیست افراد کلید کنید", {
    reply_markup: inlineKeyboard,
  });

}

const searchAge = async (conversation, ctx) => {


  do {
    await ctx.reply("سن  ؟", { reply_markup: agekeyboard });
    ctx = await conversation.wait();

  } while (!isNumber(ctx.message?.text))

  const age = ctx.message.text



  const foundUsers = await User.find(
    { age: { $lt: age } }
  )

  let userslinks = ''

  foundUsers.forEach((item) => {
    userslinks += `${item.nick_name} ${item.age} ${item.city} <a href="#">/${item.public_id}</a> \n`
  })

  await ctx.reply(userslinks, { parse_mode: "HTML" });



}


const searchCity = async (conversation, ctx) => {

  await ctx.reply("شهر  ؟");

  const city = await conversation.wait();



  const foundUsers = await User.find(
    { city: city.update.message.text }
  )

  let userslinks = ``
  userslinks += `📌 لیست افراد در شهر ${city.update.message.text} : \n`



  await Promise.all(foundUsers.map(async (item) => {



    const diffrent_seconds = ctx.update.callback_query.message.date - item.last_activity

    const time = convert_seconds(diffrent_seconds)

    const chat = await checkUserOnChat(item.id)
    let type_status = ``

    let activityCaption = ""

    if (diffrent_seconds < Activity.Now) {
      activityCaption = `🟢 هم اکنون آنلاین`
      if (chat !== null) {
        type_status = `(🗣️ در حال چت)`
      }

    }
    else if (diffrent_seconds < Activity.Hour) {
      activityCaption = `آنلاین ${time.minutes} دقیقه قبل`
    }
    else if (diffrent_seconds < Activity.Day) {
      activityCaption = `آنلاین ${time.hours} ساعت قبل`
    }
    else if (diffrent_seconds > Activity.Day && diffrent_seconds < Activity.TwoDays) {
      const date = new Date(item.last_activity * 1000)
      activityCaption = `آنلاین ${date.getHours()}:${date.getMinutes()}دیروز`
    }
    else if (diffrent_seconds > Activity.TwoDays && diffrent_seconds < Activity.TenDays) {
      activityCaption = `آنلاین ${item.last_activity / Activity.Day} روز قبل`
    }
    else {
      activityCaption = `آنلاین ${new Date(item.last_activity * 1000)}`
    }
    userslinks += `\n ${item.nick_name} ${item.age} ${activityCaption}${type_status} <a href="#">/${item.public_id}</a>`
  }))


  await ctx.reply(userslinks, { parse_mode: "HTML" });




}


const searchProvince = async (conversation, ctx) => {


  await ctx.reply("شهر  ؟");

  const province = await conversation.wait();



  const foundUsers = await User.find(
    { province: province.update.message.text }
  )

  let userslinks = ``
  userslinks += `📌 لیست افراد در استان ${province.update.message.text} : \n`



  await Promise.all(foundUsers.map(async (item) => {



    const diffrent_seconds = ctx.update.callback_query.message.date - item.last_activity

    const time = convert_seconds(diffrent_seconds)

    const chat = await checkUserOnChat(item.id)
    let type_status = ``

    let activityCaption = ""

    if (diffrent_seconds < Activity.Now) {
      activityCaption = `🟢 هم اکنون آنلاین`
      if (chat !== null) {
        type_status = `(🗣️ در حال چت)`
      }

    }
    else if (diffrent_seconds < Activity.Hour) {
      activityCaption = `آنلاین ${time.minutes} دقیقه قبل`
    }
    else if (diffrent_seconds < Activity.Day) {
      activityCaption = `آنلاین ${time.hours} ساعت قبل`
    }
    else if (diffrent_seconds > Activity.Day && diffrent_seconds < Activity.TwoDays) {
      const date = new Date(item.last_activity * 1000)
      activityCaption = `آنلاین ${date.getHours()}:${date.getMinutes()}دیروز`
    }
    else if (diffrent_seconds > Activity.TwoDays && diffrent_seconds < Activity.TenDays) {
      activityCaption = `آنلاین ${item.last_activity / Activity.Day} روز قبل`
    }
    else {
      activityCaption = `آنلاین ${new Date(item.last_activity * 1000)}`
    }
    userslinks += `\n ${item.nick_name} ${item.age} ${activityCaption}${type_status} <a href="#">/${item.public_id}</a>`
  }))


  await ctx.reply(userslinks, { parse_mode: "HTML" });



}


const userInfoById = async (ctx) => {


  const public_id = ctx.update.message.text.split('/')[1]

  const foundUser = await User.findOne({ public_id: public_id })

  if (foundUser === null) {
    await ctx.reply("درخواست شما نامعتبر است...");
    return
  }

  ctx.api.config.use(addReplyParam(ctx));
  ctx.session.chat_to_request_id = foundUser.id
  const kb = new InlineKeyboard()
    .text("ارسال درخواست چت", "request_chat")
    .text("لیست همه کاربر ها ", "list_users")


  const diffrent_seconds = ctx.update.message.date - foundUser.last_activity

  const time = convert_seconds(diffrent_seconds)

  const chat = await checkUserOnChat(foundUser.id)
  let type_status = ``

  let activityCaption = ""

  if (diffrent_seconds < Activity.Now) {
    activityCaption = `🟢 هم اکنون آنلاین`
    if (chat !== null) {
      type_status = `🗣️ در حال چت`
    }

  }
  else if (diffrent_seconds < Activity.Hour) {
    activityCaption = `آنلاین ${time.minutes} دقیقه قبل`
  }
  else if (diffrent_seconds < Activity.Day) {
    activityCaption = `آنلاین ${time.hours} ساعت قبل`
  }
  else if (diffrent_seconds < Activity.Yesterday) {
    activityCaption = `آنلاین ${time.hours}:${time.minutes} دیروز`
  }
  else {
    activityCaption = `آنلاین ${new Date(foundUser.last_activity * 1000)}`
  }




  await ctx.replyWithPhoto(
    new InputFile(`${__dirname}/files/avatar/${foundUser.photo_url}`)
    , {
      caption: ` 
    \nنام: ${foundUser.nick_name} 
    \nسن : ${foundUser.age} 
    \n👀 ${activityCaption} ${type_status}
    \nشهر : ${foundUser.city}
    \nاستان :${foundUser.province}
    \nآی دی🆔 :${foundUser.public_id}
    `,
      reply_markup: kb, parse_mode: "HTML"
    })


}

const searchUsersItems = async ctrx => {

  ctrx.reply(`
   امکان جستجو به شرح زیر می باشد🔍:
  `, {
    reply_markup: searchtKeyboard()
  })

}

const searchNearUser = async (ctx) => {


  const from_id = ctx.update.callback_query.from.id
  const from_info_user = await User.findOne({ id: from_id })
  const foundUsers = await User.find({
    city: from_info_user.city,
    id: { $ne: from_id }
  })



  let userslinks = ``
  userslinks += `📌 لیست افراد در نزدیکی شما  : \n`



  await Promise.all(foundUsers.map(async (item) => {



    const diffrent_seconds = ctx.update.callback_query.message.date - item.last_activity

    const time = convert_seconds(diffrent_seconds)

    const chat = await checkUserOnChat(item.id)
    let type_status = ``

    let activityCaption = ""

    if (diffrent_seconds < Activity.Now) {
      activityCaption = `🟢 هم اکنون آنلاین`
      if (chat !== null) {
        type_status = `(🗣️ در حال چت)`
      }

    }
    else if (diffrent_seconds < Activity.Hour) {
      activityCaption = `آنلاین ${time.minutes} دقیقه قبل`
    }
    else if (diffrent_seconds < Activity.Day) {
      activityCaption = `آنلاین ${time.hours} ساعت قبل`
    }
    else if (diffrent_seconds > Activity.Day && diffrent_seconds < Activity.TwoDays) {
      const date = new Date(item.last_activity * 1000)
      activityCaption = `آنلاین ${date.getHours()}:${date.getMinutes()}دیروز`
    }
    else if (diffrent_seconds > Activity.TwoDays && diffrent_seconds < Activity.TenDays) {
      activityCaption = `آنلاین ${item.last_activity / Activity.Day} روز قبل`
    }
    else {
      activityCaption = `آنلاین ${new Date(item.last_activity * 1000)}`
    }
    userslinks += `\n ${item.nick_name} ${item.age} ${activityCaption}${type_status} <a href="#">/${item.public_id}</a>`
  }))


  await ctx.reply(userslinks, { parse_mode: "HTML" });





}


const accept_request_chat = async (ctx) => {
  const to = ctx.update.callback_query.from.id
  const found_user = await User.findOne({ id: to })

  if (!found_user) {
    await bot.api.sendMessage(to, "حتما باید ثبت نام کنید !")
    return
  }


  const updated_chat = await Chat.findOneAndUpdate({ to: to }, {
    $set: {
      requestStatus: true
    },
    urrentDate: { lastUpdated: true },
    function(res) {
      return res

    }

  })



  ctx.session.chat_token = updated_chat._id.valueOf()
  const kb = new InlineKeyboard()
    .text("پایان چت", "stop_chat")

  await ctx.reply(`شما درخواست چت را قبول کردید`, {
    reply_markup: kb,
  });
  await bot.api.sendMessage(updated_chat.from, "درخواست شما قبول شد. به کاربر سلام کنید ! ", {
    reply_markup: kb,
  })


}

const request_chat = async (ctx) => {

  const to_request_chat_id = ctx.session.chat_to_request_id
  const from_request_chat_id = ctx.update.callback_query.from.id
  const found_user = await User.findOne({ id: from_request_chat_id })

  if (!found_user) {
    await bot.api.sendMessage(from_request_chat_id, "حتما باید ثبت نام کنید !")
    return
  }

  const kb = new InlineKeyboard()
    .text("قبول کردن درخواست", "accept_request")
    .text("لیست همه کاربر ها ", "unaccept_request")

  const chat = new Chat({ from: from_request_chat_id, to: to_request_chat_id })
  await chat.save()
  await bot.api.sendMessage(to_request_chat_id, `درخواست چت از طرف کاربر /${from_request_chat_id} برای شما ارسال شده است.`, { reply_markup: kb })

  await ctx.reply("درخواست ارسال شد.بعد از قبول  کردن درخواست می توانید شروع به چت کردن کنید");

}

const stop_chat = async (ctx) => {

  const from_id = ctx.update.callback_query.from.id
  const found_user = await User.findOne({ id: from_id })

  if (!found_user) {
    await bot.api.sendMessage(from_id, "حتما باید ثبت نام کنید !")
    return
  }



  await Chat.deleteOne({ "_id": ctx.session.chat_token })


  await ctx.reply(`چت توسط کاربر پایان یافت ${ctx.session.chat_to_request_id}`);

  ctx.session.chat_token = ''
  ctx.session.chat_from_request_id = 0
  ctx.session.chat_to_request_id = 0



}

const chat_member = async (ctx) => {

  const chatMember = await ctx.chatMembers.getChatMember();

  if (chatMember.status == 'member') {
    const channel = new Channel({
      channel_id: ctx.me.id,
      username: ctx.me.username,
      from: ctx.update.chat_member.from.id,
      date: ctx.update.date,
    })

    await channel.save()
    return;
  }

  await Channel.deleteOne(
    { 'from': ctx.update.chat_member.from.id },
    { 'channel_id': ctx.me.id },
  )

}





const makeChat = async (ctx) => {

  if (ctx.session.chat_token == '') {
    const chat = await checkUserOnChat(ctx.update.message.from.id)

    if (chat !== null) {

      console.log(chat._id.valueOf())
      ctx.session.chat_token = chat._id.valueOf()

      if (chat.from !== ctx.update.message.from.id) {
        ctx.session.chat_from_request_id = chat.to
        ctx.session.chat_to_request_id = chat.from
      }
      else {
        ctx.session.chat_to_request_id = chat.to
        ctx.session.chat_from_request_id = chat.from
      }


    }


  }




  await bot.api.sendMessage(ctx.session.chat_to_request_id, ctx.update.message.text)

  const newMsg = new Msg({
    from: chat_from_request_id,
    content: ctx.update.message.text,
    to: chat_to_request_id
  })

  await newMsg.save()

  await User
    .updateOne(
      { id: ctx.update.message.from.id },
      { $set: { last_activity: ctx.update.message.date } }
    )

}

exports.start = start
exports.signup = signup
exports.searchAge = searchAge
exports.searchCity = searchCity
exports.searchProvince = searchProvince
exports.userInfoById = userInfoById
exports.searchUsersItems = searchUsersItems
exports.searchNearUser = searchNearUser
exports.request_chat = request_chat
exports.accept_request_chat = accept_request_chat
exports.stop_chat = stop_chat
exports.chat_member = chat_member
exports.makeChat = makeChat