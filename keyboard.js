//generate age buttons dynamic
let { Keyboard, InlineKeyboard } = require("grammy");
const iranCity = require('iran-city');
const agekeyboard = () => {

  const kb = new Keyboard()

  for (let i = 1; i < 100; i++) {
    kb.text(i).row()
  }

  return kb

}

const proviancesKeyboard = () => {

  const kb = new Keyboard()


  let AllProvinces = iranCity.allProvinces();
  AllProvinces.forEach((province) => {
    kb.text(province.name).row()

  })


  return kb

}

const citesKeyboard = (proviance) => {

  const kb = new Keyboard()
  
  const cities = iranCity.searchByName(proviance);
  
  cities.forEach((city) => {
    kb.text(city.name).row()

  })


  return kb

}


const itemKeyboard = new Keyboard()
  .text("🔗به یه ناشناس وصلم کن!").row()
  .text("📍 افراد نزدیک")
  .text("🔍جستجوی کاربران🔎").row()
  .text("🤔راهنما")
  .text("👤پروفایل")
  .text("💰سکه").row()
  .text("معرفی به دوستان(سکه رایگان)")
  .resized();



const startKeyboard = new InlineKeyboard()
  .text("ثبت نام و عضویت ", "signup")
  .text("لیست کاربران", "list_users")


const channelKeyboard = new InlineKeyboard()
  .text("ثبت نام و عضویت ", "https://t.me/piekarha")

const searchtKeyboard = new InlineKeyboard()
  .text("جستجو بر اساس سن", "searchAge")
  .text("جستجو بر اساس استان", "searchProvince").row()
  .text("جستجو بر اساس شهر", "SearchCity").row()
  .text("افراد آنلاین", "searchOnlineAll")
  .text("افراد آنلاین استان", "searchOnlinePrivence").row()
  .text("افراد نزدیک شما", "searchNearUser")




const menu_items = {

  connectMeToUnkown: "🔗به یه ناشناس وصلم کن!",
  nearPeople: "📍 افراد نزدیک",
  searchUsers: "🔍جستجوی کاربران🔎",
  guide: "🤔راهنما",
  profile: "👤پروفایل",
  coin: "💰سکه",
  freeCoin: "معرفی به دوستان(سکه رایگان)"

}



exports.agekeyboard = agekeyboard
exports.startKeyboard = startKeyboard
exports.itemKeyboard = itemKeyboard
exports.searchtKeyboard = searchtKeyboard
exports.channelKeyboard = channelKeyboard
exports.proviancesKeyboard = proviancesKeyboard
exports.citesKeyboard = citesKeyboard
exports.menu_items = menu_items
