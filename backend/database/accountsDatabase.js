const {MongoClient} = require('mongodb');
const uri = "mongodb://localhost:27017";
const { getLogger } = require('../logUtil.js');
logger = getLogger("AccountsDB");

/** Representation of an account */
class Account {
    /**
     * @param {string} username 
     * @param {string} password 
     * @param {favoriteModNames} favoriteModNames
     */
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.favoriteModNames = [];
    }

    /**
     * @param {string} modName to favorite
     * @returns {boolean} false if the mod with same name already exists in the database
     */
    addFavoriteMod(modName) {
        // append if not already in list
        if (!this.favoriteModNames.includes(modName)) {
            this.favoriteModNames.push(modName);
            return true;
        } else {
            return false;
        }
    }

}

/**
 * Insert the given account into the database
 * @param {Account} account to be added to the database
 * @returns {boolean} false if the account with same username already exists in the database
 */
 async function insert(account) {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("accounts");
        // check if the account already exists
        const findResult = await collection.findOne({username: account.username});
        if (findResult == null) {
            const insertResult = await collection.insertOne(account);
            logger.info(`Account [${account.username}] created with ID: ${insertResult.insertedId}`)
            succeed = true;
        } else {
            logger.warn(`Account [${account.username}] already exists`)
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Insert dummy accounts into the database: admin, user, author
 * @returns {boolean} false if the database is not empty
 * @returns {boolean} true if the database is empty and dummy accounts are inserted
 */
async function insertDummyAccounts() {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("accounts");
        // check if the database is empty
        const findResult = await collection.findOne();
        if (findResult == null) {
            const insertResult = await collection.insertMany([
                {username: "admin", password: "admin", favoriteModNames: []},
                {username: "user", password: "user", favoriteModNames: []},
                {username: "author", password: "author", favoriteModNames: []}
            ]);
            logger.info(`Dummy accounts inserted with IDs: ${insertResult.insertedIds}`)
            succeed = true;
        } else {
            logger.warn(`Database is not empty, dummy accounts not inserted`)
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Find the account with the given username
 * @param {string} username of the account
 * @returns {Account} account with the given username, null if the account does not exist
 */
async function find(username) {
    const client = new MongoClient(uri);
    let account = null;
    try {
        await client.connect();
        account = await client.db("cs35lproject").collection("accounts").findOne({username: username});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    if (account == null) {
        logger.warn(`Account [${username}] not found`)
    } else {
        logger.info(`Account [${username}] found`)
    }
    return account;
}

/**
 * Get all the Accounts in the database
 * @param {void}
 * @returns {Collection} collection object of all the mods
 */
 async function getAll(){
    let filter = {};
    let arr = await search(filter);
    return arr;
}

/**
 * Get all accounts that matches a given filter object from the database
 * @param {Object} filter - an object in the form of {key: value, key: value, ...}
 * where value can be a regular expression: /pattern/
 * @returns {List<Account>} List of accounts that matches the filter
 * @returns empty list if no accounts match the filter
 * 
 * Example:
 * let filter = {username: "Foo", password: /^Bar/};
 * let accounts = search(filter);
 * console.log(accounts);
 * 
 * Output:
 * An array of accounts that have username "Foo" and password starting with "Bar"
 */
async function search(filter) {
    const client = new MongoClient(uri);
    let accounts = [];
    try {
        await client.connect();
        accounts = await client.db("cs35lproject").collection("accounts").find(filter).toArray();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    if (accounts.length == 0) {
        logger.warn(`No accounts found with filter: ${JSON.stringify(filter)}`)
    } else {
        logger.info(`Accounts found with filter: ${JSON.stringify(filter)}`)
    }
    return accounts;
}

/**
 * Remove the account with the given username from the database
 * @param {string} username of the account
 * @returns {boolean} false if the account with the given username does not exists
 */
async function remove(username) {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("accounts");
        // check if the account already exists
        const findResult = await collection.findOne({username: username});
        if (findResult != null) {
            const deleteResult = await collection.deleteOne({username: username});
            logger.info(`Account [${username}] deleted`)
            succeed = true;
        } else {
            logger.warn(`Account [${username}] does not exist, cannot delete`)
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Remove all accounts from the database
 * @returns {boolean} false if the database is empty
 * @returns {boolean} true if the database is not empty and all accounts are removed
 */
async function removeAll() {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("accounts");
        // check if the database is empty
        const count = await collection.countDocuments();
        if (count > 0) {
            const deleteResult = await collection.deleteMany({});
            logger.info(`All ${deleteResult.deletedCount} account(s) deleted`)
            succeed = true;
        } else {
            logger.warn(`Database is empty, cannot delete`)
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}

/**
 * Update the account password given the old username and old password
 * @param {string} old username of the account
 * @param {string} old password of the account
 * @param {string} new password of the account
 * @returns {boolean} false if the account with the given old username does not exists 
 * or the old username and old password does not match
 */
async function update(oldUsername, oldPassword, newPassword) {
    const client = new MongoClient(uri);
    let succeed = false;
    try {
        await client.connect();
        const collection = client.db("cs35lproject").collection("accounts");
        // check if the account already exists
        const findResult = await collection.findOne({username: oldUsername});
        if (findResult != null) {
            if (findResult.password == oldPassword) {
                const updateResult = await collection.updateOne({username: oldUsername}, {$set: {username: oldUsername, password: newPassword}});
                console.log("Account updated: " + oldUsername);
                logger.info(`Account [${oldUsername}] updated with new password [${newPassword}]`)
                succeed = true;
            } else {
                logger.warn(`Account [${oldUsername}] password does not match, cannot update`)
            }
        } else {
            logger.warn(`Account [${oldUsername}] does not exist, cannot update`)
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return succeed;
}


module.exports = {Account, insert, find, remove, update, search, removeAll, insertDummyAccounts, getAll};