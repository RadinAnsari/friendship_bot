const { Bot, session, MemorySessionStorage } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
const {menu_items } = require('./keyboard')
const commands = require('./commands')
const { addReplyParam } = require("@roziscoding/grammy-autoquote");
const { chatMembers } = require("@grammyjs/chat-members");
const {config} = require('./settings/default')
const mongoose = require('mongoose')
const bot = new Bot(config.bot.api_key);
const mongoUri = "mongodb+srv://gentlycrow:iGmNAOxnf6w9tIhe@cluster0.jhy6mkq.mongodb.net/mydb?authSource=admin&replicaSet=atlas-wck6hj-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true";

mongoose.connect(mongoUri).then(() => {
}).catch((err) => console.log(err))


bot.use(session({
  initial() {
    return { chat_to_request_id: 0, chat_token: '', chat_from_request_id: 0 };
  },
}));





const adapter = new MemorySessionStorage();
bot.use(chatMembers(adapter));


bot.use(conversations());

bot.use(createConversation(commands.signup));
bot.use(createConversation(commands.searchAge));
bot.use(createConversation(commands.searchCity));
bot.use(createConversation(commands.searchProvince));



bot.command("start", commands.start)



bot.callbackQuery("searchAge", async (ctx) => {

  await ctx.conversation.enter("searchAge")
})



bot.callbackQuery("searchCity", async (ctx) => {
  await ctx.conversation.enter("searchCity")
})



bot.callbackQuery("searchProvince", async (ctx) => {
  await ctx.conversation.enter("searchProvince")
})


bot.callbackQuery("searchNearUser", commands.searchNearUser)





//chating users
bot.on("message:text",commands.makeChat);


//accept request to chat 1 to 1 
bot.callbackQuery("accept_request", commands.accept_request_chat);


//send request chat to user
bot.callbackQuery("request_chat", commands.request_chat);

//stop chatting
bot.callbackQuery("stop_chat", commands.stop_chat);


bot.callbackQuery("signup", async (ctx) => {
  await ctx.conversation.enter("signup")
})



bot.on("chat_member", commands.chat_member)


// find user info by user public id 
bot.hears(/user_ *(.+)?/, commands.userInfoById)



bot.hears(menu_items.searchUsers, commands.searchUsersItems)


bot.start({
  allowed_updates: ["chat_member", "message", "CALLBACK_QUERY"]
});





