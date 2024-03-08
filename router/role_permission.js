const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const { mySqlQury } = require('../middleware/db')
const multer  = require('multer')
let sendNotification = require("../middleware/send");
const nodemailer = require('nodemailer');
const countryCodes = require('country-codes-list')
const bcrypt = require('bcrypt');
const mysql = require("mysql")



router.get('/role_permission', auth, async(req, res)=>{
    try {
        const Country_name = countryCodes.customList('countryCode', '{countryCode}')
        const nameCode = Object.values(Country_name)
        const myCountryCodesObject = countryCodes.customList('countryCode', '+{countryCallingCode}')
        const CountryCode = Object.values(myCountryCodesObject)

        const role_list = await mySqlQury(`SELECT * FROM tbl_role_permission `)
        const product_list = await mySqlQury(`SELECT tbl_product.*, (select tbl_category.name from tbl_category where tbl_product.category_name = tbl_category.id) as c_name,
                                                                    (select tbl_sub_category.name from tbl_sub_category where tbl_product.subcategory_name = tbl_sub_category.id) as sc_name
                                                                    FROM tbl_product`)
        
        res.render("role_permission", {
            auth_data: req.user, module_list: req.module, language: req.lang, lang: req.lan, permission: req.per,
            general_data: req.general[0], notification_data: req.notification, product_list, role_list,
            nameCode, CountryCode
        })
    } catch (error) {
        console.log(error);
    }
})

router.post('/add_role_user', auth, async(req, res)=>{
    try {
        const {first_name, last_name, email, country_code, phone_no, password, status, order_view, order_edit, customer_view, customer_add, customer_edit, carrier_view, carrier_add,
            carrier_edit, category_view, category_add, category_edit, subcategory_view, subcategory_add, subcategory_edit, product_view, product_add, product_edit, coupon_view, coupon_add, 
            coupon_edit, payment_view, payment_edit, location_view, location_add, location_edit, payout_view, payout_edit, report_view, General_view, 
            General_edit, Shift_view, Shift_add, Shift_edit, Time_view, Time_add, Time_edit, delivery_view, delivery_add, delivery_edit, Pricing_view, Pricing_edit, 
            Distance_view, Distance_add, Distance_edit, Shipping_view, Shipping_edit, Insurance_view, Insurance_add, Insurance_edit, Zone_view, Zone_add, Zone_edit, Module_view, 
            Module_edit, FAQ_view, FAQ_add, FAQ_edit, policy_view, policy_add, policy_edit, cus_exp_view, cus_exp_add, cus_exp_edit, social_view, social_add, social_edit } = req.body;

        let order1 = order_view == "on" ? "1" : "0";
        let order3 = order_edit == "on" ? "1" : "0";
        let order = order1 +','+ order3
        
        let custom1 = customer_view == "on" ? "1" : "0";
        let custom2 = customer_add == "on" ? "1" : "0";
        let custom3 = customer_edit == "on" ? "1" : "0";
        let customer = custom1 +','+ custom2 +','+ custom3

        let carr1 = carrier_view == "on" ? "1" : "0";
        let carr2 = carrier_add == "on" ? "1" : "0";
        let carr3 = carrier_edit == "on" ? "1" : "0";
        let carrier = carr1 +','+ carr2 +','+ carr3

        let cate1 = category_view == "on" ? "1" : "0";
        let cate2 = category_add == "on" ? "1" : "0";
        let cate3 = category_edit == "on" ? "1" : "0";
        let category = cate1 +','+ cate2 +','+ cate3

        let subcate1 = subcategory_view == "on" ? "1" : "0";
        let subcate2 = subcategory_add == "on" ? "1" : "0";
        let subcate3 = subcategory_edit == "on" ? "1" : "0";
        let subcategory = subcate1 +','+ subcate2 +','+ subcate3

        let prod1 = product_view == "on" ? "1" : "0";
        let prod2 = product_add == "on" ? "1" : "0";
        let prod3 = product_edit == "on" ? "1" : "0";
        let product = prod1 +','+ prod2 +','+ prod3

        let coup1 = coupon_view == "on" ? "1" : "0";
        let coup2 = coupon_add == "on" ? "1" : "0";
        let coup3 = coupon_edit == "on" ? "1" : "0";
        let coupon = coup1 +','+ coup2 +','+ coup3

        let payme1 = payment_view == "on" ? "1" : "0";
        let payme3 = payment_edit == "on" ? "1" : "0";
        let payment = payme1 +','+ payme3

        let locat1 = location_view == "on" ? "1" : "0";
        let locat2 = location_add == "on" ? "1" : "0";
        let locat3 = location_edit == "on" ? "1" : "0";
        let location = locat1 +','+ locat2 +','+ locat3

        let payou1 = payout_view == "on" ? "1" : "0";
        let payou3 = payout_edit == "on" ? "1" : "0";
        let payout = payou1 +','+ payou3

        let repo1 = report_view == "on" ? "1" : "0";
        let report = repo1

        let General1 = General_view == "on" ? "1" : "0";
        let General3 = General_edit == "on" ? "1" : "0";
        let General = General1 +','+ General3

        let Shift1 = Shift_view == "on" ? "1" : "0";
        let Shift2 = Shift_add == "on" ? "1" : "0";
        let Shift3 = Shift_edit == "on" ? "1" : "0";
        let Shift = Shift1 +','+ Shift2 +','+ Shift3

        let Time1 = Time_view == "on" ? "1" : "0";
        let Time2 = Time_add == "on" ? "1" : "0";
        let Time3 = Time_edit == "on" ? "1" : "0";
        let Time = Time1 +','+ Time2 +','+ Time3

        let delivery1 = delivery_view == "on" ? "1" : "0";
        let delivery2 = delivery_add == "on" ? "1" : "0";
        let delivery3 = delivery_edit == "on" ? "1" : "0";
        let delivery = delivery1 +','+ delivery2 +','+ delivery3

        let Pricing1 = Pricing_view == "on" ? "1" : "0";
        let Pricing3 = Pricing_edit == "on" ? "1" : "0";
        let Pricing = Pricing1 +','+ Pricing3

        let Distance1 = Distance_view == "on" ? "1" : "0";
        let Distance2 = Distance_add == "on" ? "1" : "0";
        let Distance3 = Distance_edit == "on" ? "1" : "0";
        let Distance = Distance1 +','+ Distance2 +','+ Distance3

        let Shipping1 = Shipping_view == "on" ? "1" : "0";
        let Shipping3 = Shipping_edit == "on" ? "1" : "0";
        let Shipping = Shipping1 +','+ Shipping3

        let Insurance1 = Insurance_view == "on" ? "1" : "0";
        let Insurance2 = Insurance_add == "on" ? "1" : "0";
        let Insurance3 = Insurance_edit == "on" ? "1" : "0";
        let Insurance = Insurance1 +','+ Insurance2 +','+ Insurance3

        let Zone1 = Zone_view == "on" ? "1" : "0";
        let Zone2 = Zone_add == "on" ? "1" : "0";
        let Zone3 = Zone_edit == "on" ? "1" : "0";
        let Zone = Zone1 +','+ Zone2 +','+ Zone3

        let Module1 = Module_view == "on" ? "1" : "0";
        let Module3 = Module_edit == "on" ? "1" : "0";
        let Module = Module1 +','+ Module3

        let cus_exp1 = cus_exp_view == "on" ? "1" : "0";
        let cus_exp2 = cus_exp_add == "on" ? "1" : "0";
        let cus_exp3 = cus_exp_edit == "on" ? "1" : "0";
        let cus_exp = cus_exp1 +','+ cus_exp2 +','+ cus_exp3

        let FAQ1 = FAQ_view == "on" ? "1" : "0";
        let FAQ2 = FAQ_add == "on" ? "1" : "0";
        let FAQ3 = FAQ_edit == "on" ? "1" : "0";
        let FAQ = FAQ1 +','+ FAQ2 +','+ FAQ3

        let policy1 = policy_view == "on" ? "1" : "0";
        let policy2 = policy_add == "on" ? "1" : "0";
        let policy3 = policy_edit == "on" ? "1" : "0";
        let policy = policy1 +','+ policy2 +','+ policy3

        let social1 = social_view == "on" ? "1" : "0";
        let social2 = social_add == "on" ? "1" : "0";
        let social3 = social_edit == "on" ? "1" : "0";
        let social = social1 +','+ social2 +','+ social3

        const hash = await bcrypt.hash(password, 10)

        await mySqlQury(`INSERT INTO tbl_role_permission (first_name, last_name, email, country_code, phone_no, status, order_per, customer, carrier, category, subcategory
                        , product, coupon, payment, location, payout, report, General, Shift, Time, delivery, Pricing, Distance, Shipping, Insurance, Zone, module_per, cus_exp, FAQ, policy, social) 
                        VALUE ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${status}', '${order}', '${customer}', '${carrier}'
                        , '${category}', '${subcategory}', '${product}', '${coupon}', '${payment}', '${location}', '${payout}', '${report}', '${General}', '${Shift}', '${Time}'
                        , '${delivery}', '${Pricing}', '${Distance}', '${Shipping}', '${Insurance}', '${Zone}', '${Module}', '${cus_exp}', '${FAQ}', '${policy}', '${social}')`)
        
        await mySqlQury(`INSERT INTO tbl_admin (first_name, last_name, email, country_code, phone_no, password, role, profile_img) VALUE 
        ('${first_name}', '${last_name}', '${email}', '${country_code}', '${phone_no}', '${hash}', '1', '')`)

        req.flash('success', `sign up successfully`)
        res.redirect("/role/role_permission")
    } catch (error) {
        console.log(error);
    }
})

router.post("/detail_check_ejax", auth, async(req, res)=>{
    try {
        let admin_email, admin_phone
        if (req.body.type == 1) {
            admin_email = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.email}' `)
            admin_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE phone_no = '${req.body.phone}' `)
            
        } else if(req.body.type == 2) {
            
            if (req.body.email == 1 && req.body.phone == 1)  {
                admin_email = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.inpout_email}' `)
                admin_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE phone_no = '${req.body.inpout_phone}' `)
            } else if (req.body.email == 1) {
                admin_email = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${req.body.inpout_email}' `)
                admin_phone = "";
            } else if (req.body.phone == 1) {
                admin_phone = await mySqlQury(`SELECT * FROM tbl_admin WHERE phone_no = '${req.body.inpout_phone}' `)
                admin_email = "";
            }
            
        }

        let email = 0;
        let phone = 0;
        if (admin_email != "" && admin_phone != "") {
            email = 1;
            phone = 1;
        } else if (admin_email != "") {
            email = 1;
        } else if (admin_phone != "") {
            phone = 1;
        }

        res.send({email, phone})
    } catch (error) {
        console.log(error);
    }
})

router.post("/role_ajax", auth, async(req, res)=>{
    try {
        const role_list = await mySqlQury(`SELECT * FROM tbl_role_permission WHERE id = '${req.body.id}' `)
        
        res.send({role:role_list[0]})
    } catch (error) {
        console.log(error);
    }
})

router.post('/edit_role_detail/:id', auth, async(req, res)=>{
    try {
        const {first_name, last_name, email, country_code, phone_no, password, status, order_view, order_edit, customer_view, customer_add, customer_edit, carrier_view, carrier_add,
            carrier_edit, category_view, category_add, category_edit, subcategory_view, subcategory_add, subcategory_edit, product_view, product_add, product_edit, coupon_view, coupon_add, 
            coupon_edit, payment_view, payment_edit, location_view, location_add, location_edit, payout_view, payout_edit, report_view, General_view, 
            General_edit, Shift_view, Shift_add, Shift_edit, Time_view, Time_add, Time_edit, delivery_view, delivery_add, delivery_edit, Pricing_view, Pricing_edit, 
            Distance_view, Distance_add, Distance_edit, Shipping_view, Shipping_edit, Insurance_view, Insurance_add, Insurance_edit, Zone_view, Zone_add, Zone_edit, Module_view, 
            Module_edit, FAQ_view, FAQ_add, FAQ_edit, policy_view, policy_add, policy_edit, cus_exp_view, cus_exp_add, cus_exp_edit, social_view, social_add, social_edit } = req.body;

        const role_list = await mySqlQury(`SELECT * FROM tbl_role_permission WHERE id = '${req.params.id}' `)
        const role_admin_list = await mySqlQury(`SELECT * FROM tbl_admin WHERE email = '${role_list[0].email}' `)

        let order1 = order_view == "on" ? "1" : "0";
        let order3 = order_edit == "on" ? "1" : "0";
        let order = order1 +','+ order3

        let custom1 = customer_view == "on" ? "1" : "0";
        let custom2 = customer_add == "on" ? "1" : "0";
        let custom3 = customer_edit == "on" ? "1" : "0";
        let customer = custom1 +','+ custom2 +','+ custom3

        let carr1 = carrier_view == "on" ? "1" : "0";
        let carr2 = carrier_add == "on" ? "1" : "0";
        let carr3 = carrier_edit == "on" ? "1" : "0";
        let carrier = carr1 +','+ carr2 +','+ carr3

        let cate1 = category_view == "on" ? "1" : "0";
        let cate2 = category_add == "on" ? "1" : "0";
        let cate3 = category_edit == "on" ? "1" : "0";
        let category = cate1 +','+ cate2 +','+ cate3

        let subcate1 = subcategory_view == "on" ? "1" : "0";
        let subcate2 = subcategory_add == "on" ? "1" : "0";
        let subcate3 = subcategory_edit == "on" ? "1" : "0";
        let subcategory = subcate1 +','+ subcate2 +','+ subcate3

        let prod1 = product_view == "on" ? "1" : "0";
        let prod2 = product_add == "on" ? "1" : "0";
        let prod3 = product_edit == "on" ? "1" : "0";
        let product = prod1 +','+ prod2 +','+ prod3

        let coup1 = coupon_view == "on" ? "1" : "0";
        let coup2 = coupon_add == "on" ? "1" : "0";
        let coup3 = coupon_edit == "on" ? "1" : "0";
        let coupon = coup1 +','+ coup2 +','+ coup3

        let payme1 = payment_view == "on" ? "1" : "0";
        let payme3 = payment_edit == "on" ? "1" : "0";
        let payment = payme1 +','+ payme3

        let locat1 = location_view == "on" ? "1" : "0";
        let locat2 = location_add == "on" ? "1" : "0";
        let locat3 = location_edit == "on" ? "1" : "0";
        let location = locat1 +','+ locat2 +','+ locat3

        let payou1 = payout_view == "on" ? "1" : "0";
        let payou3 = payout_edit == "on" ? "1" : "0";
        let payout = payou1 +','+ payou3

        let repo1 = report_view == "on" ? "1" : "0";
        let report = repo1

        let General1 = General_view == "on" ? "1" : "0";
        let General3 = General_edit == "on" ? "1" : "0";
        let General = General1 +','+ General3

        let Shift1 = Shift_view == "on" ? "1" : "0";
        let Shift2 = Shift_add == "on" ? "1" : "0";
        let Shift3 = Shift_edit == "on" ? "1" : "0";
        let Shift = Shift1 +','+ Shift2 +','+ Shift3

        let Time1 = Time_view == "on" ? "1" : "0";
        let Time2 = Time_add == "on" ? "1" : "0";
        let Time3 = Time_edit == "on" ? "1" : "0";
        let Time = Time1 +','+ Time2 +','+ Time3

        let delivery1 = delivery_view == "on" ? "1" : "0";
        let delivery2 = delivery_add == "on" ? "1" : "0";
        let delivery3 = delivery_edit == "on" ? "1" : "0";
        let delivery = delivery1 +','+ delivery2 +','+ delivery3

        let Pricing1 = Pricing_view == "on" ? "1" : "0";
        let Pricing3 = Pricing_edit == "on" ? "1" : "0";
        let Pricing = Pricing1 +','+ Pricing3

        let Distance1 = Distance_view == "on" ? "1" : "0";
        let Distance2 = Distance_add == "on" ? "1" : "0";
        let Distance3 = Distance_edit == "on" ? "1" : "0";
        let Distance = Distance1 +','+ Distance2 +','+ Distance3

        let Shipping1 = Shipping_view == "on" ? "1" : "0";
        let Shipping3 = Shipping_edit == "on" ? "1" : "0";
        let Shipping = Shipping1 +','+ Shipping3

        let Insurance1 = Insurance_view == "on" ? "1" : "0";
        let Insurance2 = Insurance_add == "on" ? "1" : "0";
        let Insurance3 = Insurance_edit == "on" ? "1" : "0";
        let Insurance = Insurance1 +','+ Insurance2 +','+ Insurance3

        let Zone1 = Zone_view == "on" ? "1" : "0";
        let Zone2 = Zone_add == "on" ? "1" : "0";
        let Zone3 = Zone_edit == "on" ? "1" : "0";
        let Zone = Zone1 +','+ Zone2 +','+ Zone3

        let Module1 = Module_view == "on" ? "1" : "0";
        let Module3 = Module_edit == "on" ? "1" : "0";
        let Module = Module1 +','+ Module3

        let cus_exp1 = cus_exp_view == "on" ? "1" : "0";
        let cus_exp2 = cus_exp_add == "on" ? "1" : "0";
        let cus_exp3 = cus_exp_edit == "on" ? "1" : "0";
        let cus_exp = cus_exp1 +','+ cus_exp2 +','+ cus_exp3

        let FAQ1 = FAQ_view == "on" ? "1" : "0";
        let FAQ2 = FAQ_add == "on" ? "1" : "0";
        let FAQ3 = FAQ_edit == "on" ? "1" : "0";
        let FAQ = FAQ1 +','+ FAQ2 +','+ FAQ3

        let policy1 = policy_view == "on" ? "1" : "0";
        let policy2 = policy_add == "on" ? "1" : "0";
        let policy3 = policy_edit == "on" ? "1" : "0";
        let policy = policy1 +','+ policy2 +','+ policy3

        let social1 = social_view == "on" ? "1" : "0";
        let social2 = social_add == "on" ? "1" : "0";
        let social3 = social_edit == "on" ? "1" : "0";
        let social = social1 +','+ social2 +','+ social3

        let hash
        if (password != "") {
            hash = await bcrypt.hash(password, 10)
        } else {
            hash = role_admin_list[0].password
        }

        await mySqlQury(`UPDATE tbl_role_permission SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}'
                        , phone_no = '${phone_no}', status = '${status}', order_per = '${order}', customer = '${customer}', carrier = '${carrier}'
                        , category = '${category}', subcategory = '${subcategory}', product = '${product}', coupon = '${coupon}', payment = '${payment}', location = '${location}'
                        , payout = '${payout}', report = '${report}', General = '${General}', Shift = '${Shift}', Time = '${Time}', delivery = '${delivery}'
                        , Pricing = '${Pricing}', Distance = '${Distance}', Shipping = '${Shipping}', Insurance = '${Insurance}', Zone = '${Zone}', module_per = '${Module}'
                        , cus_exp = '${cus_exp}', FAQ = '${FAQ}', policy = '${policy}', social = '${social}' WHERE id = '${role_list[0].id}'`)

        await mySqlQury(`UPDATE tbl_admin SET first_name = '${first_name}', last_name = '${last_name}', email = '${email}', country_code = '${country_code}'
                        , phone_no = '${phone_no}', password = '${hash}' WHERE email = '${role_list[0].email}'`)
        
        req.flash('success', `Update successfully`)
        res.redirect("/role/role_permission")
    } catch (error) {
        console.log(error);
    }
})

router.get('/delete_role_permission/:id', auth, async(req, res)=>{
    try {
        await mySqlQury(`delete FROM tbl_role_permission WHERE id = '${req.params.id}' `)

        req.flash('success', `Deleted successfully`)
        res.redirect("/role/role_permission")
    } catch (error) {
        
    }
})



module.exports = router;