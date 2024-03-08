const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')



router.get('/coupon_list', auth, async(req, res) => {
    try {
        const customer_list = await mySqlQury(`SELECT * FROM tbl_customer`)
        const coupon_list1 = await mySqlQury(`SELECT * FROM tbl_coupon WHERE module = '1' `)
        const coupon_list2 = await mySqlQury(`SELECT * FROM tbl_coupon WHERE module = '2' `)
        const coupon_list3 = await mySqlQury(`SELECT * FROM tbl_coupon WHERE module = '3' `)
        
        res.render('coupon', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, customer_list, coupon_list1, coupon_list2, coupon_list3
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_coupon', auth, async(req, res) => {
    try {
        const {title, code, start_date, end_date, min_amount, discount_amount, customer, coupon_module} = req.body

        await mySqlQury(`INSERT INTO tbl_coupon (title, code, start_date, end_date, min_amount, discount_amount, customer, module) VALUE 
        ('${title}', '${code}', '${start_date}', '${end_date}', '${min_amount}', '${discount_amount}', '${customer}', '${coupon_module}')`)

        req.flash('success', 'coupon add successfully')
        res.redirect('/coupon/coupon_list')
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_coupon/:id', auth, async(req, res) => {
    try {
        const {title, start_date, end_date, min_amount, discount_amount, customer, coupon_module} = req.body

        await mySqlQury(`UPDATE tbl_coupon SET title = '${title}', start_date = '${start_date}', end_date = '${end_date}', min_amount = '${min_amount}', 
        discount_amount = '${discount_amount}', customer = '${customer}', module = '${coupon_module}' WHERE id = '${req.params.id}'`)

        req.flash('success', 'coupon data update successfully')
        res.redirect('/coupon/coupon_list')
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_coupon/:id', auth, async(req, res) => {
    try {
        await mySqlQury(`DELETE FROM tbl_coupon WHERE id = '${req.params.id}'`)

        req.flash('success', 'coupon data deleted successfully')
        res.redirect('/coupon/coupon_list')
    } catch (error) {
        console.log(error);
    }
})



module.exports = router