const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')



// ========== product ============== //

router.get('/product_list', auth, async(req, res) => {
    try {
        const category_list = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '2' `)
        const product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as c_name,
                                                                    (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as sc_name
                                                                    FROM tbl_product`)
        
        res.render('product_list', {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, category_list, product_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.get('/product_category/:id', auth, async(req, res) => {
    try {
        const sub_category_list = await mySqlQury(`SELECT * FROM tbl_sub_category WHERE category_name = '${req.params.id}' AND module = '2' `)
        
        res.json({sub_category_list})
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_product', auth, async(req, res) => {
    try {
        const {category_name, subcategory_name, name, price, status, pricing_module_id} = req.body

        await mySqlQury(`INSERT INTO tbl_product (category_name, subcategory_name, name, price, status, module) VALUE ('${category_name}', '${subcategory_name}', '${name}', '${price}', '${status}', '${pricing_module_id}')`)

        req.flash('success', 'product add successfully')
        res.redirect('/product/product_list')
    } catch (error) {
        console.log(error);
    }
})

router.get('/product_subcategory/:id', auth, async(req, res) => {
    try {
        const sub_category_list = await mySqlQury(`SELECT * FROM tbl_sub_category WHERE category_name = '${req.params.id}'`)
        const category_list = await mySqlQury(`SELECT * FROM tbl_category WHERE module = '2' `)

        res.json({category_list, sub_category_list})
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_product/:id', auth, async(req, res) => {
    try {
        const {category_name, subcategory_name, name, price, status} = req.body

        if (status == 'on') {
            await mySqlQury(`UPDATE tbl_product SET category_name = '${category_name}', subcategory_name = '${subcategory_name}', name = '${name}', price = '${price}', status = 'on' WHERE id = '${req.params.id}'`)
        } else {
            await mySqlQury(`UPDATE tbl_product SET category_name = '${category_name}', subcategory_name = '${subcategory_name}', name = '${name}', price = '${price}', status = 'off' WHERE id = '${req.params.id}'`)
        }

        req.flash('success', 'product update successfully')
        res.redirect('/product/product_list')
    } catch (error) {
        console.log(error);
    }
})


module.exports = router