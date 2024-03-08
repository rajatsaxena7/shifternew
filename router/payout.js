const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const multer  = require('multer')
const { connection, mySqlQury } = require('../middleware/db')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)

    }
})

const upload = multer({storage : storage});

// ============= Payout Admin ============== //

router.get("/payout_management", auth, async(req, res)=>{
    try {
        const general_data_list = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        const driver_payment_list = await mySqlQury(`SELECT * FROM tbl_driver_payment ORDER BY id DESC`)
        
        res.render("payout_management", {auth_data: req.user, module_list: req.module, permission: req.per, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, general_data_list, driver_payment_list})
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_payout/:id", auth, upload.single('payment_photo'), async(req, res) =>{
    try {
        let image = req.file.filename

        await mySqlQury(`UPDATE tbl_driver_payment SET payment_photo = '${image}', payment_status = '${1}' WHERE id = '${req.params.id}'`);
        
        res.redirect("/payout/payout_management")
    } catch (error) {
        console.log(error);
    }
})

module.exports = router