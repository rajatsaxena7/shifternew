const express = require('express')
const app = express()
const router = express.Router()
const auth = require('../middleware/auth')
const multer  = require('multer')
const { connection, mySqlQury } = require('../middleware/db')
const Excel = require('exceljs');

router.get("/daily_report", auth, async(req, res)=>{
    try {
        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        
        res.render("daily_report", {auth_data: req.user, module_list: req.module, permission: req.per, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, carrier_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/dapily-report", auth, async(req, res)=>{
    try {
        const {date, carrier} = req.body;

        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)
        
        let driver_detail, order_count, delivered_order_count, delivered_order_price, driver_commission, daily_commission
        if (req.user.role == "1") {

            driver_detail = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${carrier}'`)
            
            if (date && carrier) {

                order_count = await mySqlQury(`SELECT COUNT(*) as order_count FROM tbl_order WHERE carrier_id = '${driver_detail[0].id}' AND date = '${date}' `)
                delivered_order_count = await mySqlQury(`SELECT COUNT(*) as order_count FROM tbl_order WHERE carrier_id = '${driver_detail[0].id}' AND shipping_status=3 AND date = '${date}' `)

                delivered_order_price = await mySqlQury(`SELECT SUM(total_price) as total_payment FROM tbl_order WHERE carrier_id = '${driver_detail[0].id}' AND shipping_status=3 AND date = '${date}' `)

                driver_commission = driver_detail[0].carrier_commission
                daily_commission = ((driver_commission / 100 ) * delivered_order_price[0].total_payment).toFixed(2)
                
            } else {

                order_count = await mySqlQury(`SELECT COUNT(*) as order_count FROM tbl_order WHERE  date = '${date}' `)
                delivered_order_count = await mySqlQury(`SELECT COUNT(*) as order_count FROM tbl_order WHERE shipping_status=3 AND date = '${date}' `)

                delivered_order_price = await mySqlQury(`SELECT SUM(total_price) as total_payment FROM tbl_order WHERE shipping_status=3 AND date = '${date}' `)

                driver_commission = req.general[0].default_carrier_commission
                daily_commission = ((driver_commission / 100) * delivered_order_price[0].total_payment).toFixed(2)

            }
            
        } else {
            
            order_count = await mySqlQury(`SELECT COUNT(*) as order_count FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND date = '${date}' `)
            delivered_order_count = await mySqlQury(`SELECT COUNT(*) as order_count FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND shipping_status=3 AND date = '${date}' `)
            
            delivered_order_price = await mySqlQury(`SELECT SUM(total_price) as total_payment FROM tbl_order WHERE carrier_id = '${driver_data[0].id}' AND shipping_status=3 AND date = '${date}' `)
            
            driver_commission = driver_data[0].carrier_commission
            daily_commission = ((driver_commission / 100) * delivered_order_price[0].total_payment).toFixed(2)
            
        }

        res.json({date, carrier, order:order_count[0].order_count, delivered:delivered_order_count[0].order_count, daily_commission})
    } catch (error) {
        console.log(error);
    }
})




router.get("/order_report", auth, async(req, res)=>{
    try {
        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

        let driver_commission
        if (driver_data == "") {
            driver_commission = "0";
        } else {
            driver_commission = driver_data[0].carrier_commission
        }

        let order_list
        if (req.user.role == "1") {
            order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                            tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                            `)

        } else {
            order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                            tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                            WHERE carrier_id = '${driver_data[0].id}'`)
        }
            
        const status_list = await mySqlQury(`SELECT * FROM tbl_shipping_status`)

        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        const transaction_method_list = await mySqlQury(`SELECT * FROM tbl_transaction_method WHERE status = '1'`)

        res.render("order_report", {auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, order_list, carrier_list, transaction_method_list, status_list, driver_commission
        })
    } catch (error) {
        console.log(error);
    }
})


router.post("/orderreport", auth, async(req, res)=>{
    try {
        const {status, start, end, download, carrier} = req.body

        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

        let order_list
        if (req.user.role == "1") {

            if (status == "0") {

                if (start && end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date >= '${start}' AND date <= '${end}' `)

                } else if(start ) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date >= '${start}' `)
                        
                } else if(end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date <= '${end}' `)
                
                } else if(status != "0") {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND shipping_status = '${status}' `)        
                
                } else {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' `)
                }
    
            }

            if (status != "0") {

                if (start && end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date >= '${start}' AND date <= '${end}' AND shipping_status = '${status}' `)

                } else if(start ) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date >= '${start}' AND shipping_status = '${status}' `)
                    
                } else if(end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date <= '${end}' AND shipping_status = '${status}' `)
                    
                
                } else if(status) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND shipping_status = '${status}' `)
                    
                }
                  
            }
            
        } else {

            if(status == "0") {

                if (start && end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND date >= '${start}' AND date <= '${end}' `)

                } else if(start ) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND date >= '${start}' `)
                    
                } else if(end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND date <= '${end}' `)
                
                } else if(status != "0") {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND shipping_status = '${status}' `)        
                
                } else {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' `)
                }

            }

            if (status != "0") {

                if (start && end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND date >= '${start}' AND date <= '${end}' AND shipping_status = '${status}' `)

                } else if(start ) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND date >= '${start}' AND shipping_status = '${status}' `)
                    
                } else if(end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND date <= '${end}' AND shipping_status = '${status}' `)
                    
                } else if(status) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${driver_data[0].id}' AND shipping_status = '${status}' `)
                    
                }
                
            }

        }

        if (download == "1") {
            
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('orderreport');

            worksheet.columns = [
                { header: 'Order Id', key: 'order_id', width: 30},
                { header: 'Date', key: 'date', width: 30},
                { header: 'Transaction Id', key: 'tracking_id', width: 30},
                { header: 'First Name', key: 'first_name', width: 30},
                { header: 'Last Name', key: 'last_name', width: 30},
                { header: 'Total Price', key: 'total_price', width: 30},
                { header: 'Status', key: 'status_name', width: 30},
            ]

            order_list.forEach(function(row){ worksheet.addRow(row) })

            res.setHeader(
                'Content-Type',
                'Application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=' + 'orderreport.xlsx'
            );
            workbook.xlsx.write(res)
            .then(() => {
                res.end();
                console.log('Excel file created!');
            })
            .catch((error) => {
                console.log(error);
            });

        }

        res.json({status, start, end, download, carrier, order_list})
    } catch (error) {
        console.log(error);
    }
})



router.get("/sales_report", auth, async(req, res)=>{
    try {
        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

        let driver_commission, order_list
        if (driver_data == "") {
            driver_commission = 0;
        } else {
            driver_commission = driver_data[0].carrier_commission
        }

        if (req.user.role == "1") {
            order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                            tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                            `)

        } else {
            order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                            tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                            WHERE carrier_id = '${driver_data[0].id}'`)
        }
        
        res.render("sales_report", {auth_data: req.user, module_list: req.module, permission: req.per, language: req.lang, lang: req.lan, general_data: req.general[0], notification_data: req.notification, order_list, driver_commission, carrier_list
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/salesreport", auth, async(req, res)=>{
    try {
        const {start, end, carrier, download } = req.body

        const  driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)
        let driver_commission;
        if (driver_data == "") {
            driver_commission = req.general[0].default_carrier_commission
        } else {
            
            driver_commission = driver_data[0].carrier_commission
        }

        let order_list
        if (req.user.role == "1") {

            if (carrier) {

                if (start && end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date >= '${start}' AND date <= '${end}' `)
                } else if(start ) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date >= '${start}' `)
                    
                } else if(end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}' AND date <= '${end}' `)
                
                } else {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE carrier_id = '${carrier}'`)
                }
                
            }

            if (!carrier) {

                if (start && end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE date >= '${start}' AND date <= '${end}' `)
                } else if(start ) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE date >= '${start}' `)
                    
                } else if(end) {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    WHERE date <= '${end}' `)
                
                } else {
                    order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                    tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                    `)
                }   
                
            }      
            
        }

        if (req.user.role != "1") {

            if (start && end) {
                order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                WHERE carrier_id = '${driver_data[0].id}' AND date >= '${start}' AND date <= '${end}' `)
            } else if(start ) {
                order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                WHERE carrier_id = '${driver_data[0].id}' AND date >= '${start}' `)
                
            } else if(end) {
                order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                WHERE carrier_id = '${driver_data[0].id}' AND date <= '${end}' `)
            
            } else {
                order_list = await mySqlQury(`SELECT tbl_order.id, tbl_order.order_id, tbl_order.date, tbl_order.tracking_id, tbl_order.total_price, tbl_order.shipping_status, tbl_customer.first_name as first_name, tbl_customer.last_name as last_name, 
                                                tbl_shipping_status.status_name as status_name FROM tbl_order join tbl_customer on tbl_order.customer=tbl_customer.id join tbl_shipping_status on tbl_order.shipping_status=tbl_shipping_status.id 
                                                WHERE carrier_id = '${driver_data[0].id}' `)
            }
            
        }

        if (download == "1") {

            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('salesreport');

            worksheet.columns = [
                { header: 'Order Id', key: 'order_id', width: 30},
                { header: 'Date', key: 'date', width: 30},
                { header: 'Transaction Id', key: 'tracking_id', width: 30},
                { header: 'First Name', key: 'first_name', width: 30},
                { header: 'Last Name', key: 'last_name', width: 30},
                { header: 'Total Price', key: 'total_price', width: 30},
                { header: 'Total Revelue', key: 'status_name', width: 30},
            ]

            order_list.forEach(function(row){
                let total = ((driver_commission / 100) * row.total_price).toFixed(2);
                worksheet.addRow({ order_id: row.order_id, date: row.date, tracking_id: row.tracking_id, first_name: row.first_name, last_name: row.last_name, 
                                    total_price: row.total_price, status_name: total });
                
            })

            // worksheet.addRow({ order_id: 1, date: 'John Doe', tracking_id: new, first_name: 'John Doe', last_name: 'John Doe', total_price: 'John Doe', status_name: 'John Doe' });

            res.setHeader(
                'Content-Type',
                'Application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=' + 'salesreport.xlsx'
            );
            workbook.xlsx.writeFile('salesreport.xlsx')
            .then(() => {
                res.end();
                console.log('Excel file created!');
            })
            .catch((error) => {
                console.log(error);
            });
            
        }

        res.json({start, end, download, carrier, order_list, driver_commission})
    } catch (error) {
        console.log(error);
    }
})



router.get("/payment_report", auth, async(req, res)=>{
    try {
        const carrier_list = await mySqlQury(`SELECT * FROM tbl_driver WHERE approved = '1'`)
        const driver_data = await mySqlQury(`SELECT * FROM tbl_driver WHERE email = '${req.user.tbl_admin_email}'`)

            let driver_payment_list
            if (req.user.role == "1") {
                driver_payment_list = await mySqlQury(`SELECT * FROM tbl_driver_payment `)

            } else {
                driver_payment_list = await mySqlQury(`SELECT * FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' `)
                // var driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                // FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date >= '${"2023-09-25"}' AND payment_status = '${0}' `)

                
            }
        
        res.render("payment_report", {auth_data: req.user, language: req.lang, lang: req.lan, permission: req.per, module_list: req.module,
            general_data: req.general[0], notification_data: req.notification, driver_payment_list, carrier_list, driver_data})
    } catch (error) {
        console.log(error);
    }
})

router.post("/payment-report", auth, async(req, res)=>{
    try {
        const {start, end, carrier, payment, download} = req.body

        let carrier_id, driver_payment_list
        if (req.user.role == "1") {

            carrier_id = await mySqlQury(`SELECT tbl_admin.id FROM tbl_admin WHERE email = '${carrier}' `)
            
            if(payment == "0") {

                if (start && end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_date >= '${start}' AND payment_date <= '${end}' `)
                    

                } else if(start ) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_date >= '${start}' `)

                } else if(end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_date <= '${end}' `)

                } else if(payment != "0") {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_status = '${payment}' `)

                } else {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' `)

                }

            }

            if (payment != "0") {

                if (start && end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_date >= '${start}' AND payment_date <= '${end}' AND payment_status = '${payment}' `)

                } else if(start ) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_date >= '${start}' AND payment_status = '${payment}' `)
  
                } else if(end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_date <= '${end}' AND payment_status = '${payment}' `)
                
                } else if(payment != "0") {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${carrier_id[0].id}' AND payment_status = '${payment}' `)
                
                }
                
            }
            
        } else {

            if(payment == "0") {

                if (start && end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date >= '${start}' AND payment_date <= '${end}' `)
                    
                } else if(start ) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date >= '${start}' `)

                } else if(end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date <= '${end}' `)

                } else if(payment != "0") {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_status = '${payment}' `)

                } else {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' `)

                }
            }

            if (payment != "0") {

                if (start && end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date >= '${start}' AND payment_date <= '${end}' AND payment_status = '${payment}' `)

                } else if(start ) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date >= '${start}' AND payment_status = '${payment}' `)
  
                } else if(end) {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_date <= '${end}' AND payment_status = '${payment}' `)
                
                } else if(payment != "0") {
                    driver_payment_list = await mySqlQury(`SELECT tbl_driver_payment.id, tbl_driver_payment.wallet_amout, tbl_driver_payment.wallet_type, tbl_driver_payment.driver_name, tbl_driver_payment.driver_lname, tbl_driver_payment.driver_email, tbl_driver_payment.payment_status, tbl_driver_payment.payment_date 
                                                                FROM tbl_driver_payment WHERE driver_id = '${req.user.tbl_admin_id}' AND payment_status = '${payment}' `)
                
                }
            }

        }

        if (download == "1") {

            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('orderreport');

            worksheet.columns = [
                { header: 'payment Date', key: 'payment_date', width: 30},
                { header: 'Amount', key: 'wallet_amout', width: 30},
                { header: 'Payment Type', key: 'wallet_type', width: 30},
                { header: 'First Name', key: 'driver_name', width: 30},
                { header: 'Last Name', key: 'driver_lname', width: 30},
                { header: 'Total Revelue', key: 'status_name', width: 30},
            ]

            driver_payment_list.forEach(function(row){
                let status
                if (row.payment_status == "1") {
                    status = "Successfull"
                } else {
                    status = "Pending"
                }
                worksheet.addRow({ payment_date: row.payment_date, wallet_amout: row.wallet_amout, wallet_type: row.wallet_type, driver_name: row.driver_name,
                                    driver_lname: row.driver_lname, status_name: status });
                
            })

            // worksheet.addRow({ order_id: 1, date: 'John Doe', tracking_id: new, first_name: 'John Doe', last_name: 'John Doe', total_price: 'John Doe', status_name: 'John Doe' });

            res.setHeader(
                'Content-Type',
                'Application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                'attachment; filename=' + 'orderreport.xlsx'
            );
            workbook.xlsx.writeFile('orderreport.xlsx')
            .then(() => {
                res.end();
                console.log('Excel file created!');
            })
            .catch((error) => {
                console.log(error);
            });
            
        }

        res.json({start, end, carrier, payment, download, driver_payment_list})
    } catch (error) {
        console.log(error);
    }
})



module.exports = router;