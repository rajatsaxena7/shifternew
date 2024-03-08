$(document).ready(function() {
  $(".js-example-basic-single").select2();
  $(".custome_select").select2({
    dropdownCssClass: 'bigdrop'
  });
  // ------------------------------------
  $('#abc').select2({
    dropdownParent: $('#add_address')
  });
  $(document).on('click', '.customer_address_btn', function() {
    let mode = $(this).attr('data-mode')
    $("#hidden_model").val(mode)
    $('#pickup_address').modal('hide');
    $('#delivery_addressmodal').modal('hide');
  });
  $(".select_all_check").click(function() {
    if ($(".select_all_check").is(':checked')) { //select all
      $(".js-example-placeholder-multiple").find('option').prop("selected", true);
      $(".js-example-placeholder-multiple").trigger('change');
    } else { //deselect all
      $(".js-example-placeholder-multiple").find('option').prop("selected", false);
      $(".js-example-placeholder-multiple").trigger('change');
    }
  });
  // -------------------------------------
  let list = Intl.supportedValuesOf('timeZone');
  let timezone = $('#settings_timezone').attr('data-id');
  $.each(list, function(index, value) {
    $('#settings_timezone').append(' <option value="' + value + '" >' + value + '</option>');
  });
  $('select[name=site_timezone]').val(timezone);
  // ========= login =========== //
  $(document).on('click', '#login_admin', function() {
    $('input[name=email]').val('admin@admin.com');
    $('input[name=password]').val('123');
    document.getElementById("login_form").submit();
  });
  $(document).on('click', '#login_customer', function() {
    $('input[name=email]').val('customer@gmail.com');
    $('input[name=password]').val('123');
    document.getElementById("login_form").submit();
  });
  $(document).on('click', '#login_driver', function() {
    $('input[name=email]').val('xpress@gmail.com');
    $('input[name=password]').val('123');
    document.getElementById("login_form").submit();
  });
  $(document).on('click', '#login_driver_btn', function() {
    $('input[name=email]').val('vivek@gmail.com');
    $('input[name=password]').val('123');
    document.getElementById("login_form").submit();
  });
  $(document).on('click', '#login_secound_admin', function() {
    $('input[name=email]').val('jeel@gmail.com');
    $('input[name=password]').val('123');
    document.getElementById("login_form").submit();
  });
  let language = {};
  $(document).ready(function() {
    let base_url = window.location.origin;
    let lang = {
      "url": base_url + "/language_ajex",
      "method": "POST",
    };
    $.ajax(lang).done(function(lan) {
      language = lan.langs;
      // lang.push(lan.lan)
    });
  });
  // =========== category =========== //
  $(document).on('change', '#category_status', function() {
    let value = $(this).prop('checked');
    let data_id = $(this).attr('data-id');
    let base_url = window.location.origin;
    $.ajax({
      url: base_url + '/allcategory/category/status',
      type: 'POST',
      dataType: 'JSON',
      data: {
        value,
        data_id
      },
      success: function(res) {
        location.reload();
      },
    });
  });
  $(document).on('click', '#edit_category', function() {
    let data_id = $(this).attr('data-id');
    let data_image = $(this).attr('data-image');
    let data_name = $(this).attr('data-name');
    let data_status = $(this).attr('data-status');
    $('#category_id').attr('action', '/allcategory/edit_category/' + data_id);
    $('.img').attr('src', '../../../../uploads/' + data_image);
    $('#category_name').attr('value', data_name);
    if (data_status == 'on') {
      $('#edit_switch').html('<input type="checkbox" name="status" checked><span class="switch-state bg-success"></span>');
    } else {
      $('#edit_switch').html('<input type="checkbox" name="status"><span class="switch-state bg-success"></span>');
    };
  });
  // ============ subcategory ============ //
  $(document).on('change', '#subcategory_status', function() {
    const value = $(this).prop('checked');
    const data_id = $(this).attr('data-id');
    let base_url = window.location.origin;
    $.ajax({
      url: base_url + '/allcategory/sub_category/status',
      type: 'POST',
      dataType: 'JSON',
      data: {
        value,
        data_id
      },
      success: function(res) {
        location.reload();
      }
    });
  });
  $(document).on('click', '#edit_sub_category', function() {
    let data_id = $(this).attr('data-id');
    let data_image = $(this).attr('data-image');
    let data_name = $(this).attr('data-name');
    let data_category_name = $(this).attr('data-category_name');
    let data_status = $(this).attr('data-status');
    $('#subcategory_id').attr('action', '/allcategory/edit_subcategory/' + data_id);
    $('.img').attr('src', '../../../../uploads/' + data_image);
    $('#category_name').select2().select2('val', data_category_name);
    $('#subcategory_name').val(data_name);
    if (data_status == 'on') {
      $('#subcategory_switch').html('<input type="checkbox" name="status" checked><span class="switch-state bg-success"></span>');
    } else {
      $('#subcategory_switch').html('<input type="checkbox" name="status"><span class="switch-state bg-success"></span>');
    };
    let modellist = $('#dynamic_table').val()
    let base_url = window.location.origin;
    $.ajax({
      url: base_url + '/allcategory/category/ajax',
      type: 'POST',
      dataType: 'JSON',
      data: {
        modellist
      },
      success: function(res) {
        $("#sub_category_name").html("")
        $.each(res.category_list, function(index, value) {
          if (value.id == data_category_name) {
            $('#sub_category_name').append('<option selected value="' + value.id + '">' + value.name + '</option>');
          } else {
            $('#sub_category_name').append('<option value="' + value.id + '">' + value.name + '</option>');
          }
        });
      }
    });
  });
  // =========== product ============ //
  $(document).on("select2:select", ".product_category", function() {
    let value = $(this).select2('val');
    let base_url = window.location.origin;
    $.ajax({
      url: base_url + '/product/product_category/' + value,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        $('.product_subcategory').html('<option value selected disabled>' + language.Select_Sub_Category + '</option>');
        $.each(res.sub_category_list, function(index, value) {
          $('.product_subcategory').append(`<option value="${value.id}">${value.name}</option>`);
        });
      }
    });
  });
  $(document).on("click", "#edit_product", function() {
    const data_id = $(this).attr('data-id');
    const data_category_name = $(this).attr('data-category_name');
    const data_subcategory_name = $(this).attr('data-subcategory_name');
    const data_name = $(this).attr('data-name');
    const data_price = $(this).attr('data-price');
    const data_status = $(this).attr('data-status');
    let base_url = window.location.origin;
    $('#edit_product_id').attr('action', '/product/edit_product/' + data_id);
    $('#edit_product_category').select2().select2('val', data_category_name);
    $('#edit_product_name').attr('value', data_name);
    $('#edit_product_price').attr('value', data_price);
    if (data_status == 'on') {
      $('#edit_product_switch').html('<input type="checkbox" name="status" checked><span class="switch-state bg-success"></span>');
    } else {
      $('#edit_product_switch').html('<input type="checkbox" name="status"><span class="switch-state bg-success"></span>');
    };
    $.ajax({
      url: base_url + '/product/product_subcategory/' + data_category_name,
      type: 'GET',
      dataType: 'JSON',
      data: {
        data_subcategory_name
      },
      success: function(res) {
        $("#edit_product_category").html("")
        $.each(res.category_list, function(index, value) {
          if (value.id == data_category_name) {
            $('#edit_product_category').append('<option selected value="' + value.id + '">' + value.name + '</option>');
          } else {
            $('#edit_product_category').append('<option value="' + value.id + '">' + value.name + '</option>');
          }
        });
        $("#edit_product_subcategory").html("")
        $.each(res.sub_category_list, function(index, value) {
          if (value.id == data_subcategory_name) {
            $('#edit_product_subcategory').append('<option selected value="' + value.id + '">' + value.name + '</option>');
          } else {
            $('#edit_product_subcategory').append('<option value="' + value.id + '">' + value.name + '</option>');
          }
        });
      }
    });
  });
  // ============ shifter ============ //
  $(document).on('click', '#edit_shifter', function() {
    let data_id = $(this).attr('data-id');
    let data_image = $(this).attr('data-image');
    let data_title = $(this).attr('data-title');
    let data_price = $(this).attr('data-price');
    let data_description = $(this).attr('data-description');
    $('#shift_id').attr('action', '/settings/edit_shift/' + data_id);
    $('.img').attr('src', '../../uploads/' + data_image);
    $('#shift_name').attr('value', data_title);
    $('#shift_price').attr('value', data_price);
    $('#shift_description').val(data_description);
  });
  // ============= time management ============= //
  $(document).on('click', '#edit_time', function() {
    let data_id = $(this).attr('data-id');
    let data_starttime = $(this).attr('data-start_time');
    let data_endtime = $(this).attr('data-end_time');
    $('#edit_id').attr('action', '/settings/edit_time/' + data_id);
    $('#edit_start_time').attr('value', data_starttime);
    $('#edit_end_time').attr('value', data_endtime);
  });
  // ============ Weight Unit ============ //
  $(document).on('click', '#edit_unit', function() {
    let data_id = $(this).attr('data-id');
    let data_name = $(this).attr('data-name');
    let data_symbol = $(this).attr('data-symbol');
    $('#edit_id').attr('action', '/settings/edit_weight_unit/' + data_id);
    $('#name').attr('value', data_name);
    $('#symbol').attr('value', data_symbol);
  });
  // ============ FAQ List ============ //
  $(document).on("click", "#edit_faq", function() {
    let id = $(this).attr("data-id");
    let title = $(this).attr("data-title");
    let description = $(this).attr("data-des");
    let position = $(this).attr("data-position");
    $("#edit_faqs").attr("action", "/settings/edit_faq/" + id);
    $("#faq_name").attr("value", title);
    $("#faq_des").val(description);
    $("#faq_posi").attr("value", position);
  })
  // ============ edit customer details ============ //
  $(document).on("click", ".edit_c_address", function() {
    let id = $(this).attr("data-id");
    let Cid = $(this).attr("data-cusID");
    let fname = $(this).attr("data-Fname");
    let lName = $(this).attr("data-Lname");
    let c_codeid = $(this).attr("data-countryC");
    let phone = $(this).attr("data-phone");
    let email = $(this).attr("data-email");
    let address = $(this).attr("data-address");
    let city = $(this).attr("data-city");
    let state = $(this).attr("data-state");
    let country = $(this).attr("data-country");
    let pincode = $(this).attr("data-pincode");
    $("#edit_eddress").attr("action", "/edit_cus_ditail/" + id)
    $("#c_id").attr("value", Cid)
    $("#c_fname").attr("value", fname)
    $("#c_lname").attr("value", lName)
    $("#c_code").select2().val(c_codeid).trigger('change');
    $("#c_phone").attr("value", phone)
    $("#c_email").attr("value", email)
    $("#c_address").attr("value", address)
    $("#c_city").attr("value", city)
    $("#c_state").attr("value", state)
    $("#c_country").attr("value", country)
    $("#c_pincode").attr("value", pincode)
  })
  // ========= summernote =========== //
  $('#summernote').summernote({
    placeholder: 'Enter Policy',
    tabsize: 2,
    height: 100
  });;
  $(document).on("click", "#policy_show", function() {
    $("#add_policy").removeClass("d-none")
    $("#policy_list").addClass("d-none")
  })
  $(document).on("click", "#edit_policy", function() {
    $("#edit_p_detail").removeClass("d-none");
    $("#policy_list").addClass("d-none");
    let id = $(this).attr('data-id');
    let title = $(this).attr('data-title');
    let detail = $(this).attr('data-det')
    $("#show_p_detail").attr("action", "/settings/edit_policy/" + id);
    $("#p_title").attr("value", title);
    $("#p_detail").html(detail);
  })
  $(document).on("click", "#show_policy_list", function() {
    $("#add_policy").addClass("d-none")
    $("#policy_list").removeClass("d-none")
  })
  $(document).on("click", "#show_p_list", function() {
    $("#edit_p_detail").addClass("d-none")
    $("#policy_list").removeClass("d-none")
  })
  // ========= Customer Profile Edit =========== //
  $(document).on('click', '#customer_profile', function() {
    let password = $("#c_password").val();
    let c_password = $("#c_r_password").val();
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/edit_edmin/ajex',
      type: 'POST',
      dataType: 'JSON',
      data: {
        password,
        c_password
      },
      success: function(res) {
        if (res.error == 'password') {
          $("#password_error").removeClass("d-none")
        }
      }
    });
  })
  // ========= Carrier Profile Edit =========== //
  $(document).on('click', '#Carrier_profile', function() {
    let password = $("#c_password").val();
    let c_password = $("#c_r_password").val();
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/edit_Carrier/ajex',
      type: 'POST',
      dataType: 'JSON',
      data: {
        password,
        c_password
      },
      success: function(res) {
        if (res.error == 'password') {
          $("#password_error").removeClass("d-none")
        }
      }
    });
  })
  // ========= Driver Amount =========== //
  $(document).on('input', '#driver_amount', function() {
    let amount = $("#amount").val();
    let total_amount = $("#total_driver_amount").val();
    if (amount <= total_amount) {
      $("#driver_bal_error").addClass("d-none")
      let type_amount = $(this).val();
      if (parseFloat(amount) <= parseFloat(type_amount)) {
        if (parseFloat(total_amount) >= parseFloat(type_amount)) {
          $("#driver_payment_btn").removeClass("disabled")
          $("#payout_select_form").removeClass("d-none")
        } else {
          $("#driver_payment_btn").addClass("disabled")
          $("#payout_select_form").addClass("d-none")
        }
      } else {
        $("#driver_payment_btn").addClass("disabled")
        $("#payout_select_form").addClass("d-none")
      }
    } else {
      $("#driver_bal_error").removeClass("d-none")
    }
  })
  $(document).on('change', '#check_driver_amount', function() {
    let driver_val = $(this).select2().val()
    if (driver_val == "1") {
      $(".show_payment").html('<div class="col-12 pt-5" >' + '<label class="card-title">' + language.UPI_IDs + '</label>' + '<input  class="form-control" type="text" name="driver_upi_id" placeholder="' + language.Enter + ' ' + language.UPI_IDs + '" required>' + '</div>')
    } else if (driver_val == "2") {
      $(".show_payment").html('<div class="col-12 pt-5" >' + '<label class="card-title">' + language.Bank_Acount_No + '</label>' + '<input  class="form-control" type="text" name="driver_ac_no" placeholder="' + language.Enter + ' ' + language.Bank_Acount_No + '" required>' + '</div>' + '<div class="col-12 pt-3" >' + '<label class="card-title">' + language.IFC_Code + '</label>' + '<input  class="form-control" type="text" name="driver_ifc" placeholder="' + language.Enter + ' ' + language.IFC_Code + '" required>' + '</div>' + '<div class="col-12 pt-3" >' + '<label class="card-title">' + language.Bank_Acount_Type + '</label>' + '<input  class="form-control" type="text" name="driver_ac_type" placeholder="' + language.Enter + ' ' + language.Bank_Acount_Type + '" required>' + '</div>')
    } else if (driver_val == "3") {
      $(".show_payment").html('<div class="col-12 pt-5" >' + '<label class="card-title">' + language.Paypal_Email_ID + '</label>' + '<input  class="form-control" type="text" name="driver_paypal_email" placeholder="' + language.Enter + ' ' + language.Paypal_Email_ID + '" required>' + '</div>')
    }
  })
  // ========= Driver Aproved Amount Admin  =========== //
  $(document).on('click', '.payoutmodel', function() {
    let id = $(this).attr('data-id')
    $("#payout_model").attr('action', '/payout/add_payout/' + id)
  })
  // ========= Daily Report =========== //
  $("#daily_report_date").on('change', function() {
    let date = $(this).val()
    let carrier = $("#daily_payment_carrier").val()
    dailyorder(date, carrier)
  })
  $("#daily_payment_carrier").on('change', function() {
    let carrier = $(this).val()
    let date = $("#daily_report_date").val()
    dailyorder(date, carrier)
  })

  function dailyorder(date, carrier) {
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/report/dapily-report',
      type: 'POST',
      dataType: 'JSON',
      data: {
        date,
        carrier
      },
      success: function(res) {
        $("#daily_report_order").html(res.order)
        $("#daily_report_delivered").html(res.delivered)
        $("#daily_report_revenue").html(res.daily_commission)
      }
    });
  }
  // ========= Order Report =========== //
  $("#order_report_status").on('change', function() {
    let status = $(this).val()
    let start = $("#order_report_start").val()
    let end = $("#order_report_end").val()
    let download = $("#doenload_report").val()
    let carrier = $("#order_carrier_list").val()
    orderreport(status, start, end, download, carrier)
  })
  $("#order_report_start").on('change', function() {
    let start = $(this).val()
    let status = $("#order_report_status").val()
    let end = $("#order_report_end").val()
    let download = $("#doenload_report").val()
    let carrier = $("#order_carrier_list").val()
    orderreport(status, start, end, download, carrier)
  })
  $("#order_report_end").on('change', function() {
    let end = $(this).val()
    let status = $("#order_report_status").val()
    let start = $("#order_report_start").val()
    let download = $("#doenload_report").val()
    let carrier = $("#order_carrier_list").val()
    orderreport(status, start, end, download, carrier)
  })
  $("#order_carrier_list").on('change', function() {
    let carrier = $(this).val()
    let end = $("#order_report_end").val()
    let status = $("#order_report_status").val()
    let start = $("#order_report_start").val()
    let download = $("#doenload_report").val()
    orderreport(status, start, end, download, carrier)
  })
  $("#download_report").on('click', function() {
    let download = "1";
    let start = $("#order_report_start").val()
    let end = $("#order_report_end").val()
    let status = $("#order_report_status").val()
    let carrier = $("#order_carrier_list").val()
    orderreport(status, start, end, download, carrier)
  })

  function orderreport(status, start, end, download, carrier) {
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/report/orderreport',
      type: 'POST',
      dataType: 'JSON',
      data: {
        status,
        start,
        end,
        download,
        carrier
      },
      success: function(res) {
        $("#tb_order_report").html('')
        $.each(res.order_list, function(index, value) {
          let span_color;
          if (value.shipping_status == "1") {
            span_color = "badge badge-warning"
          } else if (value.shipping_status == "2") {
            span_color = "badge badge-danger"
          } else if (value.shipping_status == "3") {
            span_color = "badge badge-success"
          } else {
            span_color = "badge badge-primary"
          }
          $("#tb_order_report").append('<tr>' + '<td class="d-none"></td>' + '<td># ' + value.order_id + ' </td>' + '<td> ' + value.date + ' </td>' + '<td># ' + value.tracking_id + ' </td>' + '<td> ' + value.first_name + '  ' + value.last_name + ' </td>' + '<td class="invosymbol"> ' + value.total_price + ' </td> ' + '<td> <span class="' + span_color + '"> ' + value.status_name + ' </span> </td>' + '</td>' + '</tr>')
        })
        let rowcount = $("#tb_order_report tr").length;
        $("#total_order").text(rowcount)
        currency()
        thousands_separators()
      }
    });
  }
  $(document).on('click', "#print_order_report", function() {
    let printcontent = document.getElementById('invoice_page').innerHTML;
    document.body.innerHTML = printcontent;
    window.print();
    location.reload();
  })
  $(document).ready(function() {
    ordercount()
  })

  function ordercount() {
    let rowcount = $("#tb_order_report tr").length;
    $("#total_order").text(rowcount)
  }
  // ========= Sales Report =========== //
  $("#order_sales_start").on('change', function() {
    let start = $(this).val()
    let end = $("#order_sales_end").val();
    let download = $("#download_sales_report").val();
    let carrier = $("#order_sales_carrier").val();
    slase(start, end, download, carrier)
  })
  $("#order_sales_end").on('change', function() {
    let end = $(this).val()
    let start = $("#order_sales_start").val();
    let download = $("#download_sales_report").val();
    let carrier = $("#order_sales_carrier").val();
    slase(start, end, download, carrier)
  })
  $("#order_sales_carrier").on('change', function() {
    let carrier = $(this).val()
    let end = $("#order_sales_end").val();
    let start = $("#order_sales_start").val();
    let download = $("#download_sales_report").val();
    slase(start, end, download, carrier)
  })
  $(document).on("click", "#download_sales_report", function() {
    let download = 1;
    let end = $("#order_sales_end").val();
    let start = $("#order_sales_start").val();
    let carrier = $("#order_sales_carrier").val();
    slase(start, end, download, carrier)
  })

  function slase(start, end, download, carrier) {
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/report/salesreport',
      type: 'POST',
      dataType: 'JSON',
      data: {
        start,
        end,
        download,
        carrier
      },
      success: function(res) {
        $("#tb_salse_report").html('')
        $.each(res.order_list, function(index, value) {
          let total = ((res.driver_commission / 100) * value.total_price).toFixed(2)
          $("#tb_salse_report").append('<tr>' + '<td class="d-none"></td>' + '<td># ' + value.order_id + ' </td>' + '<td> ' + value.date + ' </td>' + '<td># ' + value.tracking_id + ' </td>' + '<td> ' + value.first_name + ' ' + value.last_name + ' </td>' + '<td class="invosymbol"> ' + value.total_price + ' </td>' + '<td class="invosymbol"> ' + total + ' </td>' + '</tr>')
        })
        let rowcount = $("#tb_salse_report tr").length;
        $("#total_salse_order").html(rowcount)
        let report_total = 0;
        $("td:nth-child(7):visible").each(function() {
          report_total += Number($(this).text())
        })
        $("#total_salse_revenue").text((report_total).toFixed(2))
        // document.getElementById("total_salse_revenue").innerHTML = report_total
        currency()
        thousands_separators()
      }
    });
  }
  $(document).ready(function() {
    salsereport()
    unitssybol()
  })

  function salsereport() {
    let rowcount = $("#tb_salse_report tr").length;
    $("#total_salse_order").html(rowcount)
    let total = 0;
    $("td:nth-child(7):visible").each(function() {
      total += Number($(this).text())
    })
    $("#total_salse_revenue").html((total).toFixed(2))
    currency()
    thousands_separators()
  }
  // ========= Payment Report =========== //
  $("#payment_start_date").on('change', function() {
    let start = $(this).val()
    let end = $("#payment_end_date").val()
    let carrier = $("#payment_carrier").val()
    let payment = $("#payment_carrier_type").val()
    let download = $("#download_payment_report").val()
    paymentreport(start, end, carrier, payment, download)
  })
  $("#payment_end_date").on('change', function() {
    let end = $(this).val()
    let start = $("#payment_start_date").val()
    let carrier = $("#payment_carrier").val()
    let payment = $("#payment_carrier_type").val()
    let download = $("#download_payment_report").val()
    paymentreport(start, end, carrier, payment, download)
  })
  $("#payment_carrier_type").on('change', function() {
    let payment = $(this).val()
    let end = $("#payment_end_date").val()
    let carrier = $("#payment_carrier").val()
    let start = $("#payment_start_date").val()
    let download = $("#download_payment_report").val()
    paymentreport(start, end, carrier, payment, download)
  })
  $("#payment_carrier").on('change', function() {
    let carrier = $(this).val()
    let end = $("#payment_end_date").val()
    let start = $("#payment_start_date").val()
    let payment = $("#payment_carrier_type").val()
    let download = $("#download_payment_report").val()
    paymentreport(start, end, carrier, payment, download)
  })
  $("#download_payment_report").on('click', function() {
    let download = "1";
    let carrier = $("#payment_carrier").val()
    let end = $("#payment_end_date").val()
    let start = $("#payment_start_date").val()
    let payment = $("#payment_carrier_type").val()
    paymentreport(start, end, carrier, payment, download)
  })

  function paymentreport(start, end, carrier, payment, download) {
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/report/payment-report',
      type: 'POST',
      dataType: 'JSON',
      data: {
        start,
        end,
        carrier,
        payment,
        download
      },
      success: function(res) {
        $("#tb_payment_report").html('')
        $.each(res.driver_payment_list, function(index, value) {
          let span_color, payment_status;
          if (value.payment_status == "1") {
            span_color = "badge badge-success"
            payment_status = language.Successfull
          } else {
            span_color = "badge badge-danger"
            payment_status = language.Pending
          }
          $("#tb_payment_report").append('<tr>' + '<td class="d-none"></td>' + '<td> ' + value.payment_date + ' </td>' + '<td> ' + value.wallet_amout + ' </td>' + '<td> ' + value.wallet_type + ' </td>' + '<td> ' + value.driver_name + '  ' + value.driver_lname + ' </td>' + '<td> <span class="' + span_color + '"> ' + payment_status + ' </span> </td>' + '</tr>')
        })
        let rowcount = $("#tb_payment_report tr").length;
        $("#total_order").text(rowcount)
      }
    });
  }
  // ========= Order Barcode =========== //
  $(document).on('click', '#click_print_Barcoad', function() {
    const id = $(this).attr('data-id')
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/order/barcoad/' + id,
      type: 'POST',
      dataType: 'JSON',
      success: function(res) {
        $("#show_barcode").html('')
        if (res.driver_data[0].module != "2") {
          for (let i = 0; i < res.package_name; i++) {
            let barcodeindex = "#barcode" + i
            $("#show_barcode").append('<div class="border-bottom">' + '<div class="d-flex">' + '<div class="col-8 d-flex" style="padding-left: 20px;">' + '<img src="../../uploads/' + res.general_data.site_dark_logo + ' " class="" width="20px" height="18px" alt="image">' + '<h5 style="padding-top: 1px; padding-left: 3px; margin-bottom: 1px;"> ' + res.general_data.site_title + ' </h5>' + '</div>' + '<div class="col-4 d-flex justify-content-end">' + '<h5 class="m-r-10" style="padding-top: 3px; margin-bottom: 1px;">Transaction Id :- ' + res.driver_data[0].tracking_id + '</h5>' + '</div>' + '</div>' + '<div class="text-center border-top col-12 pt-0 mt-1">' + '<h5 class="mb-0" style="padding-top: 6px;">Order Id :- #' + res.driver_data[0].order_id + '</h5>' + '<svg class="barcode" style="width: 200px !important;" id="barcode' + i + '"></svg>' + '</div>' + '<div class="d-flex border-top" >' + '<div class="col-6 text-center mt-1">' + '<h6 class="mb-0">From :- ' + res.pickup_address.first_name + ' ' + res.pickup_address.last_name + '</h6><p class="mb-0">' + res.pickup_address.country_code + ' ' + res.pickup_address.phone_no + '</p><p class="mb-0">' + res.pickup_address.city + ', ' + res.pickup_address.state + '</p><p style="margin-bottom: 6px;">' + res.pickup_address.country + ', ' + res.pickup_address.pincode + '</p>' + '</div>' + '<div class="col-6 text-center mt-1">' + '<h6 class="mb-0">To :- ' + res.deliver_address.first_name + ' ' + res.deliver_address.last_name + '</h6><p class="mb-0">' + res.deliver_address.country_code + ' ' + res.deliver_address.phone_no + '</p><p class="mb-0">' + res.deliver_address.city + ', ' + res.deliver_address.state + '</p><p style="margin-bottom: 6px;">' + res.deliver_address.country + ', ' + res.deliver_address.pincode + '</p>' + '</div>' + '</div>' + '</div>' + '<div class="text-center" style="padding-top: 10px; padding-bottom: 10px;">' + '<span class=""><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i><i class="icon-cut"></i><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i></span>' + '</div>')
            JsBarcode(barcodeindex, res.driver_data[0].order_id, {
              width: 2.5,
              height: 100,
              fontSize: 15,
              text: res.driver_data[0].package_name.split(",")[i]
            });
          }
        } else {
          $.each(res.product, function(index, value) {
            let barcodeindex = "#barcode" + index
            $.each(res.product_list, function(a, b) {
              if (value.id == b) {
                let product_name = value.name
                if (res.product_qty_list[a] != "0") {
                  $("#show_barcode").append('<div class="border-bottom">' + '<div class="d-flex">' + '<div class="col-8 d-flex" style="padding-left: 20px;">' + '<img src="../../uploads/' + res.general_data.site_dark_logo + ' " class="" width="20px" height="18px" alt="image">' + '<h5 style="padding-top: 1px; padding-left: 3px; margin-bottom: 1px;"> ' + res.general_data.site_title + ' </h5>' + '</div>' + '<div class="col-4 d-flex justify-content-end">' + '<h5 class="m-r-10" style="padding-top: 3px; margin-bottom: 1px;">Transaction Id :- ' + res.driver_data[0].tracking_id + '</h5>' + '</div>' + '</div>' + '<div class="text-center border-top col-12 pt-0 mt-1">' + '<h5 class="mb-0" style="padding-top: 6px;">Order Id :- #' + res.driver_data[0].order_id + '</h5>' + '<svg class="barcode" style="width: 200px !important;" id="barcode' + index + '"></svg>' + '</div>' + '<div class="d-flex border-top" >' + '<div class="col-6 text-center mt-1">' + '<h6 class="mb-0">From :- ' + res.pickup_address.first_name + ' ' + res.pickup_address.last_name + '</h6><p class="mb-0">' + res.pickup_address.country_code + ' ' + res.pickup_address.phone_no + '</p><p class="mb-0">' + res.pickup_address.city + ', ' + res.pickup_address.state + '</p><p style="margin-bottom: 6px;">' + res.pickup_address.country + ', ' + res.pickup_address.pincode + '</p>' + '</div>' + '<div class="col-6 text-center mt-1">' + '<h6 class="mb-0">To :- ' + res.deliver_address.first_name + ' ' + res.deliver_address.last_name + '</h6><p class="mb-0">' + res.deliver_address.country_code + ' ' + res.deliver_address.phone_no + '</p><p class="mb-0">' + res.deliver_address.city + ', ' + res.deliver_address.state + '</p><p style="margin-bottom: 6px;">' + res.deliver_address.country + ', ' + res.deliver_address.pincode + '</p>' + '</div>' + '</div>' + '</div>' + '<div class="text-center" style="padding-top: 10px; padding-bottom: 10px;">' + '<span class=""><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i><i class="icon-cut"></i><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i><i class="icon-line-dashed"></i></span>' + '</div>')
                  JsBarcode(barcodeindex, res.driver_data[0].order_id, {
                    width: 2.5,
                    height: 100,
                    fontSize: 15,
                    text: product_name + '[qty :- ' + res.product_qty_list[a] + ']'
                  });
                }
              }
            })
          })
        }
      }
    });
  })
  $(document).on('click', "#barcode_download", function() {
    let print = document.getElementById('barcode_page').innerHTML;
    document.body.innerHTML = print;
    window.print();
    location.reload();
  })
  // ========= Add Order Payment =========== //
  $(document).on('click', '#order_payment_model', function() {
    $("#clode_payment_model").click();
    const base_url = window.location.origin;
    const order_id = $(this).attr('data-order_bank_id');
    $.ajax({
      url: base_url + '/order/add_payment',
      type: 'POST',
      dataType: 'JSON',
      data: {
        order_id
      },
      success: function(res) {
        $("#show_paid_amount").text(res.total)
        $("#order_payment_method").attr("action", '/order/add_bank_payment/' + order_id)
      }
    });
  });
  // ========= Add Payment =========== //
  $(document).on('click', '#payment_model', function() {
    let id = $(this).attr('data-id');
    let amount = $("#show_Total_Price").text()
    if (id == "7") {
      $("#close_model").click();
      $("#show_amount").text(amount)
      $("#payment_image_submit").attr("action", '/packers_and_movers/place_order/' + id)
    }
  });
  // ========= Order List Payment Model =========== //
  $(document).on('click', '#show_img_model', function() {
    let title = $(this).attr('data-title')
    let img = $(this).attr('data-payment_img')
    let total = $(this).attr('data-total')
    if (img == "0") {
      $("#show_payment_img").addClass('d-none')
      $("#payment_type").text(title)
      $("#payment_amount_model").html('<p class="invosymbol">' + total + '</p>')
    } else {
      $("#show_payment_img").removeClass('d-none')
      $("#payment_type").text(title)
      $("#payment_amount_model").html('<p class="mb-0 invosymbol">' + total + '</p>')
      $(".showimg").attr('src', '../../uploads/' + img);
      $("#showimg_a").attr('href', '../../uploads/' + img);
    }
    currency()
    thousands_separators()
  })
  // =============== Module click change =============== //
  $(document).on('click', '.dynamic_module', function() {
    $('#dynamic_table').val($(this).attr('data-module'))
    dynamic_table()
    shipping_module($(this).attr('data-module'))
  })

  function dynamic_table() {
    // console.log("🚀 ~ file: script.ejs:2727 ~ dynamic_table ~ $('#dynamic_table').val():", $('#dynamic_table').val())
    if ($('#dynamic_table').val() == 1) {
      $('.domestic_table').removeClass('d-none')
      $('.packersandmovers_table').addClass('d-none')
      $('.international_table').addClass('d-none')
    } else if ($('#dynamic_table').val() == 2) {
      $('.domestic_table').addClass('d-none')
      $('.packersandmovers_table').removeClass('d-none')
      $('.international_table').addClass('d-none')
    } else {
      $('.domestic_table').addClass('d-none')
      $('.packersandmovers_table').addClass('d-none')
      $('.international_table').removeClass('d-none')
    }
  }
  // =============== Zone module list =============== //
  $(document).on('click', '#click_add_zone', function() {
    $("#main_zone_page").addClass('d-none')
    $("#show_zone_card").removeClass('d-none')
    let modellist = $('#dynamic_table').val()
    $("#module_id").attr('value', modellist)
  })
  $(document).on('click', '#click_open_module_list', function() {
    $("#main_zone_page").removeClass('d-none')
    $("#show_zone_card").addClass('d-none')
  })
  // =============== Zone Module Category  =============== //
  $(document).on('click', '#category_click', function() {
    let modellist = $('#dynamic_table').val()
    $("#category_mid").attr('value', modellist)
  })
  // =============== Zone Module sub Category =============== //
  $(document).on('click', '#sub_category_click', function() {
    let modellist = $('#dynamic_table').val()
    $("#sub_category_mid").attr('value', modellist)
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/allcategory/category/ajax',
      type: 'POST',
      dataType: 'JSON',
      data: {
        modellist
      },
      success: function(res) {
        $(".category_ajex").html("")
        $.each(res.category_list, function(index, value) {
          $('.category_ajex').append('<option value="' + value.id + '">' + value.name + '</option>');
        });
      }
    });
  })
  // =============== Zone Module sub Category select =============== //
  $(document).on('click', '.sub_category_id', function() {
    let currentRow = $(this).closest(".sub_category_card");
    if (currentRow.find('.sub_selected_item').val() == 0) {
      currentRow.find('.sub_selected_item').val(1);
      currentRow.append('<input type="hidden" name="sub_category_id" value="' + $(this).attr('data-id') + '">');
      currentRow.addClass('b-primary border-2');
      $('#sub_hidden_category').val(parseInt($('#sub_hidden_category').val()) + 1)
      $('#sub_category_error').addClass('d-none')
    } else {
      currentRow.find(".sub_selected_item").val(0);
      currentRow.find('input[name=category_id]').remove();
      currentRow.removeClass('b-primary border-2');
      $('#sub_hidden_category').val(parseInt($('#sub_hidden_category').val()) - 1)
    };
  });
  $(document).on('click', '#sub_module_category_btn', function() {
    if ($('#sub_hidden_category').val() == '0') {
      $('#sub_category_error').removeClass('d-none')
    } else {
      $('#sub_category_error').addClass('d-none')
      $('#sub_module_category_form').submit()
    }
  })
  $(document).on('click', '#click_distance', function() {
    module = $("#dynamic_table").val()
    if (module == "1") {
      $('#distance_rate').addClass('d-none')
      $('#show_distance_rate').removeClass('d-none')
      $('#desti_Country').removeClass('d-none')
      $('#Destination_State').removeClass('d-none')
      $('#Destination_City').removeClass('d-none')
      $('#zone_desti_Country').addClass('d-none')
      $('#add_distance_module').attr('value', module)
    } else {
      $('#distance_rate').addClass('d-none')
      $('#show_distance_rate').removeClass('d-none')
      $('#desti_Country').addClass('d-none')
      $('#Destination_State').addClass('d-none')
      $('#Destination_City').addClass('d-none')
      $('#zone_desti_Country').removeClass('d-none')
      $('#add_distance_module').attr('value', module)
    }
  })
  $(document).on('click', '#show_click_distance_rate', function() {
    $('#distance_rate').removeClass('d-none')
    $('#show_distance_rate').addClass('d-none')
  })
  $(document).on("select2:select", '#select_origin', function() {
    let value = $("#select_origin").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/settings/add_state/ajax/' + value,
      type: 'POST',
      dataType: 'JSON',
      success: function(res) {
        $("#show_state").html('<option value selected disabled>' + language.Choose_State + '</option>')
        $.each(res.country_list, function(index, value) {
          $('#show_state').append('<option value="' + value.id + '">' + value.name + '</option>');
        });
      }
    });
  })
  $(document).on("select2:select", '#show_state', function() {
    let value = $("#show_state").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/settings/add_city/ajax/' + value,
      type: 'POST',
      dataType: 'JSON',
      success: function(res) {
        $("#show_origin_city").html('<option value selected disabled>' + language.Choose_City + '</option>')
        $.each(res.city_list, function(index, value) {
          $('#show_origin_city').append('<option value="' + value.id + '">' + value.name + '</option>');
        });
      }
    });
  })
  $(document).on("select2:select", '#select_desti_Country', function() {
    let value = $("#select_desti_Country").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/settings/add_state/ajax/' + value,
      type: 'POST',
      dataType: 'JSON',
      success: function(res) {
        $("#slect_Destination_State").html('<option value selected disabled>' + language.Choose_Destination_State + '</option>')
        $.each(res.country_list, function(index, value) {
          $('#slect_Destination_State').append('<option value="' + value.id + '">' + value.name + '</option>');
        });
      }
    });
  })
  $(document).on("select2:select", '#slect_Destination_State', function() {
    let value = $("#slect_Destination_State").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/settings/add_city/ajax/' + value,
      type: 'POST',
      dataType: 'JSON',
      success: function(res) {
        $("#slect_Destination_City").html('<option value selected disabled>' + language.Choose_Destination_City + '</option>')
        $.each(res.city_list, function(index, value) {
          $('#slect_Destination_City').append('<option value="' + value.id + '">' + value.name + '</option>');
        });
      }
    });
  })
  $(document).on('click', '#module_pricing_click', function() {
    let id = $("#dynamic_table").val()
    $("#pricing_module").attr('value', id)
  })
  $(document).on('click', '#module_pricing', function() {
    let id = $("#dynamic_table").val()
    $("#pricing_module1").attr('value', id)
  })
  $(document).on('click', '#international_pricing_click', function() {
    let id = $("#dynamic_table").val()
    $("#pricing_module2").attr('value', id)
  })
  // =============== Add Product Courier =============== //
  $(document).on('click', '#add_product_btn', function() {
    let weight_units = $('#weight_units').val()
    let length_units = $('#length_units').val()
    $('#add_product_tbl').append('<div class="row mt-4 floor_field">' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-2">' + '<label class="form-label">' + language.Package_Name + '</label>' + '<input class="form-control package_name" type="text" id="package_name" name="package_name" value="" placeholder="' + language.Enter + ' ' + language.Package_Name + '" required>' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-2">' + '<label class="form-label">' + language.Package_Description + '</label>' + '<input class="form-control" type="text" id="package_des" name="package_des" value="" placeholder="' + language.Enter + ' ' + language.Package_Description + '" required> ' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-1 ">' + '<label class="form-label">' + language.Unit_Price + '</label>' + '<input class="form-control package_Amouunt" type="number" id="package_Amouunt" name="package_Amouunt" value="" placeholder="' + language.Enter + ' ' + language.Amount + '" required>' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-2">' + '<label class="form-label">' + language.Dead_Weight + ' (' + weight_units + ') </label> <button class="pb-1" data-bs-toggle="tooltip" data-bs-placement="Top" title=' + language.Dead_Weight_is_the_physical_weight + '><i class="fa fa-info-circle f-16"></i></button>' + '<input class="form-control package_weight " type="number" id="package_weight" name="package_Weight" value="" placeholder="0" required>' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-1">' + '<label class="form-label">' + language.Length + ' (' + length_units + ') </label>' + '<input class="form-control package_length" type="number" id="package_length" name="package_Length" value="" placeholder="0" required>' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-1">' + '<label class="form-label">' + language.Breadth + ' (' + length_units + ') </label>' + '<input class="form-control package_width" type="number" id="package_width" name="package_width" value="" placeholder="0" required>' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-1">' + '<label class="form-label">' + language.Height + ' (' + length_units + ') </label>' + '<input class="form-control package_height" type="number" id="package_height" name="package_Height" value="" placeholder="0" required>' + '</div>' + '<div class="col-sm-6 col-md-4 col-lg-3 col-xl-2">' + '<label class="form-label">' + language.Weight_Vol + ' (' + weight_units + ') <button data-bs-toggle="tooltip" data-bs-placement="left" title="' + language.Product_calculation_i_detail1 + '' + $('#curiour_amount').val() + ' ' + language.Product_calculation_i_detail2 + '"><i class="fa fa-info-circle f-16"></i></button></label>' + '<div class="d-flex">' + '<input class="form-control m-r-20 weight_vol" type="number" id="weight_vol" name="package_Weight_vol" value="0" placeholder="" readonly>' + '<a type="button" class="mt-1 pt-1 mx-4 text-danger floor_field_delete" style="padding-right: 50px;"><i class="fa fa-trash-o f-24"></i></a>' + '</div>' + '</div>' + '</div>');
    $("[data-bs-toggle='tooltip']").tooltip();
  });
  $(document).on('click', '.product_field_delete', function() {
    $(this).parents('.product_field').remove();
  });
  $(document).on("input", '#package_weight', function() {
    let amount = $('#curiour_amount').val()
    let currentRow = $(this).closest(".floor_field")
    currentRow.find("#weight_vol").val((currentRow.find("#package_length").val() * currentRow.find("#package_width").val() * currentRow.find("#package_height").val() / amount).toFixed(2))
  })
  $(document).on("input", '#package_length', function() {
    let amount = $('#curiour_amount').val()
    let currentRow = $(this).closest(".floor_field")
    currentRow.find("#weight_vol").val((currentRow.find("#package_length").val() * currentRow.find("#package_width").val() * currentRow.find("#package_height").val() / amount).toFixed(2))
  })
  $(document).on("input", '#package_width', function() {
    let amount = $('#curiour_amount').val()
    let currentRow = $(this).closest(".floor_field")
    currentRow.find("#weight_vol").val((currentRow.find("#package_length").val() * currentRow.find("#package_width").val() * currentRow.find("#package_height").val() / amount).toFixed(2))
  })
  $(document).on("input", '#package_height', function() {
    let amount = $('#curiour_amount').val()
    let currentRow = $(this).closest(".floor_field")
    currentRow.find("#weight_vol").val((currentRow.find("#package_length").val() * currentRow.find("#package_width").val() * currentRow.find("#package_height").val() / amount).toFixed(2))
  })
  $(document).on('click', '#customer_product_btn', function() {
    let amount = $('#curiour_amount').val()
    let package_name = 0;
    $('.package_name').each(function() {
      if ($(this).val() == "") {
        package_name += parseFloat(1);
      }
    });
    let package_Amouunt = 0;
    $('.package_Amouunt').each(function() {
      if ($(this).val() == "0" || $(this).val() == "") {
        package_Amouunt += parseFloat(1);
      }
    });
    let package_weight = 0;
    $('.package_weight').each(function() {
      if ($(this).val() == "0" || $(this).val() == "") {
        package_weight += parseFloat(1);
      }
    });
    let package_length = 0;
    $('.package_length').each(function() {
      if ($(this).val() == "0" || $(this).val() == "") {
        package_length += parseFloat(1);
      }
    });
    let package_width = 0;
    $('.package_width').each(function() {
      if ($(this).val() == "0" || $(this).val() == "") {
        package_width += parseFloat(1);
      }
    });
    let package_height = 0;
    $('.package_height').each(function() {
      if ($(this).val() == "0" || $(this).val() == "") {
        package_height += parseFloat(1);
      }
    });
    let weight_units = $('#weight_units').val()
    if (amount <= "0") {
      toastr.error(language.script_amount + '.')
    } else if (amount == "") {
      toastr.error(language.script_amount + '.')
    } else {
      let customer_detail_check
      if (package_name >= "1") {
        customer_detail_check = 0;
      } else if (package_Amouunt >= "1") {
        customer_detail_check = 0;
      } else if (package_weight >= "1") {
        customer_detail_check = 0;
      } else if (package_length >= "1") {
        customer_detail_check = 0;
      } else if (package_width >= "1") {
        customer_detail_check = 0;
      } else if (package_height >= "1") {
        customer_detail_check = 0;
      } else {
        customer_detail_check = 1;
      }
      if (customer_detail_check == "0") {
        $("#product_input_error").addClass('d-none').text("")
        $("#product_weight_error").addClass('d-none').text("")
        $("#details_input_error").removeClass('d-none')
      } else if (customer_detail_check == "1") {
        $("#product_input_error").addClass('d-none').text("")
        $("#product_weight_error").addClass('d-none').text("")
        $("#details_input_error").addClass('d-none')
        let weight_vol = 0;
        $('.package_weight').each(function() {
          weight_vol += parseFloat($(this).val());
        });
        let tot_weight = 0;
        $('.weight_vol').each(function() {
          tot_weight += parseFloat($(this).val());
        });
        $("#tot_weight").attr('value', weight_vol)
        $("#tot_weight_vol").attr('value', tot_weight.toFixed(2))
        const base_url = window.location.origin;
        $.ajax({
          url: base_url + '/packers_and_movers/check_addresh/ajex',
          type: 'POST',
          dataType: 'JSON',
          data: {
            weight_vol
          },
          success: function(res) {
            if (res.data == "success") {
              $("#details_error").addClass('d-none')
              $("#product_input_error").addClass('d-none').text("")
              $("#product_weight_error").addClass('d-none').text("")
              if (res.weight_error != "0") {
                $("#details_error").addClass('d-none')
                $("#product_input_error").addClass('d-none').text("")
                $("#product_weight_error").addClass('d-none').text("")
                if (res.addresh[0].start_weight_range < tot_weight && res.addresh[0].end_weight_range > tot_weight) {
                  $("#product_input_error").addClass('d-none').text("")
                  $("#product_weight_error").addClass('d-none').text("")
                  $("#customer_product_form").submit()
                } else {
                  $("#details_error").addClass('d-none')
                  $("#product_weight_error").addClass('d-none').text("")
                  $("#product_input_error").removeClass('d-none').text(language.Volumetric_Weight_must_be_between + ' ' + res.addresh[0].start_weight_range + '' + weight_units + ' ' + language.to + ' ' + res.addresh[0].end_weight_range + weight_units)
                }
              } else {
                $("#details_error").addClass('d-none')
                $("#product_input_error").addClass('d-none').text("")
                $("#product_weight_error").removeClass('d-none').text(language.Dead_Weight_must_be_between + ' ' + res.min + '' + weight_units + ' ' + language.to + ' ' + res.max + '' + weight_units)
              }
            } else {
              $("#product_weight_error").addClass('d-none').text("")
              $("#product_input_error").addClass('d-none').text("")
              $("#details_error").removeClass('d-none')
            }
          }
        });
      }
    }
  })
  // =============== Add Driver =============== //
  $(document).on('click', '#add_driver_click', function() {
    const base_url = window.location.origin;
    let data_id = $(this).attr('data-id')
    let carrier_id = $(this).attr('data-carrier')
    let order = $(this).attr('data-invoice')
    let order_id = data_id + ',' + order
    $.ajax({
      url: base_url + '/order/assigned_driver_ajex',
      type: 'POST',
      dataType: 'JSON',
      data: {
        data_id,
        carrier_id
      },
      success: function(res) {
        if (res.driver_chech != "0") {
          $("#order_adriver_cheack").addClass("d-none")
          $("#order_assigned_driver").removeClass("d-none")
          $('#add_driver_modal').attr('action', '/order/add_driver/' + order_id);
          if (res.auth_data.role == "1") {
            $("#order_assigned_driver").html('<option value selected disabled>' + language.Select_Driver + '</option>')
            $.each(res.driver_list, function(index, value) {
              $('#order_assigned_driver').append('<option value="' + value.id + '">' + value.first_name + ' ' + value.last_name + '</option>');
            });
          }
        } else {
          $("#order_assigned_driver").addClass("d-none")
          $("#order_adriver_cheack").removeClass("d-none")
        }
      }
    });
  })
  // =============== Add Driver Details =============== //
  $(document).on('click', '#add_driver_btn', function() {
    $("#driver_list").addClass("d-none")
    $("#show_add_driver").removeClass("d-none")
    $("#show_edit_driver").addClass("d-none")
  })
  $(document).on('click', '#show_driver_btn', function() {
    $("#driver_list").removeClass("d-none")
    $("#show_add_driver").addClass("d-none")
    $("#show_edit_driver").addClass("d-none")
  })
  $(document).on('click', "#driver_detail_check_btn", function() {
    let fname = $("#driver_first_name").val()
    let lname = $("#driver_last_name").val()
    let phone = $("#driver_phone").val()
    let email = $("#driver_signup_email").val()
    let country_code = $("#driver_country_code").val()
    let license_no = $("#driver_License_no").val()
    let password = $("#driver_password").val()
    const base_url = window.location.origin;
    if (fname == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else if (lname == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else if (phone == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else if (email == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else if (country_code == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else if (license_no == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else if (password == "") {
      $("#check_driver_detail_error").removeClass("d-none")
    } else {
      $("#check_driver_detail_error").addClass("d-none")
      $.ajax({
        url: base_url + '/driver_check',
        type: 'POST',
        dataType: 'JSON',
        data: {
          phone,
          email
        },
        success: function(res) {
          if (res.email == "1") {
            $("#driver_email_error").removeClass("d-none")
          } else {
            $("#driver_email_error").addClass("d-none")
          }
          if (res.phone == "1") {
            $("#driver_phone_error").removeClass("d-none")
          } else {
            $("#driver_phone_error").addClass("d-none")
          }
          if (res.email == "0" && res.phone == "0") {
            $("#driver_from_click").submit()
          }
        }
      });
    }
  })
  $(document).on("click", "#edit_driver_detail", function() {
    $("#driver_list").addClass("d-none")
    $("#show_add_driver").addClass("d-none")
    $("#show_edit_driver").removeClass("d-none")
    let data_id = $(this).attr("data-id")
    let data_fname = $(this).attr("data-fname")
    let data_lname = $(this).attr("data-lname")
    let data_email = $(this).attr("data-email")
    let data_country_code = $(this).attr("data-country_code")
    let data_phone = $(this).attr("data-phone")
    let data_license = $(this).attr("data-license")
    $("#edit_driver_from_click").attr('action', '/edit_carrier_driver/' + data_id)
    $("#edit_driver_first_name").attr('value', data_fname)
    $("#edit_driver_last_name").attr('value', data_lname)
    $("#edit_driver_signup_email").attr('value', data_email)
    $("#edit_driver_signup_email_val").attr('value', data_email)
    $("#edit_driver_phone").attr('value', data_phone)
    $("#edit_driver_phone_vol").attr('value', data_phone)
    $("#edit_driver_License_no").attr('value', data_license)
    $("#edit_driver_country_code").select2().val(data_country_code).trigger('change')
  })
  $(document).on('click', '#edit_driver_detail_check_btn', function() {
    const base_url = window.location.origin;
    let data_email = $("#edit_driver_signup_email").val()
    let data_phone = $("#edit_driver_phone").val()
    let email_phone = 0;
    let email_id = 0;
    let phone_id = 0;
    if ($("#edit_driver_signup_email_val").val() != $("#edit_driver_signup_email").val() && $("#edit_driver_phone").val() != $("#edit_driver_phone_vol").val()) {
      email_phone = 1;
    }
    if ($("#edit_driver_signup_email_val").val() != $("#edit_driver_signup_email").val()) {
      email_id = 1;
    }
    if ($("#edit_driver_phone").val() != $("#edit_driver_phone_vol").val()) {
      phone_id = 1;
    }
    $.ajax({
      url: base_url + '/edit_driver_check',
      type: 'POST',
      dataType: 'JSON',
      data: {
        data_email,
        data_phone,
        email_phone,
        email_id,
        phone_id
      },
      success: function(res) {
        if (res.email == "1") {
          $("#edit_driver_email_error").removeClass("d-none")
        } else {
          $("#edit_driver_email_error").addClass("d-none")
        }
        if (res.phone == "1") {
          $("#edit_driver_phone_error").removeClass("d-none")
        } else {
          $("#edit_driver_phone_error").addClass("d-none")
        }
        if (res.email == "0" && res.phone == "0") {
          $("#edit_driver_from_click").submit()
        }
      }
    });
  })
  // =============== Lnaguage =============== //
  if ($("#hidden_lang").val() == 'in') {
    $("#in").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'de') {
    $("#de").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'en') {
    $("#en").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'pt') {
    $("#pt").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'es') {
    $("#es").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'fr') {
    $("#fr").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'cn') {
    $("#cn").addClass("bg-primary")
  } else if ($("#hidden_lang").val() == 'ae') {
    $("#ae").addClass("bg-primary")
    $("html").attr("dir", "rtl")
  }
  if ($("#hidden_frontend_lang").val() == 'in') {
    $("#frontend_in").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'de') {
    $("#frontend_de").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'en') {
    $("#frontend_en").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'pt') {
    $("#frontend_pt").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'es') {
    $("#frontend_es").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'fr') {
    $("#frontend_fr").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'cn') {
    $("#frontend_cn").addClass("bg-primary")
  } else if ($("#hidden_frontend_lang").val() == 'ae') {
    $("#frontend_ae").addClass("bg-primary")
  }
  $(document).on("click", ".lang", function() {
    let lang = $(this).attr("data-value")
    let base_url = window.location.origin;
    $.ajax({
      url: base_url + "/lang/" + lang,
      type: "POST",
      dataType: "JSON",
      success: function(res) {
        location.reload();
      }
    })
  })
  // =============== Customer Details Check =============== //
  $(document).on("click", "#customer_add_btn", function() {
    let base_url = window.location.origin;
    let first = $("#add_customer_First").val()
    let last = $("#add_customer_Last").val()
    let email = $("#add_customer_email").val()
    let phone = $("#add_customer_phoneno").val()
    let code = $("#add_customer_code").val()
    if (first == "") {
      $("#customer_details_error").removeClass("d-none")
    } else if (last == "") {
      $("#customer_details_error").removeClass("d-none")
    } else if (email == "") {
      $("#customer_details_error").removeClass("d-none")
    } else if (phone == "") {
      $("#customer_details_error").removeClass("d-none")
    } else if (code == null) {
      $("#customer_details_error").removeClass("d-none")
    } else {
      $("#customer_details_error").addClass("d-none")
      $.ajax({
        url: base_url + '/user/customer_ajex',
        type: 'POST',
        dataType: 'JSON',
        data: {
          email,
          phone
        },
        success: function(res) {
          let customer_email = 0;
          let customer_phone = 0;
          if (res.customer_data == "" && res.admin_data == "") {
            customer_email = 1;
            $("#customer_email_error").addClass("d-none")
          } else {
            toastr.error(language.This_Email_Id_Already_Registered + '.')
            $("#customer_email_error").removeClass("d-none")
          }
          if (res.customer_data_ph == "" && res.admin_data_ph == "") {
            customer_phone = 1;
            $("#customer_phoneno_error").addClass("d-none")
          } else {
            toastr.error(language.This_Phone_No_Already_Registered + '.')
            $("#customer_phoneno_error").removeClass("d-none")
          }
          if (customer_email == "1" && customer_phone == "1") {
            $("#admin_customer_form").submit()
          }
        }
      });
    }
  })
  $(document).on("click", "#admin_edit_cust_btn", function() {
    let base_url = window.location.origin;
    let email = $("#edit_admin_email").val()
    let val_email = $("#val_edit_admin_email").val()
    let phone = $("#edit_admin_phone").val()
    let val_phone = $("#val_edit_admin_phone").val()
    $.ajax({
      url: base_url + '/user/customer_ajex',
      type: 'POST',
      dataType: 'JSON',
      data: {
        email,
        phone
      },
      success: function(res) {
        let customer_email = 0;
        let customer_phone = 0;
        if (email == val_email) {
          customer_email = 1;
        }
        if (email != val_email) {
          if (res.customer_data == "" && res.admin_data == "") {
            customer_email = 1;
            $("#edit_customer_email_error").addClass("d-none")
          } else {
            toastr.error(language.This_Email_Id_Already_Registered + '.')
            $("#edit_customer_email_error").removeClass("d-none")
          }
        }
        if (phone == val_phone) {
          customer_phone = 1;
        }
        if (phone != val_phone) {
          if (res.customer_data_ph == "" && res.admin_data_ph == "") {
            customer_phone = 1;
            $("#edit_customer_phone_error").addClass("d-none")
          } else {
            toastr.error(language.This_Phone_No_Already_Registered + '.')
            $("#edit_customer_phone_error").removeClass("d-none")
          }
        }
        if (customer_phone == "1" && customer_email == "1") {
          $("#edit_admin_customer_form").submit()
        }
      }
    });
  })
  // =============== Aad carrier Detail =============== //
  $(document).on("click", "#carrier_detail_check", function() {
    let first = $("#driver_first").val()
    let last = $("#driver_last").val()
    let email = $("#driver_email").val()
    let linumber = $("#driver_linumber").val()
    let code = $("#driver_code").val()
    let phone = $("#driver_phone").val()
    let zone = $("#driver_zone").val()
    let commission = $("#driver_commission").val()
    let withdraw = $("#driver_withdraw").val()
    let base_url = window.location.origin;
    if (first == "") {
      $("#carrier_details_error").removeClass("d-none")
    } else if (last == "") {
      $("#carrier_details_error").removeClass("d-none")
    } else if (email == "") {
      $("#carrier_details_error").removeClass("d-none")
    } else if (linumber == "") {
      $("#carrier_details_error").removeClass("d-none")
    } else if (code == null) {
      $("#carrier_details_error").removeClass("d-none")
    } else if (phone == "") {
      $("#carrier_details_error").removeClass("d-none")
    } else if (zone == null) {
      $("#carrier_details_error").removeClass("d-none")
    } else if (commission <= "0") {
      $("#carrier_details_error").removeClass("d-none")
    } else if (withdraw <= "0") {
      $("#carrier_details_error").removeClass("d-none")
    } else {
      $("#carrier_details_error").addClass("d-none")
      $.ajax({
        url: base_url + '/user/carrier_ajex',
        type: 'POST',
        dataType: 'JSON',
        data: {
          email,
          phone
        },
        success: function(res) {
          let carrier_email = 0;
          let carrier_phone = 0;
          if (res.carrier_data == "" && res.admin_data == "") {
            carrier_email = 1;
            $("#carrier_email_error").addClass("d-none")
          } else {
            toastr.error(language.This_Email_Id_Already_Registered + '.')
            $("#carrier_email_error").removeClass("d-none")
          }
          if (res.customer_data_ph == "" && res.admin_data_ph == "") {
            carrier_phone = 1;
            $("#carrier_phoneno_error").addClass("d-none")
          } else {
            toastr.error(language.This_Phone_No_Already_Registered + '.')
            $("#carrier_phoneno_error").removeClass("d-none")
          }
          if (carrier_email == "1" && carrier_phone == "1") {
            $("#carrier_form_click").submit()
          }
        }
      });
    }
  })
  $(document).on("click", "#edit_carrier_details", function() {
    let email = $("#email").val()
    let email_val = $("#edit_email").val()
    let phone = $("#phone_no").val()
    let phone_val = $("#edit_phone_no").val()
    let base_url = window.location.origin;
    $.ajax({
      url: base_url + '/user/carrier_ajex',
      type: 'POST',
      dataType: 'JSON',
      data: {
        email,
        phone
      },
      success: function(res) {
        let carrier_email = 0;
        let carrier_phone = 0;
        if (email == email_val) {
          carrier_email = 1;
        }
        if (email != email_val) {
          if (res.carrier_data == "" && res.admin_data == "") {
            carrier_email = 1;
            $("#edit_carrier_email_error").addClass("d-none")
          } else {
            toastr.error(language.This_Email_Id_Already_Registered + '.')
            $("#edit_carrier_email_error").removeClass("d-none")
          }
        }
        if (phone == phone_val) {
          carrier_phone = 1;
        }
        if (phone != phone_val) {
          if (res.customer_data_ph == "" && res.admin_data_ph == "") {
            carrier_phone = 1;
            $("#edit_carrier_phoneno_error").addClass("d-none")
          } else {
            toastr.error(language.This_Phone_No_Already_Registered + '.')
            $("#edit_carrier_phoneno_error").removeClass("d-none")
          }
        }
        if (carrier_email == "1" && carrier_phone == "1") {
          $("#edit_id").submit()
        }
      }
    });
  })
  // =============== Cash Payment =============== //
  $(document).on('click', '#order_add_payment', function() {
    let data_id = $(this).attr('data-id');
    let data_order = $(this).attr('data-order');
    let data_total = $(this).attr('data-total');
    let data_paid = $(this).attr('data-paid');
    let data_differ = $(this).attr('data-differ');
    let data_module = $(this).attr('data-module');
    let paid_amount;
    if (parseFloat(data_total) > parseFloat(data_paid)) {
      paid_amount = (parseFloat(data_total) - parseFloat(data_paid)).toFixed(2)
    } else {
      paid_amount = 0;
    }
    if (data_module == "2") {
      $('#order_auotation').removeClass('d-none')
    }
    $('#order_auotation').addClass('d-none')
    $('#order_amount_id').text(data_order)
    $('#order_tot').text(data_total)
    $('#order_paid').text(data_paid)
    $('#order_quotation').text(data_differ)
    $('#order_due').text(paid_amount)
    $('#order_due_input').val(paid_amount)
    $('#order_payment_form').attr('action', '/order/order_payment/' + data_id)
    currency()
    thousands_separators()
  })
  $(document).on('click', '#order_payment_btn', function() {
    let amount = $('#order_due_input').val()
    let input_amount = $('#order_enter_amount').val()
    if (input_amount == '0') {
      $('#order_inpt_error').removeClass('d-none')
      $('#order_amount_error').addClass('d-none')
    } else {
      $('#order_inpt_error').addClass('d-none')
      if (amount < input_amount) {
        $('#order_amount_error').removeClass('d-none')
        $('#order_inpt_error').addClass('d-none')
      } else {
        $('#order_amount_error').addClass('d-none')
        $('#order_inpt_error').addClass('d-none')
        $('#order_payment_form').submit();
      }
    }
  })
  // =============== Customer Payment =============== //
  $(document).on('click', '#customer_das_payment_btn', function(){
        let payment_id = $('#add_payment_method').select().val()
        let order_id = $('#hidden_orderid').val()
        let due_amount = $('#hidden_order_tot').val()
        let type = 0;
        if (payment_id == "3") {
          $('#coustomer_account_payment').addClass('d-none')
          $('#customer_cash_payment').attr('action', '/packers_and_movers/customer_post_payment/' + type +','+payment_id+','+order_id)
          $('#customer_cash_payment').submit();
        } else if(payment_id == "4") {
          $('#coustomer_account_payment').addClass('d-none')
          $('#customer_tot_paystack').val(due_amount)
          $('#customer_order_paystack').val(order_id)
          $('#customer_pay_paystack').val(payment_id)
          $('#customer_paystack').submit()
        } else if(payment_id == '5') {
          $('#coustomer_account_payment').addClass('d-none')
          $('#customer_tot_paypal').val(due_amount)
          $('#customer_order_paypal').val(order_id)
          $('#customer_pay_paypal').val(payment_id)
          $('#customer_paypal').submit()
        } else if(payment_id == "6") {
          $('#coustomer_account_payment').addClass('d-none')
          $('#customer_tot_razorpay').val(due_amount)
          $('#customer_order_razorpay').val(order_id)
          $('#customer_pay_razorpay').val(payment_id)
          $('#customer_pazorpay_btn').submit()
        } else if(payment_id == "7") {
          $('#customer_order_account').val(order_id)
          $('#customer_pay_account').val(payment_id)
          $('#coustomer_account_payment').removeClass('d-none')
          let img = $('#coustomer_payment_img').val()
          if (img == "") {
            $('#customer_payment_ing_error').removeClass('d-none')
          } else {
            $('#customer_payment_ing_error').addClass('d-none')
            $('#coustomer_payment_image_submit').attr('action', '/packers_and_movers/customer_post_payment/' + type +','+payment_id+','+order_id)
            $('#coustomer_payment_image_submit').submit()
          }
        } else if(payment_id == "8") {
          $('#coustomer_account_payment').addClass('d-none')
          $('#customer_tot_stripe').val(due_amount)
          $('#customer_order_stripe').val(order_id)
          $('#customer_pay_stripe').val(payment_id)
          $('#customer_dashboard_stripe').submit()
        }
      })
  // =============== Create Admin =============== //
  $(document).on('click', '#role_submit_btn', function() {
    let first = $('#role_sub_first').val()
    let last = $('#role_sub_last').val()
    let email = $('#role_sub_email').val()
    let code = $('#role_sub_code').val()
    let phone = $('#role_sub_phone').val()
    let password = $('#role_sub_password').val()
    let status = $('#role_sub_status').val()
    $('#role_email_error').addClass('d-none')
    $('#role_phone_error').addClass('d-none')
    if (first == "") {
      $('#role_input_error').removeClass('d-none')
    } else if (last == "") {
      $('#role_input_error').removeClass('d-none')
    } else if (email == "") {
      $('#role_input_error').removeClass('d-none')
    } else if (code == null) {
      $('#role_input_error').removeClass('d-none')
    } else if (phone == "") {
      $('#role_input_error').removeClass('d-none')
    } else if (password == "") {
      $('#role_input_error').removeClass('d-none')
    } else if (status == "null") {
      $('#role_input_error').removeClass('d-none')
    } else {
      $('#role_input_error').addClass('d-none')
      const base_url = window.location.origin;
      $.ajax({
        url: base_url + '/role/detail_check_ejax',
        type: 'POST',
        dataType: 'JSON',
        data: {
          email,
          phone,
          type: 1
        },
        success: function(res) {
          if (res.email == 1 && res.phone == 1) {
            $('#role_email_error').removeClass('d-none')
            $('#role_phone_error').removeClass('d-none')
          } else if (res.email == 1) {
            $('#role_email_error').removeClass('d-none')
          } else if (res.phone == 1) {
            $('#role_phone_error').removeClass('d-none')
          } else {
            $('#role_email_error').addClass('d-none')
            $('#role_phone_error').addClass('d-none')
            $('#role_submit_form').submit()
          }
        }
      });
    }
  })
  $(document).on('click', '#edit_role_permission', function() {
    let id = $(this).attr("data-id");
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/role/role_ajax',
      type: 'POST',
      dataType: 'JSON',
      data: {
        id
      },
      success: function(res) {
        $('#edit_role_form').attr('action', '/role/edit_role_detail/' + id)
        $("#edit_first_name").val(res.role.first_name)
        $("#edit_last_name").val(res.role.last_name)
        $("#edit_role_email").val(res.role.email)
        $("#edit_d_role_email").val(res.role.email)
        $("#edit_role_country_code").select2().val(res.role.country_code).trigger('change')
        $("#edit_phone_no").val(res.role.phone_no)
        $("#edit_d_phone_no").val(res.role.phone_no)
        $("#Select_Status").select2().val(res.role.status).trigger('change')
        res.role.order_per.split(",")[0] == "1" ? $(".order_view").prop("checked", true) : $(".order_view").prop("checked", false);
        res.role.order_per.split(",")[1] == "1" ? $(".order_edit").prop("checked", true) : $(".order_edit").prop("checked", false);
        res.role.customer.split(",")[0] == "1" ? $(".customer_view").prop("checked", true) : $(".customer_view").prop("checked", false);
        res.role.customer.split(",")[1] == "1" ? $(".customer_add").prop("checked", true) : $(".customer_add").prop("checked", false);
        res.role.customer.split(",")[2] == "1" ? $(".customer_edit").prop("checked", true) : $(".customer_edit").prop("checked", false);
        res.role.carrier.split(",")[0] == "1" ? $(".carrier_view").prop("checked", true) : $(".carrier_view").prop("checked", false);
        res.role.carrier.split(",")[1] == "1" ? $(".carrier_add").prop("checked", true) : $(".carrier_add").prop("checked", false);
        res.role.carrier.split(",")[2] == "1" ? $(".carrier_edit").prop("checked", true) : $(".carrier_edit").prop("checked", false);
        res.role.category.split(",")[0] == "1" ? $(".category_view").prop("checked", true) : $(".category_view").prop("checked", false);
        res.role.category.split(",")[1] == "1" ? $(".category_add").prop("checked", true) : $(".category_add").prop("checked", false);
        res.role.category.split(",")[2] == "1" ? $(".category_edit").prop("checked", true) : $(".category_edit").prop("checked", false);
        res.role.subcategory.split(",")[0] == "1" ? $(".subcategory_view").prop("checked", true) : $(".subcategory_view").prop("checked", false);
        res.role.subcategory.split(",")[1] == "1" ? $(".subcategory_add").prop("checked", true) : $(".subcategory_add").prop("checked", false);
        res.role.subcategory.split(",")[2] == "1" ? $(".subcategory_edit").prop("checked", true) : $(".subcategory_edit").prop("checked", false);
        res.role.product.split(",")[0] == "1" ? $(".product_view").prop("checked", true) : $(".product_view").prop("checked", false);
        res.role.product.split(",")[1] == "1" ? $(".product_add").prop("checked", true) : $(".product_add").prop("checked", false);
        res.role.product.split(",")[2] == "1" ? $(".product_edit").prop("checked", true) : $(".product_edit").prop("checked", false);
        res.role.coupon.split(",")[0] == "1" ? $(".coupon_view").prop("checked", true) : $(".coupon_view").prop("checked", false);
        res.role.coupon.split(",")[1] == "1" ? $(".coupon_add").prop("checked", true) : $(".coupon_add").prop("checked", false);
        res.role.coupon.split(",")[2] == "1" ? $(".coupon_edit").prop("checked", true) : $(".coupon_edit").prop("checked", false);
        res.role.payment.split(",")[0] == "1" ? $(".payment_view").prop("checked", true) : $(".payment_view").prop("checked", false);
        res.role.payment.split(",")[1] == "1" ? $(".payment_edit").prop("checked", true) : $(".payment_edit").prop("checked", false);
        res.role.location.split(",")[0] == "1" ? $(".location_view").prop("checked", true) : $(".location_view").prop("checked", false);
        res.role.location.split(",")[1] == "1" ? $(".location_add").prop("checked", true) : $(".location_add").prop("checked", false);
        res.role.location.split(",")[2] == "1" ? $(".location_edit").prop("checked", true) : $(".location_edit").prop("checked", false);
        res.role.payout.split(",")[0] == "1" ? $(".payout_view").prop("checked", true) : $(".payout_view").prop("checked", false);
        res.role.payout.split(",")[1] == "1" ? $(".payout_edit").prop("checked", true) : $(".payout_edit").prop("checked", false);
        res.role.report.split(",")[0] == "1" ? $(".report_view").prop("checked", true) : $(".report_view").prop("checked", false);
        res.role.General.split(",")[0] == "1" ? $(".General_view").prop("checked", true) : $(".General_view").prop("checked", false);
        res.role.General.split(",")[1] == "1" ? $(".General_edit").prop("checked", true) : $(".General_edit").prop("checked", false);
        res.role.Shift.split(",")[0] == "1" ? $(".Shift_view").prop("checked", true) : $(".Shift_view").prop("checked", false);
        res.role.Shift.split(",")[1] == "1" ? $(".Shift_add").prop("checked", true) : $(".Shift_add").prop("checked", false);
        res.role.Shift.split(",")[2] == "1" ? $(".Shift_edit").prop("checked", true) : $(".Shift_edit").prop("checked", false);
        res.role.Time.split(",")[0] == "1" ? $(".Time_view").prop("checked", true) : $(".Time_view").prop("checked", false);
        res.role.Time.split(",")[1] == "1" ? $(".Time_add").prop("checked", true) : $(".Time_add").prop("checked", false);
        res.role.Time.split(",")[2] == "1" ? $(".Time_edit").prop("checked", true) : $(".Time_edit").prop("checked", false);
        res.role.delivery.split(",")[0] == "1" ? $(".delivery_view").prop("checked", true) : $(".delivery_view").prop("checked", false);
        res.role.delivery.split(",")[1] == "1" ? $(".delivery_add").prop("checked", true) : $(".delivery_add").prop("checked", false);
        res.role.delivery.split(",")[2] == "1" ? $(".delivery_edit").prop("checked", true) : $(".delivery_edit").prop("checked", false);
        res.role.Pricing.split(",")[0] == "1" ? $(".Pricing_view").prop("checked", true) : $(".Pricing_view").prop("checked", false);
        res.role.Pricing.split(",")[1] == "1" ? $(".Pricing_edit").prop("checked", true) : $(".Pricing_edit").prop("checked", false);
        res.role.Distance.split(",")[0] == "1" ? $(".Distance_view").prop("checked", true) : $(".Distance_view").prop("checked", false);
        res.role.Distance.split(",")[1] == "1" ? $(".Distance_add").prop("checked", true) : $(".Distance_add").prop("checked", false);
        res.role.Distance.split(",")[2] == "1" ? $(".Distance_edit").prop("checked", true) : $(".Distance_edit").prop("checked", false);
        res.role.Shipping.split(",")[0] == "1" ? $(".Shipping_view").prop("checked", true) : $(".Shipping_view").prop("checked", false);
        res.role.Shipping.split(",")[1] == "1" ? $(".Shipping_edit").prop("checked", true) : $(".Shipping_edit").prop("checked", false);
        res.role.Insurance.split(",")[0] == "1" ? $(".Insurance_view").prop("checked", true) : $(".Insurance_view").prop("checked", false);
        res.role.Insurance.split(",")[1] == "1" ? $(".Insurance_add").prop("checked", true) : $(".Insurance_add").prop("checked", false);
        res.role.Insurance.split(",")[2] == "1" ? $(".Insurance_edit").prop("checked", true) : $(".Insurance_edit").prop("checked", false);
        res.role.Zone.split(",")[0] == "1" ? $(".Zone_view").prop("checked", true) : $(".Zone_view").prop("checked", false);
        res.role.Zone.split(",")[1] == "1" ? $(".Zone_add").prop("checked", true) : $(".Zone_add").prop("checked", false);
        res.role.Zone.split(",")[2] == "1" ? $(".Zone_edit").prop("checked", true) : $(".Zone_edit").prop("checked", false);
        res.role.module_per.split(",")[0] == "1" ? $(".Module_view").prop("checked", true) : $(".Module_view").prop("checked", false);
        res.role.module_per.split(",")[1] == "1" ? $(".Module_edit").prop("checked", true) : $(".Module_edit").prop("checked", false);
        res.role.cus_exp.split(",")[0] == "1" ? $(".cus_exp_view").prop("checked", true) : $(".cus_exp_view").prop("checked", false);
        res.role.cus_exp.split(",")[1] == "1" ? $(".cus_exp_add").prop("checked", true) : $(".cus_exp_add").prop("checked", false);
        res.role.cus_exp.split(",")[2] == "1" ? $(".cus_exp_edit").prop("checked", true) : $(".cus_exp_edit").prop("checked", false);
        res.role.FAQ.split(",")[0] == "1" ? $(".FAQ_view").prop("checked", true) : $(".FAQ_view").prop("checked", false);
        res.role.FAQ.split(",")[1] == "1" ? $(".FAQ_add").prop("checked", true) : $(".FAQ_add").prop("checked", false);
        res.role.FAQ.split(",")[2] == "1" ? $(".FAQ_edit").prop("checked", true) : $(".FAQ_edit").prop("checked", false);
        res.role.policy.split(",")[0] == "1" ? $(".policy_view").prop("checked", true) : $(".policy_view").prop("checked", false);
        res.role.policy.split(",")[1] == "1" ? $(".policy_add").prop("checked", true) : $(".policy_add").prop("checked", false);
        res.role.policy.split(",")[2] == "1" ? $(".policy_edit").prop("checked", true) : $(".policy_edit").prop("checked", false);
        res.role.social.split(",")[0] == "1" ? $(".social_view").prop("checked", true) : $(".social_view").prop("checked", false);
        res.role.social.split(",")[1] == "1" ? $(".social_add").prop("checked", true) : $(".social_add").prop("checked", false);
        res.role.social.split(",")[2] == "1" ? $(".social_edit").prop("checked", true) : $(".social_edit").prop("checked", false);
      }
    });
  })
  $(document).on('click', '#role_edit_submit_btn', function() {
    let inpout_email = $('#edit_role_email').val()
    let inpout_email_d = $('#edit_d_role_email').val()
    let inpout_phone = $('#edit_phone_no').val()
    let inpout_phone_d = $('#edit_d_phone_no').val()
    const base_url = window.location.origin;
    let email = 0;
    let phone = 0;
    if (inpout_email != inpout_email_d && inpout_phone != inpout_phone_d) {
      email = 1;
      phone = 1;
    } else if (inpout_email != inpout_email_d) {
      email = 1;
    } else if (inpout_phone != inpout_phone_d) {
      phone = 1;
    }
    $('#role_edit_email_error').addClass('d-none')
    $('#role_edit_phone_error').addClass('d-none')
    if (email == 1 || phone == 1) {
      $.ajax({
        url: base_url + '/role/detail_check_ejax',
        type: 'POST',
        dataType: 'JSON',
        data: {
          inpout_email,
          inpout_phone,
          email,
          phone,
          type: 2
        },
        success: function(res) {
          if (res.email == 1 && res.phone == 1) {
            $('#role_edit_email_error').removeClass('d-none')
            $('#role_edit_phone_error').removeClass('d-none')
          } else if (res.email == 1) {
            $('#role_edit_email_error').removeClass('d-none')
          } else if (res.phone == 1) {
            $('#role_edit_phone_error').removeClass('d-none')
          } else {
            $('#role_edit_email_error').addClass('d-none')
            $('#role_edit_phone_error').addClass('d-none')
            $('#edit_role_form').submit()
          }
        }
      });
    } else {
      $('#edit_role_form').submit()
    }
  })
  // =============== Shipping Calculate =============== //
  function shipping_module(module) {
    if (module == "1" || module == "3") {
      $("#calcu_unit_price").val("")
      $("#calcu_weight").val("")
      $("#calcu_length").val("")
      $("#calcu_Width").val("")
      $("#calcu_Height").val("")
      $("#calcu_Weight_Vol").val("")
      $(".shipping_insurance").prop("checked", false)
      $(".delivery_radio").prop("checked", false)
      $(".shi_pickup_ele_ckeck").prop("checked", false)
      $(".shi_deliver_ele_ckeck").prop("checked", false)
      $("#shi_pick_floor option:selected").prop("selected", false);
      $("#shi_deli_floor option:selected").prop("selected", false);
      $('#shipping_main').addClass('d-none')
      $('#shipping_pam_card').addClass('d-none')
    } else if (module == "2") {
      $('.shipping_pro_qty').each(function() {
        if ($(this).html() != "0") {
          $(this).html(0)
        }
      });
      $("#subcategory_price").val(0)
      $('#shipping_product_price').val(0)
      $(".shiftr_pam_radio").prop("checked", false)
      $('.time').each(function() {
        $(this).removeClass('b-primary border-2');
      });
      $(".shipping_insurance_pam").prop("checked", false)
      $(".delivery_radio_pam").prop("checked", false)
      $(".shi_pickup_pam_ckeck").prop("checked", false)
      $(".shi_deliver_pam_ckeck").prop("checked", false)
      $("#shi_pick_pam_floor option:selected").prop("selected", false);
      $("#shi_deli_floor_pam option:selected").prop("selected", false);
      $('#shipping_main').addClass('d-none')
      $('#shipping_pam_card').addClass('d-none')
    }
  }
  $(document).on('click', '#shipping_domestic_btn', function() {
    $('#shipping_main').removeClass('d-none')
    $('#shipping_pam_card').addClass('d-none')
    let mod = $('#dynamic_table').val()
    let module, amount
    if (mod == "" || mod == "1") {
      module = 1
      amount = $("#shipping_rate_cur").val()
    } else if (mod == "3" || mod == 3) {
      module = 3
      amount = $("#shipping_rate_int").val()
    }
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/shipping_type',
      type: 'POST',
      dataType: 'JSON',
      data: {
        module,
        amount
      },
      success: function(res) {
        // $("#shipping_lwh_amount").html(language.Weight_Vol +' <div class="custom_tooltip shipping_flor mx-1"><i class="fa fa-info-circle "></i><span class="tooltiptext p-1" style="width: 150px;">' +language.L_x_W_x_H+' / '+amount+'<span ></span> </span></div>')
        if (module == "1") {
          $("#shipping_lwh_amount1").removeClass("d-none")
          $("#shipping_lwh_amount2").addClass("d-none")
        } else if (module == "3") {
          $("#shipping_lwh_amount1").addClass("d-none")
          $("#shipping_lwh_amount2").removeClass("d-none")
        }
        $('#shipping_delivert_type').html("");
        $.each(res.delivery_type_list, function(index, value) {
          $('#shipping_delivert_type').append('<div class="shipp_radio_click">' + '<input class="delivery_radio" id="inline-sqr-1" value="' + value.price + '" data-price="' + value.price + '" name="shipping_type_list" type="radio">' + '<label class="shipping_flor col-form-label p-l-10">' + value.type + '&nbsp;</label>' + '<label class="shipping_flor col-form-label mb-0 invosymbol">' + value.price + '&nbsp;</label>' + '<label class="shipping_flor col-form-label mb-0">' + value.sub_type + '</label>' + '<br>' + '</div>');
        });
        currency()
        thousands_separators()
      }
    });
  })
  $(document).on('input', '#calcu_length', function() {
    let weight_units = $('#weight_units').val()
    let module = $('#dynamic_table').val()
    let amount;
    if (module == "" || module == "1") {
      amount = $("#shipping_rate_cur").val()
    } else {
      amount = $("#shipping_rate_int").val()
    }
    let volumetric_tot = ($('#calcu_length').val() * $('#calcu_Width').val() * $('#calcu_Height').val() / amount).toFixed(2)
    $('#volu_tot_weight').val(volumetric_tot)
    $('#calcu_Weight_Vol').val(volumetric_tot + ' ' + weight_units)
  })
  $(document).on('input', '#calcu_Width', function() {
    let weight_units = $('#weight_units').val()
    let module = $('#dynamic_table').val()
    let amount
    if (module == "" || module == "1") {
      amount = $("#shipping_rate_cur").val()
    } else {
      amount = $("#shipping_rate_int").val()
    }
    let volumetric_tot = ($('#calcu_length').val() * $('#calcu_Width').val() * $('#calcu_Height').val() / amount).toFixed(2)
    $('#volu_tot_weight').val(volumetric_tot)
    $('#calcu_Weight_Vol').val(volumetric_tot + ' ' + weight_units)
  })
  $(document).on('input', '#calcu_Height', function() {
    let weight_units = $('#weight_units').val()
    let module = $('#dynamic_table').val()
    let amount;
    if (module == "" || module == "1") {
      amount = $("#shipping_rate_cur").val()
    } else {
      amount = $("#shipping_rate_int").val()
    }
    let volumetric_tot = ($('#calcu_length').val() * $('#calcu_Width').val() * $('#calcu_Height').val() / amount).toFixed(2)
    $('#volu_tot_weight').val(volumetric_tot)
    $('#calcu_Weight_Vol').val(volumetric_tot + ' ' + weight_units)
  })
  $(document).on('click', '#shipping_calcualte_btn', function() {
    let mod = $('#dynamic_table').val()
    let module, pickup_address, delivery_address, amount
    if (mod == "" || mod == "1") {
      module = 1
      pickup_address = $('.shipping_carrier_one').val()
      delivery_address = $('.shipping_carrier_two').val()
      amount = $("#shipping_rate_cur").val()
    } else if (mod == "3" || mod == 3) {
      module = 3
      pickup_address = $(".shipping_inter_one").val()
      delivery_address = $("#hidden_delivered_international").select().val()
      amount = $("#shipping_rate_int").val()
    }
    let sp_lat = $(".shipp_cou_lat").val()
    let sp_lon = $(".shipp_cou_lon").val()
    let sd_lat = $(".shipp_cou_lat2").val()
    let sd_lon = $(".shipp_cou_lon2").val()
    let weight_tot = $("#calcu_weight").val()
    let weight_vol = $('#volu_tot_weight').val()
    let unit_price = $("#calcu_unit_price").val()
    let shi_insurance, delivery_type, pickup_checkbox, delivery_checkbox
    if ($('.shipping_insurance').is(":checked")) {
      shi_insurance = 1
    } else {
      shi_insurance = 0
    }
    if ($('.delivery_radio').is(":checked")) {
      delivery_type = $("input[name='shipping_type_list']:checked").val()
    } else {
      delivery_type = 0
    }
    if ($('.shi_pickup_ele_ckeck').is(":checked")) {
      pickup_checkbox = 1
    } else {
      pickup_checkbox = 0
    }
    if ($('.shi_deliver_ele_ckeck').is(":checked")) {
      delivery_checkbox = 1
    } else {
      delivery_checkbox = 0
    }
    let weight_units = $('#weight_units').val()
    let pickup_floor = $('#shi_pick_floor').select().val()
    let delivery_floor = $('#shi_deli_floor').select().val()
    const base_url = window.location.origin;
    if ($("#calcu_unit_price").val() == "" || $("#calcu_unit_price").val() == "0") {
      $("#shipping_lwh_error").removeClass('d-none')
    } else if ($("#calcu_weight").val() == "" || $("#calcu_weight").val() == "0") {
      $("#shipping_lwh_error").removeClass('d-none')
    } else if ($("#calcu_length").val() == "" || $("#calcu_length").val() == "0") {
      $("#shipping_lwh_error").removeClass('d-none')
    } else if ($("#calcu_Width").val() == "" || $("#calcu_Width").val() == "0") {
      $("#shipping_lwh_error").removeClass('d-none')
    } else if ($("#calcu_Height").val() == "" || $("#calcu_Height").val() == "0") {
      $("#shipping_lwh_error").removeClass('d-none')
    } else {
      $("#shipping_lwh_error").addClass('d-none')
      $.ajax({
        url: base_url + '/shipping_ajax',
        type: 'POST',
        dataType: 'JSON',
        data: {
          pickup_address,
          delivery_address,
          module,
          weight_vol,
          shi_insurance,
          delivery_type,
          pickup_checkbox,
          delivery_checkbox,
          pickup_floor,
          delivery_floor,
          weight_tot,
          unit_price,
          sp_lat,
          sp_lon,
          sd_lat,
          sd_lon,
          amount
        },
        success: function(res) {
          if (res.pickup_city == "0") {
            $("#shi_pic_city_error").removeClass("d-none")
            $("#shi_deliv_city_error").addClass("d-none")
            $("#shipping_rate_error").addClass('d-none').text("")
            $("#shipp_weight_error").addClass("d-none").text("")
          } else if (res.delivered_city == "0") {
            $("#shi_pic_city_error").addClass("d-none")
            $("#shi_deliv_city_error").removeClass("d-none")
            $("#shipping_rate_error").addClass('d-none').text("")
            $("#shipp_weight_error").addClass("d-none").text("")
          }
          if (res.pickup_city != "0" && res.delivered_city != "0") {
            if (res.weight_error != "0") {
              $("#shipp_weight_error").addClass("d-none").text("")
              $("#shipping_rate_error").addClass('d-none').text("")
              if (parseFloat(res.add_distance_rate[0].start_weight_range) < parseFloat(weight_vol) && parseFloat(res.add_distance_rate[0].end_weight_range) > parseFloat(weight_vol)) {
                $("#shipp_weight_error").addClass("d-none").text("")
                $("#shipping_rate_error").addClass('d-none').text("")
                $('#shipping_cal_btn_two').click()
                $("#shi_pic_city_error").addClass("d-none")
                $("#shi_deliv_city_error").addClass("d-none")
                $("#shippi_toolti_one").removeClass("d-none")
                $("#shippi_toolti_two").addClass("d-none")
                $("#shipp_amount_quoted").addClass('d-none')
                $("#shipp_pro_weight_price").removeClass('d-none')
                $("#shipp_show_weight").html(res.weight_data[0].price)
                if (module == "1") {
                  $("#shipp_dist_price").removeClass('d-none')
                  $("#shipp_dis").removeClass('d-none')
                  $("#shipp_dist_price").html(language.Distance + ' (' + res.shi_addresh_dis + ' KM)' + ' :&nbsp; ' + '<span class="invosymbol">' + res.address_price + '</span>')
                } else {
                  $("#shipp_dist_price").addClass('d-none')
                  $("#shipp_dis").addClass('d-none')
                }
                $("#ship_delivery_charge").html(res.add_distance_rate[0].Weight_rate)
                $('#ship_floor').html(res.pickup_floor + ' ' + language.Floor_Price_for_Pickup + ' :&nbsp; ' + '<span class="invosymbol" id="ship_floor_price">' + res.pic_price + '</span>')
                $('#ship_drop_floor').html(res.delivery_floor + ' ' + language.Floor_Price_for_Drop + ' :&nbsp; ' + '<span class="invosymbol" id="ship_drop_floor_price">' + res.del_price + '</span>')
                $("#ship_pickup_charge").html(res.pickup_elevator)
                $("#ship_drop_charge").html(res.delivery_elevator)
                $("#ship_other_tot").html(res.other_total)
                if (res.premium_charged == "0") {
                  $("#shi_insurance_data").addClass('d-none')
                  $("#ship_insurance_all_type").addClass('d-none')
                } else {
                  $("#shi_insurance_data").removeClass('d-none')
                  $("#ship_insurance_all_type").removeClass('d-none')
                  $("#ship_insurance_price").html(res.premium_charged)
                  $("#ship_insurance_all_type").html(language.Claim_upto + ' ' + '<span class="font-success f-w-700 invosymbol">' + res.damage_payout + '</span>' + ' ' + language.in_case_of_loss_or_damage)
                }
                if (res.delivery_type == "0") {
                  $("#shi_delivery_type_data").addClass('d-none')
                } else {
                  $("#shi_delivery_type_data").removeClass('d-none')
                  $("#ship_delivery").html(res.delivery_type)
                }
                $("#ship_total").html(res.total_price)
              } else {
                $("#shipping_rate_error").removeClass('d-none').text(language.Volumetric_Weight_must_be_between + ' ' + res.add_distance_rate[0].start_weight_range + '' + weight_units + ' ' + language.to + ' ' + res.add_distance_rate[0].end_weight_range + weight_units)
              }
            } else {
              $("#shipp_weight_error").removeClass('d-none').text(language.Dead_Weight_must_be_between + ' ' + res.min + '' + weight_units + ' ' + language.to + ' ' + res.max + '' + weight_units)
            }
          }
          currency()
          thousands_separators()
        }
      });
    }
  })
  $(document).on('click', '#shipping_pam_btn', function() {
    $('#shipping_main').addClass('d-none')
    $('#shipping_pam_card').removeClass('d-none')
    $("#shipp_product").removeClass('d-none')
    $("#shipp_pam_detail").addClass('d-none')
  })
  $(document).on("click", "#shipping_pam_detail_btn", function() {
    if ($("#subcategory_price").val() == "0") {
      $("#shipp_category_error").removeClass('d-none')
      $("#shipp_product").removeClass('d-none')
      $("#shipp_pam_detail").addClass('d-none')
    } else {
      $("#shipp_category_error").addClass('d-none')
      $("#shipp_product").addClass('d-none')
      $("#shipp_pam_detail").removeClass('d-none')
      let shi_category = 0;
      $('.plus_minus').each(function() {
        shi_category += parseFloat($(this).find('.product_price').val())
      });
      $('#shipping_product_price').val(shi_category)
    }
  })
  $(document).on('click', '#shipping_pam_back_btn', function() {
    $("#shipp_product").removeClass('d-none')
    $("#shipp_pam_detail").addClass('d-none')
  })
  $(document).on('click', '#shipping_calcualte_pam_btn', function() {
    let module = 2
    let pickup_address = $('.shipping_pam_one').val()
    let delivery_address = $('.shipping_pam_two').val()
    let sp_lat = $(".shipp_pam_lat").val()
    let sp_lon = $(".shipp_pam_lon").val()
    let sd_lat = $(".shipp_pam_lat2").val()
    let sd_lon = $(".shipp_pam_lon2").val()
    let product_tot = $('#shipping_product_price').val()
    let shifter
    if ($('.shiftr_pam_radio').is(":checked")) {
      shifter = $("input[name='shiftr_pam_shipp']:checked").val()
    } else {
      shifter = 0
    }
    let date = $(".shipp_pam_date").val()
    let time = $("#hidden_time").val()
    let shi_insurance, delivery_type, pickup_checkbox, delivery_checkbox
    if ($('.delivery_radio_pam').is(":checked")) {
      delivery_type = $("input[name='shipping_type_pam']:checked").val()
    } else {
      delivery_type = 0
    }
    if ($('.shipping_insurance_pam').is(":checked")) {
      shi_insurance = 1
    } else {
      shi_insurance = 0
    }
    if ($('.shi_pickup_pam_ckeck').is(":checked")) {
      pickup_checkbox = 1
    } else {
      pickup_checkbox = 0
    }
    if ($('.shi_deliver_pam_ckeck').is(":checked")) {
      delivery_checkbox = 1
    } else {
      delivery_checkbox = 0
    }
    let pickup_floor = $('#shi_pick_pam_floor').select().val()
    let delivery_floor = $('#shi_deli_floor_pam').select().val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/shipping_ajax',
      type: 'POST',
      dataType: 'JSON',
      data: {
        pickup_address,
        delivery_address,
        module,
        product_tot,
        shifter,
        time,
        date,
        shi_insurance,
        delivery_type,
        pickup_checkbox,
        delivery_checkbox,
        pickup_floor,
        delivery_floor,
        sp_lat,
        sp_lon,
        sd_lat,
        sd_lon
      },
      success: function(res) {
        $('#shipping_cal_btn_pam_two').click()
        $("#shipp_amount_quoted").removeClass("d-none")
        $("#shipp_pro_weight_price").addClass("d-none")
        $("#shippi_toolti_one").addClass("d-none")
        $("#shippi_toolti_two").removeClass("d-none")
        $("#ship_weight_tot").html(product_tot)
        $("#shi_shiftr_price").html("").html(shifter)
        if (res.date_price != "0") {
          $("#shi_date_price").html("").html(res.date_price)
        } else {
          $("#shi_date_price").html(0)
        }
        $("#shipp_add_dis").removeClass("d-none").html(language.Distance + ' (' + res.shi_addresh_dis + ' KM) :' + '<span class="invosymbol"> ' + res.address_price + '</span>')
        $('#ship_floor_two').html(res.pickup_floor + ' ' + language.Floor_Price_for_Pickup + ': ' + '<span class="invosymbol" id="ship_floor_price">' + res.pic_price + '</span>')
        $('#ship_drop_floor_two').html(res.delivery_floor + ' ' + language.Floor_Price_for_Drop + ': ' + '<span class="invosymbol" id="ship_drop_floor_price">' + res.del_price + '</span>')
        $("#ship_pickup_charge_two").html(res.pickup_elevator)
        $("#ship_drop_charge_two").html(res.delivery_elevator)
        $("#ship_other_two").html(res.other_total)
        if (res.premium_charged == "0") {
          $("#shi_insurance_data").addClass('d-none')
          $("#ship_insurance_all_type").addClass('d-none')
        } else {
          $("#shi_insurance_data").removeClass('d-none')
          $("#ship_insurance_all_type").removeClass('d-none')
          $("#ship_insurance_price").html(res.premium_charged)
          $("#ship_insurance_all_type").html(language.Claim_upto + ' ' + '<span class="font-success f-w-700 invosymbol">' + res.damage_payout + '</span>' + ' ' + language.in_case_of_loss_or_damage)
        }
        if (res.delivery_type == "0") {
          $("#shi_delivery_type_data").addClass('d-none')
        } else {
          $("#shi_delivery_type_data").removeClass('d-none')
          $("#ship_delivery").html(res.delivery_type)
        }
        $("#ship_total").html(res.total_price)
        currency()
        thousands_separators()
      }
    });
  })
  $(document).on('click', '.shipp_radio_click', function() {
    $(this).find(".shiftr_pam_radio").prop("checked", true)
    $(this).find(".delivery_radio_pam").prop("checked", true)
    $(this).find(".delivery_radio").prop("checked", true)
  })
  $(document).on('click', '.shipp_checkbox_click', function() {
    const currentRow = $(this).closest('.shi_ckeck_cli')
    currentRow.find(".shipping_insurance_pam").prop("checked") === true ? currentRow.find(".shipping_insurance_pam").prop("checked", false) : currentRow.find(".shipping_insurance_pam").prop("checked", true)
    currentRow.find(".shi_pickup_pam_ckeck").prop("checked") === true ? currentRow.find(".shi_pickup_pam_ckeck").prop("checked", false) : currentRow.find(".shi_pickup_pam_ckeck").prop("checked", true)
    currentRow.find(".shi_deliver_pam_ckeck").prop("checked") === true ? currentRow.find(".shi_deliver_pam_ckeck").prop("checked", false) : currentRow.find(".shi_deliver_pam_ckeck").prop("checked", true)
    currentRow.find(".shipping_insurance").prop("checked") === true ? currentRow.find(".shipping_insurance").prop("checked", false) : currentRow.find(".shipping_insurance").prop("checked", true)
    currentRow.find(".shi_pickup_ele_ckeck").prop("checked") === true ? currentRow.find(".shi_pickup_ele_ckeck").prop("checked", false) : currentRow.find(".shi_pickup_ele_ckeck").prop("checked", true)
    currentRow.find(".shi_deliver_ele_ckeck").prop("checked") === true ? currentRow.find(".shi_deliver_ele_ckeck").prop("checked", false) : currentRow.find(".shi_deliver_ele_ckeck").prop("checked", true)
  })
  // =============== Edit Customer Experience =============== //
  $(document).on('click', '#edit_cus_experience', function() {
    let id = $(this).attr("data-id")
    let image = $(this).attr("data-image")
    let title = $(this).attr("data-title")
    let description = $(this).attr("data-description")
    let name = $(this).attr("data-name")
    let email = $(this).attr("data-email")
    $("#cus_edit_form").attr("action", '/settings/edit_cus_experience/' + id)
    $(".img").attr('src', '../../uploads/' + image)
    $("#cus_title").attr('value', title)
    $("#cus_desc").val(description)
    $("#cus_name").attr('value', name)
    $("#cus_email").attr('value', email)
  })
  $(document).on('click', '#edit_social_containt', function() {
    let id = $(this).attr("data-id")
    let sybmol = $(this).attr("data-sybmol")
    let link = $(this).attr("data-link")
    $("#edit_social_con_form").attr('action', '/settings/edit_social_containt/' + id)
    $("#social_symbol").attr("value", sybmol)
    $("#social_link").attr("value", link)
  })
  // =========== edit_package ============== //
  $(document).on('click', '#edit_package', function() {
    let data_id = $(this).attr('data-id');
    let data_image = $(this).attr('data-image');
    let data_name = $(this).attr('data-name');
    let data_start_weight = $(this).attr('data-start_weight');
    let data_start_symbol = $(this).attr('data-start_symbol');
    let data_end_weight = $(this).attr('data-end_weight');
    let data_end_symbol = $(this).attr('data-end_symbol');
    let data_price = $(this).attr('data-price');
    $('#edit_id').attr('action', '/settings/edit_package/' + data_id);
    $('.img').attr('src', '../../uploads/' + data_image);
    $('#name').attr('value', data_name);
    $('#start_weight').attr('value', data_start_weight);
    $('#start_symbol').val(data_start_symbol);
    $('#end_weight').attr('value', data_end_weight);
    $('#end_symbol').val(data_end_symbol);
    $('#price').attr('value', data_price);
  });
  // ============ edit_country =============== //
  $(document).on('click', '#edit_country', function() {
    let data_id = $(this).attr('data-id');
    let data_flag = $(this).attr('data-flag');
    let data_name = $(this).attr('data-name');
    let data_province_code = $(this).attr('data-province_code');
    $('#edit_country_form').attr('action', '/location/edit_country/' + data_id);
    $('.img').attr('src', '../../uploads/' + data_flag);
    $('#name').attr('value', data_name);
    $('#province_code').attr('value', data_province_code);
  });
  // ============ edit_state ============== //
  $(document).on('click', '#edit_state', function() {
    let data_id = $(this).attr('data-id');
    let data_country_name = $(this).attr('data-country_name');
    let data_name = $(this).attr('data-name');
    $('#edit_state_form').attr('action', '/location/edit_state/' + data_id);
    $('#country_name').select2().val(data_country_name)
    $('#country_name').trigger('change')
    $('#name').attr('value', data_name);
  });
  // ============= city =========== //
  $(document).on('select2:select', '.country_name', function() {
    const value = $(this).val();
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/location/state/' + value,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        $('.state_name').html('<option value selected disabled>Select State' + language.Weight_Vol + '</option>');
        $.each(res.state_list, function(index, value) {
          $('.state_name').append('<option value="' + value.id + '">' + value.name + '</option>');
        });
      }
    });
  });
  $(document).on('click', '#edit_city', function() {
    let data_id = $(this).attr('data-id');
    let data_country_name = $(this).attr('data-country_name');
    let data_state_name = $(this).attr('data-state_name');
    let data_name = $(this).attr('data-name');
    $('#edit_id').attr('action', '/location/edit_city/' + data_id);
    $('#edit_name').attr('value', data_name);
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/location/edit_citydata/' + data_country_name,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        $('#edit_country_name').html('<option value selected disabled>' + language.Select_Country + '</option>');
        $.each(res.country_list, function(index, value) {
          if (value.id == data_country_name) {
            $('#edit_country_name').append('<option selected value="' + value.id + '">' + value.name + '</option>');
          } else {
            $('#edit_country_name').append('<option value="' + value.id + '">' + value.name + '</option>');
          }
        });
        $('#edit_state_name').html('<option value selected disabled>' + language.Select_State + '</option>');
        $.each(res.state_list, function(index, value) {
          if (value.id == data_state_name) {
            $('#edit_state_name').append('<option selected value="' + value.id + '">' + value.name + '</option>');
          } else {
            $('#edit_state_name').append('<option value="' + value.id + '">' + value.name + '</option>');
          }
        });
      }
    });
  });
  $(document).on('click', '#edit_coupon', function() {
    let data_id = $(this).attr('data-id');
    let data_title = $(this).attr('data-title');
    let data_code = $(this).attr('data-code');
    let data_min_amount = $(this).attr('data-min_amount');
    let data_discount_amount = $(this).attr('data-discount_amount');
    let data_start_date = $(this).attr('data-start_date');
    let data_end_date = $(this).attr('data-end_date');
    let data_customer = $(this).attr('data-customer');
    module = $("#dynamic_table").val()
    $('#edit_id').attr('action', '/coupon/edit_coupon/' + data_id);
    $('#title').attr('value', data_title);
    $('#coupon_code').attr('value', data_code);
    let start_date_date = new Date(data_start_date);
    let start_date_day = (start_date_date.getDate() < 10 ? '0' + parseInt(start_date_date.getDate()) : start_date_date.getDate());
    let start_date_month = (start_date_date.getMonth() + 1 < 10 ? '0' + parseInt(start_date_date.getMonth() + 1) : start_date_date.getMonth() + 1);
    let start_date_year = start_date_date.getFullYear();
    let start_date = `${start_date_year}-${start_date_month}-${start_date_day}`;
    $('#start_date').attr('value', start_date);
    let end_date_date = new Date(data_end_date);
    let end_date_day = (end_date_date.getDate() < 10 ? '0' + parseInt(end_date_date.getDate()) : end_date_date.getDate());
    let end_date_month = (end_date_date.getMonth() + 1 < 10 ? '0' + parseInt(end_date_date.getMonth() + 1) : end_date_date.getMonth() + 1);
    let end_date_year = end_date_date.getFullYear();
    let end_date = `${end_date_year}-${end_date_month}-${end_date_day}`;
    $('#end_date').attr('value', end_date);
    $('#min_amount').attr('value', data_min_amount);
    $('#discount_amount').attr('value', data_discount_amount);
    $('#edit_coupon_module').attr('value', module);
    let customer_list = data_customer.split(',');
    $('#customer').select2().val(customer_list).trigger('change');
  });
  $(document).on('click', '#coupon_module_click', function() {
    module = $("#dynamic_table").val()
    $("#add_coupon_module").attr('value', module)
  })
  // ============= delivery_type ============== //
  $(document).on('click', '#edit_delivery_type', function() {
    let data_id = $(this).attr('data-id');
    let data_type = $(this).attr('data-type');
    let data_sub_type = $(this).attr('data-sub_type');
    let data_price = $(this).attr('data-price');
    let module = $('#dynamic_table').val()
    $('#edit_id').attr('action', '/settings/edit_delivery_type/' + data_id);
    $('#type').attr('value', data_type);
    $('#sub_type').attr('value', data_sub_type);
    $('#price').attr('value', data_price);
    $('#delivety_edit_zone').attr('value', module);
  });
  $(document).on('click', '#delivery_type_click', function() {
    module = $('#dynamic_table').val()
    $('#delivety_zone').attr("value", module)
  })
  // ============== domestic_pincode =============== //
  $(document).on('click', '#domestic_data', function() {
    if ($('#domestic_pickup_pincode').val() == "" && $('#domestic_delivery_pincode').val() == "" && $('#domestic_customer').val() == null) {
      $('#domestic_pickup_pincode_error').removeClass('d-none');
      $('#domestic_pickup_pincode_error').text('Please Enter Pickup Pincode');
      $('#domestic_delivery_pincode_error').removeClass('d-none');
      $('#domestic_delivery_pincode_error').text('Please Enter Delivery Pincode');
      $('#domestic_customer_error').removeClass('d-none');
      $('#domestic_customer_error').text('Please Select Customer');
    } else if ($('#domestic_pickup_pincode').val() == "" && $('#domestic_delivery_pincode').val() == "") {
      $('#domestic_pickup_pincode_error').removeClass('d-none');
      $('#domestic_pickup_pincode_error').text('Please Enter Pickup Pincode');
      $('#domestic_delivery_pincode_error').removeClass('d-none');
      $('#domestic_delivery_pincode_error').text('Please Enter Delivery Pincode');
      $('#domestic_customer_error').addClass('d-none');
    } else if ($('#domestic_pickup_pincode').val() == "" && $('#domestic_customer').val() == null) {
      $('#domestic_pickup_pincode_error').removeClass('d-none');
      $('#domestic_pickup_pincode_error').text('Please Enter Pickup Pincode');
      $('#domestic_customer_error').removeClass('d-none');
      $('#domestic_customer_error').text('Please Select Customer');
      $('#domestic_delivery_pincode_error').addClass('d-none');
    } else if ($('#domestic_customer').val() == null) {
      $('#domestic_customer_error').removeClass('d-none');
      $('#domestic_customer_error').text('Please Select Customer');
      $('#domestic_pickup_pincode_error').addClass('d-none');
      $('#domestic_delivery_pincode_error').addClass('d-none');
    } else if ($('#domestic_pickup_pincode').val() == "") {
      $('#domestic_pickup_pincode_error').removeClass('d-none');
      $('#domestic_pickup_pincode_error').text('Please Enter Pickup Pincode');
      $('#domestic_delivery_pincode_error').addClass('d-none');
      $('#domestic_customer_error').addClass('d-none');
    } else if ($('#domestic_delivery_pincode').val() == "") {
      $('#domestic_delivery_pincode_error').removeClass('d-none');
      $('#domestic_delivery_pincode_error').text('Please Enter Delivery Pincode');
      $('#domestic_pickup_pincode_error').addClass('d-none');
      $('#domestic_customer_error').addClass('d-none');
    }
    if ($('#domestic_pickup_pincode').val() != "" && $('#domestic_delivery_pincode').val() != "" && $('#domestic_customer').val() != null) {
      $('#domestic_pickup_pincode_error').addClass('d-none');
      $('#domestic_delivery_pincode_error').addClass('d-none');
      $('#domestic_customer_error').addClass('d-none');
    }
  });
  $(document).on('click', '#dummy_delivery_address', function() {
    if ($('#hidden_input').val() == 0) {
      $('#delivery_address_error').removeClass('d-none');
    } else {
      $('#delivery_address_error').addClass('d-none');
    };
  });
  $(document).on('click', '.select_address', function() {
    const data_id = $(this).attr('data-id');
    const data_name = $(this).attr('data-name');
    const data_address = $(this).attr('data-address');
    const data_phone_no = $(this).attr('data-phone_no');
    $('#show_address').text(data_address);
    $('#show_name').text(data_name);
    $('#show_phone').text(data_phone_no);
    $('#hidden_input').val(data_id);
    $('#show_pickup_address').removeClass('d-none');
    $('#delivery_address_error').addClass('d-none');
    $('#delivery_address').removeClass('d-none');
    $('#dummy_delivery_address').addClass('d-none');
    $('#show_delivery_address').addClass('d-none');
    $("#hidden_delivery_address_input").val("")
    // $("#hidden_model").val(0)
  })
  $(document).on('click', '#delivery_address', function() {
    let dataid = $('#hidden_input').val();
    let deliver_id = $("#hidden_delivery_address_input").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/delivery_address/' + dataid,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        if (res.addresh == "") {
          $('#all_address').html('<h5 class="text-danger">' + language.Address_Details_Not_Available + '</h5>')
        } else {
          $('#all_address').html('<h5>Address Details</h5>');
          $.each(res.addresh, function(index, value) {
            if (value.id != dataid && value.id != deliver_id) {
              $('#all_address').append('<a class="col-12 text-dark d-flex justify-content-between align-items-center select_delivery_address" type="button" data-bs-dismiss="modal" data-id="' + value.id + '" data-phone_no="' + value.country_code + ' ' + value.phone_no + '"' + 'data-name="' + value.first_name + ' ' + value.last_name + '" data-address="' + value.address + ', ' + value.city + ', ' + value.state + ', ' + value.country + '">' + '<div class="p-1 d-flex align-items-center">' + '<div>' + '<i class="icofont icofont-map-pins f-20"></i>' + '</div>' + '<div class="mx-3">' + '<h5 class="mb-0">' + value.first_name + ' ' + value.last_name + '</h5>' + '<span>' + value.address + ', ' + value.city + ', ' + value.state + ', ' + value.country + '</span>' + '</div>' + '</div>' + '</a>');
            };
          });
        }
      }
    });
  });
  $(document).on('click', '.select_delivery_address', function() {
    const data_id = $(this).attr('data-id');
    const data_name = $(this).attr('data-name');
    const data_address = $(this).attr('data-address');
    const data_phone_no = $(this).attr('data-phone_no');
    $('#delivery_address_error').addClass('d-none');
    $('#delivery_pickup_address_error').addClass('d-none');
    $('#show_d_address').text(data_address);
    $('#show_d_name').text(data_name);
    $('#show_d_phone').text(data_phone_no);
    $('#hidden_delivery_address_input').val(data_id);
    $('#show_delivery_address').removeClass('d-none');
  });
  $(document).on('click', '#address_submit', function() {
    if ($('#hidden_input').val() == 0 && $('#hidden_delivery_address_input').val() == 0) {
      $('#delivery_address_error').removeClass('d-none');
    } else if ($('#hidden_input').val() == 0) {
      $('#delivery_address_error').removeClass('d-none');
      $('#delivery_pickup_address_error').addClass('d-none');
    } else if ($('#hidden_delivery_address_input').val() == 0) {
      $('#delivery_address_error').addClass('d-none');
      $('#delivery_pickup_address_error').removeClass('d-none');
    } else {
      $('#delivery_address_error').addClass('d-none');
      $('#delivery_pickup_address_error').addClass('d-none');
      document.getElementById("address_form").submit();
    }
  });
  $(document).on('click', '.category_id', function() {
    let currentRow = $(this).closest(".category_card");
    if (currentRow.find('.selected_item').val() == 0) {
      currentRow.find('.selected_item').val(1);
      currentRow.append('<input type="hidden" name="category_id" value="' + $(this).attr('data-id') + '">');
      currentRow.addClass('b-primary border-2');
      $('#hidden_category').val(parseInt($('#hidden_category').val()) + 1)
      $('#category_error').addClass('d-none')
    } else {
      currentRow.find(".selected_item").val(0);
      currentRow.find('input[name=category_id]').remove();
      currentRow.removeClass('b-primary border-2');
      $('#hidden_category').val(parseInt($('#hidden_category').val()) - 1)
    };
  });
  $(document).on('click', '#category_btn', function() {
    if ($('#hidden_category').val() == '0') {
      $('#category_error').removeClass('d-none')
    } else {
      $('#category_error').addClass('d-none')
      $('#category_form').submit()
    }
  })
  $(document).on('click', '.plus', function() {
    let currentRow = $(this).closest(".plus_minus");
    currentRow.find('.value').text(parseFloat(currentRow.find('.value').text()) + 1);
    currentRow.find('.product_qty').val(currentRow.find('.value').text());
    currentRow.find('.product_price').val(parseFloat(currentRow.find('.hidden_product_price').val()) * parseFloat(currentRow.find('.product_qty').val()));
    $('#subcategory_price').val(parseFloat($('#subcategory_price').val()) + 1)
  })
  $(document).on('click', '.minus', function() {
    let currentRow = $(this).closest(".plus_minus");
    if (parseFloat(currentRow.find('.value').text()) <= 0) {
      currentRow.find('.value').text();
    } else {
      currentRow.find('.value').text(parseFloat(currentRow.find('.value').text()) - 1);
      currentRow.find('.product_qty').val(currentRow.find('.value').text());
      currentRow.find('.product_price').val(parseFloat(currentRow.find('.hidden_product_price').val()) * parseFloat(currentRow.find('.product_qty').val()));
      $('#subcategory_price').val(parseFloat($('#subcategory_price').val()) - 1)
    };
  });
  $(document).on('click', '#sub_category_btn', function() {
    if ($('#subcategory_price').val() == 0) {
      $('#sub_category_error').removeClass('d-none')
    } else {
      $('#sub_category_error').addClass('d-none')
      $('#sub_category_form').submit()
    }
  })
  $(document).on('click', '.select_shifter', function() {
    $('#hidden_shifter').val($(this).attr('data-id'));
    $('#shifter_form').submit();
  });
  $(document).on('click', '.time', function() {
    $('.time').removeClass('b-primary border-2');
    $(this).addClass('b-primary border-2');
    $('#hidden_time').val($(this).attr('data-id'));
    $('#time_error').addClass('d-none')
  });
  $(document).on('click', '#time_btn', function() {
    if ($('#hidden_time').val() == "") {
      $('#time_error').removeClass('d-none')
    } else {
      $('#time_error').addClass('d-none')
      $('#time_form').submit()
    }
  })
  $(document).on('change', '#select_date', function() {
    const date = $(this).val();
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/add_time_ajax',
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        $('#all_time').html('');
        $.each(res.time_list, function(index, value) {
          let start_time = value.start_time.split(':');
          let end_time = value.end_time.split(':');
          let start_time_val = (parseInt(start_time[0]) < 13 ? "AM" : "PM");
          let end_time_val = (parseInt(end_time[0]) < 13 ? "AM" : "PM");
          if ($("#shipp_time_mang").val() == "0") {
            if (date == res.fullDate) {
              if (res.hour < end_time[0]) {
                $('#all_time').append('<div class="col-3 time_div">' + '<a class="btn time" data-id="' + value.id + '" style="background-color: #F2F2F2;">' + '<span>' + '<h5 class="mb-0">' + res.convert_time[index] + '</h5>' + '</span>' + '</a>' + '</div>');
              };
            } else {
              $('#all_time').append('<div class="col-3 time_div">' + '<a class="btn time" data-id="' + value.id + '" style="background-color: #F2F2F2;">' + '<span>' + '<h5 class="mb-0">' + res.convert_time[index] + '</h5>' + '</span>' + '</a>' + '</div>');
            };
          } else {
            if (date == res.fullDate) {
              if (res.hour < end_time[0]) {
                $('#all_time').append('<div class="col-3 time_div">' + '<a class="btn time" data-id="' + value.id + '" style="background-color: #F2F2F2;">' + '<strong class="p-0 shipping_flor">' + res.convert_time[index] + '</strong>' + '</a>' + '</div>');
              };
            } else {
              $('#all_time').append('<div class="col-3 time_div">' + '<a class="btn time" data-id="' + value.id + '" style="background-color: #F2F2F2;">' + '<strong class="p-0 shipping_flor">' + res.convert_time[index] + '</strong>' + '</a>' + '</div>');
            };
          }
        });
      }
    });
  });
  $(document).on('click', '.select_coupon', function() {
    const currentRow = $(this).closest('.show_coupon_btn')
    let insurance_price
    if ($('#insurance_price').val() == "") {
      insurance_price = 0;
    } else {
      insurance_price = $('#insurance_price').val();
    }
    $('.count_coupon').each(function() {
      $(this).removeClass('btn-danger remove').text(language.Remove)
      $(this).addClass('btn-success select_coupon').html('<i class="fa fa-save"></i> &nbsp; ' + language.Apply + '')
    });
    $('#coupon_data').removeClass('d-none')
    currentRow.find("#coupon_model_click").removeClass('btn-success select_coupon').html('<i class="fa fa-save"></i> &nbsp; ' + language.Apply + '')
    currentRow.find("#coupon_model_click").addClass('btn-danger remove').text(language.Remove)
    const data_id = $(this).attr('data-id');
    let pls = $('#rates_pla').val()
    let sym = $('#rates_sym').val()
    let coupon = 1;
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/select_coupon/' + data_id,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        if (pls == "1") {
          $(".insurance_add_id").attr('value', coupon)
          $('#coupon_price').val(res.coupon_price);
          $('#show_coupon_price').text(res.coupon_price + ' ' + sym);
          $('#Total_Price').val((parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) - parseFloat(res.coupon_price) + parseFloat(insurance_price)).toFixed(2));
          $('#show_Total_Price').text((parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) - parseFloat(res.coupon_price) + parseFloat(insurance_price)).toFixed(2) + ' ' + sym);
        } else {
          $(".insurance_add_id").attr('value', coupon)
          $('#coupon_price').val(res.coupon_price);
          $('#show_coupon_price').text(sym + ' ' + res.coupon_price);
          $('#Total_Price').val((parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) - parseFloat(res.coupon_price) + parseFloat(insurance_price)).toFixed(2));
          $('#show_Total_Price').text(sym + ' ' + (parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) - parseFloat(res.coupon_price) + parseFloat(insurance_price)).toFixed(2));
        }
        // currency()
        // thousands_separators()
      }
    });
  });
  $(document).on('click', '.remove', function() {
    const currentRow = $(this).closest('.show_coupon_btn')
    let insurance_price
    if ($('#insurance_price').val() == "") {
      insurance_price = 0;
    } else {
      insurance_price = $('#insurance_price').val();
    }
    $('#coupon_data').addClass('d-none')
    currentRow.find("#coupon_model_click").removeClass('btn-danger remove').text(language.Remove)
    currentRow.find("#coupon_model_click").addClass('btn-success select_coupon').html('<i class="fa fa-save"></i> &nbsp; ' + language.Apply + '')
    $('#coupon_price').attr('value', '00');
    const data_id = $(this).attr('data-id');
    let pls = $('#rates_pla').val()
    let sym = $('#rates_sym').val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/remove_coupon/' + data_id,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        $(".insurance_add_id").attr('value', 0)
        if (pls == "1") {
          $('#Total_Price').val((parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) + parseFloat(insurance_price)).toFixed(2));
          $('#show_Total_Price').text((parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) + parseFloat(insurance_price)).toFixed(2) + ' ' + sym);
        } else {
          $('#Total_Price').val((parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) + parseFloat(insurance_price)).toFixed(2));
          $('#show_Total_Price').text(sym + ' ' + (parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) + parseFloat($('#delivery_type_price').val()) + parseFloat(insurance_price)).toFixed(2));
        }
      }
    });
    currency()
    thousands_separators()
  })
  $(document).on('click', '.select_delivery_type', function() {
    $('#delivery_type_data').removeClass('d-none')
    let currentRow = $(this).closest(".all_delivery_type");
    $('.all_delivery_type').removeClass('b-primary');
    currentRow.addClass('b-primary');
    $('#delivery_type_error').addClass('d-none');
    let pls = $('#rates_pla').val()
    let sym = $('#rates_sym').val()
    let insurance_price
    if ($('#insurance_price').val() == "") {
      insurance_price = 0;
    } else {
      insurance_price = $('#insurance_price').val();
    }
    const data_id = $(this).attr('data-id');
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/select_delivery_type/' + data_id,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        let total = (parseFloat($('#product_total_sum').val()) + parseFloat($('#customer_weight_price').val()) + parseFloat($('#other_price').val()) - parseFloat($('#coupon_price').val()) + parseFloat(res.delivery_type_price) + parseFloat(insurance_price)).toFixed(2)
        if (pls == "1") {
          $('#delivery_type_price').val(res.delivery_type_price);
          $('#show_delivery_type_price').text(res.delivery_type_price + ' ' + sym);
          $('#Total_Price').val(total);
          $('#show_Total_Price').text(total + ' ' + sym);
        } else {
          $('#delivery_type_price').val(res.delivery_type_price);
          $('#show_delivery_type_price').text(sym + ' ' + res.delivery_type_price);
          $('#Total_Price').val(total);
          $('#show_Total_Price').text(sym + ' ' + total);
        }
        // currency()
        // thousands_separators()
      }
    });
  });
  // ============== pricing =============== //
  $(document).on('click', '#add_floor_field_btn', function() {
    $('#add_floor_field').append('<div class="row mt-4 floor_field">' + '<div class="col-5">' + '<label class="form-label">' + language.Floor_No + '.</label>' + '<input class="form-control" type="number" name="floor_no" placeholder="' + language.Enter + ' ' + language.Floor_No + '." required>' + '</div>' + '<div class="col-5">' + '<label class="form-label">' + language.Price + '</label>' + '<input class="form-control" type="number" name="floor_price" placeholder="' + language.Enter + ' ' + language.Price + '" required>' + '</div>' + '<div class="col-2" style="padding-top: 36px;">' + '<a type="button" class=" mx-4 text-danger floor_field_delete"><i class="fa fa-trash-o f-24"></i></a>' + '</div>' + '</div>');
  });
  $(document).on('click', '.floor_field_delete', function() {
    $(this).parents('.floor_field').remove();
  });
  $(document).on('click', '#add_floor_field_btn_dom', function() {
    $('#add_floor_field_dom').append('<div class="row mt-4 floor_field">' + '<div class="col-5">' + '<label class="form-label">' + language.Floor_No + '.</label>' + '<input class="form-control" type="number" name="floor_no" placeholder="' + language.Enter + ' ' + language.Floor_No + '." required>' + '</div>' + '<div class="col-5">' + '<label class="form-label">' + language.Price + '</label>' + '<input class="form-control" type="number" name="floor_price" placeholder="' + language.Enter + ' ' + language.Price + '" required>' + '</div>' + '<div class="col-2" style="padding-top: 36px;">' + '<a type="button" class=" mx-4 text-danger floor_field_delete"><i class="fa fa-trash-o f-24"></i></a>' + '</div>' + '</div>');
  });
  $(document).on('click', '.floor_field_delete_dom', function() {
    $(this).parents('.add_floor_field_dom').remove();
  });
  $(document).on('click', '#add_floor_field_btn_int', function() {
    $('#add_floor_field_int').append('<div class="row mt-4 floor_field_int">' + '<div class="col-5">' + '<label class="form-label">' + language.Floor_No + '.</label>' + '<input class="form-control" type="number" name="floor_no" placeholder="' + language.Enter + ' ' + language.Floor_No + '." required>' + '</div>' + '<div class="col-5">' + '<label class="form-label">' + language.Price + '</label>' + '<input class="form-control" type="number" name="floor_price" placeholder="' + language.Enter + ' ' + language.Price + '" required>' + '</div>' + '<div class="col-2" style="padding-top: 36px;">' + '<a type="button" class=" mx-4 text-danger floor_field_delete"><i class="fa fa-trash-o f-24"></i></a>' + '</div>' + '</div>');
  });
  $(document).on('click', '.floor_field_delete_int', function() {
    $(this).parents('.add_floor_field_int').remove();
  });
  $(document).on('click', '#add_Weight_tbl_rate', function() {
    $('#add_weight').append('<div class="row mt-4 cou_floor_field">' + '<div class="col-3">' + '<label class="form-label">' + language.Min + ' ' + language.Weight + '</label>' + '<input class="form-control" type="number" name="cou_min_weight" value="" placeholder="' + language.Enter + ' ' + language.Min + ' ' + language.Weight + '" required>' + '</div>' + '<div class="col-3">' + '<label class="form-label">' + language.Max + '. ' + language.Weight + '</label>' + '<input class="form-control" type="number" name="cou_max_weight" value="" placeholder="' + language.Enter + ' ' + language.Max + '. ' + language.Weight + '" required>' + '</div>' + '<div class="col-4">' + '<label class="form-label p-l-30">' + language.Price + '</label>' + '<div class="d-flex">' + '<label class="form-label pt-2 p-r-20">=</label>' + '<input class="form-control" type="number" name="cou_weight_price" value="" placeholder="' + language.Enter + ' <%=language.Price%>" required>' + '</div>' + '</div>' + '<div class="col-2" style="padding-top: 36px;">' + '<a type="button" class=" mx-4 text-danger delete_weight_tbl"><i class="fa fa-trash-o f-24"></i></a>' + '</div>' + '</div>');
  });
  $(document).on('click', '.delete_weight_tbl', function() {
    $(this).parents('.cou_floor_field').remove();
  });
  $(document).on('click', '#int_Weight_tbl_rate', function() {
    $('#add_int_weight').append('<div class="row mt-4 int_floor_field">' + '<div class="col-3">' + '<label class="form-label">' + language.Min + ' ' + language.Weight + '</label>' + '<input class="form-control" type="number" name="int_min_weight" value="" placeholder="' + language.Enter + ' ' + language.Min + ' ' + language.Weight + '" required>' + '</div>' + '<div class="col-3">' + '<label class="form-label">' + language.Max + '. ' + language.Weight + '</label>' + '<input class="form-control" type="number" name="int_max_weight" value="" placeholder="' + language.Enter + ' ' + language.Max + '. ' + language.Weight + '" required>' + '</div>' + '<div class="col-4">' + '<label class="form-label p-l-30">' + language.Price + '</label>' + '<div class="d-flex">' + '<label class="form-label pt-2 p-r-20">=</label>' + '<input class="form-control" type="number" name="int_weight_price" value="" placeholder="' + language.Enter + ' <%=language.Price%>" required>' + '</div>' + '</div>' + '<div class="col-2" style="padding-top: 36px;">' + '<a type="button" class=" mx-4 text-danger delete_int_weight_tbl"><i class="fa fa-trash-o f-24"></i></a>' + '</div>' + '</div>');
  });
  $(document).on('click', '.delete_int_weight_tbl', function() {
    $(this).parents('.int_floor_field').remove();
  });
  // ============= edit_method ============= //
  $(document).on('click', '#edit_method', function() {
    let data_id = $(this).attr('data-id');
    let data_image = $(this).attr('data-image');
    let data_title = $(this).attr('data-title');
    let data_slug = $(this).attr('data-slug');
    let data_status = $(this).attr('data-status');
    let data_secret_id = $(this).attr('data-secret_id');
    let data_secret_key = $(this).attr('data-secret_key');
    let payment_type = $(this).attr('data-payment_type');
    $('#edit_id').attr('action', '/transaction/edit_transaction_method/' + data_id);
    $('.img').attr('src', '../../uploads/' + data_image);
    $('#title').val(data_title);
    $('#slug').val(data_slug);
    $('.payment_secret_id').val(data_secret_id);
    $('.payment_secret_key').val(data_secret_key);
    if (data_status == '1') {
      $('#edit_status_switch').html('<input type="checkbox" name="status" checked><span class="switch-state bg-success"></span>');
    } else {
      $('#edit_status_switch').html('<input type="checkbox" name="status"><span class="switch-state bg-success"></span>');
    };
    if (data_id == "3") {
      $("#show_secret_id").addClass("d-none")
      $("#show_secret_Key").addClass("d-none")
      $("#show_checkbox").addClass("d-none")
    } else if (data_id == "4") {
      $("#show_secret_id").removeClass("d-none")
      $("#show_secret_Key").addClass("d-none")
      $("#show_checkbox").addClass("d-none")
    } else if (data_id == "5") {
      $("#show_secret_id").removeClass("d-none")
      $("#show_secret_Key").removeClass("d-none")
      $("#show_checkbox").removeClass("d-none")
      if (payment_type == "1") {
        $('.Live_check').prop("checked", false);
        $('.Sandbox_check').prop("checked", true);
      } else if (payment_type == "2") {
        $('.Sandbox_check').prop("checked", false);
        $('.Live_check').prop("checked", true);
      }
    } else if (data_id == "6") {
      $("#show_secret_id").removeClass("d-none")
      $("#show_secret_Key").removeClass("d-none")
      $("#show_checkbox").addClass("d-none")
    } else if (data_id == "7") {
      $("#show_checkbox").addClass("d-none")
    } else if (data_id == "8") {
      $("#show_secret_id").addClass("d-none")
      $("#show_secret_Key").removeClass("d-none")
      $("#show_checkbox").addClass("d-none")
    }
  });
  $(document).on('click', '#edit_bank', function() {
    let data_id = $(this).attr('data-id');
    let data_image = $(this).attr('data-image');
    let data_title = $(this).attr('data-title');
    let data_slug = $(this).attr('data-slug');
    let data_status = $(this).attr('data-status');
    let data_bank_name = $(this).attr('data-bankname');
    let data_holder_name = $(this).attr('data-holdername');
    let data_account_no = $(this).attr('data-account');
    let data_ifsc_no = $(this).attr('data-ifsc');
    let data_swist_code = $(this).attr('data-swift');
    $('#edit_bank_account').attr('action', '/transaction/edit_transaction_method/' + data_id);
    $('.payment_img').attr('src', '../../uploads/' + data_image);
    $('#payment_title').val(data_title);
    $('#payment_slug').val(data_slug);
    $('#bank_name').val(data_bank_name);
    $('#bank_holder_name').val(data_holder_name);
    $('#bank_account_No').val(data_account_no);
    $('#bank_ifsc_code').val(data_ifsc_no);
    $('#swift_code').val(data_swist_code);
    if (data_status == '1') {
      $('#status_switch').html('<input type="checkbox" name="status" checked><span class="switch-state bg-success"></span>');
    } else {
      $('#status_switch').html('<input type="checkbox" name="status"><span class="switch-state bg-success"></span>');
    };
  });
  // ============ edit_status ============= //
  $(document).on('click', '#edit_status', function() {
    const data_id = $(this).attr('data-id');
    const data_status_name = $(this).attr('data-status_name');
    const data_status_details = $(this).attr('data-status_details');
    const data_active = $(this).attr('data-active');
    $('#edit_id').attr('action', '/settings/edit_status/' + data_id);
    $('#status_name').val(data_status_name);
    $('#status_details').val(data_status_details);
    if (data_active == '1') {
      $('#edit_switch').html('<input type="checkbox" name="active" checked><span class="switch-state bg-success"></span>');
    } else {
      $('#edit_switch').html('<input type="checkbox" name="active"><span class="switch-state bg-success"></span>');
    };
  });
  // ========== general_settings ========== // 
  $(document).on("change", "#site_logo", function() {
    $("#site_logo_hidden").val(parseInt($("#site_logo_hidden").val()) + 1);
  });
  $(document).on("change", "#site_dark_logo", function() {
    $("#site_dark_logo_hidden").val(parseInt($("#site_dark_logo_hidden").val()) + 1);
  });
  // =========== edit_driver ============= //
  $(document).on('click', '#edit_driver', function() {
    const data_id = $(this).attr('data-id');
    const data_first_name = $(this).attr('data-first_name');
    const data_last_name = $(this).attr('data-last_name');
    const data_email = $(this).attr('data-email');
    const data_country_code = $(this).attr('data-country_code');
    const data_phone_no = $(this).attr('data-phone_no');
    const data_approved = $(this).attr('data-approved');
    const data_vehicle_plate = $(this).attr('data-vehicle_plate');
    const data_zone = $(this).attr('data-zone');
    const data_carrier_commission = $(this).attr('data-carrier_commission');
    const data_default_carrier_commission = $(this).attr('data-default_carrier_commission');
    const data_carrier_min_balance_for_withdraw = $(this).attr('data-carrier_min_balance_for_withdraw');
    const data_default_wallet_min_balance = $(this).attr('data-default_wallet_min_balance');
    $('#edit_id').attr('action', '/user/edit_driver/' + data_id);
    $('#first_name').val(data_first_name);
    $('#last_name').val(data_last_name);
    $('#email').val(data_email);
    $('#edit_email').val(data_email);
    $('#vehicle_plate').val(data_vehicle_plate);
    $('#country_code').select2().val(data_country_code).trigger('change');
    $('#phone_no').val(data_phone_no);
    $('#edit_phone_no').val(data_phone_no);
    if (data_approved == '1') {
      $(".approved").prop("checked", true);
    };
    $('#zone').select2().val(data_zone).trigger('change');
    if (data_carrier_commission) {
      $('#carrier_commission').val(data_carrier_commission);
    } else {
      $('#carrier_commission').val(data_default_carrier_commission);
    };
    if (data_carrier_min_balance_for_withdraw) {
      $('#carrier_min_balance_for_withdraw').val(data_carrier_min_balance_for_withdraw);
    } else {
      $('#carrier_min_balance_for_withdraw').val(data_default_wallet_min_balance);
    };
  });
  // ============= add_vehicle =============== //
  $(document).on('click', '#add_vehicle', function() {
    const data_id = $(this).attr('data-id');
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/user/driver_document',
      type: 'POST',
      dataType: 'JSON',
      data: {
        data_id
      },
      success: function(res) {
        $('.vehicle_img').attr('src', '');
        $('#edit_vehicle_id').attr('action', '/user/add_driver_document/' + data_id);
        $('.vehicle_img').attr('src', '../../uploads/' + res.data[0].image);
        $('#driver_img').attr('href', '../../uploads/' + res.data[0].image);
        if (res.data[0].status == '1') {
          $(".edit_vehicle_status").prop("checked", true);
        };
      }
    });
  });
  // ============= add_personalmodal =============== //
  $(document).on('click', '#add_personal', function() {
    const data_id = $(this).attr('data-id');
    const data_status = $(this).attr('data-status');
    const data_image = $(this).attr('data-image');
    $('#edit_personal_id').attr('action', '/user/add_driver_document/' + data_id);
    $('.personal_img').attr('src', '../../uploads/' + data_image);
    if (data_status == '1') {
      $(".edit_personal_status").prop("checked", true);
    };
  });
  // ============ customer sign_up ============= //
  $(document).on('click', '#customer_signup_btn', function() {
    let sms_status = $("#sms_status").val()
    let email_status = $("#email_status").val()
    const fname = $('#first_login_name').val();
    const lname = $('#last_login_name').val();
    const password = $('#password_login_name').val();
    const email = $('#email').val();
    const country_code = $('#country_code').val();
    const phone = $('#phone_no').val();
    if (fname == "") {
      $('#customer_signup_btn').addClass('disabled')
      $('#Details_error').removeClass('d-none');
    } else if (lname == "") {
      $('#customer_signup_btn').addClass('d-none')
      $('#Details_error').removeClass('d-none');
    }
    if (password == "") {
      $('#customer_signup_btn').addClass('d-none')
      $('#Details_error').removeClass('d-none');
    }
    if (email == "") {
      $('#customer_signup_btn').addClass('d-none')
      $('#Details_error').removeClass('d-none');
    }
    if (country_code == null) {
      $('#customer_signup_btn').addClass('d-none')
      $('#Details_error').removeClass('d-none');
    }
    if (phone == "") {
      $('#customer_signup_btn').addClass('d-none')
      $('#Details_error').removeClass('d-none');
    } else {
      $('#customer_signup_btn').removeClass('d-none')
      $('#Details_error').addClass('d-none');
      const base_url = window.location.origin;
      $.ajax({
        url: base_url + '/sign_up/ajax',
        type: 'POST',
        dataType: 'JSON',
        data: {
          email,
          country_code,
          phone
        },
        success: function(res) {
          if (res.error == 'email') {
            $('#email_error').removeClass('d-none');
            $('#phone_no_error').addClass('d-none');
          } else if (res.error == 'phone_no') {
            $('#phone_no_error').removeClass('d-none');
            $('#email_error').addClass('d-none');
          } else {
            $('#email_error').addClass('d-none');
            $('#phone_no_error').addClass('d-none');
            if (sms_status == "1" || email_status == "1") {
              $('#customer_signup_modal').addClass('d-none');
              $('#customer_otp_modal').removeClass('d-none');
              $('#hidden_otp').val(res.otp);
              let countrycode = $('#country_code').val()
              let phoneno = $('#phone_no').val()
              if (sms_status == "1" && email_status == "1") {
                $('#enter_no').text(language.enter_the_security_code_we_send_to + ' :- ' + countrycode + ' ' + phoneno.replace(/\d(?=\d{4})/g, "*") + ' || ' + email);
              } else if (sms_status == "1") {
                $('#enter_no').text(language.enter_the_security_code_we_send_to + ' :- ' + countrycode + ' ' + phoneno.replace(/\d(?=\d{4})/g, "*"));
              } else if (email_status == "1") {
                $('#enter_no').text(language.enter_the_security_code_we_send_to + ' :- ' + email);
              }
            } else {
              $('#cus_signup').submit();
            }
          }
        }
      });
    }
  });
  $(document).on('click', '#customer_otp_btn', function() {
    if ($('#customer_otp').val() != $('#hidden_otp').val()) {
      $('#otp_error').removeClass('d-none');
    } else {
      $('#otp_error').addClass('d-none');
      $('#cus_signup').submit();
    };
  });
  // ============== forget password ================= //
  $(document).on('click', '#forget_otp_btn', function() {
    const data = $('#forget_user').val();
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/forget_pass/ajax/' + data,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        if (res.data == 'error') {
          $('#forget_user_error').removeClass('d-none');
        } else {
          $('#forget_user_error').addClass('d-none');
          $('#forget_phone_data').addClass('d-none');
          $('#forget_otp_data').removeClass('d-none');
          $('#hidden_forget_otp').val(res.data);
        };
      }
    });
  });
  $(document).on('click', '#new_password_btn', function() {
    if ($('#hidden_forget_otp').val() != $('#forget_otp').val()) {
      $('#forget_otp_error').removeClass('d-none');
      $('#confirm_password_error').addClass('d-none');
    } else if ($('#password').val() != $('#confirm_password').val()) {
      $('#confirm_password_error').removeClass('d-none');
      $('#forget_otp_error').addClass('d-none');
    } else {
      $('#forget_otp_error').addClass('d-none');
      $('#confirm_password_error').addClass('d-none');
      $('#forget_pass_form').submit();
    }
  });
  // =============== edit_insurance ================= //
  $(document).on('click', '#edit_insurance', function() {
    const data_id = $(this).attr('data-id');
    const data_start_price = $(this).attr('data-start_price');
    const data_end_price = $(this).attr('data-end_price');
    const data_premium_charged = $(this).attr('data-premium_charged');
    const data_premium_percentage = $(this).attr('data-premium_percentage');
    const data_damage_payout = $(this).attr('data-damage_payout');
    const data_damage_percentage = $(this).attr('data-damage_percentage');
    const data_active = $(this).attr('data-active');
    module = $("#dynamic_table").val()
    $('#edit_id').attr('action', '/settings/edit_insurance/' + data_id);
    $('#start_price').val(data_start_price);
    $('#end_price').val(data_end_price);
    $("#insurance_edit_zone").attr('value', module)
    if (data_premium_percentage == '1') {
      $('.premium_charged_percentage').html('<input class="form-check-input aa" id="invalidCheck3" type="checkbox" name="premium_charged_percentage" checked>' + $('.premium_charged_percentage').html());
    } else {
      $('.premium_charged_percentage').html('<input class="form-check-input aa" id="invalidCheck3" type="checkbox" name="premium_charged_percentage">' + $('.premium_charged_percentage').html());
    };
    $('#premium_charged').val(data_premium_charged);
    if (data_damage_percentage == '1') {
      $('.damage_payout_percentage').html('<input class="form-check-input bb" id="invalidCheck4" type="checkbox" name="damage_payout_percentage" checked>' + $('.damage_payout_percentage').html());
    } else {
      $('.damage_payout_percentage').html('<input class="form-check-input bb" id="invalidCheck4" type="checkbox" name="damage_payout_percentage">' + $('.damage_payout_percentage').html());
    };
    $('#damage_payout').val(data_damage_payout);
    if (data_active == '1') {
      $('.edit_insurance_active').html('<input class="form-check-input cc" id="invalidCheck5" type="checkbox" name="active" checked>' + $('.edit_insurance_active').html());
    } else {
      $('.edit_insurance_active').html('<input class="form-check-input cc" id="invalidCheck5" type="checkbox" name="active">' + $('.edit_insurance_active').html());
    };
  });
  $(document).on('click', '#insurance_module_btn', function() {
    module = $("#dynamic_table").val()
    $("#insurance_zone").attr('value', module)
  })
  $(document).on('click', '.add_insurance', function() {
    let pls = $('#rates_pla').val()
    let sym = $('#rates_sym').val()
    if (pls == "1") {
      if ($('.add_insurance').is(":checked")) {
        $('#insurance_data').removeClass('d-none');
        $('#hidden_insurance').removeClass('d-none');
        $('#insurance_price').val($('#add_insurance_charge').val());
        $('#show_insurance_price').text($('#add_insurance_charge').val() + ' ' + sym);
        $('#Total_Price').val((parseFloat($('#Total_Price').val()) + parseFloat($('#add_insurance_charge').val())).toFixed(2));
        $('#show_Total_Price').text($('#Total_Price').val() + ' ' + sym);
      } else {
        $('#insurance_data').addClass('d-none');
        $('#hidden_insurance').addClass('d-none');
        $('#insurance_price').val('00');
        $('#show_insurance_price').text('00' + ' ' + sym);
        $('#Total_Price').val((parseFloat($('#Total_Price').val()) - parseFloat($('#add_insurance_charge').val())).toFixed(2));
        $('#show_Total_Price').text($('#Total_Price').val() + ' ' + sym);
      };
    } else {
      if ($('.add_insurance').is(":checked")) {
        $('#insurance_data').removeClass('d-none');
        $('#hidden_insurance').removeClass('d-none');
        $('#insurance_price').val($('#add_insurance_charge').val());
        $('#show_insurance_price').text(sym + ' ' + $('#add_insurance_charge').val());
        $('#Total_Price').val((parseFloat($('#Total_Price').val()) + parseFloat($('#add_insurance_charge').val())).toFixed(2));
        $('#show_Total_Price').text(sym + ' ' + $('#Total_Price').val());
      } else {
        $('#insurance_data').addClass('d-none');
        $('#hidden_insurance').addClass('d-none');
        $('#insurance_price').val('00');
        $('#show_insurance_price').text(sym + ' ' + '00');
        $('#Total_Price').val((parseFloat($('#Total_Price').val()) - parseFloat($('#add_insurance_charge').val())).toFixed(2));
        $('#show_Total_Price').text(sym + ' ' + $('#Total_Price').val());
      };
    }
    // currency()
    // thousands_separators()
  });
  $(document).on('change', '#add_start_price', function() {
    module = $("#dynamic_table").val()
    const start_price = $(this).val();
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/settings/start_price/' + start_price,
      type: 'POST',
      dataType: 'JSON',
      data: {
        module
      },
      success: function(res) {
        if (res.data == 'error') {
          $('#start_price_error').removeClass('d-none');
          $('#insurance_btn').addClass('disabled');
        } else {
          $('#start_price_error').addClass('d-none');
          $('#insurance_btn').removeClass('disabled');
        };
      }
    });
  });
  // ========== order_approved ============== //
  $(document).on('click', '#order_approved', function() {
    const data_id = $(this).attr('data-id');
    const order_no = $(this).attr('data-invoice');
    let order = data_id + ',' + order_no
    $('#add_carrier_modal').attr('action', '/order/add_carrier/' + order);
  });
  $(document).on('click', '#order_unapproved', function() {
    const data_id = $(this).attr('data-id');
    $('#add_unapproved_order_modal').attr('action', '/order/add_unapproved/' + data_id);
  });
  // ============= order list add_payment =============== //
  $(document).on('click', '#add_payment', function() {
    const order_id = $(this).attr('data-id');
    $('.payment_btn').attr('data-order_id', order_id);
    $('#order_payment_model').attr('data-order_bank_id', order_id);
  });
  $(document).on('click', '.payment_btn', function() {
    const data_order_id = $(this).attr('data-order_id');
    const data_payment_method = $(this).attr('data-payment_method');
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/order/add_payment',
      type: 'POST',
      dataType: 'JSON',
      data: {
        data_order_id,
        data_payment_method
      },
      success: function(res) {
        if (res.ok == 'done') {
          location.reload();
        };
      }
    });
  });
  $(document).on('click', '#add_payment', function (){
      const data_id = $(this).attr('data-id');
      const data_total_price = $(this).attr('data-total_price');
      const data_paid_amount = $(this).attr('data-paid_amount');
      const data_due_amount = data_total_price - data_paid_amount;
      $('#total_amount').text(data_total_price);
      $('#paid_amount').text(data_paid_amount);
      $('#due_amount').text(data_due_amount.toFixed(2));
      $('#hidden_orderid').val(data_id);
      $('#hidden_order_tot').val(data_due_amount)
      $('#customer_tot_razorpay').val(data_due_amount)
      $('#customer_order_razorpay').val(data_id)
      $('#customer_pay_razorpay').val(6)
      currency()
      thousands_separators()
    });
  // ============= edit_module ============= //
  $(document).on('click', '#edit_module', function() {
    const data_id = $(this).attr('data-id');
    const data_name = $(this).attr('data-name');
    const data_icon = $(this).attr('data-icon');
    const data_isactive = $(this).attr('data-isactive');
    const Prefix = $(this).attr('data-prefix');
    $('#edit_id').attr('action', '/settings/upadet_module/' + data_id);
    $('#name').val(data_name);
    $('#icon').val(data_icon);
    $('#Prefix').val(Prefix);
    if (data_isactive == '1') {
      $('#edit_switch').prop("checked", true);
    } else {
      $('#edit_switch').prop("checked", false);
    };
  })
  // =============== track_order ================ //
  $(document).on('click', '#track_order', function (){
      const order_type = $('#order_type').val();
      const invoice_no = $('#invoice_no').val();
      const profix = invoice_no.match(/\d+|\D+/g)[0]
      const base_url = window.location.origin;
      if (order_type == null && invoice_no == "") {
        $('#error_order_id').addClass('d-none');
        $('#error_invoice_no').removeClass('d-none');
        $('#error_module_select').removeClass('d-none');
      } else if (order_type == null) {
        $('#error_order_id').addClass('d-none');
        $('#error_invoice_no').addClass('d-none');
        $('#error_module_select').removeClass('d-none');
      } else if (invoice_no == "") {
        $('#error_order_id').addClass('d-none');
        $('#error_invoice_no').removeClass('d-none');
        $('#error_module_select').addClass('d-none');
      } else {
        $.ajax({
          url: base_url + '/tracking_details/ajax',
          type: 'POST',
          dataType: 'JSON',
          data: {order_type, invoice_no},
          success: function (res){
            if (res.tracking == "0") {
              $("#error_order_id").removeClass('d-none');
              $("#show_tracking_data").addClass('d-none');
              $('#error_invoice_no').addClass('d-none');
              $('#error_module_select').addClass('d-none');
            } else {
              $("#error_order_id").addClass('d-none');
              $("#show_tracking_data").removeClass('d-none');
              if (res.module_list[0].prefix != profix) {
                $("#show_tracking_data").addClass('d-none');
                $("#error_order_id").removeClass('d-none');
                $('#error_invoice_no').addClass('d-none');
                $('#error_module_select').addClass('d-none');
              } else {
                $("#error_order_id").addClass('d-none');
                $('#error_invoice_no').addClass('d-none');
                $('#error_module_select').addClass('d-none');
                $("#show_tracking_data").removeClass('d-none');
                $('#error_order_type').addClass('d-none');
                $('#address_card').removeClass('d-none');
                $('#track_card').removeClass('d-none');
                $(".history_table").html("")
                $('#customer_name').text("")
                $('#customer_address').text("")
                $('#origin_country').text("")
                $('#date_of_shipment').text("")
                $('#origin_city').text("")
                $('#client_name').text("")
                $('#destination_address').text("")
                $('#destination_country').text("")
                $('#destination_city').text("")
                $('#customer_name').text(res.pickup_address[0].first_name + ' ' + res.pickup_address[0].last_name)
                $('#customer_address').text(res.pickup_address[0].address)
                $('#origin_country').text(res.pickup_address[0].country)
                $('#date_of_shipment').text(res.order_data[0].date)
                $('#origin_city').text(res.pickup_address[0].city)
                $('#client_name').text(res.delivery_address[0].first_name + ' ' + res.delivery_address[0].last_name)
                $('#destination_address').text(res.delivery_address[0].address)
                $('#destination_country').text(res.delivery_address[0].country)
                $('#destination_city').text(res.delivery_address[0].city)
                if (res.tracking_data == "") {
                  $(".history_table").html("")
                  $('#track_card').addClass('d-none');
                } else {
                  $('#track_card').removeClass('d-none');
                  $.each(res.tracking_data, function(index, value) {
                    if (value.delivery_status == "3" || value.address == null) {
                      if (value.driver_id == "" || value.driver_id == null) {
                        let new_date = new Date(value.date_time);
                        $(".history_table").append(
                            '<div class="cd-timeline-block">'+
                              '<div class="cd-timeline-img cd-picture bg-primary"><i class="fa fa-truck"></i></div>'+
                              '<div class="cd-timeline-content p-3">'+
                                '<h5 class="mb-0">Status : '+ value.status_name +'</h5><p class=" f-w-600 mb-0">Updated Date : '+ new_date.toLocaleDateString() +'</p>'+
                                '<p class=" f-w-600 mb-0">Updated Location : '+ value.address +' | '+ value.city +' | '+ value.state +' | '+ value.country +'</p>'+
                                '<p class=" f-w-600 mb-0">Note : '+ value.message +'</p>'+
                              '</div>'+
                            '</div>'
                        )
                      } else {
                        let new_date = new Date(value.date_time);
                        $(".history_table").append(
                            '<div class="cd-timeline-block">'+
                              '<div class="cd-timeline-img cd-picture bg-primary"><i class="fa fa-truck"></i></div>'+
                              '<div class="cd-timeline-content p-3">'+
                                '<h5 class="mb-0">Status : '+ value.status_name +'</h5><p class=" f-w-600 mb-0">Updated Date : '+ new_date.toLocaleDateString() +'</p>'+
                                '<p class=" f-w-600 mb-0">Delivered Person Name : '+ value.driver_id +'</p>'+
                                '<p class=" f-w-600 mb-0">Received Person Name : '+ value.person_receives +'</p>'+
                              '</div>'+
                            '</div>'
                        )
                      }
                    } else {
                      let new_date = new Date(value.date_time);
                      $(".history_table").append(
                          '<div class="cd-timeline-block">'+
                            '<div class="cd-timeline-img cd-picture bg-primary"><i class="fa fa-truck"></i></div>'+
                            '<div class="cd-timeline-content p-3">'+
                              '<h5 class="mb-0">Status : '+ value.status_name +'</h5><p class=" f-w-600 mb-0">Updated Date : '+ new_date.toLocaleDateString() +'</p>'+
                              '<p class=" f-w-600 mb-0">Updated Location : '+ value.address +' | '+ value.city +' | '+ value.state +' | '+ value.country +'</p>'+
                              '<p class=" f-w-600 mb-0">Note : '+ value.message +'</p>'+
                            '</div>'+
                          '</div>'
                      )
                    }
                  })
                }
              }
            }
          }
        });
      }
    });
  // ============= print_order =============== //
  $(document).on('click', '#print_order', function() {
    let printContents = document.getElementById('invo_print').innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    location.reload();
  });
  // =============== dropbtn =============== //
  $(".dropbtn").click(function() {
    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      };
    };
    let currentRow = $(this).closest(".dropdown");
    currentRow.find(".myDropdown").toggleClass("show");
  });
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      let dropdowns = document.getElementsByClassName("dropdown-content");
      let i;
      for (i = 0; i < dropdowns.length; i++) {
        let openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        };
      };
    };
  };
  currency()
  thousands_separators()
});
$(document).on('input', '.search_input', function() {
  let currentRow = $(this).closest(".address_details");
  if (currentRow.find("#show_zone_id").val() == "1") {
    $('.domestic_btn_error0').addClass('disabled');
  } else if (currentRow.find("#show_zone_id").val() == "2") {
    $('.domestic_btn_error1').addClass('disabled');
  } else if (currentRow.find("#show_zone_id").val() == "3") {
    $('.international_btn_error1').addClass('disabled');
    $('#hidden_pickup_international').val(0)
  }
  let autocomplete;
  autocomplete = new google.maps.places.Autocomplete((currentRow.find('#search_input')[0]), {
    // componentRestrictions: {
    //   country: 'in'
    // }
  });
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    let near_place = autocomplete.getPlace();
    currentRow.find('#latitude').val(near_place.geometry.location.lat());
    currentRow.find('#longitude').val(near_place.geometry.location.lng());
    const latitude = near_place.geometry.location.lat();
    const longitude = near_place.geometry.location.lng();
    const zone_id = currentRow.find("#show_zone_id").val()
    const addresh_module_id = currentRow.find("#addresh_module_id").val()
    let country = currentRow.find("#search_input").val()
    const base_url = window.location.origin;
    if (currentRow.find('.hidden_page').attr('data-id') != '1' && currentRow.find('.hidden_page').attr('data-id') != '2') {
      $.ajax({
        url: base_url + '/user/address/ajax',
        type: 'POST',
        dataType: 'JSON',
        data: {
          latitude,
          longitude,
          addresh_module_id
        },
        success: function(res) {
          if (res.data == 'done') {
            $('#search_input_error').addClass('d-none');
            $('#add_customer_btn').removeClass('disabled');
          } else {
            $('#search_input_error').removeClass('d-none');
            $('#add_customer_btn').addClass('disabled');
          };
        }
      });
    } else {
      $.ajax({
        url: base_url + '/user/address/ajax',
        type: 'POST',
        dataType: 'JSON',
        data: {
          latitude,
          longitude,
          zone_id,
          country
        },
        success: function(res) {
          if (currentRow.find("#show_zone_id").val() == "1") {
            if (currentRow.find('.hidden_page').attr('data-id') == '1') {
              if (res.data == 'done') {
                currentRow.find('#hidden_pickup_currior').val(1);
              } else {
                currentRow.find('#hidden_pickup_currior').val(2);
              };
            }
            if (currentRow.find('#hidden_pickup_currior').val() == 1) {
              $('#pickupsearch_input_error').addClass('d-none');
            } else if (currentRow.find('#hidden_pickup_currior').val() != 1) {
              $('#pickupsearch_input_error').removeClass('d-none');
              $('.domestic_btn_error0').addClass('disabled');
            } else {
              $('#pickupsearch_input_error').addClass('d-none');
            }
            if (currentRow.find('#hidden_pickup_currior').val() == 1 && $('#hidden_delivered_currior').val() == 2) {
              $('#deliversearch_input_error').addClass('d-none');
              $('.domestic_btn_error0').removeClass('disabled');
            }
          } else if (currentRow.find("#show_zone_id").val() == "2") {
            if (currentRow.find('.hidden_page').attr('data-id') == '1') {
              if (res.data == 'done') {
                currentRow.find('#hidden_pickup_Packers').val(1);
              } else {
                currentRow.find('#hidden_pickup_Packers').val(2);
              };
            }
            if (currentRow.find('#hidden_pickup_Packers').val() == 1) {
              $('#pickupsearch_input_error').addClass('d-none');
            } else if (currentRow.find('#hidden_pickup_Packers').val() != 1) {
              $('#pickupsearch_input_error').removeClass('d-none');
              $('.domestic_btn_error1').addClass('disabled');
            } else {
              $('#pickupsearch_input_error').addClass('d-none');
            }
            if (currentRow.find('#hidden_pickup_Packers').val() == 1 && $('#hidden_delivered_Packers').val() == 2) {
              $('#deliversearch_input_error').addClass('d-none');
              $('.domestic_btn_error1').removeClass('disabled');
            }
          } else {
            if (currentRow.find('.hidden_page').attr('data-id') == '1') {
              if (res.data == 'done') {
                currentRow.find('#hidden_pickup_international').val(1);
              } else {
                currentRow.find('#hidden_pickup_international').val(2);
              };
            }
            if (currentRow.find('#hidden_pickup_international').val() == 1) {
              $('#pickupsearch_input_error').addClass('d-none');
            } else if (currentRow.find('#hidden_pickup_international').val() != 1) {
              $('#pickupsearch_input_error').removeClass('d-none');
              $('.international_btn_error1').addClass('disabled');
            } else {
              $('#pickupsearch_input_error').addClass('d-none');
            }
            if (currentRow.find('#hidden_pickup_international').val() == 1 && $('#hidden_delivered_international').find(":selected").val() != "0") {
              $('#country_select_error').addClass('d-none');
              $('.international_btn_error1').removeClass('disabled');
            }
          }
        }
      });
    };
  });
  currency()
  thousands_separators()
});
$(document).on('input', '.search_input1', function() {
  let currentRow = $(this).closest(".address_details");
  if (currentRow.find("#show_zone_id").val() == "1") {
    $('.domestic_btn_error0').addClass('disabled');
  } else if (currentRow.find("#show_zone_id").val() == "2") {
    $('.domestic_btn_error1').addClass('disabled');
  } else if (currentRow.find("#show_zone_id").val() == "3") {
    $('.international_btn_error1').addClass('disabled');
  }
  let autocomplete;
  autocomplete = new google.maps.places.Autocomplete((currentRow.find('#search_input')[0]), {
    // componentRestrictions: {
    //   country: 'in'
    // }
  });
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    let near_place = autocomplete.getPlace();
    currentRow.find('#latitude').val(near_place.geometry.location.lat());
    currentRow.find('#longitude').val(near_place.geometry.location.lng());
    const latitude = near_place.geometry.location.lat();
    const longitude = near_place.geometry.location.lng();
    const zone_id = currentRow.find("#show_zone_id").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/user/address/ajax',
      type: 'POST',
      dataType: 'JSON',
      data: {
        latitude,
        longitude,
        zone_id
      },
      success: function(res) {
        if (currentRow.find("#show_zone_id").val() == "1") {
          if (currentRow.find('.hidden_page').attr('data-id') == '2') {
            if (res.data == 'done') {
              currentRow.find('#hidden_delivered_currior').val(2);
            } else {
              currentRow.find('#hidden_delivered_currior').val(1);
            };
          }
          if (currentRow.find('#hidden_delivered_currior').val() == 2) {
            $('#deliversearch_input_error').addClass('d-none');
          } else if (currentRow.find('#hidden_delivered_currior').val() != 2) {
            $('#deliversearch_input_error').removeClass('d-none');
            $('.domestic_btn_error1').addClass('disabled');
          } else {
            $('#deliversearch_input_error').addClass('d-none');
          }
          if ($('#hidden_pickup_currior').val() == 1 && currentRow.find('#hidden_delivered_currior').val() == 2) {
            $('#deliversearch_input_error').addClass('d-none');
            $('.domestic_btn_error0').removeClass('disabled');
          }
        } else if (currentRow.find("#show_zone_id").val() == "2") {
          if (currentRow.find('.hidden_page').attr('data-id') == '2') {
            if (res.data == 'done') {
              currentRow.find('#hidden_delivered_Packers').val(2);
            } else {
              currentRow.find('#hidden_delivered_Packers').val(1);
            };
          }
          if (currentRow.find('#hidden_delivered_Packers').val() == 2) {
            $('#deliversearch_input_error').addClass('d-none');
          } else if (currentRow.find('#hidden_delivered_Packers').val() != 2) {
            $('#deliversearch_input_error').removeClass('d-none');
            $('.domestic_btn_error1').addClass('disabled');
          } else {
            $('#deliversearch_input_error').addClass('d-none');
          }
          if ($('#hidden_pickup_Packers').val() == 1 && currentRow.find('#hidden_delivered_Packers').val() == 2) {
            $('#deliversearch_input_error').addClass('d-none');
            $('.domestic_btn_error1').removeClass('disabled');
          }
        }
      }
    });
  });
  currency()
  thousands_separators()
});
$(document).on("change", '#hidden_delivered_international', function() {
  let currentRow = $(this).closest(".address_details");
  let country = $(this).val()
  $('.international_btn_error1').addClass('disabled');
  if ($('#hidden_pickup_international').val() == 1 && country != "0") {
    if (currentRow.find("#show_zone_id").val() == "3") {
      $('#country_select_error').addClass('d-none');
      $('.international_btn_error1').removeClass('disabled');
    }
    if (currentRow.find("#show_zone_id").val() != "3") {
      $('#country_select_error').addClass('d-none');
      $('.international_btn_error1').removeClass('disabled');
    }
  }
})

function showPreview(event) {
  if (event.target.files.length > 0) {
    let src = URL.createObjectURL(event.target.files[0]);
    let preview = document.getElementById("file-preview");
    preview.src = src;
    $('#hidden_image').val(1);
    $('#hidden_image2').val(1);
  };
};
//<<<<<<<< gen coupon code >>>>>>>
function makeid(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
$(document).on('click', '#gen_code', function() {
  $('#coupon_code').val(makeid(6));
  return false;
});

function currency() {
  let sym = $('#rates_sym').val()
  let pls = $('#rates_pla').val()
  if (pls == 1) {
    let users = document.getElementsByClassName('invosymbol');
    let user_length = users.length
    for (let i = 0; i < user_length; ++i) {
      let user = users[i];
      if (user.innerHTML.indexOf(sym) > -1) {
        user.innerHTML = user.innerHTML + ' ';
      } else {
        user.innerHTML = user.innerHTML + ' ' + sym;
      }
    }
  } else {
    let users = document.getElementsByClassName('invosymbol');
    let user_length = users.length
    for (let i = 0; i < user_length; ++i) {
      let user = users[i];
      if (user.innerHTML.indexOf(sym) > -1) {
        user.innerHTML = ' ' + user.innerHTML;
      } else {
        user.innerHTML = sym + ' ' + user.innerHTML;
      }
    }
  }
}

function thousands_separators() {
  let thousands_replace = $('#thousands_replace').val()
  let num = document.getElementsByClassName("invosymbol")
  let separator;
  if (thousands_replace == '1') {
    separator = ','
  } else if (thousands_replace == '2') {
    separator = '.'
  } else if (thousands_replace == '3') {
    separator = '`'
  } else if (thousands_replace == '4') {
    separator = ''
  } else {
    separator = ' '
  }
  let num_length = num.length
  for (let i = 0; i < num_length; ++i) {
    let val = num[i]
    let data = val.innerHTML
    let num_parts = data.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    val.innerHTML = num_parts.join(".")
  }
}

function unitssybol() {
  let weight_units = $('#weight_units').val()
  let length_units = $('#length_units').val()
  let weightunits = document.getElementsByClassName('weight_units_sybl');
  let weight_uni_length = weightunits.length
  for (let i = 0; i < weight_uni_length; ++i) {
    let w_user = weightunits[i];
    w_user.innerHTML = w_user.innerHTML + ' ' + weight_units;
  }
  let lengthunits = document.getElementsByClassName('length_units_sybl');
  let weight_len_length = lengthunits.length
  for (let i = 0; i < weight_len_length; ++i) {
    let l_user = lengthunits[i];
    l_user.innerHTML = l_user.innerHTML + ' ' + length_units;
  }
}
// ============ proceed_to_pay ============== //
$(document).on('click', '.proceed_to_pay', function() {
  let amount = $("#show_Total_Price").text()
  $("#paypal_amount").attr('value', amount)
  let coupon = $("#insurance_add_id").val()
  currency = $(this).attr('data-general')
  let payment_amount = amount.split(`${currency}`);
  let payment = payment_amount[1].split(/[\s,]+/).join("");
  $("#razorpay_amount").attr('value', payment)
  $("#paystack_amount").attr('value', payment)
  $("#stripe_amount").attr('value', payment)
  if ($('#delivery_type_price').val() == '00') {
    $('#delivery_type_error').removeClass('d-none');
  } else {
    let insurance_id, insurance_price
    if ($('.add_insurance').is(":checked")) {
      insurance_id = $('#add_insurance_id').val()
      insurance_price = $('#add_insurance_charge').val()
    } else {
      insurance_id = 0
      insurance_price = 0
    }
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/save_and_pay',
      type: 'POST',
      dataType: 'JSON',
      data: {
        insurance_id,
        insurance_price,
        payment,
        coupon
      },
      success: function(res) {
        $('#pam_payment').modal('show');
      }
    });
  };
});
// ========== razorpay ============ //
$('#rzp-button1').on('click', function(e) {
  e.preventDefault();
  const base_url = window.location.origin;
  $.ajax({
    url: base_url + "/packers_and_movers/razorpay_payment",
    type: 'POST',
    dataType: 'JSON',
    success: function(res) {
      if (res.success) {
        let raz_id = res.raz_id
        let eaz_check = "0";
        let option = {
          "key": "" + res.paypalid + "",
          "amount": "" + res.amount + "",
          "currency": "INR",
          "name": "" + res.name + "",
          "description": "" + res.sitetitle + "",
          "image": "http://shiftr.kmsteams.com/uploads/1695099552196Moving-Box.png",
          "order_id": "" + res.order + "",
          "handler": function(response) {
            if (response) {
              order_raz(eaz_check, raz_id)
            }
          },
          "prefill": {
            "name": "" + res.name + ""
          },
          "theme": {
            "color": "#2300A3"
          }
        };
        let razorpayObject = new Razorpay(option);
        razorpayObject.on('payment.failed', function(response) {
          console.log(response)
          eaz_check = 1
          order_raz(eaz_check)
        });
        razorpayObject.open();
      }
    }
  });
});

function order_raz(eaz_check, raz_id) {
  if (eaz_check == "0") {
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + "/packers_and_movers/payment_place_order/" + raz_id,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        if (res.success == "true") {
          window.location.href = "/packers_and_movers/confirm_order/" + res.order_id
        }
      }
    });
  } else {
    toastr.error("Payment Failed")
  }
}
// ========== close razorpay ============ //
// ========== Customer razorpay ============ //
$(document).ready(function() {
  $(".customer_pazorpay").submit(function(e) {
    e.preventDefault();
    let amount = $("#customer_tot_razorpay").val()
    let order_id = $("#customer_order_razorpay").val()
    let raz_id = $("#customer_pay_razorpay").val()
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/coustomer_razorpay_payment',
      type: 'POST',
      dataType: 'JSON',
      data: {
        amount
      },
      success: function(res) {
        let eaz_check = 0
        if (res.success) {
          let option = {
            "key": "" + res.paypalid + "",
            "amount": "" + res.amount + "",
            "currency": "INR",
            "name": "" + res.name + "",
            "description": "" + res.sitetitle + "",
            "image": "http://shiftr.kmsteams.com/uploads/1695099552196Moving-Box.png",
            "order_id": "" + res.order + "",
            "handler": function(response) {
              if (response) {
                customer_raz(eaz_check, order_id, raz_id)
              }
            },
            "prefill": {
              "name": "" + res.name + ""
            },
            "theme": {
              "color": "#2300A3"
            }
          };
          let razorpayObject1 = new Razorpay(option);
          razorpayObject1.on('payment.failed', function(response) {
            console.log(response)
            eaz_check = 1
            customer_raz(eaz_check, order_id, raz_id)
          });
          razorpayObject1.open();
        }
      }
    });
  })
})

function customer_raz(eaz_check, order_id, raz_id) {
  if (eaz_check == "0") {
    const base_url = window.location.origin;
    $.ajax({
      url: base_url + '/packers_and_movers/customer_payment/' + "0" + ',' + raz_id + ',' + order_id,
      type: 'GET',
      dataType: 'JSON',
      success: function(res) {
        if (res.success == "true") {
          location.reload();
        }
      }
    });
  } else {
    toastr.error("Payment Failed")
  }
}
// ========== close Customer razorpay ============ //