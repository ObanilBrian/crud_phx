onmount('div[id="hb_batch"]', function(){
  let currentDate = new Date()
  let date_received_selector = $('input[name="batch[date_received]"]')
  $('.facility-card').css('display', 'none')

  if(date_received_selector.val() == ""){
   date_received_selector.val(currentDate)
  }

  $('#date_received').calendar({
    type: 'date',
    maxDate: new Date(currentDate),
    endCalendar: $('#rangeend'),
	  formatter: {
        date: function (date, settings) {
            if (!date) return '';
            var day = date.getDate() + '';
            if (day.length < 2) {
                day = '0' + day;
            }
            var month = (date.getMonth() + 1) + '';
            if (month.length < 2) {
                month = '0' + month;
            }
            var year = date.getFullYear();
            return year + '-' + month + '-' + day;
        }
    }
  })
  //let date_due = moment(currentDate).add(1, 'year').calendar();

  $('div[id="date_due"]').calendar({
    type: 'date',
    minDate: new Date(currentDate),
	  formatter: {
        date: function (due_date, settings) {
            if (!due_date) return '';
            var day = due_date.getDate() + '';
            if (day.length < 2) {
                day = '0' + day;
            }
            var month = (due_date.getMonth()) + '';
            if (month.length < 2) {
                month = '0' + month;
            }
            var year = due_date.getFullYear();
            return year + '-' + month + '-' + day;
        }
    }
  })

  const csrf = $('input[name="_csrf_token"]').val();
  let facility_id = $('#batch_facility_id').val()

  const facility_address = (facility_id, csrf) => {
    if (facility_id != "") {
      $.ajax({
        url:`/batch_processing/${facility_id}/get_facility_address`,
        headers: {"X-CSRF-TOKEN": csrf},
        type: 'get',
        success: function(response){
          let facility = JSON.parse(response)
          $('.facility-card-empty').css('display', 'none')
          $('.facility-card').css('display', 'block')
          $('span[facility="name"]').html(facility.name)
          $('span[facility="code"]').html(facility.code)
          $('span[facility="line_1"]').html(facility.line_1)
          $('span[facility="line_2"]').html(facility.line_2)
          $('span[facility="city"]').html(facility.city)

          let date_today = new Date()
          date_today.setDate(date_today.getDate() + parseInt(facility.prescription_term))

          if (!date_today) return '';
          var day = date_today.getDate() + '';
          if (date_today.length < 2) {
              date_today = '0' + day;
          }
          var month = (date_today.getMonth()) + 1 + '';
          if (month.length < 2) {
              month = '0' + month;
          }
          var year = date_today.getFullYear();
          let date_due = year + '-' + month + '-' + day;

          $('#batch_date_due').val(date_due)
          $('#due_date').removeClass('disabled')

          $('#date_due').calendar({
            type: 'date',
            minDate: new Date(currentDate),
            maxDate: new Date(date_today),
            formatter: {
                date: function (date, settings) {
                    if (!date) return '';
                    var day = date.getDate() + '';
                    if (day.length < 2) {
                        day = '0' + day;
                    }
                    var month = (date.getMonth()) + 1 + '';
                    if (month.length < 2) {
                        month = '0' + month;
                    }
                    var year = date.getFullYear();
                    return year + '-' + month + '-' + day;
                }
            }
          }, "set date", new Date(date_today))
        }
      })
    }
  }

  facility_address(facility_id, csrf)

  let facilities = JSON.parse($('input[id="facilities"]').val());

  $('.ui.search').search({
    source: facilities,
    showNoResults: true,
    maxResults: 10,
    error: {
      noResults   : 'Not affiliated facility.'
    },
    onSelect: function(result, response) {
      $('#batch_facility_id').val(result.id)
      facility_address(result.id, csrf)
      $('div[id="search_facility"]').removeClass("error")
      $('div[class="ui basic red pointing prompt label transition visible"]').remove()
    },
    minCharacters: 0
  });

  $('#batch_facility_id').on('change', function(){
    let facility_id = $(this).val()
    facility_address(facility_id, csrf)
  })

  $('button[id="comment"]').on('click', function(){

      $('#comment_field').removeClass('error')
    let batch_id = $('#batchID').attr('batchid')
    let comment = $('#hb_comment').val()
    if (comment == '') {
      $('.ui.basic.red.pointing.prompt.label.transition.visible').each(function(){
        $(this).remove();
      });

      $('#comment_field').addClass('error').append(`<div class="ui basic red pointing prompt label transition visible">Please enter comment</div>`)
    }
    else{
      requestCommentDetails(batch_id, comment)
    }
  })

  function requestCommentDetails(batch_id, comment){
    let params = {comment: comment}
    $.ajax({
      url:`/batch_processing/${batch_id}/add_comment`,
      headers: {"X-CSRF-TOKEN": csrf},
      data: {batch_params: params},
      type: 'POST',
      success: function(response){
        let response_obj = JSON.parse(response)
        if (comment != ""){
          let to_moment = convertToMoment(response_obj.inserted_at)
          $('div[id="maincomment"]').prepend(`<div class="comment-views mb-1"><div><p class="mb-0 blacken">${response_obj.comment}</p><p class="blacken"><i class="user icon mr-1"></i>${response_obj.created_by}</p></div><div class="small blacken commentDateTime">${to_moment}</div></div><hr/>`)
          $('textarea[name="batch[hb_comment]"]').val("")
          $('#hb_comment').val('')
          $('.ui.basic.red.pointing.prompt.label.transition.visible').each(function(){
            $(this).remove();
          });
        }

      }
    })
  }

  $('.alphanumeric').on('keypress', function(evt){
    let theEvent = evt || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode( key );
    let regex = /[``~<>^'{}[\]\\;'|:"/?!#@$%&*()+=]|\,/;

    if( regex.test(key) ) {
      theEvent.returnValue = false;
      if(theEvent.preventDefault) theEvent.preventDefault();
    }
  })

  const number_input = () => {
    $('input[type="number"]').on('keypress', function(evt){
      let theEvent = evt || window.event;
      let key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode( key );
      let regex = /[a-zA-Z``~<>^'{}[\]\\;':",./?!@#$%&*()_+=-]|\./;
      let min = $(this).attr("minlength")

      if( regex.test(key) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault();
      }else{
        if($(this).val().length >= $(this).attr("maxlength")){
          $(this).next('p[role="validate"]').hide();
          $(this).on('keyup', function(evt){
            if(evt.keyCode == 8){
              $(this).next('p[role="validate"]').show();
            }
          })
          return false;
        }else if( min > $(this).val().length){
          $(this).next('p[role="validate"]').show();
          $(this).on('focusout', function(evt){
            $(this).val($(this).val().charAt(0).toUpperCase() + $(this).val().slice(1))
          })
        }
        else{
          $(this).next('p[role="validate"]').hide();
          $(this).on('focusout', function(evt){
            $(this).val($(this).val().charAt(0).toUpperCase() + $(this).val().slice(1))
          })
        }
      }
    })
  }

  number_input()

  // Validations
  $('button[id="submit-batch"]').on('click', function(){
    $('#hb-batch').form({
      on: blur,
      inline: true,
      fields: {
        'batch[description]': {
          identifier: 'batch[description]',
          rules: [{
            type  : 'empty',
            prompt: 'Please enter facility'
          },
          {
            type  : 'checkFacility[param]',
            prompt: 'Not affiliated facility'
          }
          ]
        },
        'batch[coverage]': {
          identifier: 'batch[coverage]',
          rules: [{
            type  : 'empty',
            prompt: 'Please select coverage'
          },
          ]
        },
        'batch[soa_ref_no]': {
          identifier: 'batch[soa_ref_no]',
          rules: [{
            type  : 'empty',
            prompt: 'Please enter soa ref. no'
          },
          ]
        },
        'batch[soa_amount]': {
          identifier: 'batch[soa_amount]',
          rules: [{
            type  : 'empty',
            prompt: 'Please enter soa amount'
          }]
        },
        'batch[estimate_no_of_claims]': {
          identifier: 'batch[estimate_no_of_claims]',
          rules: [{
            type  : 'empty',
            prompt: 'Please enter estimate no of claims'
          }]
        },
        'batch[date_received]': {
          identifier: 'batch[date_received]',
          rules: [{
            type  : 'empty',
            prompt: 'Please enter date received'
          },
          ]
        },
        'batch[date_due]': {
          identifier: 'batch[date_due]',
          rules: [{
            type  : 'empty',
            prompt: 'Please enter date due'
          },
          {
            type : 'checkDateDue[params]',
            prompt: 'Invalid date, date due must be greater than or equal to 1 month after date received.'
          }
          ]
        },
        'batch[mode_of_receiving]': {
          identifier: 'batch[mode_of_receiving]',
          rules: [{
            type  : 'empty',
            prompt: 'Please select mode of receiving'
          },
          ]
        }
      }
    })

  })

  $.fn.form.settings.rules.checkFacility= function(param) {
    let obj = facilities.find(o => o.title === param);

    if(obj == undefined) {
      return false
    }else{
      facility_address(obj.id, csrf)
      return true
    }
  }

  $.fn.form.settings.rules.checkDateDue = function(param) {
    let date_received = $('input[name="batch[date_received]"]').val()
    date_received = new Date(date_received)
    date_due = new Date(param)

    let dr_year = date_received.getFullYear()
    let dd_year = date_due.getFullYear()
    let dr_month = date_received.getMonth()
    let dd_month = date_due.getMonth()
    let dr_date = date_received.getDate()
    let dd_date = date_due.getDate()
    let minus_dr_dd_month = dd_month - dr_month

    if(dr_year < dd_year){
      return true
    }else if(dr_year <= dd_year && dr_month < dd_month && minus_dr_dd_month >= 2){
      return true
    }else if(dr_year <= dd_year && dr_month < dd_month && dr_date <= dd_date){
      return true
    }else{
      return false
    }
  }

  $('.commentDateTime').each(function(index, value){
    let date = $(value).text();
    $(value).text(convertToMoment(date))
  })

  function convertToMoment(dateTime){
    return moment(dateTime).format('MMMM Do YYYY, h:mm:ss a')
  }

})

onmount('div[id="created-hb-batch-alert"]', function(){
  let batch_no = $('input[name="swal-batch-no"]').val()
  let facility_name = $('input[name="swal-facility-name"]').val()
  swal({
    title: 'Batch Successfully created.',
    text: `Batch No. ${batch_no}, ${facility_name}`,
    type: 'success',
    showCancelButton: true,
    confirmButtonText: '<i class="check icon"></i> Yes',
    cancelButtonText: '<i class="remove icon"></i> No',
    confirmButtonClass: 'ui positive button',
    cancelButtonClass: 'ui negative button',
    buttonsStyling: false,
    reverseButtons: true,
    allowOutsideClick: false

  }).then(function() {
    //$('#form-cancel').submit()
  })
  $('#swal2-content').append("</br></br><b>Do you want to create another HB batch?</b>")

  $('button[class="swal2-cancel ui negative button"]').on('click', function(){
    window.document.location = "/batch_processing";
  })
})


onmount('div[id="edit-hb-batch-alert"]', function(){
  let batch_no = $('input[name="swal-batch-no"]').val()
  let facility_name = $('input[name="swal-facility-name"]').val()
  swal({
    title: 'Batch Updated Successfully.',
    text: `Batch No. ${batch_no}, ${facility_name}`,
    type: 'success',
    showCancelButton: true,
    confirmButtonText: '<i class="check icon"></i> Yes',
    cancelButtonText: '<i class="remove icon"></i> No',
    confirmButtonClass: 'ui positive button',
    cancelButtonClass: 'ui negative button',
    buttonsStyling: false,
    reverseButtons: true,
    allowOutsideClick: false

  }).then(function() {
    //$('#form-cancel').submit()
  })
  $('#swal2-content').append("</br></br><b>Do you want to stay and edit this HB batch?</b>")

  $('button[class="swal2-cancel ui negative button"]').on('click', function(){
    window.document.location = "/batch_processing";
  })
})
