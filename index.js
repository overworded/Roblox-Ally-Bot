const superagent = require('superagent');
require('superagent-proxy')(superagent);

const Config = {
  GroupID: 69696969, // your group id.
  StartingID: 10000000, // what id you want it to start on.
  RotatingProxy: 'http://...', // rotating proxy (webshare).
  Cookie: '_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_...', // roblosecurity cookie.
}

let Globals = {
  CurrentID: Config.StartingID,
  XCSRF: null,
}

const Colors = {
  Black: '\x1b[30m',
  Red: '\x1b[31m',
  Green: '\x1b[32m',
  Yellow: '\x1b[33m',
  Blue: '\x1b[34m',
  Magenta: '\x1b[35m',
  Cyan: '\x1b[36m',
  White: '\x1b[37m',
  Reset: '\x1b[0m',
}

const URL = `https://groups.roblox.com/v1/groups/${Config.GroupID}/relationships/allies/`;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const print = (Color, ID, Message) => {
  console.log(`${Colors.Yellow}[${new Date().toLocaleTimeString()}]${Colors.Reset} | ${Colors.Cyan}ID: ${ID}${Colors.Reset} | ${Color}${Message}${Colors.Reset}`);
}
const RequestAlly = async (ID) => new Promise(async resolve => {
  superagent('POST', URL+ID)
  .set('x-csrf-token', Globals.XCSRF)
  .set('cookie', `.ROBLOSECURITY=${Config.Cookie}`)
  .proxy(Config.RotatingProxy)
  .then(resp => {print(Colors.Green, ID, `Sent ally request.`); resolve(true);})
  .catch(async err => {
    const body = err.response;
    if (!err || !body) return resolve(RequestAlly(ID));
    const newxcsrf = err.response.headers['x-csrf-token'];
    if (newxcsrf) {
        Globals.XCSRF = newxcsrf || Globals.XCSRF;
        print(Colors.Magenta, ID, `Updated XCSRF token to "${Globals.XCSRF}".`);
        return resolve(await RequestAlly(ID));
    }
    if (body) {
      if (body.status === 429) {
        print(Colors.Red, ID, `Ratelimited, trying again in 15 seconds.`)
        await sleep(15000);
        return resolve(await RequestAlly(ID));
      }
      else if (body.status === 400) {
        print(Colors.Blue, ID, `Already has a relationship with this group.`);
        return resolve();
      }
    }
    else {
      print(Colors.Red, ID, `Failed to ally, no information recieved.`);
    }
    resolve();
  });
});

const Main = async (ID) => {
  await RequestAlly(ID);
  Globals.CurrentID++;
  Main(Globals.CurrentID);
}

Main(Globals.CurrentID);
