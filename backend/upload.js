const e = require('cors');
const ModsDB = require('./database/modsDatabase.js');

// function handleUploadReqeust(req, res) {
//   const { headers } = req;
//   const Mod = headers.mod;
  
//   ModsDB.insert(Mod).then((canInsert) => {
//     if (canInsert) {
//       res.statusCode = 201;
//       res.end();
//     } else {
//       res.statusCode = 409;
//       res.write("Alreday existed");
//       res.end();
//     }
//   });
// }
/**
 * 
 * @param {mod} oldMod 
 * @returns a new copy of the old mod
 */
function copyMod(oldMod){
  let newMod = new ModsDB.Mod(
    oldMod["modName"],
    oldMod["author"],
    oldMod["desc"],
    oldMod["dateCreated"],
    oldMod["dateModified"],
    oldMod["url"],
    oldMod["gameName"],
    oldMod["tags"],
    oldMod["views"],
    oldMod["icon"],
    oldMod["likes"],
    oldMod["comments"]
  );
  return newMod;
}

function handleUploadReqeust(req, res) {
  let newModInfo = req.body["mod"];
  
  // This part handles the possible game thing...
  // possible_game = ["Minecraft", "Terraria"];
  // if (!(newModInfo["gameName"] in possible_game)){
  //   res.statusCode = 409;
  //   res.send("This game doesn't exist");
  // }

  let newMod = new ModsDB.Mod(
    newModInfo["modName"],
    newModInfo["author"],
    newModInfo["desc"],
    newModInfo["dateCreated"],
    newModInfo["dateModified"],
    newModInfo["url"],
    newModInfo["gameName"],
    newModInfo["tags"],
    newModInfo["views"],
    newModInfo["icon"],
    newModInfo["likes"],
    newModInfo["comments"]
  );
  ModsDB.insert(newMod).then((canInsert) => {
    if (canInsert) {
      res.statusCode = 201;
      res.end();
    } else {
      res.statusCode = 409;
      res.write("Alreday existed");
      res.end();
    }
  });
  // })
}

function handleDeleteModRequest(req, res) {
  const { headers } = req;
  modName = headers.modName;

  ModsDB.remove(modName).then((canRemove) => {
    if (canRemove) {
      res.statusCode = 204;
      res.end();
    } else {
      res.statusCode = 409;
      res.write("Failed");
      res.end();
    }
  })
}

function handleRemoveAllRequest(req, res) {
  ModsDB.removeAll();
}

// function handleChangeModRequest(req, res) {
//   const { headers } = req;
//   to_be_update = headers.modName;
//   update = headers.mod;

//   ModsDB.update(to_be_update, update).then((canUpdate) => {
//     if (canUpdate) {
//       res.statusCode = 204;
//       res.end();
//     } else {
//       res.statusCode = 409;
//       res.write("Modname does not exist or new mod name conflict");
//       res.end();
//     }
//   })
// }

function handleGetModRequest(req, res) {
  const baseURL = 'http://' + req.headers.host + '/';
  const url = new URL(req.url, baseURL);
  const queryObject = url.searchParams;
  const modName = queryObject.get('modName');
  console.log(modName);
  ModsDB.find(modName).then((data) => {
    if (data == null) {
      res.statusCode = 404;
      res.write("Mod does not exist");
      res.end();
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      res.end(JSON.stringify(data));
    }
  })
}

function handleGetAllRequest(req, res) {
  ModsDB.getAll().then((data) => {
    if (data === null) {
      res.statusCode = 404;
      res.write("Empty");
      res.end();
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      res.end(JSON.stringify({data}));
    }
  })
}
/**
 * This function means to give the right result by filtering, except for 
 * filtering by TAGS
 */
function handleFilterRequest(req, res) {
    let filter = req.headers.filter;
    let obj = JSON.parse(filter);
    console.log(obj)
    ModsDB.search(obj).then((data) =>
    {
      if(data.length === 0){
        res.statusCode = 404;
        res.write("Can't find any mod with this filter");
        res.end();
      }
      else{
        res.statusCode = 200;
        res.setHeader("Content-Type","application/json");
        // Give all matched mods, and the number of matching
        // set the body with the result
        res.end(JSON.stringify(data, "num", data.length));
      }
    })
}
/**
 * This function means to give the right result by filtering by TAGS
 */
function handleFilterTagRequest(req,res){
  let result = [];
  let tag = req.headers.tag;
  console.log(JSON.parse(tag)["tag"][0])
  let tag_len = tag.length;
  ModsDB.getAll().then((data) =>
  {
    let data_len = data.length;
    for(let i = 0; i < data_len; i ++){
      let bool = true;
      for(let j = 0; j < tag_len; j ++){
        if(!data[i].tag.includes(tag[j])){
          bool = false;
          break;
        }
      }
      if(bool){
        result.push(data[i]);
      }
    }
    if(result.length === 0){
      res.statusCode = 404;
      res.write("Can't find any mod with these tag filters");
      res.end();
    }
    else{
      res.statusCode = 200;
      res.setHeader("Content-Type","application/json");
      res.end(JSON.stringify({result, "num":result.length})); 
    }
  })
}

/**
 * Notice that this function is unfinished
 * 这个函数还未完成
 */
function handleUpdateRequest(req,res){
  new_mod = req.body["newMod"]
  // let arr = [];
  // req.on("data",(chunk) => {
  //   arr.push(chunk);
  // })
  // req.on("end", ()=>
  // {
  //   let targetName = JSON.parse(arr)["targetName"];
  //   let modChange = JSON.parse(arr)["mod"];
  //   let changeInfo = new ModsDB.Mod();
  //   changeInfo.modName = modChange["modName"];
  //   changeInfo.author = modChange["author"];
  //   ModsDB.update(targetName,changeInfo).then((data)=>
  //   {
  //     if(data){
  //       res.statusCode = 404;
  //       res.write("Mod does not exist " + targetName + " or new mod name already exists");
  //       res.end();
  //     }
  //     else{
  //       res.statusCode = 204;
  //       res.end("Update successfully!");
  //     }
  //   })
  // })
}

/**
 *  USE: use BODY in such way: 
 *  add : List<string> of tags to be added
 *  delete : List<string> of tags to be deleted
 *  modName : <name of the mod>
 */
function handleUpdateTag(req, res){
  let addList = req.body["add"];
  let deleteList = req.body["delete"];
  let modName = req.body["modName"];
  ModsDB.find(modName).then((mod) => {
    if(mod !== null){
      let currMod = copyMod(mod); // Copy the mod
      // delete currMod["_id"]; // remove the id part
      console.log(currMod);
      let newTags = currMod.tags;
      // First, we remove all tags that need to be deleted
      let delete_len = deleteList.length;
      for(let i = 0; i < delete_len; i ++){
        let index = newTags.indexOf(deleteList[i]);
        // If such a tag exists in the old list, we delete it
        if(index > -1){
          newTags.splice(index,1);
        }
      }
      // Second, let's add all new tags
      let add_len = addList.length;
      for(let i = 0; i < add_len; i ++){
        // If the tag is indeed new, we add it
        if(newTags.indexOf(addList[i]) <= -1){
          newTags.push(addList[i]);
        }
      }
      currMod.tags = newTags;
      ModsDB.update(modName,currMod).then((success)=>{
        if(success){
          res.statusCode = 204;
          res.end();
        }
        else{
          res.statusCode = 404;
          res.write("Failed for some unclear reason");
        }
      })
    }
    // If we can't find such modName, we write 404
    else{
      res.statusCode = 404;
      res.write("Can't find this mod!");
      res.end();
    }
  })
}

function handleUpdatelike(req, res){

}

// function modCopy(mod){
//   return new ModsDB.Mod( 
//     newModInfo["modName"],
//     newModInfo["author"],
//     newModInfo["desc"],
//     newModInfo["dateCreated"],
//     newModInfo["dateModified"],
//     newModInfo["url"],
//     newModInfo["gameName"],
//     newModInfo["tag"],
//     newModInfo["views"],
//     newModInfo["icon"]
//   );
// }

/**
 *  USE: use headers in such way: 
 *  modName : <name of the mod>
 */
function handleUpdateView(req, res){
  modName = req.headers.modname;
  ModsDB.find(modName).then((mod) => {
    currMod = copyMod(mod);
    currMod["views"] = currMod["views"] + 1;
    ModsDB.update(modName, currMod).then((success) => {
      if (success) {
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 409;
        res.end();
      }
    })
  })
}

/**
 *  USE: use headers in such way: 
 *  change : -1 OR add : 1
 *  modName : <name of the mod>
 */
function handleUpdateLikes(req, res) {
  modName = req.headers.modname;
  add = req.headers.change;
  ModsDB.find(modName).then((mod) => {
    currMod = copyMod(mod);
    if (add === '1') {
      currMod["likes"] = currMod["likes"] + 1;
    } else {
      currMod["likes"] = currMod["likes"] - 1;
    }
    ModsDB.update(modName, currMod).then((success) => {
      if (success) {
        res.statusCode = 204;
        res.end();
      } else {
        res.statusCode = 409;
        res.end();
      }
    })
  })
}

function handleGetAllTag(req, res) {
  console.log("log1")
  ModsDB.getAll().then((allMods) => {
    console.log(allMods)
    tagSet = new Set()
    for (let i = 0; i < allMods.length; i++) {
      for (let j = 0; j < allMods[i].tag.length; j++) {
        tagSet.add((allMods[i].tag)[j]);
      }
    }
    let tagArr = Array.from(tagSet);
    res.statusCode = 200;
    res.json({"tag":tagArr});
    res.end();
  }).catch(() => {
    res.statusCode = 404;
    res.end();
  })
}

function handleGetAllGame(req, res) {
  possible_game = ["Minecraft", "Terraria"];
  res.json({"Games":possible_game});
}

module.exports = { handleUploadReqeust, handleGetModRequest, handleGetAllRequest, handleDeleteModRequest, handleFilterRequest,
  handleFilterTagRequest,handleUpdateRequest, handleRemoveAllRequest, handleUpdateView, handleGetAllTag, handleUpdateLikes, handleGetAllGame,handleUpdateTag };
