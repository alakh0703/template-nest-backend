const { get } = require("mongoose");
const { Info } = require("../models/info.model");


const getInfo = async () => {
    console.log("getInfo")

    try {
        const info = await Info.findOne({ infoId: "info" });
        return info
    }
    catch (err) {
        console.log(err);
        return false
    }
}

const increaseUserCount = async () => {
    console.log("increaseUserCount")

    try {
        await Info.findOneAndUpdate({ infoId: "info" }, { $inc: { numberOfUsers: 1 } }, { new: true });
        return true
    }
    catch (err) {
        console.log(err);
        return false
    }
}

module.exports = { increaseUserCount, getInfo }