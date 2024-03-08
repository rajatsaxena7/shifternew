const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')
const multer  = require('multer')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)

    }
})

const upload = multer({storage : storage});


router.get('/transaction_method', auth, async(req, res) => {
    try {
        const method_data = await mySqlQury(`SELECT * FROM tbl_transaction_method`)

        res.render('transaction_method', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, method_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_transaction_method', auth, upload.single('image'), async(req, res) => {
    try {
        const {title, slug, secret_id, secret_key, bank_account_No, bank_ifsc_code, swift_code, bank_holder_name, bank_name} = req.body
        const image = req.file.filename
        const status = (req.body.status == 'on' ? '1' : '0')

        await mySqlQury(`INSERT INTO tbl_transaction_method (image, title, slug, status, secret_id, secret_key, bank_account_No, bank_ifsc_code, swift_code, bank_holder_name, bank_name) 
        VALUE ('${image}', '${title}', '${slug}', '${status}', '${secret_id}', '${secret_key}', '${bank_account_No}', '${bank_ifsc_code}', '${swift_code}', '${bank_holder_name}', '${bank_name}')`)

        req.flash('success', 'transaction method add successfully')
        res.redirect('/transaction/transaction_method')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_transaction_method/:id', auth, upload.single('image'), async(req, res) => {
    try {
        const {title, slug, secret_id, secret_key, bank_account_No, bank_ifsc_code, swift_code, bank_holder_name, bank_name, radio1} = req.body
        const status = (req.body.status == 'on' ? '1' : '0')

        if (!req.file) {

            await mySqlQury(`UPDATE tbl_transaction_method SET title = '${title}', slug = '${slug}', status = '${status}', secret_id = '${secret_id}', secret_key = '${secret_key}',
            bank_account_No = '${bank_account_No}', bank_ifsc_code = '${bank_ifsc_code}', swift_code = '${swift_code}', bank_holder_name = '${bank_holder_name}', bank_name = '${bank_name}', payment_type = '${radio1}' WHERE id = '${req.params.id}'`)
        } else {
            
            const image = req.file.filename
            await mySqlQury(`UPDATE tbl_transaction_method SET image = '${image}', title = '${title}', slug = '${slug}', status = '${status}', secret_id = '${secret_id}', secret_key = '${secret_key}',
            bank_account_No = '${bank_account_No}', bank_ifsc_code = '${bank_ifsc_code}', swift_code = '${swift_code}', bank_holder_name = '${bank_holder_name}', bank_name = '${bank_name}', payment_type = '${radio1}' WHERE id = '${req.params.id}'`)
        }

        req.flash('success', 'transaction method update successfully')
        res.redirect('/transaction/transaction_method')
    } catch (error) {
        console.log(error);
    }
})


// =============== pay out ================ //

router.get('/pay_out', auth, async(req, res) => {
    try {

        res.render('pay_out', {
            auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification,
        })
    } catch (error) {
        console.log(error);
    }
})


module.exports = router