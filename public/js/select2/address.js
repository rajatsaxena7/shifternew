$(document).ready(function(){

    $(document).on('click', '#add_customer_btn', function(){
        let first_name = $("#first_name").val()
        let last_name = $("#last_name").val()
        let phone_no = $("#phone_no").val()
        let country_code = $(".country_code").select2().val()
        let email = $("#email").val()
        let google_address = $("#search_input").val()
        let latitude = $("#latitude").val()
        let longitude = $("#longitude").val()
        let address = $("#address").val()
        let city = $("#city").val()
        let state = $("#state").val()
        let country = $("#country").val()
        let pincode = $("#pincode").val()
        let addresh_moduleid = $("#addresh_module_id").val()

        let check_add = 0
        $(".addresh_input").each(function(){
            if ($(this).val() == "") {
                check_add += parseFloat(1)
            }
        })

        if (check_add > 0) {
            $("#customer_input_error").removeClass("d-none")
        } else if(country_code == null) {
            $("#customer_input_error").removeClass("d-none")
        } else if(latitude == "") {
            $("#customer_input_error").removeClass("d-none")
        } else if(longitude == "") {
            $("#customer_input_error").removeClass("d-none")
        } else {
            $("#customer_input_error").addClass("d-none")

            const base_url = window.location.origin;
  
            $.ajax({
              url: base_url + '/packers_and_movers/add_address',
              type: 'POST',
              dataType: 'JSON',
              data: {first_name, last_name, phone_no, country_code, email, google_address, latitude, longitude, address, city, state, country, pincode, addresh_moduleid },
              success: function (res){

                if (res.add == "true") {
                    toastr.success("Address Added successfully")
                    $(".addresh_input").each(function(){
                        $(this).val("")
                    })  
                    $("#customer_model_close").click()
                    let dataid = $('#hidden_input').val();

                    $.ajax({
                        url: base_url + '/packers_and_movers/delivery_address/' + dataid,
                        type: 'GET',
                        dataType: 'JSON',
                        success: function (res){
                            
                            if (dataid == "0") {
                                
                                if (res.addresh != "") {
                                    
                                    $("#add_select_address").html("")
          
                                    $.each(res.addresh, function (index, value){
                                        $("#add_select_address").append(
                                            '<a class="col-12 text-dark d-flex justify-content-between align-items-center select_address" type="button" data-bs-dismiss="modal" data-id="'+ value.id +'" data-phone_no="'+ value.country_code +' '+ value.phone_no +'"'+
                                                'data-name="'+ value.first_name +' '+ value.last_name +'" data-address="'+ value.address +', '+ value.city +', '+ value.state +', '+ value.country +'">'+
                                                '<div class="p-1 d-flex align-items-center">'+
                                                    '<div>'+
                                                        '<i class="icofont icofont-map-pins f-20"></i>'+
                                                    '</div>'+
                                                    '<div class="mx-3">'+
                                                        '<h5 class="mb-0">'+ value.first_name +' '+ value.last_name +'</h5>'+
                                                        '<span>'+ value.address +', '+ value.city +', '+ value.state +', '+ value.country +'</span>'+
                                                    '</div>'+
                                                '</div>'+
                                            '</a>'
                                        )
                                    });
                                    
                                }
                                
                            } 
                            
                            if(dataid != "0"){

                                if (res.addresh == "") {
                                    $('#all_address').html('<h5 class="text-danger">'+language.Address_Details_Not_Available+'</h5>')
                                } else {

                                    $('#all_address').html('<h5>Address Details</h5>');
                                    $.each(res.addresh, function (index, value){
                                      if (value.id != dataid) {
                                        $('#all_address').append(
                                          '<a class="col-12 text-dark d-flex justify-content-between align-items-center select_delivery_address" type="button" data-bs-dismiss="modal" data-id="'+ value.id +'" data-phone_no="'+ value.country_code +' '+ value.phone_no +'"'+
                                              'data-name="'+ value.first_name +' '+ value.last_name +'" data-address="'+ value.address +', '+ value.city +', '+ value.state +', '+ value.country +'">'+
                                              '<div class="p-1 d-flex align-items-center">'+
                                                  '<div>'+
                                                      '<i class="icofont icofont-map-pins f-20"></i>'+
                                                  '</div>'+
                                                  '<div class="mx-3">'+
                                                      '<h5 class="mb-0">'+ value.first_name +' '+ value.last_name +'</h5>'+
                                                      '<span>'+ value.address +', '+ value.city +', '+ value.state +', '+ value.country +'</span>'+
                                                  '</div>'+
                                              '</div>'+
                                          '</a>'
                                        );
                                      };
                                    });

                                }
                                
                            }

                        }
                    });

                }

              }
            });
        }
    })

})
