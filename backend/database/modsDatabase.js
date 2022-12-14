const {MongoClient} = require('mongodb');
const uri = "mongodb://localhost:27017";
const { getLogger } = require('../logUtil.js');
logger = getLogger("ModsDB");

/** Representation of a mod */
class Mod {
    /**
     * @param {string} modName - name of the mod
     * @param {string} author - author username of the mod
     * @param {string} desc - description of the mod
     * @param {string} dateCreated - date of creation of the mod
     * @param {string} dateModified - date of modification of the mod
     * @param {string} url - download link of the mod
     * @param {string} gameName - name of the game the mod is for
     * @param {List<string>} tags - tags of the mod
     * @param {int} views - number of views of the mod
     * @param {string} icon - path to the icon image of the mod
     * @param {int} likes - number of likes of the mod
     * @param {List<{username: {string}, content: {string}}>} comments - comments of the mod
     * @param {string} slug - the short description of the mod, including keywords etc.
     */
    constructor(modName, author, desc, dateCreated, dateModified, url, gameName, 
        tags, views, icon, likes, comments, slug) {
        this.modName = modName;
        this.author = author;
        this.desc = desc;
        this.dateCreated = dateCreated;
        this.dateModified = dateModified;
        this.url = url;
        this.gameName = gameName;
        this.tags = tags;
        this.views = views;
        this.icon = icon;
        this.likes = likes;
        this.comments = comments;
        this.slug = slug;
    }

    /**
     * @returns {boolean} true if successfully incremented the views of the mod.
     */
    incrementViews() {
        this.views += 1;
        return true;
    }

    incrementLikes() {
        this.likes += 1;
        return true;
    }

    addComment(username, content) {
        this.comments.push({username: username, content: content});
    }

    clearComments() {
        this.comments = [];
    }

}

/**
 * Insert the given mod into the database
 * @param {Mod} mod to be added to the database
 * @returns {boolean} false if the mod with same name (regardless of case)
 * already exists in the database
 */
async function insert(mod) {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("mods");
        // check if the mod with same name already exists regardless of case
        let filter = {modName: {$regex: new RegExp("^" + mod.modName + "$", "i")}};
        const findResult = await collection.findOne(filter);
        if (findResult == null) {
            const insertResult = await collection.insertOne(mod);
            logger.info(`Mod [${mod.modName}] created with ID: ${insertResult.insertedId}`);
            succeed = true;
        } else {
            logger.warn(`Mod [${findResult.modName}] already exists: `);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Get all the Mods in the database
 * @param {void}
 * @returns {Collection} collection object of all the mods
 */
async function getAll(){
    let filter = {};
    let arr = await search(filter);
    return arr;
}

/**
 * Insert dummy mods into the database
 * @param {int} numMods - number of dummy mods to be inserted
 * @returns {boolean} false if some mod with same name already exists in the database, but still insert the rest of the mods
 * @returns {null} if numMods is not a positive integer
 */
async function insertDummyMods(numMods) {
    if (numMods <= 0) {
        return null;
    }
    allUnique = true;
    for (let i = 0; i < numMods; i++) {
        const mod = new Mod(
            "Dummy Mod " + i,
            "Dummy Author",
            "Dummy Description",
            "Dummy Date Created",
            "Dummy Date Modified",
            "Dummy URL",
            "Dummy Game Name",
            ["Dummy Tag1","Dummy Tag2","Dummy Tag3"],
            0,
            "Dummy Icon",
            0,
            [{username: "Dummy User1", content: "Dummy Comment1"},
            {username: "Dummy User2", content: "Dummy Comment2"},
            {username: "Dummy User3", content: "Dummy Comment3"}],
            "Default Slug"
        );
        allUnique = await insert(mod);
    }
    const mod = new Mod(
        "Mod1",
        "Dummy Author",
        "Dummy Description",
        "Dummy Date Created",
        "Dummy Date Modified",
        "Dummy URL",
        "Dummy Game Name",
        ["Good Tag1","Dummy Tag2","Goofy Tag3"],
        0,
        "Dummy Icon",
        0,
        [{username: "Dummy User1", content: "Dummy Comment1"},
            {username: "Dummy User2", content: "Dummy Comment2"},
            {username: "Dummy User3", content: "Dummy Comment3"}],
        "Default Slug"
    )
    allUnique = await insert(mod);
    return allUnique;
}
    
async function insertDefault() {
    let defaultMod = new Mod(
        "Default Mod", 
        "Default Author", 
        "Default Description", 
        "2022/11/01", 
        "2022/11/01", 
        "https://www.google.com", 
        "Default Game", 
        ["Default Tag"], 
        0, 
        "Default Icon",
        0,
        [{username: "Dummy User1", content: "Dummy Comment1"},
        {username: "Dummy User2", content: "Dummy Comment2"},
        {username: "Dummy User3", content: "Dummy Comment3"}],
        "Default Slug"
    );
    insert(defaultMod);
}

/**
 * Get the mod with the given modName from the database
 * @param {string} modName of the Mod
 * @returns {Mod} Mod with the given username, null if the mod does not exist
 */
 async function find(modName) {
    const client = new MongoClient(uri);
    let mod = null;
    try {
        await client.connect();
        mod = await client.db("cs35lproject").collection("mods").findOne({modName: modName});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    if (mod == null) {
        logger.warn(`Mod [${modName}] not found`);
    } else {
        logger.info(`Mod [${modName}] found`);
    }
    return mod;
}

/**
 * Get all mods that matches a given filter object from the database
 * @param {Object} filter - an object in the form of {key: value, key: value, ...}
 * where value can be a regular expression: /pattern/
 * @returns {List<Mod>} List of mods that matches the filter
 * @returns {null} if no mods match the filter
 * 
 * Example:
 * let filter = {modName: "Foo", author: /^Bar/};
 * let mods = search(filter);
 * console.log(mods);
 * 
 * Output:
 * An array of mods that have modName "Foo" and author starting with "Bar"
 */
async function search(filter) {
    const client = new MongoClient(uri);
    let mods = [];
    try {
        await client.connect();
        mods = await client.db("cs35lproject").collection("mods").find(filter).toArray();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    if (mods.length == 0) {
        logger.warn(`No mods found with filter: ${JSON.stringify(filter)}`);
    } else {
        logger.info(`${mods.length} mod(s) found with filter: ${JSON.stringify(filter)}`);
    }
    return mods;
}

/**
 * Remove the mod with the given modName from the database
 * @param {string} modName of the mod
 * @returns {boolean} false if the mod with the given modName does not exists
 */
 async function remove(modName) {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("mods");
        // check if the mod already exists
        const findResult = await collection.findOne({modName: modName});
        if (findResult != null) {
            const deleteResult = await collection.deleteOne({modName: modName});
            logger.info(`Mod [${modName}] deleted`);
            succeed = true;
        } else {
            logger.warn(`Mod [${modName}] does not exist`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Remove all mods from the database
 * @returns {boolean} false if the database is empty
 * @returns {boolean} true if the database is not empty and all mods are removed
 */
async function removeAll() {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("mods");
        // check if the database is empty
        const findResult = await collection.findOne();
        if (findResult != null) {
            const deleteResult = await collection.deleteMany({});
            logger.info(`All ${deleteResult.deletedCount} mods deleted`);
            succeed = true;
        } else {
            logger.warn("Database is empty so no mods are deleted");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Update the mod with the given modName in the database
 * @param {string} modName of the mod
 * @param {Mod} mod to be updated
 * @returns {boolean} false if the mod with the given modName does not exists
 * or the new mod has the same modName as another mod in the database
 */
async function update(modName, mod) {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("mods");
        // check if the mod already exists
        const findResult = await collection.findOne({modName: modName});
        const findResultNew = await collection.findOne({modName: mod.modName});
        if ((findResult != null && findResultNew == null) || (modName === mod.modName)) {
            const updateResult = await collection.updateOne({modName: modName}, {$set: mod});
            logger.info(`Mod [${modName}] updated`);            
            succeed = true;
        } else {
            logger.warn(`Mod [${modName}] does not exist or new mod name already exists`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}


module.exports = { Mod, insert, insertDefault, find, remove, update, search, removeAll, insertDummyMods, getAll};