const express = require('express');
const jwt = require('jsonwebtoken');
const Language = require("../public/language/languages.json")
const { mySqlQury } = require('../middleware/db')
const OneSignal = require('onesignal-node');  

const auth = async(req, res, next) => {
    try{
        const token = req.cookies.jwt

        if(!token){
            req.flash("errors", "Unauthorized access detected. Please log in to proceed.")
            return res.redirect("/log_in")
        }

        const decode = await jwt.verify(token, process.env.TOKEN_KEY)
        req.user = decode

        const general_data = await mySqlQury(`SELECT * FROM tbl_general_settings`)
        req.general = general_data

        const notification_data = await mySqlQury(`SELECT * FROM tbl_notification ORDER BY id DESC LIMIT 100`)
        req.notification = notification_data
        
        const module_list = await mySqlQury(`SELECT * FROM tbl_module`)
        req.module = module_list
        
        const role_list = await mySqlQury(`SELECT status, order_per, customer, carrier, category, subcategory, product, coupon, payment, location, payout, report, General, Shift
                        , Time, delivery, Pricing, Distance, Shipping, Insurance, Zone, module_per, cus_exp, FAQ, policy FROM tbl_role_permission WHERE email = '${decode.tbl_admin_email}' `)
        
        if (role_list != "") {    
            req.per = role_list[0]
        } else {
            req.per = "1"
        }

        const social_containt = await mySqlQury(`SELECT * FROM tbl_social_containt`)
        req.social = social_containt
        

        const langs = req.cookies.langs

        let decode_lang
        if (langs == undefined) {
            
            decode_lang = {lang : "en"}
            req.lan = decode_lang
        } else {
            
            decode_lang = await jwt.verify(langs, process.env.TOKEN_KEY)
            req.lan = decode_lang
        }


        if (decode_lang == undefined) {
            
            let data = Language.en
            req.lang = data
        } else {

            if (decode_lang.lang == "en") {
                let data = Language.en
                req.lang = data
    
            } else if(decode_lang.lang == "in") {
                let data = Language.in
                req.lang = data
                
            } else if(decode_lang.lang == "de") {
                let data = Language.de
                req.lang = data
            
            } else if(decode_lang.lang == "pt") {
                let data = Language.pt
                req.lang = data
    
            } else if(decode_lang.lang == "es") {
                let data = Language.es
                req.lang = data
    
            } else if(decode_lang.lang == "fr") {
                let data = Language.fr
                req.lang = data
    
            } else if(decode_lang.lang == "cn") {
                let data = Language.cn
                req.lang = data
    
            } else if(decode_lang.lang == "ae") {
                let data = Language.ae
                req.lang = data
    
            }
        }
        
        next();
    }catch(error){
        console.log(error);
        req.flash("errors", "You Are Not Authorized, Please Login First ...")
        return res.redirect("/log_in")
    }
}

module.exports = auth