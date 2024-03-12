const path = require("path")
const fs = require("fs")

const resources	= {

    getPath(segment) {
        let res = path.join(process.resourcesPath, segment)
        if (fs.existsSync(res)) {
            return res
        }
        res = path.join(process.cwd(), segment)
        if (fs.existsSync(res)) {
            return res
        }
        res = path.join(path.resolve(__dirname), segment)
        if (fs.existsSync(res)) {
            return res
        }
        throw Error("File not found: " + segment)
    }

}

module.exports = resources
